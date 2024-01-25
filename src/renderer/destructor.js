/*
 * @Date: 2024-01-17 16:33:45
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2024-01-25 19:37:57
 */
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
        return []
    }
}

export const destructor = new Destructor();