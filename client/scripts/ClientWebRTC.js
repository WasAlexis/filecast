/**
 * WebRTC Client
 * Manages WebRTC peer connections and data channels
 */

import FileTransfer from './FileTransfer.js';
import config from './config.js';
import notifications from './notifications.js';

class ClientWebRTC {
    constructor(ws) {
        this.myClientId = '';
        this.peerConnection = null;
        this.dataChannel = null;
        this.ws = ws;
        this.targetId = '';
        this.fileTransfer = null;
        this.connectionState = 'disconnected';
        this.onProgressCallback = null;
    }

    /**
     * Set progress callback for file transfers
     * @param {function} callback - Progress callback
     */
    setProgressCallback(callback) {
        this.onProgressCallback = callback;
    }

    /**
     * Initialize peer connection
     */
    initPeerConnection() {
        if (this.peerConnection) {
            this.closePeerConnection();
        }

        this.peerConnection = new RTCPeerConnection({
            iceServers: config.webrtc.iceServers,
            iceCandidatePoolSize: config.webrtc.iceCandidatePoolSize
        });

        // Monitor connection state
        this.peerConnection.onconnectionstatechange = () => {
            this.connectionState = this.peerConnection.connectionState;
            console.log('Connection state:', this.connectionState);

            switch (this.connectionState) {
                case 'connected':
                    notifications.success('Conexión establecida');
                    break;
                case 'disconnected':
                    notifications.warning('Conexión perdida');
                    break;
                case 'failed':
                    notifications.error('Falló la conexión');
                    this.closePeerConnection();
                    break;
                case 'closed':
                    console.log('Connection closed');
                    break;
            }
        };

        // Monitor ICE connection state
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        };
    }

    /**
     * Setup file transfer handler
     */
    fileTransferHandle() {
        this.fileTransfer = new FileTransfer(this.dataChannel);
        
        if (this.onProgressCallback) {
            this.fileTransfer.setProgressCallback(this.onProgressCallback);
        }
    }

    /**
     * Setup ICE candidate handler
     */
    onCandidate() {
        this.peerConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this.ws.send({
                    signal: 'ice',
                    target: this.targetId,
                    candidate: e.candidate
                });
            }
        };
    }

    /**
     * Create data channel and initiate connection
     */
    createConnection() {
        this.dataChannel = this.peerConnection.createDataChannel('FileCast', {
            ordered: true
        });
        this.dataChannel.binaryType = 'arraybuffer';

        this.dataChannel.onopen = () => {
            console.log('Data channel is open');
            this.fileTransferHandle();
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            notifications.error('Error en el canal de datos');
        };
    }

    /**
     * Setup data channel for incoming connection
     */
    joinToConnection() {
        this.peerConnection.ondatachannel = (e) => {
            this.dataChannel = e.channel;
            this.dataChannel.binaryType = 'arraybuffer';

            this.dataChannel.onopen = () => {
                console.log('Remote data channel is open');
                this.fileTransferHandle();
            };

            this.dataChannel.onclose = () => {
                console.log('Remote data channel closed');
            };

            this.dataChannel.onerror = (error) => {
                console.error('Remote data channel error:', error);
                notifications.error('Error en el canal de datos');
            };
        };
    }

    /**
     * Send offer to peer
     */
    async sendOffer() {
        try {
            this.initPeerConnection();
            this.createConnection();
            
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            this.onCandidate();
            
            this.ws.send({
                signal: 'offer',
                target: this.targetId,
                offer
            });
            
            console.log('Sent offer to', this.targetId);
        } catch (error) {
            console.error('Error sending offer:', error);
            notifications.error('Error al establecer conexión');
        }
    }

    /**
     * Handle incoming offer
     * @param {object} message - Offer message
     */
    async handleOffer(message) {
        try {
            this.initPeerConnection();
            this.targetId = message.from;
            
            this.joinToConnection();
            
            await this.peerConnection.setRemoteDescription(message.offer);
            this.onCandidate();
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            this.ws.send({
                signal: 'answer',
                target: message.from,
                answer
            });
            
            console.log('Sent answer to', message.from);
        } catch (error) {
            console.error('Error handling offer:', error);
            notifications.error('Error al responder conexión');
        }
    }

    /**
     * Handle incoming answer
     * @param {object} answer - Answer object
     */
    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(answer);
            console.log('Remote description set');
        } catch (error) {
            console.error('Error handling answer:', error);
            notifications.error('Error al procesar respuesta');
        }
    }

    /**
     * Handle incoming ICE candidate
     * @param {RTCIceCandidate} candidate - ICE candidate
     */
    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE candidate added');
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    /**
     * Send file to peer
     * @param {File} file - File to send
     */
    sendFile(file) {
        if (!this.fileTransfer) {
            notifications.error('No hay conexión establecida');
            return;
        }

        if (this.dataChannel?.readyState !== 'open') {
            notifications.error('El canal de datos no está listo');
            return;
        }

        this.fileTransfer.sendFile(file);
    }

    /**
     * Close peer connection
     */
    closePeerConnection() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.fileTransfer = null;
        this.targetId = '';
        this.connectionState = 'disconnected';
    }

    /**
     * Get connection state
     * @returns {string} Connection state
     */
    getConnectionState() {
        return this.connectionState;
    }

    /**
     * Check if connected to a peer
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.connectionState === 'connected' && 
               this.dataChannel?.readyState === 'open';
    }
}

export default ClientWebRTC;
