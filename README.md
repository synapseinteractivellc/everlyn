# Everlyn: City of Wonder

A text-based fantasy city idle/clicker game built with vanilla JavaScript, HTML, and CSS.

## Overview

Everlyn: City of Wonder is a browser-based idle game where players start as a lowly "Waif" in a fantasy city and progress through various character classes, skills, and resources. The game features:

- Resource management with multiple currencies and stat pools
- Skill progression system that unlocks new actions and abilities
- Housing system with furniture that provides bonuses
- Character progression through class advancement
- Action system with automatic switching between active and rest actions

## Game Structure

The game follows the Model-View-Controller (MVC) architecture:

- **Models**: Define the data structures for game state, characters, actions, etc.
- **Controllers**: Handle game logic, user interactions, and state updates
- **Views**: Manage the UI rendering and user interface elements

## Game Mechanics

### Character Progression
Players start as a "Waif" and can progress to trainee classes (Warrior, Mage, Clerk, Scout, Thief) and beyond.

### Resources
- **Stat Pools**: Health, Stamina, Mana, etc. that are consumed by actions
- **Currencies**: Gold, Arcana, Research, etc. that can be spent on various upgrades

### Actions
Players can perform various actions that:
- Consume stat pools or currencies
- Generate currencies or resources
- Grant skill experience
- Apply various effects

### Housing
As players progress, they can upgrade from being homeless to increasingly better accommodations, and furnish their homes with various items that provide benefits.

## Technical Features

- Local storage save/load system with offline progress
- Action progress persistence (continue actions from where you left off)
- Automatic switching between active and rest actions
- Performance optimizations for UI updates

## Installation

1. Clone the repository
2. Open `index.html` in your browser
3. No additional setup or build process required

## License

MIT License - See LICENSE file for details