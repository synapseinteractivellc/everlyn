// LocationService.js - Centralized location data management
// This module provides a single source of truth for location information

/**
 * LocationService - Manages location data for the game
 */
const LocationService = {
    /**
     * Get location details by name
     * @param {string} locationName - The name of the location
     * @returns {Object|null} - The location details or null if not found
     */
    getLocationDetails: function(locationName) {
        return this.locations[locationName] || null;
    },
    
    /**
     * Get all locations
     * @returns {Object} - All location data
     */
    getAllLocations: function() {
        return this.locations;
    },
    
    /**
     * Location data store - single source of truth for location information
     */
    locations: {
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
    }
};

export default LocationService;