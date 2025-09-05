/**
 * TileEditor Core Module - Main class and initialization
 */
class TileEditor {
    constructor() {
        this.categories = [];
        this.tiles = [];
        this.selectedCategoryId = null;
        this.selectedTileId = null;
        this.isInitialized = false;
        
        // Initialize managers
        this.modalManager = null;
        this.uiManager = null;
        
        // Add global styles for view modes
        this.addGlobalStyles();
    }
    
    addGlobalStyles() {
        // Check if styles already exist
        if (document.getElementById('tile-editor-view-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'tile-editor-view-styles';
        styleElement.textContent = `
            /* TILE TABLE STYLES - DIRECT AND SPECIFIC */
            .tiles-table-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
                display: block;
                box-sizing: border-box;
            }
            
            .tiles-table {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
                display: block;
            }
            
            .tiles-table-content {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 13px;
                margin: 0;
                padding: 0;
                table-layout: auto;
                display: table;
            }
            
            .tiles-table-content th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 6px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                border: none;
                white-space: nowrap;
                display: table-cell;
            }
            
            .tiles-table-content td {
                padding: 10px 6px;
                border-bottom: 1px solid #e9ecef;
                vertical-align: middle;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: table-cell;
            }
            
            .tile-row:hover {
                background-color: #f8f9fa;
                transition: background-color 0.2s ease;
            }
            
            .tile-row:nth-child(even) {
                background-color: #fafbfc;
            }
            
            .tile-image-cell {
                width: 60px;
                text-align: center;
                padding: 8px 4px;
            }
            
            .tile-name-cell {
                font-weight: 600;
                color: #333;
                width: 120px;
            }
            
            .tile-movement-cell {
                color: #4CAF50;
                font-weight: 500;
                width: 80px;
                text-align: center;
            }
            
            .tile-defense-cell {
                color: #2196F3;
                font-weight: 500;
                width: 80px;
                text-align: center;
            }
            
            .tile-type-cell {
                color: #FF9800;
                font-weight: 500;
                width: 100px;
            }
            
            .tile-description-cell {
                color: #757575;
                font-size: 12px;
                width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .tile-actions-cell {
                text-align: center;
                width: 80px;
                padding: 8px 4px;
            }
            
            .tile-thumbnail {
                max-width: 60px;
                max-height: 60px;
                border-radius: 6px;
                object-fit: cover;
                border: 2px solid #e9ecef;
            }
            
            
            .edit-tile-btn,
            .delete-tile-btn {
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
                min-width: 40px;
                display: inline-block;
            }
            
            .edit-tile-btn {
                background: #007bff;
                color: white;
            }
            
            .edit-tile-btn:hover {
                background: #0056b3;
                transform: translateY(-1px);
            }
            
            .delete-tile-btn {
                background: #dc3545;
                color: white;
            }
            
            .delete-tile-btn:hover {
                background: #c82333;
                transform: translateY(-1px);
            }
            
            /* CARDS VIEW STYLES */
            .tiles-cards {
                width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
            }
            
            .tiles-cards .tiles-table-content thead {
                display: none;
            }
            
            .tiles-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
                padding: 16px 0;
                margin: 0;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            .tile-card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
                transition: all 0.3s ease;
                border: 1px solid #e9ecef;
                margin: 0;
                cursor: pointer;
            }
            
            .tile-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                background: #f8f9fa;
            }
            
            .tile-image-container {
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            
            .tile-image-container img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .tile-card:hover .tile-image-container img {
                transform: scale(1.05);
            }
            
            
            .tile-details {
                padding: 12px;
                text-align: center;
            }
            
            .tile-name {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }
            
            /* RESPONSIVE CONTAINER STYLES */
            #biomeTilesList {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            /* Consolidated into main CSS file */
            
            .biome-tiles-list {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            /* RESPONSIVE MODAL STYLES */
            .modal-large {
                width: 100vw;
                max-width: 100vw;
                height: 100vh;
                max-height: 100vh;
                margin: 0;
                padding: 0;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 0;
                box-sizing: border-box;
            }
            
            .biome-modal-content {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                padding: 16px;
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    async initialize() {
        try {
            // Load global styles immediately
            this.addGlobalStyles();
            
            // Wait for the module container to be available
            const moduleContainer = document.getElementById('tileEditorContainer');
            if (!moduleContainer) {
                // console.('[TileEditor] Module container not found');
                return;
            }

            // Initialize managers first
            this.modalManager = new ModalManager(this);
            
            // Create UIManager directly with displayCategories method
            this.uiManager = {
                displayCategories: async (categories) => {
                    // // // console.log('[TileEditor] displayCategories called with:', categories);
                    
                    const categoriesList = document.getElementById('categoriesList');
                    if (!categoriesList) {
                        // console.('[TileEditor] Categories list element not found');
                        return;
                    }
                    
                    // // // console.log('[TileEditor] Categories list element found, clearing...');
                    categoriesList.innerHTML = '';
                    categoriesList.className = 'categories-list';
                    
                    if (!categories || categories.length === 0) {
                        // // // console.log('[TileEditor] No categories to display');
                        categoriesList.innerHTML = '<div class="no-categories">Keine Biome gefunden</div>';
                        return;
                    }
                    
                    // Display all categories
                    for (const category of categories) {
                        const categoryElement = document.createElement('div');
                        categoryElement.className = 'category-item';
                        categoryElement.dataset.categoryId = category.id;
                        categoryElement.dataset.categoryName = category.name;
                        
                        // Get tile count for this category
                        const tileCount = this.tiles.filter(tile => tile.categoryId === category.id).length;
                        
                                                 // Use title image for category preview
                         let tileImage = this.getBiomeTitleImagePath(category);
                         
                         // If no title image, use first tile as fallback
                         if (!tileImage) {
                             const firstTile = this.tiles.find(tile => tile.categoryId === category.id);
                             if (firstTile && firstTile.image) {
                                 tileImage = this.fixImagePath(firstTile.image);
                             }
                         }
                         
                         // // // console.log('[TileEditor] Final tileImage for', category.name, ':', tileImage);
                         
                         categoryElement.innerHTML = `
                             <div class="category-content">
                                 <div class="category-preview">
                                     ${tileImage ? 
                                         `<img src="${tileImage}" alt="${category.name}" class="category-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; // // console.log('Image failed to load:', this.src);" onload="// // console.log('Image loaded successfully:', this.src);" />` : 
                                         ''
                                     }
                                     <div class="category-placeholder" style="display: ${tileImage ? 'none' : 'block'}; font-size: 48px; text-align: center; background: ${category.color}; color: white; padding: 20px; border-radius: 8px;">${category.name.charAt(0)}</div>
                                 </div>
                                <div class="category-info-text">
                                    <div class="category-header-row">
                                        <h4 class="category-name">${category.name}</h4>
                                        <div class="category-header-tags">
                                            <span class="tile-count">${tileCount} Tiles</span>
                                            <span class="type ${category.type}">${this.getTypeName(category.type)}</span>
                                            <div class="color-indicator" style="background-color: ${category.color}"></div>
                                        </div>
                                    </div>
                                    <p class="category-description">${category.description || 'Keine Beschreibung verfügbar'}</p>
                                </div>
                            </div>
                            
                                                         <!-- Tiles within the category card -->
                             <div class="category-tiles">
                                 <div class="tiles-grid" id="category-tiles-grid-${category.id}">
                                     <!-- Cards werden durch displayTilesAsCards() generiert -->
                                 </div>
                             </div>
                            

                        `;
                        
                        // Make entire card clickable
                        categoryElement.style.cursor = 'pointer';
                        categoryElement.addEventListener('click', () => {
                            window.tileEditor.openBiomeModal(category.id);
                        });
                        
                        // Load tiles directly into the category card
                        this.loadTilesIntoCategoryCard(categoryElement, category);
                        
                        categoriesList.appendChild(categoryElement);
                    }
                    
                    // // console.log('[TileEditor] Categories displayed successfully');
                }
            };
            
            // // console.log('[TileEditor] UIManager created successfully');

            // Clear outdated cache entries first
            this.clearOutdatedCache();
            
            // Load tile assets FIRST
            await this.loadTileAssets();
            
            // Initialize categories and tiles AFTER loading
            this.initializeCategories();
            this.initializeTiles();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Restore saved view mode
            this.restoreViewMode();
            
            this.isInitialized = true;
        } catch (error) {
            // console.('[TileEditor] Failed to initialize:', error);
        }
    }

    async loadTileAssets() {
        try {
            // Load categories from biome folders
            this.categories = await this.loadCategoriesFromBiomeFolders();
            
            // Load tiles from biome folders
            this.tiles = await this.loadTilesFromBiomeFolders();
            
        } catch (error) {
            // console.('[TileEditor] Failed to load tiles:', error);
        }
    }

    async loadCategoriesFromBiomeFolders() {
        // Load categories from biome folders
        return await this.createCategoriesFromBiomeConfig();
    }

    async loadTilesFromBiomeFolders() {
        const tiles = [];
        let id = 1;
        
        console.log('[TileEditor] Starting to load tiles from biome folders');
        console.log('[TileEditor] Categories available:', this.categories);
        
        // Durchlaufe alle Biome-Kategorien
        for (const category of this.categories) {
            try {
                console.log(`[TileEditor] Loading tiles for category: ${category.name} (ID: ${category.id})`);
                
                // Versuche Tiles aus dem Biome-Ordner zu laden
                const biomeTiles = await this.loadTilesFromBiomeFolder(category);
                
                console.log(`[TileEditor] Found ${biomeTiles.length} tiles for ${category.name}`);
                
                                 // Füge die gefundenen Tiles hinzu
                 biomeTiles.forEach(tile => {
                     const newTile = {
                         id: id++,
                         name: tile.name,
                         categoryId: category.id, // Verwende die korrekte Kategorie-ID
                         categoryName: category.name,
                         image: tile.image,
                         movementCost: tile.movementCost || 1,
                         defenseBonus: tile.defenseBonus || 0,
                         resources: tile.resources || '',
                         description: tile.description || `Tile aus ${category.name}`,
                         isDefault: tile.isDefault || false
                     };
                     tiles.push(newTile);
                     console.log(`[TileEditor] Added tile: ${newTile.name} with categoryId: ${newTile.categoryId} for category: ${category.name} (ID: ${category.id})`);
                 });
                
            } catch (error) {
                console.error(`[TileEditor] Could not load tiles for ${category.name}:`, error);
            }
        }
        
        console.log('[TileEditor] Total tiles loaded:', tiles.length);
        console.log('[TileEditor] Tiles by categoryId:', tiles.reduce((acc, tile) => {
            acc[tile.categoryId] = (acc[tile.categoryId] || 0) + 1;
            return acc;
        }, {}));
        
        // Store tiles in instance variable and make them immutable
        this.tiles = Object.freeze([...tiles]);
        
        console.log('[TileEditor] Stored tiles in this.tiles:', this.tiles);
        console.log('[TileEditor] Sample tile from this.tiles:', this.tiles[0]);
        
        return tiles;
    }

    async loadTilesFromBiomeFolder(category) {
        const tiles = [];
        
        try {
            // First try to load from tiles list in tiles folder
            const tilesList = await this.loadTilesList(category.name);
            if (tilesList && tilesList.length > 0) {
                return tilesList.map(tile => ({
                    name: tile.name,
                    image: this.fixImagePath(tile.image),
                    movementCost: tile.movementCost || 1,
                    defenseBonus: tile.defenseBonus || 0,
                    resources: tile.resources || '',
                    description: tile.description || `Tile aus ${category.name}`,
                    isDefault: tile.isDefault || false
                    // categoryId wird von der aufrufenden Funktion gesetzt
                }));
            }
        } catch (error) {
            // console.log(`[TileEditor] Could not load tiles list for ${category.name}:`, error);
        }
        
        // Fallback: Try to load from biomeName.js (new format)
        try {
            const biomeData = await this.loadBiomeSettings(category.name);
            if (biomeData && biomeData.tiles) {
                return biomeData.tiles.map(tile => ({
                    name: tile.name,
                    image: this.fixImagePath(tile.image),
                    movementCost: tile.movementCost || 1,
                    defenseBonus: tile.defenseBonus || 0,
                    resources: tile.resources || '',
                    description: tile.description || `Tile aus ${category.name}`,
                    isDefault: tile.isDefault || false
                    // categoryId wird von der aufrufenden Funktion gesetzt
                }));
            }
        } catch (error) {
            // console.log(`[TileEditor] Could not load biome data for ${category.name}:`, error);
        }
        
        // Final fallback: Return empty array instead of mock tiles
        return [];
    }

         async loadTilesList(biomeName) {
         try {
             const timestamp = Date.now();
             
             // Try to load tiles from tilesList.js
             const tilesListResponse = await fetch(`/assets/biomes/${biomeName}/tiles/tilesList.js?t=${timestamp}`, {
                 headers: {
                     'Cache-Control': 'no-cache, no-store, must-revalidate',
                     'Pragma': 'no-cache',
                     'Expires': '0'
                 }
             });
             
             if (tilesListResponse.ok) {
                 const tilesListContent = await tilesListResponse.text();
                 
                 // Extract tiles list
                 const tilesMatch = tilesListContent.match(/const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/);
                 if (tilesMatch) {
                     const tiles = eval('(' + tilesMatch[1] + ')');
                     
                     // Fix image paths for all tiles and ensure correct categoryId
                     const fixedTiles = tiles.map(tile => ({
                         ...tile,
                         image: this.fixImagePath(tile.image)
                         // categoryId wird von der aufrufenden Funktion gesetzt
                     }));
                     
                     console.log(`[TileEditor] Loaded ${fixedTiles.length} tiles from tilesList.js for ${biomeName}`);
                     return fixedTiles;
                 }
             }
             
             console.log(`[TileEditor] No tilesList.js found for ${biomeName}`);
             return null;
         } catch (error) {
             console.error(`[TileEditor] Error loading tilesList.js for ${biomeName}:`, error);
             return null;
         }
          }
     
         // Helper method to fix image paths
    fixImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Remove any incorrect prefixes
        if (imagePath.includes('/modules/tileEditor/')) {
            imagePath = imagePath.replace('/modules/tileEditor/', '/');
        }
        
        // Ensure proper path format
        if (!imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
        }
        
        // Add cache busting to prevent caching issues
        if (!imagePath.includes('?')) {
            imagePath += '?v=' + Date.now();
        }
        
        return imagePath;
    }

    // Helper method to ensure tiles are displayed after modal loading
    ensureTilesDisplayed() {
        setTimeout(() => {
            if (this.updateAnyOpenModalView) {
                const currentViewMode = localStorage.getItem('tileEditorViewMode') || 'table';
                this.updateAnyOpenModalView(currentViewMode);
            }
        }, 100);
    }

    // Helper method to display tiles in current view mode
    displayTilesInCurrentViewMode() {
        if (this.updateAnyOpenModalView) {
            const currentViewMode = localStorage.getItem('tileEditorViewMode') || 'table';
            this.updateAnyOpenModalView(currentViewMode);
        }
    }
 
     // Load biome data from individual biome files
    async loadBiomeData(biomeName) {
        try {
            const timestamp = Date.now();
            
            // First try to load tiles from tilesList.js
            const tilesListResponse = await fetch(`/assets/biomes/${biomeName}/tiles/tilesList.js?t=${timestamp}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (tilesListResponse.ok) {
                const tilesListContent = await tilesListResponse.text();
                
                                 // Extract tiles list
                 const tilesMatch = tilesListContent.match(/const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/);
                 if (tilesMatch) {
                     const tiles = eval('(' + tilesMatch[1] + ')');
                     
                     // Fix image paths for all tiles and ensure correct categoryId
                     const fixedTiles = tiles.map(tile => ({
                         ...tile,
                         image: this.fixImagePath(tile.image)
                         // categoryId wird von der aufrufenden Funktion gesetzt
                     }));
                     
                     console.log(`[TileEditor] Loaded ${tiles.length} tiles from tilesList.js for ${biomeName}`);
                     return { tiles: fixedTiles };
                 }
            }
            
            // Fallback: Try to load from biome config
            const biomeResponse = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?t=${timestamp}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (biomeResponse.ok) {
                const jsContent = await biomeResponse.text();
                
                // Extract window.BIOME_DATA
                const dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*?});/);
                if (dataMatch) {
                    const biomeData = eval('(' + dataMatch[1] + ')');
                    console.log(`[TileEditor] Loaded ${biomeName} data:`, biomeData);
                    return biomeData;
                }
            }
            
