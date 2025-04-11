// Import the UIManager
import UIManager from './managers/ui-manager.js';

// Character.js modified for browser use
class Character {
    constructor(name, charClass) {
        this.name = name;
        this.charClass = charClass || "Adventurer"; // Default class if none specified
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        
        // Add stats that match the UI
        this.health = {current: 10, max: 10};
        this.stamina = {current: 10, max: 10};
        this.mana = {current: 10, max: 10};
        this.earthMana = {current: 0, max: 0};
        this.fireMana = {current: 0, max: 0};
        this.airMana = {current: 0, max: 0};
        this.waterMana = {current: 0, max: 0};
        
        // Resources
        this.gold = 0;
        this.maxGold = 10;
        this.research = 0;
        this.maxResearch = 25;
        this.skins = 0;
        this.maxSkins = 10;
    }

    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.xpToNextLevel;
        this.level++;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        console.log(`${this.name} leveled up! Now at level ${this.level}`);
        
        // Increase max stats on level up
        this.health.max += 2;
        this.health.current = this.health.max; // Restore health on level up
        this.stamina.max += 1;
        this.stamina.current = this.stamina.max;
        this.mana.max += 1;
        this.mana.current = this.mana.max;
        
        // Update UI with new stats
        updatePlayerUI();
    }

    displayStats() {
        return {
            name: this.name,
            class: this.charClass,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            health: this.health,
            stamina: this.stamina,
            mana: this.mana,
            earthMana: this.earthMana,
            fireMana: this.fireMana,
            airMana: this.airMana,
            waterMana: this.waterMana,
            gold: this.gold,
            maxGold: this.maxGold,
            research: this.research,
            maxResearch: this.maxResearch,
            skins: this.skins,
            maxSkins: this.maxSkins
        };
    }
}

// Global variable to store the player character
let playerCharacter = null;

// Function to update all UI elements using the UIManager
function updatePlayerUI() {
    if (!playerCharacter) return;
    UIManager.updateAllUI(playerCharacter);
}

// Function to handle entering the city - modified to use UIManager
function enterCity() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName) {
        // Create a new character instance with the player's name
        playerCharacter = new Character(playerName);
        
        // Store the character in localStorage for persistence between sessions
        saveGame();
        
        // Switch from landing page to main game
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Update the UI using UIManager
        updatePlayerUI();
        
    } else {
        alert('Please enter your name to proceed.');
    }
}

// Function to save game data
function saveGame() {
    if (playerCharacter) {
        localStorage.setItem('everlynSaveData', JSON.stringify(playerCharacter));
        console.log('Game saved successfully');
    }
}

// Function to load game data
function loadGame() {
    const savedData = localStorage.getItem('everlynSaveData');
    if (savedData) {
        try {
            const characterData = JSON.parse(savedData);
            
            // Create a new Character instance with the saved name
            playerCharacter = new Character(characterData.name, characterData.charClass);
            
            // Copy all properties from saved data to the new character instance
            Object.assign(playerCharacter, characterData);
            
            console.log('Game loaded successfully');
            
            // Skip the landing page and go straight to the game
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            
            // Update the UI with the loaded character stats using UIManager
            updatePlayerUI();
            
            return true;
        } catch (error) {
            console.error('Error loading save data:', error);
            return false;
        }
    }
    return false;
}

// Function to wipe saved game data
function wipeSaveData() {
    localStorage.removeItem('everlynSaveData');
    console.log('Save data wiped successfully');
    alert('All saved data has been wiped.');
}

// Make functions globally available
window.enterCity = enterCity;
window.wipeSaveData = wipeSaveData;
window.showTab = UIManager.showTab;

// Check for saved game on page load
document.addEventListener('DOMContentLoaded', () => {
    // Try to load saved game
    const loaded = loadGame();
    
    // Initialize progress bars
    UIManager.initProgressBars();
    
    // Set up auto-save every minute
    setInterval(saveGame, 60000);
});