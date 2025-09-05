/**
 * TileRenderer Module - Handles tile rendering and display
 */
class TileRenderer {
    constructor() {
        this.imageCache = new Map();
        this.renderingQueue = [];
        this.isRendering = false;
    }

    /**
     * Render tiles to DOM container
     */
    async renderTiles(container, tiles, options = {}) {
        const {
            viewMode = 'cards',
            showLoading = true,
            batchSize = 10,
            delay = 0
        } = options;

        if (showLoading) {
            this.showLoadingIndicator(container);
        }

        // Clear container
        container.innerHTML = '';

        if (!tiles || tiles.length === 0) {
            this.showEmptyState(container);
            return;
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Process tiles in batches
        for (let i = 0; i < tiles.length; i += batchSize) {
            const batch = tiles.slice(i, i + batchSize);
            
            for (const tile of batch) {
                const tileElement = this.createTileElement(tile, viewMode);
                fragment.appendChild(tileElement);
            }

            // Add delay between batches for smooth rendering
            if (delay > 0 && i + batchSize < tiles.length) {
                await this.delay(delay);
            }
        }

        // Append all tiles at once
        container.appendChild(fragment);

        // Post-render processing
        this.postRenderProcessing(container, tiles);
    }

    /**
     * Create tile element based on view mode
     */
    createTileElement(tile, viewMode) {
        switch (viewMode) {
            case 'cards':
                return this.createCardElement(tile);
            case 'table':
                return this.createTableElement(tile);
            case 'grid':
                return this.createGridElement(tile);
            default:
                return this.createCardElement(tile);
        }
    }

    /**
     * Create card-style tile element
     */
    createCardElement(tile) {
        const tileItem = document.createElement('div');
        tileItem.className = 'biome-tile-item tile-card';
        tileItem.dataset.tileId = tile.id || tile.tempId || Math.random();
        tileItem.dataset.tileName = tile.name;

        tileItem.innerHTML = `
            <div class="tile-actions">
                <button type="button" class="tile-action-btn" onclick="window.tileEditor.openTileModalFromBiome('${tile.id || tile.tempId}')" title="Tile bearbeiten">✏️</button>
                <button type="button" class="tile-action-btn" onclick="window.tileEditor.removeTileFromBiome('${tile.id || tile.tempId}')" title="Entfernen">❌</button>
            </div>
            <div class="tile-image-container">
                <div class="tile-loading">Laden...</div>
                <img src="${this.encodeImagePath(tile.image)}" alt="${tile.name}"
                     onerror="this.style.display='none'; this.previousElementSibling.style.display='block';"
                     onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
            </div>
            <div class="tile-info">
                <div class="tile-name">${tile.name}</div>
                <div class="tile-description">${tile.description || ''}</div>
                <div class="tile-stats">
                    <span class="tile-stat">🚶 ${tile.movementCost || 1}</span>
                    <span class="tile-stat">🛡️ ${tile.defenseBonus || 0}</span>
                </div>
            </div>
        `;

        return tileItem;
    }

    /**
     * Create table-style tile element
     */
    createTableElement(tile) {
        const tileItem = document.createElement('div');
        tileItem.className = 'biome-tile-item tile-table';
        tileItem.dataset.tileId = tile.id || tile.tempId || Math.random();

        tileItem.innerHTML = `
            <div class="tile-table-row">
                <div class="tile-table-cell tile-image">
                    <img src="${this.encodeImagePath(tile.image)}" alt="${tile.name}" class="tile-thumbnail">
                </div>
                <div class="tile-table-cell tile-name">${tile.name}</div>
                <div class="tile-table-cell tile-actions">
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.openTileModalFromBiome('${tile.id || tile.tempId}')">✏️</button>
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.removeTileFromBiome('${tile.id || tile.tempId}')">❌</button>
                </div>
            </div>
        `;

        return tileItem;
    }

    /**
     * Create grid-style tile element
     */
    createGridElement(tile) {
        const tileItem = document.createElement('div');
        tileItem.className = 'biome-tile-item tile-grid';
        tileItem.dataset.tileId = tile.id || tile.tempId || Math.random();

        tileItem.innerHTML = `
            <div class="tile-grid-image">
                <img src="${this.encodeImagePath(tile.image)}" alt="${tile.name}">
            </div>
            <div class="tile-grid-overlay">
                <div class="tile-grid-name">${tile.name}</div>
                <div class="tile-grid-actions">
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.openTileModalFromBiome('${tile.id || tile.tempId}')">✏️</button>
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.removeTileFromBiome('${tile.id || tile.tempId}')">❌</button>
                </div>
            </div>
        `;

        return tileItem;
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator(container) {
        container.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <div class="loading-text">🔄 Lade Tiles...</div>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-title">Keine Tiles vorhanden</div>
                <div class="empty-description">Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen</div>
            </div>
        `;
    }

    /**
     * Post-render processing
     */
    postRenderProcessing(container, tiles) {
        // Update tile count
        this.updateTileCount(tiles.length);

        // Preload images for better performance
        this.preloadImages(tiles);

        // Add event listeners
        this.addTileEventListeners(container);

        // Trigger custom event
        container.dispatchEvent(new CustomEvent('tilesRendered', {
            detail: { tiles, count: tiles.length }
        }));
    }

    /**
     * Update tile count display
     */
    updateTileCount(count) {
        const countElement = document.getElementById('biomeTileCount');
        if (countElement) {
            countElement.textContent = `${count} Tiles`;
        }
    }

    /**
     * Preload images for better performance
     */
    preloadImages(tiles) {
        tiles.forEach(tile => {
            if (tile.image && !this.imageCache.has(tile.image)) {
                const img = new Image();
                img.src = this.encodeImagePath(tile.image);
                this.imageCache.set(tile.image, img);
            }
        });
    }

    /**
     * Add event listeners to tiles
     */
    addTileEventListeners(container) {
        const tiles = container.querySelectorAll('.biome-tile-item');
        
        tiles.forEach(tile => {
            // Click to select
            tile.addEventListener('click', (e) => {
                if (!e.target.closest('.tile-action-btn')) {
                    this.selectTile(tile);
                }
            });

            // Hover effects
            tile.addEventListener('mouseenter', () => {
                tile.classList.add('tile-hover');
            });

            tile.addEventListener('mouseleave', () => {
                tile.classList.remove('tile-hover');
            });
        });
    }

    /**
     * Select a tile
     */
    selectTile(tileElement) {
        // Remove previous selection
        const prevSelected = document.querySelector('.biome-tile-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // Add selection to current tile
        tileElement.classList.add('selected');

        // Trigger selection event
        tileElement.dispatchEvent(new CustomEvent('tileSelected', {
            detail: { tileId: tileElement.dataset.tileId }
        }));
    }

    /**
     * Encode image path for safe URL usage
     */
    encodeImagePath(imagePath) {
        if (!imagePath) return '';
        return encodeURI(imagePath);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear image cache
     */
    clearImageCache() {
        this.imageCache.clear();
    }

    /**
     * Get renderer statistics
     */
    getStats() {
        return {
            imageCacheSize: this.imageCache.size,
            renderingQueue: this.renderingQueue.length,
            isRendering: this.isRendering
        };
    }
}

// Export for use in other modules
window.TileRenderer = TileRenderer;
