#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots/devtools"
mkdir -p "$OUT"

export DISPLAY=:98
BROWSER="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || true)"
[[ -n "$BROWSER" ]] || { echo 'Chrome/Chromium not found' >&2; exit 1; }

pids=()
cleanup(){
  for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; pkill -P "$pid" 2>/dev/null || true; done
  pkill -f 'vite.*5173' 2>/dev/null || true
  pkill -f 'expo.*417' 2>/dev/null || true
}
trap cleanup EXIT

wait_http(){
  local url="$1"
  for _ in $(seq 1 120); do curl -fsS "$url" >/dev/null 2>&1 && return 0; sleep .5; done
  echo "Timeout: $url" >&2; return 1
}

Xvfb :98 -screen 0 1600x1000x24 -ac +extension RANDR >/tmp/xvfb98.log 2>&1 & pids+=("$!")
sleep 1
fluxbox >/tmp/fluxbox98.log 2>&1 & pids+=("$!")
sleep 1

find_browser_window(){
  for _ in $(seq 1 60); do
    local w
    w="$(xdotool search --onlyvisible --class 'chromium|google-chrome' 2>/dev/null | tail -1 || true)"
    [[ -n "$w" ]] && { echo "$w"; return 0; }
    sleep .25
  done
  return 1
}

capture_browser(){
  local url="$1" target="$2" panel="${3:-elements}" profile="$4"
  rm -rf "$profile"
  "$BROWSER" --no-sandbox --test-type --disable-dev-shm-usage --disable-gpu \
    --no-first-run --no-default-browser-check --disable-search-engine-choice-screen \
    --disable-translate --disable-features=Translate,TranslateUI \
    --user-data-dir="$profile" --start-maximized --auto-open-devtools-for-tabs \
    "$url" >/tmp/refine-browser.log 2>&1 &
  local pid=$!; pids+=("$pid")
  sleep 5
  local win="$(find_browser_window)"
  wmctrl -i -r "$win" -b add,maximized_vert,maximized_horz || true
  xdotool windowactivate --sync "$win" || true
  xdotool key Escape || true
  sleep 2

  if [[ "$panel" == network ]]; then
    eval "$(xdotool getwindowgeometry --shell "$win")"
    # Focus inside DevTools, then use its own command menu instead of clicking a
    # fragile tab coordinate (which can hit browser chrome/translation UI).
    xdotool mousemove --window "$win" $((WIDTH-120)) 420 click 1
    sleep .5
    xdotool key ctrl+shift+p
    sleep .8
    xdotool type --delay 35 'Show Network'
    xdotool key Return
    sleep 2
    xdotool key ctrl+r
    sleep 5
  fi

  import -window "$win" "$target"
  kill "$pid" 2>/dev/null || true
  pkill -P "$pid" 2>/dev/null || true
  sleep 2
}

start_vite(){
  local dir="$1"
  (cd "$ROOT/$dir" && npm run dev -- --host 127.0.0.1 --port 5173 >/tmp/refine-vite.log 2>&1) &
  pids+=("$!")
  wait_http http://127.0.0.1:5173
}
stop_vite(){ pkill -f 'vite.*5173' 2>/dev/null || true; sleep 1; }

start_vite examples/lecture-03-react-basics
capture_browser http://127.0.0.1:5173/ "$OUT/lecture-01-browser-devtools.png" elements /tmp/refine-l01
stop_vite

(cd "$ROOT/services/task-api" && npm start >/tmp/refine-api.log 2>&1) & api_pid=$!; pids+=("$api_pid")
wait_http http://127.0.0.1:3001/tasks
start_vite examples/lecture-05-routing-api
capture_browser http://127.0.0.1:5173/tasks "$OUT/lecture-05-browser-network.png" network /tmp/refine-l05
stop_vite
kill "$api_pid" 2>/dev/null || true; pkill -P "$api_pid" 2>/dev/null || true

capture_expo(){
  local lecture="$1" dir="$2" port="$3" panel="$4" with_api="${5:-0}"
  local api=""
  if [[ "$with_api" == 1 ]]; then
    (cd "$ROOT/services/task-api" && npm start >/tmp/refine-api-$lecture.log 2>&1) & api=$!; pids+=("$api")
    wait_http http://127.0.0.1:3001/tasks
  fi
  (cd "$ROOT/$dir" && CI=1 npx expo start --web --port "$port" >/tmp/refine-expo-$lecture.log 2>&1) &
  local expo=$!; pids+=("$expo")
  wait_http "http://127.0.0.1:$port"
  capture_browser "http://127.0.0.1:$port" "$OUT/lecture-$lecture-expo-web-devtools.png" "$panel" "/tmp/refine-l$lecture"
  kill "$expo" 2>/dev/null || true; pkill -P "$expo" 2>/dev/null || true
  [[ -n "$api" ]] && { kill "$api" 2>/dev/null || true; pkill -P "$api" 2>/dev/null || true; }
  sleep 2
}

capture_expo 07 examples/lecture-07-react-native-basics 4177 elements 0
capture_expo 08 examples/lecture-08-navigation-state-data 4178 network 1

identify "$OUT"/lecture-01-browser-devtools.png \
         "$OUT"/lecture-05-browser-network.png \
         "$OUT"/lecture-07-expo-web-devtools.png \
         "$OUT"/lecture-08-expo-web-devtools.png
