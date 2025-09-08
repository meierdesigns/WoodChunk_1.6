# People Editor Module (modules/peopleEditor)

## Overview
The People Editor Module provides a comprehensive interface for creating, editing, and managing different races/peoples in the WoodChunk game. It handles race data, abilities, statistics, and provides a user-friendly editing interface.

## Purpose
- **Race Management**: Create, edit, and delete different races/peoples
- **Ability Assignment**: Assign abilities to specific races
- **Statistics Management**: Manage race-specific statistics and properties
- **Data Persistence**: Save and load race data
- **User Interface**: Provide intuitive editing forms and race tables
- **Import/Export**: Support for race data backup and sharing

## Architecture
The module follows a class-based architecture with clear separation between data management and UI interactions.

## Key Components

### PeopleEditor Class
Main controller for race management:
- Race data storage and manipulation
- UI event handling and form management
- Category-based filtering and display
- Ability assignment and management
- Import/export capabilities

## How It Works

1. **Initialization**: Loads race data from assets and sets up UI components
2. **Category Setup**: Initializes race category tabs and filtering
3. **Race Loading**: Loads race data from various sources
4. **Table Management**: Displays races in organized table format
5. **Ability Management**: Handles ability assignment to races
6. **Data Operations**: Handles save, delete, import, and export operations

## Race Data Structure
```javascript
{
    id: string,
    name: string,
    category: string,        // humans, elves, dwarves, orcs, goblins
    description: string,     // Race description
    abilities: string[],     // Available abilities
    statistics: {
        strength: number,
        dexterity: number,
        intelligence: number,
        health: number,
        mana: number
    },
    traits: string[],       // Race-specific traits
    icon: string           // Race icon or image
}
```

## Features
- **Race Creation**: Create new races with default values
- **Race Editing**: Modify existing race properties
- **Race Deletion**: Remove races with confirmation
- **Category Filtering**: Filter races by category tabs
- **Ability Assignment**: Assign abilities to specific races
- **Table Display**: Show races in organized table format
- **Data Export**: Export races to JSON format
- **Data Import**: Import races from JSON files
- **Local Storage**: Save changes and preferences
- **Modal Interface**: Edit races in modal dialogs

## Supported Races
- **Humans** (👤): Human race with balanced statistics
- **Elves** (🧝): Elf race with high dexterity and intelligence
- **Dwarves** (🧔): Dwarf race with high strength and health
- **Orcs** (🧌): Orc race with high strength and combat abilities
- **Goblins** (👺): Goblin race with high dexterity and stealth

## Usage
```javascript
// Access global instance
const editor = window.peopleEditor;

// Create new race
editor.createNewPerson();

// Filter by category
editor.filterByCategory('humans');

// Select race
editor.selectPerson(raceId);

// Export races
editor.exportPeoples();
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (peopleEditor.css)
- Depends on HTML structure for tables and modals
- Uses localStorage for data persistence
- Requires race asset images and data files

## Debugging
All operations include debug logging with `[PeopleEditor]` prefix for easy identification and troubleshooting.
