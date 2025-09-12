/* Device Manager */

import Device from '../entities/Device.js';
import { v4 as uuidv4 } from 'uuid';

class DeviceHub {
    constructor() {
        this.devices = new Map();
    }

    addDevice(socket) {
        const device = new Device(uuidv4(), 'Unknown', socket);
        this.devices.set(device.deviceId, device);
        return device;
    }

    removeDevice(deviceId) {
        this.devices.delete(deviceId);
    }

    renameDevice(deviceId, newName) {
        const device = this.devices.get(deviceId);
        if (device != undefined) {
            device.deviceName = newName;
        } else {
            console.log("There was an error when changing the name; the device ID does not exist");
        }
    }

    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }

    listDevices() {
        return Array.from(this.devices.values()).map(d => (
            { deviceId: d.deviceId, deviceName: d.deviceName }
        ));
    }
}

export default DeviceHub;