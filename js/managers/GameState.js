class GameState {
    constructor() {
        this.character = null;
        this.currentLocation = null;
        this.subscribers = [];
    }
    
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => { 
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }
    
    notify() {
        this.subscribers.forEach(callback => callback(this));
    }
    
    setCharacter(character) {
        this.character = character;
        this.notify();
    }
    
    setLocation(location) {
        this.currentLocation = location;
        this.notify();
    }
    
    // Additional state management methods
}

// Export a singleton instance
export default new GameState();