/**
 * Server Configuration
 * Centralized configuration management for the FileCast server
 */

const config = {
    // Server settings
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        environment: process.env.NODE_ENV || 'development'
    },

    // WebSocket settings
    websocket: {
        // Maximum message size (10MB)
        maxPayload: 10 * 1024 * 1024,
        // Client heartbeat interval (30 seconds)
        heartbeatInterval: 30000,
        // Client timeout (60 seconds)
        clientTimeout: 60000,
        // Maximum connections per IP
        maxConnectionsPerIP: 5
    },

    // Rate limiting settings
    rateLimit: {
        // Maximum messages per minute per client
        messagesPerMinute: 60,
        // Time window for rate limiting (in ms)
        windowMs: 60000
    },

    // File transfer settings
    fileTransfer: {
        // Maximum file size (2GB)
        maxFileSize: 2 * 1024 * 1024 * 1024,
        // Chunk size for file transfer
        chunkSize: 256 * 1024, // 256KB
        // Maximum concurrent transfers
        maxConcurrentTransfers: 3
    },

    // Device settings
    device: {
        // Maximum device name length
        maxNameLength: 50,
        // Default device name
        defaultName: 'Unknown Device',
        // Maximum devices in hub
        maxDevices: 100
    },

    // Security settings
    security: {
        // Enable CORS
        enableCORS: process.env.ENABLE_CORS === 'true',
        // Allowed origins (comma-separated)
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
        // Enable message validation
        enableValidation: true,
        // Sanitize inputs
        sanitizeInputs: true
    },

    // Logging settings
    logging: {
        // Log level: 'debug', 'info', 'warn', 'error'
        level: process.env.LOG_LEVEL || 'info',
        // Enable console logging
        console: true,
        // Enable file logging
        file: process.env.ENABLE_FILE_LOGGING === 'true',
        // Log file path
        filePath: process.env.LOG_FILE_PATH || './logs/filecast.log'
    }
};

export default config;
