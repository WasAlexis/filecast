/* start WebSocket connection */

import { loadName } from "./ui.js";

const ws = new WebSocket(`ws://${window.location.host}`);

ws.addEventListener('open', () => {
    const deviceName = (window.localStorage.getItem('deviceName')) ? window.localStorage.getItem('deviceName') : 'Uknown';
    if (deviceName != 'Uknown') {
        loadName(deviceName);
    }
    ws.send(JSON.stringify({ signal: 'device-join', deviceName }));
    console.log('Connected to FileCast');
});

export default ws;