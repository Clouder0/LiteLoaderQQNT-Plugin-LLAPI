/*
 * @Author: Night-stars-1
 * @Date: 2023-08-03 23:18:21
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2023-08-07 21:02:51
 * @Description: 借鉴了NTIM, 和其他大佬的代码
 * 
 * Copyright (c) 2023 by Night-stars-1, All Rights Reserved. 
 */
const plugin_path = LiteLoader.plugins.LLAPI.path.plugin;
const ipcRenderer = LLAPI_PRE.ipcRenderer_LL;
const ipcRenderer_on = LLAPI_PRE.ipcRenderer_LL_on;
const randomUUID = LLAPI_PRE.randomUUID_LL;
const set_id = LLAPI_PRE.set_id;

export function patchLogger() {
    const log = (level, ...args) => {
        const serializedArgs = [];
        for (const arg of args) {
            serializedArgs.push(typeof arg == "string" ? arg: arg?.toString());
        }
        LLAPI_PRE.ipcRenderer_LL.send("___!log", level, ...serializedArgs);
    };
    (
        [
            ["debug", 0],
            ["log", 1],
            ["info", 2],
            ["warn", 3],
            ["error", 4],
        ]
    ).forEach(([method, level]) => {
        const originalConsoleMethod = console[method];
        console[method] = (...args) => {
            log(level, ...args)
            originalConsoleMethod.apply(console, args);
        };
    });
}
patchLogger(); // 重写渲染进程log

export const { webContentsId } = ipcRenderer.sendSync("___!boot");

function output(...args) {
    console.log("\x1b[32m[LLAPI-渲染]\x1b[0m", ...args);
}

class NTCallError extends Error {
    code;
    message;
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
    }
}

function ntCall(eventName, cmdName, args, isRegister = false) {
    return new Promise(async (resolve, reject) => {
        const uuid = await randomUUID();
        ipcRenderer_on(`LL_DOWN_${webContentsId}`, (event, data) => {
            resolve(data);
        });
        /**
        ipcRenderer.send(
            `LL_UP_${webContentsId}`,
            {
                type: "request",
                callbackId: uuid,
                eventName: `${eventName}-${webContentsId}${isRegister ? "-register" : ""}`,
            },
            [cmdName, ...args]
        );
         */
        set_id(uuid, webContentsId);
        ipcRenderer.send(
            `IPC_UP_${webContentsId}`,
            {
                type: "request",
                callbackId: uuid,
                eventName: `${eventName}-${webContentsId}${isRegister ? "-register" : ""}`,
            },
            [cmdName, ...args]
        );
    });
}


class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    
    once(eventName, listener) {
        const onceListener = (...args) => {
            listener(...args);
            this.off(eventName, onceListener);
        };
        this.on(eventName, onceListener);
    }

    off(eventName, listener) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(fn => fn !== listener);
        }
    }

    emit(event, ...args) {
        const listeners = this.events[event];
        if (listeners) {
            listeners.forEach(listener => {
                listener(...args);
            });
        }
    }
}

