// main.js - Application Entry Point
// This file imports and initializes all the necessary modules

// Import utilities
import ErrorUtils from './utils/ErrorUtils.js';
import PerformanceMonitor from './utils/PerformanceMonitor.js';
import GameConfig from './config.js';

// Import core managers
import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import CharacterManager from './managers/character-manager.js';
import DOMCache from './managers/DOMCache.js';
import TemplateManager from './managers/TemplateManager.js';

// Import services
import LocationService from './services/LocationService.js';

// Import integration modules
import { enterCity, wipeSaveData } from './character-integration.js';
import MapModule from './map.js';

/**
 * Initialize the application
 */
function initApp() {
    const end = PerformanceMonitor.start('initApp');
    
    ErrorUtils.tryCatch(() => {
        console.log('Initializing Everlyn app...');
        
        // Configure DOMCache
        DOMCache.configure({
            logErrors: true,
            throwErrors: false,
            cacheNullResults: true,
            debugMode: isDevMode()
        });
        
        // Set up event listeners for tab navigation
        initEventListeners();
        
        // Try to load saved game
        const gameLoaded = CharacterManager.loadGame();
        
        // If no game data exists, apply initial state to bound elements
        if (!gameLoaded) {
            // Set a default location for bound elements
            if (!GameState.currentLocation) {
                GameState.setLocation('City Square');
            }
            
            // Ensure UI bindings reflect initial state
            UIManager.updateBindings(GameState);
        }
        
        // Show welcome message
        console.log(`Everlyn app initialized successfully${gameLoaded ? ' (Game loaded)' : ''}`);
        
        // Set default tab from config
        UIManager.showTab(GameConfig.ui.defaultTab || 'map');
    }, 'initApp');
    
    end();
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    const end = PerformanceMonitor.start('initEventListeners');
    
    ErrorUtils.tryCatch(() => {
        // Add click event listeners to tab buttons using DOMCache
        const tabButtons = DOMCache.getAll('tabButtons');
        tabButtons.forEach(button => {
            button.addEventListener('click', handleTabClick);
        });
        
        // Add event listener for enter city button
        const enterCityBtn = DOMCache.get('enterCityBtn');
        if (enterCityBtn) {
            enterCityBtn.addEventListener('click', enterCity);
        }
        
        // Add event listener for wipe save button
        const wipeSaveBtn = DOMCache.get('wipeSaveBtn');
        if (wipeSaveBtn) {
            wipeSaveBtn.addEventListener('click', handleWipeSave);
        }
        
        // Handle Enter key press on the name input field
        const playerNameInput = DOMCache.get('playerName');
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', handleNameInputKeypress);
        }
    }, 'initEventListeners');
    
    end();
}

/**
 * Handle tab button click
 * @param {Event} event - Click event
 */
function handleTabClick(event) {
    const tabId = event.currentTarget.getAttribute('data-tab');
    if (tabId) {
        UIManager.showTab(tabId);
    }
}

/**
 * Handle wipe save button click with confirmation
 */
function handleWipeSave() {
    // Ask for confirmation before wiping save
    if (confirm('Are you sure you want to wipe all saved game data? This cannot be undone.')) {
        wipeSaveData();
        
        // Reload the page after wiping save
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

/**
 * Handle name input keypress
 * @param {Event} event - Keypress event
 */
function handleNameInputKeypress(event) {
    if (event.key === 'Enter') {
        enterCity();
    }
}

/**
 * Check if running in development mode
 * @returns {boolean} - True if in development mode
 */
function isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.search.includes('dev=true');
}

// Enable performance monitoring in development mode
if (isDevMode()) {
    PerformanceMonitor.enable({ threshold: 50 });
    console.log('Development mode detected - Performance monitoring enabled');
    
    // Add dev tools to global scope for debugging
    window.EvelynDev = {
        GameState,
        CharacterManager,
        UIManager,
        DOMCache,
        PerformanceMonitor,
        LocationService,
        MapModule,
        ErrorUtils
    };
    
    // Add global performance report command
    window.showPerformanceReport = () => {
        PerformanceMonitor.printReport();
    };
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export initialization function for testing
export { initApp };