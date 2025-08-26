/* start connection to server */

import ws from "./signaling.js";
import ClientWebRTC from "./webrtc.js";

const clientRTC = new ClientWebRTC(ws);
window.selectPeer = selectPeer;
window.sendmsg = clientRTC.sendMessage;

ws.addEventListener('message', async (e) => {
  if (typeof e.data !== 'string') {
    console.log("Is not a JSON");
    return;
  }

  /* always received a JSON to select a case */
  const msg = JSON.parse(e.data);

  switch (msg.type) {
    case 'id':
      clientRTC.myClientId = msg.id;
      console.log(clientRTC.myClientId);
      break;
    case 'message':
      console.log('Received message: ' + msg);
      break;
    case 'join':
      joinNewUser(msg.id);
      console.log('New user: ' + msg.id);
      break;
    case 'leave':
      leaveUser(msg.id);
      console.log('An user left ' + msg.id);
      break;
    case 'offer':
      console.log('Received offer ' + msg.from);
      await clientRTC.handleOffer(msg);
      break;
    case 'answer':
      console.log('Received answer ' + msg.from);
      await clientRTC.peerConnection.setRemoteDescription(msg.answer);
      break;
    case 'ice':
      console.log('Received ICE candidate');
      await clientRTC.peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
      break;
  }
});

function selectPeer(id) {
  clientRTC.targetId = id;
  clientRTC.sendOffer();
}

/*
let clientId;
const members = new Map();
let peerConnection;
let dataChannel;
let incomingFile = null;
let ReceivedBuffers = [];

function createConnection(targetId) {
  peerConnection = new RTCPeerConnection();

  dataChannel = peerConnection.createDataChannel('filecast');

  dataChannel.onopen = () => {
    console.log('Datachannel is open');
  };

  dataChannel.onmessage = (e) => {
    assamblyFile(e);
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: 'ice', target: targetId, candidate: e.candidate }));
    }
  };

  peerConnection.ondatachannel = (e) => {
    dataChannel = e.channel;
    dataChannel.onmessage = (e) => {
      assamblyFile(e);
      console.log('Mensaje remoto: ' + e.data);
    };

    dataChannel.onopen = () => {
      console.log('Datachannel remoto abierto');
    };
  }
  return peerConnection;
}

async function sendOffer(targetId) {
  createConnection(targetId);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: 'offer', target: targetId, offer }));
  console.log('Send offer to ' + targetId);
}

async function handleOffer(message) {
  createConnection(message.from);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  ws.send(JSON.stringify({ type: 'answer', target: message.from, answer }));
  console.log('Send answer to ' + message.from);
}

function sendMessage(msg) {
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(msg);
    console.log('Mensaje enviado!');
  } else {
    console.log('No hay ninguna conexion aun');
  }
}

async function sendFile() {
  const file = document.getElementById('fileInput').files[0];

  if (!dataChannel || dataChannel.readyState !== 'open') {
    console.error('Datachannel not open');
    return;
  }

  const chunkSize = 16 * 1024; // 16KB
  const arrayBuffer = await file.arrayBuffer();

  dataChannel.send(JSON.stringify({
    type: 'file-meta',
    fileName: file.name,
    fileSize: arrayBuffer.byteLength
  }));

  for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
    const chunk = arrayBuffer.slice(i, i + chunkSize);
    dataChannel.send(chunk);
  }

  dataChannel.send(JSON.stringify({ type: 'file-end' }));
  console.log('Send is done');
}

function assamblyFile(res) {
  if (typeof res.data === "string") {
    try {
      const msg = JSON.parse(res.data);

      if (msg.type === 'file-meta') {
        incomingFile = { name: msg.name, size: msg.fileSize };
        ReceivedBuffers = [];
      } else if (msg.type === 'file-end') {
        const Received = new Blob(ReceivedBuffers);
        const link = URL.createObjectURL(Received);

        const ancor = document.createElement('a');
        ancor.href = link;
        ancor.download = incomingFile.name;
        ancor.click();

        // when finish
        incomingFile = null;
        ReceivedBuffers = [];
      }
    } catch (error) {
      console.log('Message received');
    }
  } else {
    ReceivedBuffers.push(res.data);
  }
}

ws.onopen = () => {
  console.log('Connected to Filecast server');
}

ws.onmessage = async (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'id':
      clientId = message.id;
      alert(`My client ID is ${clientId}`);
      break;
    case 'join':
      joinNewUser(message.id);
      break;
    case 'leave':
      leaveUser(message.id);
      break;
    case 'offer':
      console.log('Received offer: ', message.from);
      await handleOffer(message);
      break;
    case 'answer':
      console.log('Received answer: ', message.from);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
      break;
    case 'ice':
      console.log('Received Ice candidate');
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      break;
    default:
      console.log('Unknown message type :', message.type);
  }
}
*/
/* Interface */

const userList = document.getElementById('memberList');

function joinNewUser(id) {
  const newUser = document.createElement('div');
  newUser.id = id;
  newUser.innerHTML = `
    <div class="device" onclick="selectPeer('${id}')">
        <img src="./assets/svg/broadcast.svg" alt="device icon">
            <h3>device</h3>
    </div>`;
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