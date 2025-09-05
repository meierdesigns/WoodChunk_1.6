/**
 * TileEditor BiomeModal Integration Example
 * Shows how to integrate the optimized BiomeModal with TileEditor
 */

// Example TileEditor data provider
class TileEditorDataProvider {
    constructor(tileEditor) {
        this.tileEditor = tileEditor;
    }

    getBiomeData(biomeData) {
        // Enrich biome data with additional information
        return {
            ...biomeData,
            tiles: this.tileEditor.getBiomeTiles?.(biomeData.name) || [],
            lastModified: new Date().toISOString(),
            version: '1.0'
        };
    }

    saveBiomeData(biomeData) {
        // Save biome data to TileEditor
        if (this.tileEditor.updateBiomeData) {
            this.tileEditor.updateBiomeData(biomeData);
        }
        
        // Refresh UI if needed
        if (this.tileEditor.refreshUI) {
            this.tileEditor.refreshUI();
        }
        
        console.log('[TileEditorDataProvider] Biome saved:', biomeData.name);
    }

    updateBiomeData(biomeData) {
        // Update biome data in TileEditor
        if (this.tileEditor.updateBiomeData) {
            this.tileEditor.updateBiomeData(biomeData);
        }
        
        console.log('[TileEditorDataProvider] Biome updated:', biomeData.name);
    }

    addTileToBiome(tile) {
        // Add tile to TileEditor
        if (this.tileEditor.addTileToBiome) {
            this.tileEditor.addTileToBiome(tile);
        }
        
        console.log('[TileEditorDataProvider] Tile added:', tile.name);
    }

    removeTileFromBiome(tile) {
        // Remove tile from TileEditor
        if (this.tileEditor.removeTileFromBiome) {
            this.tileEditor.removeTileFromBiome(tile);
        }
        
        console.log('[TileEditorDataProvider] Tile removed:', tile.name);
    }

    openTileEditor(tile) {
        // Open tile editor in TileEditor
        if (this.tileEditor.openTileEditor) {
            this.tileEditor.openTileEditor(tile);
        }
        
        console.log('[TileEditorDataProvider] Opening tile editor for:', tile.name);
    }
}

// Example TileEditor event bus
class TileEditorEventBus {
    constructor(tileEditor) {
        this.tileEditor = tileEditor;
        this.listeners = new Map();
    }

    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        console.log('[TileEditorEventBus] Listening to:', event);
    }

    emit(event, data) {
        const handlers = this.listeners.get(event) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('[TileEditorEventBus] Handler error:', error);
            }
        });
        console.log('[TileEditorEventBus] Emitting:', event, data);
    }

    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
}

// Example integration with TileEditor
class TileEditorBiomeIntegration {
    constructor(tileEditor) {
        this.tileEditor = tileEditor;
        this.dataProvider = new TileEditorDataProvider(tileEditor);
        this.eventBus = new TileEditorEventBus(tileEditor);
        this.integration = null;
        this.init();
    }

    init() {
        // Create integration with data provider and event bus
        this.integration = BiomeModalIntegration.createWithDataProvider(this.dataProvider, {
            eventBus: this.eventBus,
            debug: true,
            modalConfig: {
                modalId: 'tileEditorBiomeModal',
                debug: true,
                eventPrefix: 'tileEditorBiomeModal'
            },
            tableConfig: {
                debug: true,
                eventPrefix: 'tileEditorBiomeTable'
            }
        });

        // Setup additional event listeners
        this.setupEventListeners();
        
        console.log('[TileEditorBiomeIntegration] Initialized');
    }

    setupEventListeners() {
        // Listen to integration events
        this.integration.on('initialized', () => {
            console.log('[TileEditorBiomeIntegration] Integration initialized');
        });

        this.integration.on('modalOpened', (biomeData) => {
            console.log('[TileEditorBiomeIntegration] Modal opened for:', biomeData.name);
            // Update TileEditor UI state
            this.tileEditor.setModalOpen?.(true);
        });

        this.integration.on('modalClosed', () => {
            console.log('[TileEditorBiomeIntegration] Modal closed');
            // Update TileEditor UI state
            this.tileEditor.setModalOpen?.(false);
        });

        this.integration.on('biomeSaved', (biomeData) => {
            console.log('[TileEditorBiomeIntegration] Biome saved:', biomeData.name);
            // Trigger TileEditor refresh
            this.tileEditor.refreshBiomeCards?.();
        });

        this.integration.on('tilesLoaded', (tiles) => {
            console.log('[TileEditorBiomeIntegration] Tiles loaded:', tiles.length);
        });

        this.integration.on('tileAdded', (tile) => {
            console.log('[TileEditorBiomeIntegration] Tile added:', tile.name);
            // Update TileEditor tile count
            this.tileEditor.updateTileCount?.(tile);
        });

        this.integration.on('tileDeleted', (tile) => {
            console.log('[TileEditorBiomeIntegration] Tile deleted:', tile.name);
            // Update TileEditor tile count
            this.tileEditor.updateTileCount?.(tile, -1);
        });

        this.integration.on('error', (error) => {
            console.error('[TileEditorBiomeIntegration] Error:', error);
            // Show error in TileEditor
            this.tileEditor.showError?.(error);
        });
    }

    // Public API methods
    openBiomeModal(biomeData) {
        if (this.integration) {
            this.integration.openBiomeModal(biomeData);
        }
    }

    closeBiomeModal() {
        if (this.integration) {
            this.integration.closeBiomeModal();
        }
    }

    isBiomeModalOpen() {
        return this.integration ? this.integration.isBiomeModalOpen() : false;
    }

    getCurrentBiome() {
        return this.integration ? this.integration.getCurrentBiome() : null;
    }

    // Configuration methods
    setDebug(enabled) {
        if (this.integration) {
            this.integration.setConfig({ debug: enabled });
        }
    }

    // Lifecycle methods
    destroy() {
        if (this.integration) {
            this.integration.destroy();
            this.integration = null;
        }
        console.log('[TileEditorBiomeIntegration] Destroyed');
    }
}

// Usage example:
/*
// In your TileEditor initialization:
const tileEditor = new TileEditor();
const biomeIntegration = new TileEditorBiomeIntegration(tileEditor);

// Open biome modal
biomeIntegration.openBiomeModal({
    name: 'Forest',
    description: 'A dense forest biome',
    color: '#228B22',
    image: 'assets/biomes/Forest/Forest.png'
});

// Check if modal is open
if (biomeIntegration.isBiomeModalOpen()) {
    console.log('Biome modal is currently open');
}

// Enable debug mode
biomeIntegration.setDebug(true);

// Close modal
biomeIntegration.closeBiomeModal();

// Cleanup
biomeIntegration.destroy();
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TileEditorDataProvider,
        TileEditorEventBus,
        TileEditorBiomeIntegration
    };
} else if (typeof window !== 'undefined') {
    window.TileEditorDataProvider = TileEditorDataProvider;
    window.TileEditorEventBus = TileEditorEventBus;
    window.TileEditorBiomeIntegration = TileEditorBiomeIntegration;
}
