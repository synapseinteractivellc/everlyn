// Import the UIManager, GameState, LocationService, DOMCache and utilities
import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import LocationService from './services/LocationService.js';
import DOMCache from './managers/DOMCache.js';
import ErrorUtils from './utils/ErrorUtils.js';
import { ErrorCodes } from './utils/ErrorUtils.js';
import PerformanceMonitor from './utils/PerformanceMonitor.js';

/**
 * Map Module - Handles map interactivity
 */
const MapModule = (() => {
  // Private module variables
  const elementToLocationMap = new WeakMap(); // Using WeakMap for better garbage collection
  let svgDocument = null;
  let mapInitialized = false;
  
  /**
   * Initialize map functionality
   */
  function init() {
    const end = PerformanceMonitor.start('MapModule.init');
    
    ErrorUtils.tryCatch(() => {
      const cityMap = DOMCache.get('cityMap');
      
      if (!cityMap) {
        throw ErrorUtils.createError('City map element not found', ErrorCodes.ELEMENT_NOT_FOUND);
      }
      
      // Handle SVG load
      cityMap.addEventListener('load', handleSvgLoad);
      
      // Subscribe to location changes for highlighting
      subscribeToLocationChanges();
    }, 'MapModule.init');
    
    end();
  }
  
  /**
   * Handle SVG load event
   * @param {Event} event - Load event
   */
  function handleSvgLoad(event) {
    const end = PerformanceMonitor.start('MapModule.handleSvgLoad');
    
    ErrorUtils.tryCatch(() => {
      const cityMap = event.target;
      svgDocument = cityMap.contentDocument;
      
      if (!svgDocument) {
        throw ErrorUtils.createError('Could not access SVG document', ErrorCodes.ELEMENT_NOT_FOUND);
      }
      
      // Only initialize once
      if (!mapInitialized) {
        // Create mapping and add styles - do this only once
        createLocationMapping();
        addSvgStyles();
        
        // Set up event delegation on the SVG document
        setupEventDelegation();
        
        // Mark as initialized
        mapInitialized = true;
        
        console.log('Map initialized successfully');
      }
      
      // Initial highlight if there's a current location
      highlightCurrentLocation();
    }, 'MapModule.handleSvgLoad');
    
    end();
  }
  
  /**
   * Create mapping between SVG elements and location names
   */
  function createLocationMapping() {
    const end = PerformanceMonitor.start('MapModule.createLocationMapping');
    
    // Centralized location definition data
    const locationMappings = [
      {
        name: 'City Square',
        selectors: ['rect[x="220"][y="170"]', 'text:contains("City Square")']
      },
      {
        name: 'Market',
        selectors: ['g[transform*="translate(170, 200)"]', 'text:contains("Market")']
      },
      {
        name: 'Forest',
        selectors: ['g[transform*="translate(450, 200)"]', 'text:contains("Forest")']
      },
      {
        name: 'Inn',
        selectors: ['rect[x="280"][y="140"]', 'polygon[points*="280,140"]', 'text:contains("Inn")']
      }
    ];

    // Process each location mapping
    locationMappings.forEach(location => {
      location.selectors.forEach(selector => {
        ErrorUtils.tryCatch(() => {
          // Special handling for :contains pseudoselector
          if (selector.includes(':contains')) {
            const [tag, content] = selector.split(':contains(');
            const searchText = content.slice(1, -2); // Remove quotes and closing parenthesis
            
            Array.from(svgDocument.querySelectorAll(tag)).forEach(el => {
              if (el.textContent.includes(searchText)) {
                mapElementToLocation(el, location.name);
              }
            });
          } else {
            // Standard selector
            const elements = svgDocument.querySelectorAll(selector);
            elements.forEach(el => mapElementToLocation(el, location.name));
          }
        }, `MapModule.createLocationMapping.${location.name}.${selector}`);
      });
    });
    
    end();
  }
  
  /**
   * Map an element to a location name
   * @param {Element} element - SVG element
   * @param {string} locationName - Location name
   */
  function mapElementToLocation(element, locationName) {
    elementToLocationMap.set(element, locationName);
    
    // Add a data attribute for easier debugging and selection
    element.dataset.location = locationName;
    
    // Optimize for touchscreen devices by adding cursor: pointer
    element.style.cursor = 'pointer';
  }
  
  /**
   * Set up event delegation for map interactions
   */
  function setupEventDelegation() {
    // Use event delegation with a single listener
    svgDocument.addEventListener('click', handleMapClick);
    
    // Add touch event support
    svgDocument.addEventListener('touchend', (event) => {
      // Prevent default to avoid double-firing with click
      event.preventDefault();
      
      // Get the touch target
      const touch = event.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Create a synthetic click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      
      // Dispatch the event
      target.dispatchEvent(clickEvent);
    });
  }
  
  /**
   * Handle click events on the map using efficient lookups
   * @param {Event} event - Click event
   */
  function handleMapClick(event) {
    const end = PerformanceMonitor.start('MapModule.handleMapClick');
    
    ErrorUtils.tryCatch(() => {
      // Ignore clicks on the background rect
      if (isBackgroundElement(event.target)) {
        return;
      }
      
      // Try to find location directly from WeakMap
      let locationName = findLocationName(event.target);
      
      if (locationName) {
        // Update game state with the new location
        GameState.setLocation(locationName);
      }
    }, 'MapModule.handleMapClick');
    
    end();
  }
  
  /**
   * Check if an element is the background
   * @param {Element} element - SVG element
   * @returns {boolean} - True if it's the background
   */
  function isBackgroundElement(element) {
    return (
      element.tagName === 'rect' && 
      element.getAttribute('width') === '500' &&
      element.getAttribute('height') === '400'
    );
  }
  
  /**
   * Find location name for an element using efficient lookup
   * @param {Element} element - Clicked element
   * @returns {string|null} - Location name or null
   */
  function findLocationName(element) {
    // Direct lookup
    let locationName = elementToLocationMap.get(element);
    
    // Try parent elements if needed (maximum of 3 levels up)
    if (!locationName) {
      let currentEl = element;
      let level = 0;
      
      while (!locationName && currentEl && currentEl.parentElement && level < 3) {
        currentEl = currentEl.parentElement;
        locationName = elementToLocationMap.get(currentEl);
        level++;
      }
    }
    
    return locationName;
  }
  
  /**
   * Subscribe to location changes in GameState
   */
  function subscribeToLocationChanges() {
    GameState.subscribe('location', (state, data) => {
      ErrorUtils.tryCatch(() => {
        if (state.currentLocation && svgDocument) {
          highlightLocation(state.currentLocation);
        }
      }, 'MapModule.locationChangeHandler');
    });
  }
  
  /**
   * Highlight the current location from GameState
   */
  function highlightCurrentLocation() {
    if (GameState.currentLocation && svgDocument) {
      highlightLocation(GameState.currentLocation);
    }
  }
  
  /**
   * Highlight a location on the map
   * @param {string} locationName - Location name to highlight
   */
  function highlightLocation(locationName) {
    const end = PerformanceMonitor.start('MapModule.highlightLocation');
    
    ErrorUtils.tryCatch(() => {
      // Use CSS classes for better performance than direct style manipulation
      
      // First remove existing highlights
      const highlightedElements = svgDocument.querySelectorAll('.location-highlight');
      highlightedElements.forEach(el => {
        el.classList.remove('location-highlight');
      });
      
      // Add highlight to new location (use data attribute for faster selection)
      const elementsToHighlight = svgDocument.querySelectorAll(`[data-location="${locationName}"]`);
      elementsToHighlight.forEach(el => {
        el.classList.add('location-highlight');
      });
    }, 'MapModule.highlightLocation');
    
    end();
  }
  
  /**
   * Add CSS styles to SVG document
   */
  function addSvgStyles() {
    ErrorUtils.tryCatch(() => {
      // Create a style element if it doesn't exist yet
      let styleElement = svgDocument.querySelector('style#map-styles');
      
      if (!styleElement) {
        styleElement = svgDocument.createElementNS("http://www.w3.org/2000/svg", "style");
        styleElement.id = "map-styles";
        
        // Define styles
        styleElement.textContent = `
          /* Interactive elements */
          [data-location] {
            cursor: pointer;
            transition: fill 0.3s ease;
          }
          
          /* Hover effect */
          [data-location]:hover {
            fill: #ffcc66 !important;
          }
          
          /* Current location highlight */
          .location-highlight {
            fill: #4fc3f7 !important;
            stroke-width: 2px;
            stroke: #0277bd;
          }
          
          /* Mobile touch optimization */
          @media (max-width: 768px) {
            [data-location] {
              /* Increase touch target size slightly */
              stroke-width: 3px;
            }
          }
        `;
        
        // Add style element to SVG
        svgDocument.querySelector('svg').appendChild(styleElement);
      }
    }, 'MapModule.addSvgStyles');
  }
  
  /**
   * Get map element by location name
   * @param {string} locationName - Location name
   * @returns {Element|null} - SVG element for the location
   */
  function getLocationElement(locationName) {
    if (!svgDocument) return null;
    
    return svgDocument.querySelector(`[data-location="${locationName}"]`);
  }
  
  /**
   * Check if map is fully loaded
   * @returns {boolean} - Whether map is initialized
   */
  function isInitialized() {
    return mapInitialized && svgDocument !== null;
  }
  
  /**
   * Reload the map if needed
   */
  function reload() {
    mapInitialized = false;
    const cityMap = DOMCache.get('cityMap');
    
    if (cityMap) {
      // Force reload
      const currentSrc = cityMap.getAttribute('data');
      cityMap.setAttribute('data', '');
      setTimeout(() => {
        cityMap.setAttribute('data', currentSrc);
      }, 10);
    }
  }
  
  // Public API
  return {
    init,
    isInitialized,
    getLocationElement,
    reload
  };
})();

// Initialize the map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Enable performance monitoring in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    PerformanceMonitor.enable({ threshold: 100 });
  }
  
  MapModule.init();
});

export default MapModule;