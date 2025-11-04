/**
 * Notification System
 * Handles user notifications and messages
 */

import config from './config.js';

/**
 * Notification types
 */
const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    /**
     * Initialize notification container
     */
    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {number} duration - Duration in milliseconds
     */
    show(message, type = NotificationType.INFO, duration = config.ui.notificationDuration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Create icon based on type
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${this.escapeHtml(message)}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Remove a notification
     * @param {HTMLElement} notification - Notification element
     */
    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, config.ui.animationDuration);
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        return icons[type] || icons.info;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show success notification
     * @param {string} message - Message to display
     */
    success(message) {
        return this.show(message, NotificationType.SUCCESS);
    }

    /**
     * Show error notification
     * @param {string} message - Message to display
     */
    error(message) {
        return this.show(message, NotificationType.ERROR);
    }

    /**
     * Show info notification
     * @param {string} message - Message to display
     */
    info(message) {
        return this.show(message, NotificationType.INFO);
    }

    /**
     * Show warning notification
     * @param {string} message - Message to display
     */
    warning(message) {
        return this.show(message, NotificationType.WARNING);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.container.innerHTML = '';
    }
}

// Create singleton instance
const notifications = new NotificationManager();

export default notifications;
export { NotificationType };
