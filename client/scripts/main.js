/**
 * Main Client Application
 * Entry point for FileCast client
 */

import ws from './wsClient.js';
import ClientWebRTC from './ClientWebRTC.js';
import { 
    renderDevicesOnScreen, 
    getSelectedFile, 
    getDeviceName, 
    selectDevice,
    updateProgress,
    showConnectionStatus
} from './ui.js';
import notifications from './notifications.js';
import config from './config.js';

// Initialize WebRTC client
const clientRTC = new ClientWebRTC(ws);

// Setup progress callback
clientRTC.setProgressCallback((progressData) => {
    updateProgress(progressData);
});

/**
 * Handle incoming WebSocket messages
 */
ws.addEventListener('message', async (e) => {
    if (typeof e.data !== 'string') {
        console.warn('Received non-string data');
        return;
    }

    try {
        const msg = JSON.parse(e.data);

        switch (msg.signal) {
            case 'assignId':
                handleAssignId(msg);
                break;

            case 'updateDeviceList':
                handleUpdateDeviceList(msg);
                break;

            case 'offer':
                handleOffer(msg);
                break;

            case 'answer':
                handleAnswer(msg);
                break;

            case 'ice':
                handleIceCandidate(msg);
                break;

            case 'error':
                handleError(msg);
                break;

            default:
                console.warn('Unknown signal type:', msg.signal);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});

/**
 * Handle ID assignment from server
 * @param {object} msg - Message object
 */
function handleAssignId(msg) {
    clientRTC.myClientId = msg.id;
    console.log('Assigned ID:', clientRTC.myClientId);
    showConnectionStatus('Conectado');
}

/**
 * Handle device list update
 * @param {object} msg - Message object
 */
function handleUpdateDeviceList(msg) {
    renderDevicesOnScreen(msg.devicesOnline, clientRTC.myClientId);
    console.log('Device list updated:', msg.devicesOnline.length, 'devices');
}

/**
 * Handle incoming WebRTC offer
 * @param {object} msg - Message object
 */
async function handleOffer(msg) {
    console.log('Received offer from:', msg.from);
    try {
        await clientRTC.handleOffer(msg);
    } catch (error) {
        console.error('Error handling offer:', error);
        notifications.error('Error al procesar oferta de conexión');
    }
}

/**
 * Handle incoming WebRTC answer
 * @param {object} msg - Message object
 */
async function handleAnswer(msg) {
    console.log('Received answer from:', msg.from);
    try {
        await clientRTC.handleAnswer(msg.answer);
    } catch (error) {
        console.error('Error handling answer:', error);
        notifications.error('Error al procesar respuesta de conexión');
    }
}

/**
 * Handle incoming ICE candidate
 * @param {object} msg - Message object
 */
async function handleIceCandidate(msg) {
    console.log('Received ICE candidate');
    try {
        await clientRTC.handleIceCandidate(msg.candidate);
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
}

/**
 * Handle error message from server
 * @param {object} msg - Message object
 */
function handleError(msg) {
    console.error('Server error:', msg.message);
    notifications.error(msg.message || 'Error del servidor');
}

/**
 * Select a peer device to connect to
 * @param {string} id - Device ID
 */
function selectPeer(id) {
    if (!id) {
        notifications.warning('ID de dispositivo inválido');
        return;
    }

    if (id === clientRTC.myClientId) {
        notifications.warning('No puedes conectarte a ti mismo');
        return;
    }

    clientRTC.targetId = id;
    selectDevice(id);
    
    // Initiate connection
    clientRTC.sendOffer();
    
    console.log('Selected peer:', id);
}

// Make selectPeer available globally for onclick handlers
window.selectPeer = selectPeer;

/**
 * Send file to selected peer
 */
function sendToPeer() {
    // Check if peer is selected
    if (!clientRTC.targetId) {
        notifications.warning('Selecciona un dispositivo primero');
        return;
    }

    // Check if connected
    if (!clientRTC.isConnected()) {
        notifications.warning('Estableciendo conexión...');
        // Retry after a short delay
        setTimeout(sendToPeer, 1000);
        return;
    }

    // Get selected file
    const file = getSelectedFile();
    
    if (!file) {
        notifications.warning('Selecciona un archivo para enviar');
        return;
    }

    // Validate file size
    if (file.size > config.fileTransfer.maxFileSize) {
        notifications.error(`Archivo demasiado grande. Máximo: ${formatBytes(config.fileTransfer.maxFileSize)}`);
        return;
    }

    // Send file
    clientRTC.sendFile(file);
}

// Make sendToPeer available globally
window.sendToPeer = sendToPeer;

/**
 * Change current device name
 */
function changeMyName() {
    const newName = getDeviceName();
    
    if (!newName || newName.trim() === '') {
        window.localStorage.removeItem(config.storage.deviceName);
        return;
    }

    if (!clientRTC.myClientId) {
        console.warn('Client ID not assigned yet');
        return;
    }

    // Send rename request
    ws.send({
        signal: 'rename',
        newName: newName.trim(),
        id: clientRTC.myClientId
    });

    // Save to local storage
    window.localStorage.setItem(config.storage.deviceName, newName.trim());
    
    notifications.success('Nombre actualizado');
}

// Make changeMyName available globally
window.changeMyName = changeMyName;

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    clientRTC.closePeerConnection();
    ws.close();
});

// Log application start
console.log('FileCast client initialized');
