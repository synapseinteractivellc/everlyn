// character-integration.js - Integrates character functionality with the UI
// This module serves as a bridge between the character management system and the game interface

import Character from './models/Character.js';
import CharacterManager from './managers/character-manager.js';
import GameState from './managers/GameState.js';
import UIManager from './managers/ui-manager.js';
import DOMCache from './managers/DOMCache.js';

/**
 * Entry point function for the game
 * Called when the player enters their name and starts the game
 */
function enterCity() {
    const playerNameInput = DOMCache.get('playerName');
    if (!playerNameInput) {
        console.error('Player name input not found');
        return;
    }
    
    const playerName = playerNameInput.value.trim();
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
    
    // Switch from landing page to main game using DOMCache
    const landingPage = DOMCache.get('landingPage');
    const mainContent = DOMCache.get('mainContent');
    
    if (landingPage && mainContent) {
        landingPage.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Update all UI bindings to reflect the initial game state
        UIManager.updateBindings(GameState);
    } else {
        console.error('Landing page or main content elements not found');
    }
}

/**
 * Function to wipe saved game data
 */
function wipeSaveData() {
    const success = CharacterManager.wipeSaveData();
    if (success) {
        // Reset GameState to ensure bound elements display default values
        GameState.setCharacter(null);
        GameState.setLocation(null);
        
        // Update UI to reflect empty state
        UIManager.updateBindings(GameState);
        
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
        const landingPage = DOMCache.get('landingPage');
        const mainContent = DOMCache.get('mainContent');
        
        if (landingPage && mainContent) {
            landingPage.style.display = 'none';
            mainContent.style.display = 'block';
            
            // Ensure all bound elements reflect the loaded game state
            UIManager.updateBindings(GameState);
        }
    } else {
        // If no saved game, ensure bound elements display default values
        UIManager.updateBindings(GameState);
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
            // This will trigger the data binding system
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