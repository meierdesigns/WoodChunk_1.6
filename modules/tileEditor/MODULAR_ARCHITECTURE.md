# TileEditor Modular Architecture

## 📁 Module Structure

```
modules/tileEditor/
├── modules/                    # New modular components
│   ├── BiomeLoader.js         # Handles biome data loading and caching
│   ├── TileRenderer.js        # Handles tile rendering and display
│   ├── BiomeManager.js        # Handles biome operations and state
│   └── TileEditorCore.js      # Main TileEditor class (modular)
├── core/                      # Legacy core components
│   └── TileEditor.js          # Original TileEditor (deprecated)
├── modals/                    # Modal management
├── data/                      # Data management
├── utils/                     # Utilities
└── tileEditor.html           # Main HTML file
```

## 🚀 New Modules

### BiomeLoader.js
- **Purpose**: Handles biome data loading from multiple sources
- **Features**:
  - Parallel loading from tilesList, biomeFile, localStorage, global
  - Intelligent caching with deduplication
  - Error handling and fallbacks
  - Performance tracking

### TileRenderer.js
- **Purpose**: Handles tile rendering and display
- **Features**:
  - Multiple view modes (cards, table, grid)
  - Batch rendering for performance
  - Image preloading and caching
  - Event handling for tile interactions

### BiomeManager.js
- **Purpose**: Manages biome operations and state
- **Features**:
  - CRUD operations for tiles
  - Filtering and sorting
  - Event system for state changes
  - Statistics and monitoring

### TileEditorCore.js
- **Purpose**: Main TileEditor class with modular architecture
- **Features**:
  - Clean separation of concerns
  - Event-driven communication
  - Modular initialization
  - Debug and statistics

## 🔄 Migration Benefits

### Performance Improvements
- **Parallel Loading**: Biome data loads from multiple sources simultaneously
- **Batch Rendering**: Tiles render in batches for smooth UI
- **Image Caching**: Preloaded images for faster display
- **Memory Management**: Efficient cache management

### Code Quality
- **Separation of Concerns**: Each module has a single responsibility
- **Event-Driven**: Modules communicate through events
- **Testability**: Each module can be tested independently
- **Maintainability**: Easier to modify and extend

### Developer Experience
- **Debug Panel**: Integrated debug fly-in card
- **Performance Monitoring**: Real-time performance metrics
- **Error Handling**: Comprehensive error states
- **Statistics**: Detailed module statistics

## 🛠️ Usage

### Basic Initialization
```javascript
// The new modular TileEditor is automatically initialized
// Access via window.tileEditor (legacy) or window.tileEditorCore (new)
```

### Using BiomeManager
```javascript
// Load biome tiles
await tileEditor.biomeManager.loadBiomeTiles(category);

// Add tile to biome
await tileEditor.biomeManager.addTileToBiome(tile, biomeName);

// Remove tile from biome
await tileEditor.biomeManager.removeTileFromBiome(tileId, biomeName);
```

### Using TileRenderer
```javascript
// Render tiles with custom options
await tileEditor.tileRenderer.renderTiles(container, tiles, {
    viewMode: 'cards',
    batchSize: 10,
    delay: 0
});
```

### Using BiomeLoader
```javascript
// Load biome data
const data = await tileEditor.biomeLoader.loadBiomeData(biomeName);

// Save biome data
await tileEditor.biomeLoader.saveBiomeData(biomeName, data);
```

## 🔧 Configuration

### Debug Mode
```javascript
// Enable debug mode
tileEditor.debugMode = true;

// Access debug panel
window.debugFlyin.open();
```

### Performance Options
```javascript
// Configure rendering options
const options = {
    viewMode: 'cards',    // 'cards', 'table', 'grid'
    batchSize: 10,        // Tiles per batch
    delay: 0,            // Delay between batches (ms)
    showLoading: true     // Show loading indicator
};
```

## 📊 Monitoring

### Module Statistics
```javascript
// Get overall statistics
const stats = tileEditor.getStats();

// Get specific module stats
const biomeStats = tileEditor.biomeManager.getStats();
const rendererStats = tileEditor.tileRenderer.getStats();
const loaderStats = tileEditor.biomeLoader.getCacheStats();
```

### Performance Metrics
- **Load Time**: Time to load biome data
- **Render Time**: Time to render tiles
- **Cache Hit Rate**: Cache efficiency
- **Memory Usage**: Memory consumption

## 🔄 Backward Compatibility

The new modular architecture maintains backward compatibility:
- `window.tileEditor` still works (legacy)
- All existing functions are preserved
- Gradual migration possible
- No breaking changes

## 🚀 Future Enhancements

### Planned Features
- **Web Workers**: Background processing for large datasets
- **Service Workers**: Offline support and caching
- **WebGL Rendering**: Hardware-accelerated tile rendering
- **Real-time Collaboration**: Multi-user editing

### Module Extensions
- **Plugin System**: Third-party module support
- **Custom Renderers**: User-defined tile renderers
- **Data Adapters**: Support for different data formats
- **Export/Import**: Enhanced data portability
