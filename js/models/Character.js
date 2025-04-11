// Character.js - Character model class
// This module defines the Character class for player character data

/**
 * Character class representing the player character
 */
class Character {
    /**
     * Create a new Character
     * @param {string} name - The character's name
     * @param {string} charClass - The character's class
     * @param {Object} config - Optional configuration to override defaults
     */
    constructor(name, charClass = "Waif", config = {}) {
        this.name = name;
        this.charClass = charClass;
        
        // Default values
        const defaults = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            stats: {
                health: {current: 10, max: 10},
                stamina: {current: 10, max: 10},
                mana: {current: 10, max: 10},
                elementalMana: {
                    earth: {current: 0, max: 0},
                    fire: {current: 0, max: 0},
                    air: {current: 0, max: 0},
                    water: {current: 0, max: 0}
                }
            },
            resources: {
                gold: {current: 0, max: 10},
                research: {current: 0, max: 25},
                skins: {current: 0, max: 10}
            }
        };
        
        // Merge defaults with config
        const merged = this.mergeDeep(defaults, config);
        
        // Apply merged configuration
        Object.assign(this, merged);
    }
    
    /**
     * Helper method for deep merging objects
     * @param {Object} target - Target object to merge into
     * @param {Object} source - Source object to merge from
     * @returns {Object} - Merged object
     */
    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }
    
    /**
     * Check if value is an object
     * @param {*} item - Item to check
     * @returns {boolean} - True if item is an object
     */
    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Gain experience points and level up if necessary
     * @param {number} amount - Amount of XP to gain
     */
    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    /**
     * Level up the character
     */
    levelUp() {
        this.xp -= this.xpToNextLevel;
        this.level++;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        console.log(`${this.name} leveled up! Now at level ${this.level}`);
        
        // Increase max stats on level up
        this.stats.health.max += 2;
        this.stats.health.current = this.stats.health.max; // Restore health on level up
        this.stats.stamina.max += 1;
        this.stats.stamina.current = this.stats.stamina.max;
        this.stats.mana.max += 1;
        this.stats.mana.current = this.stats.mana.max;
    }
    
    /**
     * Update a resource value
     * @param {string} resource - Resource name (gold, research, skins)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateResource(resource, amount) {
        if (!this.resources[resource]) return false;
        
        const current = this.resources[resource].current;
        const max = this.resources[resource].max;
        let newValue = current + amount;
        
        // Clamp value between 0 and max
        newValue = Math.max(0, Math.min(newValue, max));
        
        // Update the resource value
        this.resources[resource].current = newValue;
        
        return true;
    }
    
    /**
     * Update a stat value
     * @param {string} stat - Stat name (health, stamina, mana)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateStat(stat, amount) {
        if (!this.stats[stat]) return false;
        
        const current = this.stats[stat].current;
        const max = this.stats[stat].max;
        let newValue = current + amount;
        
        // Clamp value between 0 and max
        newValue = Math.max(0, Math.min(newValue, max));
        
        // Update the stat value
        this.stats[stat].current = newValue;
        
        return true;
    }
    
    /**
     * Update an elemental mana value
     * @param {string} element - Element name (earth, fire, air, water)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateElementalMana(element, amount) {
        if (!this.stats.elementalMana[element]) return false;
        
        const current = this.stats.elementalMana[element].current;
        const max = this.stats.elementalMana[element].max;
        let newValue = current + amount;
        
        // Clamp value between 0 and max
        newValue = Math.max(0, Math.min(newValue, max));
        
        // Update the elemental mana value
        this.stats.elementalMana[element].current = newValue;
        
        return true;
    }

    /**
     * Get character stats for display
     * @returns {Object} - Character stats
     */
    displayStats() {
        return {
            name: this.name,
            class: this.charClass,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            health: this.stats.health,
            stamina: this.stats.stamina,
            mana: this.stats.mana,
            earthMana: this.stats.elementalMana.earth,
            fireMana: this.stats.elementalMana.fire,
            airMana: this.stats.elementalMana.air,
            waterMana: this.stats.elementalMana.water,
            gold: this.resources.gold.current,
            maxGold: this.resources.gold.max,
            research: this.resources.research.current,
            maxResearch: this.resources.research.max,
            skins: this.resources.skins.current,
            maxSkins: this.resources.skins.max
        };
    }
    
    // Getters for backward compatibility
    
    // Stats getters
    get health() { return this.stats.health; }
    get stamina() { return this.stats.stamina; }
    get mana() { return this.stats.mana; }
    
    // Elemental mana getters
    get earthMana() { return this.stats.elementalMana.earth; }
    get fireMana() { return this.stats.elementalMana.fire; }
    get airMana() { return this.stats.elementalMana.air; }
    get waterMana() { return this.stats.elementalMana.water; }
    
    // Resource getters
    get gold() { return this.resources.gold.current; }
    get maxGold() { return this.resources.gold.max; }
    get research() { return this.resources.research.current; }
    get maxResearch() { return this.resources.research.max; }
    get skins() { return this.resources.skins.current; }
    get maxSkins() { return this.resources.skins.max; }
    
    // Resource setters
    set gold(value) { 
        this.resources.gold.current = Math.max(0, Math.min(value, this.resources.gold.max)); 
    }
    set research(value) { 
        this.resources.research.current = Math.max(0, Math.min(value, this.resources.research.max)); 
    }
    set skins(value) { 
        this.resources.skins.current = Math.max(0, Math.min(value, this.resources.skins.max)); 
    }
}

export default Character;