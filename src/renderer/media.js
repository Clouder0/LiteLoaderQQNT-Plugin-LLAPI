/*
 * @Date: 2024-01-17 16:34:19
 * @LastEditors: Night-stars-1 nujj1042633805@gmail.com
 * @LastEditTime: 2024-01-25 19:36:55
 */
import { ntCall } from "./utils.js";

const exists = LLAPI_PRE.exists;

class Media {
    async prepareVoiceElement(file) {
        // const type = await ntCall("ns-fsApi", "getFileType", [file]);
        const ext = file.split(".").pop();  // 支持amr
        const md5 = await ntCall("ns-FsApi", "getFileMd5", [file]);
        const fileName = `${md5}.${ext}`;
        const filePath = await ntCall("ns-ntApi", "nodeIKernelMsgService/getRichMediaFilePathForGuild", [
            {path_info:{
                md5HexStr: md5,
                fileName: fileName,
                elementType: 4,
                elementSubType: 0,
                thumbSize: 0,
                needCreate: true,
                fileType: 1,  // 这个未知
                downloadType: 1,
                file_uuid: ""
            }}

        ]);
        await ntCall("ns-FsApi", "copyFile", [{fromPath: file, toPath: filePath}]);
        const fileSize = await ntCall("ns-FsApi", "getFileSize", [file]);
        return {
            canConvert2Text: true,
            fileName: fileName,
            filePath: filePath,
            md5HexStr: md5,
            fileId: 0,
            fileSubId: '',
            fileSize: fileSize,
            duration: 2,
            formatType: 1,
            voiceType: 1,
            voiceChangeType: 0,
            playState: 1,
            waveAmplitudes: [
                99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
            ],
        }
    }

    async prepareImageElement(file) {

        const type = await ntCall("ns-FsApi", "getFileType", [file]);
        const md5 = await ntCall("ns-FsApi", "getFileMd5", [file]);
        const fileName = `${md5}.${type.ext}`;
        const filePath = await ntCall("ns-ntApi", "nodeIKernelMsgService/getRichMediaFilePathForGuild", [
            {
                path_info: {
                    md5HexStr: md5,
                    fileName: fileName,
                    elementType: 2,
                    elementSubType: 0,
                    thumbSize: 0,
                    needCreate: true,
                    downloadType: 1,
                    file_uuid: ""
                }
            }
        ]);
        await ntCall("ns-FsApi", "copyFile", [{ fromPath: file, toPath: filePath }]);
        const imageSize = await ntCall("ns-FsApi", "getImageSizeFromPath", [file]);
        const fileSize = await ntCall("ns-FsApi", "getFileSize", [file]);
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
                    downloadType: 1,
                    filePath: filePath,
                },
            },
            undefined,
        ]);
    }
}

export const media = new Media();
