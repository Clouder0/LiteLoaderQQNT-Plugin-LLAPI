async function imc_handle(messages) {
    if(!messages) return;
    await Promise.allSettled(messages.map((msg) => handle_msg(msg)))
}

module.exports = { imc_handle }

/*
  {
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
*/

const backend = "http://127.0.0.1:3001"

async function handle_msg(msg) {
    if(!msg) return;
    if(msg.peer.chatType !== "group") return;
    const res = await sendPost(`${backend}/qqmessage`, msg)
    console.log("messages sent.");
}

/*
function sendPost(url, data) {
    console.log("sending post", data);
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        console.log("sent post");
    });
}
*/

async function sendPost(url, data) {
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
}
