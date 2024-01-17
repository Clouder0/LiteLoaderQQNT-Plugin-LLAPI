const exists = LLAPI_PRE.exists;

class Media {
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
                    downloadType: 2,
                    filePath: filePath,
                },
            },
            undefined,
        ]);
    }
}

export const media = new Media();
