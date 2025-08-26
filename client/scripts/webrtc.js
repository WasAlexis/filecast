/* setup webrtc config */

class ClientWebRTC {
    constructor(ws) {
        this.myClientId = '';
        this.peerConnection = new RTCPeerConnection();
        this.dataChannel = null;
        this.ws = ws;
        this.targetId = '';
    }

    onCandidate() {
        this.peerConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this.ws.send(JSON.stringify({ type: 'ice', target: this.targetId, candidate: e.candidate }));
            }
        };
    }

    createConnection() {
        this.dataChannel = this.peerConnection.createDataChannel('FileCast');

        this.dataChannel.onopen = () => {
            console.log('Datachannel is open');
        };

        this.dataChannel.onmessage = (e) => {
            const msg = e.data;
            console.log('Received message: ' + msg);
        };
    }

    joinToConnection() {
        this.peerConnection.ondatachannel = (e) => {
            this.dataChannel = e.channel;

            this.dataChannel.onopen = (e) => {
                console.log('Datachannel remote is open');
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
        this.ws.send(JSON.stringify({ type: 'offer', target: this.targetId, offer }));
        console.log('Send offer to ' + this.targetId);
    }

    async handleOffer(message) {
        /* when recibe a offer */
        this.joinToConnection();
        await this.peerConnection.setRemoteDescription(message.offer);
        this.onCandidate();
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.ws.send(JSON.stringify({ type: 'answer', target: message.from, answer }));
        console.log('Send answer to ' + message.from);
    }

    sendMessage(msg) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'message', message: msg }));
        } else {
            console.error("There is no connection yet");
        }
    }
}

export default ClientWebRTC;