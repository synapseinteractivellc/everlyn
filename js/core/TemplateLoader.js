// TemplateLoader.js - Improved HTML template management
// This module provides clean HTML/JS separation by loading templates from files

/**
 * TemplateLoader - Manages HTML templates loaded from external files
 */
class TemplateLoader {
    constructor() {
        this.templates = new Map();
        this.templateCache = new Map();
        this.templatePath = './templates/';
    }

    /**
     * Set the base path for template files
     * @param {string} path - Path to template directory
     */
    setTemplatePath(path) {
        this.templatePath = path.endsWith('/') ? path : path + '/';
    }

    /**
     * Load a template from file
     * @param {string} templateId - Unique template identifier
     * @param {string} filePath - Path to template file (relative to templatePath)
     * @returns {Promise<string>} - Promise resolving to template content
     */
    async loadTemplate(templateId, filePath) {
        try {
            // Check cache first
            if (this.templateCache.has(templateId)) {
                return this.templateCache.get(templateId);
            }

            // Fetch the template
            const response = await fetch(this.templatePath + filePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }

            const templateContent = await response.text();
            
            // Store in cache
            this.templateCache.set(templateId, templateContent);
            
            return templateContent;
        } catch (error) {
            console.error(`Error loading template ${templateId}:`, error);
            return null;
        }
    }

    /**
     * Load multiple templates at once
     * @param {Object} templates - Map of templateId -> filePath
     * @returns {Promise<boolean>} - Success status
     */
    async loadTemplates(templates) {
        try {
            const promises = Object.entries(templates).map(
                ([id, path]) => this.loadTemplate(id, path)
            );
            
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error loading multiple templates:', error);
            return false;
        }
    }

    /**
     * Render a template with data
     * @param {string} templateId - Template identifier
     * @param {Object} data - Data to inject into template
     * @param {Element|string} container - Container element or selector
     * @returns {Promise<boolean>} - Success status
     */
    async render(templateId, data, container) {
        try {
            // Get template content
            const templateContent = this.templateCache.get(templateId);
            if (!templateContent) {
                throw new Error(`Template not found: ${templateId}`);
            }
            
            // Get container element
            const containerElement = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
                
            if (!containerElement) {
                throw new Error(`Container not found: ${container}`);
            }
            
            // Process template - replace placeholders with data
            const processedHTML = this._processTemplate(templateContent, data);
            
            // Insert into DOM
            containerElement.innerHTML = processedHTML;
            
            // Initialize data bindings and event handlers
            this._initializeBindings(containerElement, data);
            
            return true;
        } catch (error) {
            console.error(`Error rendering template ${templateId}:`, error);
            return false;
        }
    }

    /**
     * Create an element from a template without adding to DOM
     * @param {string} templateId - Template identifier
     * @param {Object} data - Data to inject into template
     * @returns {DocumentFragment} - Document fragment with rendered template
     */
    createFromTemplate(templateId, data) {
        const templateContent = this.templateCache.get(templateId);
        if (!templateContent) {
            console.error(`Template not found: ${templateId}`);
            return null;
        }
        
        // Process template
        const processedHTML = this._processTemplate(templateContent, data);
        
        // Create document fragment
        const fragment = document.createRange().createContextualFragment(processedHTML);
        
        // Initialize bindings
        this._initializeBindings(fragment, data);
        
        return fragment;
    }

    /**
     * Process template string, replacing placeholders with data
     * @param {string} template - Template string
     * @param {Object} data - Data object
     * @returns {string} - Processed template
     * @private
     */
    _processTemplate(template, data) {
        // Replace {{variableName}} placeholders with data
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const value = this._getNestedProperty(data, key.trim());
            return value !== undefined ? value : '';
        });
    }

    /**
     * Initialize data bindings and event handlers
     * @param {Element} element - Container element
     * @param {Object} data - Data object for binding
     * @private
     */
    _initializeBindings(element, data) {
        // Find elements with data-bind attribute
        const bindElements = element.querySelectorAll('[data-bind]');
        
        bindElements.forEach(el => {
            const bindProperty = el.getAttribute('data-bind');
            const bindValue = this._getNestedProperty(data, bindProperty);
            
            if (bindValue !== undefined) {
                el.textContent = bindValue;
            }
        });
        
        // Process conditional displays
        const conditionalElements = element.querySelectorAll('[data-if]');
        
        conditionalElements.forEach(el => {
            const condition = el.getAttribute('data-if');
            const result = this._evaluateCondition(condition, data);
            
            if (!result) {
                el.style.display = 'none';
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
     * Evaluate a simple condition expression
     * @param {string} condition - Condition expression (e.g., "user.age > 18")
     * @param {Object} data - Data object
     * @returns {boolean} - Result of condition
     * @private
     */
    _evaluateCondition(condition, data) {
        try {
            // Simple condition evaluation - not using eval for security
            if (condition.includes('==')) {
                const [left, right] = condition.split('==').map(s => s.trim());
                const leftValue = this._getNestedProperty(data, left);
                return String(leftValue) === right.replace(/['"]/g, '');
            } else if (condition.includes('!=')) {
                const [left, right] = condition.split('!=').map(s => s.trim());
                const leftValue = this._getNestedProperty(data, left);
                return String(leftValue) !== right.replace(/['"]/g, '');
            } else if (condition.includes('>')) {
                const [left, right] = condition.split('>').map(s => s.trim());
                const leftValue = this._getNestedProperty(data, left);
                return Number(leftValue) > Number(right);
            } else if (condition.includes('<')) {
                const [left, right] = condition.split('<').map(s => s.trim());
                const leftValue = this._getNestedProperty(data, left);
                return Number(leftValue) < Number(right);
            } else {
                // Treat as boolean property
                const value = this._getNestedProperty(data, condition);
                return Boolean(value);
            }
        } catch (error) {
            console.error(`Error evaluating condition: ${condition}`, error);
            return false;
        }
    }
}

// Create and export singleton instance
const templateLoader = new TemplateLoader();
export default templateLoader;