# Hex Map Editor Module (modules/hexMapEditor)

## Overview
The Hex Map Editor Module provides a comprehensive interface for creating and editing hexagonal maps. It features a modular architecture with real-time editing capabilities, biome management, and advanced map tools.

## Purpose
- **Hex Map Creation**: Create and edit hexagonal maps with various terrain types
- **Biome Management**: Manage different biome types and their properties
- **Real-time Editing**: Interactive map editing with immediate visual feedback
- **Map Export**: Export maps to various formats (PNG, JSON)
- **Layer Management**: Handle multiple map layers (terrain, streets, etc.)
- **Tool System**: Advanced editing tools and brushes

## Architecture
The module follows a strict modular architecture with clear separation between core logic, rendering, and user interface components.

## Key Components

### Core Module (MapCore)
- Map data management and state
- Tile and layer management
- Biome configuration and loading
- Settings and preferences
- Observer pattern for event handling

### Renderer Module (MapRenderer)
- Canvas-based rendering system
- Hexagonal grid visualization
- Real-time drawing and interaction
- Camera controls and zoom management
- Performance optimization

### UI Module (UIManager)
- User interface components
- Tool panels and controls
- Settings management
- Event handling and user interactions
- Modal dialogs and forms

### Additional Modules
- **BiomeTileSelector**: Biome selection and management
- **ToolsModule**: Advanced editing tools and brushes
- **SurroundingChecker**: Tile adjacency and validation
- **FPSViewer**: Performance monitoring

## How It Works

1. **Initialization**: Core module loads biome data and settings
2. **Rendering Setup**: Renderer initializes canvas and drawing context
3. **UI Setup**: UI module creates interface components and controls
4. **Tool Integration**: Tools module provides editing capabilities
5. **Real-time Editing**: User interactions update map data and visuals
6. **Data Persistence**: Maps are saved to localStorage

## Map Data Structure
```javascript
{
    settings: {
        width: number,
        height: number,
        hexSize: number,
        orientation: string,
        spacing: number
    },
    tiles: Map<position, tileData>,
    layers: {
        terrain: Map<position, terrainData>,
        streets: Map<position, streetData>
    }
}
```

## Features
- **Hexagonal Grid**: Full hexagonal grid system with customizable properties
- **Biome Types**: Support for various biome types (forest, mountain, water, desert, snow)
- **Real-time Editing**: Click and draw on the map with immediate feedback
- **Layer System**: Multiple layers for different map elements
- **Tool System**: Advanced tools including brushes and selection tools
- **Export Options**: Export maps to PNG and JSON formats
- **Local Storage**: Save and load maps locally
- **Performance Monitoring**: FPS tracking and performance optimization
- **Responsive Design**: Adapts to different screen sizes

## Supported Biomes
- **Forest**: Green terrain with tree elements
- **Mountain**: Rocky terrain with elevation
- **Water**: Blue water tiles with flow patterns
- **Desert**: Sandy terrain with heat effects
- **Snow**: White terrain with cold effects

## Usage
```javascript
// Initialize map editor
const canvas = document.getElementById('mapCanvas');
const core = new MapCore();
const editor = new MapEditor(canvas, core);
editor.initializeComponents();

// Load saved map
core.loadMap();

// Save current map
core.saveMap();

// Export map
core.exportMap('png');
```

## Dependencies
- Requires HTML5 Canvas support
- Uses CSS for styling and layout
- Depends on HTML structure for UI components
- Uses localStorage for map persistence
- Requires biome configuration files

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Debugging
All operations include debug logging with module-specific prefixes:
- `[MapCore]` - Core module operations
- `[MapRenderer]` - Rendering operations
- `[UIManager]` - UI operations
- `[MapEditor]` - Main editor operations