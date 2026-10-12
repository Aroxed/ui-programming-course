# Lecture 11 — Electron desktop interface

This example is a small **real Electron desktop application**, not a browser mock-up. It demonstrates the architectural boundary that Lecture 11 focuses on:

**renderer UI → preload bridge → IPC → main process → operating-system capability**.

The app lets the user edit one task, toggle its state, save it through a native file dialog, open it again, and inspect the actual Electron/Chromium/Node runtime versions.

## Project structure

```text
app/
├── main.js                 # Electron main process, BrowserWindow, menu, IPC, dialogs, file access
├── preload.js              # narrow contextBridge API exposed to the renderer
├── package.json
└── renderer/
    ├── index.html          # desktop UI
    ├── renderer.js         # browser-side state and events
    └── styles.css
```

The renderer deliberately has no direct Node.js access. `nodeIntegration` is disabled, `contextIsolation` and `sandbox` are enabled, and the preload script exposes only three specific operations.

## Prerequisites

- Node.js 24
- npm 10+
- a graphical desktop session

Electron binaries are installed only for this example, so the root course setup does not become heavier for students who do not run Lecture 11.

## First setup

From the repository root:

```bash
npm run setup:11
```

Equivalent direct command:

```bash
npm --prefix examples/lecture-11-electron/app install
```

## Run the desktop app

From the repository root:

```bash
npm run lecture:11
```

Or directly:

```bash
npm --prefix examples/lecture-11-electron/app start
```

**Expected result:** a native desktop window opens. The renderer can change the local task state. `Save…` and `Open…` cross the preload/IPC boundary and use Electron's native file dialogs and Node.js file access in the main process.

Stop the app by closing its window or with `Ctrl+C` in the terminal.

## What to inspect

1. In `main.js`, find the `BrowserWindow` options and explain why `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true` matter.
2. In `preload.js`, notice that the renderer gets a small explicit `desktopAPI` instead of raw `ipcRenderer`.
3. In `renderer/renderer.js`, verify that ordinary DOM code does not import `fs`, `path`, or Electron modules.
4. Trace `saveTask()` from a button click to `ipcRenderer.invoke()`, the main-process handler, the native dialog, and `fs.writeFile()`.
5. Open **View → Toggle Developer Tools** and inspect the renderer just as you would inspect a web page, while remembering that the main process is a separate runtime.

## Real screenshot

The GitHub Actions workflow launches the actual Electron app under a virtual Linux display and asks Electron itself to capture its `BrowserWindow` with `webContents.capturePage()`.

The generated screenshot is stored at:

```text
screenshots/lecture-11/electron-task-desktop.png
```

This is a capture from the real Electron runtime, not an HTML-only preview.

## Security point of the example

A tempting beginner implementation is to enable Node.js directly in the renderer and call `fs.writeFile()` from page code. The course example intentionally does **not** do that. The renderer is treated as less trusted UI code, while privileged operations live in the main process and are reachable only through a narrow preload API.

## What Lecture 11 is trying to teach

Electron is useful not because it makes a web page look like a desktop window, but because it combines a web UI with controlled access to desktop capabilities. The engineering task is to design that boundary deliberately: window lifecycle, IPC contract, file access, native dialogs, security, packaging, updates, memory footprint, and platform-specific behaviour.
