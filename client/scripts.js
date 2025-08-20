/* start connection to server */

const ws = new WebSocket('ws://localhost:3000');
ws.binaryType = 'arraybuffer';

ws.addEventListener('open', () => {
    console.log('Connected to Filecast');
});

const fileBox = document.getElementById('fileBox');

function downloadFile(buffer) {
    const view = new DataView(buffer);

    const headerLength = view.getUint32(0, true);

    const headerBytes = new Uint8Array(buffer, 4, headerLength);
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(headerBytes));

    const fileBytes = new Uint8Array(buffer, 4 + headerLength);

    const blob = new Blob([fileBytes], { type: header.type });

    // Create a link to download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = header.name || 'received_file';
    link.click();
}

// When a file is selected, read it and send it to the server
fileBox.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const arrayBuffer = await file.arrayBuffer();

        const header = JSON.stringify({ name: file.name, mime: file.type, type: 'file' });
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

// When a message is received from the server 
ws.addEventListener('message', (event) => {
    const isBinary = event.data instanceof ArrayBuffer;
    if (isBinary) {
        downloadFile(event.data);
    } else {
        const message = JSON.parse(event.data);
        if (message.type === 'user-joined') {
            console.log('A new user has joined the chat');
        } else if (message.type === 'user-left') {
            console.log('A user has left the chat');
        } else {
            console.log('Unknown message type: ', message.type);
        }
    }
});