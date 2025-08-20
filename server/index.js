/* this is the entry point for the server */

import { WebSocketServer, WebSocket } from 'ws';

process.loadEnvFile('./.env');

const port = process.env.PORT || 3000;

const wss = new WebSocketServer({ port });

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