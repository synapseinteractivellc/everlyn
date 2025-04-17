// main.js
import Character from './character.js';
import UI from './ui.js';
import Storage from './storage.js';
import { ActionsManager } from './actions.js';

class Game {
    constructor() {
        this.character = null;
        this.initialized = false;
        this.ui = null;
        this.storage = new Storage();
        this.actionsManager = null;
    }

    init() {
        if (this.initialized) return;
        
        // Try to load existing character
        this.loadGame();
        
        // Initialize UI
        this.ui = new UI(this);
        
        // Setup additional event listeners
        this.setupEventListeners();
        
        // Initialize actions manager (if character exists)
        if (this.character) {
            this.actionsManager = new ActionsManager(this);
        }

        // Set up auto-save interval (every 5 minutes)
        this.setupAutoSave();
        
        this.initialized = true;
        console.log('Game initialized');
        
        // If we have a character, start the game directly
        if (this.character) {
            this.startGame();
        }
    }

    setupEventListeners() {
        const characterForm = document.getElementById('character-form');
        if (characterForm) {
            characterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewCharacter();
            });
        }
        
        // Add event listeners for save and wipe buttons
        const saveButton = document.getElementById('save-game');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGame();
            });
        }
        
        const wipeButton = document.getElementById('wipe-game');
        if (wipeButton) {
            wipeButton.addEventListener('click', () => {
                this.wipeGame();
            });
        }
    }
    
    // Called by UI when section changes
    onSectionChanged(sectionName) {
        console.log(`Section changed to: ${sectionName}`);
        // Handle section-specific logic here
    }

    createNewCharacter() {
        const nameInput = document.getElementById('character-name');
        if (nameInput && nameInput.value) {
            this.character = new Character(nameInput.value);
            this.saveGame();
            
            // Initialize actions manager
            this.actionsManager = new ActionsManager(this);
            
            // Transition to the game screen
            this.startGame();
        }
    }

    startGame() {
        console.log('Starting game...');
        
        this.ui.hideElement('.welcome-container');
        this.ui.showElement('.game-container');
        
        // Initialize actions manager if not already initialized
        if (!this.actionsManager) {
            this.actionsManager = new ActionsManager(this);
        }
        
        // Update UI with character info
        this.updateUI();     
    }

    updateUI() {
        if (this.ui) {
            console.log('Updating UI with character info');
            this.ui.updateCharacterInfo(this.character);
            
            // Use the UI method to update resource displays
            this.ui.updateResourceDisplays(this.character);
        }
    }
    
    // Save game state
    saveGame() {
        if (!this.character) return false;
        
        const gameState = {
            character: this.character
            // Add other game state properties here as your game grows
        };
        
        const success = this.storage.saveGame(gameState);
        if (success) {
            console.log('Game saved successfully');
            // Optionally show a save notification
            this.ui.showNotification('Game saved successfully!');
        } else {
            console.error('Failed to save game');
            this.ui.showNotification('Failed to save game!', 'error');
        }
        
        return success;
    }

    setupAutoSave() {
        // Clear any existing interval
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Set up auto-save interval (5 minutes = 300,000 milliseconds)
        this.autoSaveInterval = setInterval(() => {
            if (this.character) {
                const success = this.saveGame();
                if (success) {
                    console.log('Auto-saved game');
                    this.ui.showNotification('Game auto-saved!');
                }
            }
        }, 300000); // 5 minutes
        
        console.log('Auto-save set up to run every 5 minutes');
    }
    
    // Load game state
    loadGame() {
        const gameState = this.storage.loadGame();
        if (!gameState) return false;
        
        try {
            // Rebuild character object from saved data
            if (gameState.character) {
                this.character = new Character(gameState.character.name);
                Object.assign(this.character, gameState.character);
                console.log('Game loaded successfully', this.character);
                return true;
            }
        } catch (error) {
            console.error('Error loading game:', error);
        }
        
        return false;
    }
    
    // Wipe game state
    wipeGame() {
        // Confirm before wiping
        if (!confirm('Are you sure you want to wipe your saved game? This cannot be undone.')) {
            return false;
        }
        
        const success = this.storage.wipeSave();
        if (success) {
            console.log('Game wiped successfully');
            // Reset the game state
            this.character = null;
    
            // Clear the adventure log
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                logContent.innerHTML = '';
            }
            
            // Clear auto-save interval
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
            }
            
            this.ui.hideElement('.game-container');
            this.ui.showElement('.welcome-container');
            
            this.ui.showNotification('Game wiped successfully!');
        } else {
            console.error('Failed to wipe game');
            this.ui.showNotification('Failed to wipe game!', 'error');
        }
        
        return success;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game instance available globally for debugging
    window.game = game;
});