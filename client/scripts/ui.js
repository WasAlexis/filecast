/**
 * UI Management
 * Handles user interface updates and interactions
 */

import config from './config.js';

const deviceList = document.getElementById('deviceList');
const myName = document.getElementById('devicename');

let currentlySelected = null;

/**
 * Render devices on screen
 * @param {Array} devicesOnline - Array of online devices
 * @param {string} myId - Current user's device ID
 */
function renderDevicesOnScreen(devicesOnline, myId) {
    deviceList.innerHTML = '';

    const otherDevices = devicesOnline.filter(device => device.deviceId !== myId);

    if (otherDevices.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.innerHTML = `
            <p>No hay dispositivos disponibles</p>
            <small>Espera a que otros dispositivos se conecten</small>
        `;
        deviceList.appendChild(emptyMessage);
        return;
    }

    otherDevices.forEach(deviceData => {
        const device = createDeviceElement(deviceData);
        deviceList.appendChild(device);
    });
}

/**
 * Create device element
 * @param {object} deviceData - Device data
 * @returns {HTMLElement} Device element
 */
function createDeviceElement(deviceData) {
    const device = document.createElement('div');
    device.id = deviceData.deviceId;
    device.className = 'device';
    device.setAttribute('data-device-id', deviceData.deviceId);
    device.setAttribute('onclick', `selectPeer('${deviceData.deviceId}')`);
    
    device.innerHTML = `
        <div class="device-icon">
            <img src="./assets/svg/broadcast.svg" alt="device icon">
        </div>
        <div class="device-info">
            <span class="device-name">${escapeHtml(deviceData.deviceName)}</span>
            <span class="device-status">Disponible</span>
        </div>
    `;
    
    return device;
}

/**
 * Mark device as selected
 * @param {string} deviceId - Device ID to select
 */
function selectDevice(deviceId) {
    // Remove previous selection
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }

    // Select new device
    const deviceElement = document.querySelector(`[data-device-id="${deviceId}"]`);
    if (deviceElement) {
        deviceElement.classList.add('selected');
        currentlySelected = deviceElement;
    }
}

/**
 * Update device status
 * @param {string} deviceId - Device ID
 * @param {string} status - Status text
 */
function updateDeviceStatus(deviceId, status) {
    const deviceElement = document.querySelector(`[data-device-id="${deviceId}"]`);
    if (deviceElement) {
        const statusElement = deviceElement.querySelector('.device-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}

/**
 * Get selected file from input
 * @returns {File|null} Selected file or null
 */
function getSelectedFile() {
    const fileInput = document.getElementById('inputFile');
    const file = fileInput.files[0];
    
    if (!file) {
        return null;
    }

    // Reset file input
    fileInput.value = '';
    
    return file;
}

/**
 * Get device name from input
 * @returns {string} Device name
 */
function getDeviceName() {
    return myName.value.trim();
}

/**
 * Load device name into input
 * @param {string} deviceName - Device name to load
 */
function loadName(deviceName) {
    myName.value = deviceName;
}

/**
 * Show/hide file transfer progress
 * @param {boolean} show - Whether to show progress
 */
function toggleProgressBar(show) {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    }
}

/**
 * Update file transfer progress
 * @param {object} progressData - Progress data
 */
function updateProgress(progressData) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressFileName = document.getElementById('progressFileName');

    if (progressBar) {
        progressBar.value = progressData.progress || 0;
    }

    if (progressFileName) {
        progressFileName.textContent = progressData.fileName || '';
    }

    if (progressText) {
        const type = progressData.type === 'send' ? 'Enviando' : 'Recibiendo';
        const percent = Math.round(progressData.progress || 0);
        let text = `${type}: ${percent}%`;

        if (progressData.speed) {
            text += ` - ${formatSpeed(progressData.speed)}`;
        }

        progressText.textContent = text;
    }

    // Show progress container
    toggleProgressBar(true);

    // Hide when complete
    if (progressData.progress >= 100) {
        setTimeout(() => toggleProgressBar(false), 2000);
    }
}

/**
 * Format speed in human-readable format
 * @param {number} bytesPerSecond - Speed in bytes per second
 * @returns {string} Formatted speed
 */
function formatSpeed(bytesPerSecond) {
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return Math.round(bytesPerSecond / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show connection status
 * @param {string} status - Connection status
 */
function showConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `connection-status ${status.toLowerCase()}`;
    }
}

/**
 * Setup drag and drop for file input
 */
function setupDragAndDrop() {
    const dropZone = document.body;
    const fileInput = document.getElementById('inputFile');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when dragging
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-highlight');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            // Trigger file input with dropped file
            fileInput.files = files;
            // Optionally auto-send
            // window.sendToPeer();
        }
    }, false);
}

// Initialize drag and drop on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDragAndDrop);
} else {
    setupDragAndDrop();
}

export {
    renderDevicesOnScreen,
    getSelectedFile,
    getDeviceName,
    loadName,
    selectDevice,
    updateDeviceStatus,
    updateProgress,
    toggleProgressBar,
    showConnectionStatus,
    escapeHtml
};
