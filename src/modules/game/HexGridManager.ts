import { HexGrid, HexTile, Position, TileType, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class HexGridManager {
  private grid: HexGrid;
  private tileSize: number = 60;
  private orientation: 'flat' | 'pointy' = 'flat';

  constructor(width: number = 100, height: number = 100) {
    this.grid = {
      width,
      height,
      tiles: []
    };
    
    this.initializeGrid();
    console.debug(`[game/HexGridManager] Initialized hex grid ${width}x${height}`);
  }

  private initializeGrid(): void {
    this.grid.tiles = [];
    
    for (let x = 0; x < this.grid.width; x++) {
      for (let y = 0; y < this.grid.height; y++) {
        // Create default forest tiles
        const tile: HexTile = {
          position: { x, y },
          type: 'forest',
          properties: {
            elevation: Math.random() * 100,
            moisture: Math.random(),
            resources: []
          }
        };
        
        this.grid.tiles.push(tile);
      }
    }
  }

  getGrid(): HexGrid {
    return { ...this.grid };
  }

  getTileAt(position: Position): HexTile | null {
    return this.grid.tiles.find(tile => 
      tile.position.x === position.x && tile.position.y === position.y
    ) || null;
  }

  setTileAt(position: Position, tile: HexTile): void {
    if (!this.isValidPosition(position)) {
      console.warn(`[game/HexGridManager] Invalid position: ${position.x}, ${position.y}`);
      return;
    }

    const index = this.grid.tiles.findIndex(t => 
      t.position.x === position.x && t.position.y === position.y
    );
    
    if (index > -1) {
      this.grid.tiles[index] = { ...tile, position };
      console.debug(`[game/HexGridManager] Tile updated at ${position.x},${position.y}: ${tile.type}`);
    }
  }

  getNeighbors(position: Position): HexTile[] {
    const neighbors: HexTile[] = [];
    const offsets = [
      { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 },
      { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }
    ];

    for (const offset of offsets) {
      const neighborPos = {
        x: position.x + offset.x,
        y: position.y + offset.y
      };
      
      const neighbor = this.getTileAt(neighborPos);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < this.grid.width &&
           position.y >= 0 && position.y < this.grid.height;
  }

  getTilesByType(type: TileType): HexTile[] {
    return this.grid.tiles.filter(tile => tile.type === type);
  }

  getTilesInRange(center: Position, range: number): HexTile[] {
    const tiles: HexTile[] = [];
    
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const pos = { x: center.x + dx, y: center.y + dy };
        if (this.isValidPosition(pos)) {
          const tile = this.getTileAt(pos);
          if (tile && this.getDistance(center, pos) <= range) {
            tiles.push(tile);
          }
        }
      }
    }
    
    return tiles;
  }

  private getDistance(pos1: Position, pos2: Position): number {
    return (Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.x + pos1.y - pos2.x - pos2.y)) / 2;
  }

  resize(width: number, height: number): void {
    this.grid.width = width;
    this.grid.height = height;
    this.initializeGrid();
    console.debug(`[game/HexGridManager] Grid resized to ${width}x${height}`);
  }

  clear(): void {
    this.grid.tiles = [];
    console.debug('[game/HexGridManager] Grid cleared');
  }

  generateTerrain(seed?: number): void {
    if (seed !== undefined) {
      Math.seedrandom = seed;
    }
    
    console.debug('[game/HexGridManager] Generating terrain...');
    
    // Simple terrain generation
    for (const tile of this.grid.tiles) {
      const elevation = Math.random() * 100;
      const moisture = Math.random();
      
      if (elevation > 80) {
        tile.type = 'mountain';
      } else if (elevation > 60) {
        tile.type = 'forest';
      } else if (moisture > 0.7) {
        tile.type = 'water';
      } else if (moisture < 0.3) {
        tile.type = 'desert';
      } else {
        tile.type = 'forest';
      }
      
      tile.properties.elevation = elevation;
      tile.properties.moisture = moisture;
    }
    
    console.debug('[game/HexGridManager] Terrain generation complete');
  }

  export(): string {
    return JSON.stringify(this.grid, null, 2);
  }

  import(json: string): void {
    try {
      const data = JSON.parse(json);
      this.grid = data;
      console.debug('[game/HexGridManager] Grid imported successfully');
    } catch (error) {
      console.error('[game/HexGridManager] Failed to import grid:', error);
      throw new Error('Invalid grid format');
    }
  }

  getTileCount(): number {
    return this.grid.tiles.length;
  }

  getTileTypeDistribution(): Record<TileType, number> {
    const distribution: Record<TileType, number> = {} as Record<TileType, number>;
    
    for (const tile of this.grid.tiles) {
      distribution[tile.type] = (distribution[tile.type] || 0) + 1;
    }
    
    return distribution;
  }

  setTileSize(size: number): void {
    this.tileSize = size;
    console.debug(`[game/HexGridManager] Tile size set to ${size}`);
  }

  setOrientation(orientation: 'flat' | 'pointy'): void {
    this.orientation = orientation;
    console.debug(`[game/HexGridManager] Orientation set to ${orientation}`);
  }

  getTileSize(): number {
    return this.tileSize;
  }

  getOrientation(): 'flat' | 'pointy' {
    return this.orientation;
  }
}
