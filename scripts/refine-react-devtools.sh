#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots/devtools"
mkdir -p "$OUT"

export DISPLAY=:97
export ELECTRON_DISABLE_SANDBOX=1
BROWSER="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || true)"
[[ -n "$BROWSER" ]] || { echo 'Chrome/Chromium not found' >&2; exit 1; }

pids=()
cleanup(){
  for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; pkill -P "$pid" 2>/dev/null || true; done
  pkill -f 'react-devtools' 2>/dev/null || true
  pkill -f 'vite.*5173' 2>/dev/null || true
}
trap cleanup EXIT

wait_http(){
  local url="$1"
  for _ in $(seq 1 100); do curl -fsS "$url" >/dev/null 2>&1 && return 0; sleep .4; done
  echo "Timeout: $url" >&2; return 1
}

Xvfb :97 -screen 0 1600x1000x24 -ac +extension RANDR >/tmp/xvfb97.log 2>&1 & pids+=("$!")
sleep 1
fluxbox >/tmp/fluxbox97.log 2>&1 & pids+=("$!")
sleep 1

stop_all(){
  pkill -f 'react-devtools' 2>/dev/null || true
  pkill -f 'vite.*5173' 2>/dev/null || true
  pkill -f 'refine-react-browser' 2>/dev/null || true
  sleep 1
}

capture(){
  local lecture="$1" dir="$2" click_x="$3" click_y="$4"
  stop_all
  (cd "$ROOT" && npx react-devtools --port 8097 >/tmp/refine-react-devtools-$lecture.log 2>&1) & pids+=("$!")
  wait_http http://127.0.0.1:8097
  (cd "$ROOT/$dir" && npm run dev -- --host 127.0.0.1 --port 5173 >/tmp/refine-react-vite-$lecture.log 2>&1) & pids+=("$!")
  wait_http http://127.0.0.1:5173
  rm -rf "/tmp/refine-react-l$lecture"
  "$BROWSER" --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --no-first-run --no-default-browser-check --disable-search-engine-choice-screen \
    --disable-translate --disable-features=Translate,TranslateUI \
    --class=refine-react-browser --user-data-dir="/tmp/refine-react-l$lecture" \
    "http://127.0.0.1:5173/?devtools=1" >/tmp/refine-react-browser-$lecture.log 2>&1 & pids+=("$!")
  sleep 9

  local win=""
  for _ in $(seq 1 60); do
    win="$(xdotool search --name 'React Developer Tools' 2>/dev/null | tail -1 || true)"
    [[ -n "$win" ]] && break
    sleep .25
  done
  [[ -n "$win" ]] || { echo "React DevTools window not found for lecture $lecture" >&2; return 1; }
  wmctrl -i -r "$win" -b add,maximized_vert,maximized_horz || true
  xdotool windowactivate --sync "$win" || true
  sleep 2
  xdotool mousemove --window "$win" "$click_x" "$click_y" click 1
  sleep 3
  import -window "$win" "$OUT/lecture-$lecture-react-components.png"
}

# Select a real node so the right-hand inspector shows props/Hooks instead of an empty panel.
capture 03 examples/lecture-03-react-basics 85 150
capture 04 examples/lecture-04-state-events-forms 30 97
capture 06 examples/lecture-06-state-management 70 168

identify "$OUT"/lecture-03-react-components.png "$OUT"/lecture-04-react-components.png "$OUT"/lecture-06-react-components.png
