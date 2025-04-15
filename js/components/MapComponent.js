// MapComponent.js - Interactive map component
// Demonstrates separation of HTML and JS for the map feature

import Component from '../core/Component.js';
import LocationService from '../services/LocationService.js';
import GameState from '../managers/GameState.js';

/**
 * Map Component - Handles the interactive city map
 * @extends Component
 */
class MapComponent extends Component {
    /**
     * Create a new map component
     * @param {string} containerId - Container element selector
     */
    constructor(containerId) {
        super(
            'city-map',               // Component ID
            'map/map.html',           // Template path
            containerId,              // Container selector
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
            locations: {},
            svgDocument: null,
            locationElements: new Map()
        };
    }
    
    /**
     * Called after the component is initialized
     */
    onInit() {
        // Get all locations from LocationService
        this.setState({
            locations: LocationService.getAllLocations()
        });
        
        // Listen for SVG load
        const svgObject = this.container.querySelector('object');
        if (svgObject) {
            svgObject.addEventListener('load', this.handleSvgLoad.bind(this));
        }
    }
    
    /**
     * Handle SVG load event
     * @param {Event} event - Load event
     */
    handleSvgLoad(event) {
        const svgObject = event.target;
        const svgDocument = svgObject.contentDocument;
        
        if (!svgDocument) {
            console.error('Could not access SVG document');
            return;
        }
        
        // Save SVG document reference
        this.setState({
            svgDocument: svgDocument
        }, false);
        
        // Inject CSS styles
        this._injectSvgStyles();
        
        // Set up map interactions
        this._setupMapInteractions();
        
        // Highlight current location if set
        if (this.state.currentLocation) {
            this._highlightLocation(this.state.currentLocation);
        }
    }
    
    /**
     * Inject CSS styles into the SVG document
     * @private
     */
    _injectSvgStyles() {
        if (!this.state.svgDocument) return;
        
        // Check if style element already exists
        let styleElement = this.state.svgDocument.getElementById('injected-map-styles');
        
        if (!styleElement) {
            // Create a new style element
            styleElement = this.state.svgDocument.createElementNS('http://www.w3.org/2000/svg', 'style');
            styleElement.id = 'injected-map-styles';
            styleElement.textContent = `
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
            
            // Add style to the SVG document
            const svgRoot = this.state.svgDocument.documentElement;
            svgRoot.appendChild(styleElement);
        }
    }
    
    /**
     * Set up map interactions
     * @private
     */
    _setupMapInteractions() {
        if (!this.state.svgDocument) return;
        
        // Clear existing location elements
        this.state.locationElements.clear();
        
        // Find all location elements in SVG
        const locationNodes = this.state.svgDocument.querySelectorAll('.location');
        
        // Create new mapping for locations
        locationNodes.forEach(node => {
            const locationName = node.getAttribute('data-location');
            
            if (locationName && LocationService.locationExists(locationName)) {
                this.state.locationElements.set(locationName, node);
                
                // Add click event listener for locations
                node.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent background click from triggering
                    this.handleLocationClick(locationName);
                });
            }
        });
        
        // Add click event to map background for clearing selection
        const mapBackground = this.state.svgDocument.querySelector('.map-background');
        if (mapBackground) {
            mapBackground.addEventListener('click', this.handleClearLocation.bind(this));
        }
    }
    
    /**
     * Handle location click
     * @param {string} locationName - Clicked location name
     */
    handleLocationClick(locationName) {
        // Get location details
        const locationDetails = LocationService.getLocationDetails(locationName);
        
        if (!locationDetails) {
            console.error(`Location details not found for "${locationName}"`);
            return;
        }
        
        // Update state with new location and details
        this.setState({
            currentLocation: locationName,
            locationDetails: locationDetails
        }, false); // Don't rerender yet
        
        // Update GameState (will trigger subscription)
        GameState.setLocation(locationName);
        
        // Highlight selected location
        this._highlightLocation(locationName);
        
        // Update location info section
        this._updateLocationInfo(locationName, locationDetails);
    }
    
    /**
     * Handle clear location (click on map background)
     */
    handleClearLocation() {
        // Clear state
        this.setState({
            currentLocation: null,
            locationDetails: null
        }, false); // Don't rerender yet
        
        // Update GameState (will trigger subscription)
        GameState.setLocation(null);
        
        // Clear active class from all location elements
        if (this.state.svgDocument) {
            this.state.svgDocument.querySelectorAll('.location.active').forEach(element => {
                element.classList.remove('active');
            });
        }
        
        // Update location info section
        const locationInfo = document.querySelector('.location-info');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <h3>Current Location</h3>
                <p>Click on a location to learn more about it.</p>
            `;
        }
    }
    
    /**
     * Highlight a location on the map
     * @param {string} locationName - Location name to highlight
     * @private
     */
    _highlightLocation(locationName) {
        if (!this.state.svgDocument) return;
        
        // Remove active class from all locations
        this.state.svgDocument.querySelectorAll('.location').forEach(element => {
            element.classList.remove('active');
        });
        
        // Add active class to selected location
        const locationElement = this.state.locationElements.get(locationName);
        
        if (locationElement) {
            locationElement.classList.add('active');
        }
    }
    
    /**
     * Update location info section
     * @param {string} locationName - Location name
     * @param {Object} details - Location details
     * @private
     */
    _updateLocationInfo(locationName, details) {
        const locationInfo = document.querySelector('.location-info');
        if (!locationInfo) return;
        
        if (details) {
            let questsHTML = '';
            
            if (details.quests && details.quests.length > 0) {
                questsHTML = `
                    <h4>Available Quests:</h4>
                    <ul>
                        ${details.quests.map(quest => `<li>${quest}</li>`).join('')}
                    </ul>
                `;
            }
            
            locationInfo.innerHTML = `
                <h3>${locationName}</h3>
                <p>${details.description}</p>
                ${questsHTML}
            `;
        }
    }
    
    /**
     * Clean up resources
     */
    onDestroy() {
        // Clean up SVG event listeners if necessary
        if (this.state.svgDocument) {
            // The event listeners will be removed automatically when the SVG is unloaded
            this.state.svgDocument = null;
        }
        
        this.state.locationElements.clear();
    }
}


export default MapComponent;