            console.warn(`[TileEditor] Could not load tiles for ${biomeName}`);
            return null;
        } catch (error) {
            console.error(`[TileEditor] Error loading ${biomeName} data:`, error);
            return null;
        }
    }

    async loadBiomeSettings(biomeName) {
        try {
            // // console.log(`[TileEditor] Loading biome settings for ${biomeName}`);
            
            // Check cache first
            const cacheKey = `biomeSettings_${biomeName}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const biomeSettings = JSON.parse(cachedData);
                    // // console.log(`[TileEditor] Loaded from cache for ${biomeName}:`, biomeSettings);
                    return biomeSettings;
                } catch (e) {
                    // console.(`[TileEditor] Invalid cached data for ${biomeName}, loading from server`);
                }
            }
            
            // Add cache-busting parameter to force fresh load
            const timestamp = Date.now();
            const url = `/assets/biomes/${biomeName}/${biomeName}.js?t=${timestamp}`;
            // // console.log(`[TileEditor] Fetching from URL: ${url}`);
            
            // Try to load from biomeName.js first
            let response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            // // console.log(`[TileEditor] Response status for ${biomeName}:`, response.status);
            
            if (!response.ok) {
                // If biomeName.js doesn't exist, try biomeData.js
                // // console.log(`[TileEditor] ${biomeName}.js not found, trying biomeData.js`);
                const biomeDataUrl = `/assets/biomes/${biomeName}/biomeData.js?t=${timestamp}`;
                // // console.log(`[TileEditor] Fetching from URL: ${biomeDataUrl}`);
                response = await fetch(biomeDataUrl, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                // // console.log(`[TileEditor] BiomeData response status for ${biomeName}:`, response.status);
            }
            
            if (response.ok) {
                const jsContent = await response.text();
                // // console.log(`[TileEditor] Loaded JS content for ${biomeName}:`, jsContent.substring(0, 200) + '...');
                
                // Try different patterns to extract the data
                let biomeSettings = null;
                
                // Pattern 1: window.BIOME_DATA (standard format)
                let dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*?});/);
                if (dataMatch) {
                    // // console.log(`[TileEditor] Pattern 1 matched for ${biomeName}`);
                    biomeSettings = eval('(' + dataMatch[1] + ')');
                    // // console.log(`[TileEditor] Extracted biome settings from Pattern 1:`, biomeSettings);
                }
                
                // Pattern 2: biomeNameBiomeData (alternative format)
                if (!biomeSettings) {
                    const pattern = new RegExp(`const\\s+${biomeName.toLowerCase()}BiomeData\\s*=\\s*({[\\s\\S]*?});`);
                    dataMatch = jsContent.match(pattern);
                    if (dataMatch) {
                        // // console.log(`[TileEditor] Pattern 2 matched for ${biomeName}`);
                        biomeSettings = eval('(' + dataMatch[1] + ')');
                        // // console.log(`[TileEditor] Extracted biome settings from Pattern 2:`, biomeSettings);
                    }
                }
                
                // Pattern 3: window.biomeNameBiomeData (alternative new format)
                if (!biomeSettings) {
                    const pattern = new RegExp(`window\\.${biomeName.toLowerCase()}BiomeData\\s*=\\s*({[\\s\\S]*?});`);
                    dataMatch = jsContent.match(pattern);
                    if (dataMatch) {
                        // // console.log(`[TileEditor] Pattern 3 matched for ${biomeName}`);
                        biomeSettings = eval('(' + dataMatch[1] + ')');
                        // // console.log(`[TileEditor] Extracted biome settings from Pattern 3:`, biomeSettings);
                    }
                }
                
                if (biomeSettings) {
                    // // console.log(`[TileEditor] Successfully loaded biome settings for ${biomeName}:`, biomeSettings);
                    // Cache the parsed data
                    localStorage.setItem(cacheKey, JSON.stringify(biomeSettings));
                    return biomeSettings;
                } else {
                    // console.(`[TileEditor] No pattern matched for ${biomeName}`);
                }
            } else {
                // // console.log(`[TileEditor] No biome settings file found for ${biomeName} (${response.status})`);
            }
        } catch (error) {
            // console.(`[TileEditor] Error loading biome settings for ${biomeName}:`, error);
        }
        return null;
    }

    async loadBiomeData(biomeName) {
        // Alias for loadBiomeSettings to maintain compatibility
        return await this.loadBiomeSettings(biomeName);
    }

    clearBiomeCache(biomeName = null) {
        if (biomeName) {
            // Clear specific biome cache
            localStorage.removeItem(`biomeSettings_${biomeName}`);
            localStorage.removeItem(`biomeSettings_${biomeName}_parsed`);
            // // console.log(`[TileEditor] Cleared cache for ${biomeName}`);
        } else {
            // Clear all biome caches
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('biomeSettings_')) {
                    localStorage.removeItem(key);
                }
            });
            // // console.log(`[TileEditor] Cleared all biome caches`);
        }
    }

    async refreshBiomeCache(biomeName = null) {
        if (biomeName) {
            // Refresh specific biome cache
            this.clearBiomeCache(biomeName);
            await this.loadBiomeSettings(biomeName);
            // // console.log(`[TileEditor] Refreshed cache for ${biomeName}`);
        } else {
            // Refresh all biome caches
            this.clearBiomeCache();
            const folders = await this.loadCategoriesFromBiomeFolders();
            // // console.log(`[TileEditor] Refreshed all biome caches`);
        }
    }

    async saveBiomeSettings(biomeName, biomeSettings) {
        try {
            // Validate inputs
            if (!biomeName || biomeName === 'null' || biomeName === 'undefined') {
                // console.(`[TileEditor] Invalid biome name: ${JSON.stringify(biomeName)}`);
                return false;
            }
            
            if (!biomeSettings) {
                // console.(`[TileEditor] Invalid biome settings: ${JSON.stringify(biomeSettings)}`);
                return false;
            }
            
            // // console.log(`[TileEditor] Saving biome settings for ${biomeName}:`, biomeSettings);
            
            const jsContent = `// Biome data for ${biomeName}
// Generated by TileEditor
window.BIOME_DATA = ${JSON.stringify(biomeSettings, null, 2)};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.BIOME_DATA;
}`;

            // // console.log(`[TileEditor] Generated JS content for ${biomeName}:`, jsContent);

            // Store in localStorage as backup and update cache
            localStorage.setItem(`biomeSettings_${biomeName}`, jsContent);
            localStorage.setItem(`biomeSettings_${biomeName}_parsed`, JSON.stringify(biomeSettings));
            
            // Prepare request body
            const requestBody = {
                name: biomeName,
                fileContent: jsContent,
                timestamp: Date.now()
            };
            
            // // console.log(`[TileEditor] Sending request body:`, JSON.stringify(requestBody));
            
            // Send file to server to save in assets folder
            const response = await fetch('/api/save-biome-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            // // console.log(`[TileEditor] Server response for ${biomeName}:`, result);
            
            return true;
        } catch (error) {
            // console.(`[TileEditor] Failed to save biome settings for ${biomeName}:`, error);
            return false;
        }
    }

    async saveBiomeTiles(biomeName, tilesList) {
        try {
            // // console.log(`[TileEditor] Saving tiles list for ${biomeName}:`, tilesList);
            
            // Generate JS content for tiles list with correct format
            const biomeNameLower = biomeName.toLowerCase();
            const jsContent = `// Tiles list for ${biomeName}
// Generated by TileEditor
const ${biomeNameLower}TilesList = ${JSON.stringify(tilesList, null, 2)};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${biomeNameLower}TilesList;
}

