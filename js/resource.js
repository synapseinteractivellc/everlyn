// resource.js

/**
 * Base Resource class with common functionality for all resource types
 */
class Resource {
    /**
     * Create a new resource
     * @param {Object} config - Configuration for the resource
     */
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description || '';
        this.current = config.initial !== undefined ? config.initial : 0;
        this.max = config.max !== undefined ? config.max : 0;
        this.unlocked = config.unlocked !== undefined ? config.unlocked : false;
        this.regenerationRate = config.regenerationRate || 0;
        this.game = config.game || null;
    }
    
    /**
     * Add amount to the resource (with cap at max)
     * @param {number} amount - Amount to add
     * @returns {number} - Current value after adding
     */
    add(amount) {
        const oldValue = this.current;
        this.current += amount;
        if (this.current > this.max) {
            this.current = this.max;
        }
        
        // Emit event if value changed and game exists
        if (this.current !== oldValue && this.game && this.game.events) {
            console.log(`Resource ${this.id} changed: ${oldValue} -> ${this.current}`);
            this.game.events.emit('resource.changed', {
                id: this.id,
                oldValue: oldValue,
                newValue: this.current,
                resource: this
            });
        }
        
        // Update state if state management exists
        if (this.game && this.game.state) {
            if (this.id.includes(".")) {
                // Handle nested resources (like currencies.gold)
                const [category, resourceId] = this.id.split(".");
                this.game.state.adjustCurrencyAmount(resourceId, this.current - oldValue);
            } else {
                // Direct update for non-nested resources
                const stateCategory = this.constructor.name.toLowerCase() === "currency" ? 
                    "currencies" : "stats";
                this.game.state.setState(`character.${stateCategory}.${this.id}.current`, this.current);
            }
        }
        
        return this.current;
    }
    
    /**
     * Remove amount from the resource (with floor at 0)
     * @param {number} amount - Amount to remove
     * @returns {number} - Current value after removing
     */
    remove(amount) {
        const oldValue = this.current;
        this.current -= amount;
        if (this.current < 0) {
            this.current = 0;
        }
        
        // Emit event if value changed and game exists
        if (this.current !== oldValue && this.game && this.game.events) {
            this.game.events.emit('resource.changed', {
                id: this.id,
                oldValue: oldValue,
                newValue: this.current,
                resource: this
            });
        }
        
        return this.current;
    }
    
    /**
     * Set the maximum value and optionally the current value
     * @param {number} max - New maximum value
     * @param {boolean} fillCurrent - Whether to also set current to max
     */
    setMax(max, fillCurrent = false) {
        this.max = max;
        if (fillCurrent) {
            this.current = max;
        } else if (this.current > max) {
            this.current = max;
        }
    }
    
    /**
     * Update resource state
     * @param {number} deltaTime - Time passed in seconds
     */
    update(deltaTime) {
        if (this.regenerationRate > 0 && this.current < this.max) {
            this.add(this.regenerationRate * deltaTime);
        }
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
     * @returns {boolean} - True if current equals 0
     */
    isEmpty() {
        return this.current <= 0;
    }
    
    /**
     * Get percentage full (0 to 100)
     * @returns {number} - Percentage full
     */
    getPercentage() {
        if (this.max <= 0) return 0;
        return (this.current / this.max) * 100;
    }
    
    /**
     * Convert to an object for saving
     * @returns {Object} - Serialized resource
     */
    serialize() {
        return {
            current: this.current,
            max: this.max,
            unlocked: this.unlocked
        };
    }
    
    /**
     * Load from saved data
     * @param {Object} data - Saved resource data
     */
    deserialize(data) {
        console.log(`RESOURCE DESERIALIZE: Starting deserialize for resource ${this.id}`);
        console.log(`RESOURCE DESERIALIZE: Data received:`, data);
        
        if (!data) {
            console.log(`RESOURCE DESERIALIZE: No data received for ${this.id}`);
            return;
        }
        
        if (data.current !== undefined) {
            console.log(`RESOURCE DESERIALIZE: Setting current from ${this.current} to ${data.current}`);
            this.current = data.current;
        }
        
        if (data.max !== undefined) {
            console.log(`RESOURCE DESERIALIZE: Setting max from ${this.max} to ${data.max}`);
            this.max = data.max;
        }
        
        if (data.unlocked !== undefined) {
            console.log(`RESOURCE DESERIALIZE: Setting unlocked from ${this.unlocked} to ${data.unlocked}`);
            this.unlocked = data.unlocked;
        }
        
        console.log(`RESOURCE DESERIALIZE: Final state for ${this.id}:`, {
            current: this.current,
            max: this.max,
            unlocked: this.unlocked
        });
    }
}

export default Resource;