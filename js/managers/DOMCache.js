// DOMCache.js - Centralized DOM element caching
// This module provides efficient DOM caching with lazy loading

/**
 * DOMCache - Manages DOM element references throughout the application
 * Uses lazy loading pattern to only retrieve elements when needed
 */
const DOMCache = {
    /**
     * Private cache storage
     * @private
     */
    _cache: new Map(),
    
    /**
     * DOM element selectors mapping
     * Contains all selectors used across the application
     * @private
     */
    _selectors: {
        // Main sections
        mainContent: '#main-content',
        landingPage: '#landing-page',
        
        // Player info
        playerName: '#player-name',
        playerNameDisplay: '#player-name-display',
        
        // Navigation
        tabButtons: '.tab-button',
        
        // Controls
        enterCityBtn: '#enter-city-btn',
        wipeSaveBtn: '#wipe-save-btn',
        
        // Sections
        map: '#map',
        skills: '#skills',
        adventure: '#adventure',
        character: '#character',
        
        // Map elements
        cityMap: '#city-map',
        locationInfo: '.location-info',
        
        // Resource elements
        resources: {
            gold: '#gold-display',
            research: '#research-display',
            skins: '#skins-display',
        },
        
        // Stat elements
        stats: {
            health: '#health-bar-display',
            stamina: '#stamina-bar-display',
            mana: '#mana-bar-display',
            earthMana: '#earth-mana-bar-display',
            fireMana: '#fire-mana-bar-display',
            airMana: '#air-mana-bar-display',
            waterMana: '#water-mana-bar-display',
        },
        
        // Character profile elements
        characterProfile: '.character-profile',
        characterName: '.character-name',
        characterSubtitle: '.character-subtitle',
        xpBar: '.xp-bar',
        xpInfo: '.xp-info',
    },
    
    /**
     * Get a DOM element by selector
     * Retrieves from cache if available, otherwise queries the DOM and caches the result
     * @param {string} selector - CSS selector or predefined key
     * @returns {Element|null} - DOM element or null if not found
     */
    get: function(selector) {
        // Check if the selector is a nested path (e.g., 'stats.health')
        if (selector.includes('.')) {
            const parts = selector.split('.');
            let current = this._selectors;
            
            // Navigate through the selector object
            for (const part of parts) {
                if (!current[part]) return null;
                current = current[part];
            }
            
            // Use the resolved selector
            selector = current;
        }
        
        // Use mapped selector if it's a key in _selectors
        const actualSelector = this._selectors[selector] || selector;
        
        // Return from cache if available
        if (this._cache.has(actualSelector)) {
            return this._cache.get(actualSelector);
        }
        
        // Query the DOM
        const element = document.querySelector(actualSelector);
        
        // Cache the result (even if null, to avoid repeated failed queries)
        this._cache.set(actualSelector, element);
        
        return element;
    },
    
    /**
     * Get all DOM elements matching a selector
     * @param {string} selector - CSS selector or predefined key
     * @returns {NodeList} - Collection of matching DOM elements
     */
    getAll: function(selector) {
        // Use mapped selector if it's a key in _selectors
        const actualSelector = this._selectors[selector] || selector;
        
        // Cache key for collections
        const cacheKey = `getAll:${actualSelector}`;
        
        // Return from cache if available
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        // Query the DOM
        const elements = document.querySelectorAll(actualSelector);
        
        // Cache the result
        this._cache.set(cacheKey, elements);
        
        return elements;
    },
    
    /**
     * Create a DOM element with optional properties and children
     * @param {string} tagName - HTML tag name
     * @param {Object} options - Element properties and attributes
     * @param {Array} children - Child elements or text content
     * @returns {Element} - Created DOM element
     */
    create: function(tagName, options = {}, children = []) {
        const element = document.createElement(tagName);
        
        // Apply properties and attributes
        Object.entries(options).forEach(([key, value]) => {
            if (key === 'class' || key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.entries(value).forEach(([prop, val]) => {
                    element.style[prop] = val;
                });
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([dataKey, dataVal]) => {
                    element.dataset[dataKey] = dataVal;
                });
            } else if (key === 'attributes' && typeof value === 'object') {
                Object.entries(value).forEach(([attrName, attrVal]) => {
                    element.setAttribute(attrName, attrVal);
                });
            } else {
                element[key] = value;
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.textContent = child;
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    /**
     * Create a document fragment with children
     * @param {Array} children - Child elements
     * @returns {DocumentFragment} - Created document fragment
     */
    createFragment: function(children = []) {
        const fragment = document.createDocumentFragment();
        
        children.forEach(child => {
            if (child instanceof Node) {
                fragment.appendChild(child);
            }
        });
        
        return fragment;
    },
    
    /**
     * Clear the cache or remove specific items
     * @param {string|Array} selectors - Optional selector(s) to remove from cache
     */
    clearCache: function(selectors) {
        if (!selectors) {
            // Clear entire cache
            this._cache.clear();
        } else if (Array.isArray(selectors)) {
            // Clear specific selectors
            selectors.forEach(selector => {
                this._cache.delete(selector);
                this._cache.delete(`getAll:${selector}`);
            });
        } else {
            // Clear single selector
            this._cache.delete(selectors);
            this._cache.delete(`getAll:${selectors}`);
        }
    }
};

export default DOMCache;