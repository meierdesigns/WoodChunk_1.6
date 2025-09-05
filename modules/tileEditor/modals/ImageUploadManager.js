/**
 * ImageUploadManager - Handles image upload and processing
 * Separated from ModalManager for better debugging and maintainability
 */

class ImageUploadManager {
    constructor() {
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
            console.error('[ImageUploadManager]', ...args);
        }
    }

    // Add image to biome with comprehensive debugging
    async addImageToBiome(imageFile, category) {
        // console.log('[ImageUploadManager] === ADD IMAGE TO BIOME DEBUG START ===');
        // console.log('[ImageUploadManager] Adding image to biome:', imageFile.name, 'for category:', category.name);
        
        try {
            // Step 1: Check if tile already exists
            // console.log('[ImageUploadManager] Step 1: Checking for existing tiles');
            const existingTiles = await this.loadExistingTiles(category.name);
            const existingTile = existingTiles?.find(t => t.name === imageFile.name.replace('.png', '') || t.image === `assets/biomes/${category.name}/tiles/${imageFile.name}`);
            
            if (existingTile) {
                // console.log('[ImageUploadManager] Tile already exists:', existingTile);
                this.showToast(`Tile "${imageFile.name.replace('.png', '')}" existiert bereits`, 'warning');
                return;
            }
            
            // Step 2: Create tile data
            // console.log('[ImageUploadManager] Step 2: Creating tile data');
            const tileData = this.createTileData(imageFile, category);
            // console.log('[ImageUploadManager] Created tile data:', tileData);
            
            // Step 3: Save image to server
            // console.log('[ImageUploadManager] Step 3: Saving image to server');
            const uploadSuccess = await this.saveImageToServer(imageFile, category);
            if (!uploadSuccess) {
                console.error('[ImageUploadManager] Failed to save image to server');
                this.showToast(`Fehler beim Speichern des Bildes`, 'error');
                return;
            }
            
            // Step 4: Add tile to data sources
            // console.log('[ImageUploadManager] Step 4: Adding tile to data sources');
            await this.addTileToDataSources(tileData, category);
            
            // Step 5: Clear caches and force refresh
            // console.log('[ImageUploadManager] Step 5: Clearing caches and forcing refresh');
            await this.clearCachesAndRefresh(category);
            
            // Step 6: Synchronize across all systems
            // console.log('[ImageUploadManager] Step 6: Synchronizing across all systems');
            await this.synchronizeAcrossSystems(category.name);
            
            // Step 7: Update UI
            // console.log('[ImageUploadManager] Step 7: Updating UI');
            await this.updateUI(tileData, category);
            
            // console.log('[ImageUploadManager] === ADD IMAGE TO BIOME DEBUG END ===');
            this.showToast(`Bild "${imageFile.name}" erfolgreich hinzugefügt`, 'success');
            
        } catch (error) {
            console.error('[ImageUploadManager] Error adding image to biome:', error);
            this.showToast(`Fehler beim Hinzufügen des Bildes: ${error.message}`, 'error');
        }
    }

    // Load existing tiles for duplicate checking
    async loadExistingTiles(biomeName) {
        // console.log('[ImageUploadManager] Loading existing tiles for duplicate check');
        
        try {
            // Try to load from multiple sources
            const tileDataManager = new TileDataManager();
            const fileTiles = await tileDataManager.loadTilesFromFile(biomeName);
            const storageTiles = tileDataManager.loadTilesFromStorage(biomeName);
            const globalTiles = tileDataManager.loadTilesFromGlobal(biomeName);
            
            // Combine all tiles
            const allTiles = tileDataManager.combineTilesFromSources(fileTiles, storageTiles, globalTiles, biomeName);
            
            // console.log('[ImageUploadManager] Loaded existing tiles:', allTiles.length);
            return allTiles;
        } catch (error) {
            // console.log('[ImageUploadManager] Error loading existing tiles:', error);
            return [];
        }
    }

    // Create tile data from image file
    createTileData(imageFile, category) {
        // console.log('[ImageUploadManager] Creating tile data for:', imageFile.name);
        
        const fileName = imageFile.name.replace('.png', '');
        const imagePath = `assets/biomes/${category.name}/tiles/${imageFile.name}`;
        
        const tileData = {
            name: fileName,
            image: imagePath,
            movementCost: 1,
            defenseBonus: 0,
            resources: '',
            description: `Uploaded Tile: ${fileName}`,
            isUnassigned: true,
            categoryName: category.name,
            buildingCategory: '',
            isDefault: false,
            source: 'uploaded',
            tempId: Date.now() // Use timestamp as temporary ID
        };
        
        // console.log('[ImageUploadManager] Created tile data:', tileData);
        return tileData;
    }

    // Save image to server
    async saveImageToServer(imageFile, category) {
        // console.log('[ImageUploadManager] Saving image to server:', imageFile.name);
        
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('biome', category.name);
            
            const response = await fetch('/api/upload-tile', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                // console.log('[ImageUploadManager] Image saved successfully:', result);
                return true;
            } else {
                console.error('[ImageUploadManager] Failed to save image:', response.status);
                return false;
            }
        } catch (error) {
            console.error('[ImageUploadManager] Error saving image:', error);
            return false;
        }
    }

    // Add tile to all data sources
    async addTileToDataSources(tileData, category) {
        // console.log('[ImageUploadManager] Adding tile to data sources');
        
        try {
            // Add to tileEditor.tiles array
            if (window.tileEditor && window.tileEditor.tiles) {
                window.tileEditor.tiles.push(tileData);
                // console.log('[ImageUploadManager] Added to tileEditor.tiles array');
            }
            
            // Add to localStorage
            const tileDataManager = new TileDataManager();
            const existingTiles = tileDataManager.loadTilesFromStorage(category.name);
            existingTiles.push(tileData);
            tileDataManager.saveTilesToStorage(category.name, existingTiles);
            // console.log('[ImageUploadManager] Added to localStorage');
            
            // Add to global variable
            const globalTiles = tileDataManager.loadTilesFromGlobal(category.name);
            globalTiles.push(tileData);
            tileDataManager.saveTilesToGlobal(category.name, globalTiles);
            // console.log('[ImageUploadManager] Added to global variable');
            
        } catch (error) {
            console.error('[ImageUploadManager] Error adding tile to data sources:', error);
        }
    }

    // Clear caches and force refresh
    async clearCachesAndRefresh(category) {
        // console.log('[ImageUploadManager] Clearing caches and forcing refresh');
        
        try {
            // Clear all caches
            if (window.clearAllCachesForBiome) {
                window.clearAllCachesForBiome(category.name);
            }
            
            // Set force refresh flag
            if (window.tileEditor && window.tileEditor.modalManager) {
                window.tileEditor.modalManager.forceRefresh = true;
                // console.log('[ImageUploadManager] Set force refresh flag');
            }
            
            // Update server cache
            await this.updateServerCache(category.name);
            
        } catch (error) {
            console.error('[ImageUploadManager] Error clearing caches:', error);
        }
    }

    // Update server cache
    async updateServerCache(biomeName) {
        // console.log('[ImageUploadManager] Updating server cache for biome:', biomeName);
        
        try {
            const response = await fetch('/api/update-biome-cache', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    biomeName: biomeName,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                // console.log('[ImageUploadManager] Server cache updated:', result);
            } else {
                // console.log('[ImageUploadManager] Server cache update failed:', response.status);
            }
        } catch (error) {
            // console.log('[ImageUploadManager] Could not update server cache:', error);
        }
    }

    // Synchronize across all systems
    async synchronizeAcrossSystems(biomeName) {
        // console.log('[ImageUploadManager] Synchronizing across all systems');
        
        try {
            if (window.synchronizeTilesForBiome) {
                await window.synchronizeTilesForBiome(biomeName);
                // console.log('[ImageUploadManager] Synchronization completed');
            }
            
            // Debug all cache sources after synchronization
            if (window.debugAllCacheSources) {
                window.debugAllCacheSources(biomeName);
            }
            
        } catch (error) {
            console.error('[ImageUploadManager] Error synchronizing systems:', error);
        }
    }

    // Update UI
    async updateUI(tileData, category) {
        // console.log('[ImageUploadManager] Updating UI');
        
        try {
            // Add tile directly to table if in table view
            if (window.tileEditor && window.tileEditor.modalManager) {
                window.tileEditor.modalManager.addTileToTableDirectly(tileData, category);
            }
            
            // Clear map renderer cache
            if (window.clearMapRendererCache) {
                window.clearMapRendererCache();
                // console.log('[ImageUploadManager] Cleared HexMapEditor cache');
            }
            
        } catch (error) {
            console.error('[ImageUploadManager] Error updating UI:', error);
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // console.log('[ImageUploadManager] Toast:', message, 'Type:', type);
        
        // Implementation would depend on your toast system
        // For now, just log to console
        const timestamp = new Date().toLocaleTimeString();
        // console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }
}

// Make globally available
window.ImageUploadManager = ImageUploadManager;
