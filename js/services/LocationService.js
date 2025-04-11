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
            'City Square': {
                description: 'The bustling heart of Everlyn where citizens gather. Many important announcements are made here.',
                quests: ['Help the town crier', 'Find the lost child']
            },
            'Market': {
                description: 'A vibrant marketplace where merchants sell goods from all over the realm.',
                quests: ['Bargain with the merchants', 'Deliver goods to the inn']
            },
            'Inn': {
                description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers.',
                quests: ['Help the innkeeper', 'Listen for rumors']
            },
            'Stables': {
                description: 'The stables house the city\'s horses and other animals.',
                quests: ['Feed the horses', 'Repair the stable']
            },
            'City Wall': {
                description: 'The sturdy walls protect the city from outside threats. Guards patrol the area.',
                quests: ['Patrol the wall', 'Investigate suspicious activity']
            },
            'Blacksmith': {
                description: 'The forge of the city, where weapons and armor are crafted.',
                quests: ['Collect ore', 'Test new weapons']
            },
            'Mines': {
                description: 'The mines are rich with resources but also dangerous.',
                quests: ['Mine for gems', 'Clear out monsters']
            },
            'Forest': {
                description: 'A dense forest east of the city. Home to various creatures and valuable resources.',
                quests: ['Gather herbs', 'Hunt for food', 'Clear monster nests']
            }
        };
        
        // Cache for optimization
        this._cache = new Map();
        
        // Register with GameState for location change notifications
        GameState.subscribe('location', this._onLocationChanged.bind(this));
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
}

// Create and export singleton instance
const LocationService = new LocationServiceClass();
export default LocationService;