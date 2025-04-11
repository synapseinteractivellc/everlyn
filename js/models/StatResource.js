// StatResource.js - Unified stat and resource management
// This module provides a consistent way to handle any stat or resource with current/max values

/**
 * StatResource class for managing stats and resources
 * Provides a unified API for updating current/max values with validation
 */
class StatResource {
    /**
     * Create a new StatResource
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @param {Object} options - Additional options
     * @param {number} [options.min=0] - Minimum value (defaults to 0)
     * @param {number} [options.regenRate=0] - Regeneration rate (if applicable)
     */
    constructor(current, max, options = {}) {
        this.current = Math.min(current, max); // Ensure current doesn't exceed max
        this.max = max;
        this.min = options.min !== undefined ? options.min : 0;
        this.regenRate = options.regenRate || 0;
    }
    
    /**
     * Update current value by a given amount
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Whether the value actually changed
     */
    update(amount) {
        const oldValue = this.current;
        this.current = Math.max(this.min, Math.min(this.current + amount, this.max));
        return this.current !== oldValue;
    }
    
    /**
     * Set current value directly with validation
     * @param {number} value - New value
     * @returns {boolean} - Whether the value actually changed
     */
    setCurrent(value) {
        const oldValue = this.current;
        this.current = Math.max(this.min, Math.min(value, this.max));
        return this.current !== oldValue;
    }
    
    /**
     * Set maximum value and adjust current if needed
     * @param {number} newMax - New maximum value
     * @returns {boolean} - Whether max or current changed
     */
    setMax(newMax) {
        if (this.max === newMax) return false;
        
        this.max = newMax;
        // If current was at max before, keep it at max
        const wasAtMax = this.current === this.max;
        
        // Ensure current value doesn't exceed new max
        const oldCurrent = this.current;
        this.current = Math.min(this.current, this.max);
        
        return this.current !== oldCurrent || wasAtMax;
    }
    
    /**
     * Get the percentage filled (0-100)
     * @returns {number} - Percentage value
     */
    getPercentage() {
        if (this.max === 0) return 0;
        return (this.current / this.max) * 100;
    }
    
    /**
     * Check if resource is full
     * @returns {boolean} - True if current equals max
     */
    isFull() {
        return this.current >= this.max;
    }
    
    /**
     * Check if resource is empty
     * @returns {boolean} - True if current equals min
     */
    isEmpty() {
        return this.current <= this.min;
    }
    
    /**
     * Clone this StatResource
     * @returns {StatResource} - A new instance with the same values
     */
    clone() {
        return new StatResource(this.current, this.max, {
            min: this.min,
            regenRate: this.regenRate
        });
    }
    
    /**
     * Convert to simple object for serialization
     * @returns {Object} - Simple object representation
     */
    toJSON() {
        return {
            current: this.current,
            max: this.max,
            min: this.min,
            regenRate: this.regenRate
        };
    }
    
    /**
     * Create from deserialized object
     * @param {Object} data - Object with stat resource data
     * @returns {StatResource} - New StatResource instance
     */
    static fromJSON(data) {
        return new StatResource(data.current, data.max, {
            min: data.min,
            regenRate: data.regenRate
        });
    }
}

export default StatResource;