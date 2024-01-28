/*
 * @Author: Night-stars-1 nujj1042633805@gmail.com
 * @Date: 2023-07-22 00:36:20
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2024-01-23 23:26:47
 * @Description: 
 * 
 * Copyright (c) 2023 by Night-stars-1, All Rights Reserved. 
 */
const { ipcMain } = require("electron");
const { existsSync } = require("fs");
const util = require('util');
const { imc_handle } = require("./imc_handler");

let peer;
let account = '0';
let i=0;
const pendingCallbacks = {};

function printObject(object) {
    return util.inspect(object, {
        compact: true,
        depth: null,
        showHidden: true
    });
}

// 创建窗口时触发
function onBrowserWindowCreated(window) {
    const original_send = window.webContents.send;
    const patched_send = (channel, ...args) => {
        // output("received ipc msg: ", JSON.stringify(args));
        if (args?.[1]?.[0]?.cmdName === "nodeIKernelMsgListener/onRecvMsg") {
            try{
                const messages = (args?.[1]?.[0]?.payload?.msgList).map((msg) => constructor.constructMessage(msg));
                imc_handle(messages).then(() => {console.log("Done")}).catch((e) => {console.log(e)});
            } catch(error) {
                console.log(error)
            }
            window.webContents.send('new_message-main', args);
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelGroupListener/onGroupListUpdate") {
            window.webContents.send('groups-list-updated-main', args);
        } else if (args?.[1]?.[0]?.cmdName === "onGroupListUpdate") {
            window.webContents.send('groups-list-updated-main', args);
        } else if (args?.[1]?.[0]?.cmdName === "onBuddyListChange") {
            window.webContents.send('friends-list-updated-main', args);
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelProfileListener/onProfileSimpleChanged") {
            window.webContents.send('user-info-list-main', args);
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelRecentContactListener/onRecentContactListChanged") {
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelGroupListener/onGroupDetailInfoChange") {
            // output("群信息更新", JSON.stringify(args))
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelRecentContactListener/onRecentContactListChanged") {
            // [{"type":"request","eventName":"ns-ntApi-2"},[{"cmdName":"nodeIKernelRecentContactListener/onRecentContactListChanged","cmdType":"event","payload":{"sortedContactList":["7264197141984821597","7264204473568232702","7268475075878840933","7268474307396539457","7268151922793208847"],"changedList":[{"id":"437136493","contactId":"7264197141984821597","chatType":2,"senderUid":"","senderUin":"2047086615","peerUid":"437136493","peerUin":"0","msgTime":"1693223393","sendMemberName":"","sendNickName":"","guildName":"","channelName":"","peerName":"؞靠，你？؞呵呵","remark":"","memberName":null,"avatarUrl":"","avatarPath":"H:\\QQ\\3340610755\\nt_qq\\nt_data\\avatar\\group\\b0\\s_b01e608e2d011d757690ed53b264fb4e","abstractContent":[{"elementType":8,"elementSubType":12,"content":"","custom_content":"","index":0,"isSetProclamation":null,"isSetEssence":null,"operatorRole":null,"operatorTinyId":null,"fileName":null,"tinyId":null,"msgSeq":null,"msgId":null,"emojiId":null,"emojiType":null,"localGrayTipType":null,"grayTiPElement":{"subElementType":12,"revokeElement":null,"proclamationElement":null,"emojiReplyElement":null,"groupElement":null,"buddyElement":null,"feedMsgElement":null,"essenceElement":null,"groupNotifyElement":null,"buddyNotifyElement":null,"xmlElement":{"busiType":"1","busiId":"10145","c2cType":0,"serviceType":0,"ctrlFlag":7,"content":"<gtip align=\"center\"><qq uin=\"u_4B8ETD3ySVv--pNnQAupOA\" col=\"3\" jp=\"1042633805\" /><nor txt=\"邀请\"/><qq uin=\"u_iDVsVV8gskSMTB51hSDGVg\" col=\"3\" jp=\"1754196821\" /> <nor txt=\" 加入了群聊。\"/> </gtip>","templId":"10179","seqId":"1313801018","templParam":{},"pbReserv":"0x","members":{}},"fileReceiptElement":null,"localGrayTipElement":null,"blockGrayTipElement":null,"aioOpGrayTipElement":null,"jsonGrayTipElement":null},"textGiftElement":null,"calendarElement":null,"onlineFileMsgCnt":0}],"sendStatus":2,"topFlag":0,"topFlagTime":"0","draftFlag":2,"draftTime":"0","specialCareFlag":0,"sessionType":2,"shieldFlag":"1","atType":0,"draft":[],"hiddenFlag":0,"isMsgDisturb":false,"nestedSortedContactList":[],"nestedChangedList":[],"unreadCnt":"1","isBeat":false,"isOnlineMsg":false,"msgId":"7272339095364512318","notifiedType":0,"isBlock":false,"listOfSpecificEventTypeInfosInMsgBox":null,"anonymousFlag":0}]}}]]
            // [[{"type":"request","eventName":"ns-ntApi-2"},[{"cmdName":"nodeIKernelMsgListener/onRecvMsg","cmdType":"event","payload":{"msgList":[{"msgId":"7272339095364512318","msgRandom":"6628860798739990638","msgSeq":"5742","cntSeq":"0","chatType":2,"msgType":5,"subMsgType":12,"sendType":3,"senderUid":"","peerUid":"437136493","channelId":"","guildId":"","guildCode":"0","fromUid":"0","fromAppid":"0","msgTime":"1693223393","msgMeta":"0x","sendStatus":2,"sendMemberName":"","sendNickName":"","guildName":"","channelName":"","elements":[{"elementType":8,"elementId":"7272339095364512317","extBufForUI":"0x","textElement":null,"faceElement":null,"marketFaceElement":null,"replyElement":null,"picElement":null,"pttElement":null,"videoElement":null,"grayTipElement":{"subElementType":12,"revokeElement":null,"proclamationElement":null,"emojiReplyElement":null,"groupElement":null,"buddyElement":null,"feedMsgElement":null,"essenceElement":null,"groupNotifyElement":null,"buddyNotifyElement":null,"xmlElement":{"busiType":"1","busiId":"10145","c2cType":0,"serviceType":0,"ctrlFlag":7,"content":"<gtip align=\"center\"><qq uin=\"u_4B8ETD3ySVv--pNnQAupOA\" col=\"3\" jp=\"1042633805\" /><nor txt=\"邀请\"/><qq uin=\"u_iDVsVV8gskSMTB51hSDGVg\" col=\"3\" jp=\"1754196821\" /> <nor txt=\"加入了群聊。\"/> </gtip>","templId":"10179","seqId":"1313801018","templParam":{},"pbReserv":"0x","members":{}},"fileReceiptElement":null,"localGrayTipElement":null,"blockGrayTipElement":null,"aioOpGrayTipElement":null,"jsonGrayTipElement":null},"arkElement":null,"fileElement":null,"liveGiftElement":null,"markdownElement":null,"structLongMsgElement":null,"multiForwardMsgElement":null,"giphyElement":null,"walletElement":null,"inlineKeyboardElement":null,"textGiftElement":null,"calendarElement":null,"yoloGameResultElement":null,"avRecordElement":null}],"records":[],"emojiLikesList":[],"commentCnt":"0","directMsgFlag":0,"directMsgMembers":[],"peerName":"","freqLimitInfo":null,"editable":false,"avatarMeta":"","avatarPendant":"","feedId":"","roleId":"0","timeStamp":"0","clientIdentityInfo":null,"isImportMsg":false,"atType":0,"roleType":0,"fromChannelRoleInfo":{"roleId":"0","name":"","color":0},"fromGuildRoleInfo":{"roleId":"0","name":"","color":0},"levelRoleInfo":{"roleId":"0","name":"","color":0},"recallTime":"0","isOnlineMsg":false,"generalFlags":"0x","clientSeq":"0","fileGroupSize":null,"foldingInfo":null,"nameType":0,"avatarFlag":0,"anonymousExtInfo":null,"personalMedal":null,"roleManagementTag":null}]}}]]]
        } else if (args?.[1]?.[0]?.cmdName === "nodeIKernelGroupListener/onGroupSingleScreenNotifies") {
            // 群聊通知
        }
        else if (args?.[1]?.[0]?.cmdName === "nodeIKernelMsgListener/onAddSendMsg") {
            // 发送消息成功
            window.webContents.send('new-send-message-main', args);
        }
        if (!channel.includes("LiteLoader")) {
            if (args?.[1]?.account?.length > 0 && account == "0") {
                window.webContents.send('user-login-main', args[1]);
            }
            // output(channel, JSON.stringify(args));
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
    window.webContents.send = patched_send;
    function ipc_message(_, status, name, ...args) {
        if (name !== "___!log" && args[0][1] && args[0][1][0] != "info") {
            const event = args[0][0];
            const data = args[0][1];
            // [[{"type":"request","callbackId":"ad39f880-c2f6-47e2-954b-b7a2cab35e55","eventName":"ns-BusinessApi-4"},["fetchAuthData"]]]
            if (data && data[0] === "nodeIKernelMsgService/setMsgRead") {
                peer = data[1]?.peer;
                peer = {
                    uid: peer.peerUid,
                    guildId: peer.guildId,
                    chatType: peer.chatType == 1 ? "friend" : peer.chatType == 2 ? "group" : "others",
                }
                window.webContents.send('set_message-main');
            }
            if (data && data[0] === "nodeIKernelMsgService/sendMsg") {
                //output(JSON.stringify(args[0][1][2]["msgElements"][0]["textElement"]["content"]))
            }
            if (data && data[0] === "nodeIKernelMsgService/forwardMsgWithComment") {
                //output(JSON.stringify(args))
            }
            if (data && data[0] == "nodeIKernelMsgService/getRichMediaFilePathForGuild") {
                //output(JSON.stringify(args))
            }
            if (data && data[0] == "openExternalWindow") {
                // output(JSON.stringify(args))
            }
        }
        if (name === "___!add_message_list") {
            const peer = args[0][0]
            const message = args[0][1]
            const data = []
            i++;
            original_send.call(window.webContents, "IPC_DOWN_2", ...data);
            const data1 = []
            original_send.call(window.webContents, "IPC_DOWN_2", ...data1);
        }
    }
    const ipc_message_proxy = window.webContents._events["-ipc-message"]?.[0] || window.webContents._events["-ipc-message"];
    
    const proxyEvents = new Proxy(ipc_message_proxy, {
        // 拦截函数调用
        apply(target, thisArg, argumentsList) {
            /**
            if (argumentsList[3][1] && argumentsList[3][1][0] && argumentsList[3][1][0].includes("fetchGetHitEmotionsByWord")) {
                // 消息内容数据
                // 消息内容
                //output(content.msgElements[0].textElement.content)
                //content.msgElements[0].textElement.content = "测试"
                output("ipc-msg被拦截", argumentsList[3][1][1].inputWordInfo.word);
            }
             */
            ipc_message(...argumentsList);
            return target.apply(thisArg, argumentsList);
        }
    });
    if (window.webContents._events["-ipc-message"][0]) {
        window.webContents._events["-ipc-message"][0] = proxyEvents
    } else {
        window.webContents._events["-ipc-message"] = proxyEvents
    }
    window.webContents.on("ipc-message-sync", (event, channel, ...args) => {
        if (channel == "___!boot") {
            event.returnValue = {
                enabled: true,
                webContentsId: window.webContents.id.toString()
            };
        }
    });

    window.webContents.on('did-finish-load', () => {
        output('Page finished loading');
    });
}

function onLoad() {
    // 加载插件时触发
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
        "LiteLoader.LLAPI_PRE.set_id",
        (event, id, webContentsId) => {
            try {
                pendingCallbacks[id] = 'LL_DOWN_'+id;
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
    ipcMain.handle(
        "LiteLoader.LLAPI_PRE.exists",
        (event, path) => {
            try {
                return existsSync(path);
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

onLoad();

module.exports = {
    onBrowserWindowCreated
}

const exists = async (path) => {
    try {
                return existsSync(path);
            } catch (error) {
                console.log(error);
                return {};
            }
}


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
            raw: ele,
        };
    }
    constructMessage(msg) {
        const elements = (msg.elements).map((ele) => {
            if (ele.elementType == 1) return this.constructTextElement(ele);
            else if (ele.elementType == 2) {
                const element = this.constructImageElement(ele, msg);
                return element;
            } else if (ele.elementType == 6) return this.constructFaceElement(ele);
            else return this.constructRawElement(ele);
        });
        return {
            allDownloadedPromise: [],
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
