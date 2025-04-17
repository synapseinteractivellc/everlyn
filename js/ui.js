// Create a new file: js/ui.js

class UI {
    /**
     * UI class to manage the user interface of the game
     * @param {Game} game - The game instance
     */
     constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }    

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Navigation event listeners
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchSection(button.dataset.section);
            });
        });
    }
    
    /**
     * Switch between different sections of the UI
     * @param {string} sectionName - The name of the section to switch to
     */
    switchSection(sectionName) {
        // Remove active class from all nav buttons and sections
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to the clicked button
        const activeButton = document.querySelector(`.nav-button[data-section="${sectionName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Show the corresponding section
        const activeSection = document.getElementById(`${sectionName}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        // Notify game of section change (optional)
        if (this.game) {
            this.game.onSectionChanged(sectionName);
        }
    }

    /**
     * Show an element by removing the "hidden" class
     * @param {string} selector - The CSS selector of the element to show
     */
    showElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove('hidden');
        } else {
            console.error(`Element not found: ${selector}`);
        }
    }

    /**
     * Hide an element by adding the "hidden" class
     * @param {string} selector - The CSS selector of the element to hide
     */
    hideElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('hidden');
        } else {
            console.error(`Element not found: ${selector}`);
        }
    }

    /**
     * Update character information displays
     * @param {Object} character - The character object with name and level
     * */
    updateCharacterInfo(character) {
        if (!character) return;
        
        const nameElement = document.getElementById('character-name-display');
        if (nameElement) {
            nameElement.textContent = character.name;
        }
        
        const levelElement = document.getElementById('character-level');
        if (levelElement) {
            levelElement.textContent = character.level;
        }
    }

    // Inside UI class in ui.js

    /**
     * Update all resource displays based on character data
     * @param {Object} character - The character object with resource data
     */
    updateResourceDisplays(character) {
        if (!character) return;
        
        // Update gold
        const goldAmountElement = document.getElementById('gold-amount');
        if (goldAmountElement) {
            goldAmountElement.textContent = character.resources.gold.current;
        }
        
        const goldMaxElement = document.getElementById('gold-max');
        if (goldMaxElement) {
            goldMaxElement.textContent = character.resources.gold.max;
        }
        
        // Update health progress and text values
        const healthBarElement = document.getElementById('health-bar');
        const healthCurrentElement = document.getElementById('health-current');
        const healthMaxElement = document.getElementById('health-max');
        
        if (healthBarElement) {
            healthBarElement.value = character.stats.health.current;
            healthBarElement.max = character.stats.health.max;
        }
        
        if (healthCurrentElement) {
            healthCurrentElement.textContent = Math.floor(character.stats.health.current);
        }
        
        if (healthMaxElement) {
            healthMaxElement.textContent = character.stats.health.max;
        }
        
        // Update stamina progress and text values
        const staminaBarElement = document.getElementById('stamina-bar');
        const staminaCurrentElement = document.getElementById('stamina-current');
        const staminaMaxElement = document.getElementById('stamina-max');
        
        if (staminaBarElement) {
            staminaBarElement.value = character.stats.stamina.current;
            staminaBarElement.max = character.stats.stamina.max;
        }
        
        if (staminaCurrentElement) {
            staminaCurrentElement.textContent = Math.floor(character.stats.stamina.current);
        }
        
        if (staminaMaxElement) {
            staminaMaxElement.textContent = character.stats.stamina.max;
        }
        
        // Show/hide mana bar based on unlocked status
        const manaBarContainer = document.getElementById('mana-bar-container');
        if (manaBarContainer) {
            if (character.stats.mana.unlocked) {
                manaBarContainer.style.display = 'block';
                
                const manaBarElement = document.getElementById('mana-bar');
                const manaCurrentElement = document.getElementById('mana-current');
                const manaMaxElement = document.getElementById('mana-max');
                
                if (manaBarElement) {
                    manaBarElement.value = character.stats.mana.current;
                    manaBarElement.max = character.stats.mana.max;
                }
                
                if (manaCurrentElement) {
                    manaCurrentElement.textContent = Math.floor(character.stats.mana.current);
                }
                
                if (manaMaxElement) {
                    manaMaxElement.textContent = character.stats.mana.max;
                }
            } else {
                manaBarContainer.style.display = 'none';
            }
        }
        
        // Research resource (if unlocked)
        const researchResource = document.getElementById('research-resource');
        if (researchResource) {
            if (character.resources.research.unlocked) {
                researchResource.style.display = 'block';
                
                const researchAmountElement = document.getElementById('research-amount');
                if (researchAmountElement) {
                    researchAmountElement.textContent = character.resources.research.current;
                }
                
                const researchMaxElement = document.getElementById('research-max');
                if (researchMaxElement) {
                    researchMaxElement.textContent = character.resources.research.max;
                }
            } else {
                researchResource.style.display = 'none';
            }
        }
    }
}

export default UI;