// Global access
window.${biomeNameLower}TilesList = ${biomeNameLower}TilesList;`;
            
            // // console.log(`[TileEditor] Generated tiles list JS content for ${biomeName}:`, jsContent);
            
            const requestBody = {
                biomeName: biomeName,
                fileContent: jsContent,
                timestamp: Date.now()
            };
            
            // // console.log(`[TileEditor] Sending tiles list request body:`, JSON.stringify(requestBody));
            
            // Send file to server to save in assets folder
            const response = await fetch('/api/save-tiles-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            // // console.log(`[TileEditor] Server response for tiles list ${biomeName}:`, result);
            
            return true;
        } catch (error) {
            // console.(`[TileEditor] Failed to save tiles list for ${biomeName}:`, error);
            return false;
        }
    }

    async saveTilesList(biomeName, tilesListContent) {
        try {
            // // console.log(`[TileEditor] Saving tiles list for biome ${biomeName}`);
            
            // Parse the content to extract tiles array
            const tilesMatch = tilesListContent.match(/const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/);
            if (tilesMatch) {
                const tiles = eval('(' + tilesMatch[1] + ')');
                
                // Send file to server to save in tiles folder
                const response = await fetch('/api/save-tiles-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        biomeName: biomeName,
                        fileContent: tilesListContent
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                // // console.log(`[TileEditor] Tiles list saved successfully for ${biomeName}:`, result);
                return true;
            } else {
                // console.(`[TileEditor] Could not parse tiles from content for ${biomeName}`);
                return false;
            }
        } catch (error) {
            // console.(`[TileEditor] Error saving tiles list for ${biomeName}:`, error);
            return false;
        }
    }

    async createCategoriesFromFolders(folders) {
        const categories = [];
        let id = 1;
        
        // Load all biome settings in parallel for better performance
        const biomePromises = folders.map(async (folder) => {
            const biomeSettings = await this.loadBiomeSettings(folder.name);
            return {
                folder,
                biomeSettings
            };
        });
        
        const biomeResults = await Promise.all(biomePromises);
        
        for (const { folder, biomeSettings } of biomeResults) {
            const category = {
                id: id++,
                name: folder.name,
                type: this.determineTypeFromFolder(folder.name),
                color: biomeSettings?.color || await this.getColorForBiome(folder.name),
                description: biomeSettings?.description || this.getDescriptionForBiome(folder.name),
                folderPath: folder.path,
                icon: this.getFolderIcon(folder.name),
                // Add image property for consistent title image handling
                image: this.getBiomeImagePath(folder.name, biomeSettings)
            };
            categories.push(category);
        }
        
        return categories;
    }

    async createCategoriesFromBiomeConfig() {
        const categories = [];
        let id = 1;
        
        // Standard Biome-Ordner basierend auf der aktuellen Struktur
        const biomeFolders = [
            'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Buildings'
        ];
        
        for (const folderName of biomeFolders) {
            const category = {
                id: id++,
                name: folderName,
                type: 'biome',
                color: await this.getColorForBiome(folderName),
                description: this.getDescriptionForBiome(folderName),
                folderPath: `assets/biomes/${folderName}`,
                icon: this.getFolderIcon(folderName)
            };
            categories.push(category);
        }
        
        return categories;
    }

    determineTypeFromFolder(folderName) {
        const biomeTypes = ['forest', 'wald', 'mountain', 'gebirge', 'water', 'wasser', 'desert', 'wüste'];
        const terrainTypes = ['cave', 'höhle', 'swamp', 'sumpf', 'volcano', 'vulkan'];
        const entityTypes = ['buildings', 'gebäude', 'structures', 'strukturen'];
        
        const lowerName = folderName.toLowerCase();
        
        if (biomeTypes.some(type => lowerName.includes(type))) {
            return 'biome';
        } else if (terrainTypes.some(type => lowerName.includes(type))) {
            return 'terrain';
        } else if (entityTypes.some(type => lowerName.includes(type))) {
            return 'entities';
        } else {
            return 'special';
        }
    }

    async getColorForBiome(biomeName) {
        // // console.log(`[TileEditor] Getting color for biome: ${biomeName}`);
        
        // Try to load saved color from biomeName.js first
        try {
            const biomeSettings = await this.loadBiomeSettings(biomeName);
            // // console.log(`[TileEditor] Loaded biome settings for ${biomeName}:`, biomeSettings);
            if (biomeSettings && biomeSettings.color) {
                // // console.log(`[TileEditor] Using saved color for ${biomeName}: ${biomeSettings.color}`);
                return biomeSettings.color;
            } else {
                // // console.log(`[TileEditor] No color found in biome settings for ${biomeName}`);
            }
        } catch (error) {
            // console.(`[TileEditor] Error loading biome settings for ${biomeName}:`, error);
            // Fall back to default colors if loading fails
        }
        
        // Use centralized color system if available
        if (typeof getColor === 'function') {
            const lowerName = biomeName.toLowerCase();
            return getColor('biomes', lowerName) || '#9C27B0';
        }
        
        // Fallback colors
        const colorMap = {
            'forest': '#4CAF50',
            'mountains': '#795548',
            'water': '#2196F3',
            'desert': '#FF9800',
            'swamp': '#8BC34A',
            'plain': '#CDDC39',
            'jungle': '#388E3C',
            'badlands': '#8D6E63',
            'snow': '#FFFFFF',
            'ocean': '#1976D2',
            'buildings': '#8D6E63',
            'coast': '#FFC107',
            'unassigned': '#9E9E9E',
        };
        
        const lowerName = biomeName.toLowerCase();
        return colorMap[lowerName] || '#9C27B0';
    }

    getDescriptionForBiome(biomeName) {
        const descMap = {
            'forest': 'Dichte Wälder mit hohen Bäumen',
            'mountains': 'Steile Berge und Felsen',
            'water': 'Flüsse, Seen und Ozeane',
            'desert': 'Heiße Sandwüsten',
            'swamp': 'Feuchte Sümpfe und Moore',
            'plain': 'Weite Ebenen und Grasland',
            'jungle': 'Dichter Dschungel mit exotischer Vegetation',
            'badlands': 'Trockene, unwirtliche Landschaften',
            'snow': 'Schneebedeckte Berge und Tundren',
            'ocean': 'Tiefe Ozeane und Küstengewässer',
            'buildings': 'Gebäude und Strukturen',
            'coast': 'Küstengebiete und Strände',
            'unassigned': 'Nicht zugeordnete Tiles',
        };
        
        const lowerName = biomeName.toLowerCase();
        return descMap[lowerName] || `Biome: ${biomeName}`;
    }

    getFolderIcon(folderName) {
        const iconMap = {
            'forest': '🌲',
            'mountains': '⛰️',
            'water': '💧',
            'desert': '🏜️',
            'swamp': '🌿',
            'plain': '🌾',
            'jungle': '🌴',
            'badlands': '🏔️',
            'snow': '❄️',
            'ocean': '🌊',
            'buildings': '🏗️',
            'coast': '🏖️',
        };
        
        const lowerName = folderName.toLowerCase();
        return iconMap[lowerName] || '📁';
    }

    // Neue Methode: Prüft ob ein Bild existiert und gibt Placeholder als Fallback zurück
    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    getTypeName(type) {
        const typeNames = {
            'terrain': 'Terrain',
            'biome': 'Biome',
            'entities': 'Entities',
            'special': 'Spezial'
        };
        return typeNames[type] || type;
    }

    async initializeCategories() {
        // // console.log('[TileEditor] initializeCategories called, categories:', this.categories?.length);
        
        // Try to load saved category order
        const orderLoaded = this.loadCategoryOrder();
        
        // Use uiManager.displayCategories instead of displayCategories to show tiles and images
        if (this.uiManager) {
            // // console.log('[TileEditor] uiManager available, calling displayCategories');
            await this.uiManager.displayCategories(this.categories);
        } else {
            // // console.log('[TileEditor] uiManager not available yet, categories will be displayed later');
        }
        this.updateCategoryFilter();
    }

    initializeTiles() {
        const tilesList = document.getElementById('tilesList');
        if (tilesList) {
            this.updateTilesList();
        } else {
            // console.('[TileEditor] Tiles list element not found');
        }
    }

    destroy() {
        // Cleanup event listeners and references
        this.isInitialized = false;
    }

    // Biome Modal Methods
    async openBiomeModal(categoryId) {
        // Force apply styles before opening modal
        this.forceReapplyStyles();
        
        if (this.modalManager) {
            await this.modalManager.openBiomeModal(categoryId);
            
            // Ensure tiles are displayed after modal opens
            setTimeout(() => {
                const currentViewMode = localStorage.getItem('tileEditorViewMode') || 'table';
                this.updateAnyOpenModalView(currentViewMode);
            }, 200);
        } else {
            // console.('[TileEditor] ModalManager not available');
        }
    }

    closeBiomeModal() {
        if (this.modalManager) {
            this.modalManager.closeBiomeModal();
        }
    }

    selectTile(tileId) {
        // // console.log('[TileEditor] selectTile called with:', tileId);
        this.selectedTileId = tileId;
        this.updateTilesList();
    }

    selectCategory(categoryId) {
        // // console.log('[TileEditor] selectCategory called with:', categoryId);
        this.selectedCategoryId = categoryId;
        this.updateTilesList();
    }

    editCategory(categoryId) {
        // // console.log('[TileEditor] editCategory called with:', categoryId);
        // TODO: Implement category editing
    }

    // Placeholder methods that will be overridden by the complete tile editor
    loadCategoryOrder() {
        return false;
    }

    updateCategoryFilter() {
        // Will be implemented by the complete tile editor
    }

    updateTilesList() {
        // Will be implemented by the complete tile editor
    }

    setupEventListeners() {
        // // console.log('[TileEditor] Setting up event listeners');
        
        // Biome Modal Event Listeners
        const closeBiomeModalHeaderBtn = document.getElementById('closeBiomeModalHeaderBtn');
        const closeBiomeModalActionBtn = document.getElementById('closeBiomeModalActionBtn');
        const biomeModal = document.getElementById('biomeModal');
        
        if (closeBiomeModalHeaderBtn) {
            closeBiomeModalHeaderBtn.addEventListener('click', () => {
                // // console.log('[TileEditor] Close biome modal header button clicked');
                this.closeBiomeModal();
            });
        }
        
        if (closeBiomeModalActionBtn) {
            closeBiomeModalActionBtn.addEventListener('click', () => {
                // // console.log('[TileEditor] Close biome modal action button clicked');
                this.closeBiomeModal();
            });
        }
        
        if (biomeModal) {
            biomeModal.addEventListener('click', (e) => {
                if (e.target === biomeModal) {
                    // // console.log('[TileEditor] Biome modal background clicked');
                    this.closeBiomeModal();
                }
            });
        }
        
        // View mode switching (Table/Cards) - Use event delegation for better reliability
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button[data-view]');
            if (target) {
                const viewMode = target.getAttribute('data-view');
                console.log('[TileEditor] View mode button clicked:', viewMode);
                this.switchViewMode(viewMode);
            }
        });
        
        // Also listen for specific button IDs as fallback
        const tableViewBtn = document.getElementById('toggleTableView');
        const cardsViewBtn = document.getElementById('toggleCardView');
        
        console.log('[TileEditor] View mode buttons found:', {
            tableViewBtn: !!tableViewBtn,
            cardsViewBtn: !!cardsViewBtn
        });
        
        if (tableViewBtn) {
            tableViewBtn.addEventListener('click', () => {
                console.log('[TileEditor] Table view button clicked (by ID)');
                this.switchViewMode('table');
            });
        }
        
        if (cardsViewBtn) {
            cardsViewBtn.addEventListener('click', () => {
                console.log('[TileEditor] Cards view button clicked (by ID)');
                this.switchViewMode('cards');
            });
        }
        
        // Biome Settings Toggle
        const toggleBiomeSettings = document.getElementById('toggleBiomeSettings');
        const biomeSettingsContent = document.getElementById('biomeSettingsContent');
        
        if (toggleBiomeSettings && biomeSettingsContent) {
            toggleBiomeSettings.addEventListener('click', () => {
                // // console.log('[TileEditor] Toggle biome settings clicked');
                const isCollapsed = biomeSettingsContent.classList.contains('collapsed');
                
                if (isCollapsed) {
                    biomeSettingsContent.classList.remove('collapsed');
                    toggleBiomeSettings.classList.remove('collapsed');
                    toggleBiomeSettings.textContent = '▼';
                    // // console.log('[TileEditor] Biome settings expanded');
                } else {
                    biomeSettingsContent.classList.add('collapsed');
                    toggleBiomeSettings.classList.add('collapsed');
                    toggleBiomeSettings.textContent = '▶';
                    // // console.log('[TileEditor] Biome settings collapsed');
                }
            });
            // // console.log('[TileEditor] Biome settings toggle listener added');
        } else {
            // console.('[TileEditor] Biome settings toggle elements not found');
        }
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        if (tabButtons.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');
                    // // console.log('[TileEditor] Tab button clicked:', targetTab);
                    
                    // Remove active class from all buttons and panels
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanels.forEach(panel => panel.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding panel
                    button.classList.add('active');
                    const targetPanel = document.getElementById(targetTab);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                        // // console.log('[TileEditor] Tab switched to:', targetTab);
                    } else {
                        // console.('[TileEditor] Target panel not found:', targetTab);
                    }
                });
            });
            // // console.log('[TileEditor] Tab switching listeners added for', tabButtons.length, 'buttons');
        } else {
            // console.('[TileEditor] No tab buttons found');
        }
        
        // Color Picker functionality
        this.setupColorPickers();
        
        // Image Upload functionality  
        this.setupImageUpload();
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // // console.log('[TileEditor] ESC key pressed');
                this.closeBiomeModal();
            }
        });

        // Setup sort event listeners
        this.setupSortEventListeners();
        
        // // console.log('[TileEditor] Event listeners setup complete');
    }

    setupSortEventListeners() {
        console.log('[TileEditor] Setting up sort event listeners...');
        
        // Category sort buttons
        const sortCategoriesByName = document.getElementById('sortCategoriesByName');
        const sortCategoriesByType = document.getElementById('sortCategoriesByType');
        const sortCategoriesByColor = document.getElementById('sortCategoriesByColor');

        console.log('[TileEditor] Category sort buttons:', {
            sortCategoriesByName: !!sortCategoriesByName,
            sortCategoriesByType: !!sortCategoriesByType,
            sortCategoriesByColor: !!sortCategoriesByColor
        });

        if (sortCategoriesByName) {
            sortCategoriesByName.addEventListener('click', () => {
                console.log('[TileEditor] Category sort by name clicked');
                this.sortCategories('name');
            });
        }
        if (sortCategoriesByType) {
            sortCategoriesByType.addEventListener('click', () => {
                console.log('[TileEditor] Category sort by type clicked');
                this.sortCategories('type');
            });
        }
        if (sortCategoriesByColor) {
            sortCategoriesByColor.addEventListener('click', () => {
                console.log('[TileEditor] Category sort by color clicked');
                this.sortCategories('color');
            });
        }

        console.log('[TileEditor] Sort event listeners setup complete');
    }

    setupColorPickers() {
        // // console.log('[TileEditor] Setting up color pickers');
        
        // Title Image Color Picker
        const colorPickerCanvas = document.getElementById('colorPickerCanvas');
        const colorPickerCursor = document.getElementById('colorPickerCursor');
        
        if (colorPickerCanvas && colorPickerCursor) {
            this.initializeTitleImagePicker(colorPickerCanvas, colorPickerCursor);
            // // console.log('[TileEditor] Title image color picker initialized');
        }
        
        // Gradient Color Picker
        const gradientPickerCanvas = document.getElementById('gradientPickerCanvas');
        const gradientPickerCursor = document.getElementById('gradientPickerCursor');
        
        if (gradientPickerCanvas && gradientPickerCursor) {
            this.initializeGradientPicker(gradientPickerCanvas, gradientPickerCursor);
            // // console.log('[TileEditor] Gradient color picker initialized');
        }
        
        // RGB Input listeners
        this.setupRGBInputs();
    }

    initializeTitleImagePicker(canvas, cursor) {
        const ctx = canvas.getContext('2d');
        
        // Load current biome image onto canvas
        const biomeMainImage = document.getElementById('biomeMainImage');
        if (biomeMainImage && biomeMainImage.src) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Draw image to canvas, scaled to fit
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // // console.log('[TileEditor] Title image loaded to color picker');
            };
            img.onerror = () => {
                // // console.('[TileEditor] Could not load title image for color picker');
                this.drawDefaultColorGradient(ctx, canvas.width, canvas.height);
            };
            img.src = biomeMainImage.src;
        } else {
            // Draw default gradient if no image
            this.drawDefaultColorGradient(ctx, canvas.width, canvas.height);
        }
        
        // Add click listener
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Get pixel color
            const imageData = ctx.getImageData(x, y, 1, 1);
            const pixel = imageData.data;
            const color = {
                r: pixel[0],
                g: pixel[1],
                b: pixel[2]
            };
            
            this.updateColorFromPicker(color, x, y, cursor);
            // // console.log('[TileEditor] Color picked from title image:', color);
        });
    }

    initializeGradientPicker(canvas, cursor) {
        const ctx = canvas.getContext('2d');
        
        // Draw color gradient
        this.drawColorSpectrum(ctx, canvas.width, canvas.height);
        
        // Add click listener
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Get pixel color
            const imageData = ctx.getImageData(x, y, 1, 1);
            const pixel = imageData.data;
            const color = {
                r: pixel[0],
                g: pixel[1],
                b: pixel[2]
            };
            
            this.updateColorFromPicker(color, x, y, cursor);
            // // console.log('[TileEditor] Color picked from gradient:', color);
        });
    }

    drawDefaultColorGradient(ctx, width, height) {
        // Create simple color gradient as fallback
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.16, '#ffff00');
        gradient.addColorStop(0.33, '#00ff00');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(0.66, '#0000ff');
        gradient.addColorStop(0.83, '#ff00ff');
        gradient.addColorStop(1, '#ff0000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add brightness gradient
        const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
        brightnessGradient.addColorStop(0, 'rgba(255,255,255,0)');
        brightnessGradient.addColorStop(0.5, 'rgba(255,255,255,0)');
        brightnessGradient.addColorStop(1, 'rgba(0,0,0,1)');
        
        ctx.fillStyle = brightnessGradient;
        ctx.fillRect(0, 0, width, height);
    }

    drawColorSpectrum(ctx, width, height) {
        // Draw HSB color spectrum
        const imageData = ctx.createImageData(width, height);
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const hue = (x / width) * 360;
                const saturation = 1;
                const brightness = 1 - (y / height);
                
                const rgb = this.hsbToRgb(hue, saturation, brightness);
                
                const index = (y * width + x) * 4;
                imageData.data[index] = rgb.r;
                imageData.data[index + 1] = rgb.g;
                imageData.data[index + 2] = rgb.b;
                imageData.data[index + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    hsbToRgb(h, s, b) {
        h = h / 360;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = b * (1 - s);
        const q = b * (1 - f * s);
        const t = b * (1 - (1 - f) * s);
        
        let r, g, b_val;
        switch (i % 6) {
            case 0: r = b; g = t; b_val = p; break;
            case 1: r = q; g = b; b_val = p; break;
            case 2: r = p; g = b; b_val = t; break;
            case 3: r = p; g = q; b_val = b; break;
            case 4: r = t; g = p; b_val = b; break;
            case 5: r = b; g = p; b_val = q; break;
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b_val * 255)
        };
    }

    updateColorFromPicker(color, x, y, cursor) {
        // Update color preview
        const colorPreview = document.getElementById('colorPreview');
        if (colorPreview) {
            const hexColor = this.rgbToHex(color.r, color.g, color.b);
            colorPreview.style.backgroundColor = hexColor;
        }
        
        // Update color input
        const colorInput = document.getElementById('biomeColorInput');
        if (colorInput) {
            colorInput.value = this.rgbToHex(color.r, color.g, color.b);
        }
        
        // Update RGB inputs
        const rInput = document.getElementById('biomeColorR');
        const gInput = document.getElementById('biomeColorG');
        const bInput = document.getElementById('biomeColorB');
        
        if (rInput) rInput.value = color.r;
        if (gInput) gInput.value = color.g;
        if (bInput) bInput.value = color.b;
        
        // Position cursor
        if (cursor) {
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
            cursor.style.display = 'block';
        }
    }

    setupRGBInputs() {
        const rInput = document.getElementById('biomeColorR');
        const gInput = document.getElementById('biomeColorG');
        const bInput = document.getElementById('biomeColorB');
        const colorInput = document.getElementById('biomeColorInput');
        const colorPreview = document.getElementById('colorPreview');
        
        const updateFromRGB = () => {
            const r = parseInt(rInput?.value || 0);
            const g = parseInt(gInput?.value || 0);
            const b = parseInt(bInput?.value || 0);
            
            const hexColor = this.rgbToHex(r, g, b);
            
            if (colorInput) colorInput.value = hexColor;
            if (colorPreview) colorPreview.style.backgroundColor = hexColor;
        };
        
        const updateFromHex = () => {
            const hex = colorInput?.value || '#000000';
            const rgb = this.hexToRgb(hex);
            
            if (rgb && rInput && gInput && bInput) {
                rInput.value = rgb.r;
                gInput.value = rgb.g;
                bInput.value = rgb.b;
            }
            
            if (colorPreview) colorPreview.style.backgroundColor = hex;
        };
        
        if (rInput) rInput.addEventListener('input', updateFromRGB);
        if (gInput) gInput.addEventListener('input', updateFromRGB);
        if (bInput) bInput.addEventListener('input', updateFromRGB);
        if (colorInput) colorInput.addEventListener('input', updateFromHex);
    }

    setupImageUpload() {
        // // console.log('[TileEditor] Setting up image upload');
        
        const imageUploadInput = document.getElementById('biomeImageUpload');
        const imageUploadBtn = document.getElementById('biomeImageUploadBtn');
        
        if (imageUploadBtn && imageUploadInput) {
            imageUploadBtn.addEventListener('click', () => {
                // // console.log('[TileEditor] Image upload button clicked');
                imageUploadInput.click();
            });
            
            imageUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
            
            // // console.log('[TileEditor] Image upload listeners added');
        } else {
            // console.('[TileEditor] Image upload elements not found');
        }
    }

    handleImageUpload(file) {
        // // console.log('[TileEditor] Handling image upload:', file.name);
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Bitte wählen Sie eine Bilddatei aus.', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showToast('Die Datei ist zu groß. Maximum: 2MB', 'error');
            return;
        }
        
        // Create file reader
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            
            // Update biome main image
            const biomeMainImage = document.getElementById('biomeMainImage');
            if (biomeMainImage) {
                biomeMainImage.src = imageDataUrl;
                // // console.log('[TileEditor] Biome main image updated');
            }
            
            // Update color picker with new image
            const colorPickerCanvas = document.getElementById('colorPickerCanvas');
            const colorPickerCursor = document.getElementById('colorPickerCursor');
            if (colorPickerCanvas && colorPickerCursor) {
                setTimeout(() => {
                    this.initializeTitleImagePicker(colorPickerCanvas, colorPickerCursor);
                }, 100);
            }
            
            this.showToast('Titelbild erfolgreich hochgeladen!', 'success');
        };
        
        reader.onerror = () => {
            this.showToast('Fehler beim Laden der Datei.', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    showToast(message, type = 'info') {
        if (this.toastManager) {
            this.toastManager.show(message, type);
        } else {
            // // console.log(`[TileEditor Toast] ${type.toUpperCase()}: ${message}`);
        }
    }

    // Load tiles directly into category card
    loadTilesIntoCategoryCard(categoryElement, category) {
        const gridContainer = categoryElement.querySelector('.tiles-grid');
        if (!gridContainer) {
            console.warn('[TileEditor] No grid container found in category card');
            return;
        }
        
        // Get tiles for this category
        const tiles = this.tiles.filter(tile => tile.categoryId === category.id);
        console.log(`[TileEditor] Loading ${tiles.length} tiles into category card for ${category.name}`);
        
        // Clear existing cards
        gridContainer.innerHTML = '';
        
        // Add cards to the grid (limit to 4 for preview)
        const previewTiles = tiles.slice(0, 4);
        previewTiles.forEach(tile => {
            let tileImagePath = this.fixImagePath(tile.image);
            
            const cardElement = document.createElement('div');
            cardElement.className = 'tile-card';
            cardElement.setAttribute('data-tile-id', tile.id);
            cardElement.onclick = (e) => {
                e.stopPropagation(); // Prevent category click
                window.tileEditor.openTileModalFromBiome(tile.id);
            };
            
            cardElement.innerHTML = `
                <div class="tile-image-container">
                    <img src="${tileImagePath}" alt="${tile.name}" class="tile-thumbnail" />
                </div>
                <div class="tile-details">
                    <span class="tile-name">${tile.name}</span>
                </div>
            `;
             
             gridContainer.appendChild(cardElement);
         });
         
         // Show "more" indicator if there are more tiles
         if (tiles.length > 4) {
             const moreElement = document.createElement('div');
             moreElement.className = 'tile-card more-tiles';
             moreElement.innerHTML = `
                 <div class="tile-image-container">
                     <div class="more-indicator">+${tiles.length - 4}</div>
                 </div>
                 <div class="tile-details">
                     <span class="tile-name">Mehr...</span>
                 </div>
             `;
             moreElement.onclick = (e) => {
                 e.stopPropagation(); // Prevent category click
                 window.tileEditor.openBiomeModal(category.id);
             };
             gridContainer.appendChild(moreElement);
         }
         
         console.log('[TileEditor] Tiles loaded into category card');
    }

    // Get biome title image path (same logic as ModalManager)
    getBiomeTitleImagePath(category) {
        console.log('[TileEditor] Getting title image path for category:', category.name);
        
        // Priority 1: Check if category has image property
        if (category.image) {
            const imagePath = category.image.startsWith('/') ? category.image : '/' + category.image;
            console.log('[TileEditor] Using category image:', imagePath);
            return imagePath;
        }
        
        // Priority 2: Look for biomeName.png in biome folder
        const defaultImagePath = `/assets/biomes/${category.name}/${category.name}.png`;
        console.log('[TileEditor] Using default biome image path:', defaultImagePath);
        
        return defaultImagePath;
    }

    // Get biome image path from settings or default location
    getBiomeImagePath(biomeName, biomeSettings) {
        // // console.log('[TileEditor] Getting biome image path for:', biomeName);
        
        // For Biomes without images, return null to trigger fallback
        const biomesWithoutImages = ['Unassigned']; // Only Unassigned has no title image
        if (biomesWithoutImages.includes(biomeName)) {
            return null; // Return null to trigger fallback
        }
        
        // Priority 1: Check biome settings for title image (from biomeSettings.tiles[0].image)
        if (biomeSettings?.tiles && biomeSettings.tiles.length > 0) {
            const titleTile = biomeSettings.tiles[0];
            if (titleTile?.image) {
                // // console.log('[TileEditor] Using biome settings title tile image:', titleTile.image);
                const imagePath = titleTile.image.startsWith('/') ? titleTile.image : '/' + titleTile.image;
                
                // Add cache busting for Buildings tiles
                if (biomeName === 'Buildings' || imagePath.includes('Buildings')) {
                    const timestamp = Date.now();
                    const cacheBustedPath = imagePath + (imagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
                    console.log('[TileEditor] Cache busted path for Buildings:', cacheBustedPath);
                    return cacheBustedPath;
                }
                
                return imagePath;
            }
        }
        
        // Priority 2: Look for biomeName.png in biome folder
        const defaultImagePath = `/assets/biomes/${biomeName}/${biomeName}.png`;
        
        // Add cache busting for Buildings tiles
        if (biomeName === 'Buildings') {
            const timestamp = Date.now();
            const cacheBustedPath = defaultImagePath + (defaultImagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[TileEditor] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        // // console.log('[TileEditor] Using default biome image path:', defaultImagePath);
        return defaultImagePath;
    }

    // Clear outdated cache entries
    clearOutdatedCache() {
        // // console.log('[TileEditor] Clearing outdated cache entries...');
        
        // Clear localStorage cache
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('biomeSettings_') || key.startsWith('biomeTiles_') || key.startsWith('tiles')) {
                localStorage.removeItem(key);
                // // console.log('[TileEditor] Cleared localStorage key:', key);
            }
        });
        
        // Clear outdated tile references
        if (this.tiles) {
            const oldLength = this.tiles.length;
            this.tiles = this.tiles.filter(tile => {
                // Remove tiles with problematic image paths
                if (tile.image && (tile.image.includes('Slice%20') || tile.image.includes('Slice 3'))) {
                    // // console.log('[TileEditor] Removing outdated tile:', tile.image);
                    return false;
                }
                return true;
            });
            // // console.log('[TileEditor] Removed', oldLength - this.tiles.length, 'outdated tiles');
        }
    }

    // Add missing openTileModalFromBiome function
    openTileModalFromBiome(tileId) {
        // // console.log('[TileEditor] openTileModalFromBiome called with tileId:', tileId);
        
        if (this.modalManager && this.modalManager.openTileModalFromBiome) {
            this.modalManager.openTileModalFromBiome(tileId);
        } else {
            // console.('[TileEditor] modalManager.openTileModalFromBiome not available');
            if (this.toastManager) {
                this.toastManager.error('Tile-Modal nicht verfügbar');
            }
        }
    }

    // Add missing openTileModal function
    openTileModal(tileId) {
        // // console.log('[TileEditor] openTileModal called with tileId:', tileId);
        
        if (this.modalManager && this.modalManager.openTileModal) {
            this.modalManager.openTileModal(tileId);
        } else {
            // console.('[TileEditor] modalManager.openTileModal not available');
            if (this.toastManager) {
                this.toastManager.error('Tile-Modal nicht verfügbar');
            }
        }
    }

    // Add missing removeTileFromBiome function
    removeTileFromBiome(tileId) {
        // // console.log('[TileEditor] removeTileFromBiome called with tileId:', tileId);
        
        if (this.modalManager && this.modalManager.removeTileFromBiome) {
            this.modalManager.removeTileFromBiome(tileId);
        } else {
            // console.('[TileEditor] modalManager.removeTileFromBiome not available');
            if (this.toastManager) {
                this.toastManager.error('Tile-Entfernung nicht verfügbar');
            }
        }
    }

    // Add sortCategories function
    sortCategories(sortBy) {
        console.log('[TileEditor] Sorting categories by:', sortBy);
        console.log('[TileEditor] Current categories:', this.categories);
        
        // Update active sort button
        this.updateActiveSortButton('categories', sortBy);
        
        // Sort categories based on criteria
        let sortedCategories = [...this.categories];
        
        switch (sortBy) {
            case 'name':
                sortedCategories.sort((a, b) => a.name.localeCompare(b.name, 'de'));
                break;
            case 'type':
                sortedCategories.sort((a, b) => a.type.localeCompare(b.type, 'de'));
                break;
            case 'color':
                sortedCategories.sort((a, b) => a.color.localeCompare(b.color, 'de'));
                break;
        }
        
        console.log('[TileEditor] Sorted categories:', sortedCategories);
        
        // Update display using UIManager
        if (this.uiManager && this.uiManager.displayCategories) {
            this.uiManager.displayCategories(sortedCategories);
        } else {
            console.error('[TileEditor] UIManager not available for displaying sorted categories');
        }
    }

    // Add updateActiveSortButton function
    updateActiveSortButton(type, sortBy) {
        // Remove active class from all sort buttons
        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button based on type and sortBy
        let activeButton = null;
        
        if (type === 'categories') {
            switch (sortBy) {
                case 'name':
                    activeButton = document.getElementById('sortCategoriesByName');
                    break;
                case 'type':
                    activeButton = document.getElementById('sortCategoriesByType');
                    break;
                case 'color':
                    activeButton = document.getElementById('sortCategoriesByColor');
                    break;
            }
        } else if (type === 'tiles') {
            switch (sortBy) {
                case 'name':
                    activeButton = document.getElementById('sortTilesByName');
                    break;
                case 'movementCost':
                    activeButton = document.getElementById('sortTilesByCost');
                    break;
                case 'rarity':
                    activeButton = document.getElementById('sortTilesByRarity');
                    break;
            }
        }
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Switch between table and cards view mode
    switchViewMode(mode) {
        console.log('[TileEditor] Switching view mode to:', mode);
        
        // Force reapply styles BEFORE updating view
        this.forceReapplyStyles();
        
        // Update active button using both data-view and specific IDs
        const allViewButtons = document.querySelectorAll('button[data-view]');
        allViewButtons.forEach(btn => btn.classList.remove('active'));
        
        // Also update specific button IDs
        const tableViewBtn = document.getElementById('toggleTableView');
        const cardsViewBtn = document.getElementById('toggleCardView');
        
        console.log('[TileEditor] Found buttons for activation:', {
            tableViewBtn: !!tableViewBtn,
            cardsViewBtn: !!cardsViewBtn
        });
        
        if (tableViewBtn) tableViewBtn.classList.remove('active');
        if (cardsViewBtn) cardsViewBtn.classList.remove('active');
        
        // Activate the correct button
        if (mode === 'table') {
            if (tableViewBtn) {
                tableViewBtn.classList.add('active');
                console.log('[TileEditor] Table button activated');
            } else {
                console.warn('[TileEditor] Table button not found for activation');
            }
        } else if (mode === 'cards') {
            if (cardsViewBtn) {
                cardsViewBtn.classList.add('active');
                console.log('[TileEditor] Cards button activated');
            } else {
                console.warn('[TileEditor] Cards button not found for activation');
            }
        }
        
        // Store view mode preference
        localStorage.setItem('tileEditorViewMode', mode);
        console.log('[TileEditor] View mode saved to localStorage:', mode);
        
        // DEBUG: Check current view mode
        const currentViewMode = localStorage.getItem('tileEditorViewMode');
        console.log('[TileEditor] Current view mode from localStorage:', currentViewMode);
        
        // Update display based on current biome modal OR try to find any open modal
        if (this.modalManager && this.modalManager.currentBiome) {
            console.log('[TileEditor] Updating biome modal view');
            this.updateBiomeModalView(mode);
        } else {
            console.log('[TileEditor] No current biome modal, trying to find any open modal');
            // Try to find any open modal and update it
            this.updateAnyOpenModalView(mode);
        }
        
        // Force reapply styles again AFTER updating view
        this.forceReapplyStyles();
    }
    
    forceReapplyStyles() {
        console.log('[TileEditor] Force reapplying styles');
        
        // Remove existing style element
        const styleElement = document.getElementById('tile-editor-view-styles');
        if (styleElement) {
            const parent = styleElement.parentNode;
            parent.removeChild(styleElement);
            
            // Re-add the styles immediately
            this.addGlobalStyles();
            
            console.log('[TileEditor] Styles reapplied');
        } else {
            // If no style element exists, create it
            console.log('[TileEditor] No style element found, creating new one');
            this.addGlobalStyles();
        }
        
        // Force browser reflow to ensure styles are applied
        document.body.offsetHeight;
        
        // Additional force reflow for table elements
        const tableElements = document.querySelectorAll('.tiles-table-content, .tiles-cards');
        tableElements.forEach(element => {
            element.style.display = 'none';
            element.offsetHeight; // Force reflow
            element.style.display = '';
        });
        
        console.log('[TileEditor] Layout recalculation completed');
    }

    // Update any open modal view based on selected mode
    updateAnyOpenModalView(mode) {
        console.log('[TileEditor] Trying to find any open modal to update view mode');
        
        // Check if any modal is currently visible
        const visibleModal = document.querySelector('.modal.show, .modal[style*="display: block"], .modal[style*="display:flex"], #biomeModal[style*="display: block"]');
        
        if (visibleModal) {
            console.log('[TileEditor] Found visible modal:', visibleModal);
            
            // Try to find tiles container within this modal
            const tilesContainer = visibleModal.querySelector('#biomeTilesList') ||
                                  visibleModal.querySelector('.biome-tiles-container') || 
                                  visibleModal.querySelector('.tiles-container') ||
                                  visibleModal.querySelector('#tilesContainer') ||
                                  visibleModal.querySelector('.modal-content .tiles-section') ||
                                  visibleModal.querySelector('.tiles-section') ||
                                  visibleModal.querySelector('.biome-tiles-list');
            
            console.log('[TileEditor] Tiles container found in visible modal:', !!tilesContainer);
            
            if (tilesContainer) {
                if (mode === 'table') {
                    console.log('[TileEditor] Displaying tiles as table in visible modal');
                    this.displayTilesAsTable(tilesContainer);
                } else if (mode === 'cards') {
                    console.log('[TileEditor] Displaying tiles as cards in visible modal');
                    this.displayTilesAsCards(tilesContainer);
                }
            } else {
                console.warn('[TileEditor] No tiles container found in visible modal');
                // Try to find container in document body as fallback
                const fallbackContainer = document.querySelector('#biomeTilesList') ||
                                         document.querySelector('.biome-tiles-container') ||
                                         document.querySelector('.tiles-container');
                if (fallbackContainer) {
                    console.log('[TileEditor] Using fallback container');
                    if (mode === 'table') {
                        this.displayTilesAsTable(fallbackContainer);
                    } else if (mode === 'cards') {
                        this.displayTilesAsCards(fallbackContainer);
                    }
                }
            }
        } else {
            console.log('[TileEditor] No visible modal found, view mode will be applied when modal opens');
        }
    }

    // Update biome modal view based on selected mode
    updateBiomeModalView(mode) {
        console.log('[TileEditor] Updating biome modal view to:', mode);
        
        // Try different possible container selectors
        const tilesContainer = document.querySelector('#biomeTilesList') ||
                              document.querySelector('.biome-tiles-container') || 
                              document.querySelector('.tiles-container') ||
                              document.querySelector('#tilesContainer') ||
                              document.querySelector('.modal-content .tiles-section') ||
                              document.querySelector('.biome-modal .tiles-section');
        
        console.log('[TileEditor] Tiles container found:', !!tilesContainer);
        
        if (!tilesContainer) {
            console.warn('[TileEditor] No tiles container found for view mode update');
            console.log('[TileEditor] Available containers:', {
                biomeTilesList: !!document.querySelector('#biomeTilesList'),
                biomeTilesContainer: !!document.querySelector('.biome-tiles-container'),
                tilesContainer: !!document.querySelector('.tiles-container'),
                tilesContainerId: !!document.querySelector('#tilesContainer'),
                modalContentTiles: !!document.querySelector('.modal-content .tiles-section'),
                biomeModalTiles: !!document.querySelector('.biome-modal .tiles-section')
            });
            return;
        }
        
        if (mode === 'table') {
            console.log('[TileEditor] Displaying tiles as table');
            this.displayTilesAsTable(tilesContainer);
        } else if (mode === 'cards') {
            console.log('[TileEditor] Displaying tiles as cards');
            this.displayTilesAsCards(tilesContainer);
        }
    }

         // Display tiles in table format
     displayTilesAsTable(container) {
         const currentBiome = this.modalManager?.currentBiome;
         
         // If no current biome, try to get it from the container's context
         let biomeId = currentBiome?.id;
         if (!biomeId) {
             // Try to find biome ID from container's parent elements
             const modalElement = container.closest('.modal');
             if (modalElement) {
                 const biomeIdAttr = modalElement.getAttribute('data-current-biome-id') || 
                                    modalElement.getAttribute('data-biome-id') ||
                                    modalElement.querySelector('[data-current-biome-id]')?.getAttribute('data-current-biome-id') ||
                                    modalElement.querySelector('[data-biome-id]')?.getAttribute('data-biome-id');
                 if (biomeIdAttr) {
                     biomeId = parseInt(biomeIdAttr);
                     console.log('[TileEditor] Found biome ID from modal:', biomeId);
                 }
             }
         }
         
         if (!biomeId) {
             console.warn('[TileEditor] No biome ID found for table display');
             container.innerHTML = '<div class="no-tiles">Keine Biome-Informationen verfügbar</div>';
             return;
         }
         
                           // Use the original tiles that were loaded during initialization
        const originalTiles = this.tiles || [];
        const numericBiomeId = parseInt(biomeId);
        console.log('[TileEditor] Looking for tiles with categoryId:', numericBiomeId);
        console.log('[TileEditor] Original tiles count:', originalTiles.length);
        console.log('[TileEditor] All tiles categoryIds:', originalTiles.map(t => t.categoryId));
        
        // Try different matching strategies
        let tiles = originalTiles.filter(tile => {
            const tileCategoryId = parseInt(tile.categoryId);
            const matches = tileCategoryId === numericBiomeId;
            console.log(`[TileEditor] Tile ${tile.name}: categoryId=${tile.categoryId} (${typeof tile.categoryId}), matches=${matches}`);
            return matches;
        });
        
        // If no tiles found, try matching by category name
        if (tiles.length === 0) {
            const category = this.categories.find(cat => cat.id === numericBiomeId);
            if (category) {
                console.log(`[TileEditor] No tiles found for categoryId, trying category name: ${category.name}`);
                tiles = originalTiles.filter(tile => 
                    tile.categoryName === category.name || 
                    tile.name.toLowerCase().includes(category.name.toLowerCase())
                );
                console.log(`[TileEditor] Found ${tiles.length} tiles by category name`);
            }
        }
        
        // If still no tiles found, show all tiles for debugging
        if (tiles.length === 0) {
            console.log('[TileEditor] No tiles found, showing all tiles for debugging');
            tiles = originalTiles.slice(0, 5); // Show first 5 tiles for debugging
        }
        
        console.log('[TileEditor] Displaying', tiles.length, 'tiles as table for biome ID:', biomeId, '(numeric:', numericBiomeId, ')');
        console.log('[TileEditor] Available tiles:', originalTiles.map(t => ({ id: t.id, name: t.name, categoryId: t.categoryId, categoryIdType: typeof t.categoryId })));
        console.log('[TileEditor] Filtered tiles for biome ID', biomeId, ':', tiles.map(t => ({ id: t.id, name: t.name, categoryId: t.categoryId, categoryIdType: typeof t.categoryId })));
         
         container.innerHTML = `
             <div class="tiles-table-container">
                 <div class="tiles-table">
                     <table class="tiles-table-content">
                         <thead>
                             <tr>
                                 <th>Bild</th>
                                 <th>Name</th>
                                 <th>Bewegung</th>
                                 <th>Verteidigung</th>
                                 <th>Typ</th>
                                 <th>Beschreibung</th>
                                 <th>Aktionen</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${tiles.map(tile => {
                                 let tileImagePath = this.fixImagePath(tile.image);
                                 
                                 return `
                                     <tr class="tile-row">
                                         <td class="tile-image-cell">
                                             <img src="${tileImagePath}" alt="${tile.name}" class="tile-thumbnail" />
                                         </td>
                                         <td class="tile-name-cell">${tile.name}</td>
                                         <td class="tile-movement-cell">${tile.movementCost}</td>
                                         <td class="tile-defense-cell">+${tile.defenseBonus}</td>
                                         <td class="tile-type-cell">${tile.type || 'Standard'}</td>
                                         <td class="tile-description-cell">${tile.description || ''}</td>
                                         <td class="tile-actions-cell">
                                             <button class="edit-tile-btn" onclick="window.tileEditor.openTileModalFromBiome(${tile.id})">✏️</button>
                                             <button class="delete-tile-btn" onclick="window.tileEditor.removeTileFromBiome(${tile.id})">❌</button>
                                         </td>
                                     </tr>
                                 `;
                             }).join('')}
                         </tbody>
                     </table>
                 </div>
             </div>
         `;
         
         // Force apply styles immediately after setting HTML
         this.forceReapplyStyles();
     }

         // Display tiles in cards format
     displayTilesAsCards(container) {
         const currentBiome = this.modalManager?.currentBiome;
         
         // If no current biome, try to get it from the container's context
         let biomeId = currentBiome?.id;
         if (!biomeId) {
             // Try to find biome ID from container's parent elements
             const modalElement = container.closest('.modal');
             if (modalElement) {
                 const biomeIdAttr = modalElement.getAttribute('data-current-biome-id') || 
                                    modalElement.getAttribute('data-biome-id') ||
                                    modalElement.querySelector('[data-current-biome-id]')?.getAttribute('data-current-biome-id') ||
                                    modalElement.querySelector('[data-biome-id]')?.getAttribute('data-biome-id');
                 if (biomeIdAttr) {
                     biomeId = parseInt(biomeIdAttr);
                     console.log('[TileEditor] Found biome ID from modal:', biomeId);
                 }
             }
         }
         
         if (!biomeId) {
             console.warn('[TileEditor] No biome ID found for cards display');
             container.innerHTML = '<div class="no-tiles">Keine Biome-Informationen verfügbar</div>';
             return;
         }
         
                           // Use the original tiles that were loaded during initialization
        const originalTiles = this.tiles || [];
        const numericBiomeId = parseInt(biomeId);
        console.log('[TileEditor] Looking for tiles with categoryId:', numericBiomeId);
        console.log('[TileEditor] Original tiles count:', originalTiles.length);
        console.log('[TileEditor] All tiles categoryIds:', originalTiles.map(t => t.categoryId));
        
        // Try different matching strategies
        let tiles = originalTiles.filter(tile => {
            const tileCategoryId = parseInt(tile.categoryId);
            const matches = tileCategoryId === numericBiomeId;
            console.log(`[TileEditor] Tile ${tile.name}: categoryId=${tile.categoryId} (${typeof tile.categoryId}), matches=${matches}`);
            return matches;
        });
        
        // If no tiles found, try matching by category name
        if (tiles.length === 0) {
            const category = this.categories.find(cat => cat.id === numericBiomeId);
            if (category) {
                console.log(`[TileEditor] No tiles found for categoryId, trying category name: ${category.name}`);
                tiles = originalTiles.filter(tile => 
                    tile.categoryName === category.name || 
                    tile.name.toLowerCase().includes(category.name.toLowerCase())
                );
                console.log(`[TileEditor] Found ${tiles.length} tiles by category name`);
            }
        }
        
        // If still no tiles found, show all tiles for debugging
        if (tiles.length === 0) {
            console.log('[TileEditor] No tiles found, showing all tiles for debugging');
            tiles = originalTiles.slice(0, 5); // Show first 5 tiles for debugging
        }
        
        console.log('[TileEditor] Displaying', tiles.length, 'tiles as cards for biome ID:', biomeId, '(numeric:', numericBiomeId, ')');
        console.log('[TileEditor] Available tiles:', originalTiles.map(t => ({ id: t.id, name: t.name, categoryId: t.categoryId, categoryIdType: typeof t.categoryId })));
        console.log('[TileEditor] Filtered tiles for biome ID', biomeId, ':', tiles.map(t => ({ id: t.id, name: t.name, categoryId: t.categoryId, categoryIdType: typeof t.categoryId })));
         
         // DEBUG: Log container element
         console.log('[TileEditor] Container element:', container);
         console.log('[TileEditor] Container innerHTML before clear:', container.innerHTML.substring(0, 200));
         
         // Find the correct grid container within the category
         let gridContainer = container.querySelector('.tiles-grid');
         if (!gridContainer) {
             // If no grid found, create one
             gridContainer = document.createElement('div');
             gridContainer.className = 'tiles-grid';
             container.appendChild(gridContainer);
         }
         
         // Clear existing cards
         gridContainer.innerHTML = '';
         console.log('[TileEditor] Grid container cleared');
         
         // Add cards to the grid
         tiles.forEach(tile => {
             let tileImagePath = this.fixImagePath(tile.image);
             
             const cardElement = document.createElement('div');
             cardElement.className = 'tile-card';
             cardElement.setAttribute('data-tile-id', tile.id);
             cardElement.onclick = () => window.tileEditor.openTileModalFromBiome(tile.id);
             
             cardElement.innerHTML = `
                 <div class="tile-image-container">
                     <img src="${tileImagePath}" alt="${tile.name}" class="tile-thumbnail" />
                 </div>
                 <div class="tile-details">
                     <span class="tile-name">${tile.name}</span>
                 </div>
             `;
              
              gridContainer.appendChild(cardElement);
          });
          
          console.log('[TileEditor] Cards added to grid container');
         
         // Force apply styles immediately after setting HTML
         this.forceReapplyStyles();
     }

    // Restore saved view mode from localStorage
    restoreViewMode() {
        const savedMode = localStorage.getItem('tileEditorViewMode');
        console.log('[TileEditor] Restoring view mode from localStorage:', savedMode);
        
        if (savedMode && (savedMode === 'table' || savedMode === 'cards')) {
            console.log('[TileEditor] Restoring saved view mode:', savedMode);
            this.switchViewMode(savedMode);
        } else {
            // Default to table view
            console.log('[TileEditor] No saved view mode found, defaulting to table');
            this.switchViewMode('table');
        }
    }
}

// Global export for TileEditor class
if (typeof window !== 'undefined') {
    window.TileEditor = TileEditor;
}
