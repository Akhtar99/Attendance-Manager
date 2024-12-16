const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  sendRequest: (channel, data) => ipcRenderer.send(channel, data),
  onResponse: (channel, callback) => ipcRenderer.on(channel, (event, args) => callback(args)),
});