class Api extends EventEmitter {
    /**
     * @description 监听新消息
     * window.LLAPI.on("new-messages", (message) => {
     *    console.log(message);
     * })
     */
    /**
     * @description 获取当前用户信息
     * @returns uid: number, uin: number
     */
    async getAccountInfo() {
        return await ntCall("ns-BusinessApi", "fetchAuthData", []).then((data) => {
            if (!data) return;
            return { uid: data.uid, uin: data.uin };
        });
    }
    /**
     * @description 获取当前用户的详细信息
     * @param {number} uid
     * @returns nickName: 名称, age: 年龄等
     */
    async getUserInfo(uid) {
        ntCall("ns-ntApi", "nodeIKernelProfileService/getUserDetailInfo", [{ uid: uid }, undefined]);
        return await new Promise((resolve) => {
            this.once("user-info-list", (args) => resolve(constructor.constructUser(args?.[1]?.[0]?.payload?.profiles?.get(uid))));
        });
    }
    /**
     * @description 获取当前聊天窗口的peer
     * @returns peer
     */
    async getPeer() {
        const peer = await LLAPI_PRE.get_peer()
        return peer;
    }
    /**
     * @description 发送消息
     * @param {Peer} peer 对方的ID
     * @param {MessageElement[]} elements
     * elements: {
     *    type: "text",
     *    content: "一条消息"
        }
     */
    async sendMessage(peer, elements) {
        ntCall("ns-ntApi", "nodeIKernelMsgService/sendMsg", [
            {
                msgId: "0",
                peer: destructor.destructPeer(peer),
                msgElements: await Promise.all(
                    elements.map(async (element) => {
                        if (element.type == "text") return destructor.destructTextElement(element);
                        else if (element.type == "face") return destructor.destructFaceElement(element);
                        else if (element.type == "raw") return destructor.destructRawElement(element);
                        else return null;
                    }),
                ),
            },
            null,
        ]);
    }
    /**
     * @description 转发消息
     * @param {Peer} peer 对方的ID
     * @param {string[]} msgIds 消息ID的列表
     */
    async forwardMessage(peer, msgIds) {
        ntCall("ns-ntApi", "nodeIKernelMsgService/forwardMsgWithComment", [
            {
                msgIds: msgIds,
                srcContact: {
                  chatType: 2,
                  peerUid: peer.peerUid,
                  guildId: ""
                },
                dstContacts: [
                  {
                    chatType: 2,
                    peerUid: peer.peerUid,
                    guildId: ""
                  }
                ],
                commentElements: []
            },
            null,
        ]);
    }
    /**
     * @description 获取好友列表
     * @param {boolean} forced 是否强制更新
     */
    async getFriendsList(forced = false) {
        ntCall("ns-ntApi", "nodeIKernelBuddyService/getBuddyList", [{ force_update: forced }, undefined]);
        return await new Promise((resolve) => {
            this.once("friends-list-updated", (list) => resolve(list));
        });
    }
    /**
     * @description 获取群组列表
     * @param {boolean} forced 是否强制更新
     */
    async getGroupsList(forced = false) {
        ntCall("ns-ntApi", "nodeIKernelGroupService/getGroupList", [{ forceFetch: forced }, undefined]);
        return await new Promise((resolve) => {
            this.once("groups-list-updated", (list) => resolve(list));
        });
    }
    /**
     * @description 获取私信信息
     * @param {number} peer 对方UIN
     * @param {string} startMsgId 起始消息ID
     * @returns
     */
    async getPreviousMessages(peer, count = 20, startMsgId = "0") {
        try {
            const msgs = await ntCall("ns-ntApi", "nodeIKernelMsgService/getMsgsIncludeSelf", [
                {
                    peer: destructor.destructPeer(peer),
                    msgId: startMsgId,
                    cnt: count,
                    queryOrder: true,
                },
                undefined,
            ]);
            const messages = (msgs.msgList).map((msg) => constructor.constructMessage(msg));
            return messages;
        } catch {
            return [];
        }
    }
    test() {
        console.log("test");
    }
}

const apiInstance = new Api();

ipcRenderer_on('new_message-main', (event, args) => {
    const messages = (args?.[1]?.[0]?.payload?.msgList).map((msg) => constructor.constructMessage(msg));
    /**
     * @description 获取新消息
     */
    apiInstance.emit("new-messages", messages);
});
ipcRenderer_on('user-info-list-main', (event, args) => {
    apiInstance.emit("user-info-list", args);
});
ipcRenderer_on('groups-list-updated-main', (event, args) => {
    const groupsList = ((args[1]?.[0]?.payload?.groupList || [])).map((group) => constructor.constructGroup(group));
    apiInstance.emit("groups-list-updated", groupsList);
});
ipcRenderer_on('friends-list-updated-main', (event, args) => {
    const friendsList = [];
    ((args?.[1]?.[0]?.payload?.data || [])).forEach((category) => friendsList.push(...((category?.buddyList || [])).map((friend) => constructor.constructUser(friend))));
    apiInstance.emit("friends-list-updated", friendsList);
});
Object.defineProperty(window, "LLAPI", {
    value: apiInstance,
    writable: false,
});

