class GameState {
    constructor() {
        this.character = null;
        this.currentLocation = null;
        this.subscribers = new Map(); // Using Map to store categories of subscribers
    }
    
    subscribe(category, callback) {
        if (!this.subscribers.has(category)) {
            this.subscribers.set(category, []);
        }
        this.subscribers.get(category).push(callback);
        
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
    
    notify(category) {
        if (category) {
            // Notify only specific category subscribers
            const categorySubscribers = this.subscribers.get(category);
            if (categorySubscribers) {
                categorySubscribers.forEach(callback => callback(this));
            }
        } else {
            // Notify all subscribers
            this.subscribers.forEach((callbacks) => {
                callbacks.forEach(callback => callback(this));
            });
        }
    }
    
    setCharacter(character) {
        this.character = character;
        this.notify('character');
    }
    
    setLocation(location) {
        this.currentLocation = location;
        this.notify('location');
    }
    
    // Update specific character stats without triggering full UI updates
    updateCharacterStat(statCategory, statName, value) {
        if (!this.character || !this.character[statCategory]) return;
        
        this.character[statCategory][statName] = value;
        this.notify(`character-${statCategory}-${statName}`);
    }
}