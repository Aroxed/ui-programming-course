#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots/devtools"
mkdir -p "$OUT"

export DISPLAY=:99
export ELECTRON_DISABLE_SANDBOX=1

cleanup_pids=()
cleanup() {
  for pid in "${cleanup_pids[@]:-}"; do
    kill "$pid" 2>/dev/null || true
    pkill -P "$pid" 2>/dev/null || true
  done
  pkill -f "react-devtools" 2>/dev/null || true
  pkill -f "chromium.*course-devtools" 2>/dev/null || true
  pkill -f "vite.*5173" 2>/dev/null || true
  pkill -f "expo.*417" 2>/dev/null || true
}
trap cleanup EXIT

wait_http() {
  local url="$1"
  for _ in $(seq 1 120); do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    sleep 0.5
  done
  echo "Timed out waiting for $url" >&2
  return 1
}

start_x() {
  Xvfb :99 -screen 0 1600x1000x24 -ac +extension RANDR >/tmp/xvfb.log 2>&1 &
  cleanup_pids+=("$!")
  sleep 1
  fluxbox >/tmp/fluxbox.log 2>&1 &
  cleanup_pids+=("$!")
  sleep 1
}

stop_devtools() {
  pkill -f "react-devtools" 2>/dev/null || true
  pkill -f "chromium.*course-devtools" 2>/dev/null || true
  sleep 1
}

start_react_devtools() {
  stop_devtools
  (cd "$ROOT" && npx --yes react-devtools@8.0.0 --port 8097 >/tmp/react-devtools.log 2>&1) &
  cleanup_pids+=("$!")
  for _ in $(seq 1 60); do
    if curl -fsS http://127.0.0.1:8097 >/dev/null 2>&1; then break; fi
    sleep 0.5
  done
  sleep 2
}

capture_react_window() {
  local target="$1"
  for _ in $(seq 1 50); do
    local win
    win="$(xdotool search --name 'React Developer Tools' 2>/dev/null | tail -1 || true)"
    if [[ -n "$win" ]]; then
      wmctrl -i -r "$win" -b add,maximized_vert,maximized_horz || true
      xdotool windowactivate --sync "$win" || true
      sleep 2
      import -window "$win" "$target"
      return 0
    fi
    sleep 0.5
  done
  echo "React Developer Tools window not found" >&2
  wmctrl -l || true
  cat /tmp/react-devtools.log || true
  return 1
}

launch_chromium() {
  local url="$1"
  local profile="$2"
  rm -rf "$profile"
  chromium \
    --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --user-data-dir="$profile" --class=course-devtools \
    --start-maximized --remote-debugging-port=9222 \
    "$url" >/tmp/chromium.log 2>&1 &
  cleanup_pids+=("$!")
  sleep 4
}

start_vite() {
  local dir="$1"
  (cd "$ROOT/$dir" && npm run dev -- --host 127.0.0.1 --port 5173 >/tmp/vite.log 2>&1) &
  cleanup_pids+=("$!")
  wait_http http://127.0.0.1:5173
}

stop_vite() {
  pkill -f "vite.*5173" 2>/dev/null || true
  sleep 1
}

capture_react_example() {
  local lecture="$1"
  local dir="$2"
  stop_vite
  start_react_devtools
  start_vite "$dir"
  launch_chromium "http://127.0.0.1:5173/?devtools=1" "/tmp/course-devtools-$lecture"
  sleep 5
  capture_react_window "$OUT/lecture-$lecture-react-components.png"
  stop_devtools
  stop_vite
}

capture_browser_basic() {
  stop_vite
  start_vite "examples/lecture-03-react-basics"
  stop_devtools
  chromium \
    --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --user-data-dir=/tmp/course-devtools-basic --class=course-devtools \
    --start-maximized --auto-open-devtools-for-tabs \
    http://127.0.0.1:5173/ >/tmp/chromium-basic.log 2>&1 &
  cleanup_pids+=("$!")
  sleep 6
  scrot "$OUT/lecture-01-browser-devtools.png"
  pkill -f "chromium.*course-devtools-basic" 2>/dev/null || true
  stop_vite
}

