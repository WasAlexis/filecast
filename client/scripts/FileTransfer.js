/**
 * File Transfer Handler
 * Manages file sending and receiving via WebRTC data channel
 */

import config from './config.js';
import notifications from './notifications.js';

class FileTransfer {
    constructor(dataChannel) {
        this.dataChannel = dataChannel;
        this.receivedChunks = [];
        this.incomingFileMeta = null;
        this.chunkSize = config.fileTransfer.chunkSize;
        this.onProgressCallback = null;
        this.currentTransfer = null;

        this.dataChannel.onmessage = (e) => {
            this.handleMessage(e);
        };
    }

    /**
     * Set progress callback
     * @param {function} callback - Progress callback function
     */
    setProgressCallback(callback) {
        this.onProgressCallback = callback;
    }

    /**
     * Send a file
     * @param {File} file - File to send
     */
    async sendFile(file) {
        // Validate file
        if (!file) {
            notifications.error('No se seleccionó ningún archivo');
            return;
        }

        if (file.size > config.fileTransfer.maxFileSize) {
            notifications.error(`El archivo es demasiado grande. Máximo: ${this.formatBytes(config.fileTransfer.maxFileSize)}`);
            return;
        }

        if (this.dataChannel.readyState !== 'open') {
            notifications.error('No hay conexión establecida con el dispositivo');
            return;
        }

        try {
            // Send metadata
            const metaData = {
                type: 'file-meta',
                name: file.name,
                size: file.size,
                mime: file.type
            };

            this.dataChannel.send(JSON.stringify(metaData));
            
            notifications.info(`Enviando: ${file.name} (${this.formatBytes(file.size)})`);

            // Track transfer
            this.currentTransfer = {
                fileName: file.name,
                totalSize: file.size,
                sentBytes: 0,
                startTime: Date.now()
            };

            let offset = 0;
            const reader = new FileReader();

            const readSlice = (o) => {
                const slice = file.slice(o, o + this.chunkSize);
                reader.readAsArrayBuffer(slice);
            };

            reader.onload = async (e) => {
                // Wait if buffer is too full
                while (this.dataChannel.bufferedAmount > config.fileTransfer.bufferThreshold) {
                    await new Promise(res => setTimeout(res, 10));
                }

                this.dataChannel.send(e.target.result);
                offset += e.target.result.byteLength;
                
                // Update progress
                this.currentTransfer.sentBytes = offset;
                const progress = (offset / file.size) * 100;
                
                if (this.onProgressCallback) {
                    this.onProgressCallback({
                        type: 'send',
                        fileName: file.name,
                        progress,
                        sentBytes: offset,
                        totalBytes: file.size,
                        speed: this.calculateSpeed(this.currentTransfer)
                    });
                }

                if (offset < file.size) {
                    readSlice(offset);
                } else {
                    this.dataChannel.send(JSON.stringify({ type: 'file-complete' }));
                    notifications.success(`Archivo enviado: ${file.name}`);
                    this.currentTransfer = null;
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                notifications.error('Error al leer el archivo');
                this.currentTransfer = null;
            };

            readSlice(0);
        } catch (error) {
            console.error('Error sending file:', error);
            notifications.error('Error al enviar el archivo');
            this.currentTransfer = null;
        }
    }

    /**
     * Handle incoming messages
     * @param {MessageEvent} event - Message event
     */
    handleMessage(event) {
        if (typeof event.data === 'string') {
            const msg = JSON.parse(event.data);

            if (msg.type === 'file-meta') {
                this.startReceiving(msg);
            } else if (msg.type === 'file-complete') {
                this.finishReceiving();
            }
        } else {
            // Binary data (file chunk)
            this.receivedChunks.push(event.data);
            
            if (this.incomingFileMeta && this.onProgressCallback) {
                const receivedBytes = this.receivedChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
                const progress = (receivedBytes / this.incomingFileMeta.size) * 100;
                
                this.onProgressCallback({
                    type: 'receive',
                    fileName: this.incomingFileMeta.name,
                    progress,
                    receivedBytes,
                    totalBytes: this.incomingFileMeta.size
                });
            }
        }
    }

    /**
     * Start receiving a file
     * @param {object} metadata - File metadata
     */
    startReceiving(metadata) {
        this.incomingFileMeta = metadata;
        this.receivedChunks = [];
        notifications.info(`Recibiendo: ${metadata.name} (${this.formatBytes(metadata.size)})`);
    }

    /**
     * Finish receiving a file and download it
     */
    finishReceiving() {
        if (!this.incomingFileMeta) {
            console.error('No file metadata found');
            return;
        }

        try {
            const blob = new Blob(this.receivedChunks, { type: this.incomingFileMeta.mime });
            this.downloadFile(blob, this.incomingFileMeta.name);
            
            notifications.success(`Archivo recibido: ${this.incomingFileMeta.name}`);
            
            this.receivedChunks = [];
            this.incomingFileMeta = null;
        } catch (error) {
            console.error('Error finishing file receive:', error);
            notifications.error('Error al recibir el archivo');
        }
    }

    /**
     * Download a file
     * @param {Blob} blob - File blob
     * @param {string} fileName - File name
     */
    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Calculate transfer speed
     * @param {object} transfer - Transfer object
     * @returns {number} Speed in bytes per second
     */
    calculateSpeed(transfer) {
        const elapsed = (Date.now() - transfer.startTime) / 1000; // seconds
        return elapsed > 0 ? transfer.sentBytes / elapsed : 0;
    }

    /**
     * Format bytes to human-readable string
     * @param {number} bytes - Bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

export default FileTransfer;
