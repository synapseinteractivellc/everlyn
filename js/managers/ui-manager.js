// ui-manager.js - Comprehensive UI Management
// This module handles all UI updates throughout the application
// It centralizes UI updates to ensure consistency and reduce code duplication

import GameState from './GameState.js';
import LocationService from '../services/LocationService.js';
import DOMCache from './DOMCache.js';
import TemplateManager from './TemplateManager.js';

/**
 * UIManager - Handles all UI updates throughout the application
 * This centralized approach helps maintain consistency and reduces code duplication
 */
const UIManager = {
    /**
     * Initialize the UI manager
     */
    init: function() {
        // Initialize progress bars on page load
        this.initProgressBars();
        
        // Subscribe to GameState changes
        GameState.subscribe(this.handleStateChange.bind(this));
    },
    
    /**
     * Handle state changes from GameState
     * @param {Object} state - The current game state
     */
    handleStateChange: function(state) {
        if (state.character) {
            this.updateAllUI(state.character);
        }
        
        if (state.currentLocation) {
            // Use the LocationService to get location details
            const locationDetails = LocationService.getLocationDetails(state.currentLocation);
            if (locationDetails) {
                this.updateLocationInfo(state.currentLocation, locationDetails);
            }
        }
    },

    /**
     * Updates the player name display in the header
     * @param {string} playerName - The name of the player
     */
    updatePlayerNameDisplay: function(playerName) {
        const playerNameDisplay = DOMCache.get('playerNameDisplay');
        if (playerNameDisplay) {
            playerNameDisplay.textContent = playerName;
        } else {
            console.error('Element with id "player-name-display" not found.');
        }
    },

    /**
     * Updates all progress bars for player stats
     * @param {Object} character - The player character object
     */
    updateStatBars: function(character) {
        if (!character) return;

        // Use cached elements to update progress bars
        this.updateProgressBar('stats.health', character.health.current, character.health.max, 'Health');
        this.updateProgressBar('stats.stamina', character.stamina.current, character.stamina.max, 'Stamina');
        this.updateProgressBar('stats.mana', character.mana.current, character.mana.max, 'Mana');
        this.updateProgressBar('stats.earthMana', character.earthMana.current, character.earthMana.max, 'Earth Mana');
        this.updateProgressBar('stats.fireMana', character.fireMana.current, character.fireMana.max, 'Fire Mana');
        this.updateProgressBar('stats.airMana', character.airMana.current, character.airMana.max, 'Air Mana');
        this.updateProgressBar('stats.waterMana', character.waterMana.current, character.waterMana.max, 'Water Mana');
    },

    /**
     * Updates a progress bar with current and max values
     * @param {string} progressBarSelector - Selector for the progress bar element
     * @param {number} currentValue - Current value of the stat
     * @param {number} maxValue - Maximum value of the stat
     * @param {string} statName - The name of the stat (for display purposes)
     */
    updateProgressBar: function(progressBarSelector, currentValue, maxValue, statName) {
        const progressBarElement = DOMCache.get(progressBarSelector);
        if (!progressBarElement) return;

        // Calculate the percentage
        const percentage = (currentValue / maxValue) * 100;

        // Update the width of the progress bar
        progressBarElement.style.width = `${percentage}%`;

        // Update the text inside the progress bar
        const progressText = progressBarElement.querySelector('.progress-bar-text');
        if (progressText) {
            progressText.textContent = `${statName}: ${currentValue}/${maxValue}`;
        }
    },

    /**
     * Updates the resources display in the sidebar
     * @param {Object} character - The player character object
     */
    updateResources: function(character) {
        if (!character) return;

        // Update each resource
        this.updateResource('resources.gold', 'Gold', character.gold, character.maxGold);
        this.updateResource('resources.research', 'Research', character.research, character.maxResearch);
        this.updateResource('resources.skins', 'Skins', character.skins, character.maxSkins);
    },

    /**
     * Update a single resource display
     * @param {string} selector - Selector for the resource element
     * @param {string} label - Label for the resource
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     */
    updateResource: function(selector, label, value, max) {
        const element = DOMCache.get(selector);
        if (element) {
            element.textContent = `${label}: ${value}/${max}`;
        }
    },

    /**
     * Updates the character profile section with detailed information
     * @param {Object} character - The player character object
     */
    updateCharacterProfile: function(character) {
        if (!character) return;

        const characterSection = DOMCache.get('character');
        if (!characterSection) return;
        
        // Check if the character profile already exists
        let characterProfile = characterSection.querySelector('.character-profile');
        
        if (!characterProfile) {
            // Use TemplateManager to create the profile structure
            characterSection.innerHTML = '<h2>Character Profile</h2>';
            
            // Create and append the character profile
            const profileElement = TemplateManager.createElement('characterProfile');
            characterSection.appendChild(profileElement);
            
            // Update DOMCache with the new elements
            DOMCache.clearCache(['characterProfile', 'characterName', 'characterSubtitle', 'xpBar', 'xpInfo']);
        }
        
        // Get character stats for display
        const stats = character.displayStats();
        
        // Update name and level
        const nameElement = DOMCache.get('characterName') || characterSection.querySelector('.character-name');
        if (nameElement) nameElement.textContent = stats.name;
        
        const subtitleElement = DOMCache.get('characterSubtitle') || characterSection.querySelector('.character-subtitle');
        if (subtitleElement) subtitleElement.textContent = `Level ${stats.level} ${stats.class}`;
        
        // Update XP bar
        const progressBar = DOMCache.get('xpBar') || characterSection.querySelector('.xp-bar');
        if (progressBar) {
            progressBar.style.width = `${(stats.xp / stats.xpToNextLevel) * 100}%`;
            
            const progressText = progressBar.querySelector('.progress-bar-text');
            if (progressText) progressText.textContent = `XP: ${stats.xp}/${stats.xpToNextLevel}`;
        }
        
        // Update XP info
        const xpInfo = DOMCache.get('xpInfo') || characterSection.querySelector('.xp-info');
        if (xpInfo) xpInfo.textContent = `Next level in: ${stats.xpToNextLevel - stats.xp} XP`;
    },

    /**
     * Updates the location info panel when a map location is clicked
     * @param {string} locationName - The name of the clicked location
     * @param {Object} details - The details of the location
     */
    updateLocationInfo: function(locationName, details) {
        const locationInfo = DOMCache.get('locationInfo');
        if (!locationInfo) return;

        if (details) {
            // Use TemplateManager to render location info
            TemplateManager.render(
                locationInfo,
                'locationInfo',
                locationName,
                details.description,
                details.quests || []
            );
        } else {
            // Fallback for locations without detailed info
            locationInfo.innerHTML = `
                <h3>${locationName}</h3>
                <p>You are now at the ${locationName}. Explore this area to discover quests and resources.</p>
            `;
        }
    },

    /**
     * Shows/hides tab content
     * @param {string} sectionId - The ID of the section to show
     */
    showTab: function(sectionId) {
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
    },

    /**
     * Updates all UI elements at once with the current character data
     * @param {Object} character - The player character object
     */
    updateAllUI: function(character) {
        if (!character) return;

        this.updatePlayerNameDisplay(character.name);
        this.updateStatBars(character);
        this.updateResources(character);
        this.updateCharacterProfile(character);
    },

    /**
     * Initializes progress bars on page load
     */
    initProgressBars: function() {
        const statSelectors = Object.values(DOMCache._selectors.stats);
        
        statSelectors.forEach(selector => {
            const progressBarElement = document.querySelector(selector);
            if (!progressBarElement) return;

            const progressText = progressBarElement.querySelector('.progress-bar-text');
            if (progressText) {
                const [current, max] = progressText.textContent.match(/\d+/g).map(Number);
                const percentage = (current / max) * 100;
                progressBarElement.style.width = `${percentage}%`;
            }
        });
    }
};

// Initialize the UIManager when the module loads
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// Export the UIManager for use in other modules
export default UIManager;