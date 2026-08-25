#!/usr/bin/env node
// 태그 그림(SVG)을 PNG 로 뽑아서 눈으로 확인하기 위한 도구.
//
// 왜 있나: 그림을 코드로만 쓰고 넘기면 "비둘기를 그렸다고 생각했는데 실제로는
// 웃는 입" 같은 사고가 그대로 배포된다. 2026-08-25 에 실제로 겪었다.
// 그리고 나면 **반드시** 이걸로 뽑아서 본다. 자세한 규칙은 docs/TAG-ART.md.
//
//   사용법:  node tools/icon-shot.js <입력.html> [출력.png]
//
// playwright 는 전역에 깔려 있다 (NODE_PATH 없이 안 잡히면 아래처럼 실행):
//   NODE_PATH=/opt/node22/lib/node_modules node tools/icon-shot.js sheet.html

const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  try {
    ({ chromium } = require(require('child_process')
      .execSync('npm root -g').toString().trim() + '/playwright'));
  } catch (e2) {
    console.error('playwright 를 찾지 못했습니다. NODE_PATH=$(npm root -g) 를 앞에 붙여 실행하세요.');
    process.exit(1);
  }
}

(async () => {
  const src = process.argv[2];
  if (!src) {
    console.error('사용법: node tools/icon-shot.js <입력.html> [출력.png]');
    process.exit(1);
  }
  const out = process.argv[3] || src.replace(/\.html$/, '.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewportSize: { width: 1000, height: 800 },
    deviceScaleFactor: 2,          // 2배로 떠야 선이 뭉개지지 않고 제대로 보인다
  });
  await page.goto('file://' + path.resolve(src));
  await page.waitForTimeout(300);  // SVG 필터(연필 결) 가 그려질 시간
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('뽑았습니다 → ' + out);
})();
