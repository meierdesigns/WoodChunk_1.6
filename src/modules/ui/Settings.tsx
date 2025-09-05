import React, { useState, useEffect } from 'react';
import { addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};
import { SettingsAPI } from '../../shared/types';

export class SettingsImpl implements SettingsAPI {
  private element: HTMLElement | null = null;

  render(): void {
    if (this.element) {
      // React component will handle rendering
    }
  }

  update(): void {
    // React component will handle updates
  }

  getElement(): HTMLElement | null {
    return this.element;
  }

  setElement(element: HTMLElement): void {
    this.element = element;
  }
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    debug: false,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    tileSize: 60,
    gridSize: 20,
    autoSave: true,
    language: 'en'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('woodchunk-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (e) {
        console.warn('Failed to parse saved settings');
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('woodchunk-settings', JSON.stringify(settings));
    setHasChanges(false);
  };

  const resetSettings = () => {
    const defaultSettings = {
      debug: false,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      tileSize: 60,
      gridSize: 20,
      autoSave: true,
      language: 'en'
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <div className="header-actions">
          {hasChanges && (
            <button className="btn btn-primary" onClick={saveSettings}>
              Save Changes
            </button>
          )}
          <button className="btn btn-secondary" onClick={resetSettings}>
            Reset to Defaults
          </button>
        </div>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h3>Audio</h3>
          <div className="setting-item">
            <label>Music Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => handleSettingChange('musicVolume', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          <div className="setting-item">
            <label>Sound Effects Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.sfxVolume}
              onChange={(e) => handleSettingChange('sfxVolume', parseFloat(e.target.value))}
            />
            <span>{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Graphics</h3>
          <div className="setting-item">
            <label>Tile Size</label>
            <input
              type="range"
              min="30"
              max="100"
              step="10"
              value={settings.tileSize}
              onChange={(e) => handleSettingChange('tileSize', parseInt(e.target.value))}
            />
            <span>{settings.tileSize}px</span>
          </div>
          <div className="setting-item">
            <label>Grid Size</label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={settings.gridSize}
              onChange={(e) => handleSettingChange('gridSize', parseInt(e.target.value))}
            />
            <span>{settings.gridSize}x{settings.gridSize}</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Game</h3>
          <div className="setting-item">
            <label>Auto Save</label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <label>Debug Mode</label>
            <input
              type="checkbox"
              checked={settings.debug}
              onChange={(e) => handleSettingChange('debug', e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
