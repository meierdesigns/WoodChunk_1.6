import React, { useEffect, useRef } from 'react';
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
import { CharacterEditorAPI } from '../../shared/types';

export class CharacterEditorImpl implements CharacterEditorAPI {
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

export const CharacterEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Load the CharacterEditor module
      loadCharacterEditorModule();
    }
  }, []);

  const loadCharacterEditorModule = async () => {
    try {
      // Load the CharacterEditor HTML content
      const response = await fetch('/modules/characterEditor/characterEditor.html');
      if (response.ok) {
        const html = await response.text();
        if (containerRef.current) {
          containerRef.current.innerHTML = html;
          
          // Load and initialize the CharacterEditor JavaScript
          await loadCharacterEditorScript();
        }
      }
    } catch (error) {
      console.error('Failed to load CharacterEditor module:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="error-message">
            <h3>⚠️ Fehler beim Laden des Character Editors</h3>
            <p>${error}</p>
            <button onclick="location.reload()" class="btn btn-primary">Neu laden</button>
          </div>
        `;
      }
    }
  };

  const loadCharacterEditorScript = async () => {
    try {
      // Load the CharacterEditor JavaScript
      const script = document.createElement('script');
      script.src = '/modules/characterEditor/characterEditor.js';
      script.type = 'module';
      
      script.onload = () => {
        console.log('CharacterEditor script loaded');
        // Initialize the CharacterEditor
        if (window.characterEditor) {
          window.characterEditor.initialize();
        }
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to load CharacterEditor script:', error);
    }
  };

  return (
    <div className="character-editor-module">
      <div id="characterEditorContainer" ref={containerRef}>
        <div className="loading">Lade Character Editor...</div>
      </div>
    </div>
  );
};
