/* start connection to server */

const ws = new WebSocket('ws://localhost:3000');
ws.binaryType = 'arraybuffer';

ws.addEventListener('open', () => {
    console.log('Connected to Filecast');
});

const fileBox = document.getElementById('fileBox');

fileBox.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const arrayBuffer = await file.arrayBuffer();

        const header = JSON.stringify({ name: file.name, type: file.type });
        const encoder = new TextEncoder();
        const headerBytes = encoder.encode(header);

        const buffer = new ArrayBuffer(4 + headerBytes.length + arrayBuffer.byteLength);
        const view = new DataView(buffer);
        view.setUint32(0, headerBytes.length, true);

        const uint8 = new Uint8Array(buffer);
        uint8.set(headerBytes, 4);
        uint8.set(new Uint8Array(arrayBuffer), 4 + headerBytes.length);
        ws.send(buffer);
    }
});

ws.addEventListener('message', (event) => {
    const buffer = event.data;
    const view = new DataView(buffer);

    const headerLength = view.getUint32(0, true);

    const headerBytes = new Uint8Array(buffer, 4, headerLength);
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(headerBytes));

    const fileBytes = new Uint8Array(buffer, 4 + headerLength);

    const blob = new Blob([fileBytes], { type : header.type });
    console.log('Received file from server');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = header.name || 'received_file';
    link.click();
});