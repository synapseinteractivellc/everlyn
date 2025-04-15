// CharacterComponent.js - Character profile component
// Demonstrates separation of HTML and JS using the component system

import Component from '../core/Component.js';
import CharacterManager from '../managers/character-manager.js';

/**
 * Character Component - Displays character profile information
 * @extends Component
 */
class CharacterComponent extends Component {
    /**
     * Create a new character component
     * @param {string} containerId - Container element selector
     */
    constructor(containerId) {
        super(
            'character-profile',         // Component ID
            'character/profile.html',    // Template path (relative to templates directory)
            containerId,                 // Container selector
            {
                // Map component state properties to GameState properties
                stateBindings: {
                    'name': 'character.name',
                    'charClass': 'character.charClass',
                    'level': 'character.level',
                    'xp': 'character.xp',
                    'xpToNextLevel': 'character.xpToNextLevel',
                    'health': 'character.stats.health',
                    'stamina': 'character.stats.stamina',
                    'mana': 'character.stats.mana',
                    'gold': 'character.resources.gold',
                    'research': 'character.resources.research',
                    'skins': 'character.resources.skins'
                }
            }
        );
        
        // Initialize local state
        this.state = {
            name: 'Unknown',
            charClass: 'Waif',
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            health: { current: 10, max: 10 },
            stamina: { current: 10, max: 10 },
            mana: { current: 10, max: 10 },
            gold: { current: 0, max: 10 },
            research: { current: 0, max: 25 },
            skins: { current: 0, max: 10 }
        };
    }
    
    /**
     * Called after the component is initialized
     */
    onInit() {
        console.log('Character component initialized');
    }
    
    /**
     * Called after each render
     */
    onRender() {
        // Update progress bars after rendering
        this._updateProgressBars();
    }
    
    /**
     * Update XP progress bar and other visual elements
     * @private
     */
    _updateProgressBars() {
        // Get progress bar elements
        const xpBar = this.container.querySelector('.xp-bar');
        const healthBar = this.container.querySelector('.health-bar');
        const staminaBar = this.container.querySelector('.stamina-bar');
        const manaBar = this.container.querySelector('.mana-bar');
        
        if (xpBar) {
            const xpPercentage = (this.state.xp / this.state.xpToNextLevel) * 100;
            xpBar.style.width = `${xpPercentage}%`;
        }
        
        if (healthBar && this.state.health) {
            const percentage = (this.state.health.current / this.state.health.max) * 100;
            healthBar.style.width = `${percentage}%`;
        }
        
        if (staminaBar && this.state.stamina) {
            const percentage = (this.state.stamina.current / this.state.stamina.max) * 100;
            staminaBar.style.width = `${percentage}%`;
        }
        
        if (manaBar && this.state.mana) {
            const percentage = (this.state.mana.current / this.state.mana.max) * 100;
            manaBar.style.width = `${percentage}%`;
        }
    }
    
    /**
     * Handle level up button click
     * @param {Event} event - Click event
     */
    handleLevelUp(event) {
        event.preventDefault();
        
        // Add enough XP to level up
        const xpNeeded = this.state.xpToNextLevel - this.state.xp;
        CharacterManager.addExperience(xpNeeded);
        
        // No need to manually update state or re-render
        // The GameState subscription will handle that
    }
    
    /**
     * Handle resource gain button click
     * @param {Event} event - Click event
     */
    handleAddResource(event) {
        const resourceType = event.target.getAttribute('data-resource');
        if (resourceType) {
            CharacterManager.updateResource(resourceType, 1);
        }
    }
}

export default CharacterComponent;