Object.defineProperty(window, "llapi", {
    value: apiInstance,
    writable: false,
});


class Constructor {
    constructTextElement(ele) {
        return {
            type: "text",
            content: ele.textElement.content,
            raw: ele,
        };
    }
    constructFaceElement(ele) {
        return {
            type: "face",
            faceIndex: ele.faceElement.faceIndex,
            faceType: ele.faceElement.faceType == 1 ? "normal" : ele.faceElement.faceType == 2 ? "normal-extended" : ele.faceElement.faceType == 3 ? "super" : ele.faceElement.faceType,
            faceSuperIndex: ele.faceElement.stickerId && parseInt(ele.faceElement.stickerId),
            raw: ele,
        };
    }
    constructRawElement(ele) {
        return {
            type: "raw",
            raw: ele,
        };
    }
    constructMessage(msg) {
        const downloadedPromises = [];
        const elements = (msg.elements).map((ele) => {
            if (ele.elementType == 1) return this.constructTextElement(ele);
            else if (ele.elementType == 222222) {
                const element = this.constructImageElement(ele, msg);
                downloadedPromises.push(element.downloadedPromise);
                return element;
            } else if (ele.elementType == 6) return this.constructFaceElement(ele);
            else return this.constructRawElement(ele);
        });
        return {
            allDownloadedPromise: Promise.all(downloadedPromises),
            peer: {
                uid: msg.peerUid,
                name: msg.peerName,
                chatType: msg.chatType == 1 ? "friend" : msg.chatType == 2 ? "group" : "others",
            },
            sender: {
                uid: msg.senderUid,
                memberName: msg.sendMemberName || msg.sendNickName,
                nickName: msg.sendNickName,
            },
            elements: elements,
            raw: msg,
        };
    }
    constructUser(user) {
        return {
            uid: user.uid,
            qid: user.qid,
            uin: user.uin,
            avatarUrl: user.avatarUrl,
            nickName: user.nick,
            bio: user.longNick,
            sex: { 1: "male", 2: "female", 255: "unset", 0: "unset" }[user.sex] || "others",
            raw: user,
        };
    }
    constructGroup(group) {
        return {
            uid: group.groupCode,
            avatarUrl: group.avatarUrl,
            name: group.groupName,
            role: { 4: "master", 3: "moderator", 2: "member" }[group.memberRole] || "others",
            maxMembers: group.maxMember,
            members: group.memberCount,
            raw: group,
        };
    }
    test() {
        console.log("test");
    }
}
const constructor = new Constructor();

class Destructor {
    destructTextElement(element) {
        return {
            elementType: 1,
            elementId: "",
            textElement: {
                content: element.content,
                atType: 0,
                atUid: "",
                atTinyId: "",
                atNtUid: "",
            },
        };
    }
    
    destructImageElement(element, picElement) {
        return {
            elementType: 2,
            elementId: "",
            picElement: picElement,
        };
    }
    
    destructFaceElement(element) {
        return {
            elementType: 6,
            elementId: "",
            faceElement: {
                faceIndex: element.faceIndex,
                faceType: element.faceType == "normal" ? 1 : element.faceType == "normal-extended" ? 2 : element.faceType == "super" ? 3 : element.faceType,
                ...((element.faceType == "super" || element.faceType == 3) && {
                    packId: "1",
                    stickerId: (element.faceSuperIndex || "0").toString(),
                    stickerType: 1,
                    sourceType: 1,
                    resultId: "",
                    superisedId: "",
                    randomType: 1,
                }),
            },
        };
    }
    
    destructRawElement(element) {
        return element.raw;
    }
    
    destructPeer(peer) {
        return {
            chatType: peer.chatType == "friend" ? 1 : peer.chatType == "group" ? 2 : 1,
            peerUid: peer.uid,
            guildId: "",
        };
    }
}

const destructor = new Destructor();
