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
        currencies: {},
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
    if (!path) return this.state;
    
    return this.getNestedProperty(this.state, path);
  }
  
  // Get a nested property using dot notation (e.g., "character.stats.health")
  getNestedProperty(obj, path) {
    return path.split('.').reduce((acc, part) => 
      acc && acc[part] !== undefined ? acc[part] : null, obj);
  }

  // Update state and notify subscribers
  setState(path, value) {
    // Store previous value for comparison
    const previousValue = this.getNestedProperty(this.state, path);
    
    // Update the state
    this.updateNestedProperty(this.state, path, value);
    
    // Notify subscribers
    this.notifySubscribers(path, previousValue, value);
  }
  
  // Update a nested property using dot notation
  updateNestedProperty(obj, path, value) {
    const parts = path.split('.');
    const lastKey = parts.pop();
    const target = parts.reduce((acc, part) => {
      if (!acc[part]) acc[part] = {};
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

  // Load state from saved data
  loadState(savedData) {
    // Merge saved data into state
    this.state = this.deepMerge(this.state, savedData);
    
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
    return this.state;
  }
}

export default GameState;