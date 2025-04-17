// Create a new file: js/ui.js

class UI {
    /**
     * UI class to manage the user interface of the game
     * @param {Game} game - The game instance
     */
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
        
        // Listen for resource events
        if (this.game.events) {
            this.game.events.on('resource.changed', (data) => {
                // Update resource displays when any resource changes
                this.updateResourceDisplays(this.game.character);
                
                // Only update purchase buttons when gold changes or increases
                if (data.id === 'gold' || data.newValue > data.oldValue) {
                    this.updatePurchaseButtons(this.game.character);
                }
            });
        }
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
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification ('success' or 'error')
     */
    showNotification(message, type = 'success') {
        // Create notification if it doesn't exist yet
        let notification = document.querySelector('.game-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'game-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `game-notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
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

    /**
     * Handle resource changes and update UI accordingly
     * @param {Object} data - The resource change data
     * */
    onResourceChanged(data) {
        // Update resource displays
        this.updateResourceDisplays(this.game.character);
        
        // Update purchase buttons if gold changed or resource increased
        if (data.id === 'gold' || data.newValue > data.oldValue) {
            this.updatePurchaseButtons(this.game.character);
        }
    }

    /**
     * Update all resource displays based on character data
     * @param {Object} character - The character object with resource data
     */
    updateResourceDisplays(character) {
        if (!character) return;
        
        // Update currencies display
        for (const [id, currency] of Object.entries(character.currencies)) {
            // Skip if not unlocked
            if (!currency.unlocked) continue;
            
            // Get the container for this currency
            const resourceItem = document.getElementById(`${id}-resource`);
            
            // If container doesn't exist, create it
            if (!resourceItem && currency.unlocked) {
                this.createResourceDisplay(id, currency);
            }
            
            // Update values
            const amountElement = document.getElementById(`${id}-amount`);
            const maxElement = document.getElementById(`${id}-max`);
            
            if (amountElement) {
                amountElement.textContent = Math.floor(currency.current * 10) / 10; // Round to 1 decimal
            }
            
            if (maxElement) {
                maxElement.textContent = currency.max;
            }
        }
        
        // Update stat bars
        for (const [id, stat] of Object.entries(character.stats)) {
            if (!stat.unlocked) continue;
            
            // Get the elements
            const barElement = document.getElementById(`${id}-bar`);
            const currentElement = document.getElementById(`${id}-current`);
            const maxElement = document.getElementById(`${id}-max`);
            const containerElement = document.getElementById(`${id}-bar-container`);
            
            // Show/hide container based on unlocked status
            if (containerElement) {
                containerElement.style.display = stat.unlocked ? 'block' : 'none';
            }
            
            // Update bar
            if (barElement) {
                barElement.value = stat.current;
                barElement.max = stat.max;
            }
            
            // Update text values
            if (currentElement) {
                currentElement.textContent = Math.floor(stat.current);
            }
            
            if (maxElement) {
                maxElement.textContent = stat.max;
            }
        }
    }

    /**
     * Create display elements for a new resource
     * @param {string} id - Resource ID
     * @param {Resource} resource - The resource object
     */
    createResourceDisplay(id, resource) {
        // Skip if not unlocked
        if (!resource.unlocked) return;
        
        // Create resource item in sidebar
        const sidebar = document.querySelector('.sidebar-content .resource-bar');
        if (!sidebar) return;
        
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item';
        resourceItem.id = `${id}-resource`;
        
        resourceItem.innerHTML = `
            <span class="resource-label">${resource.name}:</span>
            <span id="${id}-amount" class="resource-value">0</span>/<span id="${id}-max" class="resource-value">${resource.max}</span>
        `;
        
        sidebar.appendChild(resourceItem);
    }

    /**
     * Update available purchase buttons
     * @param {Object} character - The character object
     */
    updatePurchaseButtons(character) {
        if (!character) return;
        
        const upgradesContainer = document.querySelector('.available-upgrades');
        if (!upgradesContainer) return;
        
        // Get all existing buttons
        const existingButtons = document.querySelectorAll('.upgrade-button');
        const existingButtonIds = Array.from(existingButtons).map(button => button.dataset.upgrade);
        
        // First, update states of existing buttons
        existingButtons.forEach(button => {
            const upgradeId = button.dataset.upgrade;
            
            // Check if this is a currency button
            const currency = character.currencies[upgradeId];
            if (currency && currency.purchaseCost) {
                // Only change disabled state if needed
                const canPurchase = currency.canPurchase(character);
                if (!button.disabled && !canPurchase) {
                    button.disabled = true;
                } else if (button.disabled && canPurchase) {
                    button.disabled = false;
                }
            }
        });
        
        // Array to track buttons that should be shown
        const buttonsToShow = [];
        
        // Check purchasable currencies
        for (const [currencyId, currency] of Object.entries(character.currencies)) {
            // Skip if not purchasable, already at max, or already showing
            if (!currency.purchaseCost || currency.isFull() || existingButtonIds.includes(currencyId)) continue;
            
            // Create button only if we're close to affording it or it's unlocked
            let canShow = false;
            
            // Check if we have at least 90% of the cost
            for (const [resourceId, cost] of Object.entries(currency.purchaseCost)) {
                const resource = character.getResource(resourceId);
                if (resource && resource.unlocked && resource.current >= cost * 0.9) {
                    canShow = true;
                    break;
                }
            }
            
            if (canShow || currency.unlocked) {
                buttonsToShow.push({
                    type: 'currency',
                    id: currencyId,
                    object: currency
                });
            }
        }
        
        // Also check for upgrades from the upgrade manager
        if (this.game.upgradesManager) {
            for (const upgrade of Object.values(this.game.upgradesManager.upgrades)) {
                if (upgrade.unlocked && !upgrade.purchased && !existingButtonIds.includes(upgrade.id)) {
                    buttonsToShow.push({
                        type: 'upgrade',
                        id: upgrade.id,
                        object: upgrade
                    });
                }
            }
        }
        
        // Add new buttons if needed
        for (const buttonInfo of buttonsToShow) {
            let button;
            if (buttonInfo.type === 'currency') {
                button = this.createPurchaseButton(buttonInfo.object, character);
            } else {
                button = buttonInfo.object.createButtonElement();
            }
            upgradesContainer.appendChild(button);
        }
    }

    /**
     * Create a purchase button for a currency
     * @param {Currency} currency - The currency to purchase
     * @param {Object} character - The character object
     * @returns {HTMLElement} - The button element
     */
    createPurchaseButton(currency, character) {
        const button = document.createElement('button');
        button.className = 'upgrade-button';
        button.dataset.upgrade = currency.id;
        
        // Create button content
        const nameElement = document.createElement('span');
        nameElement.className = 'upgrade-name';
        nameElement.textContent = `Buy a ${currency.name.slice(0, -1)}`; // Remove 's' from the end
        
        const descElement = document.createElement('span');
        descElement.className = 'upgrade-description';
        descElement.textContent = currency.description;
        
        const costElement = document.createElement('span');
        costElement.className = 'upgrade-cost';
        
        // Format cost text
        const costText = Object.entries(currency.purchaseCost)
            .map(([id, amount]) => {
                const resource = character.getResource(id);
                return `${amount} ${resource ? resource.name : id}`;
            })
            .join(', ');
        
        costElement.textContent = `Cost: ${costText}`;
        
        // Add elements to button
        button.appendChild(nameElement);
        button.appendChild(descElement);
        button.appendChild(costElement);
        
        // Add event listener
        button.addEventListener('click', () => {
            // Always get the latest character state when clicked
            const canPurchase = currency.canPurchase(character);
            if (canPurchase) {
                const success = currency.purchase(character);
                if (success) {
                    // Force UI update after purchase
                    this.updateResourceDisplays(character);
                    // Update purchase buttons with a slight delay to avoid conflicts
                    setTimeout(() => {
                        this.updatePurchaseButtons(character);
                    }, 50);
                }
            } else {
                // Notify user they can't afford it
                this.game.ui.showNotification(`Not enough resources to purchase ${currency.name.slice(0, -1)}.`, 'error');
            }
        });
        
        // Set initial disabled state
        button.disabled = !currency.canPurchase(character);
        
        return button;
    }
}

export default UI;