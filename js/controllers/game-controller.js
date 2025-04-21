// js/controllers/game-controller.js
class GameController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        // Update stat pool regeneration
        this.updateStatPools(deltaTime / 1000); // Convert to seconds
    }
    
    updateStatPools(deltaTimeSeconds) {
        for (const statPool of Object.values(this.gameState.statPools)) {
            if (statPool.regenRate > 0) {
                statPool.current = Math.min(
                    statPool.max,
                    statPool.current + statPool.regenRate * deltaTimeSeconds
                );
            }
        }
    }
    
    setCharacterName(name) {
        this.gameState.character.name = name;
    }
    
    unlockStatPool(statPoolId, statPool) {
        if (!this.gameState.statPools[statPoolId]) {
            this.gameState.statPools[statPoolId] = statPool;
            
            // Add to log
            this.gameState.actionLog.unshift({
                message: `You've unlocked ${statPool.name}!`,
                timestamp: Date.now()
            });
            
            return true;
        }
        return false;
    }
    
    unlockCurrency(currencyId, currency) {
        if (!this.gameState.currencies[currencyId]) {
            this.gameState.currencies[currencyId] = currency;
            
            // Add to log
            this.gameState.actionLog.unshift({
                message: `You've unlocked ${currency.name}!`,
                timestamp: Date.now()
            });
            
            return true;
        }
        return false;
    }
    
    unlockSkill(skillId, skill) {
        if (!this.gameState.skills[skillId]) {
            this.gameState.skills[skillId] = skill;
            
            // Add to log
            this.gameState.actionLog.unshift({
                message: `You've unlocked the ${skill.name} skill!`,
                timestamp: Date.now()
            });
            
            return true;
        }
        return false;
    }
    
    unlockAction(actionId, action) {
        if (!this.gameState.actions[actionId]) {
            this.gameState.actions[actionId] = action;
            
            // Add to log
            this.gameState.actionLog.unshift({
                message: `You've unlocked a new action: ${action.name}!`,
                timestamp: Date.now()
            });
            
            return true;
        }
        return false;
    }
}