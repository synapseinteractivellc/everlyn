/**
 * Game Engine
 * Core game logic and state management
 */
class GameEngine {
    constructor() {
        // Game state
        this.state = {
            initialized: false,
            running: false,
            paused: false,
            lastUpdate: 0,
            tick: 0,
            tickRate: 1000, // ms between ticks
            activeLocation: null,
            version: '0.1.0'
        };
        
        // Game components
        this.components = new Map();
        
        // Event listeners
        this.eventListeners = {};
        
        // Game loop reference
        this.gameLoopId = null;
    }
    
    /**
     * Initialize the game engine
     * @param {Object} options - Initialization options
     * @returns {GameEngine} - This engine instance for chaining
     */
    initialize(options = {}) {
        if (this.state.initialized) {
            console.warn('Game engine already initialized');
            return this;
        }
        
        console.log('Initializing game engine...');
        
        // Merge options with defaults
        this.state = {
            ...this.state,
            ...options,
            initialized: true
        };
        
        // Try to load game from storage
        this.loadGame();
        
        // Trigger initialized event
        this.trigger('initialized');
        
        return this;
    }
    
    /**
     * Start the game loop
     * @returns {GameEngine} - This engine instance for chaining
     */
    start() {
        if (!this.state.initialized) {
            console.error('Game engine not initialized');
            return this;
        }
        
        if (this.state.running) {
            console.warn('Game engine already running');
            return this;
        }
        
        console.log('Starting game engine...');
        
        // Set running state
        this.state.running = true;
        this.state.paused = false;
        this.state.lastUpdate = performance.now();
        
        // Start game loop
        this.gameLoop();
        
        // Trigger started event
        this.trigger('started');
        
        return this;
    }
    
    /**
     * Stop the game loop
     * @returns {GameEngine} - This engine instance for chaining
     */
    stop() {
        if (!this.state.running) {
            console.warn('Game engine not running');
            return this;
        }
        
        console.log('Stopping game engine...');
        
        // Clear game loop
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        // Set running state
        this.state.running = false;
        this.state.paused = false;
        
        // Trigger stopped event
        this.trigger('stopped');
        
        return this;
    }
    
    /**
     * Pause the game loop
     * @returns {GameEngine} - This engine instance for chaining
     */
    pause() {
        if (!this.state.running) {
            console.warn('Game engine not running');
            return this;
        }
        
        if (this.state.paused) {
            console.warn('Game engine already paused');
            return this;
        }
        
        console.log('Pausing game engine...');
        
        // Set paused state
        this.state.paused = true;
        
        // Trigger paused event
        this.trigger('paused');
        
        return this;
    }
    
    /**
     * Resume the game loop
     * @returns {GameEngine} - This engine instance for chaining
     */
    resume() {
        if (!this.state.running) {
            console.warn('Game engine not running');
            return this;
        }
        
        if (!this.state.paused) {
            console.warn('Game engine not paused');
            return this;
        }
        
        console.log('Resuming game engine...');
        
        // Set paused state
        this.state.paused = false;
        this.state.lastUpdate = performance.now();
        
        // Trigger resumed event
        this.trigger('resumed');
        
        return this;
    }
    
