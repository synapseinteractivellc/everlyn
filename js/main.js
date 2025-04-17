// main.js
import Character from './character.js';
import UI from './ui.js';
import Storage from './storage.js';
import { ActionsManager } from './actions.js';
import { UpgradesManager } from './upgrades.js';
import { SkillsManager } from './skill.js';
import EventEmitter from './eventEmitter.js';

class Game {
    constructor() {
        this.character = null;
        this.initialized = false;
        this.ui = null;
        this.storage = new Storage();
        this.actionsManager = null;
        this.upgradesManager = null;
        this.skillsManager = null;
        this.events = new EventEmitter();
    }

    /**
     * Register event handlers for the game and UI
     * @returns {void}
     */
    registerEventHandlers() {
        if (this.upgradesManager) {
            // Register event handlers for upgrade manager
            this.events.on('resource.changed', (data) => {
                this.upgradesManager.onResourceChanged(data);
            });
        }
        
        if (this.ui) {
            // Register event handlers for UI
            this.events.on('resource.changed', (data) => {
                this.ui.onResourceChanged(data);
            });
        }
    }

    update(timestamp) {
        // Calculate delta time (in seconds)
        const now = timestamp || performance.now();
        const deltaTime = (now - (this.lastUpdate || now)) / 1000;
        this.lastUpdate = now;
        
        // Only update if character exists
        if (this.character) {
            // Update character resources
            this.character.update(deltaTime);
            
            // Update UI periodically (not every frame to avoid performance issues)
            this.resourceUpdateCounter = (this.resourceUpdateCounter || 0) + deltaTime;
            if (this.resourceUpdateCounter >= 0.1) { // Update UI 10 times per second
                this.ui.updateResourceDisplays(this.character);
                
                // Update purchase buttons less frequently
                this.purchaseUpdateCounter = (this.purchaseUpdateCounter || 0) + 1;
                if (this.purchaseUpdateCounter >= 10) { // Once per second
                    this.ui.updatePurchaseButtons(this.character);
                    this.purchaseUpdateCounter = 0;
                }
                
                this.resourceUpdateCounter = 0;
            }
        }
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }

    init() {
        if (this.initialized) return;
        
        // Initialize UI
        this.ui = new UI(this);
        
        // Try to load existing character
        this.loadGame();       
        
        // Setup additional event listeners
        this.setupEventListeners();
        
        // Initialize actions manager (if character exists)
        if (this.character) {
            this.actionsManager = new ActionsManager(this);
            this.upgradesManager = new UpgradesManager(this);
            this.skillsManager = new SkillsManager(this);
            
            // Register event handlers after managers are created
            this.registerEventHandlers();
        }

        // Set up auto-save interval (every 5 minutes)
        this.setupAutoSave();
        
        this.initialized = true;
        console.log('Game initialized');

        // Start update loop
        this.lastUpdate = performance.now();
        this.update();
        
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
            this.character = new Character(nameInput.value, this);
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

        // Initialize upgrades manager if not already initialized
        if (!this.upgradesManager) {
            this.upgradesManager = new UpgradesManager(this);

            // Register event handlers if they weren't registered before
            this.registerEventHandlers();
        }

        // Initialize skills manager if not already initialized
        if (!this.skillsManager) {
            this.skillsManager = new SkillsManager(this);
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
        
        try {
            // Create a complete game state object
            const gameState = {
                character: this.character.save()
            };
            
            // Add skills data explicitly to the save
            if (this.skillsManager) {
                gameState.skills = this.skillsManager.saveData();
            }
            
            const success = this.storage.saveGame(gameState);
            if (success) {
                console.log('Game saved successfully');
                if (this.ui) {
                    this.ui.showNotification('Game saved successfully!');
                }
            } else {
                console.error('Failed to save game');
                if (this.ui) {
                    this.ui.showNotification('Failed to save game!', 'error');
                }
            }
            
            return success;
        } catch (error) {
            console.error('Error saving game:', error);
            if (this.ui) {
                this.ui.showNotification('Error saving game!', 'error');
            }
            return false;
        }
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
                this.character = Character.load(gameState.character, this);
                
                // Set up skills manager if needed
                if (!this.skillsManager) {
                    this.skillsManager = new SkillsManager(this);
                }
                
                // Load skill data if it exists
                if (gameState.skills) {
                    // Load skills directly from the game state
                    this.skillsManager.loadSavedData({skills: gameState.skills});
                }
                
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
            
            // Show notification before refresh
            this.ui.showNotification('Game wiped successfully! Refreshing page...');
            
            // Wait a moment for the notification to be visible, then refresh
            setTimeout(() => {
                window.location.reload();
            }, 500); // 0.5 seconds delay
            
            return true;
        } else {
            console.error('Failed to wipe game');
            this.ui.showNotification('Failed to wipe game!', 'error');
            return false;
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game instance available globally for debugging
    window.game = game;
});