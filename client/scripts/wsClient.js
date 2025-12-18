/* start WebSocket connection */

import { loadName } from "./ui.js";

const protocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${window.location.host}`);

function sendSocket(data) {
    ws.send(JSON.stringify(data));
}

ws.addEventListener('open', () => {
    const deviceName = (window.localStorage.getItem('deviceName')) ? window.localStorage.getItem('deviceName') : 'Uknown';
    if (deviceName != 'Uknown') {
        loadName(deviceName);
    }
    sendSocket({ signal: 'device-join', deviceName });
    console.log('Connected to FileCast');
});

export { ws, sendSocket};