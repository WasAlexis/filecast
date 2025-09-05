/* Handler for Web Sockets */

import Device from '../entities/Device.js';
import { v4 as uuidv4 } from 'uuid';

function setupWebSocketServer(wss) {
    const devices = new Map();

    const broadcast = (data, sender) => {
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN && client !== sender) {
                client.send(JSON.stringify(data));
            }
        });
    };

    const syncDevices = () => {
        const deviceList = [];
        for (let device of devices.values()) {
            deviceList.push(device);
        }
        broadcast({ type: 'updateDeviceList', devicesOnline: deviceList }, undefined);
    }

    wss.on('connection', (socket) => {
        console.log('New client connected');
        const device = new Device(uuidv4(), 'Unknown', socket);
        devices.set(device.deviceId, device);

        socket.send(JSON.stringify({ type: 'id', id: device.deviceId }));
        syncDevices();

        socket.on('message', (message) => {
            const msg = JSON.parse(message);
            if (msg.target && devices.has(msg.target)) {
                const targetClient = devices.get(msg.target);
                targetClient.socket.send(JSON.stringify({ ...msg, from: device.deviceId }));
            }

            if (msg.type == 'rename') {
                devices.get(msg.id).deviceName = msg.newName;
                syncDevices();
            }
        });

        socket.on('close', () => {
            console.log('Client disconnected');
            devices.delete(device.deviceId);
            syncDevices();
        });
    });
}

export default setupWebSocketServer;