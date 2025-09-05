/**
 * BiomeModal Integration - Advanced Integration System
 * Provides flexible integration patterns for BiomeModal with any application
 */

class BiomeModalIntegration {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            // Modal configuration
            modalConfig: {
                modalId: 'biomeModal',
                container: document.body,
                autoInit: true,
                debug: options.debug || false,
                eventPrefix: 'biomeModal',
                ...options.modalConfig
            },
            
            // Table component configuration
            tableConfig: {
                containerId: 'biomeTilesList',
                defaultView: 'table',
                defaultFilter: 'all',
                debug: options.debug || false,
                eventPrefix: 'biomeTable',
                autoInit: true,
                ...options.tableConfig
            },
            
            // Integration configuration
            autoConnect: options.autoConnect !== false,
            dataProvider: options.dataProvider || null,
            eventBus: options.eventBus || null,
            debug: options.debug || false,
            ...options
        };

        // Components
        this.biomeModal = null;
        this.tableComponent = null;
        this.eventListeners = new Map();
        this.dataProvider = this.config.dataProvider;
        this.eventBus = this.config.eventBus;

        // Initialize if autoConnect is enabled
        if (this.config.autoConnect) {
            this.init();
        }
    }

    init() {
        this.createComponents();
        this.setupEventListeners();
        this.setupDataProvider();
        this.setupEventBus();
        this.debug('BiomeModalIntegration initialized');
        this.emit('initialized');
    }

    createComponents() {
        // Create BiomeModal with custom table component
        this.biomeModal = new BiomeModal({
            ...this.config.modalConfig,
            tableComponent: BiomeTableComponent
        });

        // Get the table component reference
        this.tableComponent = this.biomeModal.getTableComponent();
        
        this.debug('Components created');
    }

    setupEventListeners() {
        // Listen to BiomeModal events
        this.biomeModal.on('initialized', () => {
            this.debug('BiomeModal initialized');
        });

        this.biomeModal.on('opened', (biomeData) => {
            this.debug('Modal opened for:', biomeData.name);
            this.emit('modalOpened', biomeData);
        });

        this.biomeModal.on('closed', () => {
            this.debug('Modal closed');
            this.emit('modalClosed');
        });

        this.biomeModal.on('saved', (biomeData) => {
            this.debug('Biome saved:', biomeData.name);
            this.handleBiomeSaved(biomeData);
        });

        this.biomeModal.on('error', (error) => {
            this.debugError('Modal error:', error);
            this.emit('error', error);
        });

        this.biomeModal.on('destroyed', () => {
            this.debug('Modal destroyed');
            this.emit('modalDestroyed');
        });

        // Listen to table component events
        if (this.tableComponent) {
            this.tableComponent.on('initialized', () => {
                this.debug('Table component initialized');
            });

            this.tableComponent.on('tilesLoaded', (tiles) => {
                this.debug('Tiles loaded:', tiles.length);
                this.emit('tilesLoaded', tiles);
            });

            this.tableComponent.on('tileAdded', (tile) => {
                this.debug('Tile added:', tile.name);
                this.handleTileAdded(tile);
            });

            this.tableComponent.on('tileDeleted', (tile) => {
                this.debug('Tile deleted:', tile.name);
                this.handleTileDeleted(tile);
            });

            this.tableComponent.on('editTile', (tile) => {
                this.debug('Edit tile:', tile.name);
                this.handleEditTile(tile);
            });

            this.tableComponent.on('tilesFiltered', (tiles) => {
                this.debug('Tiles filtered:', tiles.length);
                this.emit('tilesFiltered', tiles);
            });

            this.tableComponent.on('destroyed', () => {
                this.debug('Table component destroyed');
            });
        }
    }

    setupDataProvider() {
        if (this.dataProvider) {
            this.debug('Data provider configured');
            
            // Setup data provider methods
            if (typeof this.dataProvider.getBiomeData === 'function') {
                this.debug('Data provider has getBiomeData method');
            }
            
            if (typeof this.dataProvider.saveBiomeData === 'function') {
                this.debug('Data provider has saveBiomeData method');
            }
            
            if (typeof this.dataProvider.updateBiomeData === 'function') {
                this.debug('Data provider has updateBiomeData method');
            }
        }
    }

    setupEventBus() {
        if (this.eventBus) {
            this.debug('Event bus configured');
            
            // Listen to external events
            if (typeof this.eventBus.on === 'function') {
                this.eventBus.on('openBiomeModal', (data) => {
                    this.openBiomeModal(data);
                });
                
                this.eventBus.on('closeBiomeModal', () => {
                    this.closeBiomeModal();
                });
                
                this.eventBus.on('refreshBiomeData', (data) => {
                    this.refreshBiomeData(data);
                });
            }
        }
    }

    // Public API methods
    openBiomeModal(biomeData) {
        if (this.biomeModal) {
            // If data provider is available, enrich the data
            if (this.dataProvider && typeof this.dataProvider.getBiomeData === 'function') {
                const enrichedData = this.dataProvider.getBiomeData(biomeData);
                this.biomeModal.open(enrichedData);
            } else {
                this.biomeModal.open(biomeData);
            }
        }
    }

    closeBiomeModal() {
        if (this.biomeModal) {
            this.biomeModal.close();
        }
    }

    isBiomeModalOpen() {
        return this.biomeModal ? this.biomeModal.isModalOpen() : false;
    }

    getCurrentBiome() {
        return this.biomeModal ? this.biomeModal.getCurrentBiome() : null;
    }

    getTableComponent() {
        return this.tableComponent;
    }

    getBiomeModal() {
        return this.biomeModal;
    }

    // Configuration methods
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.debug('Configuration updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Data provider methods
    setDataProvider(dataProvider) {
        this.dataProvider = dataProvider;
        this.setupDataProvider();
        this.debug('Data provider updated');
    }

    setEventBus(eventBus) {
        this.eventBus = eventBus;
        this.setupEventBus();
        this.debug('Event bus updated');
    }

    // Event handlers
    handleBiomeSaved(biomeData) {
        // Update data provider if available
        if (this.dataProvider && typeof this.dataProvider.saveBiomeData === 'function') {
            this.dataProvider.saveBiomeData(biomeData);
        }
        
        // Update data provider if available
        if (this.dataProvider && typeof this.dataProvider.updateBiomeData === 'function') {
            this.dataProvider.updateBiomeData(biomeData);
        }
        
        // Emit event
        this.emit('biomeSaved', biomeData);
        
        // Emit to event bus if available
        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('biomeSaved', biomeData);
        }
    }

    handleTileAdded(tile) {
        // Add tile to data provider if available
        if (this.dataProvider && typeof this.dataProvider.addTileToBiome === 'function') {
            this.dataProvider.addTileToBiome(tile);
        }
        
        // Emit event
        this.emit('tileAdded', tile);
        
        // Emit to event bus if available
        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('tileAdded', tile);
        }
    }

    handleTileDeleted(tile) {
        // Remove tile from data provider if available
        if (this.dataProvider && typeof this.dataProvider.removeTileFromBiome === 'function') {
            this.dataProvider.removeTileFromBiome(tile);
        }
        
        // Emit event
        this.emit('tileDeleted', tile);
        
        // Emit to event bus if available
        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('tileDeleted', tile);
        }
    }

    handleEditTile(tile) {
        // Open tile editor if available
        if (this.dataProvider && typeof this.dataProvider.openTileEditor === 'function') {
            this.dataProvider.openTileEditor(tile);
        }
        
        // Emit event
        this.emit('editTile', tile);
        
        // Emit to event bus if available
        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('editTile', tile);
        }
    }

    refreshBiomeData(biomeData) {
        if (this.biomeModal && this.biomeModal.isModalOpen()) {
            this.biomeModal.loadBiomeData(biomeData);
            this.debug('Biome data refreshed');
        }
    }

    // Event system
    emit(event, data) {
        const eventListeners = this.eventListeners.get(event) || [];
        eventListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.debugError('Event listener error:', error);
            }
        });
    }

    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }

    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Debug methods
    debug(message, ...args) {
        if (this.config.debug) {
            console.debug('[BiomeModalIntegration]', message, ...args);
        }
    }

    debugError(message, error) {
        if (this.config.debug) {
            console.error('[BiomeModalIntegration]', message, error);
        }
    }

    // Lifecycle methods
    destroy() {
        // Remove event listeners
        this.eventListeners.clear();
        
        // Destroy components
        if (this.biomeModal) {
            this.biomeModal.destroy();
            this.biomeModal = null;
        }
        
        this.tableComponent = null;
        
        this.debug('BiomeModalIntegration destroyed');
        this.emit('destroyed');
    }

    // Static factory methods
    static create(options = {}) {
        return new BiomeModalIntegration(options);
    }

    static createWithDataProvider(dataProvider, options = {}) {
        return new BiomeModalIntegration({
            ...options,
            dataProvider,
            autoConnect: true
        });
    }

    static createWithEventBus(eventBus, options = {}) {
        return new BiomeModalIntegration({
            ...options,
            eventBus,
            autoConnect: true
        });
    }

    // Static method to check if BiomeModalIntegration is available
    static isAvailable() {
        return typeof BiomeModalIntegration !== 'undefined';
    }
}

// Usage examples:
/*
// Basic usage
const integration = BiomeModalIntegration.create({
    debug: true
});

// With data provider
const dataProvider = {
    getBiomeData: (biome) => ({ ...biome, tiles: [] }),
    saveBiomeData: (biome) => console.log('Saving:', biome),
    updateBiomeData: (biome) => console.log('Updating:', biome),
    addTileToBiome: (tile) => console.log('Adding tile:', tile),
    removeTileFromBiome: (tile) => console.log('Removing tile:', tile),
    openTileEditor: (tile) => console.log('Opening editor for:', tile)
};

const integration = BiomeModalIntegration.createWithDataProvider(dataProvider, {
    debug: true
});

// With event bus
const eventBus = {
    on: (event, handler) => console.log('Listening to:', event),
    emit: (event, data) => console.log('Emitting:', event, data)
};

const integration = BiomeModalIntegration.createWithEventBus(eventBus, {
    debug: true
});

// Open modal
integration.openBiomeModal({
    name: 'Forest',
    description: 'A dense forest biome',
    color: '#228B22',
    image: 'assets/biomes/Forest/Forest.png'
});
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomeModalIntegration;
} else if (typeof window !== 'undefined') {
    window.BiomeModalIntegration = BiomeModalIntegration;
}
