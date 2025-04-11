// character-manager.js - Character Management Module
// Manages character creation, saving, loading, and updates

import Character from '../models/Character.js';
import GameState from './GameState.js';
import UIManager from './ui-manager.js';

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
        GameState.setCharacter(character);
        return character;
    },
    
    /**
     * Load a character from saved data
     * @param {Object} savedData - The saved character data
     * @returns {Character} - The loaded character instance
     */
    loadCharacter: function(savedData) {
        const character = new Character(savedData.name, savedData.charClass);
        Object.assign(character, savedData);
        GameState.setCharacter(character);
        return character;
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
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('everlynSaveData', JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
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
            
            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading save data:', error);
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
        GameState.notify('character'); // Trigger UI update
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
            GameState.notify('character'); // Trigger UI update
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
            GameState.notify('character'); // Trigger UI update
        }
        return success;
    },
    
    /**
     * Initialize auto-save feature
     * @param {number} interval - Auto-save interval in milliseconds
     */
    initAutoSave: function(interval = 60000) {
        setInterval(() => this.saveGame(), interval);
        console.log(`Auto-save initialized with ${interval}ms interval`);
    }
};

export default CharacterManager;