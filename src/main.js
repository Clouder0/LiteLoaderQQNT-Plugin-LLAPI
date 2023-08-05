/*
 * @Author: Night-stars-1 nujj1042633805@gmail.com
 * @Date: 2023-07-22 00:36:20
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2023-08-05 17:10:37
 * @Description: 
 * 
 * Copyright (c) 2023 by Night-stars-1, All Rights Reserved. 
 */
const { ipcMain } = require("electron");
const { randomUUID } = require("crypto");
let peer;

const pendingCallbacks = {};

// 创建窗口时触发
function onBrowserWindowCreated(window, plugin) {
    const webContentsId = window.webContents.id.toString();
    const original_send = (window.webContents.__qqntim_original_object && window.webContents.__qqntim_original_object.send) || window.webContents.send;
    const patched_send = (channel, ...args) => {
        if (args[1] && args[1][0]?.cmdName && args[1][0].cmdName === "nodeIKernelMsgListener/onRecvMsg") {
            window.webContents.send('new_message-main', args);
        } else if (args[1] && args[1][0]?.cmdName && args[1][0].cmdName === "nodeIKernelGroupListener/onGroupListUpdate") {
            window.webContents.send('groups-list-updated-main', args);
        } else if (args[1] && args[1][0]?.cmdName && args[1][0].cmdName === "nodeIKernelBuddyListener/onBuddyListChange") {
            window.webContents.send('friends-list-updated-main', args);
        } else if (args[1] && args[1][0]?.cmdName && args[1][0].cmdName === "nodeIKernelProfileListener/onProfileSimpleChanged") {
            window.webContents.send('user-info-list-main', args);
        }
        if (args[0]?.callbackId) {
            const id = args[0].callbackId;
            if (id in pendingCallbacks) {
                window.webContents.send(pendingCallbacks[id], args[1]);
                delete pendingCallbacks[id];
            }
        }
        return original_send.call(window.webContents, channel, ...args);
    };
    if (window.webContents.__qqntim_original_object) {
        window.webContents.__qqntim_original_object.send = patched_send;
      } else {
        window.webContents.send = patched_send;
    }
    window.webContents.on("ipc-message", (_, channel, ...args) => {
        // output(channel, JSON.stringify(args))
        if (args[1] && args[1][0] && args[1][0].includes("AuthData")) {
            //output("AuthData", JSON.stringify(args))
        } else if (args[1] && args[1][0] && args[1][0].includes("Msg")) {
            //output("Msg", JSON.stringify(args))
        } else if (args[1] && args[1][0] && args[1][0].includes("Group")) {
            //output("Group", JSON.stringify(args))
        } else if (args[1] && args[1][0] === "nodeIKernelMsgService/setMsgRead") {
            peer = args[1][1].peer;
        }
        /**
        if (channel.includes("LL_UP_")) {
            const id = args[0].callbackId;
            output(id)
            pendingCallbacks[id] = 'LL_DOWN_'+channel.split("LL_UP_")[1];
        }
         */
    });
    window.webContents.on("ipc-message-sync", (event, channel, ...args) => {
        if (channel == "___!boot") {
            event.returnValue = {
                enabled: true,
                webContentsId: webContentsId,
            };
        }
    });
}

// 加载插件时触发
function onLoad(plugin) {
    ipcMain.on("___!boot", (event) => {
        if (!event.returnValue) event.returnValue = { enabled: false };
    });
    
    ipcMain.on("___!log", (event, level, ...args) => {
        console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args);
    });
    // 安装
    ipcMain.handle(
        "LiteLoader.LLAPI_PRE.log",
        (event, ...message) => {console.log(...message)}
    );
    ipcMain.handle(
        "LiteLoader.LLAPI_PRE.randomUUID_LL",
        (event, message) => {
            try {
                return randomUUID();
            } catch (error) {
                console.log(error);
                return {};
            }
        }
    );
    ipcMain.handle(
        "LiteLoader.LLAPI_PRE.set_id",
        (event, id, webContentsId) => {
            try {
                pendingCallbacks[id] = 'LL_DOWN_'+webContentsId;
            } catch (error) {
                console.log(error);
                return {};
            }
        }
    );
}

function output(...args) {
    console.log("\x1b[32m[LLAPI]\x1b[0m", ...args);
}

module.exports = {
    onLoad,
    onBrowserWindowCreated
}
