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
            const savedGameData = storageManager.loadGame();
            
            if (savedGameData) {
                // Restore character and game state
                const playerComponent = new CharacterComponent('player', savedGameData.components?.player?.state || {});
                gameEngine.registerComponent(playerComponent);
                gameEngine.deserialize(savedGameData);
                
                // Show game screen
                showGameScreen();
            } else {
                // No save data, show welcome screen
                showWelcomeScreen();
            }
        })
        .catch(error => {
            console.error('Failed to load game template:', error);
            showWelcomeScreen();
        });
    
    // Add save game event listener
    document.addEventListener('click', function(event) {
        if (event.target.id === 'btn-save') {
            // Save the current game state
            const saveSuccess = gameEngine.saveGame();
            
            // Provide user feedback
            alert(saveSuccess 
                ? 'Game saved successfully!' 
                : 'Failed to save game. Please try again.'
            );
        }
    });

    // Add wipe game event listener
    document.addEventListener('click', function(event) {
        if (event.target.id === 'btn-wipe') {
            // Confirm wipe action
            if (confirm('Are you sure you want to wipe your current save? This cannot be undone.')) {
                // Delete save game
                storageManager.deleteSaveGame();
                
                // Stop game engine
                gameEngine.stop();
                
                // Show welcome screen
                showWelcomeScreen();
            }
        }
    });

    // Load game view templates
    Promise.all([
        templateLoader.loadExternalTemplate('./templates/map.html', 'map'),
        templateLoader.loadExternalTemplate('./templates/actions.html', 'actions'),
        templateLoader.loadExternalTemplate('./templates/skills.html', 'skills'),
        templateLoader.loadExternalTemplate('./templates/house.html', 'house'),
        templateLoader.loadExternalTemplate('./templates/character.html', 'character'),
        templateLoader.loadExternalTemplate('./templates/adventure.html', 'adventure')
    ]).catch(error => {
        console.error('Failed to load game view templates:', error);
    });

    // Add navigation button event listener
    document.addEventListener('click', function(event) {
        const navBtn = event.target.closest('.nav-btn');
        if (navBtn) {
            // Remove active class from all buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            navBtn.classList.add('active');
            
            // Get the view to show
            const view = navBtn.getAttribute('data-view');
            
            // Render the corresponding view template
            const locationPanel = document.querySelector('[data-component-id="location-panel"]');
            const panelBody = locationPanel.querySelector('.panel-body');
            
            // Render view template with current character data
            const characterComponent = gameEngine.getComponent('player');
            const characterData = characterComponent ? characterComponent.getState() : {};
            
            templateLoader.renderTo(view, characterData, panelBody, true);
            
            // Trigger event for potential component-specific handling
            eventSystem.trigger('navigation:view:changed', { view });
        }
    });    // Add wipe game event listener
    document.addEventListener('click', function(event) {
        if (event.target.id === 'btn-wipe') {
            // Confirm wipe action
            if (confirm('Are you sure you want to wipe your current save? This cannot be undone.')) {
                // Delete save game
                storageManager.deleteSaveGame();
                
                // Stop game engine
                gameEngine.stop();
                
                // Show welcome screen
                showWelcomeScreen();
            }
        }
    });

    // Add navigation button event listener
    document.addEventListener('click', function(event) {
        const navBtn = event.target.closest('.nav-btn');
        if (navBtn) {
            // Remove active class from all buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            navBtn.classList.add('active');
            
            // Get the view to show
            const view = navBtn.getAttribute('data-view');
            
            // TODO: Implement view switching logic
            console.log(`Switching to ${view} view`);
            
            // Trigger event for potential component-specific handling
            eventSystem.trigger('navigation:view:changed', { view });
        }
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
            // Ensure value and total are numbers, and handle division by zero
            value = Number(value);
            total = Number(total);
            
            if (total === 0) return '0%';
            
            const percentage = (value / total) * 100;
            return percentage.toFixed(decimals || 0) + '%';
        });

        // Capitalize the first letter of a string
        templateLoader.registerHelper('capitalize', function(string) {
            return Helpers.capitalize(string);
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
        // Get the character component from the game engine
        const characterComponent = gameEngine.getComponent('player');
        
        // If character component exists, use its state for rendering
        const renderData = characterComponent 
            ? { 
                ...gameEngine.serialize(), 
                ...characterComponent.getState() 
            } 
            : gameEngine.serialize();
    
        // Render main game template with full character data
        templateLoader.renderTo('game', renderData, '#app');
        
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
        
        console.log('Creating character:', character);
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