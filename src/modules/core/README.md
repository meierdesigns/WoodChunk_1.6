# Core Module

## Overview
The Core Module is the foundation of the WoodChunk application, providing essential services and infrastructure for the entire system. It follows the modular architecture pattern and implements the CoreAPI interface.

## Purpose
- **Configuration Management**: Centralized configuration handling
- **Event System**: Decoupled communication between modules
- **Asset Management**: Loading and caching of game assets
- **Tile Management**: Hexagonal tile system management
- **Navigation**: Pathfinding and movement systems
- **Settings**: User preferences and application settings

## Architecture
The Core Module implements a service-oriented architecture where each service is independently initialized and can be accessed through the CoreModule facade.

## Key Components

### CoreModule
Main facade class that orchestrates all core services:
- Initializes all core systems in proper order
- Provides access to individual services
- Implements CoreAPI interface for external communication

### Services
- **Config**: Application configuration and constants
- **EventBus**: Event-driven communication system
- **AssetManager**: Asset loading, caching, and management
- **TileManager**: Hexagonal tile system operations
- **NavigationManager**: Pathfinding and movement calculations
- **SettingsManager**: User preferences and settings persistence

## How It Works

1. **Initialization**: CoreModule initializes all services sequentially
2. **Service Access**: Other modules access services through CoreModule getters
3. **Event Communication**: Modules communicate via EventBus for loose coupling
4. **Asset Loading**: AssetManager handles all asset loading with caching
5. **Tile Operations**: TileManager provides hex grid operations and tile data
6. **Navigation**: NavigationManager calculates paths and movement

## Usage
```typescript
import { CoreModule } from './core';

const core = new CoreModule();
await core.initialize();

// Access services
const config = core.getConfig();
const eventBus = core.getEventBus();
const assetManager = core.getAssetManager();
```

## Dependencies
- No external dependencies
- Implements shared types from `../../shared/types`
- Provides services to Game and UI modules

## Debugging
All operations include debug logging with `[core/module]` prefix for easy identification and troubleshooting.
