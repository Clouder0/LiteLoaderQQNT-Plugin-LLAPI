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
    
    destructXmlElement(element) {
        return {
            elementType: 8,
            elementId: "",
            grayTipElement: {
                subElementType: 12,
                extBufForUI: "0x",
                xmlElement: {
                    busiType: "1",
                    busiId: "10145",
                    c2cType: 0,
                    serviceType: 0,
                    ctrlFlag: 7,
                    content: "<gtip align=\"center\"><qq uin=\"u_4B8ETD3ySVv--pNnQAupOA\" col=\"3\" jp=\"1042633805\" /><nor txt=\"邀请\"/><qq uin=\"u_iDVsVV8gskSMTB51hSDGVg\" col=\"3\" jp=\"1754196821\" /> <nor txt=\"加入了群聊。\"/> </gtip>",
                    templId: "10179",
                    seqId: "1313801018",
                    templParam: {},
                    pbReserv: "0x",
                    members: {}
                },
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

export const destructor = new Destructor();