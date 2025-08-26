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
const clients = new Map();

function broadcast (data, sender) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN && client !== sender) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (socket) => {
    console.log('New client connected');
    const clientId = uuidv4();
    clients.set(clientId, socket);

    socket.send(JSON.stringify({ type: 'id', id: clientId }));
    broadcast({ type: 'join', id: clientId }, socket);

    socket.on('message', (message) => {
        const msg = JSON.parse(message);
        if (msg.target && clients.has(msg.target)) {
            clients.get(msg.target).send(JSON.stringify({ ...msg, from: clientId }));
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        clients.delete(clientId);
        broadcast({ type: 'leave', id: clientId }, socket);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});