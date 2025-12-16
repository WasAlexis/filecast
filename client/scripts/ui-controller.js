/* Javascript to manage user interface */

const deviceList = document.getElementById('deviceList');
const myName = document.getElementById('devicename');

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

export { renderDevicesOnScreen, sendFile, getDeviceName, loadName };