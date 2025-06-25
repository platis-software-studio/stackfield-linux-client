const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the clipboard functionality from the main process
contextBridge.exposeInMainWorld('electronAPI', {
  testClipboard: () => ipcRenderer.invoke('test-clipboard'),
  setClipboardImageSimple: (dataUrl) => ipcRenderer.invoke('set-clipboard-image-simple', dataUrl)
});
