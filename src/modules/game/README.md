# Game Module

## Overview
The Game Module handles all game-specific logic and state management for the WoodChunk application. It implements the GameAPI interface and manages the core game loop, entities, and hexagonal grid system.

## Purpose
- **Game State Management**: Controls game running, paused, and stopped states
- **Entity Management**: Handles game entities and their lifecycle
- **Hex Grid Operations**: Manages the hexagonal grid system
- **Game Loop**: Implements the main game update cycle
- **Time Management**: Tracks game time and delta time calculations

## Architecture
The Game Module follows a state-based architecture where game state is centralized and managed through the GameModule class.

## Key Components

### GameModule
Main game controller that implements GameAPI:
- Manages game state (running, paused, stopped)
- Handles game initialization with hex grid
- Provides game state access to other modules
- Implements game loop with delta time updates

### HexGridManager
Manages hexagonal grid operations:
- Grid creation and manipulation
- Hex coordinate calculations
- Grid state management

## How It Works

1. **Initialization**: GameModule initializes with a hex grid from Core module
2. **State Management**: Game state is tracked (running/paused/stopped)
3. **Game Loop**: Update method processes delta time and game logic
4. **Entity Management**: Entities are managed through the game state
5. **Grid Operations**: HexGridManager handles all grid-related operations

## Game States
- **Stopped**: Game is not running, time reset to 0
- **Running**: Game is active and processing updates
- **Paused**: Game is running but updates are suspended

## Usage
```typescript
import { GameModule } from './game';

const game = new GameModule();
game.initialize(hexGrid);

// Control game state
game.start();
game.pause();
game.stop();

// Get current state
const state = game.getState();
const grid = game.getHexGrid();

// Update game loop
game.update(deltaTime);
```

## Dependencies
- Implements GameAPI from shared types
- Requires Core module for hex grid initialization
- Provides game state to UI module

## Debugging
All operations include debug logging with `[game/module]` prefix for easy identification and troubleshooting.
