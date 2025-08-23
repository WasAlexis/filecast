/* start connection to server */

const ws = new WebSocket(`ws://${window.location.host}`);

let clientId;
const members = new Map();
let peerConnection;
let dataChannel;

function createConnection(targetId) {
  peerConnection = new RTCPeerConnection();

  dataChannel = peerConnection.createDataChannel('filecast');

  dataChannel.onopen = () => {
    console.log('Datachannel is open');
  };

  dataChannel.onmessage = (e) => {
    alert('Message: ' + e.data);
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: 'ice', target: targetId, candidate: e.candidate }));
    }
  };

  peerConnection.ondatachannel = (e) => {
    dataChannel = e.channel;
    dataChannel.onmessage = (e) => {
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

/* Interface */

const userList = document.getElementById('memberList');

function joinNewUser(id) {
  const newUser = document.createElement('div');
  newUser.id = id;
  newUser.innerHTML = `
    <div class="device" onclick="sendOffer('${id}')">
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