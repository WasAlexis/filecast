/* Fuctions for wsHandler */

function broadcast(wss, data, excludeSocket) {
    const content = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN && client !== excludeSocket) {
            client.send(content);
        }
    });
}

function syncDevices(wss, deviceHub) {
    broadcast(wss, {
        signal: 'updateDeviceList',
        devicesOnline: deviceHub.listDevices()
    });
}

export { broadcast, syncDevices };