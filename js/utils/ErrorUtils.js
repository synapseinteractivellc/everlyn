// ErrorUtils.js - Centralized error handling
// This module provides consistent error handling throughout the application

/**
 * Game Error class for custom error types
 * @extends Error
 */
export class GameError extends Error {
    /**
     * Create a new GameError
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} [data] - Additional error data
     */
    constructor(message, code, data = {}) {
        super(message);
        this.name = 'GameError';
        this.code = code;
        this.data = data;

        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GameError);
        }
    }

    /**
     * Factory method to create a new GameError
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} [data] - Additional error data
     * @returns {GameError} - New GameError instance
     */
    static createError(message, code, data = {}) {
        return new GameError(message, code, data);
    }
}

/**
 * Error types/codes for consistent error handling
 */
export const ErrorCodes = {
    // Character errors
    CHARACTER_NOT_FOUND: 'CHARACTER_NOT_FOUND',
    INVALID_CHARACTER_DATA: 'INVALID_CHARACTER_DATA',
    INVALID_STAT: 'INVALID_STAT',
    INVALID_RESOURCE: 'INVALID_RESOURCE',

    // Storage errors
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
    STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',
    INVALID_SAVE_DATA: 'INVALID_SAVE_DATA',

    // UI errors
    ELEMENT_NOT_FOUND: 'ELEMENT_NOT_FOUND',
    TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',

    // Game state errors
    INVALID_LOCATION: 'INVALID_LOCATION',
    INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',

    // General errors
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

/**
 * Utility functions for error handling
 */
const ErrorUtils = {
    /**
     * Error logging levels
     */
    LogLevel: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4,
    },

    /**
     * Current logging level
     */
    logLevel: 1, // Default to INFO

    /**
     * Set the current logging level
     * @param {number} level - New logging level
     */
    setLogLevel(level) {
        this.logLevel = level;
    },

    /**
     * Log an error with consistent formatting
     * @param {Error} error - Error object
     * @param {string} context - Context where the error occurred
     * @param {number} [level=3] - Log level (3=ERROR by default)
     */
    logError(error, context, level = this.LogLevel.ERROR) {
        if (level < this.logLevel) return;

        const isGameError = error instanceof GameError;
        const errorCode = isGameError ? error.code : 'UNKNOWN_ERROR';

        // Format the error message
        const message = `[${context}] ${errorCode}: ${error.message}`;

        // Log with appropriate level
        switch (level) {
            case this.LogLevel.DEBUG:
                console.debug(message, error);
                break;
            case this.LogLevel.INFO:
                console.info(message, error);
                break;
            case this.LogLevel.WARN:
                console.warn(message, error);
                break;
            case this.LogLevel.ERROR:
            default:
                console.error(message, error);
                break;
        }

        // Could add error reporting to server here
    },

    /**
     * Safely try a function and handle any errors
     * @param {Function} fn - Function to try
     * @param {string} context - Context for error logging
     * @param {Function} [onError] - Optional error handler
     * @returns {*} - Result of the function or undefined on error
     */
    tryCatch(fn, context, onError) {
        try {
            return fn();
        } catch (error) {
            this.logError(error, context);

            if (typeof onError === 'function') {
                return onError(error);
            }

            return undefined;
        }
    },

    /**
     * Safely try an async function and handle any errors
     * @param {Function} fn - Async function to try
     * @param {string} context - Context for error logging
     * @param {Function} [onError] - Optional error handler
     * @returns {Promise<*>} - Result of the function or rejected promise
     */
    async tryAsync(fn, context, onError) {
        try {
            return await fn();
        } catch (error) {
            this.logError(error, context);

            if (typeof onError === 'function') {
                return onError(error);
            }

            return Promise.reject(error);
        }
    },

    /**
     * Check if an error is of a specific code
     * @param {Error} error - Error to check
     * @param {string} code - Error code to match
     * @returns {boolean} - Whether the error matches the code
     */
    isErrorCode(error, code) {
        return error instanceof GameError && error.code === code;
    },
};

export default ErrorUtils;