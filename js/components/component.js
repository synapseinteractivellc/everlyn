/**
 * Base Component class
 * Provides a foundation for all game components
 */
class Component {
    /**
     * Create a new component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     */
    constructor(id, options = {}) {
        this.id = id;
        this.eventListeners = {};
        this.children = new Map();
        this.parent = null;
        this.state = { ...options };
        
        // Create DOM element if element selector is provided
        if (options.element) {
            this.setElement(options.element);
        }
    }
    
    /**
     * Set the component's DOM element
     * @param {string|HTMLElement} element - Element selector or DOM element
     */
    setElement(element) {
        if (typeof element === 'string') {
            this.element = document.querySelector(element);
        } else if (element instanceof HTMLElement) {
            this.element = element;
        } else {
            console.error(`Invalid element type for component ${this.id}`);
        }
        
        // Set data-component-id attribute for debugging purposes
        if (this.element) {
            this.element.setAttribute('data-component-id', this.id);
        }
    }
    
    /**
     * Get the component's state
     * @returns {Object} - Component state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Update component state and trigger render
     * @param {Object} updates - State updates
     * @param {boolean} render - Whether to trigger a render
     * @returns {Component} - This component instance for chaining
     */
    setState(updates, render = true) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Trigger change event with previous and current state
        this.trigger('state:change', { 
            prevState, 
            currentState: this.state,
            changes: updates
        });
        
        // Render if needed
        if (render) {
            this.render();
        }
        
        return this;
    }
    
    /**
     * Add an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @returns {Component} - This component instance for chaining
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
        return this;
    }
    
    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback to remove
     * @returns {Component} - This component instance for chaining
     */
    off(event, callback) {
        if (!this.eventListeners[event]) return this;
        
        if (callback) {
            // Remove specific callback
            this.eventListeners[event] = this.eventListeners[event]
                .filter(cb => cb !== callback);
        } else {
            // Remove all callbacks for event
            this.eventListeners[event] = [];
        }
        
        return this;
    }
    
    /**
     * Trigger an event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     * @returns {Component} - This component instance for chaining
     */
    trigger(event, ...args) {
        if (!this.eventListeners[event]) return this;
        
        // Call all callbacks for this event
        this.eventListeners[event].forEach(callback => {
            try {
                callback.apply(this, args);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
        
        return this;
    }
    
    /**
     * Add a child component
     * @param {Component} component - Child component
     * @returns {Component} - This component instance for chaining
     */
    addChild(component) {
        if (!(component instanceof Component)) {
            console.error('Child must be an instance of Component');
            return this;
        }
        
        // Set parent reference
        component.parent = this;
        
        // Add to children map
        this.children.set(component.id, component);
        
        // Trigger events
        this.trigger('child:add', component);
        component.trigger('parent:set', this);
        
        return this;
    }
    
    /**
     * Remove a child component
     * @param {string|Component} component - Child component or ID
     * @returns {Component} - This component instance for chaining
     */
    removeChild(component) {
        const id = component instanceof Component ? component.id : component;
        const child = this.children.get(id);
        
        if (!child) return this;
        
        // Clear parent reference
        child.parent = null;
        
        // Remove from children map
        this.children.delete(id);
        
        // Trigger events
        this.trigger('child:remove', child);
        child.trigger('parent:unset', this);
        
        return this;
    }
    
    /**
     * Get a child component by ID
     * @param {string} id - Child component ID
     * @returns {Component|undefined} - Child component or undefined if not found
     */
    getChild(id) {
        return this.children.get(id);
    }
    
    /**
     * Initialize the component
     * Override in subclasses
     * @returns {Component} - This component instance for chaining
     */
    initialize() {
        return this;
    }
    
    /**
     * Render the component
     * Override in subclasses
     * @returns {Component} - This component instance for chaining
     */
    render() {
        return this;
    }
    
    /**
     * Update the component
     * Override in subclasses
     * @param {number} deltaTime - Time since last update in milliseconds
     * @returns {Component} - This component instance for chaining
     */
    update(deltaTime) {
        return this;
    }
    
    /**
     * Destroy the component and clean up resources
     * @returns {Component} - This component instance for chaining
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners = {};
        
        // Remove all children
        this.children.forEach(child => {
            child.destroy();
        });
        this.children.clear();
        
        // Remove from parent
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        // Trigger destroy event
        this.trigger('destroy');
        
        return this;
    }
    
    /**
     * Serialize component state
     * @returns {Object} - Serialized component state
     */
    serialize() {
        const serialized = {
            id: this.id,
            state: this.getState(),
            children: {}
        };
        
        // Serialize children
        this.children.forEach(child => {
            serialized.children[child.id] = child.serialize();
        });
        
        return serialized;
    }
    
    /**
     * Deserialize component state
     * @param {Object} data - Serialized component state
     * @returns {Component} - This component instance for chaining
     */
    deserialize(data) {
        if (data.id !== this.id) {
            console.error(`ID mismatch during deserialization: ${data.id} vs ${this.id}`);
            return this;
        }
        
        // Restore state
        this.state = { ...data.state };
        
        // Restore children
        if (data.children) {
            Object.keys(data.children).forEach(childId => {
                const child = this.getChild(childId);
                if (child) {
                    child.deserialize(data.children[childId]);
                }
            });
        }
        
        return this;
    }
}