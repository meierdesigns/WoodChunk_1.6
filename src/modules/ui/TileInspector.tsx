"use strict";

import React, { useState, useEffect } from 'react';
import { TileInspector as ITileInspector, HexTile, Position, TileType, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class TileInspectorImpl implements ITileInspector {
  private currentTile: HexTile | null = null;
  private currentPosition: Position | null = null;
  private isVisibleState: boolean = false;
  private element: HTMLElement | null = null;

  showTileDetails(tile: HexTile, position: Position): void {
    console.debug('[ui/TileInspector] Showing tile details:', tile.type, 'at', position);
    this.currentTile = tile;
    this.currentPosition = position;
    this.isVisibleState = true;
    this.render();
  }

  hideTileDetails(): void {
    console.debug('[ui/TileInspector] Hiding tile details');
    this.isVisibleState = false;
    this.currentTile = null;
    this.currentPosition = null;
    this.render();
  }

  isVisible(): boolean {
    return this.isVisibleState;
  }

  getCurrentTile(): HexTile | null {
    return this.currentTile;
  }

  getCurrentPosition(): Position | null {
    return this.currentPosition;
  }

  setElement(element: HTMLElement): void {
    this.element = element;
  }

  getElement(): HTMLElement | null {
    return this.element;
  }

  private render(): void {
    if (this.element) {
      // React component will handle rendering
    }
  }
}

export const TileInspector: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTile, setCurrentTile] = useState<HexTile | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  useEffect(() => {
    // Listen for tile inspection events
    const handleTileInspection = (event: CustomEvent) => {
      const { tile, position } = event.detail;
      setCurrentTile(tile);
      setCurrentPosition(position);
      setIsVisible(true);
    };

    const handleHideInspection = () => {
      setIsVisible(false);
      setCurrentTile(null);
      setCurrentPosition(null);
    };

    window.addEventListener('tile-inspect', handleTileInspection as EventListener);
    window.addEventListener('tile-inspect-hide', handleHideInspection);

    return () => {
      window.removeEventListener('tile-inspect', handleTileInspection as EventListener);
      window.removeEventListener('tile-inspect-hide', handleHideInspection);
    };
  }, []);

  const getTileTypeColor = (type: TileType): string => {
    const colors: Record<TileType, string> = {
      forest: '#4CAF50',
      mountain: '#795548',
      water: '#2196F3',
      desert: '#FF9800',
      city: '#9C27B0'
    };
    return colors[type] || '#666666';
  };

  const getTileTypeIcon = (type: TileType): string => {
    const icons: Record<TileType, string> = {
      forest: '🌲',
      mountain: '⛰️',
      water: '🌊',
      desert: '🏜️',
      city: '🏙️'
    };
    return icons[type] || '❓';
  };

  const formatProperties = (properties: Record<string, any>): string => {
    if (!properties || Object.keys(properties).length === 0) {
      return 'No additional properties';
    }
    
    return Object.entries(properties)
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');
  };

  if (!isVisible || !currentTile || !currentPosition) {
    return null;
  }

  return (
    <div className="tile-inspector-overlay">
      <div className="tile-inspector-modal">
        <div className="tile-inspector-header">
          <h3>Tile Details</h3>
          <button 
            className="close-button"
            onClick={() => setIsVisible(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="tile-inspector-content">
          <div className="tile-visual">
            <div 
              className="tile-preview"
              style={{ backgroundColor: getTileTypeColor(currentTile.type) }}
            >
              <span className="tile-icon">{getTileTypeIcon(currentTile.type)}</span>
            </div>
            <div className="tile-type-badge">
              {currentTile.type.charAt(0).toUpperCase() + currentTile.type.slice(1)}
            </div>
          </div>

          <div className="tile-details">
            <div className="detail-section">
              <h4>Position</h4>
              <div className="position-info">
                <span className="coordinate">X: {currentPosition.x}</span>
                <span className="coordinate">Y: {currentPosition.y}</span>
                {currentPosition.z !== undefined && (
                  <span className="coordinate">Z: {currentPosition.z}</span>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4>Tile Type</h4>
              <div className="tile-type-info">
                <span className="type-name">{currentTile.type}</span>
                <div 
                  className="type-color-indicator"
                  style={{ backgroundColor: getTileTypeColor(currentTile.type) }}
                ></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Properties</h4>
              <div className="properties-content">
                <pre>{formatProperties(currentTile.properties)}</pre>
              </div>
            </div>

            <div className="detail-section">
              <h4>Neighbors</h4>
              <div className="neighbors-info">
                <p>Click on neighboring tiles to inspect them</p>
                <div className="neighbor-tiles">
                  {/* Neighbor tiles will be rendered here */}
                  <div className="neighbor-placeholder">
                    <span>Adjacent tiles will be shown here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tile-inspector-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => setIsVisible(false)}
          >
            Close
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              // Future: Edit tile properties
              console.debug('[ui/TileInspector] Edit tile clicked');
            }}
          >
            Edit Tile
          </button>
        </div>
      </div>
    </div>
  );
};
