import React, { useRef, useEffect, useState } from 'react';
import { addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};
import { MapEditorAPI, HexTile, TileType, Position } from '../../shared/types';

export class MapEditorImpl implements MapEditorAPI {
  private element: HTMLElement | null = null;

  render(): void {
    if (this.element) {
      // React component will handle rendering
    }
  }

  update(): void {
    // React component will handle updates
  }

  getElement(): HTMLElement | null {
    return this.element;
  }

  setElement(element: HTMLElement): void {
    this.element = element;
  }
}

export const MapEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTileType, setSelectedTileType] = useState<TileType>('forest');
  const [gridSize, setGridSize] = useState(20);
  const [tileSize, setTileSize] = useState(60);

  const tileTypes: TileType[] = ['forest', 'mountain', 'water', 'desert', 'city'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid placeholder
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Hex Grid Editor', canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Grid Size: ${gridSize}x${gridSize}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(`Tile Size: ${tileSize}px`, canvas.width / 2, canvas.height / 2 + 60);
  }, [gridSize, tileSize]);

  return (
    <div className="map-editor">
      <div className="editor-toolbar">
        <div className="tool-group">
          <label>Grid Size:</label>
          <input
            type="range"
            min="10"
            max="50"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
          />
          <span>{gridSize}x{gridSize}</span>
        </div>
        <div className="tool-group">
          <label>Tile Size:</label>
          <input
            type="range"
            min="30"
            max="100"
            value={tileSize}
            onChange={(e) => setTileSize(parseInt(e.target.value))}
          />
          <span>{tileSize}px</span>
        </div>
        <div className="tool-group">
          <label>Tile Type:</label>
          <select
            value={selectedTileType}
            onChange={(e) => setSelectedTileType(e.target.value as TileType)}
          >
            {tileTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="editor-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="editor-canvas"
        />
      </div>
      <div className="editor-controls">
        <button className="btn btn-primary">Generate Terrain</button>
        <button className="btn btn-secondary">Clear Map</button>
        <button className="btn btn-secondary">Export Map</button>
        <button className="btn btn-secondary">Import Map</button>
      </div>
    </div>
  );
};
