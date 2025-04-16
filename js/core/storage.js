/**
 * Game storage manager
 * Handles saving and loading game data from localStorage
 */
class StorageManager {
    constructor() {
        this.storageKey = 'everlyn_save';
        this.versionKey = 'everlyn_version';
        this.currentVersion = '0.1.0';
        
        // Check if storage is available
        this.storageAvailable = this.checkStorageAvailability();
        
        if (!this.storageAvailable) {
            console.warn('Local storage is not available. Game progress will not be saved.');
        }
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean} - Whether localStorage is available
     */
    checkStorageAvailability() {
        try {
            const storage = window.localStorage;
            const testKey = '__storage_test__';
            storage.setItem(testKey, testKey);
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Save game data to localStorage
     * @param {Object} data - Game data to save
     * @returns {boolean} - Whether the save was successful
     */
    saveGame(data) {
        if (!this.storageAvailable) return false;
        
        try {
            // Add timestamp and version
            const saveData = {
                ...data,
                savedAt: new Date().toISOString(),
                gameVersion: this.currentVersion
            };
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            localStorage.setItem(this.versionKey, this.currentVersion);
            
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }
    
    /**
     * Load game data from localStorage
     * @returns {Object|null} - Loaded game data or null if no save exists
     */
    loadGame() {
        if (!this.storageAvailable) return null;
        
        try {
            const saveData = localStorage.getItem(this.storageKey);
            if (!saveData) return null;
            
            const parsedData = JSON.parse(saveData);
            
            // Check for version mismatch
            const savedVersion = localStorage.getItem(this.versionKey) || '0.0.0';
            if (savedVersion !== this.currentVersion) {
                console.warn(`Save version mismatch: saved=${savedVersion}, current=${this.currentVersion}`);
                // In the future, we could implement save migration here
            }
            
            return parsedData;
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }
    
    /**
     * Check if a save game exists
     * @returns {boolean} - Whether a save game exists
     */
    hasSaveGame() {
        if (!this.storageAvailable) return false;
        return !!localStorage.getItem(this.storageKey);
    }
    
    /**
     * Delete save game
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteSaveGame() {
        if (!this.storageAvailable) return false;
        
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error deleting save game:', error);
            return false;
        }
    }
    
    /**
     * Get a specific setting
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if setting doesn't exist
     * @returns {*} - Setting value or default value
     */
    getSetting(key, defaultValue = null) {
        const data = this.loadGame();
        if (!data || !data.settings || data.settings[key] === undefined) {
            return defaultValue;
        }
        return data.settings[key];
    }
    
    /**
     * Save a specific setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {boolean} - Whether the save was successful
     */
    saveSetting(key, value) {
        const data = this.loadGame() || { settings: {} };
        if (!data.settings) {
            data.settings = {};
        }
        
        data.settings[key] = value;
        return this.saveGame(data);
    }
    
    /**
     * Export save as a JSON file
     */
    exportSave() {
        const saveData = this.loadGame();
        if (!saveData) {
            console.error('No save data to export');
            return;
        }
        
        const dataStr = JSON.stringify(saveData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `everlyn_save_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    }
    
    /**
     * Import save from a JSON file
     * @param {File} file - JSON file to import
     * @returns {Promise<boolean>} - Whether the import was successful
     */
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const saveData = JSON.parse(event.target.result);
                    const success = this.saveGame(saveData);
                    resolve(success);
                } catch (error) {
                    console.error('Error importing save:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }
}

// Create a singleton instance
const storageManager = new StorageManager();