// stat.js
import Resource from './resource.js';

/**
 * Stat class for character attributes like health, stamina, etc.
 */
class Stat extends Resource {
    /**
     * Create a new stat
     * @param {Object} config - Configuration for the stat
     */
    constructor(config) {
        super(config);
        this.recoveryRate = config.recoveryRate || 0; // Natural recovery rate
        this.recoveryDelay = config.recoveryDelay || 0; // Delay before recovery starts (ms)
        this.lastDamaged = 0; // Timestamp when last damaged
    }
    
    /**
     * Override remove to track when damage was taken
     * @param {number} amount - Amount to remove
     * @returns {number} - Current value after removing
     */
    remove(amount) {
        this.lastDamaged = Date.now();
        return super.remove(amount);
    }
    
    /**
     * Update stat with recovery mechanics
     * @param {number} deltaTime - Time passed in seconds
     */
    update(deltaTime) {
        // Check if enough time has passed since last damage
        const now = Date.now();
        if (this.recoveryRate > 0 && this.current < this.max && 
            (now - this.lastDamaged > this.recoveryDelay)) {
            this.add(this.recoveryRate * deltaTime);
        }
    }
    
    /**
     * Convert to an object for saving
     * @returns {Object} - Serialized stat
     */
    serialize() {
        const data = super.serialize();
        data.lastDamaged = this.lastDamaged;
        return data;
    }
    
    /**
     * Load from saved data
     * @param {Object} data - Saved stat data
     */
    deserialize(data) {
        super.deserialize(data);
        if (data && data.lastDamaged !== undefined) {
            this.lastDamaged = data.lastDamaged;
        }
    }
}

export default Stat;