    /**
     * Main game loop
     * @private
     */
    gameLoop() {
        // Get current time
        const now = performance.now();
        
        // Calculate delta time
        const deltaTime = now - this.state.lastUpdate;
        
        // Update game state if not paused
        if (!this.state.paused) {
            this.update(deltaTime);
        }
        
        // Update last update time
        this.state.lastUpdate = now;
        
        // Request next frame
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in milliseconds
     * @private
     */
    update(deltaTime) {
        // Check if it's time for a tick
        this.state.tickAccumulator = (this.state.tickAccumulator || 0) + deltaTime;
        
        let ticked = false;
        
        // Process ticks if enough time has passed
        while (this.state.tickAccumulator >= this.state.tickRate) {
            this.state.tickAccumulator -= this.state.tickRate;
            this.state.tick++;
            ticked = true;
            
            // Trigger tick event
            this.trigger('tick', { 
                tick: this.state.tick, 
                tickRate: this.state.tickRate 
            });
        }
        
        // Update all components
        this.components.forEach(component => {
            component.update(deltaTime);
        });
        
        // Save game periodically (every 100 ticks)
        if (ticked && this.state.tick % 100 === 0) {
            this.saveGame();
        }
        
        // Trigger update event
        this.trigger('update', { 
            deltaTime, 
            tick: this.state.tick,
            ticked
        });
    }
    
    /**
     * Register a component with the engine
     * @param {Component} component - Component to register
     * @returns {GameEngine} - This engine instance for chaining
     */
    registerComponent(component) {
        if (!component || !component.id) {
            console.error('Invalid component');
            return this;
        }
        
        // Add component to map
        this.components.set(component.id, component);
        
        // Trigger component registered event
        this.trigger('component:registered', component);
        
        return this;
    }
    
    /**
     * Unregister a component from the engine
     * @param {string|Component} component - Component or component ID to unregister
     * @returns {GameEngine} - This engine instance for chaining
     */
    unregisterComponent(component) {
        const id = component.id || component;
        
        // Remove component from map
        if (this.components.has(id)) {
            const removedComponent = this.components.get(id);
            this.components.delete(id);
            
            // Trigger component unregistered event
            this.trigger('component:unregistered', removedComponent);
        }
        
        return this;
    }
    
    /**
     * Get a registered component by ID
     * @param {string} id - Component ID
     * @returns {Component|undefined} - Component or undefined if not found
     */
    getComponent(id) {
        return this.components.get(id);
    }
    
    /**
     * Save game state
     * @returns {boolean} - Whether the save was successful
     */
    saveGame() {
        // Ensure active location is set in state before serializing
        const locationComponent = this.getComponent('city-locations');
        if (locationComponent && locationComponent.state.currentLocation.id) {
            this.state.activeLocation = locationComponent.state.currentLocation.id;
        }
        
        // Serialize game state
        const saveData = this.serialize();
        
        // Save to storage
        const success = storageManager.saveGame(saveData);
        
        if (success) {
            this.trigger('game:saved', saveData);
        } else {
            this.trigger('game:save:failed');
        }
        
        return success;
    }
    
    /**
     * Load game state
     * @returns {boolean} - Whether the load was successful
     */
    loadGame() {
        // Load from storage
        const saveData = storageManager.loadGame();
        
        if (saveData) {
            // Ensure proper deserialization of all components
            this.deserialize(saveData);
            
            // Force an additional state check for components
            this.components.forEach((component) => {
                if (saveData.components && saveData.components[component.id]) {
                    component.deserialize(saveData.components[component.id]);
                }
            });
            
            this.trigger('game:loaded', saveData);
            return true;
        } else {
            this.trigger('game:load:failed');
            return false;
        }
    }
    
    /**
     * Serialize game state
     * @returns {Object} - Serialized game state
     */
    serialize() {
        // Ensure active location is included in serialized state
        if (this.state.activeLocation) {
            // It's already included
        } else {
            const locationComponent = this.getComponent('city-locations');
            if (locationComponent && locationComponent.state.currentLocation.id) {
                this.state.activeLocation = locationComponent.state.currentLocation.id;
            }
        }

        // Serialize game state
        const saveData = {
            state: { ...this.state },
            components: {}
        };
        
        // Serialize components
        this.components.forEach(component => {
            saveData.components[component.id] = component.serialize();
        });
        
        return saveData;
    }
    
    /**
     * Deserialize game state
     * @param {Object} saveData - Serialized game state
     * @returns {GameEngine} - This engine instance for chaining
     */
    deserialize(saveData) {
        // Restore game state
        this.state = {
            ...this.state,
            ...saveData.state,
            initialized: true
        };
        
        // Restore components
        if (saveData.components) {
            Object.keys(saveData.components).forEach(id => {
                const component = this.getComponent(id);
                if (component) {
                    component.deserialize(saveData.components[id]);
                }
            });
        }
        
        return this;
    }
    
    /**
     * Set active location
     * @param {string} locationId - Location ID
     * @returns {GameEngine} - This engine instance for chaining
     */
    setActiveLocation(locationId) {
        this.state.activeLocation = locationId;
        
        // Get location component and update its current location
        const locationComponent = this.getComponent('city-locations');
        if (locationComponent) {
            // Use a different method that doesn't call back to setActiveLocation
            const location = locationComponent.getLocation(locationId);
            if (location) {
                locationComponent.setState({
                    currentLocation: {
                        id: locationId,
                        name: location.name,
                        description: location.description
                    }
                });
            }
        }
        
        this.trigger('location:changed', locationId);
        return this;
    }
    
    /**
     * Get active location
     * @returns {string|null} - Active location ID or null
     */
    getActiveLocation() {
        return this.state.activeLocation;
    }
    
    /**
     * Add an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @returns {GameEngine} - This engine instance for chaining
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
        return this;
    }
    
    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback to remove
     * @returns {GameEngine} - This engine instance for chaining
     */
    off(event, callback) {
        if (!this.eventListeners[event]) return this;
        
        if (callback) {
            // Remove specific callback
            this.eventListeners[event] = this.eventListeners[event]
                .filter(cb => cb !== callback);
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
     * @returns {GameEngine} - This engine instance for chaining
     */
    trigger(event, ...args) {
        if (!this.eventListeners[event]) return this;
        
        // Call all callbacks for this event
        this.eventListeners[event].forEach(callback => {
            try {
                callback.apply(this, args);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
        
        return this;
    }
}

// Create a singleton instance
const gameEngine = new GameEngine();