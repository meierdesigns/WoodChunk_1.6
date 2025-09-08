# Tile Inspector Module

A comprehensive tile inspection system for the WoodChunk 1.6.1 hexmap editor that allows users to examine hexmap tiles in detail.

## Overview

The Tile Inspector module provides a modal interface that displays detailed information about hexmap tiles when users click on them in inspection mode. It integrates seamlessly with the existing hexmap editor and follows the modular architecture pattern.

## Features

- **Visual Tile Preview**: Shows tile type with appropriate icons and colors
- **Position Information**: Displays X, Y, Z coordinates
- **Tile Properties**: Shows all custom properties and metadata
- **Neighbor Information**: Displays adjacent tiles
- **Modal Interface**: Clean, responsive modal overlay
- **Inspection Mode Toggle**: Switch between editing and inspection modes
- **Integration Bridge**: Seamless integration with existing hexmap editor

## File Structure

```
src/modules/ui/
├── TileInspector.tsx              # Main React component
├── TileInspector.css              # Modal styling
├── TileInspectionBridge.ts         # Integration bridge
├── TileInspectionIntegration.js   # Patches existing editor
└── TileInspectorDemo.html         # Demo page
```

## Usage

### Basic Integration

```typescript
import { TileInspector, TileInspectionBridge } from './modules/ui';

// Initialize the tile inspector
const tileInspector = new TileInspectorImpl();
const bridge = new TileInspectionBridge(tileInspector);

// Enable inspection mode
bridge.enableInspectionMode();
```

### React Component

```tsx
import { TileInspector } from './modules/ui';

// Add to your app
<TileInspector />
```

### Integration with Existing Editor

The module automatically patches the existing hexmap editor's click handler to support inspection mode:

```javascript
// Automatically loaded via TileInspectionIntegration.js
window.MapRenderer.prototype.handleTileClick = function(e) {
    if (window.tileInspectionBridge.isInspectionModeActive()) {
        // Handle inspection instead of editing
        window.tileInspectionBridge.handleTileClickForInspection(hexPos, this.core);
        return;
    }
    // Continue with normal editing...
};
```

## API Reference

### TileInspector Interface

```typescript
interface TileInspector {
  showTileDetails(tile: HexTile, position: Position): void;
  hideTileDetails(): void;
  isVisible(): boolean;
  getCurrentTile(): HexTile | null;
  getCurrentPosition(): Position | null;
}
```

### TileInspectionBridge Class

```typescript
class TileInspectionBridge {
  enableInspectionMode(): void;
  disableInspectionMode(): void;
  toggleInspectionMode(): void;
  isInspectionModeActive(): boolean;
  handleTileClickForInspection(hexPos: {q: number, r: number}, core: any): void;
  getNeighbors(hexPos: {q: number, r: number}, core: any): Array<{position: Position, tile: HexTile | null}>;
}
```

## Tile Types Supported

- **Forest** 🌲 - Green tiles with tree icon
- **Mountain** ⛰️ - Brown tiles with mountain icon  
- **Water** 🌊 - Blue tiles with wave icon
- **Desert** 🏜️ - Orange tiles with desert icon
- **City** 🏙️ - Purple tiles with city icon

## Styling

The module includes comprehensive CSS styling with:
- Responsive design for mobile devices
- Smooth animations and transitions
- Modern modal design with backdrop blur
- Color-coded tile type indicators
- Accessible button and form elements

## Events

The module dispatches custom events for integration:

- `tile-inspect`: Fired when a tile is inspected
- `tile-inspect-hide`: Fired when inspection is closed
- `inspection-mode-changed`: Fired when inspection mode is toggled

## Browser Support

- Modern browsers with ES6+ support
- React 18+
- CSS Grid and Flexbox support
- Custom properties (CSS variables) support

## Development

### Prerequisites

- Node.js 16+
- React 18+
- TypeScript 4+

### Building

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Run development server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## Integration Notes

1. **Modular Architecture**: Follows the established pattern of separating core, game, and UI modules
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Event-Driven**: Uses custom events for loose coupling
4. **Responsive**: Works on desktop and mobile devices
5. **Accessible**: Includes proper ARIA labels and keyboard navigation

## Future Enhancements

- Tile editing capabilities
- Bulk tile operations
- Export tile data
- Advanced filtering and search
- Tile history tracking
- Custom property editors

## License

Part of the WoodChunk 1.6.1 project. See main project license for details.
