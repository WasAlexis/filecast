/**
 * Logging Utility
 * Provides consistent logging across the application
 */

import config from '../config/config.js';

const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const levelMap = {
    'debug': LogLevel.DEBUG,
    'info': LogLevel.INFO,
    'warn': LogLevel.WARN,
    'error': LogLevel.ERROR
};

const currentLevel = levelMap[config.logging.level] || LogLevel.INFO;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
function formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Log debug message
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
export function debug(message, meta = {}) {
    if (currentLevel <= LogLevel.DEBUG && config.logging.console) {
        console.log(formatMessage('debug', message, meta));
    }
}

/**
 * Log info message
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
export function info(message, meta = {}) {
    if (currentLevel <= LogLevel.INFO && config.logging.console) {
        console.info(formatMessage('info', message, meta));
    }
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
export function warn(message, meta = {}) {
    if (currentLevel <= LogLevel.WARN && config.logging.console) {
        console.warn(formatMessage('warn', message, meta));
    }
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error|object} error - Error object or metadata
 */
export function error(message, error = {}) {
    if (currentLevel <= LogLevel.ERROR && config.logging.console) {
        const meta = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : error;
        console.error(formatMessage('error', message, meta));
    }
}

export default { debug, info, warn, error };
