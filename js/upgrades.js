// upgrades.js

/**
 * Base Upgrade class that all purchasable upgrades will extend
 */
class Upgrade {
    /**
     * Create a new upgrade
     * @param {Object} game - The game instance
     * @param {Object} config - Configuration for the upgrade
     */
    constructor(game, config) {
        this.game = game;
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.costs = config.costs || {}; // Resources required to purchase
        this.effects = config.effects || {}; // Effects when purchased
        this.purchased = false;
        this.unlocked = config.unlocked !== undefined ? config.unlocked : false;
        this.tooltipText = config.tooltipText || "";
        
        // Load saved data
        this.loadSavedData();
    }
    
    /**
     * Load saved data from character
     */
    loadSavedData() {
        // Initialize upgrades object in character if it doesn't exist
        if (!this.game.character.upgrades) {
            this.game.character.upgrades = {};
        }
        
        // Check if this upgrade is purchased
        if (this.game.character.upgrades[this.id]) {
            this.purchased = true;
        }
    }
    
    /**
     * Check if the player can afford this upgrade
     * @returns {boolean} True if the player can afford it
     */
    canAfford() {
        const character = this.game.character;
        
        // Check each resource cost
        for (const resourceId in this.costs) {
            const cost = this.costs[resourceId];
            
            // Get the resource
            const resource = character.getResource(resourceId);
            if (!resource) {
                console.error(`Resource not found: ${resourceId}`);
                return false;
            }
            
            // Check if enough resources
            if (resource.current < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if the player has nearly enough resources (90%)
     * @returns {boolean} True if the player is close to affording it
     */
    isNearlyAffordable() {
        const character = this.game.character;
        
        // Check each resource cost
        for (const resourceId in this.costs) {
            const cost = this.costs[resourceId];
            const threshold = cost * 0.9; // 90% of the cost
            
            // Get the resource
            const resource = character.getResource(resourceId);
            if (!resource) {
                console.error(`Resource not found: ${resourceId}`);
                return false;
            }
            
            // Check if enough resources
            if (resource.current < threshold) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Purchase the upgrade
     * @returns {boolean} True if purchase was successful
     */
    purchase() {
        // Check if already purchased
        if (this.purchased) {
            console.log(`${this.name} already purchased`);
            return false;
        }
        
        // Check if can afford
        if (!this.canAfford()) {
            console.log(`Cannot afford ${this.name}`);
            return false;
        }
        
        // Deduct costs
        const character = this.game.character;
        for (const resourceId in this.costs) {
            const cost = this.costs[resourceId];
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.remove(cost);
            }
        }
        
        // Apply effects
        this.applyEffects();
        
        // Mark as purchased
        this.purchased = true;
        
        // Save to character data
        if (!character.upgrades) {
            character.upgrades = {};
        }
        character.upgrades[this.id] = true;
        
        // Update UI
        this.updateUI();
        
        // Save game
        this.game.saveGame();
        
        // Log purchase
        this.logPurchase();
        
        return true;
    }
    
    /**
     * Apply the effects of the upgrade
     */
    applyEffects() {
        const character = this.game.character;
        
        // Apply each effect
        for (const effectType in this.effects) {
            const effectValue = this.effects[effectType];
            
            // Handle different effect types
            if (effectType.includes('.')) {
                // Handle nested properties like resources.gold.max
                const [category, resourceId, property] = effectType.split('.');
                
                // Get the resource
                const resource = character.getResource(resourceId);
                if (resource) {
                    // Apply the effect based on property
                    if (property === 'max') {
                        resource.setMax(resource.max + effectValue);
                    } else if (property === 'unlocked') {
                        resource.unlocked = effectValue;
                    }
                }
            } else if (typeof this.effects[effectType] === 'function') {
                // Handle function effects
                this.effects[effectType](character);
            } else {
                // Handle direct properties (none yet)
                console.warn(`Unknown effect type: ${effectType}`);
            }
        }
        
        // Update resource displays
        this.game.ui.updateResourceDisplays(character);
    }
    
    /**
     * Log the purchase to the adventure log
     */
    logPurchase() {
        // Find adventure log and add entry
        const logContent = document.querySelector('.log-content');
        if (logContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = `You purchased ${this.name} for ${this.getFormattedCost()}.`;
            logContent.insertBefore(logEntry, logContent.firstChild);
            
            // Limit log entries
            while (logContent.children.length > 50) {
                logContent.removeChild(logContent.lastChild);
            }
        }
    }
    
    /**
     * Get formatted cost string (e.g. "10 gold")
     * @returns {string} Formatted cost
     */
    getFormattedCost() {
        const costs = [];
        for (const resourceId in this.costs) {
            const resource = this.game.character.getResource(resourceId);
            const resourceName = resource ? resource.name.toLowerCase() : resourceId;
            costs.push(`${this.costs[resourceId]} ${resourceName}`);
        }
        return costs.join(', ');
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Remove the button if purchased
        if (this.purchased) {
            const upgradeButton = document.querySelector(`.upgrade-button[data-upgrade="${this.id}"]`);
            if (upgradeButton) {
                upgradeButton.remove();
            }
        }
    }
    
    /**
     * Create button element for upgrade
     * @returns {HTMLElement} The button element
     */
    createButtonElement() {
        const button = document.createElement('button');
        button.className = 'upgrade-button';
        button.dataset.upgrade = this.id;
        
        // Create button content
        const nameElement = document.createElement('span');
        nameElement.className = 'upgrade-name';
        nameElement.textContent = this.name;
        
        const descElement = document.createElement('span');
        descElement.className = 'upgrade-description';
        descElement.textContent = this.description;
        
        const costElement = document.createElement('span');
        costElement.className = 'upgrade-cost';
        costElement.textContent = `Cost: ${this.getFormattedCost()}`;
        
        // Add elements to button
        button.appendChild(nameElement);
        button.appendChild(descElement);
        button.appendChild(costElement);
        
        // Add event listener
        button.addEventListener('click', () => {
            this.purchase();
        });
        
        // Set disabled state
        button.disabled = !this.canAfford();
        
        return button;
    }
}

/**
 * CoinPurse upgrade - Increases gold maximum capacity
 */
class CoinPurseUpgrade extends Upgrade {
    constructor(game) {
        super(game, {
            id: 'coinPurse',
            name: 'Coin Purse',
            description: 'A simple leather pouch to store more gold',
            costs: {
                gold: 10
            },
            effects: {
                // Increase gold.max by 15
                'currencies.gold.max': 15
            },
            tooltipText: "Increases your maximum gold capacity by 15."
        });
    }
    
    /**
     * Override purchase method to add special effects
     * @returns {boolean} True if purchase was successful
     */
    purchase() {
        const success = super.purchase();
        
        if (success) {
            // Add custom notification
            this.game.ui.showNotification("You purchased a Coin Purse! You can now hold more gold.");
        }
        
        return success;
    }
}

/**
 * UpgradesManager - Handles registering and managing all game upgrades
 */
class UpgradesManager {
    constructor(game) {
        this.game = game;
        this.upgrades = {};
        this.initialize();
    }
    
    /**
     * Initialize with default upgrades
     */
    initialize() {
        // Register default upgrades
        this.registerUpgrade(new CoinPurseUpgrade(this.game));
        
        // Populate UI with upgrade buttons
        this.populateUpgradeButtons();
        
        // Listen for resource changes
        if (this.game.events) {
            this.game.events.on('resource.changed', (data) => {
                // Check if we need to update the UI based on resource changes
                if (data.id === 'gold' || data.newValue >= data.oldValue) {
                    this.checkForUnlockableUpgrades();
                    this.updateUpgradeButtons();
                }
            });
        }
        
        // Set up update interval as a fallback
        setInterval(() => this.checkForUnlockableUpgrades(), 1000);
    }

    /**
     * Handle resource changes and check for unlockable upgrades
     * @param {Object} data - Resource change data
     */
    onResourceChanged(data) {
        // Check if gold changed or resource increased
        if (data.id === 'gold' || data.newValue > data.oldValue) {
            // Check for unlockable upgrades
            this.checkForUnlockableUpgrades();
            this.updateUpgradeButtons();
        }
    }

    /**
     * Update upgrade buttons based on current resources
     * */
    updateUpgradeButtons() {
        const upgradeButtons = document.querySelectorAll('.upgrade-button');
        
        upgradeButtons.forEach(button => {
            const upgradeId = button.dataset.upgrade;
            const upgrade = this.getUpgrade(upgradeId);
            
            if (upgrade) {
                // Only change disabled state if needed
                const canAfford = upgrade.canAfford();
                if (!button.disabled && !canAfford) {
                    button.disabled = true;
                } else if (button.disabled && canAfford) {
                    button.disabled = false;
                }
            }
        });
    }
    
    /**
     * Register a new upgrade
     * @param {Upgrade} upgrade - The upgrade to register
     */
    registerUpgrade(upgrade) {
        this.upgrades[upgrade.id] = upgrade;
    }
    
    /**
     * Get an upgrade by id
     * @param {string} id - The upgrade id
     * @returns {Upgrade} - The upgrade or null if not found
     */
    getUpgrade(id) {
        return this.upgrades[id] || null;
    }
    
    /**
     * Populate UI with upgrade buttons
     */
    populateUpgradeButtons() {
        const upgradesContainer = document.querySelector('.available-upgrades');
        if (!upgradesContainer) return;
        
        // Clear existing buttons
        upgradesContainer.innerHTML = '';
        
        // Add visible and not-yet-purchased upgrades
        for (const id in this.upgrades) {
            const upgrade = this.upgrades[id];
            
            // Only show if unlocked and not purchased
            if (upgrade.unlocked && !upgrade.purchased) {
                const button = upgrade.createButtonElement();
                upgradesContainer.appendChild(button);
            }
        }
    }
    
    /**
     * Check for upgrades that should be unlocked
     */
    checkForUnlockableUpgrades() {
        let changed = false;
        
        for (const id in this.upgrades) {
            const upgrade = this.upgrades[id];
            
            // Skip if already unlocked or purchased
            if (upgrade.unlocked || upgrade.purchased) continue;
            
            // Check if nearly affordable
            if (upgrade.isNearlyAffordable()) {
                upgrade.unlocked = true;
                changed = true;
            }
        }
        
        // If any upgrades were unlocked, update the UI
        if (changed) {
            this.populateUpgradeButtons();
        }
    }
}

export { Upgrade, UpgradesManager };