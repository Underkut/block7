#!/bin/bash
# 심방 녹음 Mac 도우미 설치 — Mac 터미널에 이 한 줄:
#   curl -fsSL https://block7.my/plaudhub/install.sh | bash
# 지우기:
#   curl -fsSL https://block7.my/plaudhub/install.sh | bash -s uninstall
#
# 하는 일 (무엇을 하는지 화면에 먼저 보여 주고, 묻고 나서만 한다):
#   1. Homebrew 가 있는지 본다 — 없으면 까는 한 줄을 보여 주고 멈춘다(공식 설치기가 Mac 관리자 암호를 묻기 때문)
#   2. Node(20 이상)가 없으면 물어보고 brew install node
#   3. 도우미 파일 하나(helper.mjs)를 ~/Library/Application Support/plaudhub 에 둔다
#   4. Mac 을 켜면 저절로 돌게 ~/Library/LaunchAgents 에 표 한 장(my.block7.plaudhub.plist)을 두고 켠다
#   5. 크롬으로 계기판을 연다 → 메뉴 › '이 Mac 연결'
# sudo 는 쓰지 않는다. 두 번째 Mac 에서도 같은 줄이 그대로 된다. 다시 붙여 넣으면 새 도우미로 바꾼다.
set -u
SITE="${PLAUDHUB_SITE:-https://block7.my/plaudhub/}"
DIR="$HOME/Library/Application Support/plaudhub"
LABEL="my.block7.plaudhub"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
UID_N="$(id -u)"

say() { printf '%s\n' "$*"; }
ask() {
  printf '%s [y/N] ' "$1"
  local a=''
  read -r a </dev/tty || a=''
  case "$a" in y|Y|yes|YES|네|예|ㅇ) return 0 ;; esac
  return 1
}

if [ "$(uname)" != "Darwin" ]; then say "이 설치는 Mac 전용입니다."; exit 1; fi
if [ "$UID_N" = "0" ]; then say "sudo 없이 실행해 주세요 (내 계정으로)."; exit 1; fi

if [ "${1:-}" = "uninstall" ]; then
  say ""
  say "심방 녹음 도우미를 지웁니다:"
  say "  · 자동 시작 표   $PLIST"
  say "  · 도우미 폴더    $DIR  (도우미 · 로그인 열쇠 · 전사 모델 · 기록)"
  say "  Homebrew · Node · ffmpeg · whisper.cpp · PLAUD CLI 는 그대로 둡니다."
  ask "지울까요?" || { say "그만뒀습니다."; exit 0; }
  launchctl bootout "gui/$UID_N/$LABEL" 2>/dev/null
  rm -f "$PLIST"
  rm -rf "$DIR"
  say "지웠습니다. 계기판에서 이 Mac 카드는 '꺼짐' 으로 남습니다."
  exit 0
fi

say ""
say "심방 녹음 Mac 도우미를 설치합니다. 하는 일:"
say "  1. Homebrew 확인 (없으면 까는 방법을 보여 주고 멈춤)"
say "  2. Node 가 없으면 물어보고 brew 로 깜"
say "  3. 도우미 파일 하나를 $DIR 에 둠"
say "  4. Mac 을 켜면 저절로 돌게 $PLIST 한 장을 두고 켬"
say "  5. 크롬으로 계기판(block7.my/plaudhub)을 엶"
say "  sudo 는 쓰지 않습니다."
ask "시작할까요?" || { say "그만뒀습니다."; exit 0; }

# 1. Homebrew
BREW=""
for b in /opt/homebrew/bin/brew /usr/local/bin/brew; do [ -x "$b" ] && BREW="$b" && break; done
if [ -z "$BREW" ]; then
  say ""
  say "Homebrew 가 없습니다. 아래 한 줄을 터미널에 붙여 넣어 먼저 깔아 주세요."
  say "(Homebrew 공식 설치기입니다. Mac 관리자 암호를 한 번 묻습니다.)"
  say ""
  say '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  say ""
  say "다 깔린 뒤 이 설치 한 줄을 다시 붙여 넣으면 이어서 합니다."
  exit 1
fi
eval "$("$BREW" shellenv)"
say "✓ Homebrew"

# 2. Node 20 이상
node_major() { "$1" -e 'process.stdout.write(process.versions.node.split(".")[0])' 2>/dev/null || echo 0; }
NODE="$(command -v node || true)"
if [ -z "$NODE" ] || [ "$(node_major "$NODE")" -lt 20 ]; then
  say "Node(20 이상)가 없습니다. brew install node 로 깝니다 (약 100MB)."
  ask "깔까요?" || { say "Node 없이는 도우미가 돌지 못합니다. 그만뒀습니다."; exit 1; }
  "$BREW" install node || { say "Node 를 깔지 못했습니다."; exit 1; }
  NODE="$(command -v node || true)"
fi
[ -n "$NODE" ] || { say "Node 를 찾지 못했습니다."; exit 1; }
say "✓ Node $("$NODE" -v)"

# 3. 도우미 파일
mkdir -p "$DIR" && chmod 700 "$DIR"
if ! curl -fsSL "${SITE}helper.mjs" -o "$DIR/helper.mjs.new" || ! grep -q "export const HELPER_VERSION = 'h\." "$DIR/helper.mjs.new"; then
  rm -f "$DIR/helper.mjs.new"; say "도우미 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요."; exit 1
fi
mv "$DIR/helper.mjs.new" "$DIR/helper.mjs"
rm -f "$DIR/core.js"   # 판단 덩어리는 도우미가 계기판에서 새로 떼어 온다
say "✓ 도우미 $(grep -o "HELPER_VERSION = 'h\.[^']*'" "$DIR/helper.mjs" | sed "s/.*'\(.*\)'/\1/")"

# 4. 자동 시작 표
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>$NODE</string><string>$DIR/helper.mjs</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>StandardOutPath</key><string>$DIR/helper.log</string>
  <key>StandardErrorPath</key><string>$DIR/helper.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PLAUD_TELEMETRY_DISABLED</key><string>1</string>
    <key>PLAUD_NO_UPDATE_NOTIFIER</key><string>1</string>
  </dict>
</dict>
</plist>
EOF
launchctl bootout "gui/$UID_N/$LABEL" 2>/dev/null
launchctl bootstrap "gui/$UID_N" "$PLIST" || { say "자동 시작을 켜지 못했습니다."; exit 1; }
say "✓ 자동 시작 (Mac 을 켜면 저절로 돕니다)"

# 5. 계기판
say ""
say "다 됐습니다. 크롬으로 계기판을 엽니다 → 메뉴(왼쪽 위 ≡) › '이 Mac 연결' 을 눌러 이 Mac 이름(집 · 사무실)을 고르세요."
say "크롬이 '다른 앱 · 기기 접근' 을 물으면 허용을 눌러 주세요."
open -a "Google Chrome" "$SITE" 2>/dev/null || open "$SITE"
