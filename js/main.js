// main.js
import Character from './character.js';
import UI from './ui.js';
import Storage from './storage.js';
import { ActionsManager } from './actions.js';
import { UpgradesManager } from './upgrades.js';
import { SkillsManager } from './skill.js';
import EventEmitter from './eventEmitter.js';
import GameState from './state.js';
import Stat from './stat.js';

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

        // initialize game state
        this.state = new GameState();
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

            // Set up state subscriptions
            this.setupStateSubscriptions();
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

    // Method to set up state subscriptions
    setupStateSubscriptions() {
        // First set up standard subscriptions provided by the state system
        this.state.setupStandardSubscriptions();
        
        // Subscribe to character stat changes
        this.state.subscribe('character.stats', (newValue, oldValue, path) => {
            // Update UI when stats change
            if (this.ui) {                
                console.log('Character stats updated:', newValue, oldValue);
                this.ui.updateResourceDisplays(this.character);
            }
        });
        
        // Subscribe to currency changes
        this.state.subscribe('character.currencies', (newValue, oldValue, path) => {
            // Update UI when currencies change
            if (this.ui) {
                console.log('Character currencies updated:', newValue, oldValue);
                this.ui.updateResourceDisplays(this.character);
                this.ui.updatePurchaseButtons(this.character);
            }
        });
        
        // Subscribe to UI state changes
        this.state.subscribe('ui.activeSection', (newValue, oldValue) => {
            if (newValue !== oldValue) {
                console.log(`UI section changed from ${oldValue} to ${newValue}`);
                // Update active section in UI
                if (this.ui) {
                    this.ui.switchSection(newValue);
                }
            }
        });
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
        // Update state
        this.state.setState('ui.activeSection', sectionName);
        // Handle section-specific logic here
    }

    createNewCharacter() {
        const nameInput = document.getElementById('character-name');
        if (nameInput && nameInput.value) {
            this.character = new Character(nameInput.value, this);

            // Update the state with initial character data
            this.state.setState('character', this.character.save());
            this.state.setState('settings.timestamp', Date.now());

            // Save the game
            this.saveGame();

            // Initialize actions manager
            this.actionsManager = new ActionsManager(this);

            // Transition to game view
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
            console.log("SAVE: Starting save process in Game.saveGame()");

            // Create a complete game state object
            const gameStateData = {
                character: this.character.save(),
                settings: {
                    version: 1,
                    timestamp: Date.now()
                }
            };
            console.log("SAVE: Character data after character.save():", gameStateData.character);
            console.log("SAVE: Character stats from gameStateData:", gameStateData.character.stats);
            
            // Add actions data explicitly to the save
            if (this.actionsManager) {
                gameStateData.actions = this.actionsManager.saveData();
                console.log("SAVE: Adding actions data:", gameStateData.actions);
            }

            // Add skills data explicitly to the save
            if (this.skillsManager) {
                gameStateData.skills = this.skillsManager.saveData();
                console.log("SAVE: Adding skills data:", gameStateData.skills);
            }

            // Update our state object
            this.state.loadState(gameStateData);
            console.log("SAVE: State after loadState:", this.state.getState());
        
            // Save the entire state
            const success = this.storage.saveGame(this.state.serialize());
            console.log("SAVE: Serialized state sent to storage:", this.state.serialize());
        

            if (success) {
                console.log('Game saved successfully', gameStateData);
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
        console.log("LOAD: Starting load process in Game.loadGame()");
        
        const savedData = this.storage.loadGame();
        console.log("LOAD: Data received from storage:", savedData);
        
        if (!savedData) {
            console.log("LOAD: No saved data found");
            return false;
        }

        try {
            // Load the saved data into our state object
            this.state.loadState(savedData);
            console.log("LOAD: State after loadState:", this.state.getState());
            
            // Get character data from state
            const characterData = this.state.getState('character');
            console.log("LOAD: Character data from state:", characterData);
            
            // Load actions data if available
            if (savedData.actions && this.actionsManager) {
                console.log("LOAD: Loading actions data:", savedData.actions);
                this.actionsManager.loadSavedData(savedData.actions);
            }

            if (characterData) {
                // Specifically log the stats before loading the character
                console.log("LOAD: Stats data before Character.load():", characterData.stats);
                
                // Rebuild character object from saved data
                this.character = Character.load(characterData, this);
                console.log("LOAD: Character after Character.load():", this.character);
                console.log("LOAD: Character stats after load:", this.character.stats);
                
                // Check stamina specifically
                if (this.character.stats.stamina) {
                    console.log("LOAD: Stamina after load:", this.character.stats.stamina);
                    console.log("LOAD: Stamina current value:", this.character.stats.stamina.current);
                    console.log("LOAD: Stamina is instance of Stat:", this.character.stats.stamina instanceof Stat);
                }
                
                // Log successful load
                console.log("LOAD: Game loaded successfully");
                return true;
            }
        } catch (error) {
            console.error("LOAD ERROR:", error);
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

    repairCharacterState() {
        if (!this.character) return;
        
        console.log("Checking and repairing character state...");
        
        // Check and repair stats
        for (const statId in this.character.stats) {
            console.log(`Checking stat: ${statId}, ${this.character.stats[statId].current}`);
            const stat = this.character.stats[statId];
            
            // Check if stat is a proper Stat instance with required methods
            if (!stat || typeof stat.update !== 'function' || typeof stat.add !== 'function') {
                console.warn(`Repairing broken stat: ${statId}`);
                this.character.repairStat(statId);
            } else {
                // Stat object is intact, but make sure the current value is correct
                const stateStatData = this.state.getState(`character.stats.${statId}`);
                if (stateStatData && stateStatData.current !== undefined) {
                    console.log(`Setting ${statId} current value from state: ${stateStatData.current}`);
                    stat.current = stateStatData.current;
                }
            }
        }
        
        // Check and repair currencies
        for (const currencyId in this.character.currencies) {
            const currency = this.character.currencies[currencyId];
            
            // Check if currency is a proper Currency instance with required methods
            if (!currency || typeof currency.update !== 'function' || typeof currency.add !== 'function') {
                console.warn(`Repairing broken currency: ${currencyId}`);
                this.character.repairCurrency(currencyId);
            } else {
                // Currency object is intact, but make sure the current value is correct
                const stateCurrencyData = this.state.getState(`character.currencies.${currencyId}`);
                if (stateCurrencyData && stateCurrencyData.current !== undefined) {
                    console.log(`Setting ${currencyId} current value from state: ${stateCurrencyData.current}`);
                    currency.current = stateCurrencyData.current;
                }
            }
        }
        
        console.log("Character state repair complete");
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game instance available globally for debugging
    window.game = game;
});