capture_network() {
  stop_vite
  stop_devtools
  (cd "$ROOT/services/task-api" && npm start >/tmp/task-api.log 2>&1) &
  cleanup_pids+=("$!")
  wait_http http://127.0.0.1:3001/tasks
  start_vite "examples/lecture-05-routing-api"
  chromium \
    --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --user-data-dir=/tmp/course-devtools-network --class=course-devtools \
    --start-maximized --auto-open-devtools-for-tabs \
    http://127.0.0.1:5173/tasks >/tmp/chromium-network.log 2>&1 &
  cleanup_pids+=("$!")
  sleep 6
  local win
  win="$(xdotool search --onlyvisible --class chromium 2>/dev/null | tail -1 || true)"
  if [[ -n "$win" ]]; then
    xdotool windowactivate --sync "$win" || true
    xdotool key ctrl+shift+p
    sleep 1
    xdotool type --delay 40 'Show Network'
    xdotool key Return
    sleep 2
    xdotool key ctrl+r
    sleep 4
  fi
  scrot "$OUT/lecture-05-browser-network.png"
  pkill -f "chromium.*course-devtools-network" 2>/dev/null || true
  stop_vite
  pkill -f "services/task-api" 2>/dev/null || true
}

capture_expo_browser() {
  local lecture="$1"
  local dir="$2"
  local port="$3"
  local with_api="${4:-0}"
  local panel="${5:-elements}"

  stop_vite
  stop_devtools
  pkill -f "expo.*$port" 2>/dev/null || true

  if [[ "$with_api" == "1" ]]; then
    (cd "$ROOT/services/task-api" && npm start >/tmp/task-api-expo.log 2>&1) &
    cleanup_pids+=("$!")
    wait_http http://127.0.0.1:3001/tasks
  fi

  (cd "$ROOT/$dir" && CI=1 npx expo start --web --port "$port" >/tmp/expo-$lecture.log 2>&1) &
  cleanup_pids+=("$!")
  if ! wait_http "http://127.0.0.1:$port"; then
    cat "/tmp/expo-$lecture.log" >&2 || true
    return 1
  fi

  chromium \
    --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --user-data-dir="/tmp/course-devtools-expo-$lecture" --class=course-devtools \
    --start-maximized --auto-open-devtools-for-tabs \
    "http://127.0.0.1:$port" >"/tmp/chromium-expo-$lecture.log" 2>&1 &
  cleanup_pids+=("$!")
  sleep 8

  local win
  win="$(xdotool search --onlyvisible --class chromium 2>/dev/null | tail -1 || true)"
  if [[ -n "$win" ]]; then
    wmctrl -i -r "$win" -b add,maximized_vert,maximized_horz || true
    xdotool windowactivate --sync "$win" || true
    if [[ "$panel" == "network" ]]; then
      xdotool key ctrl+shift+p
      sleep 1
      xdotool type --delay 40 'Show Network'
      xdotool key Return
      sleep 2
      xdotool key ctrl+r
      sleep 5
    fi
  fi

  scrot "$OUT/lecture-$lecture-expo-web-devtools.png"
  pkill -f "chromium.*course-devtools-expo-$lecture" 2>/dev/null || true
  pkill -f "expo.*$port" 2>/dev/null || true
  if [[ "$with_api" == "1" ]]; then pkill -f "services/task-api" 2>/dev/null || true; fi
}

start_x
capture_browser_basic
capture_react_example 03 examples/lecture-03-react-basics
capture_react_example 04 examples/lecture-04-state-events-forms
capture_network
capture_react_example 06 examples/lecture-06-state-management
capture_expo_browser 07 examples/lecture-07-react-native-basics 4177 0 elements
capture_expo_browser 08 examples/lecture-08-navigation-state-data 4178 1 network

identify "$OUT"/lecture-* || true
