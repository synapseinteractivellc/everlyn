// character-integration.js - Integrates character functionality with the UI
// This module serves as a bridge between the character management system and the game interface

import Character from './models/Character.js';
import CharacterManager from './managers/character-manager.js';
import GameState from './managers/GameState.js';
import UIManager from './managers/ui-manager.js';

/**
 * Entry point function for the game
 * Called when the player enters their name and starts the game
 */
function enterCity() {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert('Please enter your name to proceed.');
        return;
    }
    
    // Create a new character instance with the player's name
    CharacterManager.createCharacter(playerName);
    
    // Set a default location
    GameState.setLocation('City Square');
    
    // Store the character in localStorage for persistence between sessions
    CharacterManager.saveGame();
    
    // Switch from landing page to main game
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

/**
 * Function to wipe saved game data
 */
function wipeSaveData() {
    const success = CharacterManager.wipeSaveData();
    if (success) {
        alert('All saved data has been wiped.');
    } else {
        alert('Failed to wipe saved data. Please try again.');
    }
}

/**
 * Check if there's saved game data and load it
 * @returns {boolean} - True if game data was loaded successfully
 */
function checkAndLoadSavedGame() {
    const loaded = CharacterManager.loadGame();
    
    if (loaded) {
        // Skip the landing page and go straight to the game
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
    
    return loaded;
}

/**
 * Initialize character-related UI and event handlers
 */
function initCharacterSystem() {
    // Subscribe to state changes for UI updates
    GameState.subscribe('character', () => {
        if (GameState.character) {
            UIManager.updateAllUI(GameState.character);
        }
    });
    
    // Try to load saved game
    checkAndLoadSavedGame();
    
    // Initialize progress bars
    UIManager.initProgressBars();
    
    // Set up auto-save every minute
    CharacterManager.initAutoSave(60000);
}

// Make functions globally available
window.enterCity = enterCity;
window.wipeSaveData = wipeSaveData;

// Initialize character system when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCharacterSystem);

// Export functions for other modules
export {
    enterCity,
    wipeSaveData,
    checkAndLoadSavedGame,
    initCharacterSystem
};