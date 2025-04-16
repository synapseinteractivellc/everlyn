/**
 * Main Application Entry Point
 */
(function() {
    'use strict';
    
    // Game initialization
    // Main.js - Update the initGame function
function initGame() {
    console.log('Initializing Everlyn: City of Wonder...');
    
    // Register Handlebars helpers
    registerHandlebarsHelpers();
    
    // Load game templates first
    templateLoader.loadExternalTemplate('./templates/game.html', 'game')
        .then(() => {
            // Check for existing character after templates are loaded
            if (storageManager.hasSaveGame()) {
                // Attempt to load saved game
                if (gameEngine.loadGame()) {
                    // Show game screen
                    showGameScreen();
                } else {
                    // Show welcome screen if load failed
                    showWelcomeScreen();
                }
            } else {
                // No save data, show welcome screen
                showWelcomeScreen();
            }
        })
        .catch(error => {
            console.error('Failed to load game template:', error);
            showWelcomeScreen();
        });
    
    // Listen for character creation
    document.addEventListener('submit', handleFormSubmit);
}
    
    // Register custom Handlebars helpers
    function registerHandlebarsHelpers() {
        // Format number with commas
        templateLoader.registerHelper('formatNumber', function(value) {
            return Helpers.formatNumber(value);
        });
        
        // Format percentage
        templateLoader.registerHelper('formatPercentage', function(value, total, decimals) {
            return Helpers.formatPercentage(value, total, decimals || 0);
        });
        
        // Format time
        templateLoader.registerHelper('formatTime', function(seconds) {
            return Helpers.formatTime(seconds);
        });
        
        // If equals helper
        templateLoader.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        });
        
        // If contains helper
        templateLoader.registerHelper('ifContains', function(array, item, options) {
            if (!array || !Array.isArray(array)) {
                return options.inverse(this);
            }
            return array.includes(item) ? options.fn(this) : options.inverse(this);
        });
    }
    
    // Show welcome screen
    function showWelcomeScreen() {
        // Render welcome template
        templateLoader.renderTo('welcome', {}, '#app');
    }
    
    // Show game screen
    function showGameScreen() {
        // Render main game template
        templateLoader.renderTo('game', gameEngine.serialize(), '#app');
        
        // Start game engine
        gameEngine.start();
    }
    
    // Handle form submit
    function handleFormSubmit(event) {
        // Check if it's the character creation form
        if (event.target.id === 'character-form') {
            event.preventDefault();
            
            const characterName = document.getElementById('character-name').value.trim();
            
            if (characterName) {
                createCharacter(characterName);
            }
        }
    }
    
    // Create a new character
    function createCharacter(name) {
        // Create character component
        const character = new CharacterComponent('player', {
            name: name,
            class: 'Waif'
        });
        
        // Register with game engine
        gameEngine.registerComponent(character);
        
        // Initialize game engine
        gameEngine.initialize({
            activeLocation: 'city-gate'
        });
        
        // Save initial game state
        gameEngine.saveGame();
        
        // Show game screen
        showGameScreen();
    }
    
    // Initialize after page load
    document.addEventListener('DOMContentLoaded', initGame);
})();