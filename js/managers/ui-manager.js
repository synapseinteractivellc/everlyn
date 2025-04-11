// ui-manager.js - Comprehensive UI Management

/**
 * UIManager - Handles all UI updates throughout the application
 * This centralized approach helps maintain consistency and reduces code duplication
 */
const UIManager = {
    /**
     * Updates the player name display in the header
     * @param {string} playerName - The name of the player
     */
    updatePlayerNameDisplay: function(playerName) {
        const playerNameDisplay = document.getElementById('player-name-display');
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
        
        // Update all stat bars using the stats.js utility function
        this.updateProgressBar('health', character.health.current, character.health.max);
        this.updateProgressBar('stamina', character.stamina.current, character.stamina.max);
        this.updateProgressBar('mana', character.mana.current, character.mana.max);
        this.updateProgressBar('earth-mana', character.earthMana.current, character.earthMana.max);
        this.updateProgressBar('fire-mana', character.fireMana.current, character.fireMana.max);
        this.updateProgressBar('air-mana', character.airMana.current, character.airMana.max);
        this.updateProgressBar('water-mana', character.waterMana.current, character.waterMana.max);
    },
    
    /**
     * Updates a progress bar with current and max values
     * @param {string} statName - The name of the stat (used in class names)
     * @param {number} currentValue - Current value of the stat
     * @param {number} maxValue - Maximum value of the stat
     */
    updateProgressBar: function(statName, currentValue, maxValue) {
        // Calculate the percentage
        const percentage = (currentValue / maxValue) * 100;
        
        // Find the progress bar container
        const progressContainer = document.querySelector(`.stat-item:has(.${statName}-bar) .progress-container`);
        
        if (progressContainer) {
            // Find the progress bar element
            const progressBar = progressContainer.querySelector(`.${statName}-bar`);
            
            // Find the text element
            const progressText = progressContainer.querySelector('.progress-bar-text');
            
            if (progressBar) {
                // Update the width based on the percentage
                progressBar.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                // Update the text with the stat name and values
                progressText.textContent = `${statName.charAt(0).toUpperCase() + statName.slice(1).replace('-', ' ')}: ${currentValue}/${maxValue}`;
            }
        }
    },
    
    /**
     * Updates the resources display in the sidebar
     * @param {Object} character - The player character object
     */
    updateResources: function(character) {
        if (!character) return;
        
        // Update resource displays with null checks
        const goldElement = document.querySelector('.resource-item:nth-child(1)');
        if (goldElement) {
            goldElement.textContent = `Gold: ${character.gold}/${character.maxGold}`;
        }
        
        const researchElement = document.querySelector('.resource-item:nth-child(2)');
        if (researchElement) {
            researchElement.textContent = `Research: ${character.research}/${character.maxResearch}`;
        }
        
        const skinsElement = document.querySelector('.resource-item:nth-child(3)');
        if (skinsElement) {
            skinsElement.textContent = `Skins: ${character.skins}/${character.maxSkins}`;
        }
    },
    
    /**
     * Updates the character profile section with detailed information
     * @param {Object} character - The player character object
     */
    updateCharacterProfile: function(character) {
        if (!character) return;
        
        const characterSection = document.getElementById('character');
        if (characterSection) {
            const stats = character.displayStats();
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
    },
    
    /**
     * Updates the location info panel when a map location is clicked
     * @param {string} locationName - The name of the clicked location
     * @param {Object} details - The details of the location
     */
    updateLocationInfo: function(locationName, details) {
        const locationInfo = document.querySelector('.location-info');
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
        const statItems = document.querySelectorAll('.stat-item');
        
        statItems.forEach(item => {
            // Find the progress bar
            const progressBar = item.querySelector('.progress-bar');
            if (!progressBar) return;
            
            // Get the stat name from the progress bar class
            const classNames = progressBar.className.split(' ');
            const barClassName = classNames.find(className => className.endsWith('-bar'));
            if (!barClassName) return;
            
            const statName = barClassName.replace('-bar', '');
            
            // Get the text element
            const progressText = item.querySelector('.progress-bar-text');
            if (progressText) {
                // Parse current/max values from the text
                const textContent = progressText.textContent;
                const valuesPart = textContent.split(':')[1]?.trim() || '';
                const values = valuesPart.split('/');
                
                if (values.length === 2) {
                    const currentValue = parseInt(values[0], 10);
                    const maxValue = parseInt(values[1], 10);
                    
                    // Set initial width
                    const percentage = (currentValue / maxValue) * 100;
                    progressBar.style.width = `${percentage}%`;
                }
            }
        });
    }
};

// Export the UIManager for use in other modules
export default UIManager;