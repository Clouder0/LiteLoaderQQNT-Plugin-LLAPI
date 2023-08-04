/*
 * @Author: Night-stars-1 nujj1042633805@gmail.com
 * @Date: 2023-07-22 00:36:20
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2023-08-04 19:56:46
 * @Description: 
 * 
 * Copyright (c) 2023 by Night-stars-1, All Rights Reserved. 
 */

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
    window.webContents.on("ipc-message", (_, channel, ...args) => {
        if (args[1] && args[1][0] && args[1][0].includes("Msg")) {
            //output("Msg", JSON.stringify(args))
        } else if (args[1] && args[1][0] && args[1][0].includes("Group")) {
            //output("Group", JSON.stringify(args))
        } else if (args[1] && args[1][0] === "nodeIKernelMsgService/setMsgRead") {
            peer = args[1][1].peer;
        }
        if (channel.includes("LL_UP_")) {
            const id = args[0].callbackId;
            pendingCallbacks[id] = 'LL_DOWN_'+channel.split("LL_UP_")[1];
        }
    });
}

function output(...args) {
    console.log("\x1b[32m[LLAPI]\x1b[0m", ...args);
}

module.exports = {
    onBrowserWindowCreated
}
