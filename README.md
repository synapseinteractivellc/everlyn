# Everlyn: City of Wonder

A 2D Web-based Idle/Clicker game set in a fantasy RPG world.

## Project Overview

Everlyn: City of Wonder is an incremental game where players start as a "Waif" and progress through various character classes by gathering resources, upgrading skills, and exploring the city of Everlyn.

### Features

- **Component-based Architecture**: Clean separation of game logic and UI
- **Template System**: Using Handlebars for modular UI elements
- **Resource Management**: Gather materials and currencies to progress
- **Character Progression**: Level up and advance through class tiers
- **Location-based Gameplay**: Explore different areas of the city
- **Idle Mechanics**: Progress continues even when not actively playing
- **Local Storage**: Save and load game progress

## Project Structure

```
/everlyn
  /css
    - reset.css          # CSS reset for consistent styling
    - themes.css         # Theme variables (colors, spacing)
    - base.css           # Base styling (typography, colors)
    - components.css     # Styles for reusable components
    - layout.css         # Layout and structure styles
    - animations.css     # Animation definitions
  /js
    /core
      - engine.js        # Core game state and logic
      - events.js        # Event system
      - storage.js       # LocalStorage management
    /components
      - component.js     # Base Component class
      - ui.js            # UI-related components
      - resource.js      # Resource management
      - character.js     # Character stats and progression
      - location.js      # Location and actions
      - action.js        # Game actions
    /templates
      - templateLoader.js # Template loading utility
    /utils
      - helpers.js       # Utility functions
    - main.js            # Application entry point
  /templates
    - welcome.html       # Welcome/character creation screen
    - game.html          # Main game interface
    - location.html      # Location template
    - inventory.html     # Inventory panel
    - character.html     # Character stats panel
  /assets
    /images
      - favicon.ico
    /maps
      - everlyn-map.svg  # City map
  - index.html           # Main HTML entry point
  - README.md            # Project documentation
```

## Implementation Plan

### Phase 1: Foundation (DONE)
- [x] Set up project structure
- [x] Create component architecture
- [x] Implement template system
- [x] Design basic CSS framework
- [x] Set up storage system
- [x] Create character creation screen

### Phase 2: Core Game Loop
- [ ] Implement location system
- [ ] Create resource gathering mechanics
- [ ] Add basic skills
- [ ] Integrate map navigation
- [ ] Implement actions system

### Phase 3: Progression System
- [ ] Expand character progression
- [ ] Add class advancement
- [ ] Implement inventory system
- [ ] Create item crafting
- [ ] Add skill improvements

### Phase 4: Content and Polish
- [ ] Add all city locations
- [ ] Create more resources and items
- [ ] Implement events and quests
- [ ] Add achievements
- [ ] Polish UI and animations

## Development

The game uses plain JavaScript with a custom component system. Templates are handled via Handlebars for clean separation of concerns.

### Key Concepts:

- **Components**: Encapsulated pieces of game logic with state management
- **Templates**: Handlebars templates for UI rendering
- **Events**: Communication system between components
- **Resources**: Materials and currencies used for progression
- **Actions**: Activities players can perform in different locations

## License

MIT License - See LICENSE file for details.

## Credits

Developed by Synapse Interactive LLC