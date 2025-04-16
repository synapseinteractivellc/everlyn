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
                },
                waterMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                fireMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                earthMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                airMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                lightMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                darkMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                temporalMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                voidMana: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                rage: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
                focus: {
                    current: 0,
                    max: 0,
                    unlocked: false
                },
            },
            currencies: {
                gold: {
                    current: options.currencies?.gold?.current || 0,
                    max: options.currencies?.gold?.max || 10,
                },
                arcana: {
                    current: options.currencies?.arcana?.current || 0,
                    max: options.currencies?.arcana?.max || 10,
                    unlocked: false
                },
                research: {
                    current: options.currencies?.research?.current || 0,
                    max: options.currencies?.research?.max || 10,
                    unlocked: false
                },
                scrolls: {
                    current: options.currencies?.scrolls?.current || 0,
                    max: options.currencies?.scrolls?.max || 10,
                    unlocked: false
                },
                codices: {
                    current: options.currencies?.codices?.current || 0,
                    max: options.currencies?.codices?.max || 10,
                    unlocked: false
                },
                tomes: {
                    current: options.currencies?.tomes?.current || 0,
                    max: options.currencies?.tomes?.max || 10,
                    unlocked: false
                },
                runes: {
                    current: options.currencies?.runes?.current || 0,
                    max: options.currencies?.runes?.max || 10,
                    unlocked: false
                },
                waterRunes: {
                    current: options.currencies?.waterRunes?.current || 0,
                    max: options.currencies?.waterRunes?.max || 10,
                    unlocked: false
                },
                fireRunes: {
                    current: options.currencies?.fireRunes?.current || 0,
                    max: options.currencies?.fireRunes?.max || 10,
                    unlocked: false
                },
                earthRunes: {
                    current: options.currencies?.earthRunes?.current || 0,
                    max: options.currencies?.earthRunes?.max || 10,
                    unlocked: false
                },
                airRunes: {
                    current: options.currencies?.airRunes?.current || 0,
                    max: options.currencies?.airRunes?.max || 10,
                    unlocked: false
                },
                sigils: {
                    current: options.currencies?.sigils?.current || 0,
                    max: options.currencies?.sigils?.max || 10,
                    unlocked: false
                },            
                gemstones: {
                    current: options.currencies?.gemstones?.current || 0,
                    max: options.currencies?.gemstones?.max || 10,
                    unlocked: false
                },
                bloodGems: {
                    current: options.currencies?.bloodGems?.current || 0,
                    max: options.currencies?.bloodGems?.max || 10,
                    unlocked: false
                },
                arcaneGems: {
                    current: options.currencies?.arcaneGems?.current || 0,
                    max: options.currencies?.arcaneGems?.max || 10,
                    unlocked: false
                },
                waterGems: {
                    current: options.currencies?.waterGems?.current || 0,
                    max: options.currencies?.waterGems?.max || 10,
                    unlocked: false
                },
                fireGems: {
                    current: options.currencies?.fireGems?.current || 0,
                    max: options.currencies?.fireGems?.max || 10,
                    unlocked: false
                },
                earthGems: {
                    current: options.currencies?.earthGems?.current || 0,
                    max: options.currencies?.earthGems?.max || 10,
                    unlocked: false
                },
                airGems: {
                    current: options.currencies?.airGems?.current || 0,
                    max: options.currencies?.airGems?.max || 10,
                    unlocked: false
                },
                lightGems: {
                    current: options.currencies?.lightGems?.current || 0,
                    max: options.currencies?.lightGems?.max || 10,
                    unlocked: false
                },
                darkGems: {
                    current: options.currencies?.darkGems?.current || 0,
                    max: options.currencies?.darkGems?.max || 10,
                    unlocked: false
                },
                herbs: {
                    current: options.currencies?.herbs?.current || 0,
                    max: options.currencies?.herbs?.max || 10,
                    unlocked: false
                },
                potionBase: {
                    current: options.currencies?.potionBase?.current || 0,
                    max: options.currencies?.potionBase?.max || 10,
                    unlocked: false
                },
                ichor: {
                    current: options.currencies?.ichor?.current || 0,
                    max: options.currencies?.ichor?.max || 10,
                    unlocked: false
                },
                bodies: {
                    current: options.currencies?.bodies?.current || 0,
                    max: options.currencies?.bodies?.max || 10,
                    unlocked: false
                },
                bones: {
                    current: options.currencies?.bones?.current || 0,
                    max: options.currencies?.bones?.max || 10,
                    unlocked: false
                },
                skulls: {
                    current: options.currencies?.skulls?.current || 0,
                    max: options.currencies?.skulls?.max || 10,
                    unlocked: false
                },
                boneDust: {
                    current: options.currencies?.boneDust?.current || 0,
                    max: options.currencies?.boneDust?.max || 10,
                    unlocked: false
                },
                souls: {
                    current: options.currencies?.souls?.current || 0,
                    max: options.currencies?.souls?.max || 10,
                    unlocked: false
                },
                leather: {
                    current: options.currencies?.leather?.current || 0,
                    max: options.currencies?.leather?.max || 10,
                    unlocked: false
                },
                cloth: {
                    current: options.currencies?.cloth?.current || 0,
                    max: options.currencies?.cloth?.max || 10,
                    unlocked: false
                },
                stone: {
                    current: options.currencies?.stone?.current || 0,
                    max: options.currencies?.stone?.max || 10,
                    unlocked: false
                },
                wood: {
                    current: options.currencies?.wood?.current || 0,
                    max: options.currencies?.wood?.max || 10,
                    unlocked: false
                },
                copper: {
                    current: options.currencies?.copper?.current || 0,
                    max: options.currencies?.copper?.max || 10,
                    unlocked: false
                },
                bronze: {
                    current: options.currencies?.bronze?.current || 0,
                    max: options.currencies?.bronze?.max || 10,
                    unlocked: false
                },
                iron: {
                    current: options.currencies?.iron?.current || 0,
                    max: options.currencies?.iron?.max || 10,
                    unlocked: false
                },
                steel: {
                    current: options.currencies?.steel?.current || 0,
                    max: options.currencies?.steel?.max || 10,
                    unlocked: false
                },
                mithril: {
                    current: options.currencies?.mithril?.current || 0,
                    max: options.currencies?.mithril?.max || 10,
                    unlocked: false
                },
                adamantium: {
                    current: options.currencies?.adamantium?.current || 0,
                    max: options.currencies?.adamantium?.max || 10,
                    unlocked: false
                },
                obsidian: {
                    current: options.currencies?.obsidian?.current || 0,
                    max: options.currencies?.obsidian?.max || 10,
                    unlocked: false
                },
                glass: {
                    current: options.currencies?.glass?.current || 0,
                    max: options.currencies?.glass?.max || 10,
                    unlocked: false
                },
                orichalcum: {
                    current: options.currencies?.orichalcum?.current || 0,
                    max: options.currencies?.orichalcum?.max || 10,
                    unlocked: false
                },
                silver: {
                    current: options.currencies?.silver?.current || 0,
                    max: options.currencies?.silver?.max || 10,
                    unlocked: false
                },
                gold: {
                    current: options.currencies?.gold?.current || 0,
                    max: options.currencies?.gold?.max || 10,
                    unlocked: false
                },
                platinum: {
                    current: options.currencies?.platinum?.current || 0,
                    max: options.currencies?.platinum?.max || 10,
                    unlocked: false
                },
                quicksilver: {
                    current: options.currencies?.quicksilver?.current || 0,
                    max: options.currencies?.quicksilver?.max || 10,
                    unlocked: false
                },
                moonstone: {
                    current: options.currencies?.moonstone?.current || 0,
                    max: options.currencies?.moonstone?.max || 10,
                    unlocked: false
                }
            },
            specialItems: {
                coinPurse: false,
                // Future special items can be added here
            },
            inventory: options.inventory || [],
            skills: options.skills || [],
            
            
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