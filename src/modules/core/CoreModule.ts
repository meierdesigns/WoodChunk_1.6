import { CoreAPI, Config, EventBus, AssetManager, TileManager, NavigationManager, SettingsManager, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};
import { Config as ConfigImpl } from './Config';
import { EventBus as EventBusImpl } from './EventBus';
import { AssetManager as AssetManagerImpl } from './AssetManager';
import { TileManager as TileManagerImpl } from './TileManager';
import { NavigationManager as NavigationManagerImpl } from './NavigationManager';
import { SettingsManager as SettingsManagerImpl } from './SettingsManager';

export class CoreModule implements CoreAPI {
  private config: Config;
  private eventBus: EventBus;
  private assetManager: AssetManager;
  private tileManager: TileManager;
  private navigationManager: NavigationManager;
  private settingsManager: SettingsManager;

  constructor() {
    console.debug('[core/CoreModule] Initializing CoreModule');
  }

  async initialize(): Promise<void> {
    console.debug('[core/CoreModule] Starting initialization');
    
    // Initialize all core systems
    await this.initializeConfig();
    await this.initializeEventBus();
    await this.initializeAssetManager();
    await this.initializeTileManager();
    await this.initializeNavigationManager();
    await this.initializeSettingsManager();
    
    console.debug('[core/CoreModule] Initialization complete');
  }

  getConfig(): Config {
    return this.config;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  getTileManager(): TileManager {
    return this.tileManager;
  }

  getNavigationManager(): NavigationManager {
    return this.navigationManager;
  }

  getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }

  private async initializeConfig(): Promise<void> {
    this.config = new ConfigImpl();
    console.debug('[core/CoreModule] Config initialized');
  }

  private async initializeEventBus(): Promise<void> {
    this.eventBus = new EventBusImpl();
    console.debug('[core/CoreModule] EventBus initialized');
  }

  private async initializeAssetManager(): Promise<void> {
    this.assetManager = new AssetManagerImpl();
    await this.assetManager.initialize();
    console.debug('[core/CoreModule] AssetManager initialized');
  }

  private async initializeTileManager(): Promise<void> {
    this.tileManager = new TileManagerImpl();
    console.debug('[core/CoreModule] TileManager initialized');
  }

  private async initializeNavigationManager(): Promise<void> {
    this.navigationManager = new NavigationManagerImpl();
    this.navigationManager.setTileManager(this.tileManager);
    console.debug('[core/CoreModule] NavigationManager initialized');
  }

  private async initializeSettingsManager(): Promise<void> {
    this.settingsManager = new SettingsManagerImpl();
    console.debug('[core/CoreModule] SettingsManager initialized');
  }
}
