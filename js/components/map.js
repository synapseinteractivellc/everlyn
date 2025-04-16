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
        
        this.mapLoaded = false;
        this.activeLocation = null;
        
        // Bind event handlers
        this.on('render', this.loadMap.bind(this));
        
        // Listen for location changes from the game engine
        eventSystem.on('location:changed', (locationId) => {
            this.highlightLocation(locationId);
        });
    }
    
    /**
     * Load the map SVG
     */
    loadMap() {
        if (this.mapLoaded) return;
        
        const mapContainer = this.find('.map-container');
        if (!mapContainer) return;
        
        // Clear placeholder
        mapContainer.innerHTML = '';
        
        // Load SVG file
        fetch('./assets/maps/everlyn-map.svg')
            .then(response => response.text())
            .then(svgContent => {
                // Insert SVG content
                mapContainer.innerHTML = svgContent;
                this.mapLoaded = true;
                
                // Add click handlers to locations
                this.setupLocationInteractions();
                
                // Highlight active location if set
                const activeLocation = gameEngine.getActiveLocation();
                if (activeLocation) {
                    this.highlightLocation(activeLocation);
                }
            })
            .catch(error => {
                console.error('Error loading map:', error);
                mapContainer.innerHTML = '<p>Error loading map. Please try again.</p>';
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
                this.trigger('location:selected', { 
                    id: locationId, 
                    name: locationName 
                });
                
                // Update game engine active location
                gameEngine.setActiveLocation(locationId);
            });
        });
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