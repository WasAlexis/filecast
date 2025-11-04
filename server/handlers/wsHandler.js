/**
 * WebSocket Handler
 * Handles WebSocket connections and messages
 */

import DeviceHub from '../services/DeviceHub.js';
import { syncDevices, sendToClient, getClientIP } from '../utils/wsUtils.js';
import { validateMessage } from '../utils/validators.js';
import { info, warn, error } from '../utils/logger.js';
import rateLimiter from '../utils/rateLimiter.js';
import config from '../config/config.js';

/**
 * Setup WebSocket server with handlers
 * @param {WebSocketServer} wss - WebSocket server instance
 */
function setupWebSocketServer(wss) {
    const deviceHub = new DeviceHub();

    // Periodic cleanup of inactive devices
    const cleanupInterval = setInterval(() => {
        const removed = deviceHub.cleanupInactiveDevices();
        if (removed > 0) {
            syncDevices(wss, deviceHub);
        }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Cleanup on server shutdown
    wss.on('close', () => {
        clearInterval(cleanupInterval);
    });

    wss.on('connection', (socket, request) => {
        const clientIP = getClientIP(socket);
        
        // Check connection limit
        if (rateLimiter.checkConnectionLimit(clientIP)) {
            warn('Connection rejected: IP limit exceeded', { ip: clientIP });
            socket.close(1008, 'Too many connections from this IP');
            return;
        }

        rateLimiter.incrementConnection(clientIP);
        info('New client connected', { ip: clientIP });

        let device = null;
        let deviceId = null;

        /**
         * Handle incoming WebSocket messages
         */
        socket.on('message', (message) => {
            try {
                // Parse message
                let msg;
                try {
                    msg = JSON.parse(message);
                } catch (parseError) {
                    warn('Invalid JSON received', { error: parseError.message });
                    sendToClient(socket, { 
                        signal: 'error', 
                        message: 'Invalid message format' 
                    });
                    return;
                }

                // Validate message structure
                if (config.security.enableValidation) {
                    const validation = validateMessage(msg);
                    if (!validation.valid) {
                        warn('Message validation failed', { 
                            error: validation.error,
                            signal: msg.signal 
                        });
                        sendToClient(socket, { 
                            signal: 'error', 
                            message: validation.error 
                        });
                        return;
                    }
                }

                // Check rate limit (except for initial join)
                if (deviceId && rateLimiter.checkMessageRateLimit(deviceId)) {
                    warn('Rate limit exceeded', { deviceId });
                    sendToClient(socket, { 
                        signal: 'error', 
                        message: 'Rate limit exceeded. Please slow down.' 
                    });
                    return;
                }

                // Update device activity
                if (deviceId) {
                    deviceHub.updateDeviceActivity(deviceId);
                }

                // Handle different message types
                switch (msg.signal) {
                    case 'device-join':
                        handleDeviceJoin(msg, socket, deviceHub, wss);
                        break;

                    case 'rename':
                        handleRename(msg, deviceHub, wss);
                        break;

                    case 'offer':
                    case 'answer':
                    case 'ice':
                        handleWebRTCSignaling(msg, device, deviceHub);
                        break;

                    default:
                        warn('Unknown signal type', { signal: msg.signal });
                        sendToClient(socket, { 
                            signal: 'error', 
                            message: 'Unknown signal type' 
                        });
                        break;
                }
            } catch (err) {
                error('Error handling message', err);
                sendToClient(socket, { 
                    signal: 'error', 
                    message: 'Internal server error' 
                });
            }
        });

        /**
         * Handle device join
         */
        function handleDeviceJoin(msg, socket, deviceHub, wss) {
            device = deviceHub.addDevice(msg.deviceName, socket);
            
            if (!device) {
                sendToClient(socket, { 
                    signal: 'error', 
                    message: 'Server is full. Please try again later.' 
                });
                socket.close(1008, 'Server full');
                return;
            }

            deviceId = device.deviceId;
            
            sendToClient(socket, { 
                signal: 'assignId', 
                id: device.deviceId 
            });
            
            syncDevices(wss, deviceHub);
            
            info('Device joined', { 
                deviceId: device.deviceId, 
                deviceName: device.deviceName 
            });
        }

        /**
         * Handle device rename
         */
        function handleRename(msg, deviceHub, wss) {
            const success = deviceHub.renameDevice(msg.id, msg.newName);
            
            if (success) {
                syncDevices(wss, deviceHub);
            } else {
                sendToClient(socket, { 
                    signal: 'error', 
                    message: 'Failed to rename device' 
                });
            }
        }

        /**
         * Handle WebRTC signaling (offer, answer, ICE)
         */
        function handleWebRTCSignaling(msg, sourceDevice, deviceHub) {
            if (!sourceDevice) {
                warn('WebRTC signaling from unregistered device');
                return;
            }

            const targetDevice = deviceHub.getDevice(msg.target);
            
            if (!targetDevice) {
                warn('Target device not found', { 
                    target: msg.target,
                    signal: msg.signal 
                });
                sendToClient(socket, { 
                    signal: 'error', 
                    message: 'Target device not found' 
                });
                return;
            }

            const forwardMsg = {
                ...msg,
                from: sourceDevice.deviceId
            };

            const sent = sendToClient(targetDevice.socket, forwardMsg);
            
            if (sent) {
                info('WebRTC signal forwarded', { 
                    signal: msg.signal,
                    from: sourceDevice.deviceId,
                    to: msg.target
                });
            }
        }

        /**
         * Handle client disconnect
         */
        socket.on('close', (code, reason) => {
            info('Client disconnected', { 
                ip: clientIP,
                deviceId,
                code,
                reason: reason.toString()
            });

            if (deviceId) {
                deviceHub.removeDevice(deviceId);
                rateLimiter.cleanup(deviceId);
                syncDevices(wss, deviceHub);
            }

            rateLimiter.decrementConnection(clientIP);
        });

        /**
         * Handle WebSocket errors
         */
        socket.on('error', (err) => {
            error('WebSocket error', err);
        });
    });

    info('WebSocket server setup complete');
}

export default setupWebSocketServer;