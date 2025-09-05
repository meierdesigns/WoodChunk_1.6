import { MapTemplate as IMapTemplate, TileTemplate, EntityTemplate, Position, TileType, EntityType, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class MapTemplate implements IMapTemplate {
  name: string;
  size: { width: number; height: number };
  tiles: TileTemplate[];
  entities: EntityTemplate[];

  constructor(name: string, width: number = 100, height: number = 100) {
    this.name = name;
    this.size = { width, height };
    this.tiles = [];
    this.entities = [];
    console.debug(`[core/MapTemplate] Created template: ${name} (${width}x${height})`);
  }

  addTile(position: Position, type: TileType, properties: Record<string, any> = {}): void {
    if (!this.isValidPosition(position)) {
      console.warn(`[core/MapTemplate] Invalid tile position: ${position.x}, ${position.y}`);
      return;
    }

    this.tiles.push({
      position: { ...position },
      type,
      properties: { ...properties }
    });
    
    console.debug(`[core/MapTemplate] Added tile at ${position.x},${position.y}: ${type}`);
  }

  addEntity(type: EntityType, position: Position, properties: Record<string, any> = {}): void {
    if (!this.isValidPosition(position)) {
      console.warn(`[core/MapTemplate] Invalid entity position: ${position.x}, ${position.y}`);
      return;
    }

    this.entities.push({
      type,
      position: { ...position },
      properties: { ...properties }
    });
    
    console.debug(`[core/MapTemplate] Added entity at ${position.x},${position.y}: ${type}`);
  }

  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < this.size.width &&
           position.y >= 0 && position.y < this.size.height;
  }

  getTileAt(position: Position): TileTemplate | null {
    return this.tiles.find(tile => 
      tile.position.x === position.x && tile.position.y === position.y
    ) || null;
  }

  getEntityAt(position: Position): EntityTemplate | null {
    return this.entities.find(entity => 
      entity.position.x === position.x && entity.position.y === position.y
    ) || null;
  }

  getTilesByType(type: TileType): TileTemplate[] {
    return this.tiles.filter(tile => tile.type === type);
  }

  getEntitiesByType(type: EntityType): EntityTemplate[] {
    return this.entities.filter(entity => entity.type === type);
  }

  removeTile(position: Position): boolean {
    const index = this.tiles.findIndex(tile => 
      tile.position.x === position.x && tile.position.y === position.y
    );
    
    if (index > -1) {
      this.tiles.splice(index, 1);
      console.debug(`[core/MapTemplate] Removed tile at ${position.x},${position.y}`);
      return true;
    }
    
    return false;
  }

  removeEntity(position: Position): boolean {
    const index = this.entities.findIndex(entity => 
      entity.position.x === position.x && entity.position.y === position.y
    );
    
    if (index > -1) {
      this.entities.splice(index, 1);
      console.debug(`[core/MapTemplate] Removed entity at ${position.x},${position.y}`);
      return true;
    }
    
    return false;
  }

  clear(): void {
    this.tiles = [];
    this.entities = [];
    console.debug(`[core/MapTemplate] Cleared template: ${this.name}`);
  }

  resize(width: number, height: number): void {
    // Remove tiles and entities outside new bounds
    this.tiles = this.tiles.filter(tile => 
      tile.position.x < width && tile.position.y < height
    );
    
    this.entities = this.entities.filter(entity => 
      entity.position.x < width && entity.position.y < height
    );
    
    this.size = { width, height };
    console.debug(`[core/MapTemplate] Resized template to ${width}x${height}`);
  }

  export(): string {
    const data = {
      name: this.name,
      size: this.size,
      tiles: this.tiles,
      entities: this.entities
    };
    
    return JSON.stringify(data, null, 2);
  }

  static import(json: string): MapTemplate {
    try {
      const data = JSON.parse(json);
      const template = new MapTemplate(data.name, data.size.width, data.size.height);
      template.tiles = data.tiles || [];
      template.entities = data.entities || [];
      
      console.debug(`[core/MapTemplate] Imported template: ${data.name}`);
      return template;
    } catch (error) {
      console.error('[core/MapTemplate] Failed to import template:', error);
      throw new Error('Invalid template format');
    }
  }

  getTileCount(): number {
    return this.tiles.length;
  }

  getEntityCount(): number {
    return this.entities.length;
  }

  getTileTypeDistribution(): Record<TileType, number> {
    const distribution: Record<TileType, number> = {} as Record<TileType, number>;
    
    for (const tile of this.tiles) {
      distribution[tile.type] = (distribution[tile.type] || 0) + 1;
    }
    
    return distribution;
  }

  getEntityTypeDistribution(): Record<EntityType, number> {
    const distribution: Record<EntityType, number> = {} as Record<EntityType, number>;
    
    for (const entity of this.entities) {
      distribution[entity.type] = (distribution[entity.type] || 0) + 1;
    }
    
    return distribution;
  }
}
