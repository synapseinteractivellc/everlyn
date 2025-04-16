/**
 * Map Component
 * Handles the city map display and location interactions
 */
class MapComponent extends UIComponent {
    /**
     * Create a new map component
     * @param {string} id - Unique identifier for the component
     * @param {Object} options - Component options
     */
    constructor(id, options = {}) {
        super(id, {
            template: 'map',
            ...options
        });
    
        console.log('MapComponent constructed');
        this.mapLoaded = false;
        this.activeLocation = null;
    
        // Listen for render events
        this.on('render', () => {
            console.log('MapComponent render event triggered');
            this.ensureMapContainerExists(() => this.loadMap());
        });
        
        // Listen for location changes
        eventSystem.on('location:changed', (locationData) => {
            if (this.element) {
                // Update the location info in the map view
                const infoPanel = this.find('.location-info');
                if (infoPanel) {
                    const nameElement = infoPanel.querySelector('.panel-header h3');
                    const descElement = infoPanel.querySelector('.panel-body p');
                    
                    if (nameElement) nameElement.textContent = locationData.name;
                    if (descElement) descElement.textContent = locationData.description;
                }
            }
        });
    }

    /**
     * Ensure the map container exists before calling a callback
     * @param {Function} callback - Callback to execute when the container exists
     */
    ensureMapContainerExists(callback) {
        const mapContainer = this.find('.map-container');
        if (mapContainer) {
            callback();
        } else {
            console.error('Map container not found. Retrying...');
            setTimeout(() => this.ensureMapContainerExists(callback), 100); // Retry after 100ms
        }
    }

    /**
     * Load the map SVG into the map container
     */
    loadMap() {
        console.log('loadMap method called', this.mapLoaded);

        const mapContainer = this.find('.map-container');
        console.log('Map container:', mapContainer);

        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        console.log('Attempting to fetch map SVG');
        fetch('./assets/maps/everlyn-map.svg')
            .then(response => {
                console.log('Fetch response:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(svgContent => {
                console.log('SVG content loaded, length:', svgContent.length);
                mapContainer.innerHTML = svgContent;

                this.setupLocationInteractions();

                const activeLocation = gameEngine.getActiveLocation();
                if (activeLocation) {
                    this.highlightLocation(activeLocation);
                }
            })
            .catch(error => {
                console.error('Error loading map:', error);
                mapContainer.innerHTML = `<p>Error loading map: ${error.message}. Please try again.</p>`;
            });
    }

    /**
     * Setup location interaction handlers
     */
    setupLocationInteractions() {
        const locations = this.findAll('.location');

        locations.forEach(location => {
            // Add hover effect
            location.addEventListener('mouseenter', () => {
                this.showLocationTooltip(location);
            });

            location.addEventListener('mouseleave', () => {
                this.hideLocationTooltip();
            });

            // Add click handler
            location.addEventListener('click', () => {
                const locationId = location.id;
                const locationName = location.getAttribute('data-location');

                // Trigger location selection event
                eventSystem.trigger('location:selected', {
                    id: locationId,
                    name: locationName
                });

                // Update game engine active location
                gameEngine.setActiveLocation(locationId);
                
                // Highlight the location on the map
                this.highlightLocation(locationId);
            });
        });

        // After setup is complete, check for saved location
        const savedLocation = gameEngine.getActiveLocation();
        if (savedLocation) {
            this.highlightLocation(savedLocation);
            
            // Update location component through the event system
            const locationName = document.querySelector(`#${savedLocation}`)?.getAttribute('data-location') || '';
            eventSystem.trigger('location:selected', {
                id: savedLocation,
                name: locationName
            });
        }
    }

    /**
     * Highlight a location on the map
     * @param {string} locationId - ID of location to highlight
     */
    highlightLocation(locationId) {
        // Remove existing highlights
        const highlighted = this.findAll('.location-active');
        highlighted.forEach(el => {
            el.classList.remove('location-active');
            el.classList.remove('map-location-pulse');
        });

        // Add highlight to new location
        const location = this.find(`#${locationId}`);
        if (location) {
            location.classList.add('location-active');
            location.classList.add('map-location-pulse');
            this.activeLocation = locationId;
        }
    }

    /**
     * Show tooltip for a location
     * @param {HTMLElement} location - Location element
     */
    showLocationTooltip(location) {
        const locationName = location.getAttribute('data-location');

        // Create tooltip if it doesn't exist
        let tooltip = this.find('.map-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'map-tooltip';
            this.find('.map-container').appendChild(tooltip);
        }

        // Set tooltip content and position
        tooltip.textContent = locationName;
        tooltip.style.display = 'block';

        // Position tooltip near mouse position
        document.addEventListener('mousemove', this.moveTooltip);
    }

    /**
     * Hide location tooltip
     */
    hideLocationTooltip() {
        const tooltip = this.find('.map-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }

        // Remove mousemove listener
        document.removeEventListener('mousemove', this.moveTooltip);
    }

    /**
     * Move tooltip with mouse
     * @param {MouseEvent} event - Mouse event
     */
    moveTooltip(event) {
        const tooltip = document.querySelector('.map-tooltip');
        if (tooltip) {
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    }
}