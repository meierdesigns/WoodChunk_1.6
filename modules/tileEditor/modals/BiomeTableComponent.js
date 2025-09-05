/**
 * BiomeTableComponent - Standalone Table Component
 * Handles tile display in table and card views
 * Optimized for better integration and flexibility
 */

class BiomeTableComponent {
    constructor(biomeModal, options = {}) {
        // Configuration with defaults
        this.config = {
            containerId: 'biomeTilesList',
            defaultView: 'table',
            defaultFilter: 'all',
            eventPrefix: options.eventPrefix || 'biomeTable',
            debug: options.debug || false,
            autoInit: options.autoInit !== false,
            tileTypes: this.getTileTypesForBiome(options.biomeType),
            ...options
        };

        // Dependencies
        this.biomeModal = biomeModal;
        
        // State
        this.container = null;
        this.tiles = [];
        this.filteredTiles = [];
        this.currentView = this.config.defaultView;
        this.currentFilter = this.config.defaultFilter;
        this.eventListeners = new Map();

        // Initialize if autoInit is enabled
        if (this.config.autoInit) {
            this.init();
        }
    }
    
    // Cache busting utility for Buildings images
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Add cache busting for Buildings tiles
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const separator = imagePath.includes('?') ? '&' : '?';
            return `${imagePath}${separator}_cb=${timestamp}`;
        }
        
        return imagePath;
    }

    getTileTypesForBiome(biomeType) {
        // Default tile types for terrain biomes
        const defaultTileTypes = ['grass', 'dirt', 'stone', 'water', 'sand', 'snow', 'forest', 'mountain'];
        
        // Special tile types for buildings/entities biome
        const buildingTileTypes = ['mining_site', 'tower', 'building', 'settlement', 'castle', 'village', 'temple', 'ritual_site'];
        
        // Return appropriate tile types based on biome type
        if (biomeType === 'entities' || biomeType === 'buildings') {
            return buildingTileTypes;
        }
        
        return defaultTileTypes;
    }

    init() {
        this.container = document.getElementById(this.config.containerId);
        this.setupEventListeners();
        this.debug('BiomeTableComponent initialized');
        this.emit('initialized');
    }

    setupEventListeners() {
        // Drag and drop zone
        this.addEventListener('biomeDragDropZone', 'click', () => this.openFileSelector());
        this.addEventListener('biomeDragDropZone', 'dragover', (e) => this.handleDragOver(e));
        this.addEventListener('biomeDragDropZone', 'drop', (e) => this.handleDrop(e));
    }

    addEventListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.set(`${elementId}_${event}`, { element, event, handler });
        }
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
    }

    async loadTiles(biomeData) {
        try {
            this.debug('Loading tiles for biome:', biomeData.name);
            
            // Update tile types based on biome type if provided
            if (biomeData.type) {
                this.config.tileTypes = this.getTileTypesForBiome(biomeData.type);
                this.debug('Updated tile types for biome type:', biomeData.type, this.config.tileTypes);
            }
            
            // Load tiles from biome data
            this.tiles = biomeData.tiles || [];
            this.filteredTiles = [...this.tiles];
            
            // REMOVED: Duplicate renderTiles call - now handled by TileEditor.js
            // this.renderTiles();
            
            this.debug(`Loaded ${this.tiles.length} tiles`);
            this.emit('tilesLoaded', this.tiles);
            
        } catch (error) {
            this.debugError('Failed to load tiles:', error);
            this.emit('error', error);
        }
    }

    // REMOVED: Duplicate renderTiles function - now handled by TileEditor.js displayTilesAsTable/Cards

    // REMOVED: Duplicate renderTableView function - now handled by TileEditor.js displayTilesAsTable

    renderTableRow(tile) {
        return `
            <tr class="tile-row" data-tile-id="${tile.id}">
                <td class="tile-image-cell">
                                         <img src="${tile.image || '/assets/tiles/default.png'}" alt="${tile.name}" class="tile-thumbnail">
                </td>
                <td class="tile-name-cell">
                    <span class="tile-name">${tile.name}</span>
                </td>
                <td class="tile-type-cell">
                    <span class="tile-type">${tile.type || 'Unknown'}</span>
                </td>
                <td class="tile-movement-cell">
                    <span class="tile-movement">${tile.movementCost || 1}</span>
                </td>
                <td class="tile-defense-cell">
                    <span class="tile-defense">${tile.defenseBonus || 0}</span>
                </td>
                <td class="tile-default-cell">
                    <span class="tile-default">${tile.isDefault ? '✓' : ''}</span>
                </td>
                <td class="tile-actions-cell">
                    <button class="btn btn-small btn-primary edit-tile-btn" data-tile-id="${tile.id}">✏️</button>
                    <button class="btn btn-small btn-danger delete-tile-btn" data-tile-id="${tile.id}">🗑️</button>
                </td>
            </tr>
        `;
    }

    // REMOVED: Duplicate renderCardView function - now handled by TileEditor.js displayTilesAsCards

    renderCard(tile) {
        return `
            <div class="tile-card" data-tile-id="${tile.id}">
                <div class="tile-card-image">
                                         <img src="${tile.image || '/assets/tiles/default.png'}" alt="${tile.name}" loading="lazy">
                    ${tile.isDefault ? '<div class="tile-card-badge">⭐ Standard</div>' : ''}
                </div>
                <div class="tile-card-content">
                    <h5 class="tile-card-name" title="${tile.name}">${tile.name}</h5>
                    <div class="tile-card-stats">
                        <span class="tile-stat" title="Bewegungskosten">🚶 ${tile.movementCost || 1}</span>
                        <span class="tile-stat" title="Verteidigungsbonus">🛡️ ${tile.defenseBonus || 0}</span>
                        <span class="tile-stat" title="Typ">📋 ${tile.type || 'Unknown'}</span>
                    </div>
                    <div class="tile-card-type">${this.getTileTypeDisplayName(tile.type)}</div>
                </div>
                <div class="tile-card-actions">
                    <button class="btn btn-small btn-primary edit-tile-btn" data-tile-id="${tile.id}" title="Bearbeiten">✏️</button>
                    <button class="btn btn-small btn-danger delete-tile-btn" data-tile-id="${tile.id}" title="Löschen">🗑️</button>
                    <button class="btn btn-small btn-info view-tile-btn" data-tile-id="${tile.id}" title="Vorschau">👁️</button>
                </div>
            </div>
        `;
    }

    getTileTypeDisplayName(type) {
        const typeNames = {
            'mining_site': '⛏️ Mining Site',
            'tower': '🗼 Tower',
            'building': '🏢 Building',
            'settlement': '🏘️ Settlement',
            'castle': '🏰 Castle',
            'village': '🏘️ Village',
            'temple': '⛪ Temple',
            'ritual_site': '🔮 Ritual Site',
            'unknown': '❓ Unknown'
        };
        return typeNames[type] || typeNames['unknown'];
    }

    setupTableEventListeners() {
        // Edit buttons
        this.container.querySelectorAll('.edit-tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tileId = e.target.dataset.tileId;
                this.editTile(tileId);
            });
        });

        // Delete buttons
        this.container.querySelectorAll('.delete-tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tileId = e.target.dataset.tileId;
                this.deleteTile(tileId);
            });
        });
    }

    setupCardEventListeners() {
        // Edit buttons
        this.container.querySelectorAll('.edit-tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tileId = e.target.dataset.tileId;
                this.editTile(tileId);
            });
        });

        // Delete buttons
        this.container.querySelectorAll('.delete-tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tileId = e.target.dataset.tileId;
                this.deleteTile(tileId);
            });
        });

        // View buttons
        this.container.querySelectorAll('.view-tile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tileId = e.target.dataset.tileId;
                this.viewTile(tileId);
            });
        });

        // Card click for selection
        this.container.querySelectorAll('.tile-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.tile-card-actions')) {
                    const tileId = card.dataset.tileId;
                    this.selectTile(tileId);
                }
            });

            // Double click for quick edit
            card.addEventListener('dblclick', (e) => {
                if (!e.target.closest('.tile-card-actions')) {
                    const tileId = card.dataset.tileId;
                    this.editTile(tileId);
                }
            });
        });
    }

    // REMOVED: Duplicate showTableView function - now handled by TileEditor.js

    // REMOVED: Duplicate showCardView function - now handled by TileEditor.js

    // REMOVED: Duplicate updateViewButtons function - now handled by TileEditor.js

    filterTiles(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredTiles = [...this.tiles];
        } else {
            this.filteredTiles = this.tiles.filter(tile => tile.type === filter);
        }
        
        // REMOVED: Duplicate renderTiles call - now handled by TileEditor.js
        // this.renderTiles();
        this.debug(`Filtered tiles: ${this.filteredTiles.length} of ${this.tiles.length} (filter: ${filter})`);
        this.emit('tilesFiltered', this.filteredTiles);
    }

    addTile() {
        this.debug('Adding new tile');
        this.emit('addTile');
        
        // Open file selector
        this.openFileSelector();
    }

    importTiles() {
        this.debug('Importing tiles');
        this.emit('importTiles');
        
        // Open file selector for multiple files
        this.openFileSelector(true);
    }

    cleanTiles() {
        this.debug('Cleaning tiles');
        this.emit('cleanTiles');
        
        // Show tile cleaner interface
        this.showTileCleaner();
    }

    editTile(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (tile) {
            this.debug('Editing tile:', tile.name);
            this.emit('editTile', tile);
        }
    }

    deleteTile(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (tile) {
            if (confirm(`Möchten Sie das Tile "${tile.name}" wirklich löschen?`)) {
                this.debug('Deleting tile:', tile.name);
                this.removeTile(tileId);
                this.emit('deleteTile', tile);
            }
        }
    }

    removeTile(tileId) {
        this.tiles = this.tiles.filter(t => t.id !== tileId);
        this.filteredTiles = this.filteredTiles.filter(t => t.id !== tileId);
        // REMOVED: Duplicate renderTiles call - now handled by TileEditor.js
        // this.renderTiles();
    }

    openFileSelector(multiple = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (multiple) {
            input.multiple = true;
        }
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.handleFileSelection(files);
        };
        
        input.click();
    }

    handleFileSelection(files) {
        this.debug(`Selected ${files.length} files`);
        
        files.forEach(file => {
            this.processFile(file);
        });
        
        this.emit('filesSelected', files);
    }

    async processFile(file) {
        try {
            // Create tile object
            const tile = {
                id: this.generateTileId(),
                name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                image: URL.createObjectURL(file),
                type: 'unknown',
                movementCost: 1,
                defenseBonus: 0,
                isDefault: false,
                file: file
            };
            
            // Add to tiles array
            this.tiles.push(tile);
            this.filteredTiles.push(tile);
            
            // REMOVED: Duplicate renderTiles call - now handled by TileEditor.js
            // this.renderTiles();
            
            this.debug('Processed file:', file.name);
            this.emit('tileAdded', tile);
            
        } catch (error) {
            this.debugError('Failed to process file:', error);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('biomeDragDropZone');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('biomeDragDropZone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFileSelection(files);
    }

    viewTile(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (tile) {
            this.debug('Viewing tile:', tile.name);
            this.emit('viewTile', tile);
            this.showTilePreview(tile);
        }
    }

    selectTile(tileId) {
        // Remove previous selection
        this.container.querySelectorAll('.tile-card.selected').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to current card
        const card = this.container.querySelector(`[data-tile-id="${tileId}"]`);
        if (card) {
            card.classList.add('selected');
            this.debug('Selected tile:', tileId);
            this.emit('tileSelected', tileId);
        }
    }

    showTilePreview(tile) {
        // Create preview modal
        const previewHTML = `
            <div class="tile-preview-modal">
                <div class="tile-preview-content">
                    <div class="tile-preview-header">
                        <h3>${tile.name}</h3>
                        <button class="close-preview-btn">&times;</button>
                    </div>
                    <div class="tile-preview-body">
                        <div class="tile-preview-image">
                            <img src="${tile.image}" alt="${tile.name}">
                        </div>
                        <div class="tile-preview-details">
                            <div class="tile-preview-stat">
                                <strong>Typ:</strong> ${this.getTileTypeDisplayName(tile.type)}
                            </div>
                            <div class="tile-preview-stat">
                                <strong>Bewegung:</strong> ${tile.movementCost || 1}
                            </div>
                            <div class="tile-preview-stat">
                                <strong>Verteidigung:</strong> ${tile.defenseBonus || 0}
                            </div>
                            ${tile.isDefault ? '<div class="tile-preview-stat"><strong>Status:</strong> ⭐ Standard</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', previewHTML);
        
        // Setup close functionality
        const previewModal = document.querySelector('.tile-preview-modal');
        const closeBtn = previewModal.querySelector('.close-preview-btn');
        
        closeBtn.addEventListener('click', () => {
            previewModal.remove();
        });
        
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.remove();
            }
        });

        // Auto-close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                previewModal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    showTileCleaner() {
        // Implementation for tile cleaner interface
        this.debug('Showing tile cleaner');
        this.emit('showTileCleaner');
    }

    generateTileId() {
        return 'tile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    clear() {
        this.tiles = [];
        this.filteredTiles = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.debug('Cleared tiles');
    }

    // Event system with prefix support
    emit(event, data) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        const eventListeners = this.eventListeners.get(fullEvent) || [];
        eventListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.debugError('Event listener error:', error);
            }
        });
        
        // Also emit without prefix for backward compatibility
        const legacyListeners = this.eventListeners.get(event) || [];
        legacyListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.debugError('Event listener error:', error);
            }
        });
    }

    on(event, listener) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        if (!this.eventListeners.has(fullEvent)) {
            this.eventListeners.set(fullEvent, []);
        }
        this.eventListeners.get(fullEvent).push(listener);
    }

    off(event, listener) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        const listeners = this.eventListeners.get(fullEvent);
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
            console.debug(`[${this.config.eventPrefix}]`, message, ...args);
        }
    }

    debugError(message, error) {
        if (this.config.debug) {
            console.error(`[${this.config.eventPrefix}]`, message, error);
        }
    }

    // Configuration methods
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.debug('Configuration updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Public API
    getTiles() {
        return this.tiles;
    }

    getFilteredTiles() {
        return this.filteredTiles;
    }

    getCurrentView() {
        return this.currentView;
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    // Lifecycle methods
    destroy() {
        this.removeEventListeners();
        this.clear();
        this.debug('BiomeTableComponent destroyed');
        this.emit('destroyed');
    }

    // Static factory method for easy instantiation
    static create(biomeModal, options = {}) {
        return new BiomeTableComponent(biomeModal, options);
    }

    // Static method to check if BiomeTableComponent is available
    static isAvailable() {
        return typeof BiomeTableComponent !== 'undefined';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomeTableComponent;
} else if (typeof window !== 'undefined') {
    window.BiomeTableComponent = BiomeTableComponent;
}
