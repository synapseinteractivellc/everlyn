// main.js - Application Entry Point
// This file imports and initializes all the necessary modules

// Import core managers
import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import CharacterManager from './managers/character-manager.js';

// Import integration modules
import { enterCity, wipeSaveData } from './character-integration.js';
import './map.js'; // This will execute the code in map.js

// Set up event listeners for tab navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                UIManager.showTab(tabId);
            }
        });
    });
    
    // Add event listener for enter city button
    document.getElementById('enter-city-btn').addEventListener('click', function() {
        enterCity();
    });
    
    // Add event listener for wipe save button
    document.getElementById('wipe-save-btn').addEventListener('click', function() {
        wipeSaveData();
    });
    
    // Handle Enter key press on the name input field
    document.getElementById('player-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            enterCity();
        }
    });
    
    // Log app initialization
    console.log('Everlyn app initialized successfully');
});