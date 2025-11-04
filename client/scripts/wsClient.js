/**
 * WebSocket Client
 * Manages WebSocket connection with automatic reconnection
 */

import { loadName } from './ui.js';
import notifications from './notifications.js';
import config from './config.js';

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.isIntentionalClose = false;
        this.messageQueue = [];
        this.connect();
    }

    /**
     * Establish WebSocket connection
     */
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://${window.location.host}`;

        try {
            this.ws = new WebSocket(url);
            this.setupEventHandlers();
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            this.scheduleReconnect();
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        this.ws.addEventListener('open', () => {
            console.log('Connected to FileCast');
            this.reconnectAttempts = 0;
            notifications.success('Conectado al servidor');

            // Send join message
            const deviceName = window.localStorage.getItem(config.storage.deviceName) || 'Unknown';
            if (deviceName !== 'Unknown') {
                loadName(deviceName);
            }

            this.send({ signal: 'device-join', deviceName });

            // Send queued messages
            this.flushMessageQueue();
        });

        this.ws.addEventListener('close', (event) => {
            console.log('Disconnected from server', event.code, event.reason);

            if (!this.isIntentionalClose) {
                notifications.warning('Conexión perdida. Reconectando...');
                this.scheduleReconnect();
            }
        });

        this.ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            notifications.error('Error de conexión');
        });
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= config.websocket.maxReconnectAttempts) {
            notifications.error('No se pudo conectar al servidor. Por favor recarga la página.');
            return;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnect attempt ${this.reconnectAttempts}/${config.websocket.maxReconnectAttempts}`);
            this.connect();
        }, config.websocket.reconnectInterval);
    }

    /**
     * Send message to server
     * @param {object} data - Data to send
     * @returns {boolean} True if sent successfully
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(data));
                return true;
            } catch (err) {
                console.error('Failed to send message:', err);
                this.messageQueue.push(data);
                return false;
            }
        } else {
            // Queue message for later
            this.messageQueue.push(data);
            return false;
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
            const data = this.messageQueue.shift();
            this.send(data);
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {function} handler - Event handler
     */
    addEventListener(event, handler) {
        if (this.ws) {
            this.ws.addEventListener(event, handler);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {function} handler - Event handler
     */
    removeEventListener(event, handler) {
        if (this.ws) {
            this.ws.removeEventListener(event, handler);
        }
    }

    /**
     * Close WebSocket connection
     */
    close() {
        this.isIntentionalClose = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.ws) {
            this.ws.close();
        }
    }

    /**
     * Get connection state
     * @returns {number} WebSocket ready state
     */
    getReadyState() {
        return this.ws ? this.ws.readyState : WebSocket.CLOSED;
    }

    /**
     * Check if connected
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Create singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
