/**
 * Client Configuration
 * Centralized configuration for the FileCast client
 */

const config = {
    // WebRTC Configuration
    webrtc: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
    },

    // File Transfer Configuration
    fileTransfer: {
        // Chunk size for file transfer (256KB)
        chunkSize: 256 * 1024,
        // Maximum file size (2GB)
        maxFileSize: 2 * 1024 * 1024 * 1024,
        // Buffer threshold before pausing (100MB)
        bufferThreshold: 100 * 1024 * 1024
    },

    // WebSocket Configuration
    websocket: {
        // Reconnection settings
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        // Heartbeat interval
        heartbeatInterval: 30000
    },

    // UI Configuration
    ui: {
        // Notification duration (ms)
        notificationDuration: 5000,
        // Animation duration (ms)
        animationDuration: 300,
        // Progress update interval (ms)
        progressUpdateInterval: 100
    },

    // Storage keys
    storage: {
        deviceName: 'deviceName',
        preferences: 'filecast_preferences'
    }
};

export default config;
