// Component.js - Base Component System
// Provides a foundation for component-based architecture

import templateLoader from './TemplateLoader.js';
import GameState from '../managers/GameState.js';

/**
 * Base Component class for creating reusable UI components
 * This enforces separation of HTML and JS by requiring templates to be in external files
 */
class Component {
    /**
     * Create a new component
     * @param {string} id - Unique component ID
     * @param {string} templatePath - Path to HTML template file
     * @param {Element|string} container - Container element or selector
     * @param {Object} options - Additional component options
     */
    constructor(id, templatePath, container, options = {}) {
        this.id = id;
        this.templatePath = templatePath;
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            console.error(`Container not found for component ${id}`);
            return;
        }
        
        this.options = options;
        this.isInitialized = false;
        this.stateSubscription = null;
        this.eventHandlers = new Map();
        
        // Component state (local data)
        this.state = {};
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Load template
            await templateLoader.loadTemplate(this.id, this.templatePath);
            
            // Initial render
            await this.render();
            
            // Subscribe to state changes if specified
            if (this.options.stateBindings) {
                this._setupStateBindings();
            }
            
            this.isInitialized = true;
            
            // Call onInit if defined in subclass
            if (typeof this.onInit === 'function') {
                this.onInit();
            }
        } catch (error) {
            console.error(`Error initializing component ${this.id}:`, error);
        }
    }
    
    /**
     * Render the component
     * @param {Object} additionalData - Additional data to include in rendering
     * @returns {Promise<boolean>} - Success status
     */
    async render(additionalData = {}) {
        if (!this.container) return false;
        
        // Combine state and additional data
        const renderData = {
            ...this.state,
            ...additionalData
        };
        
        // Render using template loader
        const success = await templateLoader.render(this.id, renderData, this.container);
        
        if (success) {
            // Set up event handlers after rendering
            this._setupEventHandlers();
            
            // Call onRender if defined in subclass
            if (typeof this.onRender === 'function') {
                this.onRender();
            }
        }
        
        return success;
    }
    
    /**
     * Update component state and re-render
     * @param {Object} newState - New state properties
     * @param {boolean} shouldRerender - Whether to re-render after state update
     */
    setState(newState, shouldRerender = true) {
        this.state = {
            ...this.state,
            ...newState
        };
        
        if (shouldRerender) {
            this.render();
        }
    }
    
    /**
     * Set up event handlers for elements with data-event attributes
     * @private
     */
    _setupEventHandlers() {
        // Clear previous event handlers
        this.eventHandlers.forEach((handler, key) => {
            const [elementSelector, eventName] = key.split(':');
            const elements = this.container.querySelectorAll(elementSelector);
            
            elements.forEach(element => {
                element.removeEventListener(eventName, handler);
            });
        });
        
        this.eventHandlers.clear();
        
        // Find elements with data-event attributes
        const elements = this.container.querySelectorAll('[data-event]');
        
        elements.forEach(element => {
            const eventData = element.getAttribute('data-event').split(':');
            
            if (eventData.length !== 2) {
                console.error(`Invalid data-event format on element in component ${this.id}`);
                return;
            }
            
            const [eventName, handlerName] = eventData;
            
            // Find handler method on component
            if (typeof this[handlerName] !== 'function') {
                console.error(`Event handler method ${handlerName} not found in component ${this.id}`);
                return;
            }
            
            // Create bound handler
            const handler = this[handlerName].bind(this);
            
            // Add event listener
            element.addEventListener(eventName, handler);
            
            // Store for cleanup
            const key = `${element.tagName.toLowerCase()}[data-event="${element.getAttribute('data-event')}"]:${eventName}`;
            this.eventHandlers.set(key, handler);
        });
    }
    
    /**
     * Set up bindings to GameState
     * @private
     */
    _setupStateBindings() {
        // Unsubscribe previous subscription if exists
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
        }
        
        // Subscribe to state changes
        this.stateSubscription = GameState.subscribe((state, data) => {
            let shouldUpdate = false;
            const bindingsToUpdate = {};
            
            // Check each binding to see if it needs updating
            for (const [componentKey, statePath] of Object.entries(this.options.stateBindings)) {
                const stateValue = this._getNestedProperty(state, statePath);
                
                // Only update if the value has changed
                if (this.state[componentKey] !== stateValue) {
                    bindingsToUpdate[componentKey] = stateValue;
                    shouldUpdate = true;
                }
            }
            
            // Update state and re-render if needed
            if (shouldUpdate) {
                this.setState(bindingsToUpdate);
            }
        });
    }
    
    /**
     * Get a nested property from an object using dot notation
     * @param {Object} obj - Object to get property from
     * @param {string} path - Property path (e.g., "user.profile.name")
     * @returns {*} - Property value or undefined if not found
     * @private
     */
    _getNestedProperty(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);
    }
    
    /**
     * Clean up component resources
     */
    destroy() {
        // Unsubscribe from state
        if (this.stateSubscription) {
            this.stateSubscription.unsubscribe();
            this.stateSubscription = null;
        }
        
        // Remove event handlers
        this.eventHandlers.forEach((handler, key) => {
            const [elementSelector, eventName] = key.split(':');
            const elements = this.container.querySelectorAll(elementSelector);
            
            elements.forEach(element => {
                element.removeEventListener(eventName, handler);
            });
        });
        
        this.eventHandlers.clear();
        
        // Call onDestroy if defined in subclass
        if (typeof this.onDestroy === 'function') {
            this.onDestroy();
        }
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default Component;