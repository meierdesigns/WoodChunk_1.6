# UI Module (modules/ui)

## Overview
The UI Module provides a centralized view rendering system for the WoodChunk application. It handles the rendering of all application views and provides a consistent interface for view management.

## Purpose
- **View Rendering**: Render all application views and interfaces
- **View Management**: Centralized management of all application views
- **Consistent Interface**: Provide consistent UI across all modules
- **Dynamic Loading**: Handle dynamic loading of module content
- **Navigation Support**: Support navigation between different views

## Architecture
The module follows a class-based architecture with a centralized view rendering system.

## Key Components

### ViewRenderer Class
Main controller for view rendering:
- View registration and management
- Dynamic view rendering
- HTML template generation
- View-specific content handling

## How It Works

1. **View Registration**: Views are registered with their rendering functions
2. **View Rendering**: Views are rendered dynamically based on user navigation
3. **Content Generation**: HTML content is generated for each view
4. **Module Integration**: Views integrate with specific modules as needed
5. **Dynamic Loading**: Module content is loaded dynamically when needed

## Supported Views
- **Menu**: Main application menu with navigation
- **Game**: Game interface with controls
- **Map Editor**: Map editing interface
- **Item Editor**: Item management interface
- **People Editor**: People/race management interface
- **Character Editor**: Character management interface
- **Hex Map Editor**: Hexagonal map editing interface
- **Settings**: Application settings interface

## Features
- **Dynamic View Rendering**: Render views on demand
- **Module Integration**: Integrate with specific modules
- **Loading Indicators**: Show loading states for modules
- **Consistent Styling**: Apply consistent styling across views
- **Navigation Support**: Handle view switching and navigation
- **Error Handling**: Handle missing views gracefully

## View Structure
Each view follows a consistent structure:
```html
<div class="editor">
    <div class="editor-header">
        <h2>View Title</h2>
        <div class="header-controls">
            <!-- View-specific controls -->
        </div>
    </div>
    <div class="view-content">
        <!-- View-specific content -->
    </div>
</div>
```

## Usage
```javascript
// Access global instance
const renderer = window.ViewRenderer;

// Render specific view
const html = renderer.renderView('menu');

// Render view with data
const gameHtml = renderer.renderGame();
```

## Dependencies
- Requires DOM elements for view containers
- Uses CSS for styling (styles.css)
- Depends on HTML structure for view layout
- Integrates with module loading system
- Uses global navigation functions

## View Types

### Static Views
- **Menu**: Main menu with navigation options
- **Game**: Game interface placeholder
- **Settings**: Settings interface with controls

### Dynamic Views
- **Item Editor**: Loads item editor module
- **People Editor**: Loads people editor module
- **Character Editor**: Loads character editor module
- **Hex Map Editor**: Loads hex map editor module

## Debugging
All operations include debug logging with `[ViewRenderer]` prefix for easy identification and troubleshooting.
