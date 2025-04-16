/**
 * Character Component
 * Manages character data, and progression
 */
class CharacterComponent extends Component {
    /**
     * Create a new character component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     */
    constructor(id, options = {}) {
        super(id, options);
        
        // Initialize default character state
        this.setState({
            name: options.name || 'Unnamed',
            class: options.class || 'Waif',
            level: options.level || 1,
            experience: options.experience || 0,
            experienceToLevel: this.calculateExperienceToLevel(options.level || 1),
            resources: {
            health: {
                current: options.resources?.health?.current || 10,
                max: options.resources?.health?.max || 10
            },
            stamina: {
                current: options.resources?.stamina?.current || 10,
                max: options.resources?.stamina?.max || 10
            },
            mana: {
                current: 0,
                max: 0,
                unlocked: false
            }
            },
            inventory: options.inventory || [],
            skills: options.skills || [],
            gold: options.gold || 0,
            maxGold: options.maxGold || 10, // Added maxGold property
            
            // Class progression path
            progression: {
            current: 'Waif',
            path: ['Waif', 'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'],
            requirements: {
                'Novice': { level: 5 },
                'Apprentice': { level: 10 },
                'Journeyman': { level: 15 },
                'Expert': { level: 20 },
                'Master': { level: 25 }
            }
            },
            
            // Storage capacity
            storage: {
            capacity: 20,
            used: 0
            }
        }, false);
        
        // Calculate initial storage usage
        this.updateStorageUsage();
    }
    
