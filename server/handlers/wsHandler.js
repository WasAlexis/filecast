/* Handler for Web Sockets */
import DeviceHub from '../services/DeviceHub.js';
import { syncDevices } from '../utils/wsUtils.js';

function setupWebSocketServer(wss) {
    const deviceHub = new DeviceHub();

    wss.on('connection', (socket) => {
        console.log('New client connected');
        let device;

        socket.on('message', (message) => {
            const msg = JSON.parse(message);

            switch (msg.signal) {
                case 'device-join':
                    device = deviceHub.addDevice(msg.deviceName, socket);
                    socket.send(JSON.stringify({ signal: 'assignId', id: device.deviceId }));
                    syncDevices(wss, deviceHub);
                    break;
                case 'rename':
                    deviceHub.renameDevice(msg.id, msg.newName);
                    syncDevices(wss, deviceHub);
                    break;
                case 'offer':
                case 'answer':
                case 'ice':
                    if (msg.target) {
                        const target = deviceHub.getDevice(msg.target);
                        target.socket.send(JSON.stringify(
                            {
                                ...msg,
                                from: device.deviceId
                            }
                        ));
                    }
                    break;
                default:
                    console.log('Invalid signal type');
                    break;
            }
        });

        socket.on('close', () => {
            console.log('Client disconnected');
            deviceHub.removeDevice(device.deviceId);
            syncDevices(wss, deviceHub);
        });
    });
}

export default setupWebSocketServer;