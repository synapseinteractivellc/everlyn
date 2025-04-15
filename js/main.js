// main.js - Application Entry Point using Component System
// This file imports and initializes all the necessary modules

// Import utilities and core modules
import ErrorUtils from './utils/ErrorUtils.js';
import PerformanceMonitor from './utils/PerformanceMonitor.js';
import GameConfig from './config.js';
import templateLoader from './core/TemplateLoader.js';

// Import managers
import GameState from './managers/GameState.js';
import CharacterManager from './managers/character-manager.js';

// Import components
import CharacterComponent from './components/CharacterComponent.js';
import MapComponent from './components/MapComponent.js';
import ResourceBarComponent from './components/ResourceBarComponent.js';
import StatBarComponent from './components/StatBarComponent.js';

// Track active components
const activeComponents = new Map();

/**
 * Initialize the application
 */
async function initApp() {
    const end = PerformanceMonitor.start('initApp');
    
    try {
        console.log('Initializing Everlyn app...');
        
        // Set template path
        templateLoader.setTemplatePath('./templates/');
        
        // Preload all templates
        await preloadTemplates();
        
        // Set up event listeners for tab navigation
        initEventListeners();
        
        // Try to load saved game
        const gameLoaded = CharacterManager.loadGame();
        
        // If no game data exists, apply initial state
        if (!gameLoaded) {
            // Set a default location for bound elements
            if (!GameState.currentLocation) {
                GameState.setLocation('City Square');
            }
        }
        
        // Initialize UI based on current view
        initializeUI();
        
        // Show welcome message
        console.log(`Everlyn app initialized successfully${gameLoaded ? ' (Game loaded)' : ''}`);
        
        // Set default tab from config
        showTab(GameConfig.ui.defaultTab || 'map');
    } catch (error) {
        ErrorUtils.logError(
            error, 
            'initApp', 
            ErrorUtils.LogLevel.ERROR
        );
    }
    
    end();
}

/**
 * Preload all HTML templates
 */
async function preloadTemplates() {
    const templates = {
        'character-profile': 'character/profile.html',
        'city-map': 'map/map.html',
        'resource-bar': 'components/resource-bar.html',
        'stat-bar': 'components/stat-bar.html',
        'landing-page': 'pages/landing.html',
        'main-page': 'pages/main.html'
    };
    
    return await templateLoader.loadTemplates(templates);
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    try {
        // Add click event listeners to tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', handleTabClick);
        });
        
        // Add event listener for enter city button
        const enterCityBtn = document.getElementById('enter-city-btn');
        if (enterCityBtn) {
            enterCityBtn.addEventListener('click', enterCity);
        }
        
        // Add event listener for wipe save button
        const wipeSaveBtn = document.getElementById('wipe-save-btn');
        if (wipeSaveBtn) {
            wipeSaveBtn.addEventListener('click', handleWipeSave);
        }
        
        // Handle Enter key press on the name input field
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', handleNameInputKeypress);
        }
    } catch (error) {
        ErrorUtils.logError(
            error, 
            'initEventListeners', 
            ErrorUtils.LogLevel.ERROR
        );
    }
}

/**
 * Initialize UI components based on current view
 */
function initializeUI() {
    const currentView = GameState.getProperty('currentView') || 'landing';
    
    if (currentView === 'landing') {
        // Render landing page
        templateLoader.render('landing-page', {}, '#app-container');
    } else {
        // Render main game UI
        templateLoader.render('main-page', {
            playerName: GameState.character ? GameState.character.name : 'Adventurer'
        }, '#app-container');
        
        // Initialize components
        initializeComponents();
    }
}

/**
 * Initialize components for the main game view
 */
function initializeComponents() {
    // Clean up any existing components
    activeComponents.forEach(component => component.destroy());
    activeComponents.clear();
    
    // Create and store character component
    const characterComponent = new CharacterComponent('#character-section');
    activeComponents.set('character', characterComponent);
    
    // Create and store map component
    const mapComponent = new MapComponent('#map-section');
    activeComponents.set('map', mapComponent);
    
    // Create resource bar components
    const goldBar = new ResourceBarComponent('#resources-container', {
        resourceType: 'gold',
        icon: 'coin',
        color: '#ffd700'
    });
    activeComponents.set('resource-gold', goldBar);
    
    const researchBar = new ResourceBarComponent('#resources-container', {
        resourceType: 'research',
        icon: 'book',
        color: '#9c27b0'
    });
    activeComponents.set('resource-research', researchBar);
    
    // Create stat bar components
    const healthBar = new StatBarComponent('#stats-container', {
        statType: 'health',
        icon: 'heart',
        color: '#dc3545'
    });
    activeComponents.set('stat-health', healthBar);
    
    const staminaBar = new StatBarComponent('#stats-container', {
        statType: 'stamina',
        icon: 'running',
        color: '#28a745'
    });
    activeComponents.set('stat-stamina', staminaBar);
    
    const manaBar = new StatBarComponent('#stats-container', {
        statType: 'mana',
        icon: 'magic',
        color: '#007bff'
    });
    activeComponents.set('stat-mana', manaBar);
}

/**
 * Handle tab button click
 * @param {Event} event - Click event
 */
function handleTabClick(event) {
    const tabId = event.currentTarget.getAttribute('data-tab');
    if (tabId) {
        showTab(tabId);
    }
}

/**
 * Show/hide tab content
 * @param {string} sectionId - The ID of the section to show
 */
function showTab(sectionId) {
    try {
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
        
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            if (tabId === sectionId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    } catch (error) {
        ErrorUtils.logError(
            error, 
            'showTab', 
            ErrorUtils.LogLevel.ERROR
        );
    }
}

/**
 * Entry point function for the game
 * Called when the player enters their name and starts the game
 */
function enterCity() {
    console.log("Enter City button clicked"); // Add this line
    const playerNameInput = document.getElementById('player-name');
    if (!playerNameInput) {
        console.error('Player name input not found');
        return;
    }
    
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name to proceed.');
        return;
    }
    
    // Create a new character instance with the player's name
    CharacterManager.createCharacter(playerName);
    
    // Set a default location
    GameState.setLocation('City Square');
    
    // Store the character in localStorage for persistence between sessions
    CharacterManager.saveGame();
    
    // Update view state
    GameState.updateProperty('currentView', 'main');
    
    // Re-initialize UI for main view
    initializeUI();
}

/**
 * Handle wipe save button click with confirmation
 */
function handleWipeSave() {
    // Ask for confirmation before wiping save
    if (confirm('Are you sure you want to wipe all saved game data? This cannot be undone.')) {
        CharacterManager.wipeSaveData();
        
        // Reset GameState
        GameState.setCharacter(null);
        GameState.setLocation(null);
        GameState.updateProperty('currentView', 'landing');
        
        // Re-initialize UI for landing view
        initializeUI();
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
        templateLoader,
        PerformanceMonitor,
        ErrorUtils,
        activeComponents
    };
    
    // Add global performance report command
    window.showPerformanceReport = () => {
        PerformanceMonitor.printReport();
    };
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for testing
export { 
    initApp, 
    enterCity, 
    handleWipeSave,
    showTab
};