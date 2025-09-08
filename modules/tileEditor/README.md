# Tile Editor Module (modules/tileEditor)

## Overview
The Tile Editor Module provides a comprehensive interface for creating, editing, and managing game tiles and biomes. It features a modular architecture with advanced tile management, biome integration, and data persistence capabilities.

## Purpose
- **Tile Management**: Create, edit, and delete game tiles
- **Biome Integration**: Manage biome-specific tiles and configurations
- **Data Persistence**: Save and load tile data with multiple storage options
- **User Interface**: Provide intuitive editing forms and tile displays
- **Import/Export**: Support for tile data backup and sharing
- **Performance Optimization**: Efficient rendering and caching systems

## Architecture
The module follows a strict modular architecture with clear separation between core logic, UI management, data handling, and utilities.

## Key Components

### Core Modules
- **TileEditorCore**: Main controller with modular architecture
- **BiomeLoader**: Handles biome data loading and caching
- **TileRenderer**: Manages tile rendering and display
- **BiomeManager**: Handles biome operations and state

### Management Modules
- **UIManager**: Handles all UI-related operations
- **ModalManager**: Manages modal dialogs and forms
- **DataManager**: Handles data persistence and management
- **ToastManager**: Manages user notifications

## How It Works

1. **Initialization**: Core module loads biome data and initializes components
2. **Data Loading**: BiomeLoader loads tiles from multiple sources
3. **UI Setup**: UIManager creates interface components and controls
4. **Rendering**: TileRenderer displays tiles in various view modes
5. **Data Management**: DataManager handles persistence and export
6. **User Interaction**: ModalManager handles editing and form operations

## Tile Data Structure
```javascript
{
    id: string,
    name: string,
    category: string,        // Biome category
    type: string,           // Tile type
    image: string,          // Image path
    color: string,          // Tile color
    properties: {
        walkable: boolean,
        buildable: boolean,
        resource: string
    },
    biome: string,          // Associated biome
    tags: string[]          // Search tags
}
```

## Features
- **Tile Creation**: Create new tiles with comprehensive properties
- **Tile Editing**: Modify existing tile properties via modal dialogs
- **Tile Deletion**: Remove tiles with confirmation
- **Biome Management**: Organize tiles by biome categories
- **Multiple View Modes**: Cards, table, and grid views
- **Data Export**: Export tiles to JSON format
- **Data Import**: Import tiles from JSON files
- **Performance Caching**: Intelligent caching for improved performance
- **Search and Filter**: Advanced filtering and search capabilities
- **Drag and Drop**: Intuitive tile organization

## Biome Support
- **Forest**: Forest biome tiles and vegetation
- **Desert**: Desert biome tiles and sand elements
- **Mountain**: Mountain biome tiles and rocky terrain
- **Water**: Water biome tiles and aquatic elements
- **Snow**: Snow biome tiles and cold weather elements
- **Custom**: User-defined biome categories

## Usage
```javascript
// Access global instance
const editor = window.tileEditor;

// Create new tile
editor.createTile(tileData);

// Edit existing tile
editor.editTile(tileId);

// Export tiles
editor.exportTiles();

// Load biome data
editor.loadBiomeData(biomeName);
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (tileEditor.css)
- Depends on HTML structure for modals and forms
- Uses localStorage for data persistence
- Requires tile image assets and biome configuration files

## Performance Features
- **Parallel Loading**: Load data from multiple sources simultaneously
- **Intelligent Caching**: Cache tiles and images for better performance
- **Batch Rendering**: Render multiple tiles efficiently
- **Image Preloading**: Preload images for smooth user experience

## Debugging
All operations include debug logging with module-specific prefixes:
- `[TileEditorCore]` - Core module operations
- `[BiomeLoader]` - Data loading operations
- `[TileRenderer]` - Rendering operations
- `[UIManager]` - UI operations
- `[DataManager]` - Data management operations