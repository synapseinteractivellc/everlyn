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
        this.unlocked = config.unlocked !== undefined ? config.unlocked : false;
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

            const countElement = actionButton.querySelector('.action-count');
            if (countElement) {
                countElement.textContent = ` (${this.completionCount})`;
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

        const countElement = document.createElement('span');
        countElement.className = 'action-count';
        countElement.textContent = ` (${this.completionCount})`;
        
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

        // Add tooltip data attribute if tooltip text exists
        if (this.tooltipText) {
            button.dataset.tooltip = this.tooltipText;
        }
        
        // Add progress bar to container
        progressContainer.appendChild(progressBar);
        
        // Add elements to button
        button.appendChild(nameElement);
        button.appendChild(countElement);
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

    /**
     * Check if this action should be visible/available
     * @returns {boolean} - True if the action should be available
     */
    isAvailable() {
        // By default, all actions are available
        return true;
    }

    /**
     * Convert to an object for saving
     * @returns {Object} - Serialized action data
     */
    serialize() {
        return {
            id: this.id,
            completionCount: this.completionCount,
            isActive: this.isActive,
            progress: this.progress
        };
    }

    /**
     * Load from saved data
     * @param {Object} data - Saved action data
     */
    deserialize(data) {
        if (!data) return;
        
        if (data.completionCount !== undefined) this.completionCount = data.completionCount;
        if (data.isActive !== undefined && data.isActive) {
            // Don't auto-start the action, just restore the state
            this.isActive = true;
            if (data.progress !== undefined) this.progress = data.progress;
            
            // Update UI to show action is active
            this.updateUI();
        }
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
            unlocked: true,
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
                "You begged for coins and got lucky: 2 gold for your efforts.",
                "You begged for coins and the innkeeper took pity on you: 1 gold for your efforts. New action unlocked!"
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
        } else if (roll < 0.95) {
            gold = 2; // 5% chance for 2 gold
            this.lastRewardMessage = this.successMessages[2];
        } else {
            gold = 1; // 5% chance for 1 gold and unlock new action
            this.lastRewardMessage = this.successMessages[3];
            
            // Unlock new action (OddJobs)
            const oddJobsAction = this.game.actionsManager.getAction('oddJobs');
            if (oddJobsAction) {
                oddJobsAction.unlocked = true; // Unlock the action
                if (this.game.actionsManager) {
                    this.game.actionsManager.populateActionButtons();
                }
            }
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
            unlocked: true,
            description: 'Take a moment to catch your breath and recover',
            costPerSecond: {}, // No cost
            gainPerSecond: {
                health: 2,    // 2 health per second (10 over 5 seconds)
                stamina: 2,    // 2 stamina per second (10 over 5 seconds)
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
     * Override update to also recover mana if unlocked
     * @param {number} deltaTime - Time passed in seconds
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Check if mana is unlocked and add regeneration
        if (this.isActive) {
            const character = this.game.character;
            const mana = character.getResource('mana');
            
            if (mana && mana.unlocked) {
                // Regenerate mana at the same rate as health/stamina
                mana.add(2 * deltaTime);
            }
        }
    }
    
    /**
     * Check if we should stop resting (when both health and stamina are full)
     */
    checkAutoStop() {
        const character = this.game.character;
        const health = character.getResource('health');
        const stamina = character.getResource('stamina');
        const mana = character.getResource('mana');        
        
        // Check if all unlocked resources are full
        let shouldStop = health && stamina && health.isFull() && stamina.isFull();
        
        // Also check mana if it's unlocked
        if (shouldStop && mana && mana.unlocked) {
            shouldStop = mana.isFull();
        }
        
        if (shouldStop) {
            this.stop();
        }
    }
}

/**
 * OddJobs action
 */
class OddJobs extends Action {
    constructor(game) {
        super(game, {
            id: 'oddJobs',
            name: 'Do Odd Jobs',
            unlocked: false,
            description: 'Find various odd jobs around the city to earn some extra gold.',
            costPerSecond: {
                stamina: 1 // 1 stamina per second
            },
            duration: 1, // 1 seconds to complete
            autoRepeat: true,
            tooltipText: "Do odd jobs to earn some extra gold. Uses stamina, but earns you some gold.",
            successMessages: [
                "You helped an elderly shopkeeper in the market arrange their merchandise: 1 gold for your efforts.",
                "You delivered a message across the city and got a return message for double to pay: 2 gold for your efforts.",
                "You swept the steps of the Grand Library and impressed the Librarian: 3 gold for your efforts."
            ],

        });
    }

    /**
     * Check if this action should be visible/available
     * @returns {boolean} - True if the action should be available
     */
    isAvailable() {
       if(unlocked) return true; // Action is unlocked
    }
    
    /**
     * Apply rewards with weighted randomization
     * 90% chance for 1-2 gold
     * 10% chance for 3 gold
     */
    applyRewards() {
        const character = this.game.character;
        let gold = 0;
        
        // Weighted random calculation
        const roll = Math.random();
        if (roll < 0.45) {
            gold = 1; // 45% chance for 1 gold
            this.lastRewardMessage = this.successMessages[0];
        } else if (roll < 0.9) { 
            gold = 2; // 45% chance for 2 gold
            this.lastRewardMessage = this.successMessages[1];
        } else {
            gold = 3; // 10% chance for 3 gold
            this.lastRewardMessage = this.successMessages[2];
        }
        
        // Add gold to character
        const goldResource = character.getResource('gold');
        goldResource.add(gold);
        
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
 * MeditateOnArcaneWisdom action - Generates MageLore XP and research
 */
class MeditateOnArcaneWisdom extends Action {
    constructor(game) {
        super(game, {
            id: 'meditateOnArcaneWisdom',
            name: 'Meditate on Arcane Wisdom',
            unlocked: false,
            description: 'Focus your magical energy to internalize arcane knowledge',
            costPerSecond: {
                mana: 1,      // 1 mana per second
                stamina: 0.2  // 0.2 stamina per second
            },
            gainPerSecond: {
                // Handled in update method for skill XP
            },
            duration: 2.5,    // 2.5 seconds to complete
            autoRepeat: true,
            tooltipText: "Use your magical energy to deepen your arcane knowledge. Generates MageLore XP and research.",
            successMessages: [
                "You achieve a moment of arcane clarity.",
                "The magical energies flow through your mind, expanding your knowledge.",
                "Ancient symbols briefly materialize in your mind's eye.",
                "You feel the threads of magical energy weaving into patterns of knowledge."
            ]
        });
    }
    
    /**
     * Apply continuous gains per second (including skill XP)
     * @param {number} deltaTime - Time passed in seconds
     */
    applyGains(deltaTime) {
        super.applyGains(deltaTime);
        
        // Add XP to MageLore skill if it exists and is purchased
        if (this.game.skillsManager) {
            const mageLoreSkill = this.game.skillsManager.skills['mageLore'];
            if (mageLoreSkill && mageLoreSkill.purchased) {
                // Add XP at the rate of 1 per second
                const xpGain = 1 * deltaTime;
                mageLoreSkill.addExperience(xpGain);

                // Update skill UI with new XP progress
                const skillCard = document.querySelector(`.skill-card[data-skill="mageLore"]`);
                if (skillCard) {
                    const progressBar = skillCard.querySelector('.skill-progress');
                    if (progressBar) {
                        progressBar.style.width = `${mageLoreSkill.getProgressPercentage()}%`;
                    }
                    
                    const xpElement = skillCard.querySelector('.skill-xp');
                    if (xpElement) {
                        const xpNeeded = mageLoreSkill.getXPForNextLevel();
                        xpElement.textContent = xpNeeded ? 
                            `XP: ${Math.floor(mageLoreSkill.experience)}/${xpNeeded}` : 
                            'Max Level';
                    }
                }
                
                // If skill leveled up, refresh UI and show notification
                if (mageLoreSkill.experience === 0 && mageLoreSkill.level > 0) {
                    this.game.skillsManager.refreshSkillsUI();
                    this.game.ui.updateResourceDisplays(this.game.character);
                    this.game.ui.showNotification(`MageLore skill increased to level ${mageLoreSkill.level}!`);
                }
            }
        }
    }
    
    /**
     * Apply rewards when action completes
     */
    applyRewards() {
        const character = this.game.character;
        
        // Add research points
        const research = character.getResource('research');
        if (research) {
            research.add(1);
        }
        
        // Update UI
        this.game.ui.updateResourceDisplays(character);
    }
    
    /**
     * Check if this action should be visible/available
     * @returns {boolean} - True if the action should be available
     */
    isAvailable() {
        // Only available if MageLore skill is purchased
        if (this.game.skillsManager) {
            const mageLoreSkill = this.game.skillsManager.skills['mageLore'];
            if (mageLoreSkill && mageLoreSkill.purchased) {
                this.unlocked = true; // Action is unlocked
                return true; // Action is available
            } 
        }
        return false;
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
            unlocked: true,
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
        this.registerAction(new OddJobs(this.game));
        this.registerAction(new MeditateOnArcaneWisdom(this.game));
        this.registerAction(new Cheat(this.game));
        
        // Check if we're initializing after a load
        if (this.game.character && this.game.character.actions) {
            // Update actions with saved data
            for (const id in this.actions) {
                const action = this.actions[id];
                const savedAction = this.game.character.actions[id];
                
                if (savedAction) {
                    // Set completion count
                    action.completionCount = savedAction.completionCount || 0;
                    
                    // Set UI to reflect saved state
                    action.updateUI();
                }
            }
        }

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
            
            // Check if action is unlocked
            if (!action.unlocked) {
                continue; // Skip this action
            }
            
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

    /**
     * Save all action data
     * @returns {Object} - Saved action data
     */
    saveData() {
        const data = {};
        
        for (const id in this.actions) {
            const action = this.actions[id];
            data[id] = action.serialize();
        }
        
        return data;
    }

    /**
     * Load saved action data
     * @param {Object} savedData - Saved action data
     */
    loadSavedData(savedData) {
        if (!savedData) return;
        
        // Stop any active actions first
        this.stopAllActions();
        
        for (const id in savedData) {
            const action = this.getAction(id);
            if (action) {
                action.deserialize(savedData[id]);
                
                // If this action was active, restore it properly
                if (action.isActive) {
                    // Update current action display
                    const currentActionElement = document.getElementById('current-action');
                    if (currentActionElement) {
                        const percent = Math.floor(action.progress * 100);
                        currentActionElement.textContent = `${action.name} (${percent}%)`;
                    }
                    
                    // Restart the progress interval
                    const intervalTime = 100; // Update every 100ms
                    action.progressInterval = setInterval(() => {
                        action.update(intervalTime / 1000); // Convert ms to seconds
                    }, intervalTime);
                }
            }
        }
        
        // Refresh the UI
        this.populateActionButtons();
    }
}

export { Action, ActionsManager };