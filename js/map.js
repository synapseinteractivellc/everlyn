// Import the UIManager, GameState, LocationService and DOMCache
import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import LocationService from './services/LocationService.js';
import DOMCache from './managers/DOMCache.js';

/**
 * Map Module - Handles map interactivity
 */
const MapModule = (() => {
  // Private module variables
  const elementToLocationMap = new WeakMap(); // Using WeakMap for better garbage collection
  let svgDocument = null;
  
  /**
   * Initialize map functionality
   */
  function init() {
    const cityMap = DOMCache.get('cityMap');
    
    if (!cityMap) {
      console.warn('City map element not found');
      return;
    }
    
    // Handle SVG load
    cityMap.addEventListener('load', () => {
      try {
        svgDocument = cityMap.contentDocument;
        if (!svgDocument) {
          console.warn('Could not access SVG document');
          return;
        }
        
        // Create mapping and add styles - do this only once
        createLocationMapping();
        addSvgStyles();
        
        // Set up event delegation on the SVG document
        setupEventDelegation();
        
        // Subscribe to location changes for highlighting
        subscribeToLocationChanges();
        
        // Initial highlight if there's a current location
        highlightCurrentLocation();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });
  }
  
  /**
   * Create mapping between SVG elements and location names
   */
  function createLocationMapping() {
    // Centralized location definition data
    const locationMappings = [
      {
        name: 'City Square',
        selectors: ['rect[x="220"][y="170"]']
      },
      {
        name: 'Market',
        selectors: ['g[transform*="translate(170, 200)"]', 'g[transform*="translate(170, 200)"] > *']
      },
      {
        name: 'Forest',
        selectors: ['g[transform*="translate(450, 200)"]', 'g[transform*="translate(450, 200)"] > *']
      },
      {
        name: 'Inn',
        selectors: ['rect[x="280"][y="140"]', 'polygon[points*="280,140"]', 'text:contains("Inn")']
      }
    ];

    // Process each location mapping
    locationMappings.forEach(location => {
      location.selectors.forEach(selector => {
        try {
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
        } catch (error) {
          console.warn(`Error processing selector "${selector}":`, error);
        }
      });
    });
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
  }
  
  /**
   * Set up event delegation for map interactions
   */
  function setupEventDelegation() {
    // Use event delegation with a single listener
    svgDocument.addEventListener('click', handleMapClick);
  }
  
  /**
   * Handle click events on the map using efficient lookups
   * @param {Event} event - Click event
   */
  function handleMapClick(event) {
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
      if (state.currentLocation) {
        highlightLocation(state.currentLocation);
      }
    });
  }
  
  /**
   * Highlight the current location from GameState
   */
  function highlightCurrentLocation() {
    if (GameState.currentLocation) {
      highlightLocation(GameState.currentLocation);
    }
  }
  
  /**
   * Highlight a location on the map
   * @param {string} locationName - Location name to highlight
   */
  function highlightLocation(locationName) {
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
  }
  
  /**
   * Add CSS styles to SVG document
   */
  function addSvgStyles() {
    // Create a style element if it doesn't exist yet
    let styleElement = svgDocument.querySelector('style#map-styles');
    
    if (!styleElement) {
      styleElement = svgDocument.createElementNS("http://www.w3.org/2000/svg", "style");
      styleElement.id = "map-styles";
      
      // Define styles
      styleElement.textContent = `
        /* Interactive elements */
        rect:not([width="500"]):not([x="100"][y="80"]), 
        polygon, 
        g > rect, 
        g > circle:not([r="40"]) {
          cursor: pointer;
          transition: fill 0.3s ease;
        }
        
        /* Hover effect */
        rect:hover:not([width="500"]):not([x="100"][y="80"]), 
        polygon:hover, 
        g > rect:hover, 
        g > circle:hover:not([r="40"]) {
          fill: #ffcc66 !important;
        }
        
        /* Current location highlight */
        .location-highlight {
          fill: #4fc3f7 !important;
          stroke-width: 2px;
          stroke: #0277bd;
        }
      `;
      
      // Add style element to SVG
      svgDocument.querySelector('svg').appendChild(styleElement);
    }
  }
  
  // Public API
  return {
    init
  };
})();

// Initialize the map when DOM is ready
document.addEventListener('DOMContentLoaded', MapModule.init);

export default MapModule;