# Item Editor Module (modules/itemEditor)

## Overview
The Item Editor Module provides a comprehensive interface for creating, editing, and managing game items. It handles item data, categorization, and provides a user-friendly editing interface with advanced features like caching, performance optimization, and dynamic column configuration.

## Purpose
- **Item Management**: Create, edit, and delete game items
- **Category Management**: Organize items by categories (weapons, armor, potions, materials, quest)
- **Data Persistence**: Save and load item data with localStorage integration
- **User Interface**: Provide intuitive editing forms and item tables
- **Import/Export**: Support for item data backup and sharing
- **Performance Optimization**: Caching and efficient data handling
- **Dynamic Configuration**: Configurable columns and sorting

## Architecture
The module follows a class-based architecture with clear separation between data management and UI interactions, featuring advanced caching and performance optimizations.

## Key Components

### ItemEditor Class
Main controller for item management:
- Item data storage and manipulation
- UI event handling and form management
- Category-based filtering and display
- Table management with dynamic columns
- Performance caching system
- Import/export capabilities

## How It Works

1. **Initialization**: Loads item assets and sets up UI components
2. **Caching Setup**: Initializes performance caching system
3. **Category Setup**: Initializes category tabs and filtering
4. **Item Loading**: Loads item data with caching optimization
5. **Table Management**: Displays items with dynamic column configuration
6. **Filtering**: Filters items by selected category
7. **Data Operations**: Handles save, delete, import, and export operations

## Item Data Structure
```javascript
{
    id: number,
    name: string,
    category: string,     // weapons, armor, potions, materials, quest
    level: number,
    rarity: string,      // common, uncommon, rare, epic, legendary
    value: number,       // gold value
    icon: string,        // emoji or icon representation
    // Additional properties based on category
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
- **Performance Caching**: Cache system for improved performance
- **Dynamic Columns**: Configurable table columns per category
- **Local Storage**: Save preferences and item data
- **Cache Busting**: Handle image cache busting for assets

## Performance Optimizations
- **Item Cache**: Map-based caching for loaded items
- **Loading Cache**: Prevents duplicate loading operations
- **Cache Expiry**: 5-minute cache expiration
- **Efficient Rendering**: Optimized table updates

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
- Uses localStorage for preferences and data persistence
- Requires itemEditorOptimized.js for advanced features

## Debugging
All operations include debug logging with `[ItemEditor]` prefix for easy identification and troubleshooting.
