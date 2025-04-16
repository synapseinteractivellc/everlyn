/**
 * Utility helpers for the game
 */
const Helpers = {
    /**
     * Generate a unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} - Unique ID
     */
    generateId: (prefix = '') => {
        return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
    },
    
    /**
     * Format a number with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber: (num) => {
        // Handle undefined, null, or non-numeric inputs
        if (num === undefined || num === null) return '0';
        
        // Convert to number if it's not already a number
        const numValue = Number(num);
        
        // Check if it's a valid number
        if (isNaN(numValue)) return '0';
        
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * Format time in seconds to mm:ss format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time
     */
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Format a date to a readable string
     * @param {Date|string|number} date - Date to format
     * @returns {string} - Formatted date
     */
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleString();
    },
    
    /**
     * Calculate time since a given date
     * @param {Date|string|number} date - Date to calculate from
     * @returns {string} - Human-readable time difference
     */
    timeSince: (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return `${interval} years ago`;
        if (interval === 1) return '1 year ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `${interval} months ago`;
        if (interval === 1) return '1 month ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `${interval} days ago`;
        if (interval === 1) return '1 day ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `${interval} hours ago`;
        if (interval === 1) return '1 hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return `${interval} minutes ago`;
        if (interval === 1) return '1 minute ago';
        
        return 'just now';
    },
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} - Cloned object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random float
     */
    randomFloat: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Random item from an array
     * @param {Array} array - Array to pick from
     * @returns {*} - Random item
     */
    randomItem: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Shuffle an array
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array
     */
    shuffleArray: (array) => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },
    
    /**
     * Capitalize first letter of a string
     * @param {string} string - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalize: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    /**
     * Truncate a string to a given length
     * @param {string} string - String to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Optional suffix to add
     * @returns {string} - Truncated string
     */
    truncate: (string, length, suffix = '...') => {
        if (string.length <= length) return string;
        return string.substring(0, length) + suffix;
    },
    
    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    /**
     * Throttle a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Throttle limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Interpolate between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {number} - Interpolated value
     */
    lerp: (start, end, factor) => {
        return start + (end - start) * factor;
    },
    
    /**
     * Get a nested property from an object safely
     * @param {Object} obj - Object to get property from
     * @param {string} path - Property path (e.g. 'user.address.city')
     * @param {*} defaultValue - Default value if property not found
     * @returns {*} - Property value or default value
     */
    getNestedProperty: (obj, path, defaultValue = null) => {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result;
    },
    
    /**
     * Set a nested property on an object
     * @param {Object} obj - Object to set property on
     * @param {string} path - Property path (e.g. 'user.address.city')
     * @param {*} value - Value to set
     * @returns {Object} - Updated object
     */
    setNestedProperty: (obj, path, value) => {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        return obj;
    },
    
    /**
     * Convert milliseconds to a human-readable duration
     * @param {number} ms - Duration in milliseconds
     * @returns {string} - Human-readable duration
     */
    formatDuration: (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },
    
    /**
     * Format a percentage
     * @param {number} value - Value to format
     * @param {number} total - Total value
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted percentage
     */
    formatPercentage: (value, total, decimals = 0) => {
        if (total === 0) return '0%';
        const percentage = (value / total) * 100;
        return `${percentage.toFixed(decimals)}%`;
    },
    
    /**
     * Generate a random color
     * @param {boolean} asRgb - Whether to return as RGB string
     * @returns {string} - Random color
     */
    randomColor: (asRgb = false) => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        if (asRgb) {
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};