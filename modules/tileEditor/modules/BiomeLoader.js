/**
 * BiomeLoader Module - Handles biome data loading and caching
 */
class BiomeLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Load biome data from multiple sources
     */
    async loadBiomeData(biomeName) {
        const cacheKey = `biome_${biomeName}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Prevent duplicate loading
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        const loadingPromise = this._loadBiomeDataFromSources(biomeName);
        this.loadingPromises.set(cacheKey, loadingPromise);

        try {
            const data = await loadingPromise;
            this.cache.set(cacheKey, data);
            return data;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Load biome data from all available sources
     */
    async _loadBiomeDataFromSources(biomeName) {
        const sources = [
            this._loadFromTilesList(biomeName),
            this._loadFromBiomeFile(biomeName),
            this._loadFromLocalStorage(biomeName),
            this._loadFromGlobalVariable(biomeName)
        ];

        const results = await Promise.allSettled(sources);
        
        // Combine results, prioritizing tilesList > biomeFile > localStorage > global
        const combinedData = {
            tiles: [],
            settings: {},
            metadata: {
                sources: [],
                loadTime: Date.now()
            }
        };

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const sourceName = ['tilesList', 'biomeFile', 'localStorage', 'global'][index];
                combinedData.metadata.sources.push(sourceName);
                
                if (result.value.tiles) {
                    combinedData.tiles.push(...result.value.tiles);
                }
                if (result.value.settings) {
                    combinedData.settings = { ...combinedData.settings, ...result.value.settings };
                }
            }
        });

        return combinedData;
    }

    /**
     * Load tiles from tilesList.js file
     */
    async _loadFromTilesList(biomeName) {
        try {
            const response = await fetch(`/assets/biomes/${biomeName}/tiles/tilesList.js?v=${Date.now()}`);
            if (!response.ok) return null;

            const content = await response.text();
            const tilesMatch = content.match(/window\.TILES_LIST\s*=\s*(\[.*?\]);/s);
            
            if (tilesMatch) {
                const tiles = eval(tilesMatch[1]);
                return { tiles: tiles.map(tile => ({ ...tile, source: 'tilesList' })) };
            }
        } catch (error) {
            console.debug(`[BiomeLoader] Could not load tilesList for ${biomeName}:`, error);
        }
        return null;
    }

    /**
     * Load data from biomeName.js file
     */
    async _loadFromBiomeFile(biomeName) {
        try {
            const response = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?v=${Date.now()}`);
            if (!response.ok) return null;

            const content = await response.text();
            const dataMatch = content.match(/window\.BIOME_DATA\s*=\s*({.*?});/s);
            
            if (dataMatch) {
                const biomeData = eval(dataMatch[1]);
                return {
                    tiles: biomeData.tiles?.map(tile => ({ ...tile, source: 'biomeFile' })) || [],
                    settings: biomeData.settings || {}
                };
            }
        } catch (error) {
            console.debug(`[BiomeLoader] Could not load biome file for ${biomeName}:`, error);
        }
        return null;
    }

    /**
     * Load data from localStorage
     */
    async _loadFromLocalStorage(biomeName) {
        try {
            const stored = localStorage.getItem(`biome_data_${biomeName.toLowerCase()}`);
            if (stored) {
                const data = JSON.parse(stored);
                return {
                    tiles: data.tiles?.map(tile => ({ ...tile, source: 'localStorage' })) || [],
                    settings: data.settings || {}
                };
            }
        } catch (error) {
            console.debug(`[BiomeLoader] Could not load localStorage data for ${biomeName}:`, error);
        }
        return null;
    }

    /**
     * Load data from global variables
     */
    async _loadFromGlobalVariable(biomeName) {
        try {
            const globalData = window[`${biomeName}BiomeData`];
            if (globalData) {
                return {
                    tiles: globalData.tiles?.map(tile => ({ ...tile, source: 'global' })) || [],
                    settings: globalData.settings || {}
                };
            }
        } catch (error) {
            console.debug(`[BiomeLoader] Could not load global data for ${biomeName}:`, error);
        }
        return null;
    }

    /**
     * Save biome data to localStorage
     */
    async saveBiomeData(biomeName, data) {
        try {
            const saveData = {
                tiles: data.tiles || [],
                settings: data.settings || {},
                lastModified: Date.now()
            };
            
            localStorage.setItem(`biome_data_${biomeName.toLowerCase()}`, JSON.stringify(saveData));
            
            // Update cache
            this.cache.set(`biome_${biomeName}`, data);
            
            return true;
        } catch (error) {
            console.error(`[BiomeLoader] Error saving biome data for ${biomeName}:`, error);
            return false;
        }
    }

    /**
     * Clear cache for specific biome or all
     */
    clearCache(biomeName = null) {
        if (biomeName) {
            this.cache.delete(`biome_${biomeName}`);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            loading: this.loadingPromises.size
        };
    }
}

// Export for use in other modules
window.BiomeLoader = BiomeLoader;
