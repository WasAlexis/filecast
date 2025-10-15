/* transfer file logic */

class FileTransfer {
    constructor(dataChannel) {
        this.dataChannel = dataChannel;
        this.receivedChunks = [];
        this.incomingFileMeta = null;
        this.chunkSize = 1024 * 1024;
        this.messageSize = 64 * 1024;
        this.transferStartTime = null;
        this.bytesTransferred = 0;

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

        this.transferStartTime = Date.now();
        this.bytesTransferred = 0;

        this.dataChannel.send(JSON.stringify(metaData));

        let offset = 0;
        const reader = new FileReader();

        const readSlice = (o) => {
            const slice = file.slice(o, o + this.chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = async (e) => {
            const data = e.target.result;
            const dataView = new Uint8Array(data);
            
            for (let i = 0; i < dataView.length; i += this.messageSize) {
                while (this.dataChannel.bufferedAmount > 256 * 1024 * 1024) {
                    await new Promise(res => { setTimeout(res, 5); });
                }
                
                const chunk = dataView.slice(i, i + this.messageSize);
                this.dataChannel.send(chunk);
                offset += chunk.length;
                this.bytesTransferred = offset;

                if (this.bytesTransferred % (5 * 1024 * 1024) < this.messageSize) {
                    const elapsed = (Date.now() - this.transferStartTime) / 1000;
                    const speedMbps = (this.bytesTransferred * 8) / (elapsed * 1000000);
                    console.log(`${(this.bytesTransferred / 1024 / 1024).toFixed(2)}MB - ${speedMbps.toFixed(2)} Mbps`);
                }
            }

            if (offset < file.size) {
                readSlice(offset);
            } else {
                this.dataChannel.send(JSON.stringify({ type: "file-complete" }));
                
                const elapsed = (Date.now() - this.transferStartTime) / 1000;
                const speedMbps = (this.bytesTransferred * 8) / (elapsed * 1000000);
                console.log(`Transfer completed: ${(this.bytesTransferred / 1024 / 1024).toFixed(2)}MB en ${elapsed.toFixed(2)}s - ${speedMbps.toFixed(2)} Mbps`);
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
        
        const elapsed = (Date.now() - this.transferStartTime) / 1000;
        const speedMbps = (this.incomingFileMeta.size * 8) / (elapsed * 1000000);
        console.log(`Transfer completed: ${(this.incomingFileMeta.size / 1024 / 1024).toFixed(2)}MB en ${elapsed.toFixed(2)}s - ${speedMbps.toFixed(2)} Mbps`);
        
        this.downloadFile(blob, this.incomingFileMeta.name);
        this.receivedChunks = [];
        this.incomingFileMeta = null;
    }

    handleMessage(event) {
        if (typeof event.data === "string") {
            const msg = JSON.parse(event.data);

            if (msg.type === "file-meta") {
                this.transferStartTime = Date.now();
                this.incomingFileMeta = msg;
                this.receivedChunks = [];
                this.bytesTransferred = 0;
                console.log(`Receiving: ${msg.name} (${(msg.size / 1024 / 1024).toFixed(2)}MB)`);
            } else if (msg.type === "file-complete") {
                this.finishReceiving();
            }
        } else {
            this.receivedChunks.push(event.data);
            this.bytesTransferred += event.data.byteLength;

            if (this.bytesTransferred % (5 * 1024 * 1024) < event.data.byteLength) {
                const elapsed = (Date.now() - this.transferStartTime) / 1000;
                const speedMbps = (this.bytesTransferred * 8) / (elapsed * 1000000);
                console.log(`${(this.bytesTransferred / 1024 / 1024).toFixed(2)}MB - ${speedMbps.toFixed(2)} Mbps`);
            }
        }
    }
}

export default FileTransfer;