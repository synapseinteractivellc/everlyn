// Create a new file: js/ui.js

class UI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Navigation event listeners
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchSection(button.dataset.section);
            });
        });
    }
    
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
}

export default UI;