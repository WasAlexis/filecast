/* Javascript to manage user interface */

const deviceList = document.getElementById('deviceList');

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
  const myName = document.getElementById('devicename').value;
  return myName;
}

export { renderDevicesOnScreen, sendFile, getDeviceName };