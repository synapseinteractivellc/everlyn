// js/controllers/action-controller.js
class ActionController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        this.updateCurrentAction(deltaTime);
        this.checkRestAction();
    }
    
    updateCurrentAction(deltaTime) {
        // If no current action, do nothing
        if (!this.gameState.currentAction) return;
        
        const action = this.gameState.actions[this.gameState.currentAction];
        if (!action) return;
        
        // Check if we have enough resources to perform the action
        if (!this.hasEnoughResources(action) && !action.isRestAction) {
            this.switchToRestAction();
            return;
        }
        
        // Update action progress
        action.currentProgress += deltaTime / action.baseDuration;
        
        // If action is complete
        if (action.currentProgress >= 1) {
            this.completeAction(action);
        }
    }
    
    startAction(actionId) {
        const action = this.gameState.actions[actionId];
        if (!action || !action.unlocked) return false;
        
        // Check if we have enough resources
        if (!this.hasEnoughResources(action) && !action.isRestAction) {
            this.switchToRestAction();
            return false;
        }
        
        // Set as current action
        this.gameState.currentAction = actionId;
        action.lastActionStartTime = Date.now();
        
        // Add to log - different message if resuming vs starting fresh
        if (action.currentProgress > 0) {
            this.gameState.actionLog.unshift({
                message: `You resumed ${action.name} at ${Math.floor(action.currentProgress * 100)}% progress.`,
                timestamp: Date.now()
            });
        } else {
            this.gameState.actionLog.unshift({
                message: `You started ${action.name}.`,
                timestamp: Date.now()
            });
        }
        
        return true;
    }
    
    completeAction(action) {
        // Apply costs
        this.applyCosts(action);
        
        // Apply rewards
        this.applyRewards(action);
        
        // Update tracking
        action.completionCount++;
        action.totalTimeSpent += action.baseDuration;
        
        // Add to log
        this.addToActionLog(action);
        
        // Reset progress for next iteration
        action.currentProgress = 0;
        action.lastActionStartTime = Date.now();
        
        // Check for improvements based on completion count
        this.checkActionImprovements(action.id);
    }
    
    hasEnoughResources(action) {
        // Check stat pools
        for (const [statId, cost] of Object.entries(action.statPoolCosts)) {
            if (this.gameState.statPools[statId] && 
                this.gameState.statPools[statId].current < cost) {
                return false;
            }
        }
        
        // Check currencies
        for (const [currencyId, cost] of Object.entries(action.currencyCosts)) {
            if (this.gameState.currencies[currencyId] && 
                this.gameState.currencies[currencyId].amount < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    applyCosts(action) {
        // Apply stat pool costs
        for (const [statId, cost] of Object.entries(action.statPoolCosts)) {
            if (this.gameState.statPools[statId]) {
                this.gameState.statPools[statId].current = Math.max(
                    0, 
                    this.gameState.statPools[statId].current - cost
                );
            }
        }
        
        // Apply currency costs
        for (const [currencyId, cost] of Object.entries(action.currencyCosts)) {
            if (this.gameState.currencies[currencyId]) {
                this.gameState.currencies[currencyId].amount = Math.max(
                    0, 
                    this.gameState.currencies[currencyId].amount - cost
                );
            }
        }
    }
    
    applyRewards(action) {
        // Apply currency rewards
        for (const [currencyId, reward] of Object.entries(action.currencyRewards)) {
            if (this.gameState.currencies[currencyId]) {
                // Random value between min and max if range is specified
                let amount = reward;
                if (reward.min !== undefined && reward.max !== undefined) {
                    amount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
                }
                
                // Use currency controller to add currency (which respects maximums)
                if (window.game && window.game.currencyController) {
                    window.game.currencyController.addCurrency(currencyId, amount);
                } else {
                    // Fallback if currency controller isn't available
                    const currency = this.gameState.currencies[currencyId];
                    const newAmount = currency.amount + amount;
                    currency.amount = Math.min(newAmount, currency.maximum || Infinity);
                }
            }
        }
        
        // Apply skill experience
        for (const [skillId, expAmount] of Object.entries(action.skillExperience)) {
            if (this.gameState.skills[skillId]) {
                if (window.game && window.game.skillController) {
                    // Use skill controller to add experience (which handles leveling up)
                    window.game.skillController.addSkillExperience(skillId, expAmount);
                } else {
                    // Fallback if skill controller isn't available
                    this.gameState.skills[skillId].experience += expAmount;
                }
            }
        }
        
        // Apply stat pool restoration
        for (const [statId, amount] of Object.entries(action.statPoolRestoration)) {
            if (this.gameState.statPools[statId]) {
                this.gameState.statPools[statId].current = Math.min(
                    this.gameState.statPools[statId].max,
                    this.gameState.statPools[statId].current + amount
                );
            }
        }
    }
    
    switchToRestAction() {
        // Store the current action to return to later
        this.gameState.previousAction = this.gameState.currentAction;
        
        // Switch to default rest action
        this.startAction(this.gameState.defaultRestAction);
    }
    
    checkRestAction() {
        // If current action is rest and stat pools are full
        if (this.isCurrentActionRest() && this.areStatPoolsFull()) {
            // Return to previous action
            if (this.gameState.previousAction) {
                this.startAction(this.gameState.previousAction);
            }
        }
    }
    
    isCurrentActionRest() {
        if (!this.gameState.currentAction) return false;
        
        const action = this.gameState.actions[this.gameState.currentAction];
        return action && action.isRestAction;
    }
    
    areStatPoolsFull() {
        for (const statPool of Object.values(this.gameState.statPools)) {
            if (statPool.current < statPool.max) {
                return false;
            }
        }
        return true;
    }
    
    addToActionLog(action) {
        // Generate log message
        let message = `You ${action.name}.`;
        
        // Add currency rewards to message
        for (const [currencyId, reward] of Object.entries(action.currencyRewards)) {
            if (this.gameState.currencies[currencyId]) {
                // Random value between min and max if range is specified
                let amount = reward;
                if (reward.min !== undefined && reward.max !== undefined) {
                    amount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
                }
                
                if (amount > 0) {
                    message += ` Received ${amount} ${this.gameState.currencies[currencyId].name}.`;
                }
            }
        }
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: message,
            timestamp: Date.now()
        });
        
        // Keep log at a reasonable size
        if (this.gameState.actionLog.length > 100) {
            this.gameState.actionLog.pop();
        }
    }
    
    checkActionImprovements(actionId) {
        const action = this.gameState.actions[actionId];
        
        // Example improvements based on completion count
        // These could be moved to a configuration file later
        if (action.completionCount === 10) {
            // Maybe reduce duration by 5%
            action.baseDuration *= 0.95;
        } else if (action.completionCount === 50) {
            // Maybe increase rewards
            for (const currencyId in action.currencyRewards) {
                if (action.currencyRewards[currencyId].min !== undefined) {
                    action.currencyRewards[currencyId].min = Math.ceil(action.currencyRewards[currencyId].min * 1.1);
                    action.currencyRewards[currencyId].max = Math.ceil(action.currencyRewards[currencyId].max * 1.1);
                } else {
                    action.currencyRewards[currencyId] = Math.ceil(action.currencyRewards[currencyId] * 1.1);
                }
            }
        }
        // More improvements could be added here
    }

    stopCurrentAction() {
        if (this.gameState.currentAction) {
            // Don't reset progress, just stop the action
            const action = this.gameState.actions[this.gameState.currentAction];
            if (action) {
                // Only update lastActionStartTime
                action.lastActionStartTime = null;
            }
            
            // Save the action we're stopping
            const stoppedActionId = this.gameState.currentAction;
            
            // Clear current action
            this.gameState.previousAction = null;
            this.gameState.currentAction = null;
            
            // Add to log
            this.gameState.actionLog.unshift({
                message: `You paused your current action. Progress is saved.`,
                timestamp: Date.now()
            });
            
            return stoppedActionId;
        }
        return null;
    }
}