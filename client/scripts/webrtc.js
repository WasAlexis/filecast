/* setup webrtc config */

import FileTransfer from "./transfer.js";

class ClientWebRTC {
    constructor(ws) {
        this.myClientId = '';
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{urls: "stun:stun.l.google.com:19302"}]
        });
        this.dataChannel = null;
        this.ws = ws;
        this.targetId = '';
        this.fileTransfer = null;
    }

    fileTransferHandle() {
        this.fileTransfer = new FileTransfer(this.dataChannel);
    }

    onCandidate() {
        this.peerConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this.ws.send(JSON.stringify({ signal: 'ice', target: this.targetId, candidate: e.candidate }));
            }
        };
    }

    createConnection() {
        this.dataChannel = this.peerConnection.createDataChannel('FileCast');
        this.dataChannel.binaryType = "arraybuffer";

        this.dataChannel.onopen = () => {
            console.log('Datachannel is open');
            this.fileTransferHandle();
        };

        this.dataChannel.onmessage = (e) => {
            const msg = e.data;
            console.log('Received message: ' + msg);
        };
    }

    joinToConnection() {
        this.peerConnection.ondatachannel = (e) => {
            this.dataChannel = e.channel;
            this.dataChannel.binaryType = "arraybuffer";

            this.dataChannel.onopen = (e) => {
                console.log('Datachannel remote is open');
                this.fileTransferHandle();
            };

            this.dataChannel.onmessage = (e) => {
                console.log('Message from peer remote: ' + e.data);
            };
        }
    }

    async sendOffer() {
        this.createConnection();
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.onCandidate();
        this.ws.send(JSON.stringify({ signal: 'offer', target: this.targetId, offer }));
        console.log('Send offer to ' + this.targetId);
    }

    async handleOffer(message) {
        /* when recibe a offer */
        this.joinToConnection();
        await this.peerConnection.setRemoteDescription(message.offer);
        this.onCandidate();
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.ws.send(JSON.stringify({ signal: 'answer', target: message.from, answer }));
        console.log('Send answer to ' + message.from);
    }

    sendMessage(msg) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'message', message: msg }));
        } else {
            console.error("There is no connection yet");
        }
    }

    sendFile(file) {
        if (this.fileTransfer && this.dataChannel.readyState === "open") {
            this.fileTransfer.sendFile(file);
        } else {
            console.error("File wasn't send");
        }
    }
}

export default ClientWebRTC;