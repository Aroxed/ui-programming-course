const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  loadBoard: () => ipcRenderer.invoke('board:load'),
  saveBoard: (board) => ipcRenderer.invoke('board:save', board),
  importTasks: () => ipcRenderer.invoke('tasks:import'),
  exportTasks: (tasks) => ipcRenderer.invoke('tasks:export', tasks),
  notify: () => ipcRenderer.invoke('notification:show'),
});
