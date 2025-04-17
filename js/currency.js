// currency.js
import Resource from './resource.js';

/**
 * Currency class for resources like gold, scrolls, research, etc.
 */
class Currency extends Resource {
    /**
     * Create a new currency
     * @param {Object} config - Configuration for the currency
     */
    constructor(config) {
        super(config);
        this.generatesResourceId = config.generatesResourceId || null;
        this.generationRate = config.generationRate || 0;
        this.purchaseCost = config.purchaseCost || null;
        this.purchaseUnlocks = config.purchaseUnlocks || [];
        this.purchaseEffects = config.purchaseEffects || [];
    }
    
    /**
     * Check if the player can purchase this currency
     * @param {Object} character - The character object
     * @returns {boolean} - True if the purchase is possible
     */
    canPurchase(character) {
        if (!this.purchaseCost) return false;
        if (this.isFull()) return false;
        
        // Check if we have enough of each required resource
        for (const [resourceId, cost] of Object.entries(this.purchaseCost)) {
            const resource = character.getResource(resourceId);
            if (!resource || resource.current < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Purchase this currency
     * @param {Object} character - The character object
     * @returns {boolean} - True if purchase was successful
     */
    purchase(character) {
        if (!this.canPurchase(character)) return false;
        
        // Deduct costs
        for (const [resourceId, cost] of Object.entries(this.purchaseCost)) {
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.remove(cost);
            }
        }
        
        // Add one of this currency
        this.add(1);
        
        // Unlock any resources that should be unlocked
        for (const resourceId of this.purchaseUnlocks) {
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.unlocked = true;
            }
        }
        
        // Apply effects
        for (const effect of this.purchaseEffects) {
            effect(character);
        }
        
        return true;
    }
    
    /**
     * Update currency generation
     * @param {number} deltaTime - Time passed in seconds
     * @param {Object} character - The character object
     */
    update(deltaTime, character) {
        super.update(deltaTime);
        
        // Handle passive generation of other resources
        if (this.generationRate > 0 && this.generatesResourceId && this.current > 0) {
            const targetResource = character.getResource(this.generatesResourceId);
            if (targetResource && targetResource.unlocked) {
                const amount = this.generationRate * this.current * deltaTime;
                targetResource.add(amount);
            }
        }
    }
    
    /**
     * Convert to an object for saving
     * @returns {Object} - Serialized currency
     */
    serialize() {
        const data = super.serialize();
        return data;
    }
    
    /**
     * Load from saved data
     * @param {Object} data - Saved currency data
     */
    deserialize(data) {
        super.deserialize(data);
    }
}

/**
 * Scroll currency that generates research
 */
class Scroll extends Currency {
    /**
     * Create a scroll resource
     * @param {Object} game - The game instance
     */
    constructor(game) {
        super({
            id: 'scrolls',
            name: 'Scrolls',
            description: 'Ancient texts that generate research over time',
            max: 10,
            unlocked: false,
            generationRate: 0.1,
            generatesResourceId: 'research',
            purchaseCost: { gold: 10 },
            purchaseUnlocks: ['research', 'scrolls'],
            purchaseEffects: [
                // Effect to increase research max by 1 for each scroll
                (character) => {
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(10 + character.getResource('scrolls').current);
                    }
                }
            ]
        });
        
        this.game = game;
    }
    
    /**
     * Override purchase to add special effects
     * @param {Object} character - The character object
     * @returns {boolean} - True if purchase was successful
     */
    purchase(character) {
        const success = super.purchase(character);
        
        if (success) {
            // Log the purchase
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                const logEntry = document.createElement('p');
                logEntry.textContent = `You purchased a scroll for 10 gold. Reading this makes your head hurt. In a good way?`;
                logContent.insertBefore(logEntry, logContent.firstChild);
            }
            
            // Show notification
            this.game.ui.showNotification('You purchased a scroll! You can now generate research.');
        }
        
        return success;
    }
}

export { Currency, Scroll };