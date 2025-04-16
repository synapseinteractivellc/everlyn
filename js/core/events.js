/**
 * Game Events System
 * A centralized event bus for game-wide communication
 */
class EventSystem {
    constructor() {
        this.eventListeners = {};
        this.eventHistory = [];
        this.maxHistoryLength = 100;
    }
    
    /**
     * Add an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} context - Context for the callback
     * @returns {Object} - Subscription object for unsubscribing
     */
    on(event, callback, context = null) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        const subscription = { callback, context };
        this.eventListeners[event].push(subscription);
        
        return subscription;
    }
    
    /**
     * Add a one-time event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} context - Context for the callback
     * @returns {Object} - Subscription object for unsubscribing
     */
    once(event, callback, context = null) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback, context);
            return callback.apply(context, args);
        };
        
        return this.on(event, onceCallback, context);
    }
    
    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback to remove
     * @param {Object} context - Context for the callback
     * @returns {EventSystem} - This event system instance for chaining
     */
    off(event, callback, context = null) {
        if (!this.eventListeners[event]) return this;
        
        if (callback) {
            // Remove specific callback
            this.eventListeners[event] = this.eventListeners[event]
                .filter(subscription => {
                    return subscription.callback !== callback || 
                           (context && subscription.context !== context);
                });
        } else {
            // Remove all callbacks for event
            this.eventListeners[event] = [];
        }
        
        return this;
    }
    
    /**
     * Trigger an event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     * @returns {EventSystem} - This event system instance for chaining
     */
    trigger(event, ...args) {
        // Log event to history
        this.logEvent(event, args);
        
        if (!this.eventListeners[event]) return this;
        
        // Create a copy of listeners array in case callbacks modify it
        const listeners = [...this.eventListeners[event]];
        
        // Call all callbacks for this event
        listeners.forEach(subscription => {
            try {
                const { callback, context } = subscription;
                callback.apply(context, args);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
        
        return this;
    }
    
    /**
     * Log event to history
     * @param {string} event - Event name
     * @param {Array} args - Event arguments
     * @private
     */
    logEvent(event, args) {
        this.eventHistory.push({
            event,
            args,
            timestamp: Date.now()
        });
        
        // Limit history length
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.shift();
        }
    }
    
    /**
     * Get event history
     * @param {string} event - Optional event name to filter by
     * @param {number} limit - Maximum number of events to return
     * @returns {Array} - Array of event history items
     */
    getHistory(event = null, limit = 10) {
        let history = [...this.eventHistory];
        
        // Filter by event name if provided
        if (event) {
            history = history.filter(item => item.event === event);
        }
        
        // Limit results
        history = history.slice(-limit);
        
        return history;
    }
    
    /**
     * Get number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} - Number of listeners
     */
    listenerCount(event) {
        return (this.eventListeners[event] || []).length;
    }
    
    /**
     * Get all registered event names
     * @returns {Array} - Array of event names
     */
    eventNames() {
        return Object.keys(this.eventListeners);
    }
    
    /**
     * Remove all event listeners
     * @returns {EventSystem} - This event system instance for chaining
     */
    removeAllListeners() {
        this.eventListeners = {};
        return this;
    }
    
    /**
     * Create an event namespace
     * @param {string} namespace - Namespace prefix
     * @returns {Object} - Namespaced event methods
     */
    namespace(namespace) {
        return {
            on: (event, callback, context) => 
                this.on(`${namespace}:${event}`, callback, context),
                
            once: (event, callback, context) => 
                this.once(`${namespace}:${event}`, callback, context),
                
            off: (event, callback, context) => 
                this.off(`${namespace}:${event}`, callback, context),
                
            trigger: (event, ...args) => 
                this.trigger(`${namespace}:${event}`, ...args)
        };
    }
}

// Create a singleton instance
const eventSystem = new EventSystem();