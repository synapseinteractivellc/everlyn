// js/controllers/upgrade-controller.js
class UpgradeController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        this.checkUpgradeUnlocks();
    }
    
    checkUpgradeUnlocks() {
        // Check for gold purse unlock (example)
        if (!this.gameState.upgrades.goldPurse.unlocked && 
            this.gameState.currencies.gold.amount >= 10) {
            this.gameState.upgrades.goldPurse.unlocked = true;
            
            // Add notification to action log
            this.gameState.actionLog.unshift({
                message: `You can now purchase a ${this.gameState.upgrades.goldPurse.name}!`,
                timestamp: Date.now()
            });
        }
        
        // Add other unlock conditions for different upgrades
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.gameState.upgrades[upgradeId];
        
        // Check if upgrade exists and can be purchased
        if (!upgrade || !upgrade.unlocked || upgrade.purchased >= upgrade.numberOfPurchasesPossible) {
            return false;
        }
        
        // Check if player can afford the upgrade
        if (!this.canAffordUpgrade(upgrade)) {
            return false;
        }
        
        // Apply costs
        this.applyCosts(upgrade);
        
        // Apply gains
        this.applyGains(upgrade);
        
        // Mark as purchased
        upgrade.purchased++;
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `You purchased ${upgrade.name}!`,
            timestamp: Date.now()
        });
        
        return true;
    }
    
    canAffordUpgrade(upgrade) {
        // Check currency costs
        for (const [currencyId, cost] of Object.entries(upgrade.costs.currencies || {})) {
            if (this.gameState.currencies[currencyId] && 
                this.gameState.currencies[currencyId].amount < cost) {
                return false;
            }
        }
        
        // Check stat pool costs
        for (const [statPoolId, cost] of Object.entries(upgrade.costs.statPools || {})) {
            if (this.gameState.statPools[statPoolId] && 
                this.gameState.statPools[statPoolId].current < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    applyCosts(upgrade) {
        // Apply currency costs
        for (const [currencyId, cost] of Object.entries(upgrade.costs.currencies || {})) {
            if (this.gameState.currencies[currencyId]) {
                this.gameState.currencies[currencyId].amount -= cost;
            }
        }
        
        // Apply stat pool costs
        for (const [statPoolId, cost] of Object.entries(upgrade.costs.statPools || {})) {
            if (this.gameState.statPools[statPoolId]) {
                this.gameState.statPools[statPoolId].current -= cost;
            }
        }
        
        // Apply maximum stat pool costs
        for (const [statPoolId, cost] of Object.entries(upgrade.costs.statPoolMaximums || {})) {
            if (this.gameState.statPools[statPoolId]) {
                this.gameState.statPools[statPoolId].max -= cost;
                // Ensure current doesn't exceed new max
                if (this.gameState.statPools[statPoolId].current > this.gameState.statPools[statPoolId].max) {
                    this.gameState.statPools[statPoolId].current = this.gameState.statPools[statPoolId].max;
                }
            }
        }
    }
    
    applyGains(upgrade) {
        // Apply currency maximum increases
        for (const [currencyId, value] of Object.entries(upgrade.gains.currencyMaximum || {})) {
            if (this.gameState.currencies[currencyId]) {
                this.gameState.currencies[currencyId].maximum += value;
            }
        }
        
        // Apply stat pool maximum increases
        for (const [statPoolId, value] of Object.entries(upgrade.gains.statPoolMaximum || {})) {
            if (this.gameState.statPools[statPoolId]) {
                this.gameState.statPools[statPoolId].max += value;
            }
        }
        
        // Apply passive generation rate increases
        for (const [currencyId, value] of Object.entries(upgrade.gains.currencyGeneration || {})) {
            if (this.gameState.currencies[currencyId]) {
                this.gameState.currencies[currencyId].generationRate += value;
            }
        }
        
        // Apply special effects like "doubleActions"
        if (upgrade.gains.specialEffects) {
            for (const [effectName, value] of Object.entries(upgrade.gains.specialEffects)) {
                if (effectName === "doubleActions" && value === true) {
                    this.gameState.maxSimultaneousActions = (this.gameState.maxSimultaneousActions || 1) + 1;
                }
                // Add other special effects here
            }
        }
    }
}