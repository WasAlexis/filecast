/**
 * WebSocket Utility Functions
 * Helper functions for WebSocket operations
 */

import { debug } from './logger.js';

/**
 * Broadcast a message to all connected clients
 * @param {WebSocketServer} wss - WebSocket server instance
 * @param {object} data - Data to broadcast
 * @param {WebSocket} excludeSocket - Socket to exclude from broadcast
 */
function broadcast(wss, data, excludeSocket = null) {
    const content = JSON.stringify(data);
    let sentCount = 0;
    
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client !== excludeSocket) { // 1 = OPEN
            try {
                client.send(content);
                sentCount++;
            } catch (err) {
                // Log error but continue broadcasting to other clients
                debug('Failed to send to client', { error: err.message });
            }
        }
    });
    
    debug('Broadcast complete', { recipients: sentCount, signal: data.signal });
}

/**
 * Sync device list with all connected clients
 * @param {WebSocketServer} wss - WebSocket server instance
 * @param {DeviceHub} deviceHub - Device hub instance
 */
function syncDevices(wss, deviceHub) {
    const message = {
        signal: 'updateDeviceList',
        devicesOnline: deviceHub.listDevices()
    };
    
    broadcast(wss, message);
    debug('Device list synced', { deviceCount: deviceHub.getDeviceCount() });
}

/**
 * Send message to specific client
 * @param {WebSocket} socket - Target socket
 * @param {object} data - Data to send
 * @returns {boolean} True if message was sent successfully
 */
function sendToClient(socket, data) {
    if (!socket || socket.readyState !== 1) { // 1 = OPEN
        return false;
    }
    
    try {
        socket.send(JSON.stringify(data));
        return true;
    } catch (err) {
        debug('Failed to send to client', { error: err.message });
        return false;
    }
}

/**
 * Get client IP address from socket
 * @param {WebSocket} socket - WebSocket connection
 * @returns {string} Client IP address
 */
function getClientIP(socket) {
    // Try to get IP from various headers (for proxied connections)
    const request = socket._socket;
    return request.remoteAddress || 'unknown';
}

export { broadcast, syncDevices, sendToClient, getClientIP };