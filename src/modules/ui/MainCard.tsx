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
import { MainCardAPI } from '../../shared/types';

export class MainCardImpl implements MainCardAPI {
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

export const MainCard: React.FC = () => {
  return (
    <div className="main-card">
      <div className="main-card-header">
        <h1>WoodChunk 1.5</h1>
        <div className="main-card-controls">
          <button className="btn btn-primary">New Game</button>
          <button className="btn btn-secondary">Load Game</button>
          <button className="btn btn-secondary">Settings</button>
        </div>
      </div>
      <div className="main-card-content">
        <div className="game-status">
          <div className="status-item">
            <span className="label">World:</span>
            <span className="value">New World</span>
          </div>
          <div className="status-item">
            <span className="label">Location:</span>
            <span className="value">Forest</span>
          </div>
          <div className="status-item">
            <span className="label">Time:</span>
            <span className="value">Day 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
