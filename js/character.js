// character.js (modified)
import Resource from './resource.js';
import Stat from './stat.js';
import { Currency, Scroll } from './currency.js';

class Character {
    constructor(name, game) {
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.game = game;
        
        // Stats
        this.stats = {
            health: new Stat({
                id: 'health',
                name: 'Health',
                description: 'Your physical wellbeing',
                initial: 10,
                max: 10,
                unlocked: true,
                recoveryRate: 0.5,
                recoveryDelay: 3000
            }),
            stamina: new Stat({
                id: 'stamina',
                name: 'Stamina',
                description: 'Your physical energy',
                initial: 10,
                max: 10,
                unlocked: true,
                recoveryRate: 0.5,
                recoveryDelay: 1000
            }),
            mana: new Stat({
                id: 'mana',
                name: 'Mana',
                description: 'Your magical energy',
                max: 0,
                unlocked: false,
                recoveryRate: 0.3,
                recoveryDelay: 5000
            })
        };
        
        // Currencies
        this.currencies = {
            gold: new Currency({
                id: 'gold',
                name: 'Gold',
                description: 'Currency used for purchases',
                max: 10,
                unlocked: true
            }),
            research: new Currency({
                id: 'research',
                name: 'Research',
                description: 'Knowledge gained from scrolls',
                max: 10,
                unlocked: false
            }),
            scrolls: new Scroll(game)
        };
        
        this.actions = {};
        this.skills = [];
        this.inventory = [];
        this.upgrades = {};
    }

    // Get experience needed for next level
    getNextLevelExp() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    // Add experience and handle leveling
    gainExperience(amount) {
        this.experience += amount;
        const nextLevelExp = this.getNextLevelExp();
        
        if (this.experience >= nextLevelExp) {
            this.levelUp();
            return true;
        }
        return false;
    }

    // Handle level up
    levelUp() {
        this.level += 1;
        this.experience = 0;
        // Could add stat increases or other bonuses here
    }
    
    /**
     * Get a resource by ID (can be either stat or currency)
     * @param {string} id - Resource ID
     * @returns {Resource} - The resource or null if not found
     */
    getResource(id) {
        const resource = this.stats[id] || this.currencies[id];
        if (!resource) {
            console.error(`Resource not found: ${id}`);
            return null;
        }
        console.log('Found resource:', resource); // Debugging statement
        if (typeof resource.add !== 'function') {
            console.error(`Resource ${id} is not a valid Resource instance.`);
            return null;
        }
        return resource;
    }
    
    /**
     * Update all resources and stats
     * @param {number} deltaTime - Time passed in seconds
     */
    update(deltaTime) {
        // Update currencies
        for (const currency of Object.values(this.currencies)) {
            if (currency.unlocked) {
                console.log('Updating currency:', currency); // Debugging statement
                if (typeof currency.update === 'function') {
                    currency.update(deltaTime, this);
                } else {
                    console.error(`Currency ${currency.id} does not have an update method.`);
                }
            }
        }
    
        // Update stats
        for (const stat of Object.values(this.stats)) {
            if (stat.unlocked) {
                console.log('Updating stat:', stat); // Debugging statement
                if (typeof stat.update === 'function') {
                    stat.update(deltaTime);
                } else {
                    console.error(`Stat ${stat.id} does not have an update method.`);
                }
            }
        }
    }

    // Save character data (updated)
    save() {
        const saveData = {
            name: this.name,
            level: this.level,
            experience: this.experience,
            stats: {},
            currencies: {},
            actions: this.actions,
            skills: this.skills,
            inventory: this.inventory,
            upgrades: this.upgrades
        };
        
        // Serialize stats
        for (const [id, stat] of Object.entries(this.stats)) {
            saveData.stats[id] = stat.serialize();
        }
        
        // Serialize currencies
        for (const [id, currency] of Object.entries(this.currencies)) {
            saveData.currencies[id] = currency.serialize();
        }
        
        return saveData;
    }

    // Static method to load character data (updated)
    static load(saveData, game) {
        if (!saveData) return null;
        
        const character = new Character(saveData.name, game);
        character.level = saveData.level || 1;
        character.experience = saveData.experience || 0;
        
        // Load stats
        if (saveData.stats) {
            for (const [id, statData] of Object.entries(saveData.stats)) {
                if (character.stats[id]) {
                    character.stats[id].deserialize(statData);
                }
            }
        }
        
        // Load currencies
        if (saveData.currencies) {
            for (const [id, currencyData] of Object.entries(saveData.currencies)) {
                if (character.currencies[id]) {
                    character.currencies[id].deserialize(currencyData);
                }
            }
        }
        
        // Load other data
        if (saveData.actions) character.actions = saveData.actions;
        if (saveData.skills) character.skills = saveData.skills;
        if (saveData.inventory) character.inventory = saveData.inventory;
        if (saveData.upgrades) character.upgrades = saveData.upgrades;
        
        return character;
    }
}

export default Character;