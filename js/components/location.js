/**
 * Location Component
 * Manages locations and their information
 */
class LocationComponent extends Component {
    /**
     * Create a new location component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     */
    constructor(id, options = {}) {
        super(id, options);
        
        // Initialize locations data structure
        this.setState({
            currentLocation: {
                id: null,
                name: "No Location Selected",
                description: "Navigate to a location on the map."
            },
            locations: {
                'location-city-square': {
                    id: 'location-city-square',
                    name: 'City Square',
                    description: 'The bustling heart of Everlyn where citizens gather. The cobblestone plaza is ringed with benches and a central fountain depicts the city\'s mythical founding.',
                    unlocked: true
                },
                'location-market': {
                    id: 'location-market',
                    name: 'Market',
                    description: 'A vibrant marketplace where merchants hawk their wares. Colorful awnings shade stalls offering everything from exotic spices to finely crafted jewelry.',
                    unlocked: true
                },
                'location-inn': {
                    id: 'location-inn',
                    name: 'Inn',
                    description: 'The Sleeping Dragon Inn offers rest and refreshment to weary travelers. The warm interior smells of hearth fire, fresh bread, and spilled ale.',
                    unlocked: true
                },
                'location-stables': {
                    id: 'location-stables',
                    name: 'Stables',
                    description: 'The stables house the city\'s horses and other animals. The earthy scent of hay and leather fills the air as grooms tend to their charges.',
                    unlocked: true
                },
                'location-library': {
                    id: 'location-library',
                    name: 'Library',
                    description: 'Everlyn\'s grand library houses countless tomes of knowledge. Ornate wooden shelves stretch to the vaulted ceiling, and magical glowing orbs provide reading light.',
                    unlocked: true
                },
                'location-temple': {
                    id: 'location-temple',
                    name: 'Temple',
                    description: 'A serene sanctuary dedicated to the city\'s patron deities. Sunlight streams through stained glass windows, casting colored patterns across the stone floor.',
                    unlocked: true
                },
                'location-city-wall': {
                    id: 'location-city-wall',
                    name: 'City Wall',
                    description: 'The sturdy walls protect the city from outside threats. Made of massive stone blocks, they stand thirty feet high and are wide enough for four guards to walk abreast.',
                    unlocked: true
                },
                'location-blacksmith': {
                    id: 'location-blacksmith',
                    name: 'Blacksmith',
                    description: 'The forge of the city, where weapons and armor are crafted. The air shimmers with heat as hammers ring against metal day and night.',
                    unlocked: true
                },
                'location-river-port': {
                    id: 'location-river-port',
                    name: 'River Port',
                    description: 'A bustling dock where trade goods flow in and out of Everlyn. Wooden piers extend into the blue waters where riverboats and small merchant vessels are moored. The air smells of fish, rope, and opportunity.',
                    unlocked: true
                },
                'location-north-gate': {
                    id: 'location-north-gate',
                    name: 'North Gate',
                    description: 'The imposing North Gate faces the mountains and trade routes to distant kingdoms. Its twin towers stand like sentinels, and the massive iron-bound wooden doors are reinforced with mythril bands.',
                    unlocked: true
                },
                'location-south-gate': {
                    id: 'location-south-gate',
                    name: 'South Gate',
                    description: 'The South Gate opens to farmlands and the river port. Smaller than the North Gate but more ornate, its archway is carved with scenes of harvest and bounty.',
                    unlocked: true
                },
                'location-east-gate': {
                    id: 'location-east-gate',
                    name: 'East Gate',
                    description: 'The East Gate faces the ancient forest. Its weathered stone is engraved with protective runes, and torches in iron brackets burn with an unusually bright flame.',
                    unlocked: true
                },
                'location-west-gate': {
                    id: 'location-west-gate',
                    name: 'West Gate',
                    description: 'The West Gate leads to the mines and mountain passes. The sturdiest of all gates, it features additional reinforcements and a double portcullis system.',
                    unlocked: true
                },
                'location-mines': {
                    id: 'location-mines',
                    name: 'Mines',
                    description: 'The mines are rich with resources but also fraught with danger. Iron tracks lead into dark tunnels, and the rhythmic sound of pickaxes echoes from within.',
                    unlocked: true
                },
                'location-forest': {
                    id: 'location-forest',
                    name: 'Forest',
                    description: 'A dense forest east of the city. Ancient trees tower overhead, their canopy filtering sunlight into dappled patterns. Strange whispers seem to follow visitors who stray from the path.',
                    unlocked: true
                },
                'location-river': {
                    id: 'location-river',
                    name: 'River',
                    description: 'The river flows swiftly past the city, its waters clear and cold. Fishermen cast their lines from the banks, and children play along the shores.',
                    unlocked: true
                },
                'location-farmlands-east': {
                    id: 'location-farmlands-east',
                    name: 'Farmlands',
                    description: 'The fertile fields surrounding Everlyn are dotted with farms. Crops sway in the breeze, and farmers work tirelessly to bring in the harvest.',
                    unlocked: true
                }
            }
        }, false);
        
        // Listen for location selection events
        eventSystem.on('location:selected', this.handleLocationSelected.bind(this));
    }
    
    /**
     * Handle location selection event
     * @param {Object} data - Location data with id and name
     */
    handleLocationSelected(data) {
        const locationId = data.id;
        const location = this.getLocation(locationId);
        
        if (location) {
            // Update current location in state
            this.setState({
                currentLocation: {
                    id: locationId,
                    name: location.name,
                    description: location.description
                }
            });
            
            // Trigger an event that templates can listen for
            eventSystem.trigger('location:changed', this.state.currentLocation);
        }
    }
    
    /**
     * Set the active location
     * @param {string} locationId - ID of the location to set as active
     */
    setActiveLocation(locationId) {
        const location = this.getLocation(locationId);
        if (location) {
            this.setState({ 
                currentLocation: {
                    id: locationId,
                    name: location.name,
                    description: location.description
                }
            });
        }
        return this;
    }
    
    /**
     * Get a location by ID
     * @param {string} locationId - Location ID
     * @returns {Object|null} - Location object or null if not found
     */
    getLocation(locationId) {
        return this.state.locations[locationId] || null;
    }
    
    /**
     * Update the location panel with the selected location information
     * @param {string} locationId - ID of the selected location
     */
    updateLocationPanel(locationId) {
        const location = this.getLocation(locationId);
        if (!location) return;
        
        // Find all panels to update
        const locationPanel = document.querySelector('[data-component-id="location-panel"]');
        const mapLocationInfo = document.querySelector('.map-view .location-info');
        const actionsLocationInfo = document.querySelector('.actions-view .location-header');
        
        // Update main location panel
        if (locationPanel) {
            const panelHeader = locationPanel.querySelector('.panel-header h3');
            const locationDescription = locationPanel.querySelector('.location-description');
            
            if (panelHeader) panelHeader.textContent = location.name;
            if (locationDescription) locationDescription.textContent = location.description;
        }
        
        // Update map location info
        if (mapLocationInfo) {
            const nameElement = mapLocationInfo.querySelector('.location-name');
            const descriptionElement = mapLocationInfo.querySelector('.location-description');
            
            if (nameElement) nameElement.textContent = location.name;
            if (descriptionElement) descriptionElement.textContent = location.description;
        }
        
        // Update actions location info
        if (actionsLocationInfo) {
            const nameElement = actionsLocationInfo.querySelector('.current-location-name');
            const descriptionElement = actionsLocationInfo.querySelector('.current-location-description');
            
            if (nameElement) nameElement.textContent = location.name;
            if (descriptionElement) descriptionElement.textContent = location.description;
        }
    }
}