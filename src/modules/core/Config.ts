import { Config as IConfig, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class Config implements IConfig {
  debug: boolean;
  version: string;
  assets: {
    basePath: string;
    preload: boolean;
    cacheSize: number;
  };
  game: {
    tickRate: number;
    maxEntities: number;
    worldSize: { width: number; height: number };
  };
  ui: {
    theme: string;
    language: string;
    animations: boolean;
  };

  constructor() {
    this.debug = true;
    this.version = '1.5.0';
    this.assets = {
      basePath: './assets/',
      preload: true,
      cacheSize: 100
    };
    this.game = {
      tickRate: 60,
      maxEntities: 1000,
      worldSize: { width: 100, height: 100 }
    };
    this.ui = {
      theme: 'dark',
      language: 'de',
      animations: true
    };
    
    console.debug('[core/Config] Configuration initialized');
  }

  update(newConfig: Partial<Config>): void {
    Object.assign(this, newConfig);
    console.debug('[core/Config] Configuration updated', newConfig);
  }
}
