// config.js - Centralized game configuration
// This module provides a single source of truth for game settings

/**
 * Game configuration settings
 * All game constants and parameters should be defined here
 */
const GameConfig = {
    // Game version
    version: '1.0.0',
    
    // Character defaults
    character: {
        // Base stats for character creation
        baseStats: {
            health: { current: 10, max: 10 },
            stamina: { current: 10, max: 10 },
            mana: { current: 10, max: 10 }
        },
        
        // Default elemental mana stats
        elementalMana: {
            earth: { current: 0, max: 0 },
            fire: { current: 0, max: 0 },
            air: { current: 0, max: 0 },
            water: { current: 0, max: 0 }
        },
        
        // Default resources
        resources: {
            gold: { current: 0, max: 10 },
            research: { current: 0, max: 25 },
            skins: { current: 0, max: 10 }
        },
        
        // Level up bonuses
        levelUp: {
            healthIncrease: 2,
            staminaIncrease: 1,
            manaIncrease: 1,
            xpMultiplier: 1.5 // XP required for next level = current * multiplier
        },
        
        // Starting XP required for level 2
        baseXpToNextLevel: 100
    },
    
    // Character classes
    classes: {
        "Waif": {
            description: "A humble beginning with balanced stats.",
            // No stat modifiers - uses the default values
        }
        // Additional classes can be added here
    },
    
    // Game mechanics
    mechanics: {
        autoSaveInterval: 60000, // Auto-save interval in ms (1 minute)
        maxSaveSize: 50000, // Maximum save data size in bytes
    },
    
    // UI settings
    ui: {
        progressBarAnimationSpeed: 300, // Progress bar animation speed in ms
        defaultTab: 'map', // Default tab to display
    },
    
    // Location settings
    defaultLocation: 'City Square'
};

export default GameConfig;