/**
 * Template loader utility
 * Provides methods to load and render Handlebars templates
 */
class TemplateLoader {
    constructor() {
        // Pre-compile the templates on initialization
        this.templates = {};
        this.initializeTemplates();
    }

    /**
     * Initialize and pre-compile all templates defined in the DOM
     */
    initializeTemplates() {
        // Find all script tags with type="text/x-handlebars-template"
        const templateScripts = document.querySelectorAll('script[type="text/x-handlebars-template"]');
        
        // Compile each template and store it in the templates object
        templateScripts.forEach(script => {
            const id = script.id.replace('-template', '');
            this.templates[id] = Handlebars.compile(script.innerHTML);
        });
    }

    /**
     * Register a Handlebars helper
     * @param {string} name - Helper name
     * @param {Function} callback - Helper function
     */
    registerHelper(name, callback) {
        Handlebars.registerHelper(name, callback);
    }

    /**
     * Register a Handlebars partial
     * @param {string} name - Partial name
     * @param {string} template - Partial template string
     */
    registerPartial(name, template) {
        Handlebars.registerPartial(name, template);
    }

    /**
     * Get a compiled template by name
     * @param {string} name - Template name
     * @returns {Function|null} - Compiled template function or null if not found
     */
    getTemplate(name) {
        return this.templates[name] || null;
    }

    /**
     * Render a template with data
     * @param {string} name - Template name
     * @param {Object} data - Data to render the template with
     * @returns {string} - Rendered HTML
     */
    render(name, data = {}) {
        const template = this.getTemplate(name);
        if (!template) {
            console.error(`Template "${name}" not found`);
            return '';
        }
        return template(data);
    }

    /**
     * Render a template and append it to a container
     * @param {string} name - Template name
     * @param {Object} data - Data to render the template with
     * @param {string|HTMLElement} container - Container selector or element
     * @param {boolean} replace - Whether to replace container content or append
     */
    renderTo(name, data = {}, container, replace = true) {
        // Try the name as-is first, then append '-template'
        let template = this.getTemplate(name);
        if (!template) {
            template = this.getTemplate(`${name}-template`);
        }
        
        if (!template) {
            console.error(`Template "${name}" not found`);
            return;
        }
        
        const html = template(data);
        const targetElement = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!targetElement) {
            console.error(`Container "${container}" not found`);
            return;
        }
        
        if (replace) {
            targetElement.innerHTML = html;
        } else {
            targetElement.insertAdjacentHTML('beforeend', html);
        }
    }

    /**
     * Load an external template file
     * @param {string} url - Template file URL
     * @param {string} name - Name to register the template as
     * @returns {Promise} - Promise that resolves when the template is loaded
     */
    async loadExternalTemplate(url, name) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.statusText}`);
            }
            
            const templateText = await response.text();
            this.templates[name] = Handlebars.compile(templateText);
            return this.templates[name];
        } catch (error) {
            console.error('Error loading template:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const templateLoader = new TemplateLoader();