    /**
     * Calculate experience needed for next level
     * @param {number} level - Current level
     * @returns {number} - Experience needed for next level
     */
    calculateExperienceToLevel(level) {
        // Simple exponential growth formula
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    /**
     * Update character name
     * @param {string} name - New character name
     * @returns {CharacterComponent} - This component instance for chaining
     */
    setName(name) {
        this.setState({ name });
        return this;
    }
    
    /**
     * Add experience points to the character
     * @param {number} amount - Amount of experience to add
     * @returns {Object} - Level up information if leveled up, null otherwise
     */
    addExperience(amount) {
        if (amount <= 0) return null;
        
        const currentExp = this.state.experience;
        const currentLevel = this.state.level;
        const expToLevel = this.state.experienceToLevel;
        
        let newExp = currentExp + amount;
        let newLevel = currentLevel;
        let leveledUp = false;
        
        // Check if leveled up
        if (newExp >= expToLevel) {
            newExp -= expToLevel;
            newLevel += 1;
            leveledUp = true;
            
            // Check if class progression is available
            const classProgress = this.checkClassProgression(newLevel);
            
            // Update state with new level and experience
            this.setState({
                level: newLevel,
                experience: newExp,
                experienceToLevel: this.calculateExperienceToLevel(newLevel),
                progression: classProgress || this.state.progression
            });
            
            // Trigger level up event
            this.trigger('level:up', {
                level: newLevel,
                previousLevel: currentLevel,
                classProgress
            });
            
            return {
                leveledUp: true,
                newLevel,
                classProgress: classProgress !== this.state.progression
            };
        }
        
        // Just update experience if not leveled up
        this.setState({
            experience: newExp
        });
        
        return { leveledUp: false, newExp };
    }
    
    /**
     * Check if character can progress to next class
     * @param {number} level - Current character level
     * @returns {Object|null} - Updated progression object or null if no change
     */
    checkClassProgression(level) {
        const progression = { ...this.state.progression };
        const currentIndex = progression.path.indexOf(progression.current);
        
        // If already at max progression, return null
        if (currentIndex === progression.path.length - 1) {
            return null;
        }
        
        // Check next class requirements
        const nextClass = progression.path[currentIndex + 1];
        const requirements = progression.requirements[nextClass];
        
        if (requirements && level >= requirements.level) {
            progression.current = nextClass;
            
            // Trigger class advancement event
            this.trigger('class:advance', {
                newClass: nextClass,
                previousClass: this.state.progression.current
            });
            
            return progression;
        }
        
        return null;
    }
    
    /**
     * Modify a resource (health, stamina, mana)
     * @param {string} resource - Resource name
     * @param {number} amount - Amount to change
     * @returns {boolean} - Whether the change was successful
     */
    modifyResource(resource, amount) {
        if (!this.state.resources[resource]) {
            console.error(`Resource ${resource} not found`);
            return false;
        }
        
        // If resource is not unlocked, return false
        if (this.state.resources[resource].unlocked === false) {
            return false;
        }
        
        const currentValue = this.state.resources[resource].current;
        const maxValue = this.state.resources[resource].max;
        
        // Calculate new value within bounds
        const newValue = Math.max(0, Math.min(currentValue + amount, maxValue));
        
        // Update state
        const resources = { ...this.state.resources };
        resources[resource] = {
            ...resources[resource],
            current: newValue
        };
        
        this.setState({ resources });
        
        // Trigger events
        if (amount > 0) {
            this.trigger(`resource:gain`, { resource, amount, newValue });
        } else if (amount < 0) {
            this.trigger(`resource:loss`, { resource, amount, newValue });
        }
        
        // Check if resource is depleted or full
        if (newValue === 0) {
            this.trigger(`resource:depleted`, { resource });
        } else if (newValue === maxValue) {
            this.trigger(`resource:full`, { resource });
        }
        
        return true;
    }
    
    /**
     * Add an item to inventory
     * @param {Object} item - Item to add
     * @returns {boolean} - Whether the item was added
     */
    addItem(item) {
        // Check if there's enough storage space
        if (this.state.storage.used >= this.state.storage.capacity) {
            this.trigger('inventory:full');
            return false;
        }
        
        // Add item to inventory
        const inventory = [...this.state.inventory, item];
        
        // Update state
        this.setState({ inventory });
        
        // Update storage usage
        this.updateStorageUsage();
        
        // Trigger event
        this.trigger('item:added', item);
        
        return true;
    }
    
    /**
     * Remove an item from inventory
     * @param {string} itemId - ID of item to remove
     * @returns {Object|null} - Removed item or null if not found
     */
    removeItem(itemId) {
        const itemIndex = this.state.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return null;
        }
        
        // Get item to return it
        const item = this.state.inventory[itemIndex];
        
        // Remove item from inventory
        const inventory = [...this.state.inventory];
        inventory.splice(itemIndex, 1);
        
        // Update state
        this.setState({ inventory });
        
        // Update storage usage
        this.updateStorageUsage();
        
        // Trigger event
        this.trigger('item:removed', item);
        
        return item;
    }
    
    /**
     * Add gold to the character
     * @param {number} amount - Amount of gold to add
     * @returns {CharacterComponent} - This component instance for chaining
     */
    addGold(amount) {
        if (amount <= 0) return this;
        
        const currentGold = this.state.gold;
        const maxGold = this.state.maxGold;
        const newGold = Math.min(currentGold + amount, maxGold);
        
        this.setState({ gold: newGold });
        
        // Trigger event
        this.trigger('gold:added', { amount: newGold - currentGold, total: newGold });
        
        return this;
    }
    
    /**
     * Remove gold from the character
     * @param {number} amount - Amount of gold to remove
     * @returns {boolean} - Whether the gold was removed
     */
    removeGold(amount) {
        if (amount <= 0) return true;
        
        // Check if there's enough gold
        if (this.state.gold < amount) {
            this.trigger('gold:insufficient', { amount, total: this.state.gold });
            return false;
        }
        
        const gold = this.state.gold - amount;
        this.setState({ gold });
        
        // Trigger event
        this.trigger('gold:removed', { amount, total: gold });
        
        return true;
    }

