/**
 * TileDataManager - Handles tile data loading and processing
 * Separated from ModalManager for better debugging and maintainability
 */

class TileDataManager {
    constructor() {
        this.deletedTiles = new Set();
        this.debugMode = false;
        this.imageCache = new Map(); // Cache for image data
        this.lastRefreshTime = 0; // Track when data was last refreshed
        this.loadDebugMode();
        this.loadDeletedTilesFromStorage();
    }

    // Debug utility functions
    loadDebugMode() {
        this.debugMode = localStorage.getItem('tileEditorDebugMode') === 'true';
    }

    debug(...args) {
        // Debug messages disabled
    }

    debugError(...args) {
        if (this.debugMode) {
            console.error('[TileDataManager]', ...args);
        }
    }

    // Force refresh of building images by clearing cache and reloading data
    async forceRefreshBuildingImages() {
        console.log('[TileDataManager] Force refreshing building images...');
        
        // Clear image cache
        this.imageCache.clear();
        
        // Clear browser cache for building images
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                for (const cacheName of cacheNames) {
                    if (cacheName.includes('building') || cacheName.includes('tile')) {
                        await caches.delete(cacheName);
                        console.log('[TileDataManager] Cleared cache:', cacheName);
                    }
                }
            } catch (error) {
                console.warn('[TileDataManager] Could not clear caches:', error);
            }
        }
        
        // Force reload of building data
        this.lastRefreshTime = Date.now();
        
        // Trigger UI refresh
        this.notifyImageRefresh();
        
        console.log('[TileDataManager] Building images refresh completed');
    }

    // Notify other components that images have been refreshed
    notifyImageRefresh() {
        // Dispatch custom event for image refresh
        const event = new CustomEvent('buildingImagesRefreshed', {
            detail: { timestamp: this.lastRefreshTime }
        });
        document.dispatchEvent(event);
        
        // Also notify global objects
        if (window.tileEditor) {
            window.tileEditor.onBuildingImagesRefreshed && window.tileEditor.onBuildingImagesRefreshed();
        }
        
        console.log('[TileDataManager] Notified components of image refresh');
    }

    // Load tiles from tilesList.js file with forced refresh capability
    async loadTilesFromFile(biomeName) {
        console.log(`[TileDataManager] Loading tiles for ${biomeName}`);
        
        // Check if we need to force refresh for Buildings
        const needsRefresh = biomeName === 'Buildings' && 
                           (Date.now() - this.lastRefreshTime > 5000); // Refresh if older than 5 seconds
        
        if (needsRefresh) {
            console.log('[TileDataManager] Forcing refresh for Buildings biome');
            await this.forceRefreshBuildingImages();
        }
        
        try {
            // Try to load from biome config with cache busting
            const biomeData = await this.loadBiomeData(biomeName, needsRefresh);
            if (biomeData && biomeData.tiles && biomeData.tiles.length > 0) {
                return biomeData.tiles;
            }
            
            // Try to load from localStorage
            const storageTiles = this.loadTilesFromStorage(biomeName);
            if (storageTiles.length > 0) {
                return storageTiles;
            }
            
            // Try to load from global variables
            const globalTiles = this.loadTilesFromGlobal(biomeName);
            if (globalTiles.length > 0) {
                return globalTiles;
            }
            
            console.log(`[TileDataManager] No tiles found for ${biomeName}, returning empty array`);
            return [];
        } catch (error) {
            console.error(`[TileDataManager] Error loading tiles for ${biomeName}:`, error);
            return [];
        }
    }
    
    // Load biome data from individual biome files with enhanced cache busting
    async loadBiomeData(biomeName, forceRefresh = false) {
        try {
            const timestamp = forceRefresh ? Date.now() : this.lastRefreshTime || Date.now();
            
            // First try to load tiles from tilesList.js with aggressive cache busting
            const tilesListResponse = await fetch(`/assets/biomes/${biomeName}/tiles/tilesList.js?t=${timestamp}&refresh=${forceRefresh ? '1' : '0'}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Force-Refresh': forceRefresh ? '1' : '0'
                }
            });
            
            if (tilesListResponse.ok) {
                const tilesListContent = await tilesListResponse.text();
                
                // Extract tiles list
                const tilesMatch = tilesListContent.match(/const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/);
                if (tilesMatch) {
                    const tiles = eval('(' + tilesMatch[1] + ')');
                    console.log(`[TileDataManager] Loaded ${tiles.length} tiles from tilesList.js for ${biomeName}`);
                    
                    // Update image paths with cache busting for Buildings
                    if (biomeName === 'Buildings') {
                        tiles.forEach(tile => {
                            if (tile.image) {
                                tile.image = this.addCacheBustingToImagePath(tile.image);
                            }
                        });
                    }
                    
                    return { tiles: tiles };
                }
            }
            
            // Fallback: Try to load from biome config
            const biomeResponse = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?t=${timestamp}&refresh=${forceRefresh ? '1' : '0'}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Force-Refresh': forceRefresh ? '1' : '0'
                }
            });
            
            if (biomeResponse.ok) {
                const jsContent = await biomeResponse.text();
                
                // Extract window.BIOME_DATA
                const dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*?});/);
                if (dataMatch) {
                    const biomeData = eval('(' + dataMatch[1] + ')');
                    console.log(`[TileDataManager] Loaded ${biomeName} data:`, biomeData);
                    
                    // Update image paths with cache busting for Buildings
                    if (biomeName === 'Buildings' && biomeData.tiles) {
                        biomeData.tiles.forEach(tile => {
                            if (tile.image) {
                                tile.image = this.addCacheBustingToImagePath(tile.image);
                            }
                        });
                    }
                    
                    return biomeData;
                }
            }
            
            console.warn(`[TileDataManager] Could not load tiles for ${biomeName}`);
            return null;
        } catch (error) {
            console.error(`[TileDataManager] Error loading ${biomeName} data:`, error);
            return null;
        }
    }

    // Add cache busting to image paths for Buildings
    addCacheBustingToImagePath(imagePath) {
        if (!imagePath || !imagePath.includes('Buildings')) {
            return imagePath;
        }
        
        const timestamp = Date.now();
        const separator = imagePath.includes('?') ? '&' : '?';
        return `${imagePath}${separator}_cb=${timestamp}`;
    }

    // Load tiles from localStorage
    loadTilesFromStorage(biomeName) {
        // Skip localStorage to avoid mock tiles
        return [];
    }

    // Load tiles from global variables
    loadTilesFromGlobal(biomeName) {
        // Skip global variables to avoid mock tiles
        return [];
    }

    // Combine tiles from multiple sources, removing duplicates
    combineTilesFromSources(fileTiles, storageTiles, globalTiles, biomeName) {
        // Start with file tiles
        const allTiles = [...fileTiles];
        
        // Add localStorage tiles
        storageTiles.forEach(tile => {
            const existingTile = allTiles.find(t => t.name === tile.name || t.image === tile.image);
            if (!existingTile) {
                allTiles.push({
                    ...tile,
                    source: 'localStorage'
                });
            }
        });
        
        // Add global variable tiles
        globalTiles.forEach(tile => {
            const existingTile = allTiles.find(t => t.name === tile.name || t.image === tile.image);
            if (!existingTile) {
                allTiles.push({
                    ...tile,
                    source: 'globalVariable'
                });
            }
        });
        
        return allTiles;
    }

    // Save tiles to localStorage
    saveTilesToStorage(biomeName, tiles) {
        // this.debug('Saving tiles to localStorage for biome:', biomeName);
        
        try {
            localStorage.setItem(`biome_tiles_${biomeName.toLowerCase()}`, JSON.stringify(tiles));
            // this.debug('Successfully saved', tiles.length, 'tiles to localStorage');
        } catch (error) {
            this.debugError('Error saving tiles to localStorage:', error);
        }
    }

    // Save tiles to global variable
    saveTilesToGlobal(biomeName, tiles) {
        // this.debug('Saving tiles to global variable for biome:', biomeName);
        
        try {
            window[`${biomeName}TilesList`] = tiles;
            // this.debug('Successfully saved', tiles.length, 'tiles to global variable');
        } catch (error) {
            this.debugError('Error saving tiles to global variable:', error);
        }
    }

    // Update tileEditor.tiles array
    updateTileEditorTiles(biomeName, tiles) {
        // this.debug('Updating tileEditor.tiles array for biome:', biomeName);
        
        if (window.tileEditor && window.tileEditor.tiles) {
            const existingTiles = window.tileEditor.tiles.filter(t => t.categoryName !== biomeName);
            window.tileEditor.tiles = [...existingTiles, ...tiles];
            // this.debug('Successfully updated tileEditor.tiles array with', tiles.length, 'tiles');
        } else {
            // this.debug('tileEditor.tiles not available');
        }
    }

    // Load deleted tiles from storage
    loadDeletedTilesFromStorage() {
        try {
            const deletedTilesData = localStorage.getItem('deletedTiles');
            if (deletedTilesData) {
                const deletedTilesArray = JSON.parse(deletedTilesData);
                this.deletedTiles = new Set(deletedTilesArray);
            }
        } catch (error) {
            // Silent error handling
        }
    }

    // Check if tile is deleted
    isTileDeleted(tileImage) {
        return this.deletedTiles.has(tileImage);
    }

    // Add tile to deleted list
    markTileAsDeleted(tileImage) {
        this.deletedTiles.add(tileImage);
        this.saveDeletedTilesToStorage();
    }

    // Save deleted tiles to storage
    saveDeletedTilesToStorage() {
        try {
            localStorage.setItem('deletedTiles', JSON.stringify(Array.from(this.deletedTiles)));
        } catch (error) {
            // Silent error handling
        }
    }

    // Filter out deleted tiles
    filterDeletedTiles(tiles) {
        const filteredTiles = tiles.filter(tile => !this.isTileDeleted(tile.image));
        return filteredTiles;
    }
}

// Make globally available
window.TileDataManager = TileDataManager;
