// js/controllers/ui-controller.js
class UIController {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Initialize tracking objects BEFORE calling any update methods
        this.lastCurrentAction = null;
        this.lastActionProgress = 0;
        this.lastCurrencyValues = {};
        this.lastStatPoolValues = {};
        this.lastActionLog = [];
        this.lastSkillExperience = {};
        
        // Pre-populate tracking values for existing currencies and stat pools
        for (const currencyId in this.gameState.currencies) {
            if (this.gameState.currencies[currencyId]) {
                this.lastCurrencyValues[currencyId] = this.gameState.currencies[currencyId].amount;
            }
        }
        
        for (const statPoolId in this.gameState.statPools) {
            if (this.gameState.statPools[statPoolId]) {
                this.lastStatPoolValues[statPoolId] = {
                    current: this.gameState.statPools[statPoolId].current,
                    max: this.gameState.statPools[statPoolId].max
                };
            }
        }
    
        // Initialize skill experience tracking
        for (const skillId in this.gameState.skills) {
            if (this.gameState.skills[skillId]) {
                this.lastSkillExperience[skillId] = {
                    level: this.gameState.skills[skillId].level,
                    experience: this.gameState.skills[skillId].experience,
                    nextLevelExperience: this.gameState.skills[skillId].nextLevelExperience
                };
            }
        }
        
