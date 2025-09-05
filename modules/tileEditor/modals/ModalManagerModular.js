/**
 * ModalManager - Simplified version using separate modules
 * Now focuses only on modal operations and coordination
 */

class ModalManager {
    constructor(tileEditor) {
        this.tileEditor = tileEditor;
        this.cacheManager = new CacheManager();
        this.tileDataManager = new TileDataManager();
        this.uiManager = new UIManager();
        this.imageUploadManager = new ImageUploadManager();
        
        // console.log('[ModalManager] Initialized with modular architecture');
    }

    // Load biome tiles using modular approach
    async loadBiomeTiles(category, filter = 'all') {
        // console.log('[ModalManager] === LOAD BIOME TILES START ===');
        // console.log('[ModalManager] Loading tiles for category:', category.name, 'filter:', filter);
        
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            console.error('[ModalManager] biomeTilesList element not found');
            return;
        }
        
        // Check cache first
        const cacheKey = `${category.name}_${filter}`;
        // console.log('[ModalManager] Checking cache for key:', cacheKey);
        
        if (this.cacheManager.shouldUseCache(cacheKey)) {
            // console.log('[ModalManager] Using cached data');
            const cachedTiles = this.cacheManager.getCachedData(cacheKey);
            this.displayCachedTiles(cachedTiles, filter);
            return;
        }
        
        // Load tiles from all sources
        // console.log('[ModalManager] Loading tiles from all sources');
        const fileTiles = await this.tileDataManager.loadTilesFromFile(category.name);
        const storageTiles = this.tileDataManager.loadTilesFromStorage(category.name);
        const globalTiles = this.tileDataManager.loadTilesFromGlobal(category.name);
        
        // Combine tiles
        const allTiles = this.tileDataManager.combineTilesFromSources(fileTiles, storageTiles, globalTiles, category.name);
        
        // Filter deleted tiles
        const filteredTiles = this.tileDataManager.filterDeletedTiles(allTiles);
        
        // Apply additional filter if specified
        let finalTiles = filteredTiles;
        if (filter && filter !== 'all') {
            finalTiles = filteredTiles.filter(tile => tile.buildingCategory === filter);
            // console.log('[ModalManager] Applied filter:', filter, 'Final tiles:', finalTiles.length);
        }
        
        // Update data sources
        this.tileDataManager.updateTileEditorTiles(category.name, allTiles);
        this.tileDataManager.saveTilesToStorage(category.name, allTiles);
        this.tileDataManager.saveTilesToGlobal(category.name, allTiles);
        
        // Cache the results
        this.cacheManager.setCachedData(cacheKey, allTiles);
        
        // Display tiles
        // Call TileEditor.js to display tiles
        if (this.tileEditor && this.tileEditor.displayTilesInCurrentViewMode) {
            this.tileEditor.displayTilesInCurrentViewMode();
        }
        
        // Reset force refresh flag
        this.cacheManager.resetForceRefresh();
        
        // console.log('[ModalManager] === LOAD BIOME TILES END ===');
    }

    // REMOVED: Duplicate displayTiles function - now handled by TileEditor.js displayTilesAsTable/Cards

    // Display cached tiles
    displayCachedTiles(cachedTiles, filter = 'all') {
        // console.log('[ModalManager] Displaying cached tiles:', cachedTiles.length);
        
        // Apply filter if specified
        let filteredTiles = cachedTiles;
        if (filter && filter !== 'all') {
            filteredTiles = cachedTiles.filter(tile => tile.buildingCategory === filter);
            // console.log('[ModalManager] Applied filter:', filter, 'Filtered tiles count:', filteredTiles.length);
        }
        
        // Call TileEditor.js to display tiles
        if (this.tileEditor && this.tileEditor.displayTilesInCurrentViewMode) {
            this.tileEditor.displayTilesInCurrentViewMode();
        }
    }

    // Add image to biome using image upload manager
    async addImageToBiome(imageFile, category) {
        // console.log('[ModalManager] Adding image to biome using ImageUploadManager');
        await this.imageUploadManager.addImageToBiome(imageFile, category);
    }

    // Add tile to table directly using UI manager
    addTileToTableDirectly(tileData, category) {
        // console.log('[ModalManager] Adding tile to table using UIManager');
        this.uiManager.addTileToTableDirectly(tileData, category);
    }

    // Open biome modal
    async openBiomeModal(categoryId) {
        // console.log('[ModalManager] Opening biome modal for category ID:', categoryId);
        
        const category = this.tileEditor.categories.find(c => c.id === categoryId);
        if (!category) {
            console.error('[ModalManager] Category not found for ID:', categoryId);
            return;
        }
        
        await this.loadBiomeIntoModal(category);
        this.showBiomeModal();
    }

    // Load biome into modal
    async loadBiomeIntoModal(category) {
        // console.log('[ModalManager] Loading biome into modal:', category.name);
        await this.loadBiomeTiles(category);
        
        // Ensure tiles are displayed after loading
        if (this.tileEditor && this.tileEditor.ensureTilesDisplayed) {
            this.tileEditor.ensureTilesDisplayed();
        }
    }

    // Show biome modal
    showBiomeModal() {
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.style.display = 'block';
            // console.log('[ModalManager] Biome modal displayed');
        }
    }

    // Close biome modal
    closeBiomeModal() {
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.style.display = 'none';
            // console.log('[ModalManager] Biome modal closed');
        }
    }

    // Refresh biome tiles
    async refreshBiomeTiles(categoryOrId, filter = 'all') {
        // console.log('[ModalManager] Refreshing biome tiles');
        
        let category;
        if (typeof categoryOrId === 'number') {
            category = this.tileEditor.categories.find(c => c.id === categoryOrId);
        } else {
            category = categoryOrId;
        }
        
        if (!category) {
            console.error('[ModalManager] Category not found');
            return;
        }
        
        // Clear caches and reload
        this.cacheManager.clearAllCachesForBiome(category.name);
        await this.loadBiomeTiles(category, filter);
    }

    // Debug all cache sources
    debugAllCacheSources(biomeName) {
        // console.log('[ModalManager] Debugging all cache sources using CacheManager');
        this.cacheManager.debugAllCacheSources(biomeName);
    }

    // Get cache manager for external access
    getCacheManager() {
        return this.cacheManager;
    }

    // Get tile data manager for external access
    getTileDataManager() {
        return this.tileDataManager;
    }

    // Get UI manager for external access
    getUIManager() {
        return this.uiManager;
    }

    // Get image upload manager for external access
    getImageUploadManager() {
        return this.imageUploadManager;
    }
}

// Make globally available
window.ModalManager = ModalManager;
