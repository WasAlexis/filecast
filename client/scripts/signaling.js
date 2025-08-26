/* start WebSocket connection */

const ws = new WebSocket(`ws://${window.location.host}`);

ws.addEventListener('open', () => {
    console.log('Connected to FileCast');
});

export default ws;