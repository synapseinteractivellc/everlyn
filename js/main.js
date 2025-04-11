// main.js - Application Entry Point
// This file imports and initializes all the necessary modules

// Import core managers
import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import CharacterManager from './managers/character-manager.js';
import DOMCache from './managers/DOMCache.js';
import TemplateManager from './managers/TemplateManager.js';

// Import services
import LocationService from './services/LocationService.js';

// Import integration modules
import { enterCity, wipeSaveData } from './character-integration.js';
import './map.js'; // This will execute the code in map.js

// Set up event listeners for tab navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners to tab buttons using DOMCache
    const tabButtons = DOMCache.getAll('tabButtons');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                UIManager.showTab(tabId);
            }
        });
    });
    
    // Add event listener for enter city button
    const enterCityBtn = DOMCache.get('enterCityBtn');
    if (enterCityBtn) {
        enterCityBtn.addEventListener('click', function() {
            enterCity();
        });
    }
    
    // Add event listener for wipe save button
    const wipeSaveBtn = DOMCache.get('wipeSaveBtn');
    if (wipeSaveBtn) {
        wipeSaveBtn.addEventListener('click', function() {
            wipeSaveData();
        });
    }
    
    // Handle Enter key press on the name input field
    const playerNameInput = DOMCache.get('playerName');
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                enterCity();
            }
        });
    }
    
    // Log app initialization
    console.log('Everlyn app initialized successfully');
});