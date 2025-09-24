/* Javascript to manage user interface */

const deviceList = document.getElementById('deviceList');
const myName = document.getElementById('devicename');
const progressBar = document.getElementById('progressBar');

function renderDevicesOnScreen(devicesOnline, myId) {
  deviceList.innerHTML = ''; // detele all nodes
  devicesOnline.map((aux) => {
    if (aux.deviceId != myId) {
      const device = document.createElement('div');
      device.id = aux.deviceId;
      device.className = 'device';
      device.setAttribute("onclick", `selectPeer('${aux.deviceId}')`);
      device.innerHTML = `
        <img src="./assets/svg/broadcast.svg" alt="device icon">
        <span>${aux.deviceName}</span>
      `;
      deviceList.appendChild(device);
    }
  });
}

function sendFile() {
  const file = document.getElementById('inputFile').files[0];
  return file;
}

function getDeviceName() {
  return myName.value;
}

function loadName(deviceName) {
  myName.value = deviceName;
}

async function aumentarProgreso() {
  let progress = 0;
  while (progress <= 100) {
    progressBar.value = progress;
    progress += 1;
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
  }
}

window.aumentarProgreso = aumentarProgreso;

export { renderDevicesOnScreen, sendFile, getDeviceName, loadName };