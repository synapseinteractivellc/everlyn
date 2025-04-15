// LocationService.js - Centralized location data management
// This module provides a single source of truth for location information

import ErrorUtils from '../utils/ErrorUtils.js';
import { ErrorCodes } from '../utils/ErrorUtils.js';
import PerformanceMonitor from '../utils/PerformanceMonitor.js';
import GameState from '../managers/GameState.js';

/**
 * LocationService - Manages location data for the game
 * Single source of truth for location information
 */
class LocationServiceClass {
    constructor() {
        // Initialize the location data
        this.locations = {
            // City Center Locations
            'City Square': {
                description: 'The bustling heart of Everlyn where citizens gather. The cobblestone plaza is ringed with benches and a central fountain depicts the city\'s mythical founding.',
                quests: ['Help the town crier', 'Find the lost child', 'Organize the seasonal festival']
            },
            'Market': {
                description: 'A vibrant marketplace where merchants hawk their wares. Colorful awnings shade stalls offering everything from exotic spices to finely crafted jewelry.',
                quests: ['Bargain with the merchants', 'Deliver goods to the inn', 'Track down the pickpocket']
            },
            'Inn': {
                description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers. The warm interior smells of hearth fire, fresh bread, and spilled ale.',
                quests: ['Help the innkeeper', 'Listen for rumors', 'Break up the tavern brawl']
            },
            'Stables': {
                description: 'The stables house the city\'s horses and other animals. The earthy scent of hay and leather fills the air as grooms tend to their charges.',
                quests: ['Feed the horses', 'Repair the stable roof', 'Find the missing prized stallion']
            },
            
            // Educational and Spiritual Locations
            'Library': {
                description: 'Everlyn\'s grand library houses countless tomes of knowledge. Ornate wooden shelves stretch to the vaulted ceiling, and magical glowing orbs provide reading light.',
                quests: ['Research ancient texts', 'Help the librarian organize shelves', 'Recover a stolen manuscript']
            },
            'Temple': {
                description: 'A serene sanctuary dedicated to the city\'s patron deities. Sunlight streams through stained glass windows, casting colored patterns across the stone floor.',
                quests: ['Assist with daily ceremonies', 'Cleanse the shrine', 'Investigate strange occurrences in the crypt']
            },
            
            // City Infrastructure
            'City Wall': {
                description: 'The sturdy walls protect the city from outside threats. Made of massive stone blocks, they stand thirty feet high and are wide enough for four guards to walk abreast.',
                quests: ['Patrol the wall', 'Repair damaged sections', 'Investigate suspicious activity']
            },
            'Blacksmith': {
                description: 'The forge of the city, where weapons and armor are crafted. The air shimmers with heat as hammers ring against metal day and night.',
                quests: ['Collect ore', 'Test new weapons', 'Deliver a special order to the guard captain']
            },
            'River Port': {
                description: 'A bustling dock where trade goods flow in and out of Everlyn. Wooden piers extend into the blue waters where riverboats and small merchant vessels are moored. The air smells of fish, rope, and opportunity.',
                quests: ['Help unload cargo', 'Catch a smuggler', 'Repair a damaged boat']
            },
            
            // City Gates
            'North Gate': {
                description: 'The imposing North Gate faces the mountains and trade routes to distant kingdoms. Its twin towers stand like sentinels, and the massive iron-bound wooden doors are reinforced with mythril bands.',
                quests: ['Inspect incoming caravans', 'Deliver message to the night watch', 'Investigate smuggling rumors']
            },
            'South Gate': {
                description: 'The South Gate opens to farmlands and the river port. Smaller than the North Gate but more ornate, its archway is carved with scenes of harvest and bounty.',
                quests: ['Help farmers bring goods to market', 'Clear the road of bandits', 'Repair the portcullis mechanism']
            },
            'East Gate': {
                description: 'The East Gate faces the ancient forest. Its weathered stone is engraved with protective runes, and torches in iron brackets burn with an unusually bright flame.',
                quests: ['Escort herbalists gathering ingredients', 'Clear monster nests near the road', 'Strengthen the magical wards']
            },
            'West Gate': {
                description: 'The West Gate leads to the mines and mountain passes. The sturdiest of all gates, it features additional reinforcements and a double portcullis system.',
                quests: ['Guide miners safely to work', 'Clear rock slides from the path', 'Test the new alarm system']
            },
            
            // Outskirts
            'Mines': {
                description: 'The mines are rich with resources but also fraught with danger. Iron tracks lead into dark tunnels, and the rhythmic sound of pickaxes echoes from within.',
                quests: ['Mine for gems', 'Clear out rock worms', 'Find the lost mining crew']
            },
            'Forest': {
                description: 'A dense forest east of the city. Ancient trees tower overhead, their canopy filtering sunlight into dappled patterns. Strange whispers seem to follow visitors who stray from the path.',
                quests: ['Gather rare herbs', 'Hunt for food', 'Investigate mysterious lights seen at night']
            },
            'River': {
                description: 'The river flows swiftly past the city, its waters clear and cold. Fishermen cast their lines from the banks, and children play along the shores.',
                quests: ['Catch fish for the inn', 'Repair the fishing nets', 'Investigate strange currents']
            },
            'Farmlands': {
                description: 'The fertile fields surrounding Everlyn are dotted with farms. Crops sway in the breeze, and farmers work tirelessly to bring in the harvest.',
                quests: ['Help with the harvest', 'Protect crops from pests', 'Investigate missing livestock']
            },
        };
        
        // Cache for optimization
        this._cache = new Map();
        
        // Register with GameState for location change notifications
        GameState.subscribe('location', this._onLocationChanged.bind(this));
        
        // Add a timestamp for caching and data binding optimization
        this._lastUpdated = Date.now();
    }
    
    /**
     * Get location details by name
     * @param {string} locationName - The name of the location
     * @returns {Object|null} - The location details or null if not found
     */
    getLocationDetails(locationName) {
        const end = PerformanceMonitor.start('LocationService.getLocationDetails');
        
        try {
            // Check cache first for better performance
            if (this._cache.has(locationName)) {
                return this._cache.get(locationName);
            }
            
            const location = this.locations[locationName] || null;
            
            // Cache result for future uses
            if (location) {
                this._cache.set(locationName, { ...location }); // Clone to prevent accidental mutation
            }
            
            return location;
        } catch (error) {
            ErrorUtils.logError(
                ErrorUtils.createError(
                    `Failed to get location details for "${locationName}"`,
                    ErrorCodes.UNEXPECTED_ERROR
                ),
                'LocationService.getLocationDetails'
            );
            return null;
        } finally {
            end();
        }
    }
    
    /**
     * Get all locations
     * @returns {Object} - All location data
     */
    getAllLocations() {
        return { ...this.locations }; // Return a copy to prevent accidental mutation
    }
    
    /**
     * Get all location names
     * @returns {Array<string>} - Array of all location names
     */
    getLocationNames() {
        return Object.keys(this.locations);
    }
    
    /**
     * Check if a location exists
     * @param {string} locationName - Location to check
     * @returns {boolean} - True if the location exists
     */
    locationExists(locationName) {
        return !!this.locations[locationName];
    }
    
    /**
     * Get quests for a specific location
     * @param {string} locationName - Location name
     * @returns {Array} - Array of quests or empty array if location not found
     */
    getLocationQuests(locationName) {
        const location = this.getLocationDetails(locationName);
        return location ? [...location.quests] : [];
    }
    
    /**
     * Get formatted quest HTML for a location suitable for data-binding
     * @param {string} locationName - Location name
     * @returns {string} - HTML string with quest information
     */
    getQuestsHTML(locationName) {
        const quests = this.getLocationQuests(locationName);
        
        if (quests.length === 0) {
            return '<p>No quests available in this area yet.</p>';
        }
        
        return `
            <h4>Available Quests:</h4>
            <ul>
                ${quests.map(quest => `<li>${quest}</li>`).join('')}
            </ul>
        `;
    }
    
    /**
     * Get the timestamp of the last update
     * @returns {number} - Timestamp
     */
    getLastUpdated() {
        return this._lastUpdated;
    }
    
    /**
     * Handle location changes in the game state
     * @param {Object} state - Current game state
     * @param {Object} data - Event data
     * @private
     */
    _onLocationChanged(state, data) {
        // Validate the new location exists
        if (state.currentLocation && !this.locationExists(state.currentLocation)) {
            ErrorUtils.logError(
                ErrorUtils.createError(
                    `Invalid location: "${state.currentLocation}"`,
                    ErrorCodes.INVALID_LOCATION
                ),
                'LocationService._onLocationChanged',
                ErrorUtils.LogLevel.WARN
            );
        }
        
        // Update the last updated timestamp
        this._lastUpdated = Date.now();
    }
    
    /**
     * Clear the location cache
     * @param {string} [locationName] - Optional specific location to clear from cache
     */
    clearCache(locationName) {
        if (locationName) {
            this._cache.delete(locationName);
        } else {
            this._cache.clear();
        }
        
        // Update the last updated timestamp
        this._lastUpdated = Date.now();
    }
    
    /**
     * Update or add a location
     * @param {string} locationName - Location name
     * @param {Object} locationData - Location data
     * @returns {boolean} - Success status
     */
    updateLocation(locationName, locationData) {
        if (!locationName || typeof locationName !== 'string') {
            return false;
        }
        
        try {
            // If location exists, merge with existing data
            if (this.locations[locationName]) {
                this.locations[locationName] = {
                    ...this.locations[locationName],
                    ...locationData
                };
            } else {
                // Create new location
                this.locations[locationName] = { ...locationData };
            }
            
            // Clear cache for this location
            this.clearCache(locationName);
            
            // Update the last updated timestamp
            this._lastUpdated = Date.now();
            
            return true;
        } catch (error) {
            ErrorUtils.logError(
                ErrorUtils.createError(
                    `Failed to update location "${locationName}"`,
                    ErrorCodes.UNEXPECTED_ERROR
                ),
                'LocationService.updateLocation'
            );
            return false;
        }
    }
    
    /**
     * Get a location description suitable for data binding
     * @param {string} locationName - Location name
     * @returns {string} - Location description or default message
     */
    getLocationDescription(locationName) {
        const location = this.getLocationDetails(locationName);
        return location 
            ? location.description 
            : 'No information available for this location.';
    }
}

// Create and export singleton instance
const LocationService = new LocationServiceClass();
export default LocationService;