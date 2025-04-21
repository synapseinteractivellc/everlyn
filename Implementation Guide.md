# Everlyn: City of Wonder - Implementation Guide

This guide outlines the architecture and implementation details for developers working on the project.

## Project Architecture

The game follows an MVC (Model-View-Controller) architecture:

### Models

Located in `js/models/`:

- **GameState** (`game-state.js`): Central state container for the entire game
- **Character** (`character.js`): Player character data and progression
- **StatPool** (`stat-pool.js`): Resources like Health, Stamina, Mana 
- **Currency** (`currency.js`): Resources like Gold, Arcana, Research
- **Skill** (`skill.js`): Character skills and progression
- **Action** (`action.js`): Actions the player can perform
- **Home** (`home.js`): Player housing and furniture

### Controllers

Located in `js/controllers/`:

- **GameController** (`game-controller.js`): Main game loop and state management
- **UIController** (`ui-controller.js`): Manages UI updates and rendering
- **ActionController** (`action-controller.js`): Handles action execution and progression
- **CharacterController** (`character-controller.js`): Manages character progression
- **CurrencyController** (`currency-controller.js`): Handles currency generation and spending
- **SkillController** (`skill-controller.js`): Manages skill progression and effects
- **HomeController** (`home-controller.js`): Handles housing and furniture
- **SaveController** (`save-controller.js`): Manages save/load functionality

### Views

The UI is primarily HTML-based with JavaScript DOM manipulation. The game has a 4-section layout:

1. Left sidebar (13%): Currencies
2. Main content area (61%): Actions, skills, house, status
3. Status sidebar (13%): Current action and stat pools
4. Log sidebar (13%): Adventure log

## Key Systems

### Game Loop

- The game ticks at 10 times per second (100ms intervals)
- Each tick updates actions, currencies, and stat pools
- The UI is updated only when necessary to improve performance

### Action System

Actions have:
- Costs (stat pools, currencies)
- Rewards (currencies, skill experience, stat pool restoration)
- Duration (time to complete)
- Prerequisites (class, skills, furniture)

Actions automatically:
- Track completion counts for future improvements
- Save progress when interrupted
- Switch to rest actions when resources are depleted
- Resume previous actions when resources are restored

### Save System

- Saves to browser localStorage
- Tracks all game state including action progress
- Processes offline progress when game is loaded
- Handles automatic saving every 30 seconds

## Implementation Tasks and Roadmap

### Current Features

- Basic game loop and UI structure
- Action system with progress tracking
- Currency and stat pool management
- Save/load with offline progress
- Basic character progression

### Planned Features

1. **Skills and Unlockables**
   - Implement skill progression effects
   - Create skill-based unlocks for actions and features

2. **Home and Furniture System**
   - Develop housing upgrades
   - Implement furniture placement with space restrictions
   - Add furniture effects

3. **Class Progression**
   - Implement class advancement from Waif to specialized classes
   - Add class-specific actions and bonuses

4. **UI Enhancements**
   - Improve notification system
   - Add tooltips for actions and resources
   - Create better visual feedback for action completion

## Development Guidelines

### Adding a New Action

1. Define the action in `GameState.actions` with all required properties
2. Set appropriate costs, rewards, and durations
3. Define skill and class requirements
4. Add unlock conditions to the appropriate controller (usually SkillController)

### Adding a New Skill

1. Define the skill in `GameState.skills`
2. Implement level-up effects in SkillController
3. Define how the skill interacts with actions and stat pools

### Adding a New Currency

1. Define the currency in `GameState.currencies`
2. Set initial values and generation rates
3. Add to any relevant actions for costs/rewards

### Adding Furniture

1. Define the furniture item with floorSpace requirements
2. Implement any effects in HomeController
3. Create unlock conditions

### Performance Considerations

- Only update UI elements when values change
- Use requestAnimationFrame for smoother UI updates
- Batch DOM updates when possible
- Track previous values to avoid unnecessary DOM manipulation