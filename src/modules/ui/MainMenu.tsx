import React from 'react';
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
import { MainMenuAPI } from '../../shared/types';

export class MainMenuImpl implements MainMenuAPI {
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

export const MainMenu: React.FC = () => {
  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1>WoodChunk 1.5</h1>
        <p>Adventure Awaits</p>
      </div>
      <nav className="menu-navigation">
        <button className="menu-item btn btn-large">
          <span className="icon">🎮</span>
          <span className="label">Play Game</span>
        </button>

        <button className="menu-item btn btn-large">
          <span className="icon">⚔️</span>
          <span className="label">Character Editor</span>
        </button>
        <button className="menu-item btn btn-large">
          <span className="icon">🛡️</span>
          <span className="label">Item Editor</span>
        </button>
        <button className="menu-item btn btn-large">
          <span className="icon">👥</span>
          <span className="label">People Editor</span>
        </button>
        <button className="menu-item btn btn-large">
          <span className="icon">⚙️</span>
          <span className="label">Settings</span>
        </button>
      </nav>
      <div className="menu-footer">
        <p>Version 1.5.0</p>
      </div>
    </div>
  );
};
