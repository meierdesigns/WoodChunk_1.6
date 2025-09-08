# Abilities Editor Module (modules/abilitiesEditor)

## Overview
The Abilities Editor Module provides a comprehensive interface for creating, editing, and managing game abilities. It follows a modular architecture pattern with clear separation between core logic, game mechanics, and user interface components.

## Purpose
- **Ability Management**: Create, edit, and delete game abilities
- **Category Management**: Organize abilities by categories (combat, craft, magic, social)
- **Race Integration**: Assign abilities to specific races
- **Data Persistence**: Save and load ability data with localStorage integration
- **User Interface**: Provide intuitive editing forms and ability tables
- **Import/Export**: Support for ability data backup and sharing

## Architecture
The module follows a strict modular architecture with three main components:

### Core Module (AbilitiesCore)
- Data management and configuration
- Business logic and state management
- Asset loading and data persistence
- Category filtering and search functionality

### Game Module (AbilitiesGame)
- Game mechanics and ability logic
- Race management and assignments
- Ability icons and visual elements
- Evolution and progression systems

### UI Module (AbilitiesUI)
- User interface components
- Event handling and user interactions
- Modal dialogs and forms
- Table management and display

## How It Works

1. **Initialization**: Core module loads abilities from assets and localStorage
2. **Module Coordination**: Main AbilitiesEditor orchestrates all modules
3. **UI Setup**: UI module creates interface components and event listeners
4. **Data Management**: Core module handles all data operations
5. **Game Logic**: Game module processes ability mechanics and race assignments
6. **User Interaction**: UI module manages user interactions and updates

## Ability Data Structure
```javascript
{
    id: string,
    name: string,
    category: string,        // combat, craft, magic, social
    type: string,           // passive, active, toggle
    element: string,        // fire, water, earth, air, etc.
    races: string[],        // Available races
    level: number,          // Required level
    description: string,    // Ability description
    effects: object,        // Ability effects and modifiers
    evolutions: string[],   // Ability evolution paths
    icon: string           // Ability icon or image
}
```

## Features
- **Ability Creation**: Create new abilities with comprehensive properties
- **Ability Editing**: Modify existing ability properties via modal dialogs
- **Ability Deletion**: Remove abilities with confirmation
- **Category Filtering**: Filter abilities by category tabs
- **Race Assignment**: Assign abilities to specific races
- **Table Display**: Show abilities in organized table format
- **Data Export**: Export abilities to JSON format
- **Data Import**: Import abilities from JSON files
- **Local Storage**: Save changes and preferences
- **Modal Interface**: Edit abilities in modal dialogs

## Categories
- **Combat** (⚔️): Combat-related abilities and skills
- **Craft** (🔨): Crafting and production abilities
- **Magic** (🔮): Magical abilities and spells
- **Social** (👥): Social interaction abilities

## Race Support
- **Humans** (👤): Human-specific abilities
- **Elves** (🧝): Elf-specific abilities
- **Dwarves** (🧔): Dwarf-specific abilities
- **Orcs** (🧌): Orc-specific abilities
- **Goblins** (👺): Goblin-specific abilities

## Usage
```javascript
// Access global instance
const editor = window.abilitiesEditor;

// Get abilities
const abilities = editor.getAbilities();

// Get filtered abilities
const filtered = editor.getFilteredAbilities();

// Get available races
const races = editor.getAvailableRaces();
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (abilitiesEditor.css)
- Depends on HTML structure for tables and modals
- Uses localStorage for data persistence
- Requires AbilitiesTable.js and AbilityDetailsModal.js

## Debugging
All operations include debug logging with module-specific prefixes:
- `[AbilitiesEditor]` - Main orchestrator
- `[AbilitiesCore]` - Core module
- `[AbilitiesGame]` - Game module
- `[AbilitiesUI]` - UI module
