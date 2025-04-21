// js/game.js
class Game {
    constructor() {
        // Initialize controllers
        this.gameState = new GameState();
        this.gameController = new GameController(this.gameState);
        this.characterController = new CharacterController(this.gameState);
        this.actionController = new ActionController(this.gameState);
        this.currencyController = new CurrencyController(this.gameState);
        this.skillController = new SkillController(this.gameState);
        this.homeController = new HomeController(this.gameState);
        this.upgradeController = new UpgradeController(this.gameState);
        this.saveController = new SaveController(this.gameState);
        
        // Try to load saved game
        const loadSuccessful = this.saveController.loadGame();

        // Initialize the UI
        this.uiController = new UIController(this.gameState);
        
        // Check if we need to show character creation
        if (!loadSuccessful || this.gameState.character.name === "Unnamed") {
            this.showCharacterCreation();
        }

        // Start game loop
        this.lastTick = Date.now();
        this.tickInterval = 100; // 10 ticks per second
        setInterval(() => this.gameTick(), this.tickInterval);
        
        // Save game periodically
        setInterval(() => this.saveController.saveGame(), 30000); // Every 30 seconds
    }

    showCharacterCreation() {
        const overlay = document.getElementById('character-creation-overlay');
        overlay.style.display = 'flex';
        
        const nameInput = document.getElementById('character-name-input');
        const enterButton = document.getElementById('enter-city-button');
        
        // Set focus to the input field
        nameInput.focus();
        
        // Handle enter key press
        nameInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.createCharacter();
            }
        });
        
        // Handle button click
        enterButton.addEventListener('click', () => {
            this.createCharacter();
        });
    }
    
    createCharacter() {
        const nameInput = document.getElementById('character-name-input');
        const name = nameInput.value.trim();
        
        // Validate name (not empty)
        if (name === '') {
            nameInput.style.borderColor = '#e74c3c';
            nameInput.placeholder = 'Please enter a name';
            nameInput.focus();
            return;
        }
        
        // Set character name
        this.gameController.setCharacterName(name);
        
        // Hide overlay
        document.getElementById('character-creation-overlay').style.display = 'none';
        
        // Update UI
        this.uiController.updateCharacterInfo();
        
        // Save game
        this.saveController.saveGame();
        
        // Add welcome message to log
        this.gameState.actionLog.unshift({
            message: `Welcome to Everlyn, ${name}! Your journey begins...`,
            timestamp: Date.now()
        });
        
        // Update action log display
        this.uiController.updateActionLog();
    }
    
    gameTick() {
        const now = Date.now();
        const deltaTime = now - this.lastTick;
        this.lastTick = now;
        
        // Update game state
        this.gameController.update(deltaTime);
        this.actionController.update(deltaTime);
        this.currencyController.update(deltaTime);
        this.skillController.update(deltaTime);
        this.upgradeController.update(deltaTime);
        
        // Update UI
        this.uiController.update();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});