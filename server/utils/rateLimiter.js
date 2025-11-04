/**
 * Rate Limiting Utility
 * Implements rate limiting for WebSocket connections and messages
 */

import config from '../config/config.js';
import { warn } from './logger.js';

/**
 * Rate Limiter class
 * Tracks message rates per client
 */
class RateLimiter {
    constructor() {
        // Map of client ID -> array of timestamps
        this.messageTimestamps = new Map();
        // Map of IP -> connection count
        this.connectionCounts = new Map();
    }

    /**
     * Check if client has exceeded message rate limit
     * @param {string} clientId - Client identifier
     * @returns {boolean} True if rate limit exceeded
     */
    checkMessageRateLimit(clientId) {
        const now = Date.now();
        const windowMs = config.rateLimit.windowMs;
        const maxMessages = config.rateLimit.messagesPerMinute;

        // Get or create timestamp array for this client
        if (!this.messageTimestamps.has(clientId)) {
            this.messageTimestamps.set(clientId, []);
        }

        const timestamps = this.messageTimestamps.get(clientId);

        // Remove timestamps outside the current window
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
        this.messageTimestamps.set(clientId, validTimestamps);

        // Check if limit exceeded
        if (validTimestamps.length >= maxMessages) {
            warn(`Rate limit exceeded for client ${clientId}`, {
                count: validTimestamps.length,
                limit: maxMessages
            });
            return true;
        }

        // Add current timestamp
        validTimestamps.push(now);
        return false;
    }

    /**
     * Check if IP has exceeded connection limit
     * @param {string} ip - Client IP address
     * @returns {boolean} True if connection limit exceeded
     */
    checkConnectionLimit(ip) {
        const count = this.connectionCounts.get(ip) || 0;
        const maxConnections = config.websocket.maxConnectionsPerIP;

        if (count >= maxConnections) {
            warn(`Connection limit exceeded for IP ${ip}`, {
                count,
                limit: maxConnections
            });
            return true;
        }

        return false;
    }

    /**
     * Increment connection count for IP
     * @param {string} ip - Client IP address
     */
    incrementConnection(ip) {
        const count = this.connectionCounts.get(ip) || 0;
        this.connectionCounts.set(ip, count + 1);
    }

    /**
     * Decrement connection count for IP
     * @param {string} ip - Client IP address
     */
    decrementConnection(ip) {
        const count = this.connectionCounts.get(ip) || 0;
        if (count > 0) {
            this.connectionCounts.set(ip, count - 1);
        }
    }

    /**
     * Clean up data for a disconnected client
     * @param {string} clientId - Client identifier
     */
    cleanup(clientId) {
        this.messageTimestamps.delete(clientId);
    }

    /**
     * Clear old data periodically
     */
    clearOldData() {
        const now = Date.now();
        const windowMs = config.rateLimit.windowMs;

        // Clear old message timestamps
        for (const [clientId, timestamps] of this.messageTimestamps.entries()) {
            const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
            if (validTimestamps.length === 0) {
                this.messageTimestamps.delete(clientId);
            } else {
                this.messageTimestamps.set(clientId, validTimestamps);
            }
        }

        // Clear zero connection counts
        for (const [ip, count] of this.connectionCounts.entries()) {
            if (count === 0) {
                this.connectionCounts.delete(ip);
            }
        }
    }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Clear old data every 5 minutes
setInterval(() => {
    rateLimiter.clearOldData();
}, 5 * 60 * 1000);

export default rateLimiter;
