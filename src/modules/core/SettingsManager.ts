import { SettingsManager as ISettingsManager, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class SettingsManager implements ISettingsManager {
  private settings: Map<string, any> = new Map();
  private storageKey: string = 'woodchunk-settings';

  constructor() {
    this.load();
    console.debug('[core/SettingsManager] Settings manager initialized');
  }

  get(key: string): any {
    return this.settings.get(key);
  }

  set(key: string, value: any): void {
    this.settings.set(key, value);
    console.debug(`[core/SettingsManager] Setting updated: ${key} = ${value}`);
    this.save();
  }

  save(): void {
    try {
      const settingsObj = Object.fromEntries(this.settings);
      localStorage.setItem(this.storageKey, JSON.stringify(settingsObj));
      console.debug('[core/SettingsManager] Settings saved to localStorage');
    } catch (error) {
      console.error('[core/SettingsManager] Failed to save settings:', error);
    }
  }

  load(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const settingsObj = JSON.parse(stored);
        this.settings = new Map(Object.entries(settingsObj));
        console.debug('[core/SettingsManager] Settings loaded from localStorage');
      } else {
        this.setDefaults();
        console.debug('[core/SettingsManager] Default settings loaded');
      }
    } catch (error) {
      console.error('[core/SettingsManager] Failed to load settings:', error);
      this.setDefaults();
    }
  }

  private setDefaults(): void {
    this.settings.set('audio.volume', 0.7);
    this.settings.set('audio.music', true);
    this.settings.set('audio.sfx', true);
    this.settings.set('graphics.quality', 'medium');
    this.settings.set('graphics.fullscreen', false);
    this.settings.set('game.autosave', true);
    this.settings.set('game.difficulty', 'normal');
    this.settings.set('ui.theme', 'dark');
    this.settings.set('ui.language', 'de');
    this.settings.set('ui.animations', true);
  }

  reset(): void {
    this.settings.clear();
    this.setDefaults();
    this.save();
    console.debug('[core/SettingsManager] Settings reset to defaults');
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.settings);
  }

  has(key: string): boolean {
    return this.settings.has(key);
  }

  delete(key: string): void {
    if (this.settings.has(key)) {
      this.settings.delete(key);
      console.debug(`[core/SettingsManager] Setting deleted: ${key}`);
      this.save();
    }
  }
}
