/**
 * CacheManager - Handles all cache operations for the tile editor
 * Separated from ModalManager for better debugging and maintainability
 */

class CacheManager {
    constructor() {
        this.biomeTilesCache = new Map();
        this.forceRefresh = false;
        this.debugMode = false;
        this.loadDebugMode();
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
            console.error('[CacheManager]', ...args);
        }
    }

    // Clear all cache sources for a specific biome
    clearAllCachesForBiome(biomeName) {
        // this.debug('=== CLEARING ALL CACHES FOR BIOME ===');
        // this.debug('Clearing all caches for biome:', biomeName);
        
        // 1. Clear ModalManager cache
        const keysToDelete = Array.from(this.biomeTilesCache.keys()).filter(key => key.includes(biomeName));
        // this.debug('Found keys to delete:', keysToDelete);
        
        keysToDelete.forEach(key => {
            this.biomeTilesCache.delete(key);
            // this.debug('Deleted cache key:', key);
        });
        
        const remainingKeys = Array.from(this.biomeTilesCache.keys());
        // this.debug('ModalManager cache cleared, remaining keys:', remainingKeys);
        
        // 2. Clear localStorage
        try {
            const storageKey = `biome_tiles_${biomeName.toLowerCase()}`;
            localStorage.removeItem(storageKey);
            // this.debug('localStorage cleared for key:', storageKey);
        } catch (error) {
            this.debugError('Error clearing localStorage:', error);
        }
        
        // 3. Clear global variables
        try {
            const globalKey = `${biomeName}TilesList`;
            if (window[globalKey]) {
                delete window[globalKey];
                // this.debug('Global variable cleared:', globalKey);
            } else {
                // this.debug('Global variable not found:', globalKey);
            }
        } catch (error) {
            this.debugError('Error clearing global variable:', error);
        }
        
        // 4. Clear tileEditor.tiles array for this biome
        if (window.tileEditor && window.tileEditor.tiles && Array.isArray(window.tileEditor.tiles)) {
            const originalLength = window.tileEditor.tiles.length;
            window.tileEditor.tiles = window.tileEditor.tiles.filter(t => t.categoryName !== biomeName);
            const removedCount = originalLength - window.tileEditor.tiles.length;
            // this.debug('Removed', removedCount, 'tiles from tileEditor.tiles array');
        } else {
            // this.debug('tileEditor.tiles not available or not an array');
        }
        
        // 5. Set force refresh flag
        this.forceRefresh = true;
        // this.debug('Force refresh flag set to true');
        
        // this.debug('=== ALL CACHES CLEARED ===');
    }

    // Check if cache exists and should be used
    shouldUseCache(cacheKey) {
        const hasCache = this.biomeTilesCache.has(cacheKey);
        const shouldSkipCache = this.forceRefresh;
        const shouldUseCache = hasCache && !shouldSkipCache;
        
        // this.debug('Cache check:', {
        //     cacheKey,
        //     hasCache,
        //     forceRefresh: this.forceRefresh,
        //     shouldSkipCache,
        //     shouldUseCache
        // });
        
        return shouldUseCache;
    }

    // Get cached data
    getCachedData(cacheKey) {
        if (this.biomeTilesCache.has(cacheKey)) {
            const data = this.biomeTilesCache.get(cacheKey);
            // this.debug('Retrieved cached data for key:', cacheKey, 'Data count:', data ? data.length : 'undefined');
            return data;
        }
        // this.debug('No cached data found for key:', cacheKey);
        return null;
    }

    // Set cached data
    setCachedData(cacheKey, data) {
        if (!data) {
            // this.debug('Warning: Attempting to cache null/undefined data for key:', cacheKey);
            return;
        }
        
        this.biomeTilesCache.set(cacheKey, data);
        // this.debug('Cached data for key:', cacheKey, 'Data count:', data.length);
        // this.debug('Total cache entries:', this.biomeTilesCache.size);
    }

    // Set force refresh flag
    setForceRefresh(value) {
        this.forceRefresh = value;
        // this.debug('Force refresh set to:', value);
    }

    // Reset force refresh flag
    resetForceRefresh() {
        if (this.forceRefresh) {
            this.forceRefresh = false;
            // this.debug('Force refresh reset to false');
        }
    }

    // Get cache size
    getCacheSize() {
        return this.biomeTilesCache.size;
    }

    // Get all cache keys
    getAllCacheKeys() {
        return Array.from(this.biomeTilesCache.keys());
    }

    // Clear entire cache
    clearAllCaches() {
        // this.debug('Clearing entire cache');
        this.biomeTilesCache.clear();
        this.forceRefresh = true;
        // this.debug('Entire cache cleared');
    }

    // Debug all cache sources
    debugAllCacheSources(biomeName) {
        // console.log('[CacheManager] === COMPREHENSIVE CACHE SOURCE DEBUG START ===');
        // console.log('[CacheManager] Debugging ALL cache sources for biome:', biomeName);
        
        // 1. Debug ModalManager cache
        // console.log('[CacheManager] 1. ModalManager Cache Analysis:');
        // console.log('[CacheManager] - biomeTilesCache size:', this.biomeTilesCache.size);
        // console.log('[CacheManager] - biomeTilesCache keys:', this.getAllCacheKeys());
        
        const allCacheKey = `${biomeName}_all`;
        const cachedTiles = this.biomeTilesCache.get(allCacheKey);
        // console.log('[CacheManager] - Cache entry for', allCacheKey, ':', cachedTiles ? 'EXISTS' : 'MISSING');
        if (cachedTiles && Array.isArray(cachedTiles)) {
            // console.log('[CacheManager] - Cached tiles count:', cachedTiles.length);
            // console.log('[CacheManager] - Cached tiles details:', cachedTiles.map(t => ({
            //     name: t.name,
            //     id: t.id,
            //     image: t.image,
            //     source: t.source
            // })));
        } else if (cachedTiles) {
            // console.log('[CacheManager] - Cached data is not an array:', typeof cachedTiles);
        }
        
        // console.log('[CacheManager] - Force refresh status:', this.forceRefresh);
        
        // 2. Debug localStorage
        // console.log('[CacheManager] 2. localStorage Analysis:');
        try {
            const storageKey = `biome_tiles_${biomeName.toLowerCase()}`;
            const storedTiles = localStorage.getItem(storageKey);
            // console.log('[CacheManager] - Storage key:', storageKey);
            // console.log('[CacheManager] - Raw data exists:', !!storedTiles);
            
            if (storedTiles) {
                const parsedTiles = JSON.parse(storedTiles);
                // console.log('[CacheManager] - Parsed tiles count:', parsedTiles.length);
                // console.log('[CacheManager] - Parsed tiles details:', parsedTiles.map(t => ({
                //     name: t.name,
                //     id: t.id,
                //     image: t.image,
                //     source: t.source
                // })));
            }
        } catch (error) {
            // console.log('[CacheManager] - localStorage error:', error);
        }
        
        // 3. Debug global variables
        // console.log('[CacheManager] 3. Global Variables Analysis:');
        try {
            const globalKey = `${biomeName}TilesList`;
            const globalTilesList = window[globalKey];
            // console.log('[CacheManager] - Global key:', globalKey);
            // console.log('[CacheManager] - Global variable exists:', !!globalTilesList);
            // console.log('[CacheManager] - Global variable type:', typeof globalTilesList);
            
            if (globalTilesList && Array.isArray(globalTilesList)) {
                // console.log('[CacheManager] - Global tiles count:', globalTilesList.length);
                // console.log('[CacheManager] - Global tiles details:', globalTilesList.map(t => ({
                //     name: t.name,
                //     id: t.id,
                //     image: t.image,
                //     source: t.source
                // })));
            }
        } catch (error) {
            // console.log('[CacheManager] - Global variables error:', error);
        }
        
        // 4. Debug tileEditor.tiles array
        // console.log('[CacheManager] 4. tileEditor.tiles Array Analysis:');
        if (window.tileEditor && window.tileEditor.tiles) {
            // console.log('[CacheManager] - tileEditor.tiles type:', typeof window.tileEditor.tiles);
            // console.log('[CacheManager] - tileEditor.tiles is array:', Array.isArray(window.tileEditor.tiles));
            // console.log('[CacheManager] - tileEditor.tiles total count:', window.tileEditor.tiles.length);
            
            const categoryTiles = window.tileEditor.tiles.filter(t => t.categoryName === biomeName);
            // console.log('[CacheManager] - tileEditor.tiles for biome count:', categoryTiles.length);
            // console.log('[CacheManager] - tileEditor.tiles for biome details:', categoryTiles.map(t => ({
            //     name: t.name,
            //     id: t.id,
            //     image: t.image,
            //     source: t.source
            // })));
        } else {
            // console.log('[CacheManager] - tileEditor.tiles NOT AVAILABLE');
        }
        
        // 5. Debug tilesList.js file
        // console.log('[CacheManager] 5. tilesList.js File Analysis:');
        fetch(`assets/biomes/${biomeName}/tiles/tilesList.js?t=${Date.now()}`)
            .then(response => {
                // console.log('[CacheManager] - tilesList.js response status:', response.status);
                return response.text();
            })
            .then(content => {
                // console.log('[CacheManager] - tilesList.js content length:', content.length);
                
                // Try to extract tiles from content
                try {
                    const patterns = [
                        /const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/,
                        /window\.\w+TilesList\s*=\s*(\[[\s\S]*?\]);/,
                        /window\.TILES_LIST\s*=\s*(\[[\s\S]*?\]);/
                    ];
                    
                    let tilesList = null;
                    let patternIndex = -1;
                    
                    for (let i = 0; i < patterns.length; i++) {
                        const match = content.match(patterns[i]);
                        if (match) {
                            tilesList = eval('(' + match[1] + ')');
                            patternIndex = i;
                            break;
                        }
                    }
                    
                    if (tilesList) {
                        // console.log('[CacheManager] - Pattern', patternIndex, 'matched');
                        // console.log('[CacheManager] - Extracted tiles count:', tilesList.length);
                        // console.log('[CacheManager] - Extracted tiles details:', tilesList.map(t => ({
                        //     name: t.name,
                        //     id: t.id,
                        //     image: t.image,
                        //     isDefault: t.isDefault
                        // })));
                    } else {
                        // console.log('[CacheManager] - No patterns matched');
                    }
                } catch (error) {
                    // console.log('[CacheManager] - Error extracting tiles:', error);
                }
            })
            .catch(error => {
                // console.log('[CacheManager] - Error loading tilesList.js:', error);
            });
        
        // 6. Debug server cache
        // console.log('[CacheManager] 6. Server Cache Analysis:');
        fetch(`/api/biome-cache/?biome=${encodeURIComponent(biomeName)}&t=${Date.now()}`)
            .then(response => {
                // console.log('[CacheManager] - Server cache response status:', response.status);
                return response.json();
            })
            .then(data => {
                // console.log('[CacheManager] - Server cache data:', data);
                if (data.success && data.data) {
                    // console.log('[CacheManager] - Server cache tiles count:', data.data.tiles ? data.data.tiles.length : 0);
                    // console.log('[CacheManager] - Server cache images count:', data.data.images ? data.data.images.length : 0);
                }
            })
            .catch(error => {
                // console.log('[CacheManager] - Server cache error:', error);
            });
        
        // 7. Debug DOM state
        // console.log('[CacheManager] 7. DOM State Analysis:');
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (biomeTilesList) {
            // console.log('[CacheManager] - biomeTilesList exists:', !!biomeTilesList);
            // console.log('[CacheManager] - biomeTilesList children count:', biomeTilesList.children.length);
            
            const tableBody = biomeTilesList.querySelector('tbody');
            if (tableBody) {
                // console.log('[CacheManager] - Table body exists:', !!tableBody);
                // console.log('[CacheManager] - Table rows count:', tableBody.children.length);
                // console.log('[CacheManager] - Table rows details:', Array.from(tableBody.children).map(row => ({
                //     tileId: row.dataset.tileId,
                //     className: row.className,
                //     isUnassigned: row.dataset.isUnassigned
                // })));
            } else {
                // console.log('[CacheManager] - No table body found');
            }
        } else {
            // console.log('[CacheManager] - biomeTilesList NOT FOUND');
        }
        
        // console.log('[CacheManager] === COMPREHENSIVE CACHE SOURCE DEBUG END ===');
    }
}

// Make globally available
window.CacheManager = CacheManager;
