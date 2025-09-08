# UI Module

## Overview
The UI Module handles all user interface components and rendering for the WoodChunk application. It implements the UIAPI interface and provides React-based components for different editors and views.

## Purpose
- **User Interface Rendering**: Manages all UI components and their rendering
- **Hex Grid Visualization**: Renders hexagonal grids with camera controls
- **Editor Interfaces**: Provides specialized editors for different game elements
- **Camera Management**: Handles viewport controls and transformations
- **Interactive Elements**: Manages user interactions and input handling

## Architecture
The UI Module follows a component-based architecture with specialized renderers and controllers for different aspects of the interface.

## Key Components

### UIModule
Main UI controller that implements UIAPI:
- Manages all UI components lifecycle
- Provides access to individual UI components
- Handles UI initialization and updates

### HexRenderer
Canvas-based hexagonal grid renderer:
- Renders hexagonal tiles with proper geometry
- Supports both flat and pointy hex orientations
- Handles camera transformations and zoom
- Provides tile coloring and information display
- Renders selection highlights and path visualization

### CameraController
Interactive camera management:
- Mouse and touch input handling
- Pan and zoom functionality
- Coordinate system transformations
- Viewport management and bounds fitting

### UI Components
- **MainCard**: Main application interface
- **MainMenu**: Navigation and menu system
- **MapEditor**: Hex map editing interface
- **ItemEditor**: Item creation and editing
- **PeopleEditor**: Character/people management
- **CharacterEditor**: Character creation and customization
- **Settings**: Application settings interface

## How It Works

1. **Initialization**: UIModule initializes all UI components
2. **Rendering**: HexRenderer processes hex grid data and renders to canvas
3. **Camera Control**: CameraController handles user input for viewport manipulation
4. **Component Management**: Individual UI components handle their specific functionality
5. **Event Handling**: UI components communicate through events and callbacks

## Rendering Pipeline
1. Clear canvas
2. Apply camera transformations
3. Convert hex coordinates to pixel coordinates
4. Render hex tiles with appropriate colors
5. Draw tile information and overlays
6. Render selection highlights and paths

## Camera System
- **Pan**: Drag to move viewport
- **Zoom**: Mouse wheel or touch gestures
- **Coordinate Conversion**: Screen ↔ World coordinate transformations
- **Bounds Fitting**: Automatic viewport adjustment

## Usage
```typescript
import { UIModule, HexRenderer, CameraController } from './ui';

// Initialize UI
const ui = new UIModule();
ui.initialize();

// Setup rendering
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new HexRenderer(canvas);
const camera = new CameraController(canvas);

// Render hex grid
renderer.renderHexGrid(tiles);
```

## Dependencies
- Implements UIAPI from shared types
- Requires Core module for asset management
- Requires Game module for game state
- Uses React for component rendering

## Debugging
All operations include debug logging with `[ui/module]` prefix for easy identification and troubleshooting.
