"use strict";

import { TileInspector as ITileInspector, HexTile, Position, TileType } from '../../shared/types';

/**
 * Bridge between the existing hexmap editor and the new tile inspector
 * This module handles the integration and provides tile inspection functionality
 */
export class TileInspectionBridge {
  private tileInspector: ITileInspector;
  private isInspectionMode: boolean = false;

  constructor(tileInspector: ITileInspector) {
    this.tileInspector = tileInspector;
    console.debug('[ui/TileInspectionBridge] Initialized');
  }

  /**
   * Enable inspection mode - tiles will be inspected instead of edited
   */
  enableInspectionMode(): void {
    this.isInspectionMode = true;
    console.debug('[ui/TileInspectionBridge] Inspection mode enabled');
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('inspection-mode-changed', { 
      detail: { enabled: true } 
    }));
  }

  /**
   * Disable inspection mode - tiles will be edited normally
   */
  disableInspectionMode(): void {
    this.isInspectionMode = false;
    console.debug('[ui/TileInspectionBridge] Inspection mode disabled');
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('inspection-mode-changed', { 
      detail: { enabled: false } 
    }));
  }

  /**
   * Toggle inspection mode
   */
  toggleInspectionMode(): void {
    if (this.isInspectionMode) {
      this.disableInspectionMode();
    } else {
      this.enableInspectionMode();
    }
  }

  /**
   * Check if inspection mode is active
   */
  isInspectionModeActive(): boolean {
    return this.isInspectionMode;
  }

  /**
   * Handle tile click for inspection
   * This should be called from the existing hexmap click handler
   */
  handleTileClickForInspection(hexPos: { q: number; r: number }, core: any): void {
    if (!this.isInspectionMode) {
      return;
    }

    console.debug('[ui/TileInspectionBridge] Handling tile click for inspection at', hexPos.q, hexPos.r);

    // Get tile data from the existing core system
    const tileData = this.extractTileDataFromCore(hexPos, core);
    
    if (tileData) {
      // Convert to our HexTile format
      const hexTile: HexTile = {
        position: { x: hexPos.q, y: hexPos.r },
        type: this.mapTileTypeToStandard(tileData.type),
        properties: this.extractTileProperties(tileData, core)
      };

      // Show tile details
      this.tileInspector.showTileDetails(hexTile, hexTile.position);
      
      // Dispatch custom event for React component
      window.dispatchEvent(new CustomEvent('tile-inspect', {
        detail: { tile: hexTile, position: hexTile.position }
      }));
    } else {
      console.debug('[ui/TileInspectionBridge] No tile found at position', hexPos.q, hexPos.r);
      
      // Show empty tile info
      const emptyTile: HexTile = {
        position: { x: hexPos.q, y: hexPos.r },
        type: 'forest', // Default type
        properties: { isEmpty: true, message: 'No tile at this position' }
      };

      this.tileInspector.showTileDetails(emptyTile, emptyTile.position);
      
      window.dispatchEvent(new CustomEvent('tile-inspect', {
        detail: { tile: emptyTile, position: emptyTile.position }
      }));
    }
  }

  /**
   * Extract tile data from the existing core system
   */
  private extractTileDataFromCore(hexPos: { q: number; r: number }, core: any): any {
    try {
      // Try to get tile from different layers
      const currentLayer = core.getCurrentLayer ? core.getCurrentLayer() : 'terrain';
      
      // Check streets layer first (buildings)
      if (core.layers && core.layers.streets) {
        const streetTile = core.layers.streets.get(`${hexPos.q},${hexPos.r}`);
        if (streetTile) {
          return {
            ...streetTile,
            layer: 'streets',
            isBuilding: true
          };
        }
      }

      // Check terrain layer
      if (core.tiles) {
        const terrainTile = core.tiles.get(`${hexPos.q},${hexPos.r}`);
        if (terrainTile) {
          return {
            ...terrainTile,
            layer: 'terrain',
            isBuilding: false
          };
        }
      }

      // Try alternative methods
      if (core.getTileAt) {
        const tile = core.getTileAt(hexPos.q, hexPos.r);
        if (tile) {
          return {
            ...tile,
            layer: currentLayer,
            isBuilding: currentLayer === 'streets'
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('[ui/TileInspectionBridge] Error extracting tile data:', error);
      return null;
    }
  }

  /**
   * Map tile types from the existing system to our standard types
   */
  private mapTileTypeToStandard(tileType: string): TileType {
    const typeMapping: Record<string, TileType> = {
      'grass': 'forest',
      'water': 'water',
      'mountain': 'mountain',
      'desert': 'desert',
      'snow': 'forest', // Map snow to forest for now
      'void': 'forest', // Map void to forest for now
      'city': 'city',
      'forest': 'forest'
    };

    return typeMapping[tileType] || 'forest';
  }

  /**
   * Extract properties from tile data
   */
  private extractTileProperties(tileData: any, core: any): Record<string, any> {
    const properties: Record<string, any> = {};

    // Basic properties
    if (tileData.color) properties.color = tileData.color;
    if (tileData.biomeName) properties.biome = tileData.biomeName;
    if (tileData.layer) properties.layer = tileData.layer;
    if (tileData.isBuilding) properties.isBuilding = tileData.isBuilding;
    if (tileData.name) properties.name = tileData.name;
    if (tileData.image) properties.image = tileData.image;

    // Add any additional properties from the tile data
    if (tileData.properties) {
      Object.assign(properties, tileData.properties);
    }

    // Add position info
    properties.hexPosition = `${tileData.position?.q || '?'},${tileData.position?.r || '?'}`;

    return properties;
  }

  /**
   * Get neighbors for a tile position
   */
  getNeighbors(hexPos: { q: number; r: number }, core: any): Array<{ position: Position; tile: HexTile | null }> {
    const neighbors: Array<{ position: Position; tile: HexTile | null }> = [];
    
    // Hex neighbor offsets
    const offsets = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    for (const offset of offsets) {
      const neighborPos = { q: hexPos.q + offset.q, r: hexPos.r + offset.r };
      const position: Position = { x: neighborPos.q, y: neighborPos.r };
      
      const tileData = this.extractTileDataFromCore(neighborPos, core);
      const tile: HexTile | null = tileData ? {
        position,
        type: this.mapTileTypeToStandard(tileData.type),
        properties: this.extractTileProperties(tileData, core)
      } : null;

      neighbors.push({ position, tile });
    }

    return neighbors;
  }
}
