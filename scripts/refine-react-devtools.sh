#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots/devtools"
mkdir -p "$OUT"

export DISPLAY=:97
export ELECTRON_DISABLE_SANDBOX=1
BROWSER="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || true)"
[[ -n "$BROWSER" ]] || { echo 'Chrome/Chromium not found' >&2; exit 1; }

x_pid=""
wm_pid=""
active_groups=()

stop_group(){
  local pid="${1:-}"
  [[ -n "$pid" ]] || return 0
  kill -TERM -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  sleep .5
  kill -KILL -- "-$pid" 2>/dev/null || true
}

cleanup(){
  for pid in "${active_groups[@]:-}"; do stop_group "$pid"; done
  [[ -n "$wm_pid" ]] && kill "$wm_pid" 2>/dev/null || true
  [[ -n "$x_pid" ]] && kill "$x_pid" 2>/dev/null || true
}
trap cleanup EXIT

wait_http(){
  local url="$1"
  for _ in $(seq 1 120); do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    sleep .4
  done
  echo "Timeout: $url" >&2
  return 1
}

Xvfb :97 -screen 0 1600x1000x24 -ac +extension RANDR >/tmp/xvfb97.log 2>&1 &
x_pid=$!
sleep 1
fluxbox >/tmp/fluxbox97.log 2>&1 &
wm_pid=$!
sleep 1

capture(){
  local lecture="$1" dir="$2" click_x="$3" click_y="$4"
  local devtools_pid vite_pid browser_pid

  setsid bash -lc "cd '$ROOT' && exec npx react-devtools --port 8097" \
    >/tmp/refine-react-devtools-$lecture.log 2>&1 &
  devtools_pid=$!
  active_groups+=("$devtools_pid")
  wait_http http://127.0.0.1:8097

  setsid bash -lc "cd '$ROOT/$dir' && exec npm run dev -- --host 127.0.0.1 --port 5173" \
    >/tmp/refine-react-vite-$lecture.log 2>&1 &
  vite_pid=$!
  active_groups+=("$vite_pid")
  wait_http http://127.0.0.1:5173

  rm -rf "/tmp/refine-react-l$lecture"
  setsid "$BROWSER" --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --no-first-run --no-default-browser-check --disable-search-engine-choice-screen \
    --disable-translate --disable-features=Translate,TranslateUI \
    --class=refine-react-browser --user-data-dir="/tmp/refine-react-l$lecture" \
    "http://127.0.0.1:5173/?devtools=1" \
    >/tmp/refine-react-browser-$lecture.log 2>&1 &
  browser_pid=$!
  active_groups+=("$browser_pid")

  # The standalone DevTools script must load before React; the lecture HTML does
  # that only when ?devtools=1 is present. Give React time to connect and render.
  sleep 10

  local win=""
  for _ in $(seq 1 80); do
    win="$(xdotool search --name 'React Developer Tools' 2>/dev/null | tail -1 || true)"
    [[ -n "$win" ]] && break
    sleep .25
  done
  if [[ -z "$win" ]]; then
    echo "React DevTools window not found for lecture $lecture" >&2
    cat /tmp/refine-react-devtools-$lecture.log >&2 || true
    return 1
  fi

  wmctrl -i -r "$win" -b add,maximized_vert,maximized_horz || true
  xdotool windowactivate --sync "$win" || true
  sleep 2

  # Select an actual component so the inspector panel contains props/Hooks.
  xdotool mousemove --window "$win" "$click_x" "$click_y" click 1
  sleep 3
  import -window "$win" "$OUT/lecture-$lecture-react-components.png"

  stop_group "$browser_pid"
  stop_group "$vite_pid"
  stop_group "$devtools_pid"
  sleep 1
}

# Coordinates target real nodes in the current standalone React DevTools tree.
capture 03 examples/lecture-03-react-basics 85 150
capture 04 examples/lecture-04-state-events-forms 85 130
capture 06 examples/lecture-06-state-management 85 168

identify "$OUT"/lecture-03-react-components.png \
         "$OUT"/lecture-04-react-components.png \
         "$OUT"/lecture-06-react-components.png
