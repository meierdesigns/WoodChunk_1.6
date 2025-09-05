# TileEditor Modular Architecture

The TileEditor has been split into a modular architecture following the project's architectural rules for better maintainability, testability, and interchangeability.

## Module Structure

```
modules/tileEditor/
├── core/
│   └── TileEditor.js          # Core class with initialization and data loading
├── ui/
│   └── UIManager.js           # UI operations and display management
├── modals/
│   └── ModalManager.js        # Modal dialog operations
├── data/
│   └── DataManager.js         # Data persistence and management
├── utils/
│   └── ToastManager.js        # Toast notification system
├── index.js                   # Main entry point that combines all modules
└── README.md                  # This documentation
```

## Module Responsibilities

### Core Module (`core/TileEditor.js`)
- **Purpose**: Main class with core functionality
- **Responsibilities**:
  - Constructor and initialization
  - Data loading from biome folders
  - Biome data management
  - Category and tile creation utilities
  - Type determination and color mapping

### UI Manager (`ui/UIManager.js`)
- **Purpose**: Handles all UI-related operations
- **Responsibilities**:
  - Updating category and tile lists
  - Display management
  - Preview updates
  - Drag and drop functionality
  - Filter management

### Modal Manager (`modals/ModalManager.js`)
- **Purpose**: Manages all modal dialogs
- **Responsibilities**:
  - Opening/closing modals
  - Modal content loading
  - Form population
  - Biome modal operations

### Data Manager (`data/DataManager.js`)
- **Purpose**: Handles data persistence and management
- **Responsibilities**:
  - Saving biome data to files
  - Loading and reloading data
  - Category order management
  - Data export functionality

### Toast Manager (`utils/ToastManager.js`)
- **Purpose**: Manages user notifications
- **Responsibilities**:
  - Toast message display
  - Notification types (success, error, warning, info)
  - Auto-removal of notifications

## Usage

### In HTML
```html
<script type="module" src="modules/tileEditor/index.js"></script>
```

### In JavaScript
```javascript
// The CompleteTileEditor instance is automatically available as:
window.tileEditor

// Or you can import the class:
import { CompleteTileEditor } from './modules/tileEditor/index.js';
```

## Architecture Benefits

1. **Modularity**: Each module has a single responsibility
2. **Testability**: Individual modules can be tested in isolation
3. **Maintainability**: Changes to one module don't affect others
4. **Interchangeability**: Modules can be replaced with different implementations
5. **Debugging**: Clear separation makes debugging easier

## Module Communication

Modules communicate through the main `CompleteTileEditor` class:
- Each manager is instantiated in the constructor
- Methods delegate to appropriate managers
- Managers have access to the main tileEditor instance for cross-module communication

## Adding New Features

When adding new features:
1. Determine which module should handle the feature
2. Add the method to the appropriate manager
3. Add a delegate method to the main `CompleteTileEditor` class
4. Update the event listeners in `setupEventListeners()`

## Migration from Monolithic Structure

The original `tileEditor.js` file has been split into these modules:
- All UI operations → `UIManager`
- All modal operations → `ModalManager`
- All data operations → `DataManager`
- All toast operations → `ToastManager`
- Core functionality → `TileEditor` (core)
- Main orchestration → `CompleteTileEditor` (index.js)
