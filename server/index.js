/* this is the entry point for the server */

import { WebSocketServer, WebSocket } from 'ws';

process.loadEnvFile('./.env');
let clients = [];

const port = process.env.PORT || 3000;

const wss = new WebSocketServer({ port });

function broadcast(data, sender) {
    wss.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    })
}

wss.on('connection', (ws) => {
    clients.push(ws);
    const joinMessage = JSON.stringify({ type: 'user-joined', userId: ws._socket.remoteAddress });
    broadcast(joinMessage, ws);
    console.log('New client connected');

    ws.on('message', (data) => {
        broadcast(data, ws);
    });

    ws.on('close', () => {
        const leaveMessage = JSON.stringify({ type: 'user-left', userId: ws._socket.remoteAddress });
        broadcast(leaveMessage, ws);
        console.log('Client disconnected');
        clients = clients.filter(client => client !== ws);
    });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);