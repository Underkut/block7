const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');

const PUSH_KEY = 'block7-secret-2026';
const APP_URL = 'https://block7.my/';

admin.initializeApp();

functions.http('versePush', async (req, res) => {
  if (req.query.key !== PUSH_KEY) { res.status(403).send('forbidden'); return; }

  const TEST = req.query.test === '1';
  const db = admin.firestore();
  const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const curMin = kst.getHours() * 60 + kst.getMinutes();
  const dow = kst.getDay();
  const hhmm = String(kst.getHours()).padStart(2, '0') + ':' + String(kst.getMinutes()).padStart(2, '0');

  const report = { 서울시각: hhmm, 보낸수: 0 };
  const userRefs = await db.collection('users').listDocuments();

  for (const uref of userRefs) {
    const snap = await uref.collection('data').doc('state').get();
    if (!snap.exists) continue;

    const raw = snap.data() || {};
    let st = {};
    try { st = raw.json ? JSON.parse(raw.json) : raw; } catch (e) { continue; }

    const vp = (st.settings || {}).versePush;
    if (!vp || !vp.enabled) continue;
    if (!TEST && !(vp.days || []).includes(dow)) continue;

    // 보낼 시각인가
    let fire = false;
    if (vp.timesOn) {
      for (const t of (vp.times || [])) {
        const [a, b] = String(t).split(':').map(Number);
        if (a * 60 + b === curMin) { fire = true; break; }
      }
    }
    const iv = vp.interval || {};
    if (!fire && iv.on) {
      const [fh, fm] = String(iv.from || '09:00').split(':').map(Number);
      const [th, tm] = String(iv.to || '21:00').split(':').map(Number);
      const from = fh * 60 + fm, to = th * 60 + tm;
      const every = Math.max(10, iv.everyMin || 180);
      const inRange = (from <= to) ? (curMin >= from && curMin <= to)
                                   : (curMin >= from || curMin <= to);
      if (inRange && ((curMin - from + 1440) % 1440) % every === 0) fire = true;
    }
    if (!TEST && !fire) continue;

    const verse = pickVerse(st, vp.order);
    if (!verse) continue;

    const toks = await uref.collection('pushTokens').get();
    if (toks.empty) continue;

    const title = [verse.cat, verse.topic].filter(Boolean).join(' · ') || 'BLOCK7';
    const body = `${(verse.krText || '').trim()}\n${verse.ref || ''}`.trim();
    const link = APP_URL + '?verse=' + encodeURIComponent(verse.ref || '');

    // ⚠️ 지연 배달 방지 (2026-08-03)
    //  ① Urgency: 'high' — 이게 없으면 FCM 이 'normal' 로 보내고, 애플·구글이
    //     배터리를 아끼려고 알림을 모아뒀다 한꺼번에 배달한다. 실제로 5~8분,
    //     심하면 1시간 늦게 도착하는 일이 있었다.
    //     아이폰 홈화면 앱·맥 크롬 모두 "웹 푸시"라서 apns 가 아니라
    //     webpush.headers 가 맞는 자리다.
    //  ② TTL — 다음 알림이 올 때까지만 유효하게 해서, 늦어진 알림은 배달되지 말고
    //     그냥 버려지게 한다. "1시간 전 말씀이 지금 오는" 것을 막는다.
    const everyMin = (iv.on ? Math.max(10, iv.everyMin || 180) : 30);
    const ttlSec = Math.max(300, Math.min(3600, everyMin * 60));

    try {
      const out = await admin.messaging().sendEachForMulticast({
        tokens: toks.docs.map(d => d.id),
        notification: { title, body },
        data: { type: 'verse', ref: verse.ref || '' },
        webpush: {
          headers: { Urgency: 'high', TTL: String(ttlSec) },
          fcmOptions: { link },                  // 알림을 누르면 이 주소로
          notification: { tag: 'block7-verse' }  // 같은 tag = 알림이 쌓이지 않음
        },
        android: { priority: 'high', ttl: ttlSec * 1000 }
      });
      report.보낸수 += out.successCount;
    } catch (e) {
      console.error('send fail', uref.id, e);
    }
  }

  res.set('Content-Type', 'application/json; charset=utf-8');
  res.status(200).send(JSON.stringify(report, null, 2));
});

// 앱이 저장해 둔 목록(화면에 보이는 그 말씀들)에서 고른다.
// 없으면 예전 방식으로 되돌아간다.
function pickVerse(st, order) {
  const s = st.settings || {};
  let pool = Array.isArray(s.versePushPool) ? s.versePushPool.slice() : [];

  if (!pool.length) {
    const colls = st.verseCollections || [];
    const active = s.activeColls || [];
    colls.forEach(c => {
      if (active.length && !active.includes(c.id)) return;
      (c.verses || []).forEach(v => { if (!v.del) pool.push(v); });
    });
    if (!pool.length) colls.forEach(c => (c.verses || []).forEach(v => { if (!v.del) pool.push(v); }));
  }
  if (!pool.length) return null;

  if (order === 'random') return pool[Math.floor(Math.random() * pool.length)];
  if (order === 'recent') return pool.slice().sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')))[0];
  if (order === 'added')  return pool.slice().sort((a, b) => String(a.d || '').localeCompare(String(b.d || '')))[0];

  // ⚠️ 암송 기록의 실제 키는 memorizationLog 다 (앱: ST.memorizationLog).
  //    'verseMemLog' 로 되어 있어 '암송순'이 한 번도 동작하지 않았다 —
  //    셀 게 없어 전부 0이 되고 목록 첫 구절만 계속 골랐다. (2026-08-03)
  const logKey = { like: 'verseLikeLog', mem: 'memorizationLog',
                   deeper: 'verseDeeperLog', even: 'verseEvenDeeperLog' }[order];
  if (!logKey) return pool[Math.floor(Math.random() * pool.length)];

  const cnt = {};
  Object.values(st[logKey] || {}).forEach(arr => {
    const list = Array.isArray(arr) ? arr : Object.values(arr || {}).flat();
    list.forEach(e => { if (e && e.ref) cnt[e.ref] = (cnt[e.ref] || 0) + 1; });
  });
  return pool.slice().sort((a, b) => (cnt[b.ref] || 0) - (cnt[a.ref] || 0))[0];
}