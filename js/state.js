// js/state.js
class GameState {
    constructor() {
        // The root state object
        this.state = {
            character: {
                name: '',
                level: 1,
                experience: 0,
                stats: {},
                currencies: {
                    gold: {
                        current: 0,
                        max: 10,
                        unlocked: true
                    },
                    research: {
                        current: 0,
                        max: 10,
                        unlocked: false
                    },
                    scrolls: {
                        current: 0, 
                        max: 10,
                        unlocked: false,
                        generationRate: 0.1,
                        generatesResourceId: 'research'
                    }
                },
                skills: {},
                actions: {},
                inventory: [],
                upgrades: {}
            },
            settings: {
                version: 1,
                timestamp: Date.now()
            },
            ui: {
                activeSection: 'main',
                activeAction: null
            }
        };

        // Subscribers that will be notified of state changes
        this.subscribers = {};
    }

    // Get the entire state or a specific path
    getState(path = null) {
        if (!path) {
            return this.state;
        }

        const result = this.getNestedProperty(this.state, path);
        return result;
    }
  
    // Get a nested property using dot notation (e.g., "character.stats.health")
    getNestedProperty(obj, path) {
        const result = path.split('.').reduce((acc, part) => 
            acc && acc[part] !== undefined ? acc[part] : null, obj);
        return result;
    }

    // Update state and notify subscribers
    setState(path, value) {
        // Store previous value for comparison
        const previousValue = this.getNestedProperty(this.state, path);

        // Update the state
        this.updateNestedProperty(this.state, path, value);

        // Notify subscribers
        this.notifySubscribers(path, previousValue, value);

        return this.state;
    }
  
    // Update a nested property using dot notation
    updateNestedProperty(obj, path, value) {
        const parts = path.split('.');
        const lastKey = parts.pop();

        const target = parts.reduce((acc, part) => {
            if (!acc[part]) {
                acc[part] = {};
            }
            return acc[part];
        }, obj);

        target[lastKey] = value;
    }
  
    // Subscribe to state changes
    subscribe(path, callback) {
        if (!this.subscribers[path]) {
            this.subscribers[path] = [];
        }

        this.subscribers[path].push(callback);

        // Return unsubscribe function
        return () => {
            this.subscribers[path] = this.subscribers[path]
            .filter(cb => cb !== callback);
        };
    }
  
    // Notify all subscribers of state changes
    notifySubscribers(path, oldValue, newValue) {
        // Notify exact path subscribers
        if (this.subscribers[path]) {
            this.subscribers[path].forEach(callback => 
            callback(newValue, oldValue, path));
        }

        // Notify wildcard subscribers (e.g., 'character.stats.*')
        Object.keys(this.subscribers).forEach(subPath => {
            if (subPath.endsWith('*')) {
                const basePath = subPath.slice(0, -1);
                if (path.startsWith(basePath)) {
                    this.subscribers[subPath].forEach(callback => 
                    callback(newValue, oldValue, path));
                }
            }
        });
    }

    // Setup standard subscriptions for common state changes
    setupStandardSubscriptions() {
        // More specific subscription for currency changes
        this.subscribe('character.currencies.*', (newValue, oldValue, path) => {
            console.log(`Currency state changed: ${path}`, newValue);
            
            // Extract the currency ID from the path
            const pathParts = path.split('.');
            const currencyId = pathParts[pathParts.length - 1];
            
            // Check if this is a real change to a currency (not a subscription to the parent)
            if (typeof newValue === 'object' && newValue !== null) {
            // Handle both updates to entire currency object and updates to specific properties
            const oldCurrent = oldValue ? oldValue.current : 0;
            const newCurrent = newValue.current;
            
            // Only emit event if there's a meaningful change
            if (oldCurrent !== newCurrent || oldValue?.unlocked !== newValue.unlocked) {
                if (window.game && window.game.events) {
                console.log(`Emitting resource.changed for ${currencyId}: ${oldCurrent} -> ${newCurrent}`);
                window.game.events.emit('resource.changed', {
                    id: currencyId,
                    oldValue: oldCurrent,
                    newValue: newCurrent,
                    resource: window.game.character.getResource(currencyId)
                });
                }
            }
            }
        });
    }

    // Load state from saved data
    loadState(savedData) {
        console.log(`STATE LOAD: Loading state`);

        // Merge saved data into state
        this.state = this.deepMerge(this.state, savedData);

        // Check for stamina specifically
        if (this.state.character && this.state.character.stats && this.state.character.stats.stamina) {
            console.log(`STATE LOAD: Stamina after load:`, this.state.character.stats.stamina);
        }

        // Notify all subscribers of the load
        this.notifySubscribers('*', null, this.state);
    }
  
    // Helper to perform deep merge
    deepMerge(target, source) {
        const output = {...target};

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
        }

        isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    // Serialize the state for saving
    serialize() {
    // Only log stamina
    if (this.state.character && this.state.character.stats && this.state.character.stats.stamina) {
    console.log(`STATE SERIALIZE: Stamina in serialized state:`, this.state.character.stats.stamina);
    }

    return this.state;
    }

    // Currency management methods
    getCurrency(id) {
        return this.getState(`character.currencies.${id}`);
    }

    // Add a helper method to update currency values
    updateCurrency(id, changes) {
        const currency = this.getCurrency(id);
        if (!currency) return false;

        const updatedCurrency = { ...currency, ...changes };
        this.setState(`character.currencies.${id}`, updatedCurrency);
        return true;
    }

    // Add a helper method to adjust currency amounts
    adjustCurrencyAmount(id, amount) {
        const currency = this.getCurrency(id);
        if (!currency) return false;

        const oldValue = currency.current;
        let newValue = oldValue + amount;

        // Apply min/max constraints
        if (newValue > currency.max) {
            newValue = currency.max;
        }
        if (newValue < 0) {
            newValue = 0;
        }

        // Only update if there's a change
        if (newValue !== oldValue) {
            this.updateCurrency(id, { current: newValue });
            return true;
        }

        return false;
    }
}

export default GameState;