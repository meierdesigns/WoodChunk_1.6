# Color Editor Module (modules/colorEditor)

## Overview
The Color Editor Module provides a comprehensive interface for managing and editing color schemes used throughout the WoodChunk application. It handles color configuration for different game elements like biomes, UI elements, and visual components.

## Purpose
- **Color Management**: Edit and manage color schemes for different game elements
- **Category Organization**: Organize colors by categories (biomes, UI, etc.)
- **Visual Preview**: Preview color changes in real-time
- **Data Persistence**: Save and load color configurations
- **Import/Export**: Support for color scheme backup and sharing
- **Reset Functionality**: Reset colors to default values

## Architecture
The module follows a class-based architecture with clear separation between color management and UI interactions.

## Key Components

### ColorEditor Class
Main controller for color management:
- Color data storage and manipulation
- UI event handling and form management
- Category-based color organization
- Import/export capabilities
- Preview functionality

## How It Works

1. **Initialization**: Loads color categories and sets up UI components
2. **Category Loading**: Displays available color categories
3. **Color Panel**: Shows colors for selected category
4. **Color Editing**: Allows modification of individual colors
5. **Preview System**: Shows color changes in real-time
6. **Data Operations**: Handles save, reset, import, and export operations

## Color Categories
- **Biomes**: Colors for different biome types (forest, desert, mountain, etc.)
- **UI Elements**: Interface colors and themes
- **Visual Components**: Colors for various game elements

## Features
- **Category Selection**: Switch between different color categories
- **Color Editing**: Modify individual colors with color picker
- **Real-time Preview**: See changes immediately
- **Export Colors**: Export color schemes to JSON format
- **Import Colors**: Import color schemes from JSON files
- **Reset Functionality**: Reset colors to default values
- **Preview Toggle**: Enable/disable preview mode
- **Modal Interface**: Import confirmation modal

## Usage
```javascript
// Access global instance
const editor = window.colorEditor;

// Select category
editor.selectCategory('biomes');

// Export colors
editor.exportColors();

// Reset colors
editor.resetColors();

// Toggle preview
editor.togglePreview();
```

## Color Data Structure
```javascript
{
    category: string,        // Category name (biomes, ui, etc.)
    colors: {
        colorName: string,  // Color name
        hexValue: string,   // Hex color value
        rgbValue: string,   // RGB color value
        description: string // Color description
    }
}
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (colorEditor.css)
- Depends on HTML structure for color panels and modals
- Uses localStorage for color persistence
- Requires color configuration functions

## Debugging
All operations include debug logging with `[ColorEditor]` prefix for easy identification and troubleshooting.
