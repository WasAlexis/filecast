/* start connection to server */

const ws = new WebSocket('ws://localhost:3000');
ws.binaryType = 'arraybuffer';

const peer = new RTCPeerConnection();

const dataChannel = peer.createDataChannel('fileChannel');

dataChannel.onopen = () => {
    console.log('Data channel is open');
}

dataChannel.onmessage = (event) => {
    console.log('Received message: ', event.data);
};

// When recibe a ice candidate
peer.onicecandidate = (event) => {
    if (event.candidate) {
        ws.send(JSON.stringify({ type: 'ice', candidate: event.candidate}));
    }
};

peer.ondatachannel = (event) => {
    const channel = event.channel;
    channel.onmessage = (event) => {
        console.log('Received data channel message: ', event.data);
    }
};

ws.onmessage = async (event) => {
    const signal = JSON.parce(event.data);

    if (signal.type === 'offer') {
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peer.createAsnwer();
        await peer.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp}));
    } else if (signal.type === 'answer') {
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
    } else if (signal.type === 'ice') {
        await peer.addIceCandidate(signal.candidate);
    } else {
        console.error('Unknown signal type: ', signal.type);
    }
};

async function initConnection() {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    ws.send(JSON.stringify(offer));
}

setTimeout(initConnection, 1000);

ws.addEventListener('open', () => {
    console.log('Connected to Filecast');
});

const fileBox = document.getElementById('fileBox');
const userList = document.getElementById('memberList');

function joinNewUser(id) {
    const newUser = document.createElement('div');
    newUser.id = id;
    newUser.innerHTML = `
    <input type="file" id="fileBox">
    <label for="fileBox" class="device">
        <img src="./assets/svg/broadcast.svg" alt="device icon">
            <h3>Device</h3>
    </label>`;
    newUser.classList.add('user-device');
    userList.appendChild(newUser);
    console.log(`${id} has joined the room`);
}

function leaveUser(id) {
    const user = document.getElementById(id);
    if (user) {
        user.remove();
        console.log(`${id} has left the room`);
    } else {
        console.error(`User with id ${id} not found`);
    }
}

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
            joinNewUser(message.userId);
        } else if (message.type === 'user-left') {
            leaveUser(message.userId);
        } else {
            console.log('Unknown message type: ', message.type);
        }
    }
});