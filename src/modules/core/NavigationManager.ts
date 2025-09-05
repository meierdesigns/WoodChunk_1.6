import { NavigationManager as INavigationManager, Position, HexTile, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class NavigationManager implements INavigationManager {
  private tileManager: any; // Will be injected
  private maxPathLength: number = 1000;

  constructor() {
    console.debug('[core/NavigationManager] Navigation manager initialized');
  }

  setTileManager(tileManager: any): void {
    this.tileManager = tileManager;
    console.debug('[core/NavigationManager] Tile manager connected');
  }

  findPath(start: Position, end: Position): Position[] {
    if (!this.tileManager) {
      console.error('[core/NavigationManager] Tile manager not connected');
      return [];
    }

    if (!this.isValidPosition(start) || !this.isValidPosition(end)) {
      console.warn('[core/NavigationManager] Invalid start or end position');
      return [];
    }

    if (start.x === end.x && start.y === end.y) {
      return [start];
    }

    console.debug(`[core/NavigationManager] Finding path from ${start.x},${start.y} to ${end.x},${end.y}`);
    
    // Simple A* pathfinding implementation
    const openSet: Position[] = [start];
    const cameFrom: Map<string, Position> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();
    
    gScore.set(this.positionToKey(start), 0);
    fScore.set(this.positionToKey(start), this.heuristic(start, end));
    
    while (openSet.length > 0 && openSet.length < this.maxPathLength) {
      // Find position with lowest fScore
      let current = openSet.reduce((lowest, pos) => {
        const currentScore = fScore.get(this.positionToKey(pos)) || Infinity;
        const lowestScore = fScore.get(this.positionToKey(lowest)) || Infinity;
        return currentScore < lowestScore ? pos : lowest;
      });
      
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, current);
      }
      
      openSet.splice(openSet.indexOf(current), 1);
      
      for (const neighbor of this.getValidNeighbors(current)) {
        const tentativeGScore = (gScore.get(this.positionToKey(current)) || 0) + 1;
        const neighborKey = this.positionToKey(neighbor);
        
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));
          
          if (!openSet.some(pos => pos.x === neighbor.x && pos.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    console.warn('[core/NavigationManager] Path not found or too long');
    return [];
  }

  isValidPosition(position: Position): boolean {
    if (!this.tileManager) return false;
    
    const tile = this.tileManager.getTileAt(position);
    return tile !== null && tile.type !== 'water'; // Water tiles are impassable
  }

  getDistance(pos1: Position, pos2: Position): number {
    return (Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.x + pos1.y - pos2.x - pos2.y)) / 2;
  }

  private positionToKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  private heuristic(pos1: Position, pos2: Position): number {
    return this.getDistance(pos1, pos2);
  }

  private getValidNeighbors(position: Position): Position[] {
    const neighbors: Position[] = [];
    const offsets = [
      { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 },
      { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }
    ];

    for (const offset of offsets) {
      const neighborPos = {
        x: position.x + offset.x,
        y: position.y + offset.y
      };
      
      if (this.isValidPosition(neighborPos)) {
        neighbors.push(neighborPos);
      }
    }

    return neighbors;
  }

  private reconstructPath(cameFrom: Map<string, Position>, current: Position): Position[] {
    const path: Position[] = [current];
    
    while (cameFrom.has(this.positionToKey(current))) {
      current = cameFrom.get(this.positionToKey(current))!;
      path.unshift(current);
    }
    
    console.debug(`[core/NavigationManager] Path found with ${path.length} steps`);
    return path;
  }

  setMaxPathLength(length: number): void {
    this.maxPathLength = length;
    console.debug(`[core/NavigationManager] Max path length set to ${length}`);
  }

  getMaxPathLength(): number {
    return this.maxPathLength;
  }
}