    /**
     * Increase the maximum gold capacity
     * @param {number} amount - Amount to increase max gold by
     * @returns {CharacterComponent} - This component instance for chaining
     */
    increaseMaxGold(amount) {
        if (amount <= 0) return this;

        const maxGold = this.state.maxGold + amount;
        this.setState({ maxGold });

        // Trigger event
        this.trigger('gold:maxIncreased', { amount, maxGold });

        return this;
    }
    
    /**
     * Update storage usage based on inventory
     * @returns {CharacterComponent} - This component instance for chaining
     */
    updateStorageUsage() {
        // Calculate storage usage based on item weights/sizes
        let used = 0;
        this.state.inventory.forEach(item => {
            used += item.size || 1; // Default size is 1 if not specified
        });
        
        // Update state
        this.setState({
            storage: {
                ...this.state.storage,
                used
            }
        });
        
        return this;
    }
    
    /**
     * Upgrade storage capacity
     * @param {number} amount - Amount to increase capacity by
     * @returns {CharacterComponent} - This component instance for chaining
     */
    upgradeStorage(amount) {
        if (amount <= 0) return this;
        
        const capacity = this.state.storage.capacity + amount;
        this.setState({
            storage: {
                ...this.state.storage,
                capacity
            }
        });
        
        // Trigger event
        this.trigger('storage:upgraded', { amount, capacity });
        
        return this;
    }
    
    /**
     * Unlock a resource (e.g., mana)
     * @param {string} resource - Resource name
     * @param {number} initialMax - Initial maximum value
     * @returns {CharacterComponent} - This component instance for chaining
     */
    unlockResource(resource, initialMax) {
        if (!this.state.resources[resource]) {
            console.error(`Resource ${resource} not found`);
            return this;
        }
        
        // Update state
        const resources = { ...this.state.resources };
        resources[resource] = {
            current: initialMax,
            max: initialMax,
            unlocked: true
        };
        
        this.setState({ resources });
        
        // Trigger event
        this.trigger('resource:unlocked', { resource, max: initialMax });
        
        return this;
    }
    
    /**
     * Learn a new skill
     * @param {Object} skill - Skill to learn
     * @returns {CharacterComponent} - This component instance for chaining
     */
    learnSkill(skill) {
        // Check if skill is already learned
        if (this.state.skills.some(s => s.id === skill.id)) {
            return this;
        }
        
        // Add skill
        const skills = [...this.state.skills, skill];
        this.setState({ skills });
        
        // Trigger event
        this.trigger('skill:learned', skill);
        
        return this;
    }
    
    /**
     * Check if a skill is learned
     * @param {string} skillId - Skill ID
     * @returns {boolean} - Whether the skill is learned
     */
    hasSkill(skillId) {
        return this.state.skills.some(skill => skill.id === skillId);
    }
    
    /**
     * Get skill by ID
     * @param {string} skillId - Skill ID
     * @returns {Object|null} - Skill object or null if not found
     */
    getSkill(skillId) {
        return this.state.skills.find(skill => skill.id === skillId) || null;
    }
    
    /**
     * Check if class requirements for next progression are met
     * @returns {Object|null} - Next class requirements or null if at max progression
     */
    getNextClassRequirements() {
        const progression = this.state.progression;
        const currentIndex = progression.path.indexOf(progression.current);
        
        // If already at max progression, return null
        if (currentIndex === progression.path.length - 1) {
            return null;
        }
        
        // Get next class and requirements
        const nextClass = progression.path[currentIndex + 1];
        return {
            className: nextClass,
            requirements: progression.requirements[nextClass]
        };
    }

    deserialize(data) {
        // Ensure all default initialization happens first
        this.setState({
            ...this.state,
            ...data,
            resources: {
                ...this.state.resources,
                ...data.resources
            },
            stats: {
                ...this.state.stats,
                ...data.stats
            }
        }, false);
        
        // Recalculate storage usage
        this.updateStorageUsage();
        
        return this;
    }
}