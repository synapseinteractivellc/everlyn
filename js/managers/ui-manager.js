// ui-manager.js - Comprehensive UI Management
// This module handles all UI updates throughout the application
// It centralizes UI updates to ensure consistency and reduce code duplication

import GameState from './GameState.js';
import LocationService from '../services/LocationService.js';
import DOMCache from './DOMCache.js';
import TemplateLoader from '../core/TemplateLoader.js'; // Updated import
import ErrorUtils from '../utils/ErrorUtils.js';
import { ErrorCodes } from '../utils/ErrorUtils.js';
import GameConfig from '../config.js';

/**
 * UIManager - Handles all UI updates throughout the application
 * This centralized approach helps maintain consistency and reduces code duplication
 */
const UIManager = {
    /**
     * Map of bindings (property -> elements)
     * @private
     */
    _bindings: new Map(),

    /**
     * Initialize the UI manager
     */
    init: function() {
        // Initialize progress bars on page load
        this.initProgressBars();
        
        // Set up data binding
        this.initDataBinding();
        
        // Subscribe to GameState changes
        GameState.subscribe(this.handleStateChange.bind(this));
        
        // Set animation speed from config
        this.animationSpeed = GameConfig.ui.progressBarAnimationSpeed || 300;
    },
    
    /**
     * Initialize data binding between DOM and GameState
     */
    initDataBinding: function() {
        ErrorUtils.tryCatch(() => {
            // Find all elements with data-bind attribute
            const bindElements = document.querySelectorAll('[data-bind]');
            
            // Group elements by their binding property
            bindElements.forEach(element => {
                const property = element.getAttribute('data-bind');
                
                if (!this._bindings.has(property)) {
                    this._bindings.set(property, []);
                }
                
                this._bindings.get(property).push(element);
            });
            
            // Find all elements with data-bind-width attribute (for progress bars)
            const widthBindElements = document.querySelectorAll('[data-bind-width]');
            
            widthBindElements.forEach(element => {
                const property = element.getAttribute('data-bind-width');
                const bindKey = `width:${property}`;
                
                if (!this._bindings.has(bindKey)) {
                    this._bindings.set(bindKey, []);
                }
                
                this._bindings.get(bindKey).push(element);
            });
            
            console.log(`Data binding initialized with ${this._bindings.size} binding types`);
        }, 'UIManager.initDataBinding');
    },
    
    /**
     * Handle state changes from GameState
     * @param {Object} state - The current game state
     * @param {Object} data - Change event data
     */
    handleStateChange: function(state, data) {
        ErrorUtils.tryCatch(() => {
            // Update bindings based on state changes
            this.updateBindings(state);
            
            // Handle other state-dependent UI updates
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
        }, 'UIManager.handleStateChange');
    },
    
    /**
     * Update data-bound elements based on state
     * @param {Object} state - Current game state
     */
    updateBindings: function(state) {
        ErrorUtils.tryCatch(() => {
            // Update currentLocation bindings
            if (this._bindings.has('currentLocation')) {
                const locationValue = state.currentLocation || 'Unknown';
                this._bindings.get('currentLocation').forEach(element => {
                    element.textContent = locationValue;
                });
            }
            
            // Update character name bindings
            if (state.character && this._bindings.has('character.name')) {
                this._bindings.get('character.name').forEach(element => {
                    element.textContent = state.character.name;
                });
            }
            
            // Update character class bindings
            if (state.character && this._bindings.has('character.charClass')) {
                this._bindings.get('character.charClass').forEach(element => {
                    element.textContent = state.character.charClass;
                });
            }
            
            // Update character level bindings
            if (state.character && this._bindings.has('character.level')) {
                this._bindings.get('character.level').forEach(element => {
                    element.textContent = state.character.level;
                });
            }
            
            // Update stats bindings
            if (state.character) {
                this.updateStatsBindings(state.character);
            }
            
            // Update resources bindings
            if (state.character) {
                this.updateResourceBindings(state.character);
            }
            
            // Update location quests if location is set
            if (state.currentLocation && this._bindings.has('locationQuests')) {
                const quests = LocationService.getLocationQuests(state.currentLocation);
                this._bindings.get('locationQuests').forEach(element => {
                    if (quests.length > 0) {
                        element.innerHTML = '<ul>' + 
                            quests.map(quest => `<li>${quest}</li>`).join('') + 
                            '</ul>';
                    } else {
                        element.textContent = 'No quests available in this area yet.';
                    }
                });
            }
        }, 'UIManager.updateBindings');
    },
    
    /**
     * Update stats-related bindings
     * @param {Object} character - Character object
     */
    updateStatsBindings: function(character) {
        ErrorUtils.tryCatch(() => {
            // Update health bindings
            if (this._bindings.has('character.stats.health')) {
                const health = character.stats.health;
                this._bindings.get('character.stats.health').forEach(element => {
                    element.textContent = `Health: ${health.current}/${health.max}`;
                });
            }
            
            // Update stamina bindings
            if (this._bindings.has('character.stats.stamina')) {
                const stamina = character.stats.stamina;
                this._bindings.get('character.stats.stamina').forEach(element => {
                    element.textContent = `Stamina: ${stamina.current}/${stamina.max}`;
                });
            }
            
            // Update mana bindings
            if (this._bindings.has('character.stats.mana')) {
                const mana = character.stats.mana;
                this._bindings.get('character.stats.mana').forEach(element => {
                    element.textContent = `Mana: ${mana.current}/${mana.max}`;
                });
            }
            
            // Update elemental mana bindings
            this.updateElementalManaBindings(character);
            
            // Update width bindings for progress bars
            this.updateProgressBarWidths(character);
        }, 'UIManager.updateStatsBindings');
    },
    
    /**
     * Update elemental mana bindings
     * @param {Object} character - Character object
     */
    updateElementalManaBindings: function(character) {
        ErrorUtils.tryCatch(() => {
            // Update earth mana bindings
            if (this._bindings.has('character.elementalMana.earth')) {
                const earthMana = character.elementalMana.earth;
                this._bindings.get('character.elementalMana.earth').forEach(element => {
                    element.textContent = `Earth Mana: ${earthMana.current}/${earthMana.max}`;
                });
            }
            
            // Update fire mana bindings
            if (this._bindings.has('character.elementalMana.fire')) {
                const fireMana = character.elementalMana.fire;
                this._bindings.get('character.elementalMana.fire').forEach(element => {
                    element.textContent = `Fire Mana: ${fireMana.current}/${fireMana.max}`;
                });
            }
            
            // Update air mana bindings
            if (this._bindings.has('character.elementalMana.air')) {
                const airMana = character.elementalMana.air;
                this._bindings.get('character.elementalMana.air').forEach(element => {
                    element.textContent = `Air Mana: ${airMana.current}/${airMana.max}`;
                });
            }
            
            // Update water mana bindings
            if (this._bindings.has('character.elementalMana.water')) {
                const waterMana = character.elementalMana.water;
                this._bindings.get('character.elementalMana.water').forEach(element => {
                    element.textContent = `Water Mana: ${waterMana.current}/${waterMana.max}`;
                });
            }
        }, 'UIManager.updateElementalManaBindings');
    },
    
    /**
     * Update resource bindings
     * @param {Object} character - Character object
     */
    updateResourceBindings: function(character) {
        ErrorUtils.tryCatch(() => {
            // Update gold bindings
            if (this._bindings.has('character.resources.gold')) {
                const gold = character.resources.gold;
                this._bindings.get('character.resources.gold').forEach(element => {
                    element.textContent = `Gold: ${gold.current}/${gold.max}`;
                });
            }
            
            // Update research bindings
            if (this._bindings.has('character.resources.research')) {
                const research = character.resources.research;
                this._bindings.get('character.resources.research').forEach(element => {
                    element.textContent = `Research: ${research.current}/${research.max}`;
                });
            }
            
            // Update skins bindings
            if (this._bindings.has('character.resources.skins')) {
                const skins = character.resources.skins;
                this._bindings.get('character.resources.skins').forEach(element => {
                    element.textContent = `Skins: ${skins.current}/${skins.max}`;
                });
            }
        }, 'UIManager.updateResourceBindings');
    },
    
    /**
     * Update progress bar widths based on percentages
     * @param {Object} character - Character object
     */
    updateProgressBarWidths: function(character) {
        ErrorUtils.tryCatch(() => {
            // Health bar
            if (this._bindings.has('width:character.stats.health.percentage')) {
                const percentage = character.stats.health.getPercentage();
                this._bindings.get('width:character.stats.health.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Stamina bar
            if (this._bindings.has('width:character.stats.stamina.percentage')) {
                const percentage = character.stats.stamina.getPercentage();
                this._bindings.get('width:character.stats.stamina.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Mana bar
            if (this._bindings.has('width:character.stats.mana.percentage')) {
                const percentage = character.stats.mana.getPercentage();
                this._bindings.get('width:character.stats.mana.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Earth mana bar
            if (this._bindings.has('width:character.elementalMana.earth.percentage')) {
                const percentage = character.elementalMana.earth.getPercentage();
                this._bindings.get('width:character.elementalMana.earth.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Fire mana bar
            if (this._bindings.has('width:character.elementalMana.fire.percentage')) {
                const percentage = character.elementalMana.fire.getPercentage();
                this._bindings.get('width:character.elementalMana.fire.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Air mana bar
            if (this._bindings.has('width:character.elementalMana.air.percentage')) {
                const percentage = character.elementalMana.air.getPercentage();
                this._bindings.get('width:character.elementalMana.air.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
            
            // Water mana bar
            if (this._bindings.has('width:character.elementalMana.water.percentage')) {
                const percentage = character.elementalMana.water.getPercentage();
                this._bindings.get('width:character.elementalMana.water.percentage').forEach(element => {
                    this.animateProgressBar(element, percentage);
                });
            }
        }, 'UIManager.updateProgressBarWidths');
    },
    
    /**
     * Animate a progress bar to a specific percentage
     * @param {Element} element - Progress bar element
     * @param {number} percentage - Target percentage
     */
    animateProgressBar: function(element, percentage) {
        const currentWidth = parseFloat(element.style.width) || 0;
        
        // Only animate if the difference is significant
        if (Math.abs(percentage - currentWidth) > 1) {
            // Set transition if needed
            if (this.animationSpeed > 0 && element.style.transition === '') {
                element.style.transition = `width ${this.animationSpeed}ms ease-in-out`;
            }
            
            element.style.width = `${percentage}%`;
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
            ErrorUtils.logError(
                ErrorUtils.createError(
                    'Element with id "player-name-display" not found.',
                    ErrorCodes.ELEMENT_NOT_FOUND
                ),
                'UIManager.updatePlayerNameDisplay',
                ErrorUtils.LogLevel.WARN
            );
        }
    },

    /**
     * Updates all progress bars for player stats
     * @param {Object} character - The player character object
     */
    updateStatBars: function(character) {
        if (!character) return;

        // Use cached elements to update progress bars
        this.updateProgressBar('stats.health', character.health, 'Health');
        this.updateProgressBar('stats.stamina', character.stamina, 'Stamina');
        this.updateProgressBar('stats.mana', character.mana, 'Mana');
        this.updateProgressBar('stats.earthMana', character.earthMana, 'Earth Mana');
        this.updateProgressBar('stats.fireMana', character.fireMana, 'Fire Mana');
        this.updateProgressBar('stats.airMana', character.airMana, 'Air Mana');
        this.updateProgressBar('stats.waterMana', character.waterMana, 'Water Mana');
    },

    /**
     * Updates a progress bar with current and max values
     * @param {string} progressBarSelector - Selector for the progress bar element
     * @param {Object} statResource - StatResource object with current and max values
     * @param {string} statName - The name of the stat (for display purposes)
     */
    updateProgressBar: function(progressBarSelector, statResource, statName) {
        const progressBarElement = DOMCache.get(progressBarSelector);
        if (!progressBarElement) return;

        // Calculate the percentage using StatResource
        const percentage = statResource.getPercentage();

        // Update the width of the progress bar with animation
        const currentWidth = parseFloat(progressBarElement.style.width) || 0;
        
        // Only animate if the difference is significant
        if (Math.abs(percentage - currentWidth) > 1) {
            // Set transition if needed
            if (this.animationSpeed > 0 && progressBarElement.style.transition === '') {
                progressBarElement.style.transition = `width ${this.animationSpeed}ms ease-in-out`;
            }
            
            progressBarElement.style.width = `${percentage}%`;
        }

        // Update the text inside the progress bar
        const progressText = progressBarElement.querySelector('.progress-bar-text');
        if (progressText) {
            progressText.textContent = `${statName}: ${statResource.current}/${statResource.max}`;
        }
    },

    /**
     * Updates the resources display in the sidebar
     * @param {Object} character - The player character object
     */
    updateResources: function(character) {
        if (!character) return;

        // Update each resource
        this.updateResource(
            'resources.gold', 
            'Gold', 
            character.resources.gold.current, 
            character.resources.gold.max
        );
        this.updateResource(
            'resources.research', 
            'Research', 
            character.resources.research.current, 
            character.resources.research.max
        );
        this.updateResource(
            'resources.skins', 
            'Skins', 
            character.resources.skins.current, 
            character.resources.skins.max
        );
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
    updateCharacterProfile: async function(character) {
        if (!character) return;

        ErrorUtils.tryCatch(async () => {
            const characterSection = DOMCache.get('character');
            if (!characterSection) return;

            // Check if the character profile already exists
            let characterProfile = characterSection.querySelector('.character-profile');

            if (!characterProfile) {
                // Use TemplateLoader to load and render the profile structure
                const templateLoaded = await TemplateLoader.render(
                    'characterProfile', // Template ID
                    character.displayStats(), // Data for the template
                    characterSection // Container element
                );

                if (!templateLoaded) {
                    console.error('Failed to load character profile template.');
                    return;
                }

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
                const xpPercentage = (stats.xp / stats.xpToNextLevel) * 100;
                progressBar.style.width = `${xpPercentage}%`;

                const progressText = progressBar.querySelector('.progress-bar-text');
                if (progressText) progressText.textContent = `XP: ${stats.xp}/${stats.xpToNextLevel}`;
            }

            // Update XP info
            const xpInfo = DOMCache.get('xpInfo') || characterSection.querySelector('.xp-info');
            if (xpInfo) xpInfo.textContent = `Next level in: ${stats.xpToNextLevel - stats.xp} XP`;
        }, 'UIManager.updateCharacterProfile');
    },

    /**
     * Updates the location info panel when a map location is clicked
     * @param {string} locationName - The name of the clicked location
     * @param {Object} details - The details of the location
     */
    updateLocationInfo: async function(locationName, details) {
        const locationInfo = DOMCache.get('locationInfo');
        if (!locationInfo) return;

        ErrorUtils.tryCatch(async () => {
            if (details) {
                // Use TemplateLoader to render location info
                const templateLoaded = await TemplateLoader.render(
                    'locationInfo', // Template ID
                    {
                        locationName,
                        description: details.description,
                        quests: details.quests || []
                    },
                    locationInfo // Container element
                );

                if (!templateLoaded) {
                    console.error('Failed to load location info template.');
                }
            } else {
                // Get details from LocationService if not provided
                const locationDetails = LocationService.getLocationDetails(locationName);
                if (locationDetails) {
                    const templateLoaded = await TemplateLoader.render(
                        'locationInfo', // Template ID
                        {
                            locationName,
                            description: locationDetails.description,
                            quests: locationDetails.quests || []
                        },
                        locationInfo // Container element
                    );

                    if (!templateLoaded) {
                        console.error('Failed to load location info template.');
                    }
                } else {
                    // Fallback for locations without details
                    locationInfo.innerHTML = `
                        <h3>${locationName}</h3>
                        <p>You are now at the ${locationName}. Explore this area to discover quests and resources.</p>
                    `;
                }
            }
        }, 'UIManager.updateLocationInfo');
    },

    /**
     * Shows/hides tab content
     * @param {string} sectionId - The ID of the section to show
     */
    showTab: function(sectionId) {
        ErrorUtils.tryCatch(() => {
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                section.style.display = section.id === sectionId ? 'block' : 'none';
            });

            // Update active tab button
            const tabButtons = DOMCache.getAll('tabButtons');
            tabButtons.forEach(button => {
                const tabId = button.getAttribute('data-tab');
                if (tabId === sectionId) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }, 'UIManager.showTab');
    },

    /**
     * Updates all UI elements at once with the current character data
     * @param {Object} character - The player character object
     */
    updateAllUI: function(character) {
        if (!character) return;

        // Update bindings from character data
        this.updateBindings(GameState);
        
        // Legacy updates for backward compatibility
        this.updatePlayerNameDisplay(character.name);
        this.updateStatBars(character);
        this.updateResources(character);
        this.updateCharacterProfile(character);
    },

    /**
     * Initializes progress bars on page load
     */
    initProgressBars: function() {
        ErrorUtils.tryCatch(() => {
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
        }, 'UIManager.initProgressBars');
    },
    
    /**
     * Shows a notification message to the user
     * @param {string} message - Message to display
     * @param {string} type - Message type (info, success, warning, error)
     * @param {number} [duration=3000] - How long to show the message (ms)
     */
    showNotification: function(message, type = 'info', duration = 3000) {
        // Implementation for showing notifications to the user
        // This would create a temporary element to display the message
        ErrorUtils.tryCatch(() => {
            // Check if notification container exists
            let container = document.querySelector('.notification-container');
            
            // Create container if it doesn't exist
            if (!container) {
                container = document.createElement('div');
                container.className = 'notification-container';
                document.body.appendChild(container);
                
                // Add styles if needed
                const style = document.createElement('style');
                style.textContent = `
                    .notification-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                    }
                    .notification {
                        padding: 10px 20px;
                        margin-bottom: 10px;
                        border-radius: 4px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        opacity: 0;
                        transform: translateX(100%);
                        transition: all 0.3s ease-in-out;
                    }
                    .notification.show {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    .notification.info { background-color: #e3f2fd; color: #0d47a1; }
                    .notification.success { background-color: #e8f5e9; color: #1b5e20; }
                    .notification.warning { background-color: #fff8e1; color: #ff6f00; }
                    .notification.error { background-color: #ffebee; color: #b71c1c; }
                `;
                document.head.appendChild(style);
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            // Add to container
            container.appendChild(notification);
            
            // Trigger animation
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Remove after duration
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }, 'UIManager.showNotification');
    }
};

// Initialize the UIManager when the module loads
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// Export the UIManager for use in other modules
export default UIManager;