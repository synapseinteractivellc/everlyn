// js/controllers/home-controller.js
class HomeController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        // Nothing to update consistently yet
    }
    
    upgradeHome(newHomeType, floorSpace) {
        const oldHome = this.gameState.home.type;
        
        // Update home
        this.gameState.home.type = newHomeType;
        this.gameState.home.floorSpace = floorSpace;
        this.gameState.home.availableFloorSpace = floorSpace;
        
        // Furniture is maintained if it fits in new home
        const newFurniture = {};
        let usedSpace = 0;
        
        for (const [id, furniture] of Object.entries(this.gameState.home.furniture)) {
            if (usedSpace + furniture.floorSpace <= floorSpace) {
                newFurniture[id] = furniture;
                usedSpace += furniture.floorSpace;
            }
        }
        
        this.gameState.home.furniture = newFurniture;
        this.gameState.home.availableFloorSpace = floorSpace - usedSpace;
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `You've moved from ${oldHome} to ${newHomeType}!`,
            timestamp: Date.now()
        });
    }
    
    addFurniture(furnitureId, furniture) {
        // Check if we have enough space
        if (furniture.floorSpace > this.gameState.home.availableFloorSpace) {
            return false;
        }
        
        // Add furniture
        this.gameState.home.furniture[furnitureId] = furniture;
        this.gameState.home.availableFloorSpace -= furniture.floorSpace;
        
        // Apply furniture effects (if any)
        this.applyFurnitureEffects(furniture);
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `You've added ${furniture.name} to your home!`,
            timestamp: Date.now()
        });
        
        return true;
    }
    
    removeFurniture(furnitureId) {
        const furniture = this.gameState.home.furniture[furnitureId];
        if (!furniture) return false;
        
        // Remove furniture
        delete this.gameState.home.furniture[furnitureId];
        this.gameState.home.availableFloorSpace += furniture.floorSpace;
        
        // Remove furniture effects (if any)
        this.removeFurnitureEffects(furniture);
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `You've removed ${furniture.name} from your home.`,
            timestamp: Date.now()
        });
        
        return true;
    }
    
    applyFurnitureEffects(furniture) {
        // Example furniture effects
        if (furniture.effects) {
            // Apply stat pool effects
            if (furniture.effects.statPools) {
                for (const [statId, bonus] of Object.entries(furniture.effects.statPools)) {
                    if (this.gameState.statPools[statId]) {
                        this.gameState.statPools[statId].max += bonus;
                    }
                }
            }
            
            // Apply currency generation effects
            if (furniture.effects.currencyGeneration) {
                for (const [currencyId, rate] of Object.entries(furniture.effects.currencyGeneration)) {
                    if (this.gameState.currencies[currencyId]) {
                        this.gameState.currencies[currencyId].generationRate += rate;
                    }
                }
            }
            
            // Apply action effects - unlock new actions, improve existing ones, etc.
            if (furniture.effects.actions) {
                for (const action of furniture.effects.actions) {
                    if (action.type === 'unlock' && !this.gameState.actions[action.id]) {
                        this.gameState.actions[action.id] = action.data;
                    }
                }
            }
        }
    }
    
    removeFurnitureEffects(furniture) {
        // Reverse of applyFurnitureEffects
        if (furniture.effects) {
            // Remove stat pool effects
            if (furniture.effects.statPools) {
                for (const [statId, bonus] of Object.entries(furniture.effects.statPools)) {
                    if (this.gameState.statPools[statId]) {
                        this.gameState.statPools[statId].max -= bonus;
                        // Ensure current doesn't exceed max
                        if (this.gameState.statPools[statId].current > this.gameState.statPools[statId].max) {
                            this.gameState.statPools[statId].current = this.gameState.statPools[statId].max;
                        }
                    }
                }
            }
            
            // Remove currency generation effects
            if (furniture.effects.currencyGeneration) {
                for (const [currencyId, rate] of Object.entries(furniture.effects.currencyGeneration)) {
                    if (this.gameState.currencies[currencyId]) {
                        this.gameState.currencies[currencyId].generationRate -= rate;
                        // Ensure generation rate doesn't go negative
                        if (this.gameState.currencies[currencyId].generationRate < 0) {
                            this.gameState.currencies[currencyId].generationRate = 0;
                        }
                    }
                }
            }
            
            // Note: We don't remove unlocked actions as that would be disruptive
        }
    }
}