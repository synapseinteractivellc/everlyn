// js/controllers/save-controller.js
class SaveController {
    constructor(gameState) {
        this.gameState = gameState;
        this.saveKey = 'fantasy_city_idle_save';
    }
    
    saveGame() {
        const saveData = {
            timestamp: Date.now(),
            character: this.gameState.character,
            statPools: this.gameState.statPools,
            currencies: this.gameState.currencies,
            upgrades: this.gameState.upgrades,
            skills: this.gameState.skills,
            home: this.gameState.home,
            currentAction: this.gameState.currentAction,
            previousAction: this.gameState.previousAction,
            defaultRestAction: this.gameState.defaultRestAction,
            actionLog: this.gameState.actionLog.slice(0, 10), // Save only recent logs
            
            // Save action tracking data
            actions: {}
        };
        
        // Save only necessary action data, not the full definitions
        for (const [actionId, action] of Object.entries(this.gameState.actions)) {
            saveData.actions[actionId] = {
                id: actionId,
                completionCount: action.completionCount,
                totalTimeSpent: action.totalTimeSpent,
                currentProgress: action.currentProgress,
                lastActionStartTime: action.lastActionStartTime,
                unlocked: action.unlocked
            };
        }
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('Game saved successfully.');
            console.log('Save Data:', saveData); // Debugging line to check saved data
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }

    }
    
    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem(this.saveKey));
            if (!saveData) return false;
            
            // Load basic data
            this.gameState.character = saveData.character;
            this.gameState.statPools = saveData.statPools;
            this.gameState.currencies = saveData.currencies;
            this.gameState.upgrades = saveData.upgrades || this.gameState.upgrades;
            this.gameState.skills = saveData.skills;
            this.gameState.home = saveData.home;
            this.gameState.currentAction = saveData.currentAction;
            this.gameState.previousAction = saveData.previousAction;
            this.gameState.defaultRestAction = saveData.defaultRestAction;
            this.gameState.actionLog = saveData.actionLog || [];
            
            // Load action tracking data
            for (const [actionId, savedAction] of Object.entries(saveData.actions)) {
                if (this.gameState.actions[actionId]) {
                    this.gameState.actions[actionId].completionCount = savedAction.completionCount;
                    this.gameState.actions[actionId].totalTimeSpent = savedAction.totalTimeSpent;
                    this.gameState.actions[actionId].currentProgress = savedAction.currentProgress;
                    this.gameState.actions[actionId].lastActionStartTime = savedAction.lastActionStartTime;
                    this.gameState.actions[actionId].unlocked = savedAction.unlocked;
                }
            }
            
            // Process offline progress
            this.processOfflineProgress(Date.now() - saveData.timestamp);
            
            console.log('Game loaded successfully.');
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            return false;
        }
    }
    
    processOfflineProgress(elapsedTime) {
        // Convert to seconds
        const elapsedSeconds = elapsedTime / 1000;
        
        // Cap offline progress to a reasonable amount (e.g., 8 hours)
        const maxOfflineSeconds = 8 * 60 * 60;
        const effectiveElapsedSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);
        
        // Apply passive currency generation
        for (const currency of Object.values(this.gameState.currencies)) {
            if (currency.generationRate > 0) {
                currency.amount += currency.generationRate * effectiveElapsedSeconds;
            }
        }
        
        // Process current action if there was one
        if (this.gameState.currentAction) {
            const action = this.gameState.actions[this.gameState.currentAction];
            if (action) {
                // Calculate how many times the action could have completed
                const actionDurationSeconds = action.baseDuration / 1000;
                let remainingTime = effectiveElapsedSeconds;
                
                // First, complete the in-progress action
                if (action.currentProgress > 0) {
                    const timeToComplete = actionDurationSeconds * (1 - action.currentProgress);
                    if (remainingTime >= timeToComplete) {
                        // Complete the action
                        remainingTime -= timeToComplete;
                        
                        // Reset progress
                        action.currentProgress = 0;
                        
                        // Track completion
                        action.completionCount++;
                        action.totalTimeSpent += action.baseDuration;
                    } else {
                        // Partial progress
                        action.currentProgress += remainingTime / actionDurationSeconds;
                        remainingTime = 0;
                    }
                }
                
                // Then complete as many full actions as possible
                const completionsPossible = Math.floor(remainingTime / actionDurationSeconds);
                remainingTime -= completionsPossible * actionDurationSeconds;
                
                // Apply completions
                if (completionsPossible > 0) {
                    // Track completions
                    action.completionCount += completionsPossible;
                    action.totalTimeSpent += completionsPossible * action.baseDuration;
                    
                    // Add currency rewards
                    for (const [currencyId, reward] of Object.entries(action.currencyRewards)) {
                        if (this.gameState.currencies[currencyId]) {
                            let amount = reward;
                            if (reward.min !== undefined && reward.max !== undefined) {
                                // Use average for random ranges
                                amount = (reward.min + reward.max) / 2;
                            }
                            
                            this.gameState.currencies[currencyId].amount += amount * completionsPossible;
                        }
                    }
                    
                    // Add skill experience
                    for (const [skillId, expAmount] of Object.entries(action.skillExperience)) {
                        if (this.gameState.skills[skillId]) {
                            this.gameState.skills[skillId].experience += expAmount * completionsPossible;
                        }
                    }
                }
                
                // Apply partial progress for the final action
                if (remainingTime > 0) {
                    action.currentProgress = remainingTime / actionDurationSeconds;
                }
                
                // Add log entry about offline progress
                this.gameState.actionLog.unshift({
                    message: `While you were away, you completed ${action.name} ${completionsPossible} times.`,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    resetGame() {
        localStorage.removeItem(this.saveKey);
        
        // Give the notification a moment to display before reload
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}