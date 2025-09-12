/* start connection to server */

import ws from "./signaling.js";
import ClientWebRTC from "./webrtc.js";
import { renderDevicesOnScreen, sendFile, getDeviceName } from "./ui.js";

const clientRTC = new ClientWebRTC(ws);


ws.addEventListener('message', async (e) => {
  if (typeof e.data !== 'string') {
    console.log("Is not a JSON");
    return;
  }

  /* always received a JSON to select a case */
  const msg = JSON.parse(e.data);

  switch (msg.signal) {
    case 'assignId':
      clientRTC.myClientId = msg.id;
      console.log(clientRTC.myClientId);
      break;
    case 'updateDeviceList':
      renderDevicesOnScreen(msg.devicesOnline, clientRTC.myClientId);
      console.log('MemberList has been update');
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

window.selectPeer = selectPeer;

function sendToPeer() {
  const file = sendFile();
  clientRTC.sendFile(file);
}

window.sendToPeer = sendToPeer;

function changeMyName() {
  ws.send(JSON.stringify({ signal: 'rename', newName: getDeviceName(), id: clientRTC.myClientId }));
}

window.changeMyName = changeMyName;