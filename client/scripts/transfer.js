/* transfer file logic */

const chunkSize = 16 * 1024; // 16KB/package

class FileTransfer {
    constructor(dataChannel) {
        this.dataChannel = dataChannel;
        this.receivedChunks = [];
        this.incomingFileMeta = null;

        this.dataChannel.onmessage = (e) => {
            this.handleMessage(e);
        };
    }

    async sendFile(file) {
        const metaData = {
            type: "file-meta",
            name: file.name,
            size: file.size,
            mime: file.type
        };

        this.dataChannel.send(JSON.stringify(metaData));

        let offset = 0;
        const reader = new FileReader();

        const readSlice = (o) => {
            const slice = file.slice(o, o + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = async (e) => {
            while (this.dataChannel.bufferedAmount > 4 * 1024 * 1024) {
                await new Promise(res => { setTimeout(res, 50); });
            }
            this.dataChannel.send(e.target.result);
            offset += e.target.result.byteLength;

            console.log('Sending file');

            if (offset < file.size) {
                readSlice(offset);
            } else {
                this.dataChannel.send(JSON.stringify({ type: "file-complete" }));
                console.log("Send completed");
            }
        };
        readSlice(0);
    }

    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const ancor = document.createElement("a");
        ancor.href = url;
        ancor.download = fileName;
        ancor.click();
        URL.revokeObjectURL(url);
    }

    finishReceiving() {
        const blob = new Blob(this.receivedChunks, { type: this.incomingFileMeta.mime });
        this.downloadFile(blob, this.incomingFileMeta.name);
        this.receivedChunks = [];
        this.incomingFileMeta = null;
    }

    handleMessage(event) {
        if (typeof event.data === "string") {
            const msg = JSON.parse(event.data);

            if (msg.type === "file-meta") {
                this.incomingFileMeta = msg;
                this.receivedChunks = [];
            } else if (msg.type === "file-complete") {
                this.finishReceiving();
            }
        } else {
            this.receivedChunks.push(event.data);
        }
    }
}

export default FileTransfer;