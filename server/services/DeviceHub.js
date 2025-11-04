/**
 * Device Hub Service
 * Manages all connected devices in the FileCast network
 */

import Device from '../entities/Device.js';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeDeviceName, isValidUUID } from '../utils/validators.js';
import { info, warn, error } from '../utils/logger.js';
import config from '../config/config.js';

class DeviceHub {
    constructor() {
        this.devices = new Map();
    }

    /**
     * Add a new device to the hub
     * @param {string} name - Device name
     * @param {WebSocket} socket - WebSocket connection
     * @returns {Device|null} Created device or null if limit reached
     */
    addDevice(name, socket) {
        // Check device limit
        if (this.devices.size >= config.device.maxDevices) {
            warn('Maximum device limit reached', { limit: config.device.maxDevices });
            return null;
        }

        const sanitizedName = sanitizeDeviceName(name);
        const device = new Device(uuidv4(), sanitizedName, socket);
        this.devices.set(device.deviceId, device);
        
        info('Device added', { 
            deviceId: device.deviceId, 
            deviceName: device.deviceName,
            totalDevices: this.devices.size
        });
        
        return device;
    }

    /**
     * Remove a device from the hub
     * @param {string} deviceId - Device ID to remove
     * @returns {boolean} True if device was removed
     */
    removeDevice(deviceId) {
        if (!deviceId) return false;

        const existed = this.devices.delete(deviceId);
        
        if (existed) {
            info('Device removed', { 
                deviceId, 
                totalDevices: this.devices.size 
            });
        }
        
        return existed;
    }

    /**
     * Rename a device
     * @param {string} deviceId - Device ID
     * @param {string} newName - New device name
     * @returns {boolean} True if device was renamed
     */
    renameDevice(deviceId, newName) {
        if (!isValidUUID(deviceId)) {
            warn('Invalid device ID format', { deviceId });
            return false;
        }

        const device = this.devices.get(deviceId);
        
        if (!device) {
            warn('Device not found for rename', { deviceId });
            return false;
        }

        const sanitizedName = sanitizeDeviceName(newName);
        const oldName = device.deviceName;
        device.deviceName = sanitizedName;
        device.updateActivity();
        
        info('Device renamed', { 
            deviceId, 
            oldName, 
            newName: sanitizedName 
        });
        
        return true;
    }

    /**
     * Get a device by ID
     * @param {string} deviceId - Device ID
     * @returns {Device|undefined} Device or undefined if not found
     */
    getDevice(deviceId) {
        if (!isValidUUID(deviceId)) {
            return undefined;
        }
        return this.devices.get(deviceId);
    }

    /**
     * Update device activity timestamp
     * @param {string} deviceId - Device ID
     */
    updateDeviceActivity(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.updateActivity();
        }
    }

    /**
     * List all devices (without socket references)
     * @returns {Array<{deviceId: string, deviceName: string}>} List of devices
     */
    listDevices() {
        return Array.from(this.devices.values()).map(d => ({
            deviceId: d.deviceId,
            deviceName: d.deviceName
        }));
    }

    /**
     * Get total device count
     * @returns {number} Number of connected devices
     */
    getDeviceCount() {
        return this.devices.size;
    }

    /**
     * Clean up inactive devices
     * @param {number} timeoutMs - Inactivity timeout in milliseconds
     * @returns {number} Number of devices removed
     */
    cleanupInactiveDevices(timeoutMs = config.websocket.clientTimeout) {
        let removed = 0;
        
        for (const [deviceId, device] of this.devices.entries()) {
            if (!device.isActive(timeoutMs)) {
                this.devices.delete(deviceId);
                removed++;
                info('Inactive device removed', { deviceId, deviceName: device.deviceName });
            }
        }
        
        return removed;
    }
}

export default DeviceHub;