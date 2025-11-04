/**
 * Device Entity
 * Represents a connected device in the FileCast network
 */

class Device {
    /**
     * Create a new Device
     * @param {string} id - Unique device identifier (UUID)
     * @param {string} name - Device display name
     * @param {WebSocket} socket - WebSocket connection
     */
    constructor(id, name, socket) {
        this.deviceId = id;
        this.deviceName = name;
        this.socket = socket;
        this.connectedAt = new Date();
        this.lastActivity = new Date();
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = new Date();
    }

    /**
     * Check if device is active
     * @param {number} timeoutMs - Timeout in milliseconds
     * @returns {boolean} True if device is active
     */
    isActive(timeoutMs = 60000) {
        return Date.now() - this.lastActivity.getTime() < timeoutMs;
    }

    /**
     * Get device info for serialization
     * @returns {{deviceId: string, deviceName: string, connectedAt: string}} Device info
     */
    toJSON() {
        return {
            deviceId: this.deviceId,
            deviceName: this.deviceName,
            connectedAt: this.connectedAt.toISOString()
        };
    }
}

export default Device;