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
        updatePlayerStats();
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

// Function to handle entering the city - modified from the original
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
        
        // Update the UI to show character information AFTER the main content is displayed
        updatePlayerStats();
        
        // Show welcome message
        alert(`Welcome, ${playerName}!`);
    } else {
        alert('Please enter your name to proceed.');
    }
}

// Function to update all player stats in the UI
function updatePlayerStats() {
    if (!playerCharacter) return;
    
    // Update resource displays - add null checks
    const goldElement = document.querySelector('.resource-item:nth-child(1)');
    if (goldElement) {
        goldElement.textContent = `Gold: ${playerCharacter.gold}/${playerCharacter.maxGold}`;
    }
    
    const researchElement = document.querySelector('.resource-item:nth-child(2)');
    if (researchElement) {
        researchElement.textContent = `Research: ${playerCharacter.research}/${playerCharacter.maxResearch}`;
    }
    
    const skinsElement = document.querySelector('.resource-item:nth-child(3)');
    if (skinsElement) {
        skinsElement.textContent = `Skins: ${playerCharacter.skins}/${playerCharacter.maxSkins}`;
    }
    
    // Update stat bars
    updateProgressBar('health', playerCharacter.health.current, playerCharacter.health.max);
    updateProgressBar('stamina', playerCharacter.stamina.current, playerCharacter.stamina.max);
    updateProgressBar('mana', playerCharacter.mana.current, playerCharacter.mana.max);
    updateProgressBar('earth-mana', playerCharacter.earthMana.current, playerCharacter.earthMana.max);
    updateProgressBar('fire-mana', playerCharacter.fireMana.current, playerCharacter.fireMana.max);
    updateProgressBar('air-mana', playerCharacter.airMana.current, playerCharacter.airMana.max);
    updateProgressBar('water-mana', playerCharacter.waterMana.current, playerCharacter.waterMana.max);
    
    // Update character section with more detailed profile
    const characterSection = document.getElementById('character');
    if (characterSection) {
        const stats = playerCharacter.displayStats();
        characterSection.innerHTML = `
            <h2>Character Profile</h2>
            <div class="character-profile card">
                <div class="character-header">
                    <h2 class="character-name">${stats.name}</h2>
                    <div class="character-subtitle">Level ${stats.level} ${stats.class}</div>
                </div>
                
                <div class="xp-section">
                    <div class="progress-container">
                        <div class="progress-bar xp-bar" style="width: ${(stats.xp / stats.xpToNextLevel) * 100}%; background-color: #9c27b0;">
                            <span class="progress-bar-text">XP: ${stats.xp}/${stats.xpToNextLevel}</span>
                        </div>
                    </div>
                    <div class="xp-info">Next level in: ${stats.xpToNextLevel - stats.xp} XP</div>
                </div>
                
                <div class="character-sections">
                    <div class="character-stats-section">
                        <h3>Character Stats</h3>
                        <ul class="character-stats-list">
                            <li><span>Health:</span> ${stats.health.current}/${stats.health.max}</li>
                            <li><span>Stamina:</span> ${stats.stamina.current}/${stats.stamina.max}</li>
                            <li><span>Mana:</span> ${stats.mana.current}/${stats.mana.max}</li>
                        </ul>
                    </div>
                    
                    <div class="character-resources-section">
                        <h3>Resources</h3>
                        <ul class="character-resources-list">
                            <li><span>Gold:</span> ${stats.gold}/${stats.maxGold}</li>
                            <li><span>Research:</span> ${stats.research}/${stats.maxResearch}</li>
                            <li><span>Skins:</span> ${stats.skins}/${stats.maxSkins}</li>
                        </ul>
                    </div>
                </div>
                
                <div class="character-journey">
                    <h3>Journey</h3>
                    <p>Continue your adventures in Everlyn to unlock new skills, discover hidden locations, and build your legend.</p>
                </div>
            </div>
        `;
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
            
            // Update the UI with the loaded character stats
            updatePlayerStats();
            
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

// Check for saved game on page load
document.addEventListener('DOMContentLoaded', () => {
    // Try to load saved game
    const loaded = loadGame();
    
    // Initialize progress bars regardless of whether a save was loaded
    initProgressBars();
    
    // Set up auto-save every minute
    setInterval(saveGame, 60000);
});