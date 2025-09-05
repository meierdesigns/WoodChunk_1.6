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
import { ItemEditorAPI } from '../../shared/types';

export class ItemEditorImpl implements ItemEditorAPI {
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

export const ItemEditor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Load the ItemEditor module
      loadItemEditorModule();
    }
  }, []);

  const loadItemEditorModule = async () => {
    try {
      // Load the ItemEditor CSS first
      await loadItemEditorCSS();
      
      // Load the ItemEditor HTML content
      const response = await fetch('/modules/itemEditor/itemEditor.html');
      if (response.ok) {
        const html = await response.text();
        if (containerRef.current) {
          containerRef.current.innerHTML = html;
          
          // Load and initialize the ItemEditor JavaScript
          await loadItemEditorScript();
        }
      }
    } catch (error) {
      console.error('Failed to load ItemEditor module:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="error-message">
            <h3>⚠️ Fehler beim Laden des Item Editors</h3>
            <p>${error}</p>
            <button onclick="location.reload()" class="btn btn-primary">Neu laden</button>
          </div>
        `;
      }
    }
  };

  const loadItemEditorCSS = async () => {
    try {
      // Check if CSS is already loaded
      if (document.querySelector('link[href="/modules/itemEditor/itemEditor.css"]')) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/modules/itemEditor/itemEditor.css';
      link.type = 'text/css';
      
      document.head.appendChild(link);
      
      // Wait for CSS to load
      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve; // Continue even if CSS fails
      });
    } catch (error) {
      console.warn('Failed to load ItemEditor CSS:', error);
    }
  };

  const loadItemEditorScript = async () => {
    try {
      // Check if script is already loaded
      if (document.querySelector('script[src="/modules/itemEditor/itemEditor.js"]')) {
        return;
      }

      // Load the ItemEditor JavaScript
      const script = document.createElement('script');
      script.src = '/modules/itemEditor/itemEditor.js';
      script.type = 'module';
      
      script.onload = () => {
        console.log('ItemEditor script loaded');
        // Initialize the ItemEditor
        if (window.itemEditor) {
          window.itemEditor.initialize();
        }
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to load ItemEditor script:', error);
    }
  };

  return (
    <div className="item-editor-module">
      <div id="itemEditorContainer" ref={containerRef}>
        <div className="loading">Lade Item Editor...</div>
      </div>
    </div>
  );
};
