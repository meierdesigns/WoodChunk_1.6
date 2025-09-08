# Core Module (modules/core)

## Overview
The Core Module provides the foundational infrastructure for the WoodChunk application. It handles application initialization, module loading, navigation, debugging, and core system management.

## Purpose
- **Application Initialization**: Bootstrap the entire application
- **Module Management**: Load and manage all application modules
- **Navigation System**: Handle view switching and URL management
- **Debugging Support**: Provide debugging tools and analysis
- **Core Services**: Essential services for the application

## Architecture
The module follows a service-oriented architecture with clear separation of concerns between different core services.

## Key Components

### AppCore Class
Main application controller:
- Application initialization and setup
- Navigation management and view switching
- URL handling and browser history
- CSS and header loading
- View validation and management

### ModuleLoader Class
Dynamic module loading system:
- Module configuration and loading
- CSS, HTML, and JavaScript loading
- Module dependency management
- Container management
- Error handling for module loading

### Debugger Class (PageDebugger)
Comprehensive debugging system:
- Page analysis and detection
- Performance monitoring
- Error detection and reporting
- Storage analysis
- Module detection and status

## How It Works

1. **Initialization**: AppCore initializes the application and loads core resources
2. **Module Loading**: ModuleLoader dynamically loads modules as needed
3. **Navigation**: AppCore manages view switching and URL updates
4. **Debugging**: Debugger provides analysis and monitoring capabilities
5. **Service Management**: Core services are initialized and made available

## Supported Views
- **Menu**: Main application menu
- **Game**: Game interface
- **Map Editor**: Map editing interface
- **Item Editor**: Item management interface
- **People Editor**: People/race management interface
- **Character Editor**: Character management interface
- **Hex Map Editor**: Hexagonal map editing interface
- **Settings**: Application settings interface

## Features
- **Dynamic Module Loading**: Load modules on demand
- **URL Management**: Handle browser history and deep linking
- **Navigation System**: Seamless view switching
- **Error Handling**: Comprehensive error management
- **Performance Monitoring**: Track application performance
- **Debug Tools**: Advanced debugging capabilities
- **Fallback Systems**: Graceful degradation when resources fail

## Module Configuration
```javascript
{
    moduleName: {
        css: 'path/to/module.css',
        html: 'path/to/module.html',
        js: 'path/to/module.js',
        container: 'containerElementId'
    }
}
```

## Usage
```javascript
// Initialize application
const appCore = new AppCore();
await appCore.init();

// Load specific module
const moduleLoader = new ModuleLoader();
await moduleLoader.loadModule('itemEditor');

// Debug current page
const debugger = new PageDebugger();
await debugger.analyzePage();
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (styles.css)
- Depends on HTML structure for navigation and containers
- Uses fetch API for loading resources
- Requires header.html for navigation

## Debugging
All operations include debug logging with appropriate prefixes:
- `[AppCore]` - Application core operations
- `[ModuleLoader]` - Module loading operations
- `[PageDebugger]` - Debugging operations
