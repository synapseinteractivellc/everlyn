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
            // Create a save object with metadata
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                gameState: gameState
            };
            
            // Convert to string and store
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - The loaded game state or null if no save exists
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.storageKey);
            if (!saveData) return null;
            
            const parsedData = JSON.parse(saveData);
            return parsedData.gameState;
        } catch (error) {
            console.error('Failed to load game:', error);
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