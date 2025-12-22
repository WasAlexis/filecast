/* start WebSocket connection */

import { loadName } from "./ui-controller.js";

const protocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${window.location.host}`);

function sendSocket(data) {
    ws.send(JSON.stringify(data));
}

function initDeviceName() {
    const deviceName = window.localStorage.getItem('deviceName');
    if (deviceName !== null) {
        loadName(deviceName);
    }
    sendSocket({ signal: 'device-join', deviceName });
}

ws.addEventListener('open', () => {
    initDeviceName();
    console.log('Connected to FileCast');
});

export { ws, sendSocket};