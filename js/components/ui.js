/**
 * UI Component
 * Base class for UI components with template rendering
 */
class UIComponent extends Component {
    /**
     * Create a new UI component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     * @param {string} options.template - Template name to render
     * @param {string|HTMLElement} options.container - Container element or selector
     * @param {boolean} options.autoRender - Whether to render on initialization
     */
    constructor(id, options = {}) {
        super(id, options);
        
        this.template = options.template;
        this.container = options.container;
        this.autoRender = options.autoRender !== false;
        this.events = options.events || {};
        
        // Initialize if autoRender is true
        if (this.autoRender) {
            this.initialize();
        }
    }
    
    /**
     * Initialize the component
     * @returns {UIComponent} - This component instance for chaining
     */
    initialize() {
        // Find container element
        if (typeof this.container === 'string') {
            this.containerElement = document.querySelector(this.container);
        } else if (this.container instanceof HTMLElement) {
            this.containerElement = this.container;
        }
        
        if (!this.containerElement) {
            console.error(`Container not found for component ${this.id}`);
            return this;
        }
        
        // Initial render
        this.render();
        
        // Bind events
        this.bindEvents();
        
        return this;
    }
    
    /**
     * Render the component
     * @returns {UIComponent} - This component instance for chaining
     */
    render() {
        if (!this.containerElement || !this.template) {
            return this;
        }
        
        // Render template with component state
        const html = templateLoader.render(this.template, {
            ...this.state,
            id: this.id
        });
        
        // Update container
        this.containerElement.innerHTML = html;
        
        // Update component element reference
        this.setElement(this.containerElement.querySelector(`[data-component-id="${this.id}"]`) || this.containerElement);
        
        // Trigger render event
        this.trigger('render');
        
        // Rebind events after render
        this.bindEvents();
        
        return this;
    }
    
    /**
     * Bind DOM events
     * @returns {UIComponent} - This component instance for chaining
     */
    bindEvents() {
        if (!this.element || !this.events) {
            return this;
        }
        
        // Unbind existing events first
        this.unbindEvents();
        
        // Bind events defined in options
        Object.keys(this.events).forEach(eventSelector => {
            const [eventName, selector] = eventSelector.split(' ');
            const handler = this.events[eventSelector];
            
            if (!eventName) {
                return;
            }
            
            // If selector is provided, delegate event
            if (selector) {
                const elements = this.element.querySelectorAll(selector);
                
                elements.forEach(element => {
                    element.addEventListener(eventName, (event) => {
                        // Call handler with component context
                        if (typeof handler === 'function') {
                            handler.call(this, event, element);
                        } else if (typeof this[handler] === 'function') {
                            this[handler].call(this, event, element);
                        }
                    });
                    
                    // Store reference for cleanup
                    if (!element._boundEvents) {
                        element._boundEvents = [];
                    }
                    element._boundEvents.push({ eventName, handler });
                });
            } else {
                // Bind directly to component element
                this.element.addEventListener(eventName, (event) => {
                    // Call handler with component context
                    if (typeof handler === 'function') {
                        handler.call(this, event, this.element);
                    } else if (typeof this[handler] === 'function') {
                        this[handler].call(this, event, this.element);
                    }
                });
                
                // Store reference for cleanup
                if (!this.element._boundEvents) {
                    this.element._boundEvents = [];
                }
                this.element._boundEvents.push({ eventName, handler });
            }
        });
        
        return this;
    }
    
    /**
     * Unbind DOM events
     * @returns {UIComponent} - This component instance for chaining
     */
    unbindEvents() {
        if (!this.element) {
            return this;
        }
        
        // Clean up events on component element
        if (this.element._boundEvents) {
            this.element._boundEvents.forEach(({ eventName, handler }) => {
                this.element.removeEventListener(eventName, handler);
            });
            this.element._boundEvents = [];
        }
        
        // Clean up events on child elements
        const elements = this.element.querySelectorAll('[data-component-id]');
        elements.forEach(element => {
            if (element._boundEvents) {
                element._boundEvents.forEach(({ eventName, handler }) => {
                    element.removeEventListener(eventName, handler);
                });
                element._boundEvents = [];
            }
        });
        
        return this;
    }
    
    /**
     * Show the component
     * @returns {UIComponent} - This component instance for chaining
     */
    show() {
        if (this.element) {
            this.element.style.display = '';
            this.trigger('show');
        }
        return this;
    }
    
    /**
     * Hide the component
     * @returns {UIComponent} - This component instance for chaining
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.trigger('hide');
        }
        return this;
    }
    
    /**
     * Toggle component visibility
     * @returns {UIComponent} - This component instance for chaining
     */
    toggle() {
        if (this.element) {
            if (this.element.style.display === 'none') {
                this.show();
            } else {
                this.hide();
            }
        }
        return this;
    }
    
    /**
     * Add a CSS class to the component element
     * @param {string} className - CSS class to add
     * @returns {UIComponent} - This component instance for chaining
     */
    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        }
        return this;
    }
    
    /**
     * Remove a CSS class from the component element
     * @param {string} className - CSS class to remove
     * @returns {UIComponent} - This component instance for chaining
     */
    removeClass(className) {
        if (this.element) {
            this.element.classList.remove(className);
        }
        return this;
    }
    
    /**
     * Toggle a CSS class on the component element
     * @param {string} className - CSS class to toggle
     * @returns {UIComponent} - This component instance for chaining
     */
    toggleClass(className) {
        if (this.element) {
            this.element.classList.toggle(className);
        }
        return this;
    }
    
    /**
     * Find an element within the component
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null} - Found element or null
     */
    find(selector) {
        if (!this.element) return null;
        return this.element.querySelector(selector);
    }
    
    /**
     * Find all elements within the component
     * @param {string} selector - CSS selector
     * @returns {NodeList} - Found elements
     */
    findAll(selector) {
        if (!this.element) return [];
        return this.element.querySelectorAll(selector);
    }
    
    /**
     * Destroy the component
     * @returns {UIComponent} - This component instance for chaining
     */
    destroy() {
        // Unbind events before destroying
        this.unbindEvents();
        
        // Call parent destroy method
        super.destroy();
        
        // Remove element from DOM if it exists
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        return this;
    }
}