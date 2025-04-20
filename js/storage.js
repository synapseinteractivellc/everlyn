// storage.js

/**
 * Handles all game data persistence using localStorage
 */
class Storage {
    constructor() {
        this.storageKey = 'everlyn_save';
    }

    /**
     * Save the entire game state to localStorage
     * @param {Object} gameState - The game state to save
     * @returns {boolean} - Success status
     */
    saveGame(gameState) {
        try {
            console.log("STORAGE SAVE: Starting to save game state");
            console.log("STORAGE SAVE: Game state received:", gameState);
            
            // Create a save object with metadata
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                gameState: gameState
            };
            
            // Convert to string and store
            const saveString = JSON.stringify(saveData);
            console.log("STORAGE SAVE: Save string length:", saveString.length);
            localStorage.setItem(this.storageKey, saveString);
            
            console.log("STORAGE SAVE: Game state stored successfully");
            return true;
        } catch (error) {
            console.error("STORAGE SAVE ERROR:", error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - The loaded game state or null if no save exists
     */
    loadGame() {
        try {
            console.log("STORAGE LOAD: Starting to load game state");
            
            const saveData = localStorage.getItem(this.storageKey);
            if (!saveData) {
                console.log("STORAGE LOAD: No save data found");
                return null;
            }
            
            console.log("STORAGE LOAD: Save data string length:", saveData.length);
            
            const parsedData = JSON.parse(saveData);
            console.log("STORAGE LOAD: Parsed data version:", parsedData.version);
            console.log("STORAGE LOAD: Parsed data timestamp:", new Date(parsedData.timestamp).toLocaleString());
            
            // Log the character stats from the loaded data
            if (parsedData.gameState && parsedData.gameState.character && parsedData.gameState.character.stats) {
                console.log("STORAGE LOAD: Character stats in loaded data:", parsedData.gameState.character.stats);
                
                // Special attention to stamina
                if (parsedData.gameState.character.stats.stamina) {
                    console.log("STORAGE LOAD: Stamina in loaded data:", parsedData.gameState.character.stats.stamina);
                    console.log("STORAGE LOAD: Stamina current value:", parsedData.gameState.character.stats.stamina.current);
                }
            }
            
            return parsedData.gameState;
        } catch (error) {
            console.error("STORAGE LOAD ERROR:", error);
            return null;
        }
    }

    /**
     * Check if a saved game exists
     * @returns {boolean} - True if a save exists
     */
    hasSaveGame() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * Get metadata about the saved game
     * @returns {Object|null} - Save metadata or null if no save exists
     */
    getSaveMetadata() {
        try {
            const saveData = localStorage.getItem(this.storageKey);
            if (!saveData) return null;
            
            const parsedData = JSON.parse(saveData);
            return {
                version: parsedData.version,
                timestamp: parsedData.timestamp,
                date: new Date(parsedData.timestamp).toLocaleString()
            };
        } catch (error) {
            console.error('Failed to get save metadata:', error);
            return null;
        }
    }

    /**
     * Delete the saved game
     * @returns {boolean} - Success status
     */
    wipeSave() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to wipe save:', error);
            return false;
        }
    }
}

export default Storage;