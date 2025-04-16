# Everlyn: City of Wonder - Implementation Plan

This document outlines the detailed implementation plan for continuing development of Everlyn: City of Wonder.

## Completed Components

- [x] Project Structure
- [x] CSS Framework (themes, layout, components, etc.)
- [x] Core Game Engine
- [x] Events System
- [x] Storage System
- [x] Base Component Class
- [x] UI Component Class
- [x] Character Component
- [x] Resource Component
- [x] Template Loader
- [x] Utility Helpers
- [x] Initial Templates (welcome, game)

## Next Steps

### 1. Location System (Priority: HIGH)

The location system is central to the game as it determines where the player can go and what actions they can perform.

**Tasks:**
- [ ] Create Location component class
- [ ] Develop location data structure
- [ ] Implement location navigation
- [ ] Add location template rendering
- [ ] Integrate map visualization
- [ ] Set up location-specific actions

**Files to Create/Modify:**
- `/js/components/location.js`
- `/templates/location.html` (already created)
- Update `/js/main.js` to handle location changes

### 2. Actions System (Priority: HIGH)

Actions are the primary way players interact with the game. They include resource gathering, skill training, etc.

**Tasks:**
- [ ] Create Action component class
- [ ] Define action data structure
- [ ] Implement action execution logic
- [ ] Create action UI components
- [ ] Add action cooldowns and timers
- [ ] Implement action requirements (resources, skills, etc.)

**Files to Create/Modify:**
- `/js/components/action.js`
- Update location templates to include actions
- Add action-related CSS to `/css/components.css`

### 3. Inventory System (Priority: MEDIUM)

The inventory system allows players to collect and manage items.

**Tasks:**
- [ ] Expand Resource component for inventory management
- [ ] Create item definitions
- [ ] Implement item acquisition logic
- [ ] Add inventory UI
- [ ] Create item usage mechanics
- [ ] Add storage capacity limitations

**Files to Create/Modify:**
- `/js/components/inventory.js`
- `/templates/inventory.html`
- Update character component to integrate with inventory

### 4. Skills System (Priority: MEDIUM)

Skills represent the player's abilities and can be improved through actions.

**Tasks:**
- [ ] Create Skill component class
- [ ] Define skill data structure
- [ ] Implement skill progression
- [ ] Add skill-based action modifiers
- [ ] Create skill UI components
- [ ] Implement skill unlock requirements

**Files to Create/Modify:**
- `/js/components/skill.js`
- `/templates/skills.html`
- Update character component to track skills

### 5. Class Progression System (Priority: MEDIUM)

Class progression allows players to advance from Waif to higher tiers.

**Tasks:**
- [ ] Expand character component for class progression
- [ ] Define class tiers and requirements
- [ ] Implement class advancement mechanics
- [ ] Add class-specific abilities and bonuses
- [ ] Create class progression UI
- [ ] Implement class-specific actions

**Files to Create/Modify:**
- Update `/js/components/character.js` 
- Create `/templates/class-progression.html`
- Add class-specific assets

### 6. Game Loop and Idle Mechanics (Priority: HIGH)

Implement the core game loop including idle progression.

**Tasks:**
- [ ] Refine game tick system
- [ ] Implement resource generation over time
- [ ] Add offline progression calculation
- [ ] Create time-based event triggers
- [ ] Implement stamina/health regeneration
- [ ] Add notifications for completed actions

**Files to Create/Modify:**
- Update `/js/core/engine.js`
- Create `/js/components/time.js` for time-based mechanics

### 7. UI Enhancements and Polish (Priority: LOW)

Improve the game's visual appeal and user experience.

**Tasks:**
- [ ] Add animations for actions and rewards
- [ ] Implement tooltips for game elements
- [ ] Create visual feedback for progression
- [ ] Add sound effects (optional)
- [ ] Implement settings panel
- [ ] Add accessibility features

**Files to Create/Modify:**
- Update CSS files
- Create `/js/components/ui/tooltip.js`
- Create `/js/components/ui/notification.js`

## Implementation Order

1. **Location System** - This provides the foundation for where actions take place
2. **Actions System** - Enables player interaction with the game world
3. **Game Loop and Idle Mechanics** - Establishes the core progression pattern
4. **Inventory System** - Allows collecting and using items
5. **Skills System** - Provides progression through abilities
6. **Class Progression** - Offers long-term advancement goals
7. **UI Enhancements** - Polishes the player experience

## Technical Considerations

### Data Structures

Define clear data structures for:
- Locations
- Actions
- Items
- Skills
- Character classes
- Resources

### State Management

Ensure proper state management with:
- Clear component responsibilities
- Event-driven communication
- Serialization for save/load
- Proper encapsulation

### Performance

Consider performance implications:
- Minimize DOM updates
- Use efficient data structures
- Implement UI virtualization for large collections
- Optimize game loop for idle mechanics

## Next Immediate Steps

1. Create the Location component
2. Implement basic location navigation
3. Add the Actions system
4. Hook up the map to the location system
5. Implement basic resource gathering actions

Once these components are in place, the basic game loop will be established, and content can be added incrementally.