"use strict";

/**
 * Integration script for adding tile inspection to existing hexmap editor
 * This script patches the existing renderer to add inspection functionality
 */

class TileInspectionIntegration {
  constructor() {
    console.debug('[ui/TileInspectionIntegration] Initializing integration');
    this.setupIntegration();
  }

  setupIntegration() {
    // Wait for the hexmap editor to be loaded
    this.waitForHexmapEditor();
  }

  waitForHexmapEditor() {
    const checkInterval = setInterval(() => {
      // Check if the hexmap editor is available
      if (window.MapRenderer && window.MapCore) {
        clearInterval(checkInterval);
        this.patchRenderer();
        this.addInspectionControls();
        console.debug('[ui/TileInspectionIntegration] Integration completed');
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('[ui/TileInspectionIntegration] Hexmap editor not found after 10 seconds');
    }, 10000);
  }

  patchRenderer() {
    if (!window.MapRenderer) return;

    // Store original handleTileClick method
    const originalHandleTileClick = window.MapRenderer.prototype.handleTileClick;

    // Patch the method to add inspection functionality
    window.MapRenderer.prototype.handleTileClick = function(e) {
      // Check if inspection mode is active
      if (window.tileInspectionBridge && window.tileInspectionBridge.isInspectionModeActive()) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.core.settings.offsetX) / this.core.settings.zoom;
        const y = (e.clientY - rect.top - this.core.settings.offsetY) / this.core.settings.zoom;
        
        // Convert pixel to hex coordinates
        const hexPos = this.pixelToHex(x, y);
        if (hexPos) {
          // Handle tile inspection instead of editing
          window.tileInspectionBridge.handleTileClickForInspection(hexPos, this.core);
          return; // Don't proceed with normal tile editing
        }
      }

      // Call original method for normal editing
      return originalHandleTileClick.call(this, e);
    };

    console.debug('[ui/TileInspectionIntegration] Renderer patched successfully');
  }

  addInspectionControls() {
    // Add inspection toggle button to the UI
    this.createInspectionToggleButton();
  }

  createInspectionToggleButton() {
    // Find the hexmap editor container
    const editorContainer = document.querySelector('.hexmap-editor') || 
                           document.querySelector('#hexmap-editor') ||
                           document.querySelector('.map-editor');

    if (!editorContainer) {
      console.warn('[ui/TileInspectionIntegration] Could not find editor container');
      return;
    }

    // Create inspection toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'tile-inspection-toggle';
    toggleButton.className = 'btn btn-secondary inspection-toggle';
    toggleButton.innerHTML = '🔍 Inspect Mode';
    toggleButton.title = 'Toggle tile inspection mode (click tiles to inspect instead of edit)';

    // Add click handler
    toggleButton.addEventListener('click', () => {
      if (window.tileInspectionBridge) {
        window.tileInspectionBridge.toggleInspectionMode();
        this.updateToggleButton();
      }
    });

    // Add to editor container
    const toolbar = editorContainer.querySelector('.toolbar') || 
                   editorContainer.querySelector('.controls') ||
                   editorContainer.querySelector('.editor-toolbar');

    if (toolbar) {
      toolbar.appendChild(toggleButton);
    } else {
      // Create a simple toolbar if none exists
      const simpleToolbar = document.createElement('div');
      simpleToolbar.className = 'simple-toolbar';
      simpleToolbar.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 100;
        display: flex;
        gap: 10px;
      `;
      simpleToolbar.appendChild(toggleButton);
      editorContainer.style.position = 'relative';
      editorContainer.appendChild(simpleToolbar);
    }

    // Add CSS for the button
    this.addInspectionStyles();

    console.debug('[ui/TileInspectionIntegration] Inspection controls added');
  }

  updateToggleButton() {
    const toggleButton = document.getElementById('tile-inspection-toggle');
    if (!toggleButton || !window.tileInspectionBridge) return;

    const isActive = window.tileInspectionBridge.isInspectionModeActive();
    
    if (isActive) {
      toggleButton.innerHTML = '✏️ Edit Mode';
      toggleButton.className = 'btn btn-primary inspection-toggle active';
      toggleButton.title = 'Switch to edit mode';
    } else {
      toggleButton.innerHTML = '🔍 Inspect Mode';
      toggleButton.className = 'btn btn-secondary inspection-toggle';
      toggleButton.title = 'Switch to inspection mode';
    }
  }

  addInspectionStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .inspection-toggle {
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }
      
      .inspection-toggle.active {
        border-color: #007bff;
        box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 10px rgba(0, 123, 255, 0.3); }
        50% { box-shadow: 0 0 20px rgba(0, 123, 255, 0.6); }
        100% { box-shadow: 0 0 10px rgba(0, 123, 255, 0.3); }
      }
      
      .simple-toolbar {
        background: rgba(255, 255, 255, 0.9);
        padding: 8px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TileInspectionIntegration();
  });
} else {
  new TileInspectionIntegration();
}

// Export for global access
window.TileInspectionIntegration = TileInspectionIntegration;
