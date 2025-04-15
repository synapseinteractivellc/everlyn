// ResourceBarComponent.js - Resource display component
// Shows a single resource with current/max values

import Component from '../core/Component.js';
import CharacterManager from '../managers/character-manager.js';

/**
 * Resource Bar Component - Displays a game resource
 * @extends Component
 */
class ResourceBarComponent extends Component {
    /**
     * Create a new resource bar component
     * @param {string} containerId - Container element selector
     * @param {Object} options - Component options
     * @param {string} options.resourceType - Type of resource (gold, research, skins)
     * @param {string} options.icon - Icon name
     * @param {string} options.color - Bar color
     */
    constructor(containerId, options) {
        super(
            `resource-${options.resourceType}`,         // Component ID
            'components/resource-bar.html',             // Template path
            containerId,                                // Container selector
            {
                // Map component state properties to GameState properties
                stateBindings: {
                    'current': `character.resources.${options.resourceType}.current`,
                    'max': `character.resources.${options.resourceType}.max`
                }
            }
        );
        
        // Set initial state
        this.state = {
            resourceType: options.resourceType,
            icon: options.icon || 'circle',
            color: options.color || '#007bff',
            current: 0,
            max: 10,
            displayName: this._getDisplayName(options.resourceType)
        };
    }
    
    /**
     * Get formatted display name for resource
     * @param {string} resourceType - Resource type
     * @returns {string} - Formatted display name
     * @private
     */
    _getDisplayName(resourceType) {
        // Capitalize first letter
        return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
    }
    
    /**
     * Called after the component is rendered
     */
    onRender() {
        // Update progress bar styling
        const progressBar = this.container.querySelector(`.resource-bar-${this.state.resourceType}`);
        if (progressBar) {
            // Calculate percentage
            const percentage = this.state.max > 0 
                ? (this.state.current / this.state.max) * 100 
                : 0;
                
            // Set bar width and color
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = this.state.color;
        }
    }
    
    /**
     * Handle add resource button click
     * @param {Event} event - Click event
     */
    handleAddResource(event) {
        CharacterManager.updateResource(this.state.resourceType, 1);
    }
}

export default ResourceBarComponent;