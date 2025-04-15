// character-manager.js - Character Management Module
// Manages character creation, saving, loading, and updates

import Character from '../models/Character.js';
import GameState from './GameState.js';

/**
 * Character Manager - Handles all character-related operations
 */
const CharacterManager = {
    /**
     * Create a new character
     * @param {string} name - Character name
     * @param {string} charClass - Character class
     * @param {Object} config - Optional configuration
     * @returns {Character} - The created character instance
     */
    createCharacter: function(name, charClass = "Waif", config = {}) {
        const character = new Character(name, charClass, config);
        
        // Update game state with new character
        // This will trigger UI updates through the data binding system
        GameState.setCharacter(character);
        
        return character;
    },
    
    /**
     * Load a character from saved data
     * @param {Object} savedData - The saved character data
     * @returns {Character} - The loaded character instance
     */
    loadCharacter: function(savedData) {
        try {
            // Use the static fromJSON method for proper deserialization
            const character = Character.fromJSON(savedData);
            
            // Update game state with loaded character
            // This will trigger UI updates through the data binding system
            GameState.setCharacter(character);
            
            return character;
        } catch (error) {
            console.error('Error loading character:', error);
            // Fallback to the old method if the new one fails
            const character = new Character(savedData.name, savedData.charClass);
            Object.assign(character, savedData);
            
            // Update game state with loaded character
            GameState.setCharacter(character);
            
            return character;
        }
    },
    
    /**
     * Save the current game state to localStorage
     * @returns {boolean} - Success status
     */
    saveGame: function() {
        if (!GameState.character) return false;
        
        const saveData = {
            character: GameState.character,
            location: GameState.currentLocation,
            timestamp: Date.now(),
            version: '1.0.0' // Adding version for future compatibility
        };
        
        try {
            localStorage.setItem('everlynSaveData', JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            // Try to save with less data if the first attempt failed (might be quota issues)
            try {
                const minimalSaveData = {
                    character: {
                        name: GameState.character.name,
                        charClass: GameState.character.charClass,
                        level: GameState.character.level,
                        xp: GameState.character.xp
                    },
                    location: GameState.currentLocation,
                    timestamp: Date.now(),
                    version: '1.0.0',
                    isMinimal: true
                };
                localStorage.setItem('everlynSaveData', JSON.stringify(minimalSaveData));
                console.log('Minimal game data saved successfully');
                return true;
            } catch (fallbackError) {
                console.error('Critical error saving game:', fallbackError);
                return false;
            }
        }
    },
    
    /**
     * Load game data from localStorage
     * @returns {boolean} - Success status
     */
    loadGame: function() {
        const savedData = localStorage.getItem('everlynSaveData');
        if (!savedData) return false;
        
        try {
            const gameData = JSON.parse(savedData);
            
            // Check for version compatibility
            const savedVersion = gameData.version || '0.0.1';
            if (this._isVersionCompatible(savedVersion)) {
                // Load character
                if (gameData.character) {
                    this.loadCharacter(gameData.character);
                }
                
                // Set location
                if (gameData.location) {
                    GameState.setLocation(gameData.location);
                } else {
                    GameState.setLocation('City Square'); // Default location
                }
                
                console.log(`Game loaded successfully (save version: ${savedVersion})`);
                return true;
            } else {
                console.warn(`Save version ${savedVersion} may not be compatible with current game version`);
                // Still try to load, but warn the user
                if (gameData.character) {
                    this.loadCharacter(gameData.character);
                }
                
                if (gameData.location) {
                    GameState.setLocation(gameData.location);
                } else {
                    GameState.setLocation('City Square');
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error loading save data:', error);
            
            // Ensure default values are set even if load fails
            GameState.setLocation('City Square');
            
            return false;
        }
    },
    
    /**
     * Wipe all saved game data
     * @returns {boolean} - Success status
     */
    wipeSaveData: function() {
        try {
            localStorage.removeItem('everlynSaveData');
            console.log('Save data wiped successfully');
            
            // Reset game state to ensure UI reflects wiped state
            // This is important for data binding
            GameState.setCharacter(null);
            GameState.setLocation(null);
            
            return true;
        } catch (error) {
            console.error('Error wiping save data:', error);
            return false;
        }
    },
    
    /**
     * Add experience points to the character
     * @param {number} amount - Amount of XP to add
     * @returns {boolean} - Success status
     */
    addExperience: function(amount) {
        if (!GameState.character) return false;
        
        GameState.character.gainXP(amount);
        
        // Notify subscribers of character changes
        // This will trigger UI updates through data binding
        GameState.notify('character'); 
        
        this.saveGame(); // Auto-save after XP gain
        return true;
    },
    
    /**
     * Update a character resource
     * @param {string} resource - Resource name
     * @param {number} amount - Amount to add/subtract
     * @returns {boolean} - Success status
     */
    updateResource: function(resource, amount) {
        if (!GameState.character) return false;
        
        const success = GameState.character.updateResource(resource, amount);
        if (success) {
            // Notify subscribers of character changes
            // This will trigger UI updates through data binding
            GameState.notify('character'); 
        }
        return success;
    },
    
    /**
     * Update a character stat
     * @param {string} stat - Stat name
     * @param {number} amount - Amount to add/subtract
     * @returns {boolean} - Success status
     */
    updateStat: function(stat, amount) {
        if (!GameState.character) return false;
        
        const success = GameState.character.updateStat(stat, amount);
        if (success) {
            // Notify subscribers of character changes
            // This will trigger UI updates through data binding
            GameState.notify('character'); 
        }
        return success;
    },
    
    /**
     * Update an elemental mana value
     * @param {string} element - Element name
     * @param {number} amount - Amount to add/subtract
     * @returns {boolean} - Success status
     */
    updateElementalMana: function(element, amount) {
        if (!GameState.character) return false;
        
        const success = GameState.character.updateElementalMana(element, amount);
        if (success) {
            // Notify subscribers of character changes
            // This will trigger UI updates through data binding
            GameState.notify('character'); 
        }
        return success;
    },
    
    /**
     * Initialize auto-save feature
     * @param {number} interval - Auto-save interval in milliseconds
     */
    initAutoSave: function(interval = 60000) {
        this.autoSaveInterval = setInterval(() => this.saveGame(), interval);
        console.log(`Auto-save initialized with ${interval}ms interval`);
    },
    
    /**
     * Check if a saved version is compatible with current game version
     * @param {string} savedVersion - Version from saved data
     * @returns {boolean} - Whether versions are compatible
     * @private
     */
    _isVersionCompatible: function(savedVersion) {
        // For now, consider all versions compatible
        // In the future, implement version compatibility logic
        return true;
    },
    
    /**
     * Calculate the required XP for a specific level
     * @param {number} level - Target level
     * @returns {number} - Required XP
     */
    getXPForLevel: function(level) {
        let xp = 0;
        let xpToNextLevel = 100; // Starting XP needed for level 2
        
        for (let i = 1; i < level; i++) {
            xp += xpToNextLevel;
            xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
        }
        
        return xp;
    },
    
    /**
     * Clear auto-save on game end
     */
    cleanup: function() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
};

export default CharacterManager;