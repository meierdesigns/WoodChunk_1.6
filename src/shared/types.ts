// Core Interfaces
export interface CoreAPI {
  initialize(): Promise<void>;
  getConfig(): Config;
  getEventBus(): EventBus;
  getAssetManager(): AssetManager;
  getTileManager(): TileManager;
  getNavigationManager(): NavigationManager;
  getSettingsManager(): SettingsManager;
}

export interface GameAPI {
  start(): void;
  pause(): void;
  stop(): void;
  getState(): GameState;
  getHexGrid(): HexGrid;
  update(deltaTime: number): void;
}

export interface UIAPI {
  render(): void;
  update(): void;
  getMainCard(): MainCard;
  getMainMenu(): MainMenu;
  getMapEditor(): MapEditor;
  getItemEditor(): ItemEditor;
  getPeopleEditor(): PeopleEditor;
  getCharacterEditor(): CharacterEditor;
  getSettings(): Settings;

}

// Shared Types
export interface Config {
  debug: boolean;
  version: string;
  assets: AssetConfig;
  game: GameConfig;
  ui: UIConfig;
}

export interface AssetConfig {
  basePath: string;
  preload: boolean;
  cacheSize: number;
}

export interface GameConfig {
  tickRate: number;
  maxEntities: number;
  worldSize: { width: number; height: number };
}

export interface UIConfig {
  theme: string;
  language: string;
  animations: boolean;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  entities: Entity[];
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  properties: Record<string, any>;
}

export type EntityType = 'player' | 'npc' | 'enemy' | 'item' | 'terrain';

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface HexGrid {
  width: number;
  height: number;
  tiles: HexTile[];
}

export interface HexTile {
  position: Position;
  type: TileType;
  properties: Record<string, any>;
}

export type TileType = 'forest' | 'mountain' | 'water' | 'desert' | 'city';

// Cache busting utility for Buildings images
export const addCacheBusting = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        const timestamp = Date.now();
        const separator = imagePath.includes('?') ? '&' : '?';
        return `${imagePath}${separator}_cb=${timestamp}`;
    }
    
    return imagePath;
};

// Event System
export interface EventBus {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}

// Asset Management
export interface AssetManager {
  load(path: string): Promise<any>;
  preload(paths: string[]): Promise<void>;
  get(path: string): any;
  unload(path: string): void;
  initialize(): Promise<boolean>;
  getTemplate(category: string, templateName: string): Promise<any>;
  loadTemplate(category: string, templateName: string): Promise<any>;
  getVariant(category: string, templateName: string, variant: string): Promise<any>;
  getTemplateVariants(category: string, templateName: string): Promise<any[]>;
  searchTemplates(category: string): Promise<any[]>;
  getAsset(category: string, assetName: string): Promise<any>;
  loadCategory(category: string): Promise<any[]>;
  scanAssetFolder(category: string): Promise<any[]>;
  getStatus(): any;
}

// Tile Management
export interface TileManager {
  getTileAt(position: Position): HexTile | null;
  setTileAt(position: Position, tile: HexTile): void;
  getNeighbors(position: Position): HexTile[];
}

// Navigation
export interface NavigationManager {
  findPath(start: Position, end: Position): Position[];
  isValidPosition(position: Position): boolean;
  getDistance(pos1: Position, pos2: Position): number;
}

// Settings
export interface SettingsManager {
  get(key: string): any;
  set(key: string, value: any): void;
  save(): void;
  load(): void;
}

// Hex Geometry
export interface HexGeometry {
  pixelToHex(x: number, y: number): Position;
  hexToPixel(hex: Position): { x: number; y: number };
  getHexCorners(center: Position, size: number): Position[];
}

// Map Template
export interface MapTemplate {
  name: string;
  size: { width: number; height: number };
  tiles: TileTemplate[];
  entities: EntityTemplate[];
}

export interface TileTemplate {
  position: Position;
  type: TileType;
  properties: Record<string, any>;
}

export interface EntityTemplate {
  type: EntityType;
  position: Position;
  properties: Record<string, any>;
}
