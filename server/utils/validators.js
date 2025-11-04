/**
 * Input Validation and Sanitization
 * Validates and sanitizes user inputs to prevent security vulnerabilities
 */

import config from '../config/config.js';

/**
 * Sanitize device name
 * @param {string} name - Device name to sanitize
 * @returns {string} Sanitized device name
 */
export function sanitizeDeviceName(name) {
    if (typeof name !== 'string') {
        return config.device.defaultName;
    }

    // Remove potentially dangerous characters
    let sanitized = name
        .replace(/[<>\"'&]/g, '') // Remove HTML/script injection chars
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();

    // Limit length
    if (sanitized.length > config.device.maxNameLength) {
        sanitized = sanitized.substring(0, config.device.maxNameLength);
    }

    // Return default if empty after sanitization
    return sanitized || config.device.defaultName;
}

/**
 * Validate WebSocket message structure
 * @param {object} message - Message to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateMessage(message) {
    if (!message || typeof message !== 'object') {
        return { valid: false, error: 'Invalid message format' };
    }

    if (!message.signal || typeof message.signal !== 'string') {
        return { valid: false, error: 'Missing or invalid signal type' };
    }

    // Validate signal-specific fields
    switch (message.signal) {
        case 'device-join':
            if (!message.deviceName || typeof message.deviceName !== 'string') {
                return { valid: false, error: 'Missing or invalid deviceName' };
            }
            break;

        case 'rename':
            if (!message.id || typeof message.id !== 'string') {
                return { valid: false, error: 'Missing or invalid device id' };
            }
            if (!message.newName || typeof message.newName !== 'string') {
                return { valid: false, error: 'Missing or invalid newName' };
            }
            break;

        case 'offer':
        case 'answer':
            if (!message.target || typeof message.target !== 'string') {
                return { valid: false, error: 'Missing or invalid target' };
            }
            if (!message[message.signal]) {
                return { valid: false, error: `Missing ${message.signal} data` };
            }
            break;

        case 'ice':
            if (!message.target || typeof message.target !== 'string') {
                return { valid: false, error: 'Missing or invalid target' };
            }
            if (!message.candidate) {
                return { valid: false, error: 'Missing candidate data' };
            }
            break;

        default:
            return { valid: false, error: 'Unknown signal type' };
    }

    return { valid: true };
}

/**
 * Validate UUID format
 * @param {string} id - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(id) {
    if (typeof id !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Validate file metadata
 * @param {object} metadata - File metadata to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateFileMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return { valid: false, error: 'Invalid metadata format' };
    }

    if (!metadata.name || typeof metadata.name !== 'string') {
        return { valid: false, error: 'Missing or invalid file name' };
    }

    if (typeof metadata.size !== 'number' || metadata.size <= 0) {
        return { valid: false, error: 'Invalid file size' };
    }

    if (metadata.size > config.fileTransfer.maxFileSize) {
        return { valid: false, error: 'File size exceeds maximum allowed' };
    }

    return { valid: true };
}

export default {
    sanitizeDeviceName,
    validateMessage,
    isValidUUID,
    validateFileMetadata
};
