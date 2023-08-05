// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("LLAPI_PRE", {
    // 获取配置
    ipcRenderer_LL: ipcRenderer,
    randomUUID_LL: () => ipcRenderer.invoke(
        "LiteLoader.LLAPI_PRE.randomUUID_LL"
    ),
    ipcRenderer_LL_on: (channel, callback) => {
        ipcRenderer.on(channel, callback)
    },
    set_id: (id, webContentsId) => ipcRenderer.invoke(
        "LiteLoader.LLAPI_PRE.set_id",
        id, webContentsId
    )
});