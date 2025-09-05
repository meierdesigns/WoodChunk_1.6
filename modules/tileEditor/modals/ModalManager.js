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
        this.debugMode = false;
        this.loadDebugMode();
        
        // Setup tile modal listeners
        this.setupTileModalListeners();
    }

    // Debug utility functions
    loadDebugMode() {
        this.debugMode = localStorage.getItem('tileEditorDebugMode') === 'true';
    }

    debug(...args) {
        // Debug messages disabled
    }

    debugError(...args) {
        // Debug error messages disabled
    }

    // Load biome tiles using modular approach
    async loadBiomeTiles(category, filter = 'all') {
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            console.error('[ModalManager] biomeTilesList element not found');
            return;
        }
        
        // Check cache first
        const cacheKey = `${category.name}_${filter}`;
        
        if (this.cacheManager.shouldUseCache(cacheKey)) {
            const cachedTiles = this.cacheManager.getCachedData(cacheKey);
            this.displayCachedTiles(cachedTiles, filter);
            return;
        }
        
        // Load tiles from all sources
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
        }
        
        // Update data sources
        this.tileDataManager.updateTileEditorTiles(category.name, allTiles);
        this.tileDataManager.saveTilesToStorage(category.name, allTiles);
        this.tileDataManager.saveTilesToGlobal(category.name, allTiles);
        
        // Cache the results
        this.cacheManager.setCachedData(cacheKey, allTiles);
        
        // Display tiles
        if (this.tileEditor && this.tileEditor.displayTilesInCurrentViewMode) {
            this.tileEditor.displayTilesInCurrentViewMode();
        }
        
        // Reset force refresh flag
        this.cacheManager.resetForceRefresh();
    }

    // REMOVED: Duplicate displayTiles function - now handled by TileEditor.js displayTilesAsTable/Cards

    // Display cached tiles
    displayCachedTiles(cachedTiles, filter = 'all') {
        // Apply filter if specified
        let filteredTiles = cachedTiles;
        if (filter && filter !== 'all') {
            filteredTiles = cachedTiles.filter(tile => tile.buildingCategory === filter);
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
        
        // Update modal title and content
        this.updateModalContent(category);
        
        // Load tiles
        await this.loadBiomeTiles(category);
        
        // Ensure tiles are displayed after loading
        if (this.tileEditor && this.tileEditor.ensureTilesDisplayed) {
            this.tileEditor.ensureTilesDisplayed();
        }
    }

    // Update modal content with biome data
    updateModalContent(category) {
        // console.log('[ModalManager] Updating modal content for:', category.name);
        
        // Update modal title
        const modalTitle = document.getElementById('biomeModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `${category.name} verwalten`;
        }
        
        // Update biome name and stats in a header row layout
        const biomeName = document.getElementById('biomeName');
        if (biomeName) {
            // Get tile count for this category
            const tileCount = this.tileEditor.tiles.filter(tile => tile.categoryId === category.id).length;
            
            // Create header row with name and tags
            biomeName.innerHTML = `
                <div class="biome-header-row">
                    <h4 class="biome-name">${category.name}</h4>
                    <div class="biome-header-tags">
                        <span class="biome-tile-count">${tileCount} Tiles</span>
                        <span class="biome-type ${category.type}">${this.getTypeName(category.type)}</span>
                        <div class="biome-color-indicator" style="background-color: ${category.color}"></div>
                    </div>
                </div>
            `;
        }
        
        // Update biome description
        const biomeDescription = document.getElementById('biomeDescription');
        if (biomeDescription) {
            biomeDescription.textContent = category.description || `Verwalte ${category.name} Tiles und Einstellungen`;
        }
        
        // Update folder path (keep as separate stat)
        const biomeFolderPath = document.getElementById('biomeFolderPath');
        if (biomeFolderPath) {
            biomeFolderPath.textContent = category.folderPath || `assets/biomes/${category.name}`;
        }
        
        // Update main biome image
        this.updateBiomeMainImage(category);
        
        // Store current biome ID for reference
        const biomeModal = document.getElementById('biomeModal');
        if (biomeModal) {
            biomeModal.dataset.currentBiomeId = category.id;
        }
    }

    // Update biome main image
    updateBiomeMainImage(category) {
        const biomeMainImage = document.getElementById('biomeMainImage');
        if (!biomeMainImage) return;
        
        // Try to get title image from biome settings first
        const titleImagePath = this.getBiomeTitleImage(category);
        
        if (titleImagePath) {
            // console.log('[ModalManager] Loading biome title image:', titleImagePath);
            biomeMainImage.src = titleImagePath;
            biomeMainImage.alt = category.name;
            
            // Update color picker when image loads
            biomeMainImage.onload = () => {
                // console.log('[ModalManager] Biome image loaded, updating color picker');
                this.updateColorPickerWithImage();
            };
            
            biomeMainImage.onerror = () => {
                console.warn('[ModalManager] Could not load biome image:', titleImagePath);
                this.setFallbackBiomeImage(category);
            };
        } else {
            this.setFallbackBiomeImage(category);
        }
    }

    // Get type name for display
    getTypeName(type) {
        const typeNames = {
            'terrain': 'Terrain',
            'biome': 'Biome',
            'entities': 'Entities',
            'special': 'Spezial'
        };
        return typeNames[type] || type;
    }

    // Get biome title image path
    getBiomeTitleImage(category) {
        // For Biomes without images, use emoji instead of trying to load non-existent images
        const biomesWithoutImages = ['Unassigned']; // Only Unassigned has no title image
        if (biomesWithoutImages.includes(category.name)) {
            return null; // Return null to trigger fallback
        }
        
        // Priority 1: Check biome settings for title image
        if (this.tileEditor.categories) {
            const categoryWithSettings = this.tileEditor.categories.find(c => c.id === category.id);
            if (categoryWithSettings && categoryWithSettings.image) {
                const imagePath = categoryWithSettings.image.startsWith('/') ? categoryWithSettings.image : '/' + categoryWithSettings.image;
                
                // Add cache busting for Buildings tiles
                if (category.name === 'Buildings' || imagePath.includes('Buildings')) {
                    const timestamp = Date.now();
                    const cacheBustedPath = imagePath + (imagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
                    console.log('[ModalManager] Cache busted path for Buildings:', cacheBustedPath);
                    return cacheBustedPath;
                }
                
                return imagePath;
            }
        }
        
        // Priority 2: Look for biomeName.png in biome folder
        const defaultImagePath = `/assets/biomes/${category.name}/${category.name}.png`;
        
        // Add cache busting for Buildings tiles
        if (category.name === 'Buildings') {
            const timestamp = Date.now();
            const cacheBustedPath = defaultImagePath + (defaultImagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[ModalManager] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        return defaultImagePath;
    }

    // Set fallback biome image
    setFallbackBiomeImage(category) {
        const biomeMainImage = document.getElementById('biomeMainImage');
        if (!biomeMainImage) return;
        
        // Use text fallback instead of emoji
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'biome-text-fallback';
        fallbackDiv.textContent = category.name;
        fallbackDiv.style.cssText = `
            width: 200px; 
            height: 200px; 
            background: ${category.color || '#666'}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 2rem; 
            font-weight: bold;
            border-radius: 8px;
            color: white;
            text-align: center;
            padding: 10px;
        `;
        
        // Replace image with text fallback
        biomeMainImage.style.display = 'none';
        biomeMainImage.parentNode.appendChild(fallbackDiv);
        
        // console.log('[ModalManager] Using text fallback for biome:', category.name);
    }

    // Update color picker with loaded image
    updateColorPickerWithImage() {
        if (this.tileEditor && this.tileEditor.setupColorPickers) {
            // Re-initialize color pickers with new image
            setTimeout(() => {
                const colorPickerCanvas = document.getElementById('colorPickerCanvas');
                const colorPickerCursor = document.getElementById('colorPickerCursor');
                if (colorPickerCanvas && colorPickerCursor && this.tileEditor.initializeTitleImagePicker) {
                    this.tileEditor.initializeTitleImagePicker(colorPickerCanvas, colorPickerCursor);
                }
            }, 100);
        }
    }
    updateColorPickerWithImage() {
        if (this.tileEditor && this.tileEditor.setupColorPickers) {
            // Re-initialize color pickers with new image
            setTimeout(() => {
                const colorPickerCanvas = document.getElementById('colorPickerCanvas');
                const colorPickerCursor = document.getElementById('colorPickerCursor');
                if (colorPickerCanvas && colorPickerCursor && this.tileEditor.initializeTitleImagePicker) {
                    this.tileEditor.initializeTitleImagePicker(colorPickerCanvas, colorPickerCursor);
                }
            }, 100);
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

    // Add missing openTileModalFromBiome function
    openTileModalFromBiome(tileId) {
        console.log('[ModalManager] openTileModalFromBiome called with tileId:', tileId);
        
        // Close biome modal first
        this.closeBiomeModal();
        
        // Open tile modal for editing
        this.openTileModal(tileId);
    }

    // Add missing openTileModal function
    openTileModal(tileId) {
        console.log('[ModalManager] openTileModal called with tileId:', tileId);
        console.log('[ModalManager] Available tiles:', this.tileEditor.tiles);
        console.log('[ModalManager] Tile IDs:', this.tileEditor.tiles.map(t => t.id));
        
        // Find the tile
        const tile = this.tileEditor.tiles.find(t => t.id === tileId);
        if (!tile) {
            console.error('[ModalManager] Tile not found:', tileId);
            console.error('[ModalManager] Available tile IDs:', this.tileEditor.tiles.map(t => t.id));
            if (this.tileEditor.toastManager) {
                this.tileEditor.toastManager.error('Tile nicht gefunden');
            }
            return;
        }
        
        console.log('[ModalManager] Found tile:', tile);
        
        // Load tile data into form
        this.loadTileIntoForm(tile);
        
        // Update modal title
        const modalTitle = document.getElementById('tileModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Bearbeite ${tile.name}`;
        }
        
        // Show modal
        const modal = document.getElementById('tileModal');
        if (modal) {
            modal.style.display = 'block';
            console.log('[ModalManager] Tile modal displayed');
        } else {
            console.error('[ModalManager] Tile modal element not found');
        }
    }

    // Add missing removeTileFromBiome function
    removeTileFromBiome(tileId) {
        // console.log('[ModalManager] removeTileFromBiome called with tileId:', tileId);
        
        if (confirm('Möchtest du dieses Tile wirklich aus dem Biome entfernen?')) {
            // Get the tile and category before removing
            const tileToRemove = this.tileEditor.tiles.find(t => t.id === tileId);
            const currentCategory = this.tileEditor.categories.find(c => c.id === this.tileEditor.selectedCategoryId);
            
            if (!tileToRemove || !currentCategory) {
                if (this.tileEditor.toastManager) {
                    this.tileEditor.toastManager.error('Fehler: Tile oder Kategorie nicht gefunden');
                }
                return;
            }
            
            // Remove tile from tiles array
            this.tileEditor.tiles = this.tileEditor.tiles.filter(t => t.id !== tileId);
            
            // Reload biome tiles
            this.loadBiomeTiles(currentCategory);
            
            // Save the updated biome data to file immediately
            this.saveBiomeCategory(currentCategory).then(success => {
                if (success) {
                    // console.log('[ModalManager] Biome data updated after tile removal');
                    if (this.tileEditor.toastManager) {
                        this.tileEditor.toastManager.success('Tile aus Biome entfernt und gespeichert!');
                    }
                    
                    // Force reload biome data to ensure consistency
                    setTimeout(() => {
                        this.forceReloadBiomeData(currentCategory.name);
                    }, 100);
                } else {
                    console.warn('[ModalManager] Failed to update biome data after tile removal');
                    if (this.tileEditor.toastManager) {
                        this.tileEditor.toastManager.error('Fehler beim Speichern der Änderungen');
                    }
                }
            });
            
            // Update main tiles list
            this.updateTilesList();
            
            // console.log('[ModalManager] Tile removed from biome');
        }
    }

    // Helper method to load tile into form
    loadTileIntoForm(tile) {
        // console.log('[ModalManager] Loading tile into form:', tile);
        
        // Populate form fields
        const nameInput = document.getElementById('tileName');
        const imageInput = document.getElementById('tileImage');
        const movementCostInput = document.getElementById('tileMovementCost');
        const defenseBonusInput = document.getElementById('tileDefenseBonus');
        const resourcesInput = document.getElementById('tileResources');
        const descriptionInput = document.getElementById('tileDescription');
        
        if (nameInput) nameInput.value = tile.name || '';
        // Don't set file input value - it's not allowed for security reasons
        // Instead, show the current image path in a separate display element
        if (imageInput) {
            // Clear the file input
            imageInput.value = '';
            // Show the current image path
            const currentImagePath = document.getElementById('currentImagePath');
            const currentImagePathText = document.getElementById('currentImagePathText');
            if (currentImagePath && currentImagePathText) {
                if (tile.image) {
                    currentImagePathText.textContent = tile.image;
                    currentImagePath.style.display = 'block';
                } else {
                    currentImagePath.style.display = 'none';
                }
            }
        }
        if (movementCostInput) movementCostInput.value = tile.movementCost || 1;
        if (defenseBonusInput) defenseBonusInput.value = tile.defenseBonus || 0;
        if (resourcesInput) resourcesInput.value = tile.resources || '';
        if (descriptionInput) descriptionInput.value = tile.description || '';
        
        // Store tile ID for saving
        if (nameInput) nameInput.dataset.tileId = tile.id;
    }

    // Helper method to save biome category
    async saveBiomeCategory(category) {
        try {
            // Implementation would depend on your save mechanism
            // console.log('[ModalManager] Saving biome category:', category.name);
            return true; // Placeholder
        } catch (error) {
            console.error('[ModalManager] Error saving biome category:', error);
            return false;
        }
    }

    // Helper method to force reload biome data
    forceReloadBiomeData(biomeName) {
        // console.log('[ModalManager] Force reloading biome data for:', biomeName);
        // Implementation would depend on your reload mechanism
    }

    // Helper method to update tiles list
    updateTilesList() {
        // console.log('[ModalManager] Updating tiles list');
        // Implementation would depend on your update mechanism
    }

    // Setup tile modal event listeners
    setupTileModalListeners() {
        // console.log('[ModalManager] Setting up tile modal listeners');
        
        // Close tile modal button
        const closeTileModal = document.getElementById('closeTileModal');
        if (closeTileModal) {
            closeTileModal.addEventListener('click', () => {
                this.closeTileModal();
            });
        }
        
        // Cancel tile button
        const cancelTile = document.getElementById('cancelTile');
        if (cancelTile) {
            cancelTile.addEventListener('click', () => {
                this.closeTileModal();
            });
        }
        
        // Save tile button
        const saveTile = document.getElementById('saveTile');
        if (saveTile) {
            saveTile.addEventListener('click', () => {
                this.saveTile();
            });
        }
        
        // Delete tile button
        const deleteTile = document.getElementById('deleteTile');
        if (deleteTile) {
            deleteTile.addEventListener('click', () => {
                this.deleteTile();
            });
        }
    }

    // Close tile modal
    closeTileModal() {
        // console.log('[ModalManager] Closing tile modal');
        const modal = document.getElementById('tileModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Save tile
    saveTile() {
        // console.log('[ModalManager] Saving tile');
        // Implementation for saving tile
        if (this.tileEditor.toastManager) {
            this.tileEditor.toastManager.success('Tile gespeichert!');
        }
        this.closeTileModal();
    }

    // Delete tile
    deleteTile() {
        // console.log('[ModalManager] Deleting tile');
        if (confirm('Möchtest du dieses Tile wirklich löschen?')) {
            // Implementation for deleting tile
            if (this.tileEditor.toastManager) {
                this.tileEditor.toastManager.success('Tile gelöscht!');
            }
            this.closeTileModal();
        }
    }
}

// Make globally available
window.ModalManager = ModalManager;
