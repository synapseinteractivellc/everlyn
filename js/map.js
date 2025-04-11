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
          
          // Add click event listener
          node.addEventListener('click', () => handleLocationClick(locationName));
        } else if (locationName) {
          console.warn(`Location "${locationName}" from SVG not found in LocationService`);
        }
      });
      
      // Log results
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
      if (!locationName || !LocationService.locationExists(locationName)) {
        throw ErrorUtils.createError(
          `Invalid location clicked: ${locationName}`, 
          ErrorCodes.INVALID_LOCATION
        );
      }
      
      // Check if it's a different location than current
      if (locationName !== GameState.currentLocation) {
        // Update game state with new location
        GameState.setLocation(locationName);
        
        // Get location details
        const locationDetails = LocationService.getLocationDetails(locationName);
        
        // Update UI with location info
        if (locationDetails) {
          UIManager.updateLocationInfo(locationName, locationDetails);
        }
      }
    }, 'MapModule.handleLocationClick');
    
    end();
  }
  
  /**
   * Handle location change in GameState
   * @param {Object} state - Game state
   * @param {Object} data - Event data
   */
  function handleLocationChange(state, data) {
    if (state.currentLocation && svgDocument) {
      highlightLocation(state.currentLocation);
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
    getMappedLocations
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