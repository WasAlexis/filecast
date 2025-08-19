/* this is the entry point for the server */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

process.loadEnvFile('./.env');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type' : 'text/plain' });
    res.end('Server Filecast is running\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (data) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(data);
            }
        })
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
})