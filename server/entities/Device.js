/* Device object profile */

class Device {
    constructor(id, name, socket) {
        this.deviceId = id;
        this.deviceName = name;
        this.socket = socket;
    }
}

export default Device;