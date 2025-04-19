// skill.js
import Resource from './resource.js';

/**
 * Skill class for character abilities that can be leveled up
 */
class Skill {
    /**
     * Create a new skill
     * @param {Object} game - The game instance
     * @param {Object} config - Configuration for the skill
     */
    constructor(game, config) {
        this.game = game;
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.unlocked = config.unlocked !== undefined ? config.unlocked : false;
        this.purchased = config.purchased !== undefined ? config.purchased : false;
        this.level = config.level !== undefined ? config.level : 0;
        this.maxLevel = config.maxLevel !== undefined ? config.maxLevel : 5;
        this.experience = config.experience !== undefined ? config.experience : 0;
        this.costs = config.costs || {}; // Resources required to purchase
        this.levelUpXp = config.levelUpXp || [100, 250, 500, 1000, 2000]; // XP needed for each level
        this.levelEffects = config.levelEffects || []; // Effects applied on level-up
        this.purchaseEffects = config.purchaseEffects || []; // Effects applied on purchase
        this.tooltipText = config.tooltipText || "";
    }
    
    /**
     * Check if the skill can be purchased
     * @param {Object} character - The character object
     * @returns {boolean} - True if the skill can be purchased
     */
    canPurchase(character) {
        if (this.purchased) return false;
        if (!this.unlocked) return false;
        
        // Check all costs
        for (const [resourceId, cost] of Object.entries(this.costs)) {
            const resource = character.getResource(resourceId);
            if (!resource || resource.current < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Purchase the skill
     * @param {Object} character - The character object
     * @returns {boolean} - True if purchase was successful
     */
    purchase(character) {
        if (!this.canPurchase(character)) return false;
        
        // Deduct costs
        for (const [resourceId, cost] of Object.entries(this.costs)) {
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.remove(cost);
            }
        }
        
        // Mark as purchased
        this.purchased = true;
        
        // Apply purchase effects
        this.applyPurchaseEffects(character);
        
        // Log to adventure log
        this.logPurchase();
        
        // Add this line to refresh the action buttons
        if (this.game.actionsManager) {
            this.game.actionsManager.populateActionButtons();
        }
        
        return true;
    }
    
    /**
     * Apply effects when skill is purchased
     * @param {Object} character - The character object
     */
    applyPurchaseEffects(character) {
        for (const effect of this.purchaseEffects) {
            effect(character, this);
        }
    }
    
    /**
     * Add experience to the skill
     * @param {number} amount - Amount of experience to add
     * @returns {boolean} - True if leveled up
     */
    addExperience(amount) {
        if (!this.purchased || this.level >= this.maxLevel) return false;
        
        this.experience += amount;
        
        // Update character's skills object
        if (this.game.character && this.game.character.skills) {
            if (!this.game.character.skills[this.id]) {
                this.game.character.skills[this.id] = {};
            }
            this.game.character.skills[this.id].experience = this.experience;
        }
        
        // Check if should level up
        const xpNeeded = this.getXPForNextLevel();
        if (xpNeeded !== null && this.experience >= xpNeeded) {
            return this.levelUp();
        }
        
        return false;
    }
    
    /**
     * Level up the skill
     * @returns {boolean} - True if successful
     */
    levelUp() {
        if (this.level >= this.maxLevel) return false;
        
        // Level up
        this.level += 1;
        
        // Update character's skills object
        if (this.game.character && this.game.character.skills) {
            if (!this.game.character.skills[this.id]) {
                this.game.character.skills[this.id] = {};
            }
            this.game.character.skills[this.id].level = this.level;
        }
        
        // Reset experience for next level
        this.experience = 0;
        
        // Also update experience in character's skills object
        if (this.game.character && this.game.character.skills && this.game.character.skills[this.id]) {
            this.game.character.skills[this.id].experience = 0;
        }
        
        // Apply level-up effects
        this.applyLevelEffects();
        
        // Log to adventure log
        this.logLevelUp();
        
        return true;
    }
    
    /**
     * Apply effects when skill levels up
     */
    applyLevelEffects() {
        const character = this.game.character;
        
        // Check if we have a specific effect for this level
        if (this.levelEffects[this.level - 1]) {
            this.levelEffects[this.level - 1](character, this);
        }
    }
    
    /**
     * Get XP needed for next level
     * @returns {number|null} - XP needed or null if at max level
     */
    getXPForNextLevel() {
        if (this.level >= this.maxLevel) return null;
        return this.levelUpXp[this.level];
    }
    
    /**
     * Calculate percentage progress to next level
     * @returns {number} - Progress percentage (0-100)
     */
    getProgressPercentage() {
        const xpNeeded = this.getXPForNextLevel();
        if (xpNeeded === null) return 100;
        return Math.min(100, Math.floor((this.experience / xpNeeded) * 100));
    }
    
    /**
     * Log purchase to adventure log
     */
    logPurchase() {
        const logContent = document.querySelector('.log-content');
        if (logContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = `You have gained the ${this.name} skill!`;
            logContent.insertBefore(logEntry, logContent.firstChild);
        }
    }
    
    /**
     * Log level up to adventure log
     */
    logLevelUp() {
        const logContent = document.querySelector('.log-content');
        if (logContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = `${this.name} skill increased to level ${this.level}!`;
            logContent.insertBefore(logEntry, logContent.firstChild);
        }
    }
    
    /**
     * Create HTML element for skill display
     * @returns {HTMLElement} - The skill card element
     */
    createSkillElement() {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        skillCard.dataset.skill = this.id;

        // Add tooltip if tooltipText exists
        if (this.tooltipText) {
            skillCard.dataset.tooltip = this.tooltipText;
            skillCard.classList.add('has-tooltip');
        }
        
        // Add skill name
        const nameElement = document.createElement('div');
        nameElement.className = 'skill-name';
        nameElement.textContent = this.name;
        
        // Add description
        const descElement = document.createElement('div');
        descElement.className = 'skill-description';
        descElement.textContent = this.description;
        
        // Add level info
        const levelElement = document.createElement('div');
        levelElement.className = 'skill-level';
        levelElement.innerHTML = `Level: <span class="current-level">${this.level}</span>/<span class="max-level">${this.maxLevel}</span>`;
        
        // Add XP progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'skill-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'skill-progress';
        progressBar.style.width = `${this.getProgressPercentage()}%`;
        
        // Add XP text
        const xpElement = document.createElement('div');
        xpElement.className = 'skill-xp';
        const xpNeeded = this.getXPForNextLevel();
        xpElement.textContent = xpNeeded ? `XP: ${this.experience}/${xpNeeded}` : 'Max Level';
        
        // Put it all together
        progressContainer.appendChild(progressBar);
        skillCard.appendChild(nameElement);
        skillCard.appendChild(descElement);
        skillCard.appendChild(levelElement);
        skillCard.appendChild(progressContainer);
        skillCard.appendChild(xpElement);
        
        // Add purchase button if not purchased
        if (!this.purchased) {
            const purchaseButton = document.createElement('button');
            purchaseButton.className = 'skill-purchase-button';
            purchaseButton.textContent = 'Learn Skill';
            purchaseButton.disabled = !this.canPurchase(this.game.character);
            
            // Format cost text
            const costElement = document.createElement('div');
            costElement.className = 'skill-cost';
            const costText = Object.entries(this.costs)
                .map(([id, amount]) => {
                    const resource = this.game.character.getResource(id);
                    return `${amount} ${resource ? resource.name : id}`;
                })
                .join(', ');
            costElement.textContent = `Cost: ${costText}`;
            
            // Add event listener for purchase
            purchaseButton.addEventListener('click', () => {
                if (this.purchase(this.game.character)) {
                    // Refresh skill UI
                    this.game.skillsManager.refreshSkillsUI();
                    
                    // Show notification
                    this.game.ui.showNotification(`You learned the ${this.name} skill!`);
                }
            });
            
            skillCard.appendChild(costElement);
            skillCard.appendChild(purchaseButton);
        } else {
            // Add a test button for adding XP (for testing purposes)
            const addXpButton = document.createElement('button');
            addXpButton.className = 'skill-add-xp-button';
            addXpButton.textContent = 'Add 10 XP (Test)';
            
            addXpButton.addEventListener('click', () => {
                if (this.addExperience(10)) {
                    // If leveled up, refresh UI
                    this.game.skillsManager.refreshSkillsUI();
                    this.game.ui.updateResourceDisplays(this.game.character);
                    this.game.ui.showNotification(`${this.name} skill increased to level ${this.level}!`);
                } else {
                    // Just update progress display
                    const card = document.querySelector(`.skill-card[data-skill="${this.id}"]`);
                    if (card) {
                        const progressBar = card.querySelector('.skill-progress');
                        if (progressBar) {
                            progressBar.style.width = `${this.getProgressPercentage()}%`;
                        }
                        
                        const xpElement = card.querySelector('.skill-xp');
                        if (xpElement) {
                            const xpNeeded = this.getXPForNextLevel();
                            xpElement.textContent = xpNeeded ? `XP: ${this.experience}/${xpNeeded}` : 'Max Level';
                        }
                    }
                }
            });
            
            skillCard.appendChild(addXpButton);
        }
        
        return skillCard;
    }
    
    /**
     * Serialize skill data for saving
     * @returns {Object} - Serialized skill data
     */
    serialize() {
        return {
            id: this.id,
            purchased: this.purchased,
            level: this.level,
            experience: this.experience
        };
    }
    
    /**
     * Load skill data
     * @param {Object} data - Saved skill data
     */
    deserialize(data) {
        if (!data) return;
        
        if (data.purchased !== undefined) this.purchased = data.purchased;
        if (data.level !== undefined) this.level = data.level;
        if (data.experience !== undefined) this.experience = data.experience;
    }
}

/**
 * MageLore skill - First skill that unlocks mana
 */
class MageLore extends Skill {
    constructor(game) {
        super(game, {
            id: 'mageLore',
            name: 'Mage Lore',
            description: 'Study of ancient magical knowledge. Unlocks mana and increases research capacity.',
            costs: {
                research: 10,
                scrolls: 1
            },
            unlocked: false, // Will be set based on research amount
            purchaseEffects: [
                // When first purchased, unlock mana
                (character, skill) => {
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.unlocked = true;
                        mana.setMax(5, true); // Set max to 5 and fill it
                        mana.recoveryRate = 0; // Initially no recovery rate at level 0
                    }
                    
                    // Also increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                }
            ],
            levelEffects: [
                // Level 1 effect
                (character, skill) => {
                    // Increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                    
                    // Increase mana recovery rate
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.recoveryRate = 0.1 * 1; // 0.1
                        mana.setMax(mana.max + 1);  // Increase max mana by 1 (from 5 to 6)
                    }
                },
                // Level 2 effect
                (character, skill) => {
                    // Increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                    
                    // Increase mana recovery rate and max
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.recoveryRate = 0.1 * 2; // 0.2
                        mana.setMax(mana.max + 1);  // Increase max mana by 1
                    }
                },
                // Level 3 effect
                (character, skill) => {
                    // Increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                    
                    // Increase mana recovery rate and max
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.recoveryRate = 0.1 * 3; // 0.3
                        mana.setMax(mana.max + 1);  // Increase max mana by 1
                    }
                },
                // Level 4 effect
                (character, skill) => {
                    // Increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                    
                    // Increase mana recovery rate and max
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.recoveryRate = 0.1 * 4; // 0.4
                        mana.setMax(mana.max + 1);  // Increase max mana by 1
                    }
                },
                // Level 5 effect
                (character, skill) => {
                    // Increase research max by 5
                    const research = character.getResource('research');
                    if (research) {
                        research.setMax(research.max + 5);
                    }
                    
                    // Increase mana recovery rate and max
                    const mana = character.stats.mana;
                    if (mana) {
                        mana.recoveryRate = 0.1 * 5; // 0.5
                        mana.setMax(mana.max + 1);  // Increase max mana by 1
                    }
                }
            ]
        });

        // Check if there's existing data in character.skills
        if (game.character && game.character.skills && game.character.skills.mageLore) {
            const savedSkill = game.character.skills.mageLore;
            this.purchased = savedSkill.purchased || this.purchased;
            this.level = savedSkill.level || this.level;
            this.experience = savedSkill.experience || this.experience;
            
            // If the skill was purchased, make sure any purchase effects are applied
            if (this.purchased && !game.character.stats.mana.unlocked) {
                // Apply purchase effects manually if needed
                const mana = game.character.stats.mana;
                if (mana) {
                    mana.unlocked = true;
                    mana.setMax(5 + this.level, true);
                    mana.recoveryRate = 0.1 * this.level;
                }
            }
        }
    }
    
    /**
     * Check if skill should be unlocked based on research amount
     * @param {Object} character - The character object
     */
    checkUnlock(character) {
        if (this.unlocked) return;
        
        const research = character.getResource('research');
        if (research && research.current >= 10) {
            this.unlocked = true;
            
            // Log the unlocking only if UI is available
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                const logEntry = document.createElement('p');
                logEntry.textContent = `Your growing research has unlocked the possibility to learn Mage Lore!`;
                logContent.insertBefore(logEntry, logContent.firstChild);
            }
            
            // Show notification only if UI is available
            if (this.game.ui) {
                this.game.ui.showNotification('New skill available: Mage Lore!');
                this.flashSkillsTab();
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Flash the skills tab to draw attention
     */
    flashSkillsTab() {
        const skillsTab = document.querySelector('.nav-button[data-section="skills"]');
        if (!skillsTab) return;
        
        // Add flashing class
        skillsTab.classList.add('flashing');
        
        // Remove after a few seconds
        setTimeout(() => {
            skillsTab.classList.remove('flashing');
        }, 5000);
    }
}

/**
 * SkillsManager - Manages all skills
 */
class SkillsManager {
    constructor(game) {
        this.game = game;
        this.skills = {};
        this.hasLoadedSkills = false;
    
        // Call initialize after construction
        // This way the caller can load saved data before initialization
        this.initialize();
    }
    
    /**
     * Initialize skills manager
     */
    initialize() {
        // Flag to track if we've already initialized skills
        this._initialized = true;
        
        // Only register default skills if we haven't loaded them already
        if (!this.hasLoadedSkills) {
            // Register initial skills
            this.registerSkill(new MageLore(this.game));
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Do initial check for unlocks
        this.checkSkillUnlocks();
        
        // Initial UI setup
        this.refreshSkillsUI();
        
        // Set up update interval for checking unlocks
        setInterval(() => this.checkSkillUnlocks(), 1000);
    }
    
    /**
     * Register a new skill
     * @param {Skill} skill - The skill to register
     */
    registerSkill(skill) {
        this.skills[skill.id] = skill;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for resource changes to check for skill unlocks
        if (this.game.events) {
            this.game.events.on('resource.changed', (data) => {
                // Only check if research changed
                if (data.id === 'research' && data.newValue > data.oldValue) {
                    this.checkSkillUnlocks();
                }
            });
        }
    }

    /**
     * Purchase the skill
     * @param {Object} character - The character object
     * @returns {boolean} - True if purchase was successful
     */
    purchase(character) {
        if (!this.canPurchase(character)) return false;
        
        // Deduct costs
        for (const [resourceId, cost] of Object.entries(this.costs)) {
            const resource = character.getResource(resourceId);
            if (resource) {
                resource.remove(cost);
            }
        }
        
        // Mark as purchased
        this.purchased = true;
        
        // Apply purchase effects
        this.applyPurchaseEffects(character);
        
        // Log to adventure log
        this.logPurchase();
        
        // Check if action buttons need to be updated
        if (this.game.actionsManager) {
            this.game.actionsManager.populateActionButtons();
        }
        
        return true;
    }
    
    /**
     * Check if any skills should be unlocked
     */
    checkSkillUnlocks() {
        let skillsUnlocked = false;
        
        for (const skill of Object.values(this.skills)) {
            if (!skill.unlocked && skill.checkUnlock) {
                const unlocked = skill.checkUnlock(this.game.character);
                if (unlocked) {
                    skillsUnlocked = true;
                }
            }
        }
        
        // Refresh UI if any skills were unlocked
        if (skillsUnlocked) {
            this.refreshSkillsUI();
        }
    }
    
    /**
     * Refresh the skills UI
     */
    refreshSkillsUI() {
        const skillsContainer = document.querySelector('.skills-list');
        if (!skillsContainer) return;
        
        // Clear existing skills
        skillsContainer.innerHTML = '';
        
        // Add skills to UI
        for (const skill of Object.values(this.skills)) {
            // Only show if unlocked
            if (skill.unlocked) {
                const skillElement = skill.createSkillElement();
                skillsContainer.appendChild(skillElement);
            }
        }
    }
    
    /**
     * Load saved skill data
     * @param {Object} savedData - Saved skill data
     */
    loadSavedData(savedData) {
        if (!savedData || !savedData.skills) return;
        
        // Set flag to indicate skills were loaded
        this.hasLoadedSkills = true;
        
        // Initialize character.skills if it doesn't exist
        if (!this.game.character.skills) {
            this.game.character.skills = {};
        }
        
        for (const [skillId, skillData] of Object.entries(savedData.skills)) {
            const skill = this.skills[skillId];
            if (skill) {
                // Directly set the important properties to ensure they're loaded
                if (skillData.purchased !== undefined) skill.purchased = skillData.purchased;
                if (skillData.level !== undefined) skill.level = skillData.level;
                if (skillData.experience !== undefined) skill.experience = skillData.experience;
                
                // Also update the character's skills object with the same data
                this.game.character.skills[skillId] = {
                    purchased: skill.purchased,
                    level: skill.level,
                    experience: skill.experience
                };
                
                console.log(`Loaded skill ${skillId}: Level ${skill.level}, XP ${skill.experience}, Purchased: ${skill.purchased}`);
            } else {
                console.warn(`Skill ${skillId} from save data not found in registered skills`);
            }
        }
        
        // Refresh UI after loading skills
        this.refreshSkillsUI();
    }
    
    /**
     * Save all skill data
     * @returns {Object} - Saved skill data
     */
    saveData() {
        const data = {};
        
        for (const [skillId, skill] of Object.entries(this.skills)) {
            data[skillId] = {
                id: skill.id,
                purchased: skill.purchased,
                level: skill.level,
                experience: skill.experience
            };
        }
        
        console.log('Saving skills data:', data);
        return data;
    }
}

export { Skill, SkillsManager };