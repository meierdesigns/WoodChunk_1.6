/**
 * BiomeManager Module - Handles biome operations and state management
 */
class BiomeManager {
    constructor() {
        this.biomeLoader = new BiomeLoader();
        this.tileRenderer = new TileRenderer();
        this.currentBiome = null;
        this.biomeState = new Map();
        this.eventListeners = new Map();
    }

    /**
     * Load and display biome tiles
     */
    async loadBiomeTiles(category, options = {}) {
        const startTime = performance.now();
        
        try {
            // Load biome data
            const biomeData = await this.biomeLoader.loadBiomeData(category.name);
            
            // Update current biome
            this.currentBiome = category;
            this.biomeState.set(category.name, {
                data: biomeData,
                lastLoaded: Date.now(),
                tileCount: biomeData.tiles.length
            });

            // Get container
            const container = document.getElementById('biomeTilesList');
            if (!container) {
                throw new Error('biomeTilesList container not found');
            }

            // Render tiles
            await this.tileRenderer.renderTiles(container, biomeData.tiles, {
                viewMode: options.viewMode || 'cards',
                showLoading: true,
                batchSize: options.batchSize || 10,
                delay: options.delay || 0
            });

            const loadTime = Math.round(performance.now() - startTime);
            console.log(`[BiomeManager] Biome tiles loaded in ${loadTime}ms: ${biomeData.tiles.length} tiles`);

            // Trigger event
            this.triggerEvent('biomeLoaded', {
                category,
                data: biomeData,
                loadTime,
                tileCount: biomeData.tiles.length
            });

            return biomeData;

        } catch (error) {
            console.error('[BiomeManager] Error loading biome tiles:', error);
            this.showErrorState();
            throw error;
        }
    }

    /**
     * Save biome data
     */
    async saveBiomeData(biomeName, data) {
        try {
            const success = await this.biomeLoader.saveBiomeData(biomeName, data);
            
            if (success) {
                // Update state
                this.biomeState.set(biomeName, {
                    data,
                    lastSaved: Date.now(),
                    tileCount: data.tiles.length
                });

                // Trigger event
                this.triggerEvent('biomeSaved', {
                    biomeName,
                    data,
                    tileCount: data.tiles.length
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('[BiomeManager] Error saving biome data:', error);
            return false;
        }
    }

    /**
     * Add tile to biome
     */
    async addTileToBiome(tile, biomeName) {
        try {
            const currentData = this.biomeState.get(biomeName);
            if (!currentData) {
                throw new Error(`Biome ${biomeName} not loaded`);
            }

            // Add tile to data
            const newTile = {
                ...tile,
                id: tile.id || `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                source: 'userAdded',
                addedAt: Date.now()
            };

            currentData.data.tiles.push(newTile);
            currentData.tileCount = currentData.data.tiles.length;

            // Save updated data
            await this.saveBiomeData(biomeName, currentData.data);

            // Re-render if this is the current biome
            if (this.currentBiome && this.currentBiome.name === biomeName) {
                await this.loadBiomeTiles(this.currentBiome);
            }

            return newTile;
        } catch (error) {
            console.error('[BiomeManager] Error adding tile to biome:', error);
            throw error;
        }
    }

    /**
     * Remove tile from biome
     */
    async removeTileFromBiome(tileId, biomeName) {
        try {
            const currentData = this.biomeState.get(biomeName);
            if (!currentData) {
                throw new Error(`Biome ${biomeName} not loaded`);
            }

            // Remove tile from data
            const tileIndex = currentData.data.tiles.findIndex(t => t.id === tileId);
            if (tileIndex === -1) {
                throw new Error(`Tile ${tileId} not found in biome ${biomeName}`);
            }

            const removedTile = currentData.data.tiles.splice(tileIndex, 1)[0];
            currentData.tileCount = currentData.data.tiles.length;

            // Save updated data
            await this.saveBiomeData(biomeName, currentData.data);

            // Re-render if this is the current biome
            if (this.currentBiome && this.currentBiome.name === biomeName) {
                await this.loadBiomeTiles(this.currentBiome);
            }

            return removedTile;
        } catch (error) {
            console.error('[BiomeManager] Error removing tile from biome:', error);
            throw error;
        }
    }

    /**
     * Update tile in biome
     */
    async updateTileInBiome(tileId, updates, biomeName) {
        try {
            const currentData = this.biomeState.get(biomeName);
            if (!currentData) {
                throw new Error(`Biome ${biomeName} not loaded`);
            }

            // Find and update tile
            const tileIndex = currentData.data.tiles.findIndex(t => t.id === tileId);
            if (tileIndex === -1) {
                throw new Error(`Tile ${tileId} not found in biome ${biomeName}`);
            }

            const updatedTile = {
                ...currentData.data.tiles[tileIndex],
                ...updates,
                lastModified: Date.now()
            };

            currentData.data.tiles[tileIndex] = updatedTile;

            // Save updated data
            await this.saveBiomeData(biomeName, currentData.data);

            // Re-render if this is the current biome
            if (this.currentBiome && this.currentBiome.name === biomeName) {
                await this.loadBiomeTiles(this.currentBiome);
            }

            return updatedTile;
        } catch (error) {
            console.error('[BiomeManager] Error updating tile in biome:', error);
            throw error;
        }
    }

    /**
     * Filter tiles by criteria
     */
    filterTiles(biomeName, filterCriteria) {
        const currentData = this.biomeState.get(biomeName);
        if (!currentData) {
            return [];
        }

        return currentData.data.tiles.filter(tile => {
            // Filter by building category
            if (filterCriteria.buildingCategory && filterCriteria.buildingCategory !== 'all') {
                if (tile.buildingCategory !== filterCriteria.buildingCategory) {
                    return false;
                }
            }

            // Filter by name (search)
            if (filterCriteria.search) {
                const searchTerm = filterCriteria.search.toLowerCase();
                if (!tile.name.toLowerCase().includes(searchTerm) &&
                    !tile.description.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }

            // Filter by source
            if (filterCriteria.source) {
                if (tile.source !== filterCriteria.source) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Sort tiles by criteria
     */
    sortTiles(tiles, sortCriteria) {
        return [...tiles].sort((a, b) => {
            switch (sortCriteria.field) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'movementCost':
                    return (a.movementCost || 1) - (b.movementCost || 1);
                case 'defenseBonus':
                    return (a.defenseBonus || 0) - (b.defenseBonus || 0);
                case 'addedAt':
                    return (a.addedAt || 0) - (b.addedAt || 0);
                default:
                    return 0;
            }
        });
    }

    /**
     * Get biome statistics
     */
    getBiomeStats(biomeName) {
        const currentData = this.biomeState.get(biomeName);
        if (!currentData) {
            return null;
        }

        const tiles = currentData.data.tiles;
        const stats = {
            totalTiles: tiles.length,
            sources: {},
            buildingCategories: {},
            averageMovementCost: 0,
            averageDefenseBonus: 0
        };

        let totalMovementCost = 0;
        let totalDefenseBonus = 0;

        tiles.forEach(tile => {
            // Count by source
            const source = tile.source || 'unknown';
            stats.sources[source] = (stats.sources[source] || 0) + 1;

            // Count by building category
            const category = tile.buildingCategory || 'none';
            stats.buildingCategories[category] = (stats.buildingCategories[category] || 0) + 1;

            // Sum for averages
            totalMovementCost += tile.movementCost || 1;
            totalDefenseBonus += tile.defenseBonus || 0;
        });

        stats.averageMovementCost = tiles.length > 0 ? totalMovementCost / tiles.length : 0;
        stats.averageDefenseBonus = tiles.length > 0 ? totalDefenseBonus / tiles.length : 0;

        return stats;
    }

    /**
     * Clear cache
     */
    clearCache(biomeName = null) {
        this.biomeLoader.clearCache(biomeName);
        this.tileRenderer.clearImageCache();
        
        if (biomeName) {
            this.biomeState.delete(biomeName);
        } else {
            this.biomeState.clear();
        }
    }

    /**
     * Show error state
     */
    showErrorState() {
        const container = document.getElementById('biomeTilesList');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <div class="error-title">Fehler beim Laden</div>
                    <div class="error-description">Die Tiles konnten nicht geladen werden</div>
                    <button onclick="window.tileEditor.biomeManager.loadBiomeTiles(window.tileEditor.currentBiome)" class="retry-btn">
                        🔄 Erneut versuchen
                    </button>
                </div>
            `;
        }
    }

    /**
     * Event handling
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    triggerEvent(eventName, data) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[BiomeManager] Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Get manager statistics
     */
    getStats() {
        return {
            loadedBiomes: this.biomeState.size,
            currentBiome: this.currentBiome?.name,
            biomeLoaderStats: this.biomeLoader.getCacheStats(),
            tileRendererStats: this.tileRenderer.getStats()
        };
    }
}

// Export for use in other modules
window.BiomeManager = BiomeManager;