        // Now initialize UI and add event listeners
        this.initEventListeners();
        this.updateAll();
    }
    
    initEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const screen = e.target.getAttribute('data-screen');
                this.changeScreen(screen);
            });
        });
        
        // Save game button (could be added to UI later)
        document.addEventListener('keydown', (e) => {
            // Save game on Ctrl+S
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                window.game.saveController.saveGame();
                this.showNotification('Game saved!');
            }
        });

        // Save button
        document.getElementById('save-button').addEventListener('click', () => {
            window.game.saveController.saveGame();
            this.showNotification('Game saved successfully!');
        });
        
        // Wipe button
        document.getElementById('wipe-button').addEventListener('click', () => {
            // Show confirmation dialog
            if (confirm('Are you sure you want to wipe all game data? This cannot be undone!')) {
                window.game.saveController.resetGame();
                this.showNotification('Game data wiped. Page will reload.');
            }
        });
    }
    
    update() {
        // Only update what's changed
        this.updateCurrentAction();
        this.updateCurrencies();
        this.updateStatPools();
        this.updateActionLog();
        
        // Update the skills tab if we're viewing it
        if (this.gameState.currentScreen === 'skills') {
            this.updateSkills();
        }

        // Update the upgrades tab if we're viewing it
        if (this.gameState.currentScreen === 'upgrades') {
            this.updateUpgrades();
        }
        // Don't constantly update action buttons, skills, etc.
        // Only update them when specifically needed (e.g., when unlocking new actions)
    }

    forceInitialUIUpdate() {
        this.updateCharacterInfo();
        
        // Force currency update
        const currencyContainer = document.getElementById('currencies-container');
        currencyContainer.innerHTML = '';
        for (const currency of Object.values(this.gameState.currencies)) {
            const div = document.createElement('div');
            div.className = 'currency';
            div.innerHTML = `
                <span class="currency-name">${currency.name}:</span>
                <span class="currency-amount">${Math.floor(currency.amount)}/${Math.floor(currency.maximum)}</span>
                ${currency.generationRate > 0 ? 
                    `<span class="currency-rate">(+${currency.generationRate.toFixed(1)}/s)</span>` : ''}
            `;
            currencyContainer.appendChild(div);
        }
        
        // Force stat pool update
        const statPoolContainer = document.getElementById('stat-pools-container');
        statPoolContainer.innerHTML = '';
        for (const statPool of Object.values(this.gameState.statPools)) {
            const div = document.createElement('div');
            div.className = 'stat-pool';
            div.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${(statPool.current / statPool.max * 100).toFixed(1)}%; background-color: ${statPool.color}">
                        ${statPool.name}: ${Math.floor(statPool.current)}/${Math.floor(statPool.max)}
                    </div>
                </div>
            `;
            statPoolContainer.appendChild(div);
        }
        
        // Update the rest normally
        this.updateCurrentAction();
        this.updateActionLog();
        this.updateActions();
        this.updateSkills();
        this.updateHouse();
        this.updateStatus();
    }
    
    updateAll() {
        this.updateCharacterInfo();
        this.updateCurrencies();
        this.updateStatPools();
        this.updateCurrentAction();
        this.updateActionLog();
        this.updateActions();
        this.updateSkills();
        this.updateHouse();
        this.updateStatus();
        this.updateUpgrades();
    }
    
    changeScreen(screen) {
        // Update active button
        document.querySelectorAll('.nav-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.nav-button[data-screen="${screen}"]`).classList.add('active');
        
        // Update active screen
        document.querySelectorAll('.screen').forEach(screenEl => {
            screenEl.classList.remove('active');
        });
        document.getElementById(`screen-${screen}`).classList.add('active');

        // Update specific screen content when navigating to it
        if (screen === 'skills') {
            this.updateSkills();
        } else if (screen === 'house') {
            this.updateHouse();
        } else if (screen === 'status') {
            this.updateStatus();
        } else if (screen === 'main') {
            this.updateActions();
        }
        
        // Update game state
        this.gameState.currentScreen = screen;
    }
    
    updateCharacterInfo() {
        const char = this.gameState.character;
        document.getElementById('character-info').textContent = 
            `${char.name} the Level ${char.level} ${char.class}`;
    }
    
    updateCurrencies() {
        let hasChanges = false;
        
        // Check if any currency values changed
        for (const currencyId in this.gameState.currencies) {
            if (this.gameState.currencies[currencyId]) {
                const currency = this.gameState.currencies[currencyId];
                
                // Make sure we have the currency in our tracking object
                if (this.lastCurrencyValues[currencyId] === undefined) {
                    this.lastCurrencyValues[currencyId] = currency.amount;
                    hasChanges = true;
                } else if (this.lastCurrencyValues[currencyId] !== currency.amount) {
                    hasChanges = true;
                    this.lastCurrencyValues[currencyId] = currency.amount;
                }
            }
        }
        
        // Only redraw if there were changes
        if (hasChanges) {
            const container = document.getElementById('currencies-container');
            container.innerHTML = '';
            
            for (const currency of Object.values(this.gameState.currencies)) {
                const div = document.createElement('div');
                div.className = 'currency';
                div.innerHTML = `
                    <span class="currency-name">${currency.name}:</span>
                    <span class="currency-amount">${Math.floor(currency.amount)}/${Math.floor(currency.maximum)}</span>
                    ${currency.generationRate > 0 ? 
                        `<span class="currency-rate">(+${currency.generationRate.toFixed(1)}/s)</span>` : ''}
                `;
                container.appendChild(div);
            }
        }
    }
    
    updateStatPools() {
        let hasChanges = false;
        
        // Check if any stat pool values changed
        for (const statPoolId in this.gameState.statPools) {
            if (this.gameState.statPools[statPoolId]) {
                const statPool = this.gameState.statPools[statPoolId];
                
                // Make sure we have the stat pool in our tracking object
                if (!this.lastStatPoolValues[statPoolId]) {
                    this.lastStatPoolValues[statPoolId] = {
                        current: statPool.current,
                        max: statPool.max
                    };
                    hasChanges = true;
                } else if (this.lastStatPoolValues[statPoolId].current !== statPool.current ||
                          this.lastStatPoolValues[statPoolId].max !== statPool.max) {
                    hasChanges = true;
                    this.lastStatPoolValues[statPoolId].current = statPool.current;
                    this.lastStatPoolValues[statPoolId].max = statPool.max;
                }
            }
        }
        
        // Only redraw if there were changes
        if (hasChanges) {
            const container = document.getElementById('stat-pools-container');
            container.innerHTML = '';
            
            for (const statPool of Object.values(this.gameState.statPools)) {
                const div = document.createElement('div');
                div.className = 'stat-pool';
                div.innerHTML = `
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${(statPool.current / statPool.max * 100).toFixed(1)}%; background-color: ${statPool.color}">
                            ${statPool.name}: ${Math.floor(statPool.current)}/${Math.floor(statPool.max)}
                        </div>
                    </div>
                `;
                container.appendChild(div);
            }
        }
    }
    
    updateCurrentAction() {
        const actionNameEl = document.getElementById('action-name');
        const actionProgressEl = document.getElementById('action-progress');
        const currentActionContainer = document.getElementById('current-action');
        
        // Check if current action changed
        if (this.lastCurrentAction !== this.gameState.currentAction) {
            this.lastCurrentAction = this.gameState.currentAction;
            
            // Clear previous content
            actionNameEl.textContent = '';
            
            if (this.gameState.currentAction) {
                console.log(`Current action: ${this.gameState.currentAction}`);
                const action = this.gameState.actions[this.gameState.currentAction];
                
                // Create action name with cancel button
                const nameContainer = document.createElement('div');
                nameContainer.style.display = 'flex';
                nameContainer.style.justifyContent = 'space-between';
                nameContainer.style.alignItems = 'center';
                nameContainer.style.marginBottom = '5px';
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = action.name;
                
                const cancelButton = document.createElement('button');
                cancelButton.textContent = '✕';
                cancelButton.className = 'cancel-action-btn';
                cancelButton.style.background = 'none';
                cancelButton.style.border = 'none';
                cancelButton.style.color = '#e74c3c';
                cancelButton.style.cursor = 'pointer';
                cancelButton.style.fontSize = '16px';
                cancelButton.style.fontWeight = 'bold';
                cancelButton.title = 'Cancel action';
                
                cancelButton.addEventListener('click', () => {
                    window.game.actionController.stopCurrentAction();
                });
                
                nameContainer.appendChild(nameSpan);
                nameContainer.appendChild(cancelButton);
                
                // Replace text content with our container
                actionNameEl.textContent = '';
                actionNameEl.appendChild(nameContainer);
            } else {
                actionNameEl.textContent = 'None';
                actionProgressEl.style.width = '0%';
                actionProgressEl.textContent = '0%';
            }
        }
        
        // Update progress only if it changed significantly (avoid tiny updates)
        if (this.gameState.currentAction) {
            const action = this.gameState.actions[this.gameState.currentAction];
            const progress = action.currentProgress * 100;
            
            // Only update if progress changed by at least 1%
            if (Math.abs(progress - this.lastActionProgress) >= 1) {
                this.lastActionProgress = progress;
                actionProgressEl.style.width = `${progress.toFixed(1)}%`;
                actionProgressEl.textContent = `${progress.toFixed(0)}%`;
            }
        }
    }
    
    updateActionLog() {
        // Only update if log entries changed
        if (this.gameState.actionLog.length !== this.lastActionLog.length) {
            const container = document.getElementById('action-log');
            container.innerHTML = '';
            
            for (const logEntry of this.gameState.actionLog) {
                const div = document.createElement('div');
                div.className = 'log-entry';
                div.textContent = logEntry.message;
                container.appendChild(div);
            }
            
            // Update last log
            this.lastActionLog = [...this.gameState.actionLog];
        }
    }
    
    updateActions() {
        const container = document.getElementById('actions-container');
        container.innerHTML = '';
        
        for (const action of Object.values(this.gameState.actions)) {
            // Skip if not unlocked
            if (!action.unlocked) continue;
            
            const div = document.createElement('div');
            div.className = 'action-button';
            
            // Add active class if this is the current action
            if (this.gameState.currentAction === action.id) {
                div.classList.add('active');
            }
            
            div.setAttribute('data-action-id', action.id);
            
            // Show completion count
            let completionText = '';
            if (action.completionCount > 0) {
                completionText = ` (Done ${action.completionCount} times)`;
            }
            
            div.innerHTML = `
                <h3>${action.name}${completionText}</h3>
                <p>${action.description}</p>
                <div class="action-details">
                    <div class="action-costs">
                        ${Object.entries(action.statPoolCosts).map(([statId, cost]) => 
                            `<span class="cost">${this.gameState.statPools[statId].name}: ${cost}</span>`
                        ).join(' ')}
                        
                        ${Object.entries(action.currencyCosts).map(([currencyId, cost]) => 
                            `<span class="cost">${this.gameState.currencies[currencyId].name}: ${cost}</span>`
                        ).join(' ')}
                    </div>
                    <div class="action-rewards">
                        ${Object.entries(action.currencyRewards).map(([currencyId, reward]) => {
                            let rewardText = '';
                            if (reward.min !== undefined) {
                                rewardText = `${reward.min}-${reward.max} ${this.gameState.currencies[currencyId].name}`;
                            } else {
                                rewardText = `${reward} ${this.gameState.currencies[currencyId].name}`;
                            }
                            return `<span class="reward">${rewardText}</span>`;
                        }).join(' ')}
                        
                        ${Object.entries(action.statPoolRestoration).map(([statId, amount]) => 
                            `<span class="reward">+${amount} ${this.gameState.statPools[statId].name}</span>`
                        ).join(' ')}
                    </div>
                    <div class="action-duration">
                        Duration: ${(action.baseDuration / 1000).toFixed(1)}s
                    </div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                console.log(`Action clicked: ${action.id}`);
                
                // If this action is already active, stop it
                if (this.gameState.currentAction === action.id) {
                    window.game.actionController.stopCurrentAction();
                } else {
                    // Otherwise start the action
                    const result = window.game.actionController.startAction(action.id);
                    console.log(`Start action result: ${result}`);
                }
            });
            
            container.appendChild(div);
        }
    }
    
    updateSkills() {
        let hasChanges = false;
        
        // Check if any skill values changed
        for (const skillId in this.gameState.skills) {
            if (this.gameState.skills[skillId]) {
                const skill = this.gameState.skills[skillId];
                
                // Initialize if not already tracked
                if (!this.lastSkillExperience[skillId]) {
                    this.lastSkillExperience[skillId] = {
                        level: skill.level,
                        experience: skill.experience,
                        nextLevelExperience: skill.nextLevelExperience
                    };
                    hasChanges = true;
                } 
                // Check if values changed
                else if (this.lastSkillExperience[skillId].level !== skill.level ||
                        this.lastSkillExperience[skillId].experience !== skill.experience ||
                        this.lastSkillExperience[skillId].nextLevelExperience !== skill.nextLevelExperience) {
                    
                    this.lastSkillExperience[skillId].level = skill.level;
                    this.lastSkillExperience[skillId].experience = skill.experience;
                    this.lastSkillExperience[skillId].nextLevelExperience = skill.nextLevelExperience;
                    hasChanges = true;
                }
            }
        }
        
        // Only redraw if there were changes or if we're on the skills screen
        if (hasChanges || this.gameState.currentScreen === 'skills') {
            const container = document.getElementById('skills-container');
            container.innerHTML = '';
            
            for (const skill of Object.values(this.gameState.skills)) {
                const div = document.createElement('div');
                div.className = 'skill';
                
                const progressPercent = (skill.experience / skill.nextLevelExperience * 100).toFixed(1);
                
                div.innerHTML = `
                    <h3>${skill.name} (Level ${skill.level})</h3>
                    <p>${skill.description}</p>
                    <div class="skill-progress">
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progressPercent}%; background-color: #9b59b6">
                                ${progressPercent}%
                            </div>
                        </div>
                        <div class="skill-exp">
                            ${skill.experience}/${skill.nextLevelExperience} XP
                        </div>
                    </div>
                `;
                
                container.appendChild(div);
            }
        }
    }

    updateUpgrades() {
        // Check if we're on the Upgrades screen
        if (this.gameState.currentScreen !== 'upgrades') return;

        const container = document.getElementById('upgrades-container');
        if (!container) return;

        // Track changes to avoid unnecessary updates
        let hasChanges = false;

        // Create a map of current upgrades in the container
        const existingUpgrades = new Map();
        container.querySelectorAll('.upgrade-button').forEach(button => {
            const upgradeId = button.getAttribute('data-upgrade-id');
            existingUpgrades.set(upgradeId, button);
        });

        for (const upgrade of Object.values(this.gameState.upgrades)) {
            // Skip if not unlocked or already purchased maximum times
            if (!upgrade.unlocked || upgrade.purchased >= upgrade.numberOfPurchasesPossible) {
                if (existingUpgrades.has(upgrade.id)) {
                    existingUpgrades.get(upgrade.id).remove();
                    hasChanges = true;
                }
                continue;
            }

            const canAfford = window.game.upgradeController.canAffordUpgrade(upgrade);
            const existingButton = existingUpgrades.get(upgrade.id);

            // Check if the button needs to be updated
            if (existingButton) {
                const isCannotAfford = existingButton.classList.contains('cannot-afford');
                if (isCannotAfford !== !canAfford) {
                    existingButton.classList.toggle('cannot-afford', !canAfford);
                    hasChanges = true;
                }

                const limitText = `${upgrade.purchased}/${upgrade.numberOfPurchasesPossible} purchased`;
                const limitElement = existingButton.querySelector('.upgrade-limit');
                if (limitElement && limitElement.textContent !== limitText) {
                    limitElement.textContent = limitText;
                    hasChanges = true;
                }
            } else {
                // Create a new button if it doesn't exist
                const div = document.createElement('div');
                div.className = 'upgrade-button';
                if (!canAfford) div.classList.add('cannot-afford');

                div.setAttribute('data-upgrade-id', upgrade.id);

                div.innerHTML = `
                    <h3>${upgrade.name}</h3>
                    <p>${upgrade.description}</p>
                    <div class="upgrade-details">
                        <div class="upgrade-costs">
                            ${Object.entries(upgrade.costs.currencies || {}).map(([currencyId, cost]) =>
                                `<span class="cost">${this.gameState.currencies[currencyId].name}: ${cost}</span>`
                            ).join(' ')}
                            
                            ${Object.entries(upgrade.costs.statPools || {}).map(([statPoolId, cost]) =>
                                `<span class="cost">${this.gameState.statPools[statPoolId].name}: ${cost}</span>`
                            ).join(' ')}
                        </div>
                        <div class="upgrade-gains">
                            ${this.formatGains(upgrade.gains)}
                        </div>
                        <div class="upgrade-limit">
                            ${upgrade.purchased}/${upgrade.numberOfPurchasesPossible} purchased
                        </div>
                    </div>
                `;

                div.addEventListener('click', () => {
                    window.game.upgradeController.purchaseUpgrade(upgrade.id);
                    this.updateUpgrades(); // Refresh UI after purchase
                    this.updateCurrencies(); // Refresh currencies display
                });

                container.appendChild(div);
                hasChanges = true;
            }
        }

        // Remove any buttons that no longer correspond to active upgrades
        existingUpgrades.forEach((button, upgradeId) => {
            if (!this.gameState.upgrades[upgradeId] || 
                this.gameState.upgrades[upgradeId].purchased >= this.gameState.upgrades[upgradeId].numberOfPurchasesPossible) {
                button.remove();
                hasChanges = true;
            }
        });

        if (!hasChanges) {
            console.log('No changes detected, skipping update.');
        }
    }
    // Generated by Copilot
    
    formatGains(gains) {
        let gainsText = [];
        
        // Format currency maximums
        if (gains.currencyMaximum) {
            for (const [currencyId, value] of Object.entries(gains.currencyMaximum)) {
                if (this.gameState.currencies[currencyId]) {
                    gainsText.push(`+${value} ${this.gameState.currencies[currencyId].name} Maximum`);
                }
            }
        }
        
        // Format stat pool maximums
        if (gains.statPoolMaximum) {
            for (const [statPoolId, value] of Object.entries(gains.statPoolMaximum)) {
                if (this.gameState.statPools[statPoolId]) {
                    gainsText.push(`+${value} ${this.gameState.statPools[statPoolId].name} Maximum`);
                }
            }
        }
        
        // Format currency generation
        if (gains.currencyGeneration) {
            for (const [currencyId, value] of Object.entries(gains.currencyGeneration)) {
                if (this.gameState.currencies[currencyId]) {
                    gainsText.push(`+${value}/s ${this.gameState.currencies[currencyId].name} Generation`);
                }
            }
        }
        
        // Format special effects
        if (gains.specialEffects) {
            if (gains.specialEffects.doubleActions) {
                gainsText.push(`Perform multiple actions simultaneously`);
            }
            // Add other special effects formatting here
        }
        
        return gainsText.map(text => `<span class="gain">${text}</span>`).join(' ');
    }
    
    updateHouse() {
        const container = document.getElementById('house-container');
        
        if (this.gameState.home.type === "Homeless") {
            container.innerHTML = `
                <p>You are currently homeless.</p>
                <p>Improve your situation to find housing.</p>
            `;
            return;
        }
        
        container.innerHTML = `
            <h3>${this.gameState.home.type}</h3>
            <p>Floor Space: ${this.gameState.home.availableFloorSpace}/${this.gameState.home.floorSpace}</p>
            <div id="furniture-container"></div>
        `;
        
        const furnitureContainer = document.getElementById('furniture-container');
        for (const furniture of Object.values(this.gameState.home.furniture)) {
            const div = document.createElement('div');
            div.className = 'furniture';
            div.innerHTML = `
                <h4>${furniture.name}</h4>
                <p>${furniture.description}</p>
                <p>Floor Space: ${furniture.floorSpace}</p>
            `;
            furnitureContainer.appendChild(div);
        }
    }
    
    // Continuing the UIController's updateStatus method
    updateStatus() {
        const container = document.getElementById('status-container');
        const char = this.gameState.character;
        
        container.innerHTML = `
            <h3>${char.name}</h3>
            <p>Level ${char.level} ${char.class}</p>
            <div class="character-progress">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${(char.experience / char.nextLevelExperience * 100).toFixed(1)}%; background-color: #f1c40f">
                        ${(char.experience / char.nextLevelExperience * 100).toFixed(0)}%
                    </div>
                </div>
                <div class="character-exp">
                    ${char.experience}/${char.nextLevelExperience} XP
                </div>
            </div>
            
            <h4>Stats</h4>
            <div id="character-stats"></div>
            
            <h4>Equipment</h4>
            <div id="character-equipment">
                <p>You have no equipment yet.</p>
            </div>
        `;
        
        // Future equipment system would be implemented here
    }
    
    showNotification(message, duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.background = '#333';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.display = 'none';
            document.body.appendChild(notification);
        }
        
        // Show notification
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
}