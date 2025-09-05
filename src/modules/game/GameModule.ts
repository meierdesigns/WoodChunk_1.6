import { GameAPI, GameState, HexGrid, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class GameModule implements GameAPI {
  private state: GameState;
  private hexGrid: HexGrid;
  private isInitialized: boolean = false;

  constructor() {
    console.debug('[game/GameModule] Initializing GameModule');
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      entities: []
    };
  }

  start(): void {
    console.debug('[game/GameModule] Starting game');
    this.state.isRunning = true;
    this.state.isPaused = false;
  }

  pause(): void {
    console.debug('[game/GameModule] Pausing game');
    this.state.isPaused = true;
  }

  stop(): void {
    console.debug('[game/GameModule] Stopping game');
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
  }

  getState(): GameState {
    return { ...this.state };
  }

  getHexGrid(): HexGrid {
    return this.hexGrid;
  }

  update(deltaTime: number): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    this.state.currentTime += deltaTime;
    // Game logic updates will be implemented here
  }

  initialize(hexGrid: HexGrid): void {
    this.hexGrid = hexGrid;
    this.isInitialized = true;
    console.debug('[game/GameModule] Game initialized with hex grid');
  }
}
