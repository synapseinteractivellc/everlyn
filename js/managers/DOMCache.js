// DOMCache.js - Centralized DOM element caching
// This module provides efficient DOM caching with lazy loading

import ErrorUtils from '../utils/ErrorUtils.js';
import { ErrorCodes } from '../utils/ErrorUtils.js';

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
     * Options for cache behavior
     * @private
     */
    _options: {
        logErrors: true,
        throwErrors: false,
        cacheNullResults: false, // Whether to cache null results (not found elements)
        debugMode: false // More verbose logging when true
    },
    
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
     * Configure cache behavior
     * @param {Object} options - Configuration options
     */
    configure: function(options = {}) {
        Object.assign(this._options, options);
    },
    
    /**
     * Get a DOM element by selector
     * Retrieves from cache if available, otherwise queries the DOM and caches the result
     * @param {string} selector - CSS selector or predefined key
     * @returns {Element|null} - DOM element or null if not found
     */
    get: function(selector) {
        try {
            // Check if the selector is a nested path (e.g., 'stats.health')
            if (typeof selector === 'string' && selector.includes('.')) {
                const parts = selector.split('.');
                let current = this._selectors;
                
                // Navigate through the selector object
                for (const part of parts) {
                    if (!current[part]) {
                        const errorMsg = `Invalid selector path: ${selector}`;
                        this._handleError(errorMsg, ErrorCodes.ELEMENT_NOT_FOUND);
                        return null;
                    }
                    current = current[part];
                }
                
                // Use the resolved selector
                selector = current;
            }
            
            // Use mapped selector if it's a key in _selectors
            const actualSelector = this._selectors[selector] || selector;
            
            // Check that we have a valid selector
            if (!actualSelector || typeof actualSelector !== 'string') {
                this._handleError(`Invalid selector: ${selector}`, ErrorCodes.ELEMENT_NOT_FOUND);
                return null;
            }
            
            // Return from cache if available
            if (this._cache.has(actualSelector)) {
                const cached = this._cache.get(actualSelector);
                
                // Check if the cached element is still in the DOM
                if (cached && cached.isConnected !== false) {
                    return cached;
                } else if (cached === null && this._options.cacheNullResults) {
                    return null;
                }
                
                // Remove stale cache entry
                this._cache.delete(actualSelector);
            }
            
            // Query the DOM
            const element = document.querySelector(actualSelector);
            
            // Cache the result if it's not null or if we're caching null results
            if (element !== null || this._options.cacheNullResults) {
                this._cache.set(actualSelector, element);
            }
            
            // Log if element not found in debug mode
            if (element === null && this._options.debugMode) {
                console.warn(`DOMCache: Element not found for selector "${actualSelector}"`);
            }
            
            return element;
        } catch (error) {
            return this._handleError(`Error getting element: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Get all DOM elements matching a selector
     * @param {string} selector - CSS selector or predefined key
     * @returns {NodeList|null} - Collection of matching DOM elements
     */
    getAll: function(selector) {
        try {
            // Use mapped selector if it's a key in _selectors
            const actualSelector = this._selectors[selector] || selector;
            
            // Check that we have a valid selector
            if (!actualSelector || typeof actualSelector !== 'string') {
                this._handleError(`Invalid selector: ${selector}`, ErrorCodes.ELEMENT_NOT_FOUND);
                return null;
            }
            
            // Cache key for collections
            const cacheKey = `getAll:${actualSelector}`;
            
            // Return from cache if available
            if (this._cache.has(cacheKey)) {
                const cached = this._cache.get(cacheKey);
                
                // For NodeList/HTMLCollection, check if the first element is still connected
                if (cached && cached.length > 0) {
                    // Only check the first item to avoid performance issues with large collections
                    if (cached[0].isConnected !== false) {
                        return cached;
                    }
                } else if (cached && cached.length === 0) {
                    return cached; // Empty collection is still valid
                }
                
                // Remove stale cache entry
                this._cache.delete(cacheKey);
            }
            
            // Query the DOM
            const elements = document.querySelectorAll(actualSelector);
            
            // Cache the result
            this._cache.set(cacheKey, elements);
            
            return elements;
        } catch (error) {
            return this._handleError(`Error getting elements: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Create a DOM element with optional properties and children
     * @param {string} tagName - HTML tag name
     * @param {Object} options - Element properties and attributes
     * @param {Array} children - Child elements or text content
     * @returns {Element} - Created DOM element
     */
    create: function(tagName, options = {}, children = []) {
        try {
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
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (typeof child === 'string') {
                        element.textContent = child;
                    } else if (child instanceof Node) {
                        element.appendChild(child);
                    }
                });
            }
            
            return element;
        } catch (error) {
            return this._handleError(`Error creating element: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Create a document fragment with children
     * @param {Array} children - Child elements
     * @returns {DocumentFragment} - Created document fragment
     */
    createFragment: function(children = []) {
        try {
            const fragment = document.createDocumentFragment();
            
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (child instanceof Node) {
                        fragment.appendChild(child);
                    }
                });
            }
            
            return fragment;
        } catch (error) {
            return this._handleError(`Error creating fragment: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Clear the cache or remove specific items
     * @param {string|Array} selectors - Optional selector(s) to remove from cache
     */
    clearCache: function(selectors) {
        try {
            if (!selectors) {
                // Clear entire cache
                this._cache.clear();
                if (this._options.debugMode) {
                    console.log('DOMCache: Cache cleared');
                }
            } else if (Array.isArray(selectors)) {
                // Clear specific selectors
                selectors.forEach(selector => {
                    const actualSelector = this._selectors[selector] || selector;
                    this._cache.delete(actualSelector);
                    this._cache.delete(`getAll:${actualSelector}`);
                });
                if (this._options.debugMode) {
                    console.log(`DOMCache: Cleared ${selectors.length} items from cache`);
                }
            } else {
                // Clear single selector
                const actualSelector = this._selectors[selectors] || selectors;
                this._cache.delete(actualSelector);
                this._cache.delete(`getAll:${actualSelector}`);
                if (this._options.debugMode) {
                    console.log(`DOMCache: Cleared "${selectors}" from cache`);
                }
            }
        } catch (error) {
            this._handleError(`Error clearing cache: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Register a new selector or update an existing one
     * @param {string} key - Selector key
     * @param {string|Object} selector - CSS selector or nested object
     */
    registerSelector: function(key, selector) {
        try {
            if (typeof key !== 'string' || (!selector && selector !== 0)) {
                throw new Error('Invalid key or selector');
            }
            
            // Handle nested paths
            if (key.includes('.')) {
                const parts = key.split('.');
                let current = this._selectors;
                
                // Navigate to the nested location
                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (!current[part] || typeof current[part] !== 'object') {
                        current[part] = {};
                    }
                    current = current[part];
                }
                
                // Set the value at the final level
                current[parts[parts.length - 1]] = selector;
            } else {
                this._selectors[key] = selector;
            }
            
            // Remove any cached values for this selector
            this.clearCache(key);
        } catch (error) {
            this._handleError(`Error registering selector: ${error.message}`, ErrorCodes.UNEXPECTED_ERROR, error);
        }
    },
    
    /**
     * Handle errors according to options
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Error} [originalError] - Original error object
     * @returns {null} - Always returns null for consistent error handling
     * @private
     */
    _handleError: function(message, code, originalError) {
        const error = ErrorUtils.createError(message, code, { originalError });
        
        if (this._options.logErrors) {
            ErrorUtils.logError(error, 'DOMCache');
        }
        
        if (this._options.throwErrors) {
            throw error;
        }
        
        return null;
    }
};

// Export the DOMCache for use in other modules
export default DOMCache;