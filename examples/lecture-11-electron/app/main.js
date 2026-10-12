const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

function normalizeTask(value) {
  if (!value || typeof value !== 'object') return null;
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const completed = Boolean(value.completed);
  if (!title || title.length > 200) return null;
  return { title, completed };
}

async function saveTask(task) {
  const normalized = normalizeTask(task);
  if (!normalized) return { ok: false, reason: 'invalid-task' };

  const result = await dialog.showSaveDialog({
    title: 'Зберегти завдання',
    defaultPath: 'task.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify(normalized, null, 2), 'utf8');
  return { ok: true, filePath: result.filePath };
}

async function openTask() {
  const result = await dialog.showOpenDialog({
    title: 'Відкрити завдання',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, canceled: true };
  }

  try {
    const text = await fs.readFile(result.filePaths[0], 'utf8');
    const task = normalizeTask(JSON.parse(text));
    if (!task) return { ok: false, reason: 'invalid-file' };
    return { ok: true, task, filePath: result.filePaths[0] };
  } catch {
    return { ok: false, reason: 'read-error' };
  }
}

function createApplicationMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 920,
    height: 650,
    minWidth: 760,
    minHeight: 520,
    title: 'Lecture 11 · Electron Task Desk',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.argv.includes('--screenshot')) {
    win.webContents.once('did-finish-load', async () => {
      await new Promise(resolve => setTimeout(resolve, 700));
      const image = await win.webContents.capturePage();
      const target = path.resolve(__dirname, '../../../screenshots/lecture-11/electron-task-desktop.png');
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, image.toPNG());
      console.log(`Screenshot written to ${target}`);
      app.quit();
    });
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(createApplicationMenu());

  ipcMain.handle('system:info', () => ({
    platform: process.platform,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }));
  ipcMain.handle('task:save', (_event, task) => saveTask(task));
  ipcMain.handle('task:open', () => openTask());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
