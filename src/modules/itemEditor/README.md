# Item Editor Module (src/modules/itemEditor)

## Overview
The Item Editor Module provides a comprehensive interface for creating, editing, and managing game items. It handles item data, categorization, and provides a user-friendly editing interface with table-based display.

## Purpose
- **Item Management**: Create, edit, and delete game items
- **Category Management**: Organize items by categories (weapons, armor, potions, materials, quest)
- **Data Persistence**: Save and load item data
- **User Interface**: Provide intuitive editing forms and item tables
- **Import/Export**: Support for item data backup and sharing
- **Filtering**: Filter items by category and display relevant items

## Architecture
The module follows a class-based architecture with clear separation between data management and UI interactions, featuring tab-based category navigation.

## Key Components

### ItemEditor Class
Main controller for item management:
- Item data storage and manipulation
- UI event handling and form management
- Category-based filtering and display
- Table management and pagination
- Import/export capabilities

## How It Works

1. **Initialization**: Loads item assets and sets up UI components
2. **Category Setup**: Initializes category tabs and filtering
3. **Item Loading**: Loads item data from various sources
4. **Table Management**: Displays items in a categorized table format
5. **Filtering**: Filters items by selected category
6. **Data Operations**: Handles save, delete, import, and export operations

## Item Data Structure
```javascript
{
    id: number,
    name: string,
    category: string,     // weapons, armor, potions, materials, quest
    level: number,
    rarity: string,      // common, uncommon, rare, epic, legendary
    value: number,       // gold value
    icon: string         // emoji or icon representation
}
```

## Features
- **Item Creation**: Create new items with default values
- **Item Editing**: Modify existing item properties
- **Item Deletion**: Remove items with confirmation
- **Category Filtering**: Filter items by category tabs
- **Table Display**: Show items in organized table format
- **Data Export**: Export items to JSON format
- **Data Import**: Import items from JSON files
- **Pagination**: Handle large item lists efficiently
- **Local Storage**: Save category preferences

## Categories
- **Weapons** (⚔️): Swords, axes, bows, etc.
- **Armor** (🛡️): Helmets, chest pieces, shields, etc.
- **Potions** (🧪): Health, mana, and other consumables
- **Materials** (📦): Ores, wood, crafting materials
- **Quest** (📜): Quest-specific items

## Usage
```javascript
// Access global instance
const editor = window.itemEditor;

// Create new item
editor.createNewItem();

// Filter by category
editor.filterItemsByCategory('weapons');

// Select item
editor.selectItem(itemId);

// Export items
editor.exportItems();
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (itemEditor.css)
- Depends on HTML structure for tables and tabs
- Uses localStorage for category preferences

## Debugging
All operations include debug logging with `[ItemEditor]` prefix for easy identification and troubleshooting.
