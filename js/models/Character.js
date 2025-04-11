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
        
        // For backward compatibility and easier access
        this.health = this.stats.health;
        this.stamina = this.stats.stamina;
        this.mana = this.stats.mana;
        this.earthMana = this.stats.elementalMana.earth;
        this.fireMana = this.stats.elementalMana.fire;
        this.airMana = this.stats.elementalMana.air;
        this.waterMana = this.stats.elementalMana.water;
        this.gold = this.resources.gold.current;
        this.maxGold = this.resources.gold.max;
        this.research = this.resources.research.current;
        this.maxResearch = this.resources.research.max;
        this.skins = this.resources.skins.current;
        this.maxSkins = this.resources.skins.max;
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
        this.health.max += 2;
        this.health.current = this.health.max; // Restore health on level up
        this.stamina.max += 1;
        this.stamina.current = this.stamina.max;
        this.mana.max += 1;
        this.mana.current = this.mana.max;
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
        
        // Update both the resource object and compatibility property
        this.resources[resource].current = newValue;
        
        // Update compatibility properties
        if (resource === 'gold') {
            this.gold = newValue;
        } else if (resource === 'research') {
            this.research = newValue;
        } else if (resource === 'skins') {
            this.skins = newValue;
        }
        
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
        
        // Update both the stat object and compatibility property
        this.stats[stat].current = newValue;
        
        // Update compatibility properties
        if (stat === 'health') {
            this.health.current = newValue;
        } else if (stat === 'stamina') {
            this.stamina.current = newValue;
        } else if (stat === 'mana') {
            this.mana.current = newValue;
        }
        
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
        
        // Update both the elemental mana object and compatibility property
        this.stats.elementalMana[element].current = newValue;
        
        // Update compatibility properties
        if (element === 'earth') {
            this.earthMana.current = newValue;
        } else if (element === 'fire') {
            this.fireMana.current = newValue;
        } else if (element === 'air') {
            this.airMana.current = newValue;
        } else if (element === 'water') {
            this.waterMana.current = newValue;
        }
        
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
            health: this.health,
            stamina: this.stamina,
            mana: this.mana,
            earthMana: this.earthMana,
            fireMana: this.fireMana,
            airMana: this.airMana,
            waterMana: this.waterMana,
            gold: this.gold,
            maxGold: this.maxGold,
            research: this.research,
            maxResearch: this.maxResearch,
            skins: this.skins,
            maxSkins: this.maxSkins
        };
    }
}

export default Character;