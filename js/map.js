// Import the UIManager
import UIManager from './managers/ui-manager.js';

// Map interaction functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map functionality once DOM is fully loaded
    initMap();
});

function initMap() {
    // Get the SVG document once it's loaded
    const cityMap = document.getElementById('city-map');
    
    if (cityMap) {
        cityMap.addEventListener('load', function() {
            // Access the SVG document
            const svgDoc = cityMap.contentDocument;
            const locationInfo = document.querySelector('.location-info');
            
            if (svgDoc && locationInfo) {
                // Add click event listeners to map locations in the SVG
                const mapLocations = svgDoc.querySelectorAll('circle, rect, polygon, g');
                
                // Location details - can be expanded with more information for each location
                const locationDetails = {
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
                    'Forest': {
                        description: 'A dense forest east of the city. Home to various creatures and valuable resources.',
                        quests: ['Gather herbs', 'Hunt for food', 'Clear monster nests']
                    }
                };
                
                mapLocations.forEach(location => {
                    location.addEventListener('click', function(e) {
                        // Prevent event bubbling
                        e.stopPropagation();
                        
                        // Get location name from nearest text element or element ID
                        let locationName = '';
                        if (this.closest('g')) {
                            const textElement = this.closest('g').querySelector('text');
                            if (textElement) {
                                locationName = textElement.textContent;
                            }
                        } else {
                            // For standalone elements
                            const nextSibling = this.nextElementSibling;
                            if (nextSibling && nextSibling.tagName === 'text') {
                                locationName = nextSibling.textContent;
                            }
                        }
                        
                        // Update location info using UIManager
                        if (locationName) {
                            UIManager.updateLocationInfo(locationName, locationDetails[locationName]);
                        }
                    });
                    
                    // Add hover effect to make locations interactive
                    location.addEventListener('mouseover', function() {
                        this.style.cursor = 'pointer';
                        if (this.tagName === 'circle' || this.tagName === 'rect' || this.tagName === 'polygon') {
                            this.setAttribute('data-original-fill', this.getAttribute('fill'));
                            this.setAttribute('fill', '#ffcc66');
                        }
                    });
                    
                    location.addEventListener('mouseout', function() {
                        if (this.tagName === 'circle' || this.tagName === 'rect' || this.tagName === 'polygon') {
                            this.setAttribute('fill', this.getAttribute('data-original-fill'));
                        }
                    });
                });
            }
        });
    }
}

// Make function globally available
window.initMap = initMap;