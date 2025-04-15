// map.js - SVG Map interaction module
// This module handles the interactive city map and location selection

import UIManager from './managers/ui-manager.js';
import GameState from './managers/GameState.js';
import LocationService from './services/LocationService.js';
import DOMCache from './managers/DOMCache.js';
import ErrorUtils from './utils/ErrorUtils.js';
import { ErrorCodes } from './utils/ErrorUtils.js';
import PerformanceMonitor from './utils/PerformanceMonitor.js';

/**
 * MapModule - Handles map interactivity and location management
 */
const MapModule = (() => {
  // Private module variables
  let svgDocument = null;
  let mapInitialized = false;
  let locationElements = new Map();
  
  /**
   * CSS styles to be injected into the SVG document
   * These are the same styles from map.css
   */
  const mapStyles = `
    /* Define the pulse animation */
    @keyframes pulse {
      0% { filter: brightness(0.8); }
      50% { filter: brightness(1.2); }
      100% { filter: brightness(0.8); }
    }
    
    /* Active Location with pulsing effect */
    .location.active {
      animation: pulse 2s infinite ease-in-out;
    }
    
    /* Base Location Styling */
    .location {
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    /* Hover Effect */
    .location:hover {
      filter: brightness(1.2);
    }
    
    /* Location Text */
    .location-text {
      font-family: Arial, sans-serif;
      text-anchor: middle;
      font-size: 14px;
      pointer-events: none;
    }

    /* Gates */
    .gate {
      fill: #8B4513;
      stroke: #4B2617;
      stroke-width: 1;
    }
  `;
  
  /**
   * Initialize map functionality
   */
  function init() {
    const end = PerformanceMonitor.start('MapModule.init');
    
    ErrorUtils.tryCatch(() => {
      // Get city map element
      const cityMap = DOMCache.get('cityMap');
      
      if (!cityMap) {
        throw ErrorUtils.createError('City map element not found', ErrorCodes.ELEMENT_NOT_FOUND);
      }
      
      // Handle SVG load
      cityMap.addEventListener('load', handleSvgLoad);
      
      // Subscribe to location changes for highlighting
      GameState.subscribe('location', handleLocationChange);
      
      // Make clearLocationInfo function available globally for SVG access
      window.clearLocationInfo = clearLocationInfo;
      
      console.log('Map module initialized');
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
      
      // Inject CSS styles into the SVG document
      injectSvgStyles();
      
      // Initialize map only once
      if (!mapInitialized) {
        setupMapInteractions();
        mapInitialized = true;
        console.log('Map SVG loaded and initialized');
      }
      
      // Update the current location highlight
      highlightCurrentLocation();
    }, 'MapModule.handleSvgLoad');
    
    end();
  }
  
  /**
   * Inject CSS styles into the SVG document
   */
  function injectSvgStyles() {
    if (!svgDocument) return;
    
    ErrorUtils.tryCatch(() => {
      // Check if style element already exists
      let styleElement = svgDocument.getElementById('injected-map-styles');
      
      if (!styleElement) {
        // Create a new style element
        styleElement = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.id = 'injected-map-styles';
        styleElement.textContent = mapStyles;
        
        // Add style to the SVG document
        const svgRoot = svgDocument.documentElement;
        svgRoot.appendChild(styleElement);
        
        console.log('Map styles injected into SVG');
      }
    }, 'MapModule.injectSvgStyles');
  }
  
  /**
   * Set up map interactions
   */
  function setupMapInteractions() {
    const end = PerformanceMonitor.start('MapModule.setupMapInteractions');

    ErrorUtils.tryCatch(() => {
        // Map location elements using data attributes
        const locationNodes = svgDocument.querySelectorAll('.location');

        // Clear existing mapping
        locationElements.clear();

        // Create new mapping
        locationNodes.forEach(node => {
            const locationName = node.getAttribute('data-location');

            if (locationName && LocationService.locationExists(locationName)) {
                locationElements.set(locationName, node);

                // Add click event listener for locations
                node.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent background click from triggering
                    handleLocationClick(locationName);
                });
            } else if (locationName) {
                console.warn(`Location "${locationName}" from SVG not found in LocationService`);
            }
        });

        // Add click event listener to the map background
        const mapBackground = svgDocument.querySelector('.map-background');
        if (mapBackground) {
            mapBackground.addEventListener('click', clearLocationInfo);
        } else {
            console.warn('Map background element not found. Ensure the SVG has a background element with the class "map-background".');
        }

        console.log(`Mapped ${locationElements.size} locations on the map`);
    }, 'MapModule.setupMapInteractions');

    end();
  }
  
  /**
   * Handle location click
   * @param {string} locationName - Clicked location name
   */
  function handleLocationClick(locationName) {
    const end = PerformanceMonitor.start('MapModule.handleLocationClick');

    ErrorUtils.tryCatch(() => {
        // Validate the clicked location
        if (!locationName || !LocationService.locationExists(locationName)) {
            throw ErrorUtils.createError(
                `Invalid location clicked: ${locationName}`,
                ErrorCodes.INVALID_LOCATION
            );
        }

        // Check if the clicked location is different from the current location
        if (locationName !== GameState.currentLocation) {
            // Update the game state with the new location
            // This will trigger data binding updates through GameState
            GameState.setLocation(locationName);

            // Get location details
            const locationDetails = LocationService.getLocationDetails(locationName);

            GameState.setLocation(locationName);
            GameState.updateProperty('locationDetails', locationDetails);

            // Highlight the new location on the map
            highlightLocation(locationName);
            
            // Ensure data bindings are updated with the new location
            UIManager.updateBindings(GameState);
        }
    }, 'MapModule.handleLocationClick');

    end();
  }
  
  /**
   * Clear location information and deselect active location
   * Called when background of map is clicked
   */
  function clearLocationInfo() {
    const end = PerformanceMonitor.start('MapModule.clearLocationInfo');
    
    ErrorUtils.tryCatch(() => {
      // Clear location info panel
      const locationInfo = DOMCache.get('locationInfo');
      if (locationInfo) {
        locationInfo.innerHTML = `
          <h3>Current Location</h3>
          <p>Click on a location to learn more about it.</p>
        `;
      }
      
      // Clear current location in GameState if set
      if (GameState.currentLocation) {
        GameState.setLocation(null);
        
        // Ensure data bindings are updated
        UIManager.updateBindings(GameState);
      }
      
      // Clear active class from all location elements
      if (svgDocument) {
        svgDocument.querySelectorAll('.location.active').forEach(element => {
          element.classList.remove('active');
        });
      }
      
      console.log('Location selection cleared');
    }, 'MapModule.clearLocationInfo');
    
    end();
    
    return true; // Return value for SVG script to check
  }
  
  /**
   * Handle location change in GameState
   * @param {Object} state - Game state
   * @param {Object} data - Event data
   */
  function handleLocationChange(state, data) {
    if (state.currentLocation && svgDocument) {
      highlightLocation(state.currentLocation);
      
      // Ensure data-bound elements are updated
      UIManager.updateBindings(state);
    } else if (!state.currentLocation && svgDocument) {
      // If location is set to null, clear all highlights
      svgDocument.querySelectorAll('.location').forEach(element => {
        element.classList.remove('active');
      });
    }
  }
  
  /**
   * Highlight the current location from GameState
   */
  function highlightCurrentLocation() {
    if (GameState.currentLocation && svgDocument && mapInitialized) {
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
      if (!svgDocument) return;
      
      // Remove active class from all locations
      svgDocument.querySelectorAll('.location').forEach(element => {
        element.classList.remove('active');
      });
      
      // Add active class to selected location
      const locationElement = locationElements.get(locationName);
      
      if (locationElement) {
        locationElement.classList.add('active');
      } else {
        console.warn(`Could not find SVG element for location: ${locationName}`);
      }
    }, 'MapModule.highlightLocation');
    
    end();
  }
  
  /**
   * Get location element by name
   * @param {string} locationName - Location name
   * @returns {Element|null} - SVG element for the location
   */
  function getLocationElement(locationName) {
    return locationElements.get(locationName) || null;
  }
  
  /**
   * Check if map is fully initialized
   * @returns {boolean} - Whether map is initialized
   */
  function isInitialized() {
    return mapInitialized && svgDocument !== null;
  }
  
  /**
   * Force reload the map
   */
  function reload() {
    mapInitialized = false;
    locationElements.clear();
    
    const cityMap = DOMCache.get('cityMap');
    
    if (cityMap) {
      // Force reload by briefly changing the source
      const currentSrc = cityMap.getAttribute('data');
      cityMap.setAttribute('data', '');
      setTimeout(() => {
        cityMap.setAttribute('data', currentSrc);
      }, 10);
    }
  }
  
  /**
   * Get all mapped locations
   * @returns {Array} - Array of location names that are mapped to SVG elements
   */
  function getMappedLocations() {
    return Array.from(locationElements.keys());
  }
  
  // Public API
  return {
    init,
    isInitialized,
    getLocationElement,
    reload,
    getMappedLocations,
    clearLocationInfo
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