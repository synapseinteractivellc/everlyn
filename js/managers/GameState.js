// GameState.js - Central game state manager
// This module manages the game state and provides a publish/subscribe pattern

/**
 * GameState - Manages global game state and provides a pub/sub system
 */
class GameStateManager {
    constructor() {
        this.character = null;
        this.currentLocation = null;
        this.subscribers = new Map(); // Using Map to store categories of subscribers
        this.subscriptionId = 0; // For generating unique subscription IDs
    }
    
    /**
     * Subscribe to state changes
     * @param {string|Function} category - Category to subscribe to (or callback if omitted)
     * @param {Function} [callback] - Callback function
     * @param {Object} [options] - Subscription options
     * @returns {Object} - Subscription object with unsubscribe method
     */
    subscribe(category, callback, options = {}) {
        // Handle case where category is omitted (callback is first parameter)
        if (typeof category === 'function') {
            options = callback || {};
            callback = category;
            category = 'all';
        }
        
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        // Generate a unique subscription ID
        const id = this._generateSubscriptionId();
        
        if (!this.subscribers.has(category)) {
            this.subscribers.set(category, new Map());
        }
        
        const subscription = {
            id,
            callback,
            priority: options.priority || 0,
            once: !!options.once,
            filter: options.filter
        };
        
        this.subscribers.get(category).set(id, subscription);
        
        // Return subscription object with unsubscribe method
        return {
            id,
            category,
            unsubscribe: () => this.unsubscribe(category, id)
        };
    }
    
    /**
     * Subscribe to state changes once (automatically unsubscribes after first notification)
     * @param {string|Function} category - Category to subscribe to (or callback if omitted)
     * @param {Function} [callback] - Callback function
     * @param {Object} [options] - Subscription options
     * @returns {Object} - Subscription object with unsubscribe method
     */
    subscribeOnce(category, callback, options = {}) {
        if (typeof category === 'function') {
            options = callback || {};
            callback = category;
            category = 'all';
        }
        
        options.once = true;
        return this.subscribe(category, callback, options);
    }
    
    /**
     * Unsubscribe from state changes
     * @param {string} category - Category to unsubscribe from
     * @param {number} id - Subscription ID
     * @returns {boolean} - Success status
     */
    unsubscribe(category, id) {
        if (!this.subscribers.has(category)) {
            return false;
        }
        
        return this.subscribers.get(category).delete(id);
    }
    
    /**
     * Unsubscribe all for a category
     * @param {string} [category] - Category to unsubscribe all from (optional)
     */
    unsubscribeAll(category) {
        if (category) {
            this.subscribers.delete(category);
        } else {
            this.subscribers.clear();
        }
    }
    
    /**
     * Notify subscribers of state changes
     * @param {string} category - Category to notify (optional)
     * @param {Object} [data] - Additional data to pass to subscribers
     */
    notify(category, data) {
        // Store subscriptions to remove after notification
        const toRemove = [];
        
        // If category is specified, notify only that category
        if (category && category !== 'all') {
            this._notifyCategory(category, data, toRemove);
        }
        
        // Always notify 'all' subscribers
        this._notifyCategory('all', data, toRemove);
        
        // Remove once-only subscriptions
        toRemove.forEach(({ category, id }) => {
            if (this.subscribers.has(category)) {
                this.subscribers.get(category).delete(id);
            }
        });
    }
    
    /**
     * Notify subscribers of a specific category
     * @param {string} category - Category to notify
     * @param {Object} data - Additional data to pass to subscribers
     * @param {Array} toRemove - Array to collect subscriptions to remove
     * @private
     */
    _notifyCategory(category, data, toRemove) {
        if (!this.subscribers.has(category)) return;
        
        // Get all subscriptions for the category
        const subscriptions = Array.from(this.subscribers.get(category).values());
        
        // Sort by priority (higher priority first)
        subscriptions.sort((a, b) => b.priority - a.priority);
        
        // Call each subscriber
        subscriptions.forEach(subscription => {
            try {
                // Check if filter matches
                if (subscription.filter && !subscription.filter(this, data)) {
                    return;
                }
                
                // Call the callback
                subscription.callback(this, data);
                
                // If once, add to removal list
                if (subscription.once) {
                    toRemove.push({
                        category,
                        id: subscription.id
                    });
                }
            } catch (error) {
                console.error(`Error in subscriber callback (${category}:${subscription.id}):`, error);
                // Continue with other subscribers even if one fails
            }
        });
    }
    
    /**
     * Generate a unique subscription ID
     * @returns {number} - Unique ID
     * @private
     */
    _generateSubscriptionId() {
        return this.subscriptionId++;
    }
    
    /**
     * Set character data
     * @param {Object} character - Character object
     */
    setCharacter(character) {
        this.character = character;
        this.notify('character', { type: 'characterUpdate', character });
    }
    
    /**
     * Set current location
     * @param {string} location - Location name
     */
    setLocation(location) {
        const oldLocation = this.currentLocation;
        this.currentLocation = location;
        this.notify('location', { 
            type: 'locationChange',
            oldLocation,
            newLocation: location 
        });
    }
    
    /**
     * Update a specific property of the game state
     * @param {string} property - Property path (dot notation, e.g. 'character.stats.health.current')
     * @param {*} value - New value
     */
    updateProperty(property, value) {
        const oldValue = this._getNestedProperty(this, property);
        
        // Use a helper to set deeply nested properties
        this._setNestedProperty(this, property, value);
        
        // Determine the category from the property path
        const category = property.split('.')[0];
        this.notify(category, { 
            type: 'propertyUpdate',
            property,
            oldValue,
            newValue: value
        });
    }
    
    /**
     * Helper method to get deeply nested properties using a string path
     * @param {Object} obj - Object to read from
     * @param {string} path - Property path (dot notation)
     * @returns {*} - Property value
     * @private
     */
    _getNestedProperty(obj, path) {
        const parts = path.split('.');
        let current = obj;
        
        for (let i = 0; i < parts.length; i++) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[parts[i]];
        }
        
        return current;
    }
    
    /**
     * Helper method to set deeply nested properties using a string path
     * @param {Object} obj - Object to modify
     * @param {string} path - Property path (dot notation)
     * @param {*} value - New value
     * @private
     */
    _setNestedProperty(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        
        // Navigate to the parent of the property to set
        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        
        // Set the property value
        current[parts[parts.length - 1]] = value;
    }
}

// Create and export singleton instance
const GameState = new GameStateManager();
export default GameState;