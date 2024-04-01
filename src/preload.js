const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("imageSearch", {
    getSettings: () => ipcRenderer.invoke(
        "LiteLoader.imageSearch.getSettings"
    ),

    setSettings: content => ipcRenderer.invoke(
        "LiteLoader.imageSearch.setSettings",
        content
    ),

    logToMain: (...args) => ipcRenderer.invoke(
        "LiteLoader.imageSearch.logToMain",
        ...args
    ),

    openWeb: (url) =>
        ipcRenderer.send("LiteLoader.imageSearch.openWeb", url)
});
