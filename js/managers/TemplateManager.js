// TemplateManager.js - HTML template management
// This module provides efficient HTML templating for dynamic content

import DOMCache from './DOMCache.js';

/**
 * TemplateManager - Manages HTML templates for the application
 * Uses template literals for efficient template generation
 */
const TemplateManager = {
    /**
     * Templates storage
     * @private
     */
    _templates: {
        // Character profile template
        characterProfile: () => `
            <div class="character-profile card">
                <div class="character-header">
                    <h2 class="character-name"></h2>
                    <div class="character-subtitle"></div>
                </div>
                <div class="xp-section">
                    <div class="progress-container">
                        <div class="progress-bar xp-bar">
                            <span class="progress-bar-text"></span>
                        </div>
                    </div>
                    <div class="xp-info"></div>
                </div>
            </div>
        `,
        
        // Character stats section template
        characterStats: () => `
            <div class="character-stats-section">
                <h3>Character Stats</h3>
                <ul class="character-stats-list"></ul>
            </div>
        `,
        
        // Character resource item template
        resourceItem: (label, bindPath) => `
            <div class="resource-item" data-bind="${bindPath}">${label}: 0/0</div>
        `,
        
        // Location info template
        locationInfo: (name, description, quests = []) => {
            let questsHTML = '';
            
            if (quests.length > 0) {
                questsHTML = `
                    <h4>Available Quests:</h4>
                    <ul>
                        ${quests.map(quest => `<li>${quest}</li>`).join('')}
                    </ul>
                `;
            }
            
            return `
                <h3>${name}</h3>
                <p>${description}</p>
                ${questsHTML}
            `;
        }
    },
    
    /**
     * Get a template by name and optionally process it with data
     * @param {string} templateName - Name of the template
     * @param {...any} args - Arguments to pass to the template function
     * @returns {string} - Processed template HTML
     */
    get: function(templateName, ...args) {
        if (!this._templates[templateName]) {
            console.error(`Template "${templateName}" not found`);
            return '';
        }
        
        return this._templates[templateName](...args);
    },
    
    /**
     * Create a DOM element from a template
     * @param {string} templateName - Name of the template
     * @param {...any} args - Arguments to pass to the template function
     * @returns {HTMLElement} - DOM element created from template
     */
    createElement: function(templateName, ...args) {
        const html = this.get(templateName, ...args);
        const temp = document.createElement('div');
        temp.innerHTML = html.trim();
        return temp.firstChild;
    },
    
    /**
     * Render a template to an existing element
     * @param {string|Element} target - Target element or selector
     * @param {string} templateName - Name of the template
     * @param {...any} args - Arguments to pass to the template function
     */
    render: function(target, templateName, ...args) {
        const element = typeof target === 'string' ? DOMCache.get(target) : target;
        
        if (!element) {
            console.error(`Target element "${target}" not found`);
            return;
        }
        
        element.innerHTML = this.get(templateName, ...args);
    },
    
    /**
     * Create and register a new template
     * @param {string} name - Template name
     * @param {Function} templateFn - Template function
     */
    register: function(name, templateFn) {
        this._templates[name] = templateFn;
    }
};

export default TemplateManager;