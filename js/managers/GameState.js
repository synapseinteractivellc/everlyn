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
    }
    
    /**
     * Subscribe to state changes
     * @param {string} category - Category to subscribe to (optional)
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    subscribe(category, callback) {
        // Handle case where category is omitted (callback is first parameter)
        if (typeof category === 'function') {
            callback = category;
            category = 'all';
        }
        
        if (!this.subscribers.has(category)) {
            this.subscribers.set(category, []);
        }
        this.subscribers.get(category).push(callback);
        
        // Return unsubscribe function
        return () => { 
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                this.subscribers.set(
                    category, 
                    categorySubscribers.filter(cb => cb !== callback)
                );
            }
        };
    }
    
    /**
     * Notify subscribers of state changes
     * @param {string} category - Category to notify (optional)
     */
    notify(category) {
        // If category is specified, notify only that category
        if (category && category !== 'all') {
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.forEach(callback => callback(this));
            }
        }
        
        // Always notify 'all' subscribers
        const allSubscribers = this.subscribers.get('all');
        if (allSubscribers) {
            allSubscribers.forEach(callback => callback(this));
        }
    }
    
    /**
     * Set character data
     * @param {Object} character - Character object
     */
    setCharacter(character) {
        this.character = character;
        this.notify('character');
    }
    
    /**
     * Set current location
     * @param {string} location - Location name
     */
    setLocation(location) {
        this.currentLocation = location;
        this.notify('location');
    }
    
    /**
     * Update a specific property of the game state
     * @param {string} property - Property path (dot notation, e.g. 'character.stats.health.current')
     * @param {*} value - New value
     */
    updateProperty(property, value) {
        // Use a helper to set deeply nested properties
        this._setNestedProperty(this, property, value);
        
        // Determine the category from the property path
        const category = property.split('.')[0];
        this.notify(category);
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