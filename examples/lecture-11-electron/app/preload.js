const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
  saveTask: task => ipcRenderer.invoke('task:save', task),
  openTask: () => ipcRenderer.invoke('task:open')
});
