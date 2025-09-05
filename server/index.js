import http from 'node:http';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';

process.loadEnvFile('./.env');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), '../client', req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLocaleLowerCase();

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const wss = new WebSocketServer({ server });
const devices = new Map();

function broadcast (data, sender) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN && client !== sender) {
            client.send(JSON.stringify(data));
        }
    });
}

function syncDevices() {
    const deviceList = [];
    for (let device of devices.values()) {
        deviceList.push(device);
    }
    broadcast({ type: 'updateDeviceList', devicesOnline: deviceList }, undefined);
}

wss.on('connection', (socket) => {
    console.log('New client connected');
    // ToDo: Create a Class
    const device = {
        deviceId: uuidv4(),
        deviceName: 'Unknown',
        socket: socket
    };
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

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});