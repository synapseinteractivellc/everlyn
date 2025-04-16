/**
 * Action Component
 * Handles player actions and their effects
 */
class ActionComponent extends Component {
    /**
     * Create a new action component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     */
    constructor(id, options = {}) {
        super(id, options);
        
        // Initialize default action state
        this.setState({
            actionsInProgress: {},
            actionTimers: {},
        }, false);
        
        // Bind event handlers
        this.handleActionClick = this.handleActionClick.bind(this);
        
        // Listen for view changes to set up action listeners
        eventSystem.on('navigation:view:changed', (data) => {
            if (data.view === 'actions') {
                console.log('Actions view changed, setting up listeners');
                // Wait a moment for the DOM to update
                setTimeout(() => this.setupActionListeners(), 200);
            }
        });
        
        // Also listen for initial game setup
        eventSystem.on('game:started', () => {
            // Check if actions view is visible
            const actionsView = document.querySelector('.actions-view');
            if (actionsView) {
                console.log('Game started, setting up action listeners');
                this.setupActionListeners();
            }
        });
    }
    
    /**
     * Update available actions based on current location
     * @param {Object} locationData - Current location data
     */
    updateAvailableActions(locationData) {
        // Add event listeners to action buttons
        this.setupActionListeners();
    }
    
    /**
     * Setup event listeners for action buttons
     */
    setupActionListeners() {
        console.log('Setting up action listeners'); // Debug
        // Remove existing listeners to prevent duplicates
        const actionButtons = document.querySelectorAll('.action-button');
        console.log('Found action buttons:', actionButtons.length); // Debug
        
        actionButtons.forEach(button => {
            // Clone the button to remove all event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add the click event listener to the new button
            newButton.addEventListener('click', this.handleActionClick);
        });
    }
    
    /**
     * Handle action button click
     * @param {Event} event - Click event
     */
    handleActionClick(event) {
        const actionButton = event.currentTarget;
        const actionId = actionButton.dataset.actionId;
        
        // If action is already in progress, do nothing
        if (this.state.actionsInProgress[actionId]) return;
        
        // If action is 'beg-for-coins', execute it
        if (actionId === 'beg-for-coins') {
            this.begForCoins(actionButton);
        }
    }
    
    /**
     * Execute the "Beg for Coins" action
     * @param {HTMLElement} actionButton - Action button element
     */
    begForCoins(actionButton) {
        // Get character component to check/modify resources
        const characterComponent = gameEngine.getComponent('player');
        if (!characterComponent) return;
        
        // Check if player has enough stamina
        const currentStamina = characterComponent.state.resources.stamina.current;
        if (currentStamina < 1) {
            // Show error message or notification
            actionButton.classList.add('shake');
            setTimeout(() => actionButton.classList.remove('shake'), 500);
            return;
        }
        
        // Show stamina resource loss effect
        const staminaBar = document.querySelector('.stamina-bar-fill');
        if (staminaBar) {
            staminaBar.classList.add('resource-loss');
        }
        
        this.startAction('beg-for-coins', actionButton, 1000, () => {
            // Action completed callback
            actionButton.classList.add('action-complete');
            setTimeout(() => actionButton.classList.remove('action-complete'), 1000);
            
            // Apply costs (stamina)
            characterComponent.modifyResource('stamina', -1);
            
            // Update stamina bar
            if (staminaBar) {
                staminaBar.classList.remove('resource-loss');
                const newStamina = characterComponent.state.resources.stamina.current;
                const maxStamina = characterComponent.state.resources.stamina.max;
                staminaBar.style.width = `${(newStamina / maxStamina) * 100}%`;
                
                const staminaText = document.querySelector('.stamina-bar-text');
                if (staminaText) {
                    staminaText.textContent = `${newStamina} / ${maxStamina}`;
                }
            }
            
            // Award random gold (0-2)
            const goldAmount = Math.floor(Math.random() * 3); // 0, 1, or 2
            if (goldAmount > 0) {
                const currencies = {...characterComponent.state.currencies};
                currencies.gold.current = Math.min(
                    currencies.gold.current + goldAmount,
                    currencies.gold.max
                );
                characterComponent.setState({ currencies });
                
                // Update gold counter in UI
                const goldCounter = document.querySelector('.gold-counter .resource-counter-value');
                if (goldCounter) {
                    goldCounter.textContent = `${currencies.gold.current}/${currencies.gold.max}`;
                }
                
                this.addActivityLog(`You received ${goldAmount} gold from begging.`);
            } else {
                this.addActivityLog(`You received no gold from begging.`);
            }
            
            // Check if player still has stamina
            const newStamina = characterComponent.state.resources.stamina.current;
            if (newStamina <= 0) {
                // Disable button if out of stamina
                actionButton.classList.add('action-disabled');
                actionButton.disabled = true;
            }
        });
    }
    
    /**
     * Add an entry to the activity log
     * @param {string} message - Log message
     */
    addActivityLog(message) {
        const logContainer = document.querySelector('.log-entries');
        if (!logContainer) return;
        
        const logEntry = document.createElement('li');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString()}</span> ${message}`;
        
        // Add to top of log
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Limit log entries
        const maxEntries = 50;
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > maxEntries) {
            for (let i = maxEntries; i < entries.length; i++) {
                logContainer.removeChild(entries[i]);
            }
        }
    }
    /**
     * Handle action button click
     * @param {Event} event - Click event
     */
    handleActionClick(event) {
        console.log('Action button clicked:', event.currentTarget.dataset.actionId);
        
        const actionButton = event.currentTarget;
        const actionId = actionButton.dataset.actionId;
        
        // If action is already in progress, do nothing
        if (this.state.actionsInProgress[actionId]) {
            console.log('Action already in progress, ignoring click');
            return;
        }
        
        // Execute the appropriate action
        if (actionId === 'beg-for-coins') {
            console.log('Executing beg for coins action');
            this.begForCoins(actionButton);
        } else if (actionId === 'rest') {
            console.log('Executing rest action');
            this.rest(actionButton);
        }
    }

    /**
     * Execute the "Rest" action
     * @param {HTMLElement} actionButton - Action button element
     */
    rest(actionButton) {
        const characterComponent = gameEngine.getComponent('player');
        if (!characterComponent) return;
        
        this.startAction('rest', actionButton, 3000, () => {
            // Action completed callback
            actionButton.classList.add('action-complete');
            setTimeout(() => actionButton.classList.remove('action-complete'), 1000);
            
            // Track which resources were restored
            const restored = [];
            
            // Restore all eligible resources
            ['health', 'stamina', 'mana'].forEach(resource => {
                // Skip mana if not unlocked
                if (resource === 'mana' && 
                    (!characterComponent.state.resources.mana || 
                     !characterComponent.state.resources.mana.unlocked)) {
                    return;
                }
                
                const current = characterComponent.state.resources[resource].current;
                const max = characterComponent.state.resources[resource].max;
                const diff = max - current;
                
                if (diff > 0) {
                    characterComponent.modifyResource(resource, diff);
                    this.updateResourceUI(resource, max);
                    this.addActivityLog(`You restored ${diff} ${resource} by resting.`);
                    restored.push(resource);
                }
            });
            
            // Add summary message if multiple resources restored
            if (restored.length > 1) {
                this.addActivityLog('You feel refreshed and rejuvenated after your rest.');
            }
        });
    }
    
    // Helper method to start an action with progress tracking
    startAction(actionId, actionButton, duration, completionCallback) {
        // Mark action as in progress
        this.state.actionsInProgress[actionId] = true;
        actionButton.classList.add('action-in-progress');
        
        const startTime = Date.now();
        
        // Set action timer
        this.state.actionTimers[actionId] = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update the visual progress by adjusting the CSS after pseudo-element width
            actionButton.style.setProperty('--progress-width', `${progress * 100}%`);
            
            if (progress >= 1) {
                // Clean up
                clearInterval(this.state.actionTimers[actionId]);
                this.state.actionTimers[actionId] = null;
                this.state.actionsInProgress[actionId] = false;
                actionButton.classList.remove('action-in-progress');
                actionButton.style.removeProperty('--progress-width');
                
                // Execute completion callback
                completionCallback();
            }
        }, 50);
    }
    
    // Helper to update resource UI
    updateResourceUI(resource, value) {
        const resourceBar = document.querySelector(`.${resource}-bar-fill`);
        const resourceText = document.querySelector(`.${resource}-bar-text`);
        
        if (resourceBar) {
            resourceBar.classList.add('resource-gain');
            setTimeout(() => resourceBar.classList.remove('resource-gain'), 1000);
            resourceBar.style.width = '100%';
            
            if (resourceText) {
                resourceText.textContent = `${value} / ${value}`;
            }
        }
    }
}