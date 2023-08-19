/*
 * @Author: Night-stars-1
 * @Date: 2023-08-03 23:18:21
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2023-08-19 11:29:21
 * @Description: 借鉴了NTIM, 和其他大佬的代码
 * 
 * Copyright (c) 2023 by Night-stars-1, All Rights Reserved. 
 */
const plugin_path = LiteLoader.plugins.LLAPI.path.plugin;
const ipcRenderer = LLAPI_PRE.ipcRenderer_LL;
const ipcRenderer_on = LLAPI_PRE.ipcRenderer_LL_on;
const ipcRenderer_once = LLAPI_PRE.ipcRenderer_LL_once;
const set_id = LLAPI_PRE.set_id;
const exists = LLAPI_PRE.exists;

const qmenu = []

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

export let { webContentsId } = ipcRenderer.sendSync("___!boot");
if (!webContentsId) {
    webContentsId = "2"
}

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
        const uuid = crypto.randomUUID();
        ipcRenderer_on(`LL_DOWN_${uuid}`, (event, data) => {
            output(uuid, data)
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
     * @example
     * LLAPI.on("new-messages", (message) => {
     *    console.log(message);
     * })
     */
    /**
     * @description 聊天界面消息更新
     * @example
     * LLAPI.on("dom-up-messages", (node) => {
     *    console.log(node);
     * })
     */
    /**
     * @description 监听QQ消息菜单打开事件
     * @tips 该事件可以使用qContextMenu
     *      event: 为事件
     *      target: 为右键位置的document
     *      msgIds: 为消息ID
     * LLAPI.on("context-msg-menu", (event, target, msgIds) => {
     *    console.log(event);
     * })
     */
    /**
     * @description 添加消息编辑栏的内容(未完成)
     * @param {string|HTMLElement} message 消息内容
     * @returns true/false
     * @example
     * LLAPI.add_editor(message)
     * message:
     * {
     *      type: "text",
     *      content: "一条消息"
     * }
     * {
     *      type: "face",
     *      id: "344", 
     *      label: "[大怨种]", 
     *      path: PATH
     * }
     * {
     *      type: "img",
     *      id: "344", 
     *      label: "[大怨种]", 
     *      path: PATH
     * }
     */
    add_editor(message) {
        try {
            const select = window.getSelection()
            const { anchorNode, anchorOffset } = select;
            const parentNodeArray = Array.from(anchorNode.parentNode.childNodes);
            var parentNode_index = parentNodeArray.indexOf(anchorNode); // 输入框光标选择元素的位置
            const qqFace = constructor.constructFace("344", "[大怨种]", "appimg://H:/QQ/nt_qq/global/nt_data/Emoji/emoji-resource/sysface_res/apng/s344.png")
            const msg_data = document.querySelector(".ck.ck-content.ck-editor__editable").ckeditorInstance.getData()
            const msg_list_re = msg_data.replace("<p>", "").replace("</p>", "")
                                .split(/(<\/?(?:msg-img|msg-qqface)[^>]*><\/?(?:\/msg-img|\/msg-qqface)[^>]*>)/) // 分割消息
            const msg_list = msg_list_re.filter(tag => tag) // 去除无效信息  && (tag != '</msg-img>') && tag!= '</msg-qqface>'
            if (message.type == "face") {
                message.content = constructor.constructFace(message.id, message.label, "appimg://H:/QQ/nt_qq/global/nt_data/Emoji/emoji-resource/sysface_res/apng/s344.png")
                message.length = 1
            }
            if (anchorNode.textContent == '⁠⁠⁠⁠⁠⁠⁠') {
                //msg_list.splice(parentNode_index, 0, "&NoBreak;")
                parentNode_index--;
                if (parentNode_index < msg_list.length) {
                    const check_index = anchorOffset==0?parentNode_index-1:parentNode_index
                    const part1 = (msg_list[check_index].includes("msg-qqface")||msg_list[check_index].includes("msg-img"))? msg_list[check_index]:msg_list[check_index].substring(0, anchorOffset); // 分割光标位置的字符，前
                    const part2 = (msg_list[check_index].includes("msg-qqface")||msg_list[check_index].includes("msg-img"))? "":msg_list[check_index].substring(anchorOffset); // 分割光标位置的字符，后
                    const part = [part1, message.content, part2] // 插入字符
                    output(msg_list[check_index])
                    msg_list.splice(check_index, 1, "&NoBreak;&NoBreak;&NoBreak;&NoBreak;&NoBreak;&NoBreak;&NoBreak;")
                    output(msg_list)
                    msg_list.splice(check_index, 1, ...part)
                    output(msg_list)
                } else {
                    msg_list.push(message.content)
                }
                document.querySelector(".ck.ck-content.ck-editor__editable").ckeditorInstance.setData(`<p>${msg_list.join("")}</p>`)
                // 关闭表情面板，并点击文本框
                if (document.querySelector(".sticker-panel").style.display == '') {
                    document.querySelector('.icon-item[aria-label="表情"]').click()
                }
                //output(document.querySelector(".ck.ck-content p").childNodes)
                //output(document.querySelector(".ck.ck-content p").childNodes[parentNode_index+1])
                select.selectAllChildren(document.querySelector(".ck.ck-content p").childNodes[parentNode_index+1])
                /**
                // 光标纠正
                for (var i = 0; i < message.length; i++) {
                    select.modify("move", "forward", "character");
                }
                 */
            }
            return true
        } catch (error) {
            return false
        }
    }
    /**
     * @description 设置消息编辑栏的内容
     * @param {string|HTMLElement} message 消息内容
     * @returns true/false
     */
    set_editor(message) {
        try {
            document.querySelector(".ck.ck-content.ck-editor__editable").ckeditorInstance.setData(message)
            return true
        } catch (error) {
            return false
        }
    }
    /**
     * @description 添加聊天消息(不保存)(未完成)
     * @param {string|HTMLElement} peer 对方的ID
     * @param {string|HTMLElement} message 消息内容
     * @returns true/false
     */
    add_message_list(peer, message) {
        LLAPI_PRE.ipcRenderer_LL.send("___!add_message_list", peer, message);
    }
    /**
     * @description 添加QQ消息的右键菜单项目
     * @param {function} func 函数添加逻辑
     * @example func:
     * function abc(qContextMenu) {
     *     qContextMenu.insertAdjacentHTML('beforeend', separatorHTML)
     *     qContextMenu.insertAdjacentHTML('beforeend', repeatmsgHTML)
     * }
     */
    add_qmenu(...func) {
        qmenu.push(func)
    }
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
     * elements: [{
     *    type: "text",
     *    content: "一条消息"
        }]
     */
    async sendMessage(peer, elements) {
        ntCall("ns-ntApi", "nodeIKernelMsgService/sendMsg", [
            {
                msgId: "0",
                peer: destructor.destructPeer(peer),
                msgElements: await Promise.all(
                    elements.map(async (element) => {
                        output(element)
                        if (element.type == "text") return destructor.destructTextElement(element);
                        else if (element.type == "image") return destructor.destructImageElement(element, await media.prepareImageElement(element.file));
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
    async forwardMessage(srcpeer, dstpeer, msgIds) {
        ntCall("ns-ntApi", "nodeIKernelMsgService/forwardMsgWithComment", [
            {
                msgIds: msgIds,
                srcContact: destructor.destructPeer(srcpeer),
                dstContacts: [
                    destructor.destructPeer(dstpeer)
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
     * @description 获取历史聊天记录
     * @param {number} peer 对方Peer
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
ipcRenderer_on('set_message-main', (event) => {
    apiInstance.emit("set_message");
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
    constructImageElement(ele, msg) {
        return {
            type: "image",
            file: ele.picElement.sourcePath,
            downloadedPromise: media.downloadMedia(msg.msgId, ele.elementId, msg.peerUid, msg.chatType, ele.picElement.thumbPath.get(0), ele.picElement.sourcePath),
            raw: ele,
        };
    }
    constructMessage(msg) {
        const downloadedPromises = [];
        const elements = (msg.elements).map((ele) => {
            if (ele.elementType == 1) return this.constructTextElement(ele);
            else if (ele.elementType == 2) {
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
    constructFace(id, label, path) {
        // 创建 msg-qqface 元素
        const msgQQFace = document.createElement('msg-qqface');
        // 设置 data 属性的值
        const dataValue = {
            type: 'qqFace',
            id: id,
            label: label,
            path: path,
            animationData: {
                packId: '1',
                stickerId: '28',
                stickerType: 1,
                sourceType: 1,
                resultId: '',
                superisedId: '',
                randomType: 1
            }
        };
        msgQQFace.setAttribute('data', JSON.stringify(dataValue));
        return msgQQFace.outerHTML;
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
    des() {
        return [
            {
                "type": "request",
                "eventName": "ns-ntApi-2"
            },
            [
                {
                "cmdName": "nodeIKernelMsgListener/onRecvMsg",
                "cmdType": "event",
                "payload": {
                    "msgList": [
                    {
                        "msgId": "7268161886249232473",
                        "msgRandom": "1669875297",
                        "msgSeq": "29",
                        "cntSeq": "0",
                        "chatType": 1,
                        "msgType": 2,
                        "subMsgType": 1,
                        "sendType": 0,
                        "senderUid":"0",
                        "peerUid":"0",
                        "channelId": "",
                        "guildId": "",
                        "guildCode": "0",
                        "fromUid": "0",
                        "fromAppid": "0",
                        "msgTime": "1692250510",
                        "msgMeta": "0x",
                        "sendStatus": 2,
                        "sendMemberName": "",
                        "sendNickName": "",
                        "guildName": "",
                        "channelName": "",
                        "elements": [
                        {
                            "elementType": 1,
                            "elementId": "7268161886249232474",
                            "extBufForUI": "0x",
                            "textElement": {
                            "content": "测试1111",
                            "atType": 0,
                            "atUid": "0",
                            "atTinyId": "0",
                            "atNtUid": "",
                            "subElementType": 0,
                            "atChannelId": "0",
                            "atRoleId": "0",
                            "atRoleColor": 0,
                            "atRoleName": "",
                            "needNotify": 0
                            },
                            "faceElement": null,
                            "marketFaceElement": null,
                            "replyElement": null,
                            "picElement": null,
                            "pttElement": null,
                            "videoElement": null,
                            "grayTipElement": null,
                            "arkElement": null,
                            "fileElement": null,
                            "liveGiftElement": null,
                            "markdownElement": null,
                            "structLongMsgElement": null,
                            "multiForwardMsgElement": null,
                            "giphyElement": null,
                            "walletElement": null,
                            "inlineKeyboardElement": null,
                            "textGiftElement": null,
                            "calendarElement": null,
                            "yoloGameResultElement": null,
                            "avRecordElement": null
                        }
                        ],
                        "records": [
                        
                        ],
                        "emojiLikesList": [
                        
                        ],
                        "commentCnt": "0",
                        "directMsgFlag": 0,
                        "directMsgMembers": [
                        
                        ],
                        "peerName": "",
                        "freqLimitInfo": null,
                        "editable": false,
                        "avatarMeta": "",
                        "avatarPendant": "",
                        "feedId": "",
                        "roleId": "0",
                        "timeStamp": "0",
                        "clientIdentityInfo": null,
                        "isImportMsg": false,
                        "atType": 0,
                        "roleType": 0,
                        "fromChannelRoleInfo": {
                        "roleId": "0",
                        "name": "",
                        "color": 0
                        },
                        "fromGuildRoleInfo": {
                        "roleId": "0",
                        "name": "",
                        "color": 0
                        },
                        "levelRoleInfo": {
                        "roleId": "0",
                        "name": "",
                        "color": 0
                        },
                        "recallTime": "0",
                        "isOnlineMsg": true,
                        "generalFlags": "0x",
                        "clientSeq": "38025",
                        "fileGroupSize": null,
                        "foldingInfo": null,
                        "nameType": 0,
                        "avatarFlag": 0,
                        "anonymousExtInfo": null,
                        "personalMedal": null,
                        "roleManagementTag": null
                    }
                    ]
                }
                }
            ]
        ]
    }
}
const destructor = new Destructor();

class Media {
    async prepareImageElement(file) {
        const type = await ntCall("ns-fsApi", "getFileType", [file]);
        const md5 = await ntCall("ns-fsApi", "getFileMd5", [file]);
        const fileName = `${md5}.${type.ext}`;
        const filePath = await ntCall("ns-ntApi", "nodeIKernelMsgService/getRichMediaFilePath", [
            {
                md5HexStr: md5,
                fileName: fileName,
                elementType: 2,
                elementSubType: 0,
                thumbSize: 0,
                needCreate: true,
                fileType: 1,
            },
        ]);
        await ntCall("ns-fsApi", "copyFile", [{ fromPath: file, toPath: filePath }]);
        const imageSize = await ntCall("ns-fsApi", "getImageSizeFromPath", [file]);
        const fileSize = await ntCall("ns-fsApi", "getFileSize", [file]);
        return {
            md5HexStr: md5,
            fileSize: fileSize,
            picWidth: imageSize.width,
            picHeight: imageSize.height,
            fileName: fileName,
            sourcePath: filePath,
            original: true,
            picType: 1001,
            picSubType: 0,
            fileUuid: "",
            fileSubId: "",
            thumbFileSize: 0,
            summary: "",
        };
    }
    async downloadMedia(msgId, elementId, peerUid, chatType, filePath, originalFilePath) {
        if (await exists(originalFilePath)) return;
        return await ntCall("ns-ntApi", "nodeIKernelMsgService/downloadRichMedia", [
            {
                getReq: {
                    msgId: msgId,
                    chatType: chatType,
                    peerUid: peerUid,
                    elementId: elementId,
                    thumbSize: 0,
                    downloadType: 2,
                    filePath: filePath,
                },
            },
            undefined,
        ]);
    }
}
const media = new Media();

function monitor_qmenu(event) {
    let { target } = event
    const { classList } = target
    if (classList?.[0] !== "q-context-menu" && typeof qContextMenu !== "undefined" && (qContextMenu.innerText.includes("转发") || qContextMenu.innerText.includes("转文字"))) {
        // 发送context-menu事件
        let msgIds;
        // 尝试10次获取msgIds
        for (let i = 0; i < 10; i++) {
            msgIds = target.id;
            if (!msgIds) {
                target = target.offsetParent;
            } else {
                break; // 获取到msgIds退出循环
            }
        }
        if (msgIds.includes("ark-view-ml-root-")) {
            msgIds = msgIds.replace("ark-view-ml-root-", "");
        } else {
            msgIds = msgIds.split("-")[0];
        }
        if (qContextMenu.innerText.includes("转文字")) {
            target.classList = ["ptt-element__progress"]
        }
        apiInstance.emit("context-msg-menu", event, target, msgIds);
    }
}

function onLoad() {
    // 扩展 CanvasRenderingContext2D 原型链
    CanvasRenderingContext2D.prototype._originalDrawFunction = CanvasRenderingContext2D.prototype.drawImage;

    CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
        output('Drawing with custom interception:', image);
        return this._originalDrawFunction.call(this, image, ...args);
    };
    const observer = new MutationObserver((mutationsList, observer) => {
        // 遍历每个变化
        for (const mutation of mutationsList) {
            const { target } = mutation
            const { classList } = target
            // 检查是否有新元素添加
            if (mutation.type === 'childList' && classList[0]) {
                // 遍历每个新增的节点
                mutation.addedNodes.forEach(node => {
                    // 判断节点是否为元素节点
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        node.querySelectorAll('.image.pic-element').forEach((img_node) => {
                            img_node.addEventListener('contextmenu', monitor_qmenu)
                        })
                        node.querySelectorAll('.image.market-face-element').forEach((img_node) => {
                            img_node.addEventListener('contextmenu', monitor_qmenu)
                        })
                        /**
                        const original = Element.prototype
                        Element.prototype = new Proxy(original, {
                            get(target, property) {
                                output(property)
                                return target[property];
                            }
                        });
                         */
                    }
                    // QQ菜单弹出
                    if (node?.previousSibling?.classList?.[0] == "q-context-menu"  && (node?.previousSibling?.innerText.includes("转发") || node?.previousSibling?.innerText.includes("转文字"))) {
                        const ndoe_rect = node.previousSibling.getBoundingClientRect()
                        const message_element = document.elementFromPoint(ndoe_rect.x, ndoe_rect.y)
                        //?.closest(".msg-content-container")?.closest(".message");
                        qmenu[0].forEach(listener => {
                            listener(node.previousSibling, message_element);
                        });
                    }
                    // QQ消息更新
                    if (node.className == "ml-item") {
                        apiInstance.emit("dom-up-messages", node);
                    }
                });
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('contextmenu', monitor_qmenu)
}

const elements = new WeakMap();
window.__VUE_ELEMENTS__ = elements;

function watchComponentUnmount(component) {
    if (!component.bum) component.bum = [];
    component.bum.push(() => {
        const element = component.vnode.el;
        if (element) {
            const components = elements.get(element);
            if (components?.length == 1) elements.delete(element);
            else components?.splice(components.indexOf(component));
            if (element.__VUE__?.length == 1) element.__VUE__ = undefined;
            else element.__VUE__?.splice(element.__VUE__.indexOf(component));
        }
    });
}

function watchComponentMount(component) {
    let value;
    Object.defineProperty(component.vnode, "el", {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            if (value) recordComponent(component);
        },
    });
}

function recordComponent(component) {
    let element = component.vnode.el;
    while (!(element instanceof HTMLElement)) {
        element = element.parentElement;
    }

    // Expose component to element's __VUE__ property
    if (element.__VUE__) element.__VUE__.push(component);
    else element.__VUE__ = [component];

    // Add class to element
    element.classList.add("vue-component");

    // Map element to components
    const components = elements.get(element);
    if (components) components.push(component);
    else elements.set(element, [component]);

    watchComponentUnmount(component);
}

export function hookVue3() {
    window.Proxy = new Proxy(window.Proxy, {
        construct(target, [proxyTarget, proxyHandler]) {
            const component = proxyTarget?._;
            if (component?.uid >= 0) {
                const element = component.vnode.el;
                if (element) recordComponent(component);
                else watchComponentMount(component);
            }
            return new target(proxyTarget, proxyHandler);
        },
    });
}

hookVue3()

export {
    onLoad
}