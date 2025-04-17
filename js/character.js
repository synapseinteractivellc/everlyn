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
                recoveryDelay: 3000,
                game: game
            }),
            stamina: new Stat({
                id: 'stamina',
                name: 'Stamina',
                description: 'Your physical energy',
                initial: 10,
                max: 10,
                unlocked: true,
                recoveryRate: 0.5,
                recoveryDelay: 1000,
                game: game
            }),
            mana: new Stat({
                id: 'mana',
                name: 'Mana',
                description: 'Your magical energy',
                max: 0,
                unlocked: false,
                recoveryRate: 0.3,
                recoveryDelay: 5000,
                game: game
            })
        };
        
        // Currencies
        this.currencies = {
            gold: new Currency({
                id: 'gold',
                name: 'Gold',
                description: 'Currency used for purchases',
                max: 10,
                unlocked: true,
                game: game
            }),
            research: new Currency({
                id: 'research',
                name: 'Research',
                description: 'Knowledge gained from scrolls',
                max: 10,
                unlocked: false,
                game: game
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
        let repairsMade = false;
        
        // Update currencies
        for (const [id, currency] of Object.entries(this.currencies)) {
            if (currency && currency.unlocked) {
                // Check if currency is a proper instance with an update method
                if (typeof currency.update === 'function') {
                    try {
                        currency.update(deltaTime, this);
                    } catch (error) {
                        console.error(`Error updating currency ${id}:`, error);
                        
                        // Attempt to repair the currency object
                        this.repairCurrency(id);
                        repairsMade = true;
                    }
                } else {
                    console.error(`Currency ${id} does not have an update method. Currency:`, currency);
                    
                    // Attempt to repair the currency object
                    this.repairCurrency(id);
                    repairsMade = true;
                }
            }
        }

        // Update stats
        for (const [id, stat] of Object.entries(this.stats)) {
            if (stat && stat.unlocked) {
                // Check if stat is a proper instance with an update method
                if (typeof stat.update === 'function') {
                    try {
                        stat.update(deltaTime);
                    } catch (error) {
                        console.error(`Error updating stat ${id}:`, error);
                        
                        // Attempt to repair the stat object
                        this.repairStat(id);
                        repairsMade = true;
                    }
                } else {
                    console.error(`Stat ${id} does not have an update method. Stat:`, stat);
                    
                    // Attempt to repair the stat object
                    this.repairStat(id);
                    repairsMade = true;
                }
            }
        }
        
        // If any repairs were made, trigger a full game state update
        if (repairsMade && this.game && this.game.ui) {
            this.refreshGameState();
        }
    }

    /**
     * Refresh the entire game state after repairs
     */
    refreshGameState() {
        // Ensure special relationships between resources are maintained
        if (this.currencies.scrolls && this.currencies.scrolls.unlocked && this.currencies.research) {
            this.currencies.research.unlocked = true;
            this.currencies.research.setMax(10 + this.currencies.scrolls.current);
        }
        
        // Update all UI elements
        if (this.game.ui) {
            this.game.ui.updateResourceDisplays(this);
            this.game.ui.updatePurchaseButtons(this);
            
            // Make sure the adventure log shows what happened
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                const logEntry = document.createElement('p');
                logEntry.textContent = "Game state has been restored after loading.";
                logContent.insertBefore(logEntry, logContent.firstChild);
            }
        }
        
        // Save the repaired state
        this.game.saveGame();
    }

    /**
     * Attempt to repair a broken currency object
     * @param {string} id - Currency ID
     */
    repairCurrency(id) {
        const brokenCurrency = this.currencies[id];
        if (!brokenCurrency) return;
        
        // Set default names based on ID
        let defaultName = id.charAt(0).toUpperCase() + id.slice(1);
        let defaultDescription = '';
        
        // Set specific defaults for known currencies
        if (id === 'gold') {
            defaultName = 'Gold';
            defaultDescription = 'Currency used for purchases';
        } else if (id === 'research') {
            defaultName = 'Research';
            defaultDescription = 'Knowledge gained from scrolls';
        } else if (id === 'scrolls') {
            defaultName = 'Scrolls';
            defaultDescription = 'Ancient texts that generate research over time';
        }
        
        // Create a new Currency instance based on the broken one's data
        let newCurrency;
        if (id === 'scrolls') {
            newCurrency = new Scroll(this.game);
            
            // Special handling for Scroll class
            newCurrency.current = brokenCurrency.current || 0;
            newCurrency.max = brokenCurrency.max || 10;
            newCurrency.unlocked = brokenCurrency.unlocked || false;
            newCurrency.name = defaultName; // Ensure name is set
            newCurrency.description = defaultDescription; // Ensure description is set
            
            // Ensure the research currency is unlocked if scrolls are unlocked
            if (newCurrency.unlocked && this.currencies['research']) {
                this.currencies['research'].unlocked = true;
            }
            
            // Make sure the research max is updated based on scrolls
            if (this.currencies['research']) {
                this.currencies['research'].setMax(10 + newCurrency.current);
            }
        } else {
            newCurrency = new Currency({
                id: id,
                name: brokenCurrency.name || defaultName,
                description: brokenCurrency.description || defaultDescription,
                max: brokenCurrency.max || 10,
                unlocked: brokenCurrency.unlocked || false,
                game: this.game
            });
            
            // Copy over the current value
            if (brokenCurrency.current !== undefined) {
                newCurrency.current = brokenCurrency.current;
            }
            
            // Copy over additional properties that might exist
            if (brokenCurrency.generatesResourceId) {
                newCurrency.generatesResourceId = brokenCurrency.generatesResourceId;
            }
            if (brokenCurrency.generationRate) {
                newCurrency.generationRate = brokenCurrency.generationRate;
            }
            if (brokenCurrency.purchaseCost) {
                newCurrency.purchaseCost = brokenCurrency.purchaseCost;
            }
            if (brokenCurrency.purchaseUnlocks) {
                newCurrency.purchaseUnlocks = brokenCurrency.purchaseUnlocks;
            }
            if (brokenCurrency.purchaseEffects) {
                newCurrency.purchaseEffects = brokenCurrency.purchaseEffects;
            }
        }
        
        // Replace the broken currency
        this.currencies[id] = newCurrency;
        console.log(`Repaired currency ${id} with name: ${newCurrency.name}`);
        
        // Request UI update
        if (this.game && this.game.ui) {
            // We need to recreate the resource display to fix the name
            const resourceItem = document.getElementById(`${id}-resource`);
            if (resourceItem) {
                resourceItem.remove(); // Remove the old display with undefined name
            }
            
            // Request UI update which will create a new display
            this.game.ui.createResourceDisplay(id, newCurrency);
            this.game.ui.updateResourceDisplays(this);
            this.game.ui.updatePurchaseButtons(this);
        }
    }

    /**
     * Attempt to repair a broken stat object
     * @param {string} id - Stat ID
     */
    repairStat(id) {
        const brokenStat = this.stats[id];
        if (!brokenStat) return;
        
        // Set default names based on ID
        let defaultName = id.charAt(0).toUpperCase() + id.slice(1);
        let defaultDescription = '';
        let defaultRecoveryRate = 0;
        let defaultRecoveryDelay = 0;
        
        // Set specific defaults for known stats
        if (id === 'health') {
            defaultName = 'Health';
            defaultDescription = 'Your physical wellbeing';
            defaultRecoveryRate = 0.5;
            defaultRecoveryDelay = 3000;
        } else if (id === 'stamina') {
            defaultName = 'Stamina';
            defaultDescription = 'Your physical energy';
            defaultRecoveryRate = 0.5;
            defaultRecoveryDelay = 1000;
        } else if (id === 'mana') {
            defaultName = 'Mana';
            defaultDescription = 'Your magical energy';
            defaultRecoveryRate = 0.3;
            defaultRecoveryDelay = 5000;
        }
        
        // Create a new Stat instance based on the broken one's data
        const newStat = new Stat({
            id: id,
            name: brokenStat.name || defaultName,
            description: brokenStat.description || defaultDescription,
            initial: brokenStat.current || 0,
            max: brokenStat.max || 10,
            unlocked: brokenStat.unlocked || false,
            recoveryRate: brokenStat.recoveryRate || defaultRecoveryRate,
            recoveryDelay: brokenStat.recoveryDelay || defaultRecoveryDelay,
            game: this.game
        });
        
        // Copy over the current value explicitly
        newStat.current = brokenStat.current || 0;
        
        // Copy over the lastDamaged property if it exists
        if (brokenStat.lastDamaged !== undefined) {
            newStat.lastDamaged = brokenStat.lastDamaged;
        }
        
        // Replace the broken stat
        this.stats[id] = newStat;
        console.log(`Repaired stat ${id} with name: ${newStat.name}`);
        
        // Request UI update
        if (this.game && this.game.ui) {
            this.game.ui.updateResourceDisplays(this);
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
        
        // Serialize stats with error handling
        for (const [id, stat] of Object.entries(this.stats)) {
            try {
                if (stat && typeof stat.serialize === 'function') {
                    saveData.stats[id] = stat.serialize();
                } else {
                    // Fallback serialization for broken stat objects
                    saveData.stats[id] = {
                        current: stat.current || 0,
                        max: stat.max || 0,
                        unlocked: stat.unlocked || false,
                        lastDamaged: stat.lastDamaged || 0
                    };
                    console.warn(`Using fallback serialization for stat ${id}`);
                }
            } catch (error) {
                console.error(`Error serializing stat ${id}:`, error);
                
                // Still save basic properties
                saveData.stats[id] = {
                    current: stat.current || 0,
                    max: stat.max || 0,
                    unlocked: stat.unlocked || false
                };
            }
        }
        
        // Serialize currencies with error handling
        for (const [id, currency] of Object.entries(this.currencies)) {
            try {
                if (currency && typeof currency.serialize === 'function') {
                    saveData.currencies[id] = currency.serialize();
                } else {
                    // Fallback serialization for broken currency objects
                    saveData.currencies[id] = {
                        current: currency.current || 0,
                        max: currency.max || 0,
                        unlocked: currency.unlocked || false
                    };
                    console.warn(`Using fallback serialization for currency ${id}`);
                }
            } catch (error) {
                console.error(`Error serializing currency ${id}:`, error);
                
                // Still save basic properties
                saveData.currencies[id] = {
                    current: currency.current || 0,
                    max: currency.max || 0,
                    unlocked: currency.unlocked || false
                };
            }
        }
        
        return saveData;
    }

    // Static method to load character data (updated)
    static load(saveData, game) {
        if (!saveData) return null;
        
        const character = new Character(saveData.name, game);
        character.level = saveData.level || 1;
        character.experience = saveData.experience || 0;
        
        // Load stats - properly recreate Stat objects
        if (saveData.stats) {
            for (const [id, statData] of Object.entries(saveData.stats)) {
                if (character.stats[id]) {
                    // Keep the original Stat instance and just update its properties
                    character.stats[id].deserialize(statData);
                }
            }
        }
        
        // Load currencies - properly recreate Currency objects
        if (saveData.currencies) {
            for (const [id, currencyData] of Object.entries(saveData.currencies)) {
                if (id === 'scrolls') {
                    // Handle Scroll class specifically since it's a special case
                    if (!character.currencies[id]) {
                        character.currencies[id] = new Scroll(game);
                    }
                    character.currencies[id].deserialize(currencyData);
                } else if (character.currencies[id]) {
                    // Keep the original Currency instance and update its properties
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