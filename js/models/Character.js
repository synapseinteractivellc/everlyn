// Character.js - Character model class
// This module defines the Character class for player character data

import StatResource from './StatResource.js';

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
        
        // Level and XP
        this.level = config.level || 1;
        this.xp = config.xp || 0;
        this.xpToNextLevel = config.xpToNextLevel || 100;

        // Initialize stats using StatResource
        this.stats = {
            health: new StatResource(
                config.health?.current || 10,
                config.health?.max || 10
            ),
            stamina: new StatResource(
                config.stamina?.current || 10,
                config.stamina?.max || 10
            ),
            mana: new StatResource(
                config.mana?.current || 10,
                config.mana?.max || 10
            )
        };
        
        // Initialize elemental mana
        this.elementalMana = {
            earth: new StatResource(
                config.elementalMana?.earth?.current || 0, 
                config.elementalMana?.earth?.max || 0
            ),
            fire: new StatResource(
                config.elementalMana?.fire?.current || 0, 
                config.elementalMana?.fire?.max || 0
            ),
            air: new StatResource(
                config.elementalMana?.air?.current || 0, 
                config.elementalMana?.air?.max || 0
            ),
            water: new StatResource(
                config.elementalMana?.water?.current || 0, 
                config.elementalMana?.water?.max || 0
            )
        };
        
        // Initialize resources
        this.resources = {
            gold: new StatResource(
                config.resources?.gold?.current || 0, 
                config.resources?.gold?.max || 10
            ),
            research: new StatResource(
                config.resources?.research?.current || 0, 
                config.resources?.research?.max || 25
            ),
            skins: new StatResource(
                config.resources?.skins?.current || 0, 
                config.resources?.skins?.max || 10
            )
        };
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
        this.stats.health.setMax(this.stats.health.max + 2);
        this.stats.health.setCurrent(this.stats.health.max); // Restore health on level up
        this.stats.stamina.setMax(this.stats.stamina.max + 1);
        this.stats.stamina.setCurrent(this.stats.stamina.max); // Restore stamina on level up
        this.stats.mana.setMax(this.stats.mana.max + 1);
        this.stats.mana.setCurrent(this.stats.mana.max); // Restore mana on level up
    }
    
    /**
     * Update a resource value
     * @param {string} resource - Resource name (gold, research, skins)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateResource(resource, amount) {
        if (!this.resources[resource]) return false;
        return this.resources[resource].update(amount);
    }
    
    /**
     * Update a stat value
     * @param {string} stat - Stat name (health, stamina, mana)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateStat(stat, amount) {
        if (!this.stats[stat]) return false;
        return this.stats[stat].update(amount);
    }
    
    /**
     * Update an elemental mana value
     * @param {string} element - Element name (earth, fire, air, water)
     * @param {number} amount - Amount to add (can be negative)
     * @returns {boolean} - Success status
     */
    updateElementalMana(element, amount) {
        if (!this.elementalMana[element]) return false;
        return this.elementalMana[element].update(amount);
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
            earthMana: this.elementalMana.earth,
            fireMana: this.elementalMana.fire,
            airMana: this.elementalMana.air,
            waterMana: this.elementalMana.water,
            gold: this.resources.gold.current,
            maxGold: this.resources.gold.max,
            research: this.resources.research.current,
            maxResearch: this.resources.research.max,
            skins: this.resources.skins.current,
            maxSkins: this.resources.skins.max
        };
    }
    
    /**
     * Serialize character data for storage
     * @returns {Object} - Serialized character data
     */
    toJSON() {
        return {
            name: this.name,
            charClass: this.charClass,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            stats: {
                health: this.stats.health.toJSON(),
                stamina: this.stats.stamina.toJSON(),
                mana: this.stats.mana.toJSON()
            },
            elementalMana: {
                earth: this.elementalMana.earth.toJSON(),
                fire: this.elementalMana.fire.toJSON(),
                air: this.elementalMana.air.toJSON(),
                water: this.elementalMana.water.toJSON()
            },
            resources: {
                gold: this.resources.gold.toJSON(),
                research: this.resources.research.toJSON(),
                skins: this.resources.skins.toJSON()
            }
        };
    }
    
    /**
     * Create a Character instance from serialized data
     * @param {Object} data - Serialized character data
     * @returns {Character} - Character instance
     */
    static fromJSON(data) {
        const character = new Character(data.name, data.charClass);
        
        // Set basic properties
        character.level = data.level;
        character.xp = data.xp;
        character.xpToNextLevel = data.xpToNextLevel;
        
        // Set stats
        for (const stat in data.stats) {
            if (character.stats[stat]) {
                Object.assign(character.stats[stat], StatResource.fromJSON(data.stats[stat]));
            }
        }
        
        // Set elemental mana
        for (const element in data.elementalMana) {
            if (character.elementalMana[element]) {
                Object.assign(
                    character.elementalMana[element], 
                    StatResource.fromJSON(data.elementalMana[element])
                );
            }
        }
        
        // Set resources
        for (const resource in data.resources) {
            if (character.resources[resource]) {
                Object.assign(
                    character.resources[resource], 
                    StatResource.fromJSON(data.resources[resource])
                );
            }
        }
        
        return character;
    }
    
    // Getters for backward compatibility
    get health() { return this.stats.health; }
    get stamina() { return this.stats.stamina; }
    get mana() { return this.stats.mana; }
    
    // Elemental mana getters
    get earthMana() { return this.elementalMana.earth; }
    get fireMana() { return this.elementalMana.fire; }
    get airMana() { return this.elementalMana.air; }
    get waterMana() { return this.elementalMana.water; }
    
    // Resource getters
    get gold() { return this.resources.gold.current; }
    get maxGold() { return this.resources.gold.max; }
    get research() { return this.resources.research.current; }
    get maxResearch() { return this.resources.research.max; }
    get skins() { return this.resources.skins.current; }
    get maxSkins() { return this.resources.skins.max; }
    
    // Resource setters
    set gold(value) { this.resources.gold.setCurrent(value); }
    set research(value) { this.resources.research.setCurrent(value); }
    set skins(value) { this.resources.skins.setCurrent(value); }
}

export default Character;