const { app, BrowserWindow, Menu, dialog, ipcMain, Notification } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { mkdtempSync, rmSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { normalizeTasks, normalizeBoard, readBoard, writeJson } = require('./storage');

const screenshot = process.argv.includes('--screenshot');
const selfTest = process.argv.includes('--self-test');
// Capture and self-test use an isolated virtual display in CI.
// Keep normal desktop launches unchanged.
if (screenshot || selfTest) app.disableHardwareAcceleration();
const temporaryProfile = screenshot || selfTest
  ? mkdtempSync(path.join(os.tmpdir(), 'lecture11-'))
  : null;
if (temporaryProfile) {
  app.setPath('userData', temporaryProfile);
  app.on('quit', () => rmSync(temporaryProfile, { recursive: true, force: true }));
}

const pagePath = path.join(__dirname, 'dist', 'index.html');
let win;
let boardPath;

function register(channel, operation) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (event.sender !== win?.webContents ||
        event.senderFrame !== win.webContents.mainFrame ||
        event.senderFrame.url !== pathToFileURL(pagePath).href) {
      return { ok: false, error: 'Недозволений запит.' };
    }
    try {
      return { ok: true, data: await operation(...args) };
    } catch (error) {
      console.error(channel, error);
      return { ok: false, error: 'Не вдалося виконати операцію. Перевірте дані та доступ до файла.' };
    }
  });
}

async function saveBoard(board) {
  const normalized = normalizeBoard(board);
  await writeJson(boardPath, normalized);
  return normalized;
}

async function importTasks() {
  const result = await dialog.showOpenDialog(win, {
    title: 'Імпортувати завдання',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result.canceled) return null;
  const text = await fs.readFile(result.filePaths[0], 'utf8');
  const tasks = normalizeTasks(JSON.parse(text));
  const confirmation = await dialog.showMessageBox(win, {
    type: 'question',
    message: 'Замінити поточний список імпортованими завданнями?',
    buttons: ['Скасувати', 'Замінити'],
    defaultId: 0,
    cancelId: 0,
  });
  return confirmation.response === 1 ? tasks : null;
}

async function exportTasks(tasks) {
  const normalized = normalizeTasks(tasks);
  const result = await dialog.showSaveDialog(win, {
    title: 'Експортувати завдання',
    defaultPath: 'tasks.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return null;
  // The internal data file belongs to saveBoard, not the export operation.
  if (path.resolve(result.filePath) === path.resolve(boardPath)) {
    throw new Error('Виберіть інший файл для експорту.');
  }
  await writeJson(result.filePath, normalized);
  return result.filePath;
}

function showNotification() {
  if (!Notification.isSupported()) return false;
  new Notification({
    title: 'Планувальник завдань',
    body: 'Перевірте список активних завдань.',
  }).show();
  return true;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1020,
    height: 780,
    minWidth: 760,
    minHeight: 560,
    title: 'Планувальник завдань',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());
  win.loadFile(pagePath);
}

function createApplicationMenu() {
  return Menu.buildFromTemplate([
    { label: 'Файл', submenu: [{ role: 'quit', label: 'Вийти' }] },
    { label: 'Редагування', submenu: [
      { role: 'undo', label: 'Скасувати дію' },
      { role: 'cut', label: 'Вирізати' },
      { role: 'copy', label: 'Копіювати' },
      { role: 'paste', label: 'Вставити' },
    ] },
    { label: 'Вигляд', submenu: [
      { role: 'reload', label: 'Перезавантажити' },
      { role: 'toggleDevTools', label: 'Засоби розробника' },
    ] },
  ]);
}

function waitForBoard() {
  return win.webContents.executeJavaScript(
    'new Promise((resolve, reject) => { let n = 0; const t = setInterval(() => {' +
    'if (document.querySelector("#task-title")) {clearInterval(t); resolve(true);}' +
    'else if (++n > 100) {clearInterval(t); reject(new Error("Board did not load"));}' +
    '}, 100); })'
  );
}

async function verifyDesktop() {
  await waitForBoard();
  const result = await win.webContents.executeJavaScript('window.desktopAPI.loadBoard()');
  if (!result.ok || result.data.tasks.length !== 3) throw new Error('Initial board');
  const changed = { ...result.data, settings: { compactMode: true }, tasks: result.data.tasks.slice(1) };
  const saved = await win.webContents.executeJavaScript('window.desktopAPI.saveBoard(' + JSON.stringify(changed) + ')');
  const invalid = await win.webContents.executeJavaScript('window.desktopAPI.saveBoard({tasks: [], settings: {compactMode: "yes"}})');
  const loaded = await readBoard(boardPath);
  if (!saved.ok || invalid.ok || JSON.stringify(loaded) !== JSON.stringify(changed)) {
    throw new Error('Persistence or validation failed');
  }
  const isolated = await win.webContents.executeJavaScript('typeof window.require === "undefined" && typeof window.process === "undefined"');
  if (!isolated) throw new Error('Node integration is enabled');
  console.log('Electron IPC, persistence, validation and isolation: OK');
}

app.whenReady().then(() => {
  boardPath = path.join(app.getPath('userData'), 'board.json');
  register('board:load', () => readBoard(boardPath));
  register('board:save', saveBoard);
  register('tasks:import', importTasks);
  register('tasks:export', exportTasks);
  register('notification:show', showNotification);
  Menu.setApplicationMenu(createApplicationMenu());
  createWindow();

  if (screenshot || selfTest) {
    win.webContents.once('did-finish-load', async () => {
      try {
        await waitForBoard();
        if (selfTest) await verifyDesktop();
        if (screenshot) {
          // The renderer can be ready before the first compositor frame.
          await win.webContents.executeJavaScript(
            'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))'
          );
          let image;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              image = await win.webContents.capturePage();
              if (!image.isEmpty()) break;
            } catch (error) {
              if (attempt === 2) throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          if (!image || image.isEmpty()) throw new Error('No rendered frame captured.');
          const target = path.resolve(__dirname, '../../../screenshots/lecture-11/electron-task-desktop.png');
          await fs.mkdir(path.dirname(target), { recursive: true });
          await fs.writeFile(target, image.toPNG());
          console.log('Screenshot written to ' + target);
        }
        app.quit();
      } catch (error) {
        console.error(error);
        app.exit(1);
      }
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
