// js/eventEmitter.js
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} listener - Callback function
     */
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} listener - Callback function to remove
     */
    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {any} data - Data to pass to listeners
     */
    // In eventEmitter.js, add a throttling mechanism for 'resource.changed' events
    emit(event, data) {
        if (!this.events[event]) return;
        
        // Add throttling for resource.changed events
        if (event === 'resource.changed') {
            // Create a lastEmit tracking object if it doesn't exist
            this.lastResourceEmits = this.lastResourceEmits || {};
            const resourceId = data.id;
            
            // Get the current time
            const now = Date.now();
            
            // If this resource was recently emitted, skip this emission
            if (this.lastResourceEmits[resourceId] && 
                now - this.lastResourceEmits[resourceId] < 500) { // 500ms throttle
                return;
            }
            
            // Update the last emit time
            this.lastResourceEmits[resourceId] = now;
        }
        
        // Proceed with emitting the event
        this.events[event].forEach(listener => listener(data));
        console.log(`Event emitted: ${event}`, data); // Debug log
    }
}

export default EventEmitter;