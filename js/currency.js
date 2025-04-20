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

        // Initialize currency in state if it doesn't exist yet
        if (this.game && this.game.state) {
            const currentState = this.game.state.getCurrency(this.id);
            if (!currentState) {
                this.game.state.setState(`character.currencies.${this.id}`, {
                current: this.current,
                max: this.max,
                unlocked: this.unlocked,
                generatesResourceId: this.generatesResourceId,
                generationRate: this.generationRate
                });
            } else {
                // Sync from state
                this.current = currentState.current;
                this.max = currentState.max;
                this.unlocked = currentState.unlocked;
                if (currentState.generatesResourceId) this.generatesResourceId = currentState.generatesResourceId;
                if (currentState.generationRate) this.generationRate = currentState.generationRate;
            }
        }    
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

                // Update state if available
                if (this.game && this.game.state) {
                    this.game.state.updateCurrency(resourceId, { unlocked: true });
                }
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
        // Base resource update
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

    add(amount) {
        const oldValue = this.current;

        if (this.game && this.game.state) {
            // Get current value from state
            const stateData = this.game.state.getCurrency(this.id);
            if (stateData) {
                // Calculate new value with bounds checking
                let newValue = stateData.current + amount;
                if (newValue > stateData.max) newValue = stateData.max;
                
                // Only update if changed
                if (newValue !== stateData.current) {
                    // Update state
                    this.game.state.updateCurrency(this.id, { current: newValue });
                    
                    // Update local property
                    this.current = newValue;
                    
                    // Manually emit event for immediate UI update
                    console.log(`Currency ${this.id} added: ${oldValue} -> ${newValue}`);
                    this.game.events.emit('resource.changed', {
                    id: this.id,
                    oldValue: oldValue,
                    newValue: newValue,
                    resource: this
                    });
                }
            }
        } else {
            // Fallback to direct property change
            this.current += amount;
            if (this.current > this.max) {
                this.current = this.max;
            }
            
            // Emit event directly
            if (this.current !== oldValue && this.game && this.game.events) {
                this.game.events.emit('resource.changed', {
                    id: this.id,
                    oldValue: oldValue,
                    newValue: this.current,
                    resource: this
                });
            }
        }

        return this.current;
    }

    remove(amount) {
        const oldValue = this.current;
        
        if (this.game && this.game.state) {
          // Get current value from state
          const stateData = this.game.state.getCurrency(this.id);
            if (stateData) {
                // Calculate new value with bounds checking
                let newValue = stateData.current - amount;
                if (newValue < 0) newValue = 0;
                
                // Only update if changed
                if (newValue !== stateData.current) {
                // Update state
                    this.game.state.updateCurrency(this.id, { current: newValue });
                    
                    // Update local property
                    this.current = newValue;
                    
                    // Manually emit event for immediate UI update
                    console.log(`Currency ${this.id} removed: ${oldValue} -> ${newValue}`);
                    this.game.events.emit('resource.changed', {
                        id: this.id,
                        oldValue: oldValue,
                        newValue: newValue,
                        resource: this
                    });
                }
            }
        } else {
            // Fallback code remains the same
            this.current -= amount;
            if (this.current < 0) {
                this.current = 0;
            }
            
            // Emit event if value changed and game exists
            if (this.current !== oldValue && this.game && this.game.events) {
                this.game.events.emit('resource.changed', {
                    id: this.id,
                    oldValue: oldValue,
                    newValue: this.current,
                    resource: this
                });
            }
        }
        
        return this.current;
    }

    // Also update setMax to use state
    setMax(max, fillCurrent = false) {
        if (this.game && this.game.state) {
            // Calculate new current value if needed
            let newCurrent = this.current;
            if (fillCurrent) {
                newCurrent = max;
            } else if (newCurrent > max) {
                newCurrent = max;
            }

            // Update state
            this.game.state.updateCurrency(this.id, { 
                max: max,
                current: newCurrent
            });

            // Update local properties
            this.max = max;
            this.current = newCurrent;
        } else {
            // Fallback to direct property change
            this.max = max;
            if (fillCurrent) {
                this.current = max;
            } else if (this.current > max) {
                this.current = max;
            }
        }
    }
    
    /**
     * Convert to an object for saving
     * @returns {Object} - Serialized currency
     */
    serialize() {
        const data = super.serialize();
        data.generatesResourceId = this.generatesResourceId;
        data.generationRate = this.generationRate;
        return data;
    }
    
    /**
     * Load from saved data
     * @param {Object} data - Saved currency data
     */
    deserialize(data) {
        super.deserialize(data);
        if (data.generatesResourceId !== undefined) this.generatesResourceId = data.generatesResourceId;
        if (data.generationRate !== undefined) this.generationRate = data.generationRate;
        
        // Update state if available
        if (this.game && this.game.state) {
            this.game.state.updateCurrency(this.id, {
                current: this.current,
                max: this.max,
                unlocked: this.unlocked,
                generatesResourceId: this.generatesResourceId,
                generationRate: this.generationRate
            });
        }
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
        const unlockedScrolls = character.getResource('scrolls').unlocked;
        const success = super.purchase(character);        
        
        if (success) {
            
            if (!unlockedScrolls) {
                // Log the purchase
                const logContent = document.querySelector('.log-content');
                if (logContent) {
                    const logEntry = document.createElement('p');
                    logEntry.textContent = `You purchased a scroll for 10 gold. Reading this makes your head hurt. In a good way?`;
                    logContent.insertBefore(logEntry, logContent.firstChild);
                }
                
                // Show notification
                this.game.ui.showNotification('You purchased a scroll! You can now generate research.');
            } else {
                // Log the purchase
                const logContent = document.querySelector('.log-content');
                if (logContent) {
                    const logEntry = document.createElement('p');
                    logEntry.textContent = `You purchased another scroll!`;
                    logContent.insertBefore(logEntry, logContent.firstChild);
                }
                
                // Show notification
                this.game.ui.showNotification('You purchased another scroll! Research generation increased.');
            }
            
        }
        
        return success;
    }
}

export { Currency, Scroll };