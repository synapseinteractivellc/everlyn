// js/controllers/character-controller.js
class CharacterController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        // Nothing to update consistently yet
    }
    
    addExperience(amount) {
        this.gameState.character.experience += amount;
        
        // Check for level up
        if (this.gameState.character.experience >= this.gameState.character.nextLevelExperience) {
            this.levelUp();
        }
    }
    
    levelUp() {
        const char = this.gameState.character;
        
        // Level up
        char.level++;
        char.experience -= char.nextLevelExperience;
        
        // Increase next level requirement
        char.nextLevelExperience = Math.floor(char.nextLevelExperience * 1.5);
        
        // Check for class changes
        this.checkClassProgression();
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `${char.name} reached level ${char.level}!`,
            timestamp: Date.now()
        });
    }
    
    checkClassProgression() {
        const char = this.gameState.character;
        
        // Example class progression - would be moved to a config file later
        if (char.class === "Waif" && char.level >= 5) {
            // Let player choose a class, for now just default to Warrior Trainee
            this.changeClass("Warrior Trainee");
        }
    }
    
    changeClass(newClass) {
        const oldClass = this.gameState.character.class;
        this.gameState.character.class = newClass;
        
        // Unlock class-specific actions, skills, etc.
        this.unlockClassContent(newClass);
        
        // Add to log
        this.gameState.actionLog.unshift({
            message: `${this.gameState.character.name} has advanced from ${oldClass} to ${newClass}!`,
            timestamp: Date.now()
        });
    }
    
    unlockClassContent(className) {
        // Example: Unlock content based on class
        if (className === "Warrior Trainee") {
            // Unlock warrior skills
            if (!this.gameState.skills.combat) {
                this.gameState.skills.combat = {
                    id: "combat",
                    name: "Combat",
                    level: 1,
                    experience: 0,
                    nextLevelExperience: 50,
                    description: "Basic fighting techniques."
                };
            }
            
            // Unlock warrior actions
            if (!this.gameState.actions.train) {
                this.gameState.actions.train = {
                    id: "train",
                    name: "Train with Wooden Dummy",
                    description: "Practice your combat skills.",
                    isRestAction: false,
                    requiredClass: "Warrior Trainee",
                    requiredSkills: {},
                    statPoolCosts: { stamina: 5 },
                    currencyCosts: {},
                    baseDuration: 4000, // 4 seconds
                    currencyRewards: {},
                    skillExperience: { 
                        combat: 3 
                    },
                    statPoolRestoration: {},
                    completionCount: 0,
                    totalTimeSpent: 0,
                    currentProgress: 0,
                    lastActionStartTime: null,
                    unlocked: true
                };
            }
            
            // Upgrade home
            if (this.gameState.home.type === "Abandoned Shack") {
                this.gameState.home = {
                    type: "Barracks Bunk",
                    floorSpace: 10,
                    availableFloorSpace: 10,
                    furniture: {}
                };
            }
        }
        
        // Add more class unlocks here
    }
}