// js/models/upgrade.js
class Upgrade {
    constructor(id, name, description, costs, gains, requiredClass, requiredSkills, unlockCondition, numberOfPurchasesPossible) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.costs = costs;                // Object: { currencyId: amount } or { statPoolId: amount }
        this.gains = gains;                // Object describing effects when purchased
        this.requiredClass = requiredClass || null;
        this.requiredSkills = requiredSkills || {};
        this.unlockCondition = unlockCondition; // Function that returns true when unlocked
        this.numberOfPurchasesPossible = numberOfPurchasesPossible || 1;
        this.purchased = 0;               // Number of times purchased
        this.unlocked = false;            // Whether visible to player
    }
    
    isAvailable() {
        return this.unlocked && this.purchased < this.numberOfPurchasesPossible;
    }
    
    canAfford(gameState) {
        // Check currency costs
        for (const [currencyId, amount] of Object.entries(this.costs.currencies || {})) {
            if (!gameState.currencies[currencyId] || gameState.currencies[currencyId].amount < amount) {
                return false;
            }
        }
        
        // Check stat pool costs
        for (const [statPoolId, amount] of Object.entries(this.costs.statPools || {})) {
            if (!gameState.statPools[statPoolId] || gameState.statPools[statPoolId].current < amount) {
                return false;
            }
        }
        
        return true;
    }
}