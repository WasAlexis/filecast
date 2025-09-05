import http from 'node:http';
import { WebSocketServer } from 'ws';
import serverFile from './handlers/httpHandler.js';
import setupWebSocketServer from './handlers/wsHandler.js';


process.loadEnvFile('./.env');

const port = process.env.PORT || 3000;

const server = http.createServer(serverFile);

const wss = new WebSocketServer({ server });

setupWebSocketServer(wss);

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});