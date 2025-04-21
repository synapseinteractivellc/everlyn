// js/models/game-state.js
class GameState {
    constructor() {
        // Character
        this.character = {
            name: "Unnamed",
            level: 1,
            class: "Waif",
            experience: 0,
            nextLevelExperience: 100
        };
        
        // Stat Pools
        this.statPools = {
            health: {
                id: "health",
                name: "Health",
                current: 10,
                max: 10,
                regenRate: 0, // Per second
                color: "#e74c3c"
            },
            stamina: {
                id: "stamina",
                name: "Stamina",
                current: 10,
                max: 10,
                regenRate: 0,
                color: "#2ecc71"
            }
            // Other stat pools will be unlocked via skills
        };
        
        // Currencies
        this.currencies = {
            gold: {
                id: "gold",
                name: "Gold",
                amount: 0,
                generationRate: 0,
                description: "The common currency of the realm."
            }
            // Other currencies will be unlocked via progression
        };
        
        // Skills
        this.skills = {
            survival: {
                id: "survival",
                name: "Survival",
                level: 0,
                experience: 0,
                nextLevelExperience: 50,
                description: "Basic skills to survive on the streets."
            }
            // Other skills will be unlocked via progression
        };
        
        // Actions
        this.actions = {
            beg: {
                id: "beg",
                name: "Beg in the City Square",
                description: "Ask passersby for spare change.",
                isRestAction: false,
                requiredClass: "Waif",
                requiredSkills: {},
                statPoolCosts: { stamina: 2 },
                currencyCosts: {},
                baseDuration: 2000, // 2 seconds
                currencyRewards: { 
                    gold: { min: 0, max: 2 } 
                },
                skillExperience: { 
                    survival: 1 
                },
                statPoolRestoration: {},
                completionCount: 0,
                totalTimeSpent: 0,
                currentProgress: 0,
                lastActionStartTime: null,
                unlocked: true
            },
            rest: {
                id: "rest",
                name: "Sleep in an Abandoned Shed",
                description: "Rest to recover your stamina and health.",
                isRestAction: true,
                requiredClass: "Waif",
                requiredSkills: {},
                statPoolCosts: {},
                currencyCosts: {},
                baseDuration: 1000, // 1 second
                currencyRewards: {},
                skillExperience: {},
                statPoolRestoration: {
                    health: 1,
                    stamina: 1
                },
                completionCount: 0,
                totalTimeSpent: 0,
                currentProgress: 0,
                lastActionStartTime: null,
                unlocked: true
            }
            // Other actions will be unlocked via skills and class progression
        };
        
        // Home (initially none)
        this.home = {
            type: "Homeless",
            floorSpace: 0,
            availableFloorSpace: 0,
            furniture: {}
        };
        
        // Game state
        this.currentScreen = "main";
        this.currentAction = null;
        this.previousAction = null;
        this.defaultRestAction = "rest";
        
        // Action log
        this.actionLog = [];
    }
}