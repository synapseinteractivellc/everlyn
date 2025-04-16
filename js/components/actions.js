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
        
        // Mark action as in progress
        this.state.actionsInProgress['beg-for-coins'] = true;
        actionButton.classList.add('action-in-progress');
        
        // Start timer for 1 second
        const startTime = Date.now();
        const duration = 1000; // 1 second
        
        // Update stamina bar to show resource-loss animation
        const staminaBar = document.querySelector('.stamina-bar-fill');
        const staminaText = document.querySelector('.stamina-bar-text');
        if (staminaBar) {
            staminaBar.classList.add('resource-loss');
        }
        
        // Set action timer
        this.state.actionTimers['beg-for-coins'] = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress >= 1) {
                // Action completed
                clearInterval(this.state.actionTimers['beg-for-coins']);
                this.state.actionTimers['beg-for-coins'] = null;
                this.state.actionsInProgress['beg-for-coins'] = false;
                
                // Update UI
                actionButton.classList.remove('action-in-progress');
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
                    
                    // Log action result to activity log
                    this.addActivityLog(`You received ${goldAmount} gold from begging.`);
                } else {
                    // Log action result to activity log
                    this.addActivityLog(`You received no gold from begging.`);
                }
                
                // If player still has stamina, allow to perform action again
                const newStamina = characterComponent.state.resources.stamina.current;
                if (newStamina > 0) {
                    actionButton.addEventListener('click', this.handleActionClick);
                } else {
                    // Disable button if out of stamina
                    actionButton.classList.add('action-disabled');
                    actionButton.disabled = true;
                }
            }
        }, 50); // Update every 50ms for smooth progress
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
        // Get character component
        const characterComponent = gameEngine.getComponent('player');
        if (!characterComponent) return;
        
        // Mark action as in progress
        this.state.actionsInProgress['rest'] = true;
        actionButton.classList.add('action-in-progress');
        
        // Start timer for 3 seconds
        const startTime = Date.now();
        const duration = 3000; // 3 seconds
        
        // Set action timer
        this.state.actionTimers['rest'] = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress >= 1) {
                // Action completed
                clearInterval(this.state.actionTimers['rest']);
                this.state.actionTimers['rest'] = null;
                this.state.actionsInProgress['rest'] = false;
                
                // Update UI
                actionButton.classList.remove('action-in-progress');
                actionButton.classList.add('action-complete');
                setTimeout(() => actionButton.classList.remove('action-complete'), 1000);
                
                // Restore health to full
                const healthMax = characterComponent.state.resources.health.max;
                const healthCurrent = characterComponent.state.resources.health.current;
                const healthDiff = healthMax - healthCurrent;
                if (healthDiff > 0) {
                    characterComponent.modifyResource('health', healthDiff);
                    
                    // Update health bar
                    const healthBar = document.querySelector('.health-bar-fill');
                    const healthText = document.querySelector('.health-bar-text');
                    if (healthBar) {
                        healthBar.classList.add('resource-gain');
                        setTimeout(() => healthBar.classList.remove('resource-gain'), 1000);
                        healthBar.style.width = '100%';
                        if (healthText) {
                            healthText.textContent = `${healthMax} / ${healthMax}`;
                        }
                    }
                    
                    // Log health restoration
                    this.addActivityLog(`You restored ${healthDiff} health by resting.`);
                }
                
                // Restore stamina to full
                const staminaMax = characterComponent.state.resources.stamina.max;
                const staminaCurrent = characterComponent.state.resources.stamina.current;
                const staminaDiff = staminaMax - staminaCurrent;
                if (staminaDiff > 0) {
                    characterComponent.modifyResource('stamina', staminaDiff);
                    
                    // Update stamina bar
                    const staminaBar = document.querySelector('.stamina-bar-fill');
                    const staminaText = document.querySelector('.stamina-bar-text');
                    if (staminaBar) {
                        staminaBar.classList.add('resource-gain');
                        setTimeout(() => staminaBar.classList.remove('resource-gain'), 1000);
                        staminaBar.style.width = '100%';
                        if (staminaText) {
                            staminaText.textContent = `${staminaMax} / ${staminaMax}`;
                        }
                    }
                    
                    // Log stamina restoration
                    this.addActivityLog(`You restored ${staminaDiff} stamina by resting.`);
                }
                
                // Check if mana is unlocked and restore it
                if (characterComponent.state.resources.mana && 
                    characterComponent.state.resources.mana.unlocked) {
                    const manaMax = characterComponent.state.resources.mana.max;
                    const manaCurrent = characterComponent.state.resources.mana.current;
                    const manaDiff = manaMax - manaCurrent;
                    
                    if (manaDiff > 0) {
                        characterComponent.modifyResource('mana', manaDiff);
                        
                        // Update mana bar
                        const manaBar = document.querySelector('.mana-bar-fill');
                        const manaText = document.querySelector('.mana-bar-text');
                        if (manaBar) {
                            manaBar.classList.add('resource-gain');
                            setTimeout(() => manaBar.classList.remove('resource-gain'), 1000);
                            manaBar.style.width = '100%';
                            if (manaText) {
                                manaText.textContent = `${manaMax} / ${manaMax}`;
                            }
                        }
                        
                        // Log mana restoration
                        this.addActivityLog(`You restored ${manaDiff} mana by resting.`);
                    }
                }
                
                // Add overall log message if multiple resources were restored
                if ((healthDiff > 0 && staminaDiff > 0) || 
                    (healthDiff > 0 && characterComponent.state.resources.mana?.unlocked) ||
                    (staminaDiff > 0 && characterComponent.state.resources.mana?.unlocked)) {
                    this.addActivityLog('You feel refreshed and rejuvenated after your rest.');
                }
            }
        }, 50); // Update every 50ms for smooth progress
    }
}