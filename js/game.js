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
        this.uiController = new UIController(this.gameState);
        this.saveController = new SaveController(this.gameState);
        
        // Try to load saved game
        this.saveController.loadGame();
        
        // Start game loop
        this.lastTick = Date.now();
        this.tickInterval = 100; // 10 ticks per second
        setInterval(() => this.gameTick(), this.tickInterval);
        
        // Save game periodically
        setInterval(() => this.saveController.saveGame(), 30000); // Every 30 seconds
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