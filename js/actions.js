// actions.js
// Handles all character actions in the game

/**
 * Base Action class that all game actions will extend
 */
class Action {
    /**
     * Create a new action
     * @param {Object} game - The game instance
     * @param {Object} config - Configuration for the action
     */
    constructor(game, config) {
        this.game = game;
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.costPerSecond = config.costPerSecond || {}; // Resources consumed per second
        this.gainPerSecond = config.gainPerSecond || {}; // Resources gained per second
        this.duration = config.duration || 1; // Time in seconds to complete one cycle
        this.rewards = config.rewards || {}; // Rewards gained on completion
        this.autoRepeat = config.autoRepeat !== undefined ? config.autoRepeat : true;
        this.isActive = false;
        this.progress = 0; // 0 to 1 (representing 0% to 100%)
        this.completionCount = 0;
        this.progressInterval = null;
        this.tooltipText = config.tooltipText || "";
        
        // Message templates for adventure log
        this.successMessages = config.successMessages || ["You completed {actionName}."];
        
        // Initialize in character if doesn't exist
        if (!this.game.character.actions) {
            this.game.character.actions = {};
        }
        
        // Load saved data if exists
        if (this.game.character.actions[this.id]) {
            this.completionCount = this.game.character.actions[this.id].completionCount || 0;
        } else {
            // Initialize action data in character
            this.game.character.actions[this.id] = {
                completionCount: 0
            };
        }
    }
    
    /**
     * Start the action
     * @returns {boolean} - True if action started successfully
     */
    start() {
        if (this.isActive) return false;
        
        this.isActive = true;
        this.progress = 0;
        
        // Update UI to show action is active
        this.updateUI();
        
        // Set interval to update progress
        const intervalTime = 100; // Update every 100ms
        this.progressInterval = setInterval(() => {
            this.update(intervalTime / 1000); // Convert ms to seconds
        }, intervalTime);
        
        return true;
    }
    
    /**
     * Stop the action
     */
    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        clearInterval(this.progressInterval);
        this.progressInterval = null;
        
        // Update UI to show action is stopped
        this.updateUI();
        
        // Update current action display
        document.getElementById('current-action').textContent = 'None';
    }
    
    /**
     * Update action progress
     * @param {number} deltaTime - Time passed in seconds
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Calculate resource costs for this update interval
        const canContinue = this.applyCosts(deltaTime);
        if (!canContinue) {
            this.stop();
            return;
        }

        // Apply continuous gains
        this.applyGains(deltaTime);
        
        // Update progress
        this.progress += deltaTime / this.duration;
        
        // Check if action is complete
        if (this.progress >= 1) {
            this.complete();
            
            // Auto-repeat if enabled
            if (this.autoRepeat) {
                this.progress = 0;
            } else {
                this.stop();
            }
        }
        
        // Update UI
        this.updateUI();
    }

    /**
     * Apply resource gains per second
     * @param {number} deltaTime - Time passed in seconds
     */
    applyGains(deltaTime) {
        const character = this.game.character;
        
        // Apply gains to each resource
        for (const resourceId in this.gainPerSecond) {
            const gain = this.gainPerSecond[resourceId] * deltaTime;
            
            // Get resource
            const resource = character.getResource(resourceId);
            if (!resource) {
                console.error(`Resource not found: ${resourceId}`);
                continue;
            }
            
            // Apply gain
            resource.add(gain);
        }
        
        // Update UI to show the resource changes in real-time
        this.game.ui.updateResourceDisplays(character);
        
        // Check if we should stop the action (all resources are full)
        this.checkAutoStop();
    }
    
    /**
     * Check if action should automatically stop (e.g. when resources are full)
     * Override in subclasses if needed
     */
    checkAutoStop() {
        // Default implementation does nothing
    }
    
    /**
     * Apply resource costs
     * @param {number} deltaTime - Time passed in seconds
     * @returns {boolean} - False if action should stop due to insufficient resources
     */
    applyCosts(deltaTime) {
        const character = this.game.character;
        
        // Check if we have enough resources
        for (const resourceId in this.costPerSecond) {
            const cost = this.costPerSecond[resourceId] * deltaTime;
            
            // Get resource
            const resource = character.getResource(resourceId);
            if (!resource) {
                console.error(`Resource not found: ${resourceId}`);
                return false;
            }
            
            // Check if we have enough
            if (resource.current < cost) {
                return false;
            }
            
            // Apply cost
            resource.remove(cost);
        }
        
        // Update UI to show the resource changes in real-time
        this.game.ui.updateResourceDisplays(character);
        
        return true;
    }
    
    /**
     * Handle action completion
     */
    complete() {
        // Award rewards
        this.applyRewards();
        
        // Increment completion counter
        this.completionCount++;
        this.game.character.actions[this.id].completionCount = this.completionCount;
        
        // Log to adventure log
        this.logCompletion();
    }
    
    /**
     * Apply rewards when action completes
     */
    applyRewards() {
        // Override in subclasses
    }
    
    /**
     * Add message to adventure log
     */
    logCompletion() {
        // Get random success message
        let message = this.successMessages[Math.floor(Math.random() * this.successMessages.length)];
        
        // Replace placeholders
        message = message.replace('{actionName}', this.name);
        
        // Find adventure log and add entry
        const logContent = document.querySelector('.log-content');
        if (logContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = message;
            logContent.insertBefore(logEntry, logContent.firstChild);
            
            // Limit log entries
            while (logContent.children.length > 50) {
                logContent.removeChild(logContent.lastChild);
            }
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Update current action display
        const currentActionElement = document.getElementById('current-action');
        if (currentActionElement) {
            if (this.isActive) {
                const percent = Math.floor(this.progress * 100);
                currentActionElement.textContent = `${this.name} (${percent}%)`;
            }
        }
        
        // Update action button (if any)
        const actionButton = document.querySelector(`.action-button[data-action="${this.id}"]`);
        if (actionButton) {
            const progressBar = actionButton.querySelector('.action-progress');
            if (progressBar) {
                progressBar.style.width = `${this.progress * 100}%`;
            }
            
            // Update button state
            if (this.isActive) {
                actionButton.classList.add('active');
            } else {
                actionButton.classList.remove('active');
            }
        }
    }
    
    /**
     * Create button element for action
     * @returns {HTMLElement} - The button element
     */
    createButtonElement() {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.dataset.action = this.id;
        
        // Create button content
        const nameElement = document.createElement('span');
        nameElement.className = 'action-name';
        nameElement.textContent = this.name;
        
        const descElement = document.createElement('span');
        descElement.className = 'action-description';
        descElement.textContent = this.description;
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'action-progress-container';
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'action-progress';
        progressBar.style.width = '0%';
        
        // Add progress bar to container
        progressContainer.appendChild(progressBar);
        
        // Add elements to button
        button.appendChild(nameElement);
        button.appendChild(descElement);
        button.appendChild(progressContainer);
        
        // Add event listener
        button.addEventListener('click', () => {
            if (this.isActive) {
                this.stop();
            } else {
                // Stop any other active actions
                ActionsManager.stopAllActions(this.game);
                
                // Start this action
                this.start();
            }
        });
        
        return button;
    }
}

/**
 * BegForCoins action - First action available to player
 */
class BegForCoins extends Action {
    constructor(game) {
        super(game, {
            id: 'begForCoins',
            name: 'Beg for Coins',
            description: 'Hold out your hand and hope for the best',
            costPerSecond: {
                stamina: 1 // 1 stamina per second
            },
            duration: 2, // 2 seconds to complete
            autoRepeat: true,
            tooltipText: "Beg the citizens of Everlyn for spare coins. Uses stamina, but might earn you some gold.",
            successMessages: [
                "You begged for coins but were shunned by all: 0 gold for your efforts.",
                "You begged for coins and found a generous soul: 1 gold for your efforts.",
                "You begged for coins and got lucky: 2 gold for your efforts."
            ]
        });
    }
    
    /**
     * Apply rewards with weighted randomization
     * 90% chance for 0-1 gold
     * 10% chance for 2 gold
     */
    applyRewards() {
        const character = this.game.character;
        let gold = 0;
        
        // Weighted random calculation
        const roll = Math.random();
        if (roll < 0.45) {
            gold = 0; // 45% chance for 0 gold
            this.lastRewardMessage = this.successMessages[0];
        } else if (roll < 0.9) { 
            gold = 1; // 45% chance for 1 gold
            this.lastRewardMessage = this.successMessages[1];
        } else {
            gold = 2; // 10% chance for 2 gold
            this.lastRewardMessage = this.successMessages[2];
        }
        
        // Add gold to character
        if (gold > 0) {
            const goldResource = character.getResource('gold');
            if (goldResource) {
                goldResource.add(gold);
            }
        }
        
        // Update UI
        this.game.ui.updateResourceDisplays(character);
    }
    
    /**
     * Override log completion to use the specific message based on reward
     */
    logCompletion() {
        // Find adventure log and add entry
        const logContent = document.querySelector('.log-content');
        if (logContent && this.lastRewardMessage) {
            const logEntry = document.createElement('p');
            logEntry.textContent = this.lastRewardMessage;
            logContent.insertBefore(logEntry, logContent.firstChild);
            
            // Limit log entries
            while (logContent.children.length > 50) {
                logContent.removeChild(logContent.lastChild);
            }
        }
    }
}

/**
 * Rest action - Allows player to recover stamina and health
 */
class Rest extends Action {
    constructor(game) {
        super(game, {
            id: 'rest',
            name: 'Rest',
            description: 'Take a moment to catch your breath and recover',
            costPerSecond: {}, // No cost
            gainPerSecond: {
                health: 2,    // 2 health per second (10 over 5 seconds)
                stamina: 2    // 2 stamina per second (10 over 5 seconds)
            },
            duration: 5, // 5 seconds to complete
            autoRepeat: true,
            tooltipText: "Rest to recover your stamina and health. Automatically stops when you're fully rested.",
            successMessages: [
                "You rested for a moment and feel somewhat refreshed.",
                "You took a short break to catch your breath.",
                "A brief rest has restored some of your energy."
            ]
        });
    }
    
    /**
     * Check if we should stop resting (when both health and stamina are full)
     */
    checkAutoStop() {
        const character = this.game.character;
        const health = character.getResource('health');
        const stamina = character.getResource('stamina');
        
        if (health && stamina && health.isFull() && stamina.isFull()) {
            this.stop();
        }
    }
}

/**
 * Cheat action - Instantly fills all resources to maximum
 */
class Cheat extends Action {
    constructor(game) {
        super(game, {
            id: 'cheat',
            name: 'Cheat',
            description: 'Instantly fill all resources to maximum (for testing)',
            costPerSecond: {}, // No cost
            duration: 0.1, // Very quick
            autoRepeat: false,
            tooltipText: "Developer tool: Fill all resources to maximum instantly."
        });
    }
    
    /**
     * Apply effects when action completes
     */
    applyRewards() {
        const character = this.game.character;
        
        // Set all resources to maximum
        for (const resourceId of ['gold', 'health', 'stamina']) {
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.add(resource.max);
            }
        }
        
        // Update UI
        this.game.ui.updateResourceDisplays(character);
        
        // Log to adventure log
        const logContent = document.querySelector('.log-content');
        if (logContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = "You used developer cheats to fill all resources!";
            logContent.insertBefore(logEntry, logContent.firstChild);
        }
    }
}

/**
 * ActionsManager - Handles registering and managing all game actions
 */
class ActionsManager {
    constructor(game) {
        this.game = game;
        this.actions = {};
        this.initialize();
    }
    
    /**
     * Initialize with default actions
     */
    initialize() {
        // Register default actions
        this.registerAction(new BegForCoins(this.game));
        this.registerAction(new Rest(this.game));
        this.registerAction(new Cheat(this.game));
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Populate UI with action buttons
        this.populateActionButtons();
    }
    
    /**
     * Register a new action
     * @param {Action} action - The action to register
     */
    registerAction(action) {
        this.actions[action.id] = action;
    }
    
    /**
     * Get an action by id
     * @param {string} id - The action id
     * @returns {Action} - The action or null if not found
     */
    getAction(id) {
        return this.actions[id] || null;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Cancel button
        const cancelButton = document.getElementById('cancel-action');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.stopAllActions();
            });
        }
    }
    
    /**
     * Populate UI with action buttons
     */
    populateActionButtons() {
        const actionsContainer = document.querySelector('.available-actions');
        if (!actionsContainer) return;
        
        // Clear existing buttons
        actionsContainer.innerHTML = '';
        
        // Add all registered actions
        for (const id in this.actions) {
            const action = this.actions[id];
            const button = action.createButtonElement();
            actionsContainer.appendChild(button);
        }
    }
    
    /**
     * Stop all active actions
     */
    stopAllActions() {
        for (const id in this.actions) {
            const action = this.actions[id];
            if (action.isActive) {
                action.stop();
            }
        }
    }
    
    /**
     * Static method to stop all actions in a game instance
     * @param {Object} game - The game instance
     * @param {Object} exceptAction - Optional action to exclude from stopping
     */
    static stopAllActions(game, exceptAction = null) {
        if (!game.actionsManager) return;
        
        for (const id in game.actionsManager.actions) {
            const action = game.actionsManager.actions[id];
            if (action !== exceptAction && action.isActive) {
                action.stop();
            }
        }
    }
}

export { Action, ActionsManager };