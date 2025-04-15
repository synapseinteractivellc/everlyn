// StatBarComponent.js - Character stat display component
// Shows a single stat with current/max values and progress bar

import Component from '../core/Component.js';
import CharacterManager from '../managers/character-manager.js';
import ResourceBarComponent from './ResourceBarComponent.js';

/**
 * Stat Bar Component - Displays a character stat
 * @extends Component
 */
class StatBarComponent extends Component {
    /**
     * Create a new stat bar component
     * @param {string} containerId - Container element selector
     * @param {Object} options - Component options
     * @param {string} options.statType - Type of stat (health, stamina, mana)
     * @param {string} options.icon - Icon name
     * @param {string} options.color - Bar color
     */
    constructor(containerId, options) {
        super(
            `stat-${options.statType}`,         // Component ID
            'components/stat-bar.html',         // Template path
            containerId,                        // Container selector
            {
                // Map component state properties to GameState properties
                stateBindings: {
                    'current': `character.stats.${options.statType}.current`,
                    'max': `character.stats.${options.statType}.max`
                }
            }
        );
        
        // Set initial state
        this.state = {
            statType: options.statType,
            icon: options.icon || 'circle',
            color: options.color || '#007bff',
            current: 0,
            max: 10,
            displayName: this._getDisplayName(options.statType)
        };
    }
    
    /**
     * Get formatted display name for stat
     * @param {string} statType - Stat type
     * @returns {string} - Formatted display name
     * @private
     */
    _getDisplayName(statType) {
        // Capitalize first letter
        return statType.charAt(0).toUpperCase() + statType.slice(1);
    }
    
    /**
     * Called after the component is rendered
     */
    onRender() {
        // Update progress bar styling
        const progressBar = this.container.querySelector(`.stat-bar-${this.state.statType}`);
        if (progressBar) {
            // Calculate percentage
            const percentage = this.state.max > 0 
                ? (this.state.current / this.state.max) * 100 
                : 0;
                
            // Set bar width and color
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = this.state.color;
            
            // Update text
            const textElement = progressBar.querySelector('.progress-bar-text');
            if (textElement) {
                textElement.textContent = `${this.state.current}/${this.state.max}`;
            }
        }
    }
    
    /**
     * Handle restore stat button click
     * @param {Event} event - Click event
     */
    handleRestoreStat(event) {
        // Restore the stat to its maximum value
        CharacterManager.updateStat(this.state.statType, this.state.max - this.state.current);
    }
}


export default StatBarComponent;