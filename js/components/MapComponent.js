// MapComponent.js - Map component for displaying and interacting with the city map
// A component-based approach consistent with the game's architecture

import Component from '../core/Component.js';
import GameState from '../managers/GameState.js';
import LocationService from '../services/LocationService.js';
import ErrorUtils from '../utils/ErrorUtils.js';
import { ErrorCodes } from '../utils/ErrorUtils.js';

/**
 * Map Component - Displays and manages the interactive city map
 * @extends Component
 */
class MapComponent extends Component {
    /**
     * Create a new map component
     * @param {string} containerId - Container element selector
     */
    constructor(containerId) {
        super(
            'city-map',                // Component ID
            'map/map.html',            // Template path
            containerId,               // Container selector
            {
                // Map component state properties to GameState properties
                stateBindings: {
                    'currentLocation': 'currentLocation',
                    'locationDetails': 'locationDetails'
                }
            }
        );
        
        // Initialize local state
        this.state = {
            currentLocation: null,
            locationDetails: null,
            mapLoaded: false,
            locationElements: new Map()
        };

        // Bind methods to maintain context
        this.handleSvgLoad = this.handleSvgLoad.bind(this);
        this.handleLocationClick = this.handleLocationClick.bind(this);
        this.clearLocationInfo = this.clearLocationInfo.bind(this);
    }
    
    /**
     * Called after the component is initialized
     */
    onInit() {
        // Subscribe to GameState location changes
        this.locationSubscription = GameState.subscribe('location', this.handleLocationChange.bind(this));
    }
    
    /**
     * Called after each render
     */
    onRender() {
        // Find and set up SVG object element
        this.mapObject = this.container.querySelector('#city-map-svg');
        
        if (this.mapObject) {
            // Remove any existing load listeners to prevent duplicates
            this.mapObject.removeEventListener('load', this.handleSvgLoad);
            // Add load event listener for SVG
            this.mapObject.addEventListener('load', this.handleSvgLoad);
            
            // If SVG is already loaded (e.g., from cache), trigger the load handler
            if (this.mapObject.contentDocument && 
                this.mapObject.contentDocument.readyState === 'complete') {
                this.handleSvgLoad();
            }
        }
    }
    
    /**
     * Handle SVG load event
     */
    handleSvgLoad() {
        ErrorUtils.tryCatch(() => {
            const svgDocument = this.mapObject.contentDocument;
            
            if (!svgDocument) {
                throw ErrorUtils.createError(
                    'Could not access SVG document', 
                    ErrorCodes.ELEMENT_NOT_FOUND
                );
            }
            
            // Inject CSS styles directly from the map.css file that's already loaded
            this.injectSvgStyles(svgDocument);
            
            // Set up location interactions
            this.setupMapInteractions(svgDocument);
            
            // Update state
            this.setState({ mapLoaded: true }, false);
            
            // Highlight current location if set
            if (this.state.currentLocation) {
                this.highlightLocation(this.state.currentLocation);
            }
            
            console.log('Map SVG loaded and initialized');
        }, 'MapComponent.handleSvgLoad');
    }
    
    /**
     * Inject CSS styles into the SVG document
     * @param {Document} svgDocument - SVG document
     */
    injectSvgStyles(svgDocument) {
        ErrorUtils.tryCatch(() => {
            // Check if style element already exists
            let styleElement = svgDocument.getElementById('injected-map-styles');
            
            if (!styleElement) {
                // Create a new style element
                styleElement = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'style');
                styleElement.id = 'injected-map-styles';
                
                // Pull styles from map.css instead of hardcoding them
                // We're using the styles from the already-loaded CSS file
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
                
                styleElement.textContent = mapStyles;
                
                // Add style to the SVG document
                const svgRoot = svgDocument.documentElement;
                svgRoot.appendChild(styleElement);
                
                console.log('Map styles injected into SVG');
            }
        }, 'MapComponent.injectSvgStyles');
    }
    
    /**
     * Set up map interactions
     * @param {Document} svgDocument - SVG document
     */
    setupMapInteractions(svgDocument) {
        ErrorUtils.tryCatch(() => {
            // Clear existing mapping
            this.state.locationElements.clear();
            
            // Find all location elements
            const locationNodes = svgDocument.querySelectorAll('.location');
            
            // Create new mapping and add event listeners
            locationNodes.forEach(node => {
                const locationName = node.getAttribute('data-location');
                
                if (locationName && LocationService.locationExists(locationName)) {
                    // Store the element reference
                    this.state.locationElements.set(locationName, node);
                    
                    // Remove existing event listeners to prevent duplicates
                    node.removeEventListener('click', this.handleLocationClick);
                    
                    // Add new click event listener
                    node.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent bubbling
                        this.handleLocationClick(locationName);
                    });
                } else if (locationName) {
                    console.warn(`Location "${locationName}" from SVG not found in LocationService`);
                }
            });
            
            // Add background click handler to clear selection
            const mapBackground = svgDocument.querySelector('.map-background');
            if (mapBackground) {
                mapBackground.removeEventListener('click', this.clearLocationInfo);
                mapBackground.addEventListener('click', this.clearLocationInfo);
            }
            
            console.log(`Mapped ${this.state.locationElements.size} locations on the map`);
        }, 'MapComponent.setupMapInteractions');
    }
    
    /**
     * Handle location click
     * @param {string} locationName - Clicked location name
     */
    handleLocationClick(locationName) {
        ErrorUtils.tryCatch(() => {
            // Skip if location is invalid or already selected
            if (!locationName || !LocationService.locationExists(locationName)) {
                return;
            }
            
            // Check if already selected
            if (locationName === this.state.currentLocation) {
                return;
            }
            
            // Get location details
            const locationDetails = LocationService.getLocationDetails(locationName);
            
            // Update GameState - this will trigger data binding updates
            GameState.setLocation(locationName);
            GameState.updateProperty('locationDetails', locationDetails);
            
            // Highlight the location on the map
            this.highlightLocation(locationName);
            
            console.log(`Location selected: ${locationName}`);
        }, 'MapComponent.handleLocationClick');
    }
    
    /**
     * Clear location selection
     */
    clearLocationInfo() {
        ErrorUtils.tryCatch(() => {
            // Only clear if there's a current selection
            if (!this.state.currentLocation) {
                return;
            }
            
            // Clear selection in GameState
            GameState.setLocation(null);
            GameState.updateProperty('locationDetails', null);
            
            // Clear active class from all location elements
            this.clearLocationHighlights();
            
            console.log('Location selection cleared');
        }, 'MapComponent.clearLocationInfo');
    }
    
    /**
     * Clear all location highlights
     */
    clearLocationHighlights() {
        if (!this.mapObject || !this.mapObject.contentDocument) {
            return;
        }
        
        const svgDocument = this.mapObject.contentDocument;
        const locationElements = svgDocument.querySelectorAll('.location');
        
        locationElements.forEach(element => {
            element.classList.remove('active');
        });
    }
    
    /**
     * Handle location change in GameState
     * @param {Object} state - Game state
     * @param {Object} data - Event data
     */
    handleLocationChange(state, data) {
        // Update component state
        this.setState({
            currentLocation: state.currentLocation,
            locationDetails: state.locationDetails
        }, false);
        
        // Highlight location on map if map is loaded
        if (this.state.mapLoaded && state.currentLocation) {
            this.highlightLocation(state.currentLocation);
        } else if (this.state.mapLoaded && !state.currentLocation) {
            this.clearLocationHighlights();
        }
    }
    
    /**
     * Highlight a location on the map
     * @param {string} locationName - Location name to highlight
     */
    highlightLocation(locationName) {
        if (!this.mapObject || !this.mapObject.contentDocument) {
            return;
        }
        
        ErrorUtils.tryCatch(() => {
            const svgDocument = this.mapObject.contentDocument;
            
            // Clear existing highlights
            this.clearLocationHighlights();
            
            // Get the location element
            const locationElement = this.state.locationElements.get(locationName);
            
            if (locationElement) {
                // Add active class to highlight
                locationElement.classList.add('active');
            } else {
                console.warn(`Could not find SVG element for location: ${locationName}`);
            }
        }, 'MapComponent.highlightLocation');
    }
    
    /**
     * Clean up component resources
     */
    onDestroy() {
        // Unsubscribe from state changes
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
        }
        
        // Clean up SVG event listeners
        if (this.mapObject && this.mapObject.contentDocument) {
            const svgDocument = this.mapObject.contentDocument;
            
            // Clean up location click listeners
            this.state.locationElements.forEach((element, locationName) => {
                element.removeEventListener('click', this.handleLocationClick);
            });
            
            // Clean up background click listener
            const mapBackground = svgDocument.querySelector('.map-background');
            if (mapBackground) {
                mapBackground.removeEventListener('click', this.clearLocationInfo);
            }
        }
    }
}

export default MapComponent;