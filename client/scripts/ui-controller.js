/* Javascript to manage user interface */

const deviceList = document.getElementById('device-list');
const myName = document.getElementById('device-name');

function createDeviceElement(device) {
  const deviceElement = document.createElement('div');
  deviceElement.id = device.deviceId;
  deviceElement.className = 'device';
  deviceElement.setAttribute('onclick', `selectPeer('${device.deviceId}')`);
  deviceElement.innerHTML = `
    <img src="./assets/svg/broadcast.svg" alt="device icon">
    <span>${device.deviceName}</span>
  `;
  return deviceElement;
}

function showDevices(devicesOnline, myId) {
  deviceList.innerHTML = ''; // detele all nodes
  devicesOnline.forEach(device => {
    if (device.deviceId != myId) {
      deviceList.appendChild(createDeviceElement(device));
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

export { showDevices, sendFile, getDeviceName, loadName };