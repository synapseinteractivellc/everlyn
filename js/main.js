// main.js - Application Entry Point
// This file imports and initializes all the necessary modules

// Import our modules
import UIManager from './managers/ui-manager.js';
import './character-integration.js'; // This will execute the code in character-integration.js
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
        window.enterCity();
    });
    
    // Add event listener for wipe save button
    document.getElementById('wipe-save-btn').addEventListener('click', function() {
        window.wipeSaveData();
    });
    
    // Handle Enter key press on the name input field
    document.getElementById('player-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            window.enterCity();
        }
    });
});