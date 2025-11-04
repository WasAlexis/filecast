/**
 * FileCast Server
 * Main server entry point
 */

import http from 'node:http';
import { WebSocketServer } from 'ws';
import serveFile from './handlers/httpHandler.js';
import setupWebSocketServer from './handlers/wsHandler.js';
import config from './config/config.js';
import { info } from './utils/logger.js';

const { port, host } = config.server;

// Create HTTP server
const server = http.createServer(serveFile);

// Create WebSocket server
const wss = new WebSocketServer({ 
    server,
    maxPayload: config.websocket.maxPayload
});

// Setup WebSocket handlers
setupWebSocketServer(wss);

// Start server
server.listen(port, host, () => {
    info(`FileCast server running`, {
        url: `http://localhost:${port}`,
        environment: config.server.environment,
        maxDevices: config.device.maxDevices
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    info('SIGINT received, shutting down gracefully');
    server.close(() => {
        info('Server closed');
        process.exit(0);
    });
});