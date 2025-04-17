// main.js
import Character from './character.js';

class Game {
    constructor() {
        this.character = null;
        this.initialized = false;
    }

    // Initialize the game
    init() {
        if (this.initialized) return;
        
        // Try to load existing character
        this.character = Character.load();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('Game initialized');
    }

    // Set up necessary event listeners
    setupEventListeners() {
        const characterForm = document.getElementById('character-form');
        if (characterForm) {
            characterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewCharacter();
            });
        }
    }

    // Create a new character
    createNewCharacter() {
        const nameInput = document.getElementById('character-name');
        if (nameInput && nameInput.value) {
            this.character = new Character(nameInput.value);
            this.character.save();
            
            // Transition to the game screen
            this.startGame();
        }
    }

    // Start the game (transition from welcome screen)
    startGame() {
        const welcomeContainer = document.querySelector('.welcome-container');
        const gameContainer = document.querySelector('.game-container');
        
        if (welcomeContainer && gameContainer) {
            welcomeContainer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            
            // Update UI with character info
            this.updateUI();
        } else {
            console.error('Required containers not found');
        }
    }

    // Update UI with character information
    updateUI() {
        if (!this.character) return;
        
        // For now, just update character name
        const nameElement = document.getElementById('character-name-display');
        if (nameElement) {
            nameElement.textContent = this.character.name;
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game instance available globally for debugging
    window.game = game;
});