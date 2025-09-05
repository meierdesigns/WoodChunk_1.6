/**
 * Biome Configuration - Defines structure and loads data from individual biome files
 * This file serves as a template structure and loads actual data from [BiomeName].js files
 */

// Basic biome structure template - actual data loaded from individual files
const BIOME_STRUCTURE = {
    // Unassigned Tiles - All tiles that haven't been categorized yet
    unassigned: {
        id: 'unassigned',
        name: 'Unzugewiesen',
        type: 'special',
        color: '#9E9E9E',
        description: 'Alle Tile-Grafiken, die noch keiner Kategorie zugeordnet wurden',
        tiles: []
    }
};

/**
 * Load biome data from individual files
 * @param {string} biomeName - The biome name to load
 * @returns {Promise<Object>} The loaded biome data
 */
async function loadBiomeData(biomeName) {
    try {
        const timestamp = Date.now();
        const response = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?t=${timestamp}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (response.ok) {
            const jsContent = await response.text();
            
            // Extract window.BIOME_DATA
            const dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*?});/);
            if (dataMatch) {
                const biomeData = eval('(' + dataMatch[1] + ')');
                console.log(`[biomeConfig] Loaded ${biomeName} data:`, biomeData);
                return biomeData;
            }
        }
        
        console.warn(`[biomeConfig] Could not load ${biomeName}.js, using fallback`);
        return null;
    } catch (error) {
        console.error(`[biomeConfig] Error loading ${biomeName} data:`, error);
        return null;
    }
}

/**
 * Get all biomes with loaded data
 * @returns {Promise<Object>} All biome configurations with loaded data
 */
async function getAllBiomes() {
    const biomeNames = ['Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 'Jungle', 'Badlands', 'Snow', 'Ocean'];
    const loadedBiomes = {};
    
    for (const biomeName of biomeNames) {
        const biomeData = await loadBiomeData(biomeName);
        if (biomeData) {
            loadedBiomes[biomeName.toLowerCase()] = biomeData;
        } else {
            // Use fallback structure with default color
            const fallbackColor = '#9E9E9E';
            loadedBiomes[biomeName.toLowerCase()] = {
                id: biomeName.toLowerCase(),
                name: biomeName,
                type: 'biome',
                color: fallbackColor,
                description: `Biome: ${biomeName}`,
                tiles: []
            };
        }
    }
    
    return loadedBiomes;
}

/**
 * Get a specific biome by ID with loaded data
 * @param {string} biomeId - The biome ID
 * @returns {Promise<Object|null>} The biome configuration with loaded data or null if not found
 */
async function getBiomeById(biomeId) {
    const biomeName = biomeId.charAt(0).toUpperCase() + biomeId.slice(1);
    const biomeData = await loadBiomeData(biomeName);
    
    if (biomeData) {
        return biomeData;
    }
    
    // Fallback to structure
    return BIOME_STRUCTURE[biomeId] || null;
}

/**
 * Get all tiles from a specific biome
 * @param {string} biomeId - The biome ID
 * @returns {Promise<Array>} Array of tiles in the biome
 */
async function getTilesByBiome(biomeId) {
    const biome = await getBiomeById(biomeId);
    return biome ? biome.tiles : [];
}

/**
 * Get a specific tile by ID
 * @param {string} tileId - The tile ID
 * @returns {Promise<Object|null>} The tile configuration or null if not found
 */
async function getTileById(tileId) {
    const biomeNames = ['Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 'Jungle', 'Badlands', 'Snow', 'Ocean'];
    
    for (const biomeName of biomeNames) {
        const biomeData = await loadBiomeData(biomeName);
        if (biomeData && biomeData.tiles) {
            const tile = biomeData.tiles.find(t => t.id === tileId);
            if (tile) return tile;
        }
    }
    
    return null;
}

/**
 * Get all tiles from all biomes
 * @returns {Promise<Array>} Array of all tiles
 */
async function getAllTiles() {
    const biomeNames = ['Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 'Jungle', 'Badlands', 'Snow', 'Ocean'];
    const allTiles = [];
    
    for (const biomeName of biomeNames) {
        const biomeData = await loadBiomeData(biomeName);
        if (biomeData && biomeData.tiles) {
            allTiles.push(...biomeData.tiles);
        }
    }
    
    return allTiles;
}

/**
 * Search tiles by name or description
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching tiles
 */
async function searchTiles(searchTerm) {
    const allTiles = await getAllTiles();
    const term = searchTerm.toLowerCase();
    
    return allTiles.filter(tile => 
        tile.name.toLowerCase().includes(term) ||
        tile.description.toLowerCase().includes(term) ||
        (tile.resources && tile.resources.some(resource => resource.toLowerCase().includes(term)))
    );
}

/**
 * Get tiles by rarity
 * @param {string} rarity - The rarity level (common, uncommon, rare)
 * @returns {Promise<Array>} Array of tiles with the specified rarity
 */
async function getTilesByRarity(rarity) {
    const allTiles = await getAllTiles();
    return allTiles.filter(tile => tile.rarity === rarity);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BIOME_STRUCTURE,
        loadBiomeData,
        getAllBiomes,
        getBiomeById,
        getTilesByBiome,
        getTileById,
        getAllTiles,
        searchTiles,
        getTilesByRarity
    };
} else {
    // Browser environment
    window.BIOME_STRUCTURE = BIOME_STRUCTURE;
    window.loadBiomeData = loadBiomeData;
    window.getAllBiomes = getAllBiomes;
    window.getBiomeById = getBiomeById;
    window.getTilesByBiome = getTilesByBiome;
    window.getTileById = getTileById;
    window.getAllTiles = getAllTiles;
    window.searchTiles = searchTiles;
    window.getTilesByRarity = getTilesByRarity;
}
