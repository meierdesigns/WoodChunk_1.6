# Character Editor Module (src/modules/characterEditor)

## Overview
The Character Editor Module provides a comprehensive interface for creating, editing, and managing game characters. It handles character data, statistics, and provides a user-friendly editing interface.

## Purpose
- **Character Management**: Create, edit, and delete game characters
- **Statistics Handling**: Manage character attributes (health, mana, strength, etc.)
- **Data Persistence**: Save and load character data
- **User Interface**: Provide intuitive editing forms and character previews
- **Import/Export**: Support for character data backup and sharing

## Architecture
The module follows a class-based architecture with clear separation between data management and UI interactions.

## Key Components

### CharacterEditor Class
Main controller for character management:
- Character data storage and manipulation
- UI event handling and form management
- Character selection and preview functionality
- Import/export capabilities

## How It Works

1. **Initialization**: Loads character assets and sets up UI components
2. **Character Loading**: Loads character data from various sources
3. **List Management**: Displays characters in a selectable list
4. **Form Handling**: Manages character editing forms and validation
5. **Preview System**: Shows character details and statistics
6. **Data Operations**: Handles save, delete, import, and export operations

## Character Data Structure
```javascript
{
    id: number,
    name: string,
    race: string,        // human, elf, dwarf, orc, goblin
    class: string,       // warrior, mage, archer, rogue, cleric
    level: number,
    health: number,
    mana: number,
    strength: number,
    dexterity: number,
    intelligence: number,
    description: string
}
```

## Features
- **Character Creation**: Create new characters with default values
- **Character Editing**: Modify existing character properties
- **Character Deletion**: Remove characters with confirmation
- **Character Preview**: View character details and statistics
- **Data Export**: Export characters to JSON format
- **Data Import**: Import characters from JSON files
- **Form Validation**: Ensure data integrity and completeness

## Usage
```javascript
// Access global instance
const editor = window.characterEditor;

// Create new character
editor.createNewCharacter();

// Select character
editor.selectCharacter(characterId);

// Save character
editor.saveCharacter();

// Export characters
editor.exportCharacters();
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (characterEditor.css)
- Depends on HTML structure for forms and modals

## Debugging
All operations include debug logging with `[CharacterEditor]` prefix for easy identification and troubleshooting.
