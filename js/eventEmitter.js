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
        console.log(`Event subscribed: ${event}, ${listener}`); // Debug log
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} listener - Callback function to remove
     */
    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
        console.log(`Event unsubscribed: ${event}, ${listener}`); // Debug log
    }

    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {any} data - Data to pass to listeners
     */
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
        console.log(`Event emitted: ${event}`, data); // Debug log
    }
}

export default EventEmitter;