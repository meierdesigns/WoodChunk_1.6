import { TileManager as ITileManager, HexTile, Position, TileType, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class TileManager implements ITileManager {
  private tiles: Map<string, HexTile> = new Map();
  private width: number = 100;
  private height: number = 100;

  constructor(width: number = 100, height: number = 100) {
    this.width = width;
    this.height = height;
    console.debug(`[core/TileManager] Initialized with grid size ${width}x${height}`);
  }

  getTileAt(position: Position): HexTile | null {
    const key = this.positionToKey(position);
    return this.tiles.get(key) || null;
  }

  setTileAt(position: Position, tile: HexTile): void {
    if (!this.isValidPosition(position)) {
      console.warn(`[core/TileManager] Invalid position: ${position.x}, ${position.y}`);
      return;
    }

    const key = this.positionToKey(position);
    this.tiles.set(key, { ...tile, position });
    console.debug(`[core/TileManager] Tile set at ${key}: ${tile.type}`);
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

  private positionToKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < this.width &&
           position.y >= 0 && position.y < this.height;
  }

  getGridSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  setGridSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    console.debug(`[core/TileManager] Grid size updated to ${width}x${height}`);
  }

  clear(): void {
    this.tiles.clear();
    console.debug('[core/TileManager] All tiles cleared');
  }

  getTileCount(): number {
    return this.tiles.size;
  }

  getTilesByType(type: TileType): HexTile[] {
    return Array.from(this.tiles.values()).filter(tile => tile.type === type);
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

  export(): HexTile[] {
    return Array.from(this.tiles.values());
  }

  import(tiles: HexTile[]): void {
    this.clear();
    for (const tile of tiles) {
      this.setTileAt(tile.position, tile);
    }
    console.debug(`[core/TileManager] Imported ${tiles.length} tiles`);
  }
}
