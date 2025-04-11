// Import the UIManager
import UIManager from './managers/ui-manager.js';

// Map interaction functionality
document.addEventListener('DOMContentLoaded', () => {
  // Location details object - moved outside function for better memory management
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

  // Create a mapping between SVG elements and their locations
  // This will be populated once the SVG loads
  const elementToLocationMap = new Map();

  // Initialize the map functionality
  initMap();

  /**
   * Initialize map interactivity
   * Uses event delegation for better performance
   */
  function initMap() {
    const cityMap = document.getElementById('city-map');
    
    if (!cityMap) {
      console.warn('City map element not found');
      return;
    }
    
    cityMap.addEventListener('load', () => {
      try {
        const svgDoc = cityMap.contentDocument;
        if (!svgDoc) {
          console.warn('Could not access SVG document');
          return;
        }
        
        // Create mapping for locations
        createLocationMapping(svgDoc);
        
        // Add event delegation for the entire SVG
        setupMapInteractivity(svgDoc);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    });
  }

  /**
   * Map SVG elements to their location names
   * @param {Document} svgDoc - The SVG document
   */
  function createLocationMapping(svgDoc) {
    // Find all location elements
    const locationMappings = [
      { 
        selector: 'rect[x="220"][y="170"]', // City Square
        locationName: 'City Square'
      },
      { 
        selector: 'g[transform*="translate(170, 200)"]', // Market
        locationName: 'Market' 
      },
      { 
        selector: 'g[transform*="translate(450, 200)"]', // Forest
        locationName: 'Forest' 
      },
      // Inn has separate parts that need to be mapped individually
      { 
        selector: 'rect[x="280"][y="140"]', // Inn building
        locationName: 'Inn' 
      },
      { 
        selector: 'polygon[points*="280,140"]', // Inn roof
        locationName: 'Inn' 
      }
    ];

    // Create the mapping
    locationMappings.forEach(mapping => {
      const elements = svgDoc.querySelectorAll(mapping.selector);
      elements.forEach(element => {
        elementToLocationMap.set(element, mapping.locationName);
        
        // For group elements, also map their children
        if (element.tagName === 'g') {
          Array.from(element.children).forEach(child => {
            elementToLocationMap.set(child, mapping.locationName);
          });
        }
      });
    });
  }

  /**
   * Set up map interactivity using event delegation
   * @param {Document} svgDoc - The SVG document object
   */
  function setupMapInteractivity(svgDoc) {
    // Add a single event listener to the entire SVG using event delegation
    svgDoc.addEventListener('click', handleMapClick);
    
    // Add CSS for hover effects
    addHoverStylesTo(svgDoc);
  }

  /**
   * Handle click events on the map
   * @param {Event} event - The click event
   */
  function handleMapClick(event) {
    // Find the target element
    const target = event.target;
    
    // Prevent handling clicks on the background
    if (target.tagName === 'rect' && target.getAttribute('width') === '500') {
      return;
    }
    
    // Find the location name using our mapping
    let locationName = elementToLocationMap.get(target);
    
    // If we don't have a direct mapping, try parent elements
    if (!locationName) {
      // Try to find if any parent is mapped
      let parentElement = target.parentElement;
      while (parentElement && !locationName) {
        locationName = elementToLocationMap.get(parentElement);
        parentElement = parentElement.parentElement;
      }
      
      // Fallback to the old method if mapping doesn't work
      if (!locationName) {
        locationName = findLocationName(target);
      }
    }
    
    if (locationName && locationDetails[locationName]) {
      UIManager.updateLocationInfo(locationName, locationDetails[locationName]);
    }
  }

  /**
   * Fallback method to find the location name from a clicked element
   * @param {Element} element - The clicked element
   * @returns {string|null} - The location name or null if not found
   */
  function findLocationName(element) {
    // First check if element is inside a group
    const group = element.closest('g');
    
    if (group) {
      const textElement = group.querySelector('text');
      if (textElement) {
        return textElement.textContent;
      }
    }
    
    // For standalone elements, check for nearby text elements
    const textElements = element.ownerDocument.querySelectorAll('text');
    const elementRect = element.getBoundingClientRect();
    
    // Find the nearest text element
    let nearestText = null;
    let shortestDistance = Number.MAX_VALUE;
    
    textElements.forEach(textElement => {
      const textRect = textElement.getBoundingClientRect();
      
      // Calculate center points
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;
      const textCenterX = textRect.left + textRect.width / 2;
      const textCenterY = textRect.top + textRect.height / 2;
      
      // Calculate distance between centers
      const distance = Math.sqrt(
        Math.pow(elementCenterX - textCenterX, 2) + 
        Math.pow(elementCenterY - textCenterY, 2)
      );
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestText = textElement;
      }
    });
    
    if (nearestText && shortestDistance < 100) { // 100 is an arbitrary threshold
      return nearestText.textContent;
    }
    
    return null;
  }

  /**
   * Add CSS for hover effects instead of manipulating attributes
   * @param {Document} svgDoc - The SVG document
   */
  function addHoverStylesTo(svgDoc) {
    // Create a style element
    const styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    
    // Define hover styles - updated to handle all clickable elements
    styleElement.textContent = `
      /* Make interactive elements have a pointer cursor */
      rect:not([width="500"]):not([x="100"][y="80"]), 
      polygon, 
      g > rect, 
      g > circle,
      circle:not([r="40"]) {
        cursor: pointer;
      }
      
      /* Highlight elements on hover */
      rect:hover:not([width="500"]):not([x="100"][y="80"]), 
      polygon:hover, 
      g > rect:hover, 
      g > circle:hover,
      circle:hover:not([r="40"]) {
        fill: #ffcc66 !important;
        transition: fill 0.3s ease;
      }
    `;
    
    // Add the style element to the SVG
    svgDoc.querySelector('svg').appendChild(styleElement);
  }
});