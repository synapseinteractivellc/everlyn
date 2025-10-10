// js/controllers/skill-controller.js
class SkillController {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    update(deltaTime) {
        this.checkSkillLevelUps();
        this.applySkillEffects();
    }
    
    checkSkillLevelUps() {
        for (const skill of Object.values(this.gameState.skills)) {
            if (skill.experience >= skill.nextLevelExperience) {
                this.levelUpSkill(skill.id);
            }
        }
    }
    
    levelUpSkill(skillId) {
        const skill = this.gameState.skills[skillId];
        if (!skill) return;

        // Ensure the skill does not exceed max level
        if (skill.level >= skill.maxLevel) {
            this.gameState.actionLog.unshift({
                message: `Your ${skill.name} skill is already at the maximum level!`,
                timestamp: Date.now()
            });
            return;
        }

        // Level up the skill
        skill.level++;
        skill.experience -= skill.nextLevelExperience;

        // Increase next level experience requirement
        skill.nextLevelExperience = Math.floor(skill.nextLevelExperience * 1.5);

        // Check for new unlocks based on skill level
        this.checkSkillUnlocks(skillId, skill.level);

        // Add to log
        this.gameState.actionLog.unshift({
            message: `Your ${skill.name} skill increased to level ${skill.level}!`,
            timestamp: Date.now()
        });
    }

    addSkillExperience(skillId, amount) {
        const skill = this.gameState.skills[skillId];
        if (skill) {
            // Ensure the skill does not exceed max level
            if (skill.level >= skill.maxLevel) {
                this.gameState.actionLog.unshift({
                    message: `Your ${skill.name} skill is already at the maximum level and cannot gain more experience!`,
                    timestamp: Date.now()
                });
                return false;
            }

            skill.experience += amount;
            // Check if the skill should level up
            if (skill.experience >= skill.nextLevelExperience) {
                this.levelUpSkill(skillId);
            }
        }

        return false;
    }
    
    checkSkillUnlocks(skillId, level) {
        // Example skill unlocks - these would be moved to a config file later
        if (skillId === 'survival' && level >= 1) {
            // Unlock scavenging action
            if (!this.gameState.actions.scavenge) {
                this.gameState.actions.scavenge = {
                    id: "scavenge",
                    name: "Scavenge for Supplies",
                    description: "Search through garbage for useful items.",
                    isRestAction: false,
                    requiredClass: "Waif",
                    requiredSkills: { survival: 1 },
                    statPoolCosts: { stamina: 3 },
                    currencyCosts: {},
                    baseDuration: 3000, // 3 seconds
                    currencyRewards: { 
                        gold: { min: 1, max: 3 } 
                    },
                    skillExperience: { 
                        survival: 2 
                    },
                    statPoolRestoration: {},
                    completionCount: 0,
                    totalTimeSpent: 0,
                    currentProgress: 0,
                    lastActionStartTime: null,
                    unlocked: true
                };
                
                // Add notification
                this.gameState.actionLog.unshift({
                    message: `You unlocked a new action: Scavenge for Supplies!`,
                    timestamp: Date.now()
                });

                // Save the game to persist the new action
                if (window.game && window.game.saveController) {
                    window.game.saveController.saveGame();
                }
            }
        }
        
        if (skillId === 'survival' && level === 3) {
            // Unlock ability to find basic lodging
            if (this.gameState.home.type === "Homeless") {
                this.gameState.home = {
                    type: "Abandoned Shack",
                    floorSpace: 5,
                    availableFloorSpace: 5,
                    furniture: {}
                };
                
                // Add notification
                this.gameState.actionLog.unshift({
                    message: `You found an abandoned shack to live in!`,
                    timestamp: Date.now()
                });
            }
        }
        
        // Add more unlocks based on skills and levels
    }
    
    applySkillEffects() {
        // Apply skill effects to character stats, actions, etc.
        // This would be expanded as more skills are added
        
        // Example: Survival skill increases max stamina
        if (this.gameState.skills.survival) {
            const survivalLevel = this.gameState.skills.survival.level;
            this.gameState.statPools.stamina.max = 10 + survivalLevel;
        }
    }
}