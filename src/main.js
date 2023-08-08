/*
 * @Author: Night-stars-1 nujj1042633805@gmail.com
 * @Date: 2023-07-22 00:36:20
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2023-08-08 17:30:09
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
    window.webContents.on("-ipc-message", (_, status, name, ...args) => {
        if (name !== "___!log" && args[0][1] && args[0][1][0] != "info") {
            const event = args[0][0];
            const data = args[0][1];
            output(JSON.stringify(data));
            if (data && data[0] === "changeRecentContacPeerUid") {
                const peerUid = data[1].peerUid;
                peer = {
                    chatType: peerUid[0] == "u" ? 1 : 2,
                    peerUid: peerUid,
                    guildId: "",
                }
            }
        }
    });
    const proxyEvents = new Proxy(window.webContents._events["-ipc-message"], {
        // 拦截函数调用
        apply(target, thisArg, argumentsList) {
            /**
            if (argumentsList[3][1][0] && argumentsList[3][1][0].includes("sendMsg")) {
                // 消息内容数据
                const content = argumentsList[3][1][1]
                // 消息内容
                //output(content.msgElements[0].textElement.content)
                //content.msgElements[0].textElement.content = "测试"
                //output("ipc-msg被拦截", JSON.stringify(content));
            }
             */
            return target.apply(thisArg, argumentsList);
        }
    });
    window.webContents._events["-ipc-message"] = proxyEvents
    window.webContents.on("ipc-message-sync", (event, channel, ...args) => {
        //output(channel, JSON.stringify(args))
        if (channel == "___!boot") {
            event.returnValue = {
                enabled: true,
                webContentsId: window.webContents.id.toString()
            };
        }
    });
    window.webContents.on('did-finish-load', () => {
        console.log('Page finished loading');
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
                output(error);
                return {};
            }
        }
    );
    ipcMain.handle(
        "LiteLoader.LLAPI_PRE.get_peer",
        (event) => {
            try {
                return peer;
            } catch (error) {
                output(error);
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
