// ui-manager.js - Comprehensive UI Management
// This module handles all UI updates throughout the application
// It centralizes UI updates to ensure consistency and reduce code duplication

import GameState from './GameState.js';

/**
 * UIManager - Handles all UI updates throughout the application
 * This centralized approach helps maintain consistency and reduces code duplication
 */
const UIManager = {
    // Cache DOM elements for performance
    init: function() {
        this.elements = {
            playerNameDisplay: document.getElementById('player-name-display'),
            resources: {
                gold: document.getElementById('gold-display'),
                research: document.getElementById('research-display'),
                skins: document.getElementById('skins-display'),
            },
            stats: {
                health: document.getElementById('health-bar-display'),
                stamina: document.getElementById('stamina-bar-display'),
                mana: document.getElementById('mana-bar-display'),
                earthMana: document.getElementById('earth-mana-bar-display'),
                fireMana: document.getElementById('fire-mana-bar-display'),
                airMana: document.getElementById('air-mana-bar-display'),
                waterMana: document.getElementById('water-mana-bar-display'),
            },
            locationInfo: document.querySelector('.location-info'),
            characterSection: document.getElementById('character'),
        };

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
            // This could be extended to get location details from a locations store/service
            const locationDetails = this.getLocationDetails(state.currentLocation);
            if (locationDetails) {
                this.updateLocationInfo(state.currentLocation, locationDetails);
            }
        }
    },
    
    /**
     * Get location details by name
     * @param {string} locationName - The name of the location
     * @returns {Object|null} - The location details or null if not found
     */
    getLocationDetails: function(locationName) {
        // This could be moved to a separate locations service
        const locationDetails = {
            'City Square': {
                description: 'The bustling heart of Everlyn where citizens gather. Many important announcements are made here.',
                quests: ['Help the town crier', 'Find the lost child']
            },
            'Market': {
                description: 'A vibrant marketplace where merchants sell goods from all over the realm.',
                quests: ['Bargain with the merchants', 'Deliver goods to the inn']
            },
            'Inn': {
                description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers.',
                quests: ['Help the innkeeper', 'Listen for rumors']
            },
            'Forest': {
                description: 'A dense forest east of the city. Home to various creatures and valuable resources.',
                quests: ['Gather herbs', 'Hunt for food', 'Clear monster nests']
            }
        };
        
        return locationDetails[locationName] || null;
    },

    /**
     * Updates the player name display in the header
     * @param {string} playerName - The name of the player
     */
    updatePlayerNameDisplay: function(playerName) {
        const playerNameDisplay = this.elements.playerNameDisplay;
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
        this.updateProgressBar(this.elements.stats.health, character.health.current, character.health.max, 'Health');
        this.updateProgressBar(this.elements.stats.stamina, character.stamina.current, character.stamina.max, 'Stamina');
        this.updateProgressBar(this.elements.stats.mana, character.mana.current, character.mana.max, 'Mana');
        this.updateProgressBar(this.elements.stats.earthMana, character.earthMana.current, character.earthMana.max, 'Earth Mana');
        this.updateProgressBar(this.elements.stats.fireMana, character.fireMana.current, character.fireMana.max, 'Fire Mana');
        this.updateProgressBar(this.elements.stats.airMana, character.airMana.current, character.airMana.max, 'Air Mana');
        this.updateProgressBar(this.elements.stats.waterMana, character.waterMana.current, character.waterMana.max, 'Water Mana');
    },

    /**
     * Updates a progress bar with current and max values
     * @param {HTMLElement} progressBarElement - The progress bar element
     * @param {number} currentValue - Current value of the stat
     * @param {number} maxValue - Maximum value of the stat
     * @param {string} statName - The name of the stat (for display purposes)
     */
    updateProgressBar: function(progressBarElement, currentValue, maxValue, statName) {
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

        // Use cached elements to update resources
        const { gold, research, skins } = this.elements.resources;

        if (gold) {
            gold.textContent = `Gold: ${character.gold}/${character.maxGold}`;
        }
        if (research) {
            research.textContent = `Research: ${character.research}/${character.maxResearch}`;
        }
        if (skins) {
            skins.textContent = `Skins: ${character.skins}/${character.maxSkins}`;
        }
    },

    /**
     * Updates the character profile section with detailed information
     * @param {Object} character - The player character object
     */
    updateCharacterProfile: function(character) {
        if (!character) return;

        const characterSection = this.elements.characterSection;
        if (!characterSection) return;
        
        // Check if the character profile already exists
        let characterProfile = characterSection.querySelector('.character-profile');
        
        if (!characterProfile) {
            // Create the profile structure if it doesn't exist
            characterProfile = document.createElement('div');
            characterProfile.className = 'character-profile card';
            
            const header = document.createElement('div');
            header.className = 'character-header';
            
            const nameElement = document.createElement('h2');
            nameElement.className = 'character-name';
            
            const subtitleElement = document.createElement('div');
            subtitleElement.className = 'character-subtitle';
            
            header.appendChild(nameElement);
            header.appendChild(subtitleElement);
            
            const xpSection = document.createElement('div');
            xpSection.className = 'xp-section';
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar xp-bar';
            
            const progressText = document.createElement('span');
            progressText.className = 'progress-bar-text';
            
            progressBar.appendChild(progressText);
            progressContainer.appendChild(progressBar);
            
            const xpInfo = document.createElement('div');
            xpInfo.className = 'xp-info';
            
            xpSection.appendChild(progressContainer);
            xpSection.appendChild(xpInfo);
            
            characterProfile.appendChild(header);
            characterProfile.appendChild(xpSection);
            
            // Clear and append the new profile
            characterSection.innerHTML = '<h2>Character Profile</h2>';
            characterSection.appendChild(characterProfile);
        }
        
        // Update only the content that needs to change
        const stats = character.displayStats();
        
        // Update name and level
        const nameElement = characterProfile.querySelector('.character-name');
        if (nameElement) nameElement.textContent = stats.name;
        
        const subtitleElement = characterProfile.querySelector('.character-subtitle');
        if (subtitleElement) subtitleElement.textContent = `Level ${stats.level} ${stats.class}`;
        
        // Update XP bar
        const progressBar = characterProfile.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${(stats.xp / stats.xpToNextLevel) * 100}%`;
            
            const progressText = progressBar.querySelector('.progress-bar-text');
            if (progressText) progressText.textContent = `XP: ${stats.xp}/${stats.xpToNextLevel}`;
        }
        
        // Update XP info
        const xpInfo = characterProfile.querySelector('.xp-info');
        if (xpInfo) xpInfo.textContent = `Next level in: ${stats.xpToNextLevel - stats.xp} XP`;
    },

    /**
     * Updates the location info panel when a map location is clicked
     * @param {string} locationName - The name of the clicked location
     * @param {Object} details - The details of the location
     */
    updateLocationInfo: function(locationName, details) {
        const locationInfo = this.elements.locationInfo;
        if (!locationInfo) return;

        if (details) {
            let questsHTML = '';

            if (details.quests && details.quests.length > 0) {
                questsHTML = '<h4>Available Quests:</h4><ul>';
                details.quests.forEach(quest => {
                    questsHTML += `<li>${quest}</li>`;
                });
                questsHTML += '</ul>';
            }

            locationInfo.innerHTML = `
                <h3>${locationName}</h3>
                <p>${details.description}</p>
                ${questsHTML}
            `;
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
        document.querySelectorAll('main section').forEach(section => {
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
        Object.values(this.elements.stats).forEach(progressBarElement => {
            if (!progressBarElement) return;

            const progressText = progressBarElement.querySelector('.progress-bar-text');
            if (progressText) {
                const [current, max] = progressText.textContent.match(/\d+/g).map(Number);
                const percentage = (current / max) * 100;
                progressBarElement.style.width = `${percentage}%`;
            }
        });
    },
};

// Initialize the UIManager when the module loads
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// Export the UIManager for use in other modules
export default UIManager;