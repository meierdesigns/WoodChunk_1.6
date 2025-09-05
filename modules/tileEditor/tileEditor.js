/**
 * TileEditor Module - Handles tile editor functionality
 */
class TileEditor {
    constructor() {
        this.categories = [];
        this.tiles = [];
        this.selectedCategoryId = null;
        this.selectedTileId = null;
        this.isInitialized = false;
        this.debugMode = false;
        
        // Load CSS if not already loaded
        this.loadCSS();
        
        this.loadDebugMode();
    }

    loadCSS() {
        // Check if CSS is already loaded
        const existingCSS = document.querySelector('link[href*="tileEditor.css"]');
        if (!existingCSS) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/modules/tileEditor/tileEditor.css';
            cssLink.onload = () => console.log('[TileEditor] CSS loaded successfully');
            cssLink.onerror = () => console.error('[TileEditor] Failed to load CSS');
            document.head.appendChild(cssLink);
            console.log('[TileEditor] CSS loading initiated');
        } else {
            console.log('[TileEditor] CSS already loaded');
        }
    }

    // Debug utility functions
    loadDebugMode() {
        this.debugMode = true; // Force debug mode on for performance tracking
        const debugCheckbox = document.getElementById('debugMode');
        if (debugCheckbox) {
            debugCheckbox.checked = this.debugMode;
        }
    }

    saveDebugMode() {
        localStorage.setItem('tileEditorDebugMode', this.debugMode.toString());
    }

    debug(...args) {
        if (this.debugMode) {
            console.log(`[TileEditor ${Date.now()}]`, ...args);
        }
    }

    debugError(...args) {
        if (this.debugMode) {
            console.error(`[TileEditor ${Date.now()}]`, ...args);
        }
    }

    debugWarn(...args) {
        if (this.debugMode) {
            console.warn(`[TileEditor ${Date.now()}]`, ...args);
        }
    }

    // Update debug mode across all modules
    updateDebugMode() {
        // Update all manager instances
        if (this.modalManager) {
            this.modalManager.debugMode = this.debugMode;
            if (this.modalManager.cacheManager) {
                this.modalManager.cacheManager.debugMode = this.debugMode;
            }
            if (this.modalManager.tileDataManager) {
                this.modalManager.tileDataManager.debugMode = this.debugMode;
            }
            if (this.modalManager.uiManager) {
                this.modalManager.uiManager.debugMode = this.debugMode;
            }
            if (this.modalManager.imageUploadManager) {
                this.modalManager.imageUploadManager.debugMode = this.debugMode;
            }
        }
        
        // Update global debug mode for other modules
        window.tileEditorDebugMode = this.debugMode;
        
        // this.debug('Debug mode updated across all modules');
    }

    async initialize() {
        this.debug('🚀 TileEditor.initialize called');
        try {
            // Clear Badlands cache to remove old tile data
            this.clearBadlandsCache();
            
            // Wait for the module container to be available
            const moduleContainer = document.getElementById('tileEditorContainer');
            if (!moduleContainer) {
                this.debugError('❌ Module container not found');
                return;
            }

            // Listen for building images refresh events
            document.addEventListener('buildingImagesRefreshed', async (event) => {
                console.log('[TileEditor] Received building images refresh event:', event.detail);
                await this.reloadBiomeData('Buildings');
                this.updateTilesList();
                this.displayCategories(this.categories);
            });

            this.debug('📦 Module container found, initializing UIManager');
            
            // Initialize UIManager
            if (typeof UIManager !== 'undefined') {
                this.uiManager = new UIManager();
                this.debug('✅ UIManager initialized');
            } else {
                this.debugError('❌ UIManager class not found');
            }
            
            // ModalManager is initialized by index.js, so we don't need to initialize it here
            console.log('[TileEditor] ModalManager available:', !!this.modalManager);
            
            this.debug('📦 Starting tile assets loading');
            
            // Load tile assets
            await this.loadTileAssets();
            
            this.debug('✅ Tile assets loaded, initializing categories and tiles');
            
            // Initialize categories and tiles
            this.initializeCategories();
            this.initializeTiles();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.debug('✅ TileEditor initialization complete');
        } catch (error) {
            this.debugError('❌ Failed to initialize:', error);
        }
    }

    async loadTileAssets() {
        this.debug('🚀 loadTileAssets called');
        try {
            // FAST STARTUP: Use cached data or fallback immediately
            this.debug('⚡ Loading categories fast');
            this.categories = this.loadCategoriesFast();
            this.debug('⚡ Loading tiles fast');
            this.tiles = this.loadTilesFast();
            
            this.debug('📊 Categories loaded:', this.categories.length);
            this.debug('📊 Tiles loaded:', this.tiles.length);
            
            // Load full data immediately after UI is responsive
            this.debug('🔄 Starting background data loading immediately');
            this.loadFullDataInBackground();
            
        } catch (error) {
            this.debugError('❌ Failed to load tiles:', error);
        }
    }
    
    // ULTRA-FAST: Load categories from server-side cache
    loadCategoriesFast() {
        this.debug('⚡ loadCategoriesFast called');
        
        // Use cached categories from localStorage or fallback
        const cachedCategories = localStorage.getItem('tileEditor_categories');
        if (cachedCategories) {
            try {
                this.debug('📦 Using cached categories');
                return JSON.parse(cachedCategories);
            } catch (e) {
                this.debugError('❌ Invalid cached categories, using server cache');
                // Invalid cache, continue to server cache
            }
        }
        
        this.debug('🔄 Using server-side cache');
        // Fallback: Use server-side cache - make it synchronous for speed
        return this.loadCategoriesFromServerCache();
    }
    
    // Load categories from server-side cache
    loadCategoriesFromServerCache() {
        this.debug('🌐 Loading from server cache');
        
        // Try to get from server cache immediately
        try {
            // Use synchronous XMLHttpRequest for immediate loading
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/biomes/categories', false); // Synchronous
            xhr.send();
            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success && response.categories) {
                    this.debug('✅ Server cache loaded:', response.categories.length, 'categories');
                    // Cache in localStorage for next time
                    localStorage.setItem('tileEditor_categories', JSON.stringify(response.categories));
                    return response.categories;
                }
            }
        } catch (e) {
            this.debugError('❌ Server cache failed:', e);
        }
        
        this.debug('🔄 Using fallback: static biome config');
        // Final fallback: Use static biome config
        return this.createCategoriesFromBiomeConfig();
    }
    
    // ULTRA-FAST: Load tiles from server-side cache
    // REMOVED REDUNDANT: loadTilesFast - using TileEditor.js instead
    
    // Load tiles from server-side cache
    loadTilesFromServerCache() {
        this.debug('🌐 Loading tiles from server cache');
        
        // Try to get from server cache immediately
        try {
            // Use synchronous XMLHttpRequest for immediate loading
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/biomes/tiles', false); // Synchronous
            xhr.send();
            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success && response.tiles) {
                    this.debug('✅ Server cache loaded:', response.tiles.length, 'tiles');
                    // Cache in localStorage for next time
                    localStorage.setItem('tileEditor_tiles', JSON.stringify(response.tiles));
                    return response.tiles;
                }
            }
        } catch (e) {
            this.debugError('❌ Server cache failed:', e);
        }
        
        this.debug('🔄 Using fallback: empty tiles array');
        // Final fallback: Use empty tiles array for fast startup
        return [];
    }
    
    // Load full data in background after UI is responsive
    async loadFullDataInBackground() {
        try {
            // ULTRA-FAST: Load categories and tiles in parallel
            this.debug('🚀 Starting parallel data loading');
            
            const [fullCategories, fullTiles] = await Promise.all([
                this.loadCategoriesFromBiomeFolders(),
                this.loadTilesFromBiomeFolders()
            ]);
            
            this.categories = fullCategories;
            this.tiles = fullTiles;
            
            // Cache for next startup
            localStorage.setItem('tileEditor_categories', JSON.stringify(fullCategories));
            localStorage.setItem('tileEditor_tiles', JSON.stringify(fullTiles));
            
            // Update UI with full data
            if (this.uiManager && this.uiManager.displayCategories) {
                this.debug('🔄 Calling uiManager.displayCategories with full data');
                this.uiManager.displayCategories(fullCategories);
            }
            
            // PRELOAD: Cache all biome data for instant modal opening
            this.debug('⚡ Preloading biome data for instant modal access');
            await this.preloadBiomeData();
            
        } catch (error) {
            // console.('[TileEditor] Background data loading failed:', error);
        }
    }
    
    // ULTRA-FAST: Preload all biome data for instant modal access
    async preloadBiomeData() {
        try {
            const preloadPromises = this.categories.map(async (category) => {
                const cacheKey = `biomeData_${category.name}`;
                
                // Skip if already cached
                if (localStorage.getItem(cacheKey)) {
                    return;
                }
                
                // Preload biome data
                const biomeData = await this.loadBiomeData(category.name);
                if (biomeData) {
                    localStorage.setItem(cacheKey, JSON.stringify(biomeData));
                    this.debug(`⚡ Preloaded biome data for ${category.name}`);
                }
            });
            
            // Wait for all preloads to complete
            await Promise.allSettled(preloadPromises);
            this.debug('✅ All biome data preloaded');
            
        } catch (error) {
            this.debugError('❌ Biome preloading failed:', error);
        }
    }

    async loadCategoriesFromBiomeFolders() {
        // Skip server request for faster loading - use fallback immediately
        return await this.createCategoriesFromBiomeConfig();
    }

    async loadTilesFromBiomeFolders() {
        const tiles = [];
        let id = 1;
        
        // ULTRA-FAST: Load all biome tiles in parallel instead of sequentially
        this.debug('🚀 Loading biome tiles in parallel for maximum speed');
        
        if (!this.categories || this.categories.length === 0) {
            this.debug('⚠️ No categories available, using fallback');
            return [];
        }
        
        // Create parallel loading promises for all categories
        const tilePromises = this.categories.map(async (category) => {
            try {
                const biomeTiles = await this.loadTilesFromBiomeFolder(category);
                return biomeTiles.map(tile => ({
                    id: id++,
                    name: tile.name,
                    categoryId: category.id,
                    image: tile.image,
                    movementCost: tile.movementCost || 1,
                    defenseBonus: tile.defenseBonus || 0,
                    resources: tile.resources || '',
                    description: tile.description || `Tile aus ${category.name}`
                }));
            } catch (error) {
                this.debugError(`❌ Could not load tiles for ${category.name}:`, error);
                return [];
            }
        });
        
        // Wait for all parallel loads to complete
        const results = await Promise.allSettled(tilePromises);
        
        // Combine all results
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                tiles.push(...result.value);
            }
        });
        
        this.debug(`✅ Loaded ${tiles.length} tiles in parallel from ${this.categories.length} categories`);
        return tiles;
    }

    async loadTilesFromBiomeFolder(category) {
        const tiles = [];
        
        try {
            // First try to load from biomeData.js
            const biomeData = await this.loadBiomeData(category.name);
            if (biomeData && biomeData.tiles) {
                return biomeData.tiles.map(tile => ({
                    name: tile.name,
                    image: tile.image,
                    movementCost: tile.movementCost || 1,
                    defenseBonus: tile.defenseBonus || 0,
                    resources: tile.resources || '',
                    description: tile.description || `Tile aus ${category.name}`
                }));
            }
        } catch (error) {
            // console.(`[TileEditor] Could not load biome data for ${category.name}:`, error);
        }
        
        // Fallback: Use mock tiles removed - using actual tile data
        
        return tiles;
    }

    // Mock tiles function removed - using actual tile data

    // ULTRA-FAST STARTUP: Replace eval() with safe JSON parsing
    async loadBiomeData(biomeName) {
        try {
            // INSTANT: Use cached data first for maximum speed
            const cachedData = localStorage.getItem(`biomeData_${biomeName}`);
            if (cachedData) {
                try {
                    // SAFE PARSING: Use JSON.parse instead of eval()
                    const parsedData = this.parseBiomeDataSafely(cachedData);
                    if (parsedData) {
                        this.debug(`⚡ Using cached biome data for ${biomeName}`);
                        return parsedData;
                    }
                } catch (e) {
                    // Invalid cache, continue to network
                    this.debugError(`❌ Invalid cached data for ${biomeName}:`, e);
                }
            }
            
            // FAST NETWORK: Use fetch with aggressive caching
            const response = await fetch(`assets/biomes/${biomeName}/biomeData.js`, {
                cache: 'force-cache', // AGGRESSIVE CACHING
                headers: {
                    'Cache-Control': 'max-age=86400' // Cache for 24 hours
                }
            });
            
            if (response.ok) {
                const jsContent = await response.text();
                
                // SAFE PARSING: Use JSON.parse instead of eval()
                const biomeData = this.parseBiomeDataSafely(jsContent);
                if (biomeData) {
                    // Cache the result immediately
                    localStorage.setItem(`biomeData_${biomeName}`, jsContent);
                    this.debug(`✅ Loaded and cached biome data for ${biomeName}`);
                    return biomeData;
                }
            }
        } catch (error) {
            this.debugError(`❌ Could not load biome data for ${biomeName}:`, error);
        }
        return null;
    }
    
    // SAFE PARSING: Replace eval() with JSON.parse
    parseBiomeDataSafely(jsContent) {
        try {
            // Extract the data from the JS file
            const dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*});/);
            if (dataMatch) {
                // SAFE: Use JSON.parse instead of eval()
                return JSON.parse(dataMatch[1]);
            }
        } catch (error) {
            // console.('[TileEditor] Failed to parse biome data safely:', error);
        }
        return null;
    }

    async saveBiomeSettings(biomeName, biomeData) {
        try {
            const jsContent = `// Biome data for ${biomeName}
// Generated by TileEditor
window.BIOME_DATA = ${JSON.stringify(biomeData, null, 2)};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.BIOME_DATA;
}`;

            // Store in localStorage as backup
            localStorage.setItem(`biomeData_${biomeName}`, jsContent);
            
            // Send file to server to save in assets folder
            const response = await fetch('/api/save-biome-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: biomeName,
                    fileContent: jsContent
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            return true;
        } catch (error) {
            // console.(`[TileEditor] Failed to save biome data for ${biomeName}:`, error);
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
                color: biomeSettings?.color || this.getColorForBiome(folder.name),
                description: biomeSettings?.description || this.getDescriptionForBiome(folder.name),
                folderPath: folder.path,
                icon: this.getFolderIcon(folder.name)
            };
            categories.push(category);
        }
        
        return categories;
    }

    createCategoriesFromBiomeConfig() {
        const categories = [];
        let id = 1;
        
        // Standard Biome-Ordner basierend auf der aktuellen Struktur
        const biomeFolders = [
            'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean'
        ];
        
        biomeFolders.forEach(folderName => {
            const category = {
                id: id++,
                name: folderName,
                type: 'biome',
                color: this.getColorForBiome(folderName),
                description: this.getDescriptionForBiome(folderName),
                folderPath: `assets/biomes/${folderName}`,
                icon: this.getFolderIcon(folderName)
            };
            categories.push(category);
        });
        
        return categories;
    }

    determineTypeFromFolder(folderName) {
        const biomeTypes = ['forest', 'wald', 'mountain', 'gebirge', 'water', 'wasser', 'desert', 'wüste'];
        const terrainTypes = ['cave', 'höhle', 'swamp', 'sumpf', 'volcano', 'vulkan'];
        
        const lowerName = folderName.toLowerCase();
        
        if (biomeTypes.some(type => lowerName.includes(type))) {
            return 'biome';
        } else if (terrainTypes.some(type => lowerName.includes(type))) {
            return 'terrain';
        } else {
            return 'special';
        }
    }

    getColorForBiome(biomeName) {
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

        };
        
        const lowerName = folderName.toLowerCase();
        return iconMap[lowerName] || '📁';
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    editTile(tileId) {
        this.openTileModal(tileId);
    }



    loadMockTiles() {
        return [
            {
                id: 1,
                name: 'Eichenwald',
                categoryId: 1,
                image: 'assets/tiles/terrain/Forest/Slice 1.png',
                movementCost: 2,
                defenseBonus: 1,
                resources: 'Holz, Eicheln',
                description: 'Dichter Eichenwald mit hohen Bäumen'
            },
            {
                id: 2,
                name: 'Kiefernwald',
                categoryId: 1,
                image: 'assets/tiles/terrain/Forest/Slice 2.png',
                movementCost: 2,
                defenseBonus: 1,
                resources: 'Holz, Harz',
                description: 'Kiefernwald mit aromatischem Duft'
            }
        ];
    }

    initializeCategories() {
        this.debug('🏗️ initializeCategories called');
        
        // Try to load saved category order
        const orderLoaded = this.loadCategoryOrder();
        
        // Use UIManager if available, otherwise fallback to direct DOM manipulation
        if (this.uiManager && this.uiManager.displayCategories) {
            this.debug('🎨 Using UIManager.displayCategories');
            this.uiManager.displayCategories(this.categories);
        } else {
            this.debug('⚠️ UIManager not available, using direct DOM manipulation');
            this.updateCategoriesList();
        }
        
        this.updateCategoryFilter();
    }

    initializeTiles() {
        const tilesList = document.getElementById('tilesList');
        if (tilesList) {
            this.updateTilesList();
        }
    }

    updateCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            // console.('[TileEditor] Categories list not found');
            return;
        }

        // Clear existing list
        categoriesList.innerHTML = '';

        // Add categories to list
        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.dataset.categoryId = category.id;
            
            if (this.selectedCategoryId === category.id) {
                categoryItem.classList.add('selected');
            }

            categoryItem.innerHTML = `
                <h4>${category.name}</h4>
                <span class="type ${category.type}">${this.getTypeName(category.type)}</span>
                <div style="color: ${category.color}; font-size: 0.8rem;">● ${category.color}</div>
            `;

            // Add click handler for category selection
            categoryItem.addEventListener('click', () => {
                this.selectCategory(category.id);
            });

            categoriesList.appendChild(categoryItem);
        });
    }

    updateTilesList(filteredTiles = null) {
        const tilesList = document.getElementById('tilesList');
        if (!tilesList) return;

        // Clear existing list
        tilesList.innerHTML = '';

        // Use provided filtered tiles or filter by selected category
        let tilesToShow = filteredTiles;
        if (tilesToShow === null) {
            tilesToShow = this.selectedCategoryId 
                ? this.tiles.filter(t => t.categoryId === this.selectedCategoryId)
                : this.tiles;
        }

        // Add tiles to list
        tilesToShow.forEach(tile => {
            const tileItem = document.createElement('div');
            tileItem.className = 'tile-item';
            tileItem.dataset.tileId = tile.id;
            
            if (this.selectedTileId === tile.id) {
                tileItem.classList.add('selected');
            }

            const category = this.categories.find(c => c.id === tile.categoryId);
            const categoryName = category ? category.name : 'Unbekannt';

            tileItem.innerHTML = `
                <h4>${tile.name}</h4>
                <span class="category">${categoryName}</span>
                <div class="stats">
                    Bewegung: ${tile.movementCost} | Verteidigung: +${tile.defenseBonus}
                </div>
            `;

            // Add click handler for tile selection
            tileItem.addEventListener('click', () => {
                this.selectTile(tile.id);
            });

            tilesList.appendChild(tileItem);
        });
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Clear existing options
        categoryFilter.innerHTML = '<option value="">Alle Kategorien</option>';

        // Add category options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });

        // Set selected value
        categoryFilter.value = this.selectedCategoryId || '';
    }



    selectCategory(categoryId) {
        // Remove previous selection
        const prevSelected = document.querySelector('.category-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add selection to current category
        const currentCategory = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (currentCategory) {
            currentCategory.classList.add('selected');
        }
        
        this.selectedCategoryId = categoryId;
        
        // Update tiles list and filter
        this.updateTilesList();
        this.updateCategoryFilter();
        
        // Update category preview
        this.updateCategoryPreview(categoryId);
    }

    selectTile(tileId) {
        // Remove previous selection
        const prevSelected = document.querySelector('.tile-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add selection to current tile
        const currentTile = document.querySelector(`[data-tile-id="${tileId}"]`);
        if (currentTile) {
            currentTile.classList.add('selected');
        }
        
        this.selectedTileId = tileId;
        
        // Update tile preview
        this.updateTilePreview(tileId);
    }

    updateCategoryPreview(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        const previewContainer = document.getElementById('tilePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="tile-preview-content">
                    <h4>${category.name}</h4>
                    <div class="tile-preview-stats">
                        <div class="stat-row">
                            <span class="stat-label">Typ:</span>
                            <span class="stat-value">${this.getTypeName(category.type)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Farbe:</span>
                            <span class="stat-value" style="color: ${category.color};">${category.color}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Beschreibung:</span>
                            <span class="stat-value">${category.description}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn btn-primary" onclick="window.tileEditor.openCategoryModal(${category.id})">Bearbeiten</button>
                        <button type="button" class="btn btn-danger" onclick="window.tileEditor.deleteCategory(${category.id})">Löschen</button>
                    </div>
                </div>
            `;
        }
    }

    updateTilePreview(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (!tile) return;

        const category = this.categories.find(c => c.id === tile.categoryId);
        const categoryName = category ? category.name : 'Unbekannt';

        const previewContainer = document.getElementById('tilePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="tile-preview-content">
                    <h4>${tile.name}</h4>
                    <div class="tile-preview-image">
                        <img src="${tile.image}" alt="${tile.name}" onerror="this.style.display='none'">
                    </div>
                    <div class="tile-preview-stats">
                        <div class="stat-row">
                            <span class="stat-label">Kategorie:</span>
                            <span class="stat-value">${categoryName}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Bewegungskosten:</span>
                            <span class="stat-value">${tile.movementCost}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Verteidigungsbonus:</span>
                            <span class="stat-value">+${tile.defenseBonus}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Ressourcen:</span>
                            <span class="stat-value">${tile.resources || 'Keine'}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Beschreibung:</span>
                            <span class="stat-value">${tile.description}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn btn-primary" onclick="window.tileEditor.openTileModal(${tile.id})">Bearbeiten</button>
                        <button type="button" class="btn btn-danger" onclick="window.tileEditor.deleteTile(${tile.id})">Löschen</button>
                    </div>
                </div>
            `;
        }
    }

    getTypeName(type) {
        const typeNames = {
            'terrain': 'Terrain',
            'biome': 'Biome',
            'special': 'Spezial'
        };
        return typeNames[type] || type;
    }

    createNewCategory() {
        // Generate new ID
        const newId = Math.max(...this.categories.map(c => c.id), 0) + 1;
        
        // Create default category
        const newCategory = {
            id: newId,
            name: 'Neue Kategorie',
            type: 'terrain',
            color: '#4CAF50',
            description: ''
        };
        
        this.categories.push(newCategory);
        this.updateCategoriesList();
        this.updateCategoryFilter();
        this.selectCategory(newId);
        
        // Open modal for editing
        this.openCategoryModal(newId);
    }

        createNewTile() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        // Generate new ID
        const newId = Math.max(...this.tiles.map(t => t.id), 0) + 1;
        
        // Create default tile
        const newTile = {
            id: newId,
            name: 'Neues Tile',
            categoryId: this.selectedCategoryId,
            image: '',
            movementCost: 1,
            defenseBonus: 0,
            resources: '',
            description: ''
        };
        
        this.tiles.push(newTile);
        this.updateTilesList();
        this.selectTile(newId);
        
        // Open modal for editing
        this.openTileModal(newId);
    }

    openCategoryModal(categoryId) {
        // Load category data into form
        this.loadCategoryIntoForm(categoryId);
        
        // Update modal title
        const modalTitle = document.getElementById('categoryModalTitle');
        if (modalTitle) {
            const category = this.categories.find(c => c.id === categoryId);
            modalTitle.textContent = category ? `Bearbeite ${category.name}` : 'Neue Kategorie';
        }
        
        // Show modal
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    openTileModal(tileId) {
        // Load tile data into form
        this.loadTileIntoForm(tileId);
        
        // Update modal title
        const modalTitle = document.getElementById('tileModalTitle');
        if (modalTitle) {
            const tile = this.tiles.find(t => t.id === tileId);
            modalTitle.textContent = tile ? `Bearbeite ${tile.name}` : 'Neues Tile';
        }
        
        // Show modal
        const modal = document.getElementById('tileModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    closeTileModal() {
        // this.debug('Closing tile modal');
        const modal = document.getElementById('tileModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async openBiomeModal(categoryId) {
        // this.debug('Opening biome modal for category:', categoryId);
        
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            // console.('[TileEditor] Category not found:', categoryId);
            return;
        }
        
        // Store the current category ID for biome operations
        this.selectedCategoryId = categoryId;
        
        // Load biome data into modal
        await this.loadBiomeIntoModal(category);
        
        // Show modal
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeBiomeModal() {
        // this.debug('Closing biome modal');
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    async loadBiomeIntoModal(category) {
        // Update modal title
        const modalTitle = document.getElementById('biomeModalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Biome verwalten: ${category.name}`;
        }
        
        // Update biome info
        const biomeName = document.getElementById('biomeName');
        if (biomeName) {
            biomeName.textContent = category.name;
        }
        
        const biomeMainImage = document.getElementById('biomeMainImage');
        if (biomeMainImage) {
            const imagePath = `/assets/biomes/${category.name}/${category.name}.png`;
            console.log('[TileEditor] Setting biome main image path:', imagePath);
            biomeMainImage.src = imagePath;
            biomeMainImage.alt = category.name;
            
            // Add error handling for image loading
            biomeMainImage.onerror = () => {
                console.warn('[TileEditor] Failed to load biome image:', imagePath);
                // TEMPORARY: Use a placeholder image
                biomeMainImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNTE4YTM4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Cb21lIFRpdGVsYmlsZDwvdGV4dD48L3N2Zz4=';
                biomeMainImage.style.display = 'block';
            };
            
            biomeMainImage.onload = () => {
                console.log('[TileEditor] Successfully loaded biome image:', imagePath);
            };
        }
        
        const biomeFolderPath = document.getElementById('biomeFolderPath');
        if (biomeFolderPath) {
            biomeFolderPath.textContent = category.folderPath;
        }
        
        const biomeDescription = document.getElementById('biomeDescription');
        if (biomeDescription) {
            biomeDescription.textContent = category.description || `Tiles aus ${category.name}`;
        }
        
        // Load tiles for this biome
        await this.loadBiomeTiles(category);
    }

    // Check if image file exists
    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            // this.debug('Image check failed:', imagePath, error);
            return false;
        }
    }

    // Correct image path for proper loading
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        let correctedPath = imagePath;
        
        // Ensure path starts with /
        if (!correctedPath.startsWith('/') && !correctedPath.startsWith('http')) {
            correctedPath = '/' + correctedPath;
        }
        
        // Add cache busting
        const timestamp = Date.now();
        correctedPath += (correctedPath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
        
        // this.debug('Corrected image path:', imagePath, '->', correctedPath);
        return correctedPath;
    }

    async loadBiomeTiles(category) {
        const startTime = performance.now();
        this.debug('Loading biome tiles for category:', category.name);
        
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            this.debugError('biomeTilesList element not found!');
            return;
        }
        
        // Show loading indicator
        biomeTilesList.innerHTML = '<div class="loading-indicator">🔄 Lade Tiles...</div>';
        
        try {
            // Load from biome config first
            const biomeData = await this.loadBiomeData(category.name);
            let allTiles = [];
            
            if (biomeData && biomeData.tiles && biomeData.tiles.length > 0) {
                allTiles = biomeData.tiles.map(tile => ({
                    ...tile,
                    categoryName: category.name,
                    source: 'biomeConfig'
                }));
                this.debug(`✅ Loaded tiles from biome config for ${category.name}: ${allTiles.length} tiles`);
            } else {
                this.debug(`⚠️ No tiles found in biome config for ${category.name}`);
            }
            
            // Update tile count immediately
            this.updateTileCount(allTiles.length);
            
            // INTEGRATE BIOME TABLE COMPONENT
            if (window.BiomeTableComponent && window.BiomeTableComponent.isAvailable()) {
                this.debug('🎴 Using BiomeTableComponent for rendering');
                
                // Create or get existing table component
                if (!this.biomeTableComponent) {
                    this.biomeTableComponent = new BiomeTableComponent(null, {
                        containerId: 'biomeTilesList',
                        debug: this.debugMode,
                        eventPrefix: 'tileEditorBiomeTable',
                        biomeType: category.type || 'terrain'
                    });
                }
                
                // Load tiles into component
                await this.biomeTableComponent.loadTiles({
                    name: category.name,
                    type: category.type || 'terrain',
                    tiles: allTiles
                });
                
                // Setup view toggle listeners
                this.setupBiomeTableComponentListeners();
                
            } else {
                this.debug('📊 Using legacy table rendering');
                
                // OPTIMIZED: Use document fragment for faster DOM manipulation
                const fragment = document.createDocumentFragment();
                
                // Create all tile elements in batch
                allTiles.forEach(tile => {
                    const tileElement = this.createTileElement(tile, category);
                    fragment.appendChild(tileElement);
                });
                
                // Clear and append all at once
                biomeTilesList.innerHTML = '';
                biomeTilesList.appendChild(fragment);
            }
            
            const loadTime = Math.round(performance.now() - startTime);
            this.debug(`✅ Biome tiles loaded in ${loadTime}ms: ${allTiles.length} tiles`);
            
            // Update global state
            this.tiles = allTiles;
            
        } catch (error) {
            this.debugError('Error loading biome tiles:', error);
            biomeTilesList.innerHTML = '<div class="error-indicator">❌ Fehler beim Laden der Tiles</div>';
        }
    }

    setupBiomeTableComponentListeners() {
        if (!this.biomeTableComponent) return;
        
        this.debug('🔗 Setting up BiomeTableComponent listeners');
        
        // View toggle buttons - REMOVED: These conflict with TileEditor.js event delegation
        // The buttons are now handled by event delegation in TileEditor.js
        
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.biomeTableComponent.filterTiles(filter);
                this.updateFilterTabs(filter);
            });
        });
        
        // Action buttons
        const addTileBtn = document.getElementById('addTileToBiome');
        const importTilesBtn = document.getElementById('importTilesToBiome');
        const cleanTilesBtn = document.getElementById('cleanTilesBtn');
        
        if (addTileBtn) {
            addTileBtn.addEventListener('click', () => {
                this.biomeTableComponent.addTile();
            });
        }
        
        if (importTilesBtn) {
            importTilesBtn.addEventListener('click', () => {
                this.biomeTableComponent.importTiles();
            });
        }
        
        if (cleanTilesBtn) {
            cleanTilesBtn.addEventListener('click', () => {
                this.biomeTableComponent.cleanTiles();
            });
        }
        
        // Component events
        this.biomeTableComponent.on('tileSelected', (tileId) => {
            this.debug('Tile selected:', tileId);
        });
        
        this.biomeTableComponent.on('editTile', (tile) => {
            this.debug('Edit tile:', tile.name);
            this.openTileEditor(tile);
        });
        
        this.biomeTableComponent.on('deleteTile', (tile) => {
            this.debug('Delete tile:', tile.name);
            this.deleteTileFromBiome(tile);
        });
        
        this.biomeTableComponent.on('viewTile', (tile) => {
            this.debug('View tile:', tile.name);
        });
    }

    // REMOVED: Duplicate updateViewButtons function - now handled by TileEditor.js

    updateFilterTabs(activeFilter) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === activeFilter);
        });
    }
    
    // Helper methods for optimized loading
    async loadTilesFromLocalStorage(categoryName) {
        try {
            const storedTiles = localStorage.getItem(`biome_tiles_${categoryName.toLowerCase()}`);
            return storedTiles ? JSON.parse(storedTiles) : [];
        } catch (error) {
            this.debugError('Error loading from localStorage:', error);
            return [];
        }
    }
    
    async loadTilesFromGlobal(categoryName) {
        try {
            const globalTilesList = window[`${categoryName}TilesList`];
            return globalTilesList && Array.isArray(globalTilesList) ? globalTilesList : [];
        } catch (error) {
            this.debugError('Error loading from global:', error);
            return [];
        }
    }
    
    // FAST: Skip tilesList.js loading for better performance
    async loadTilesList(biomeName) {
        console.log(`[TileEditor] Skipping tilesList.js loading for ${biomeName} - using fallback`);
        return [];
    }
    
    combineTilesEfficiently(tilesList, localStorageTiles, globalTiles, categoryName) {
        const tileMap = new Map();
        
        // Add tiles from tilesList first (highest priority)
        tilesList.forEach(tile => {
            const key = tile.name || tile.image;
            if (key && !tileMap.has(key)) {
                tileMap.set(key, { ...tile, source: 'tilesList' });
            }
        });
        
        // Add localStorage tiles
        localStorageTiles.forEach(tile => {
            const key = tile.name || tile.image;
            if (key && !tileMap.has(key)) {
                tileMap.set(key, { 
                    ...tile, 
                    isUnassigned: false,
                    categoryName: categoryName,
                    source: 'localStorage'
                });
            }
        });
        
        // Add global tiles
        globalTiles.forEach(tile => {
            const key = tile.name || tile.image;
            if (key && !tileMap.has(key)) {
                tileMap.set(key, { 
                    ...tile, 
                    isUnassigned: false,
                    categoryName: categoryName,
                    source: 'globalVariable'
                });
            }
        });
        
        return Array.from(tileMap.values());
    }
    
    createTileElement(tile, category) {
        const tileItem = document.createElement('div');
        tileItem.className = 'biome-tile-item';
        tileItem.dataset.tileId = tile.id || tile.tempId || Math.random();
        
        // OPTIMIZED: Use template literal for faster string concatenation
        tileItem.innerHTML = `
            <div class="tile-actions">
                <button type="button" class="tile-action-btn" onclick="window.tileEditor.openTileModalFromBiome('${tile.id || tile.tempId}')" title="Tile bearbeiten">✏️</button>
                <button type="button" class="tile-action-btn" onclick="window.tileEditor.removeTileFromBiome('${tile.id || tile.tempId}')" title="Entfernen">❌</button>
            </div>
            <div class="tile-image-container">
                <div class="tile-loading">Laden...</div>
                <img src="${encodeURI(tile.image)}" alt="${tile.name}"
                     onerror="this.style.display='none';"
                     onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
            </div>
            <div class="tile-info">
                <div class="tile-name">${tile.name}</div>
                <div class="tile-description">${tile.description || ''}</div>
            </div>
        `;
        
        return tileItem;
    }
    
    updateTileCount(count) {
        const biomeTileCount = document.getElementById('biomeTileCount');
        if (biomeTileCount) {
            biomeTileCount.textContent = `${count} Tiles`;
        }
    }
    }

    selectBiomeTile(tileId) {
        // Remove previous selection
        const prevSelected = document.querySelector('.biome-tile-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add selection to current tile
        const currentTile = document.querySelector(`.biome-tile-item[data-tile-id="${tileId}"]`);
        if (currentTile) {
            currentTile.classList.add('selected');
        }
    }

    openTileModalFromBiome(tileId) {
        console.log('[TileEditor] openTileModalFromBiome called with tileId:', tileId);
        console.log('[TileEditor] TileEditor instance:', this);
        console.log('[TileEditor] ModalManager available:', !!this.modalManager);
        
        // Close biome modal first
        this.closeBiomeModal();
        
        // Open tile modal for editing
        this.openTileModal(tileId);
    }

    openTileModal(tileId) {
        console.log('[TileEditor] openTileModal called with tileId:', tileId);
        // Use ModalManager if available
        if (this.modalManager && this.modalManager.openTileModal) {
            console.log('[TileEditor] Calling modalManager.openTileModal');
            this.modalManager.openTileModal(tileId);
        } else {
            console.error('[TileEditor] ModalManager.openTileModal not available');
            this.debugError('ModalManager.openTileModal not available');
        }
    }

    editBiomeTile(tileId) {
        // Close biome modal
        this.closeBiomeModal();
        
        // Open tile modal for editing
        this.openTileModal(tileId);
    }

    removeTileFromBiome(tileId) {
        if (confirm('Möchtest du dieses Tile wirklich aus dem Biome entfernen?')) {
            // Get the tile and category before removing
            const tileToRemove = this.tiles.find(t => t.id === tileId);
            const currentCategory = this.categories.find(c => c.id === this.selectedCategoryId);
            
            if (!tileToRemove || !currentCategory) {
                this.showToast('Fehler: Tile oder Kategorie nicht gefunden', 'error');
                return;
            }
            
            // Remove tile from tiles array
            this.tiles = this.tiles.filter(t => t.id !== tileId);
            
            // Reload biome tiles
            this.loadBiomeTiles(currentCategory);
            
            // Save the updated biome data to file immediately
            this.saveBiomeCategory(currentCategory).then(success => {
                if (success) {
                    this.showToast('Tile aus Biome entfernt und gespeichert!', 'success');
                    
                    // Force reload biome data to ensure consistency
                    this.forceReloadBiomeData(currentCategory.name);
                } else {
                    // console.('[TileEditor] Failed to update biome data after tile removal');
                    this.showToast('Fehler beim Speichern der Änderungen', 'error');
                }
            });
            
            // Update main tiles list
            this.updateTilesList();
        }
    }

    addTileToBiome() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        // Close biome modal
        this.closeBiomeModal();
        
        // Create new tile
        this.createNewTile();
    }

    importTilesToBiome() {
        // this.debug('Importing tiles to biome');
        
        // Create file input for multiple images
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.processImportedTiles(files);
        });
        
        fileInput.click();
    }

    processImportedTiles(files) {
        // this.debug('Processing imported tiles:', files.length);
        
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        const category = this.categories.find(c => c.id === this.selectedCategoryId);
        if (!category) return;
        
        files.forEach((file, index) => {
            // Generate new tile ID
            const newId = Math.max(...this.tiles.map(t => t.id), 0) + 1 + index;
            
            // Create tile name from filename
            const tileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            
            // Create new tile
            const newTile = {
                id: newId,
                name: tileName,
                categoryId: this.selectedCategoryId,
                image: `/assets/biomes/${category.name}/tiles/${file.name}`,
                movementCost: 1,
                defenseBonus: 0,
                resources: '',
                description: `Importiertes Tile: ${tileName}`
            };
            
            this.tiles.push(newTile);
        });
        
        // Reload biome tiles
        this.loadBiomeTiles(category);
        
        // Update main tiles list
        this.updateTilesList();
        
        // this.debug('Imported tiles processed');
        this.showToast(`${files.length} Tiles wurden zum Biome hinzugefügt!`, 'success');
    }

    saveBiomeChanges() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        const category = this.categories.find(c => c.id === this.selectedCategoryId);
        if (!category) return;
        
        // Save biome data and close modal
        this.saveBiomeCategory(category).then(success => {
            if (success) {
                this.showToast('Biome-Änderungen wurden gespeichert!', 'success');
                
                // Force reload biome data to ensure consistency
                this.forceReloadBiomeData(category.name);
            } else {
                // console.('[TileEditor] Failed to save biome changes');
                this.showToast('Fehler beim Speichern der Biome-Änderungen', 'error');
            }
            // Always close the biome modal after save attempt
            this.closeBiomeModal();
        }).catch(error => {
            // console.('[TileEditor] Error during save:', error);
            this.showToast('Fehler beim Speichern der Biome-Änderungen', 'error');
            // Close modal even if there's an error
            this.closeBiomeModal();
        });
    }

    exportBiomeData() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        const category = this.categories.find(c => c.id === this.selectedCategoryId);
        if (!category) return;
        
        // Get tiles for this category
        const categoryTiles = this.tiles.filter(tile => tile.categoryId === category.id);
        
        const biomeData = {
            name: category.name,
            type: category.type,
            color: category.color,
            description: category.description,
            folderPath: category.folderPath,
            icon: category.icon,
            tiles: categoryTiles.map(tile => ({
                name: tile.name,
                image: tile.image,
                movementCost: tile.movementCost,
                defenseBonus: tile.defenseBonus,
                resources: tile.resources,
                description: tile.description
            }))
        };
        
        // Create download link
        const dataStr = JSON.stringify(biomeData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${category.name}_biome_data.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.showToast('Biome-Daten wurden exportiert!', 'success');
    }

    async checkTilesFolder() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle zuerst eine Kategorie aus', 'warning');
            return;
        }
        
        const category = this.categories.find(c => c.id === this.selectedCategoryId);
        if (!category) {
            this.showToast('Kategorie nicht gefunden', 'error');
            return;
        }
        
        try {
            // Construct the tiles folder path
            const tilesFolderPath = `/assets/biomes/${category.name}/tiles/`;
            
            // Try to fetch the tiles folder listing
            const response = await fetch(tilesFolderPath, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            
            if (response.ok) {
                const html = await response.text();
                
                // Parse the HTML to extract file listings
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = doc.querySelectorAll('a[href]');
                
                const files = [];
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('../') && !href.startsWith('./') && href !== '/') {
                        files.push(href);
                    }
                });
                
                // Filter for image files
                const imageFiles = files.filter(file => 
                    file.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
                );
                
                // Show results in a modal
                this.showTilesFolderResults(category.name, tilesFolderPath, imageFiles, files);
                
            } else {
                // Try to check if the folder exists by checking for common files
                const commonFiles = ['tilesList.js', 'Slice_1.png', 'tile_1.png'];
                const foundFiles = [];
                
                for (const file of commonFiles) {
                    try {
                        const fileResponse = await fetch(`${tilesFolderPath}${file}`, { method: 'HEAD' });
                        if (fileResponse.ok) {
                            foundFiles.push(file);
                        }
                    } catch (e) {
                        // File doesn't exist
                    }
                }
                
                if (foundFiles.length > 0) {
                    this.showTilesFolderResults(category.name, tilesFolderPath, foundFiles, foundFiles);
                } else {
                    this.showToast(`Tiles-Ordner für ${category.name} ist leer oder nicht zugänglich`, 'warning');
                }
            }
            
        } catch (error) {
            // console.('[TileEditor] Error checking tiles folder:', error);
            this.showToast(`Fehler beim Prüfen des Tiles-Ordners: ${error.message}`, 'error');
        }
    }

    showTilesFolderResults(biomeName, folderPath, imageFiles, allFiles) {
        // Create modal content
        const modalContent = `
            <div class="modal-content modal-medium">
                <div class="modal-header">
                    <h3>📁 Tiles-Ordner: ${biomeName}</h3>
                    <button type="button" class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 16px;">
                        <strong>Ordner-Pfad:</strong> ${folderPath}
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <strong>Gefundene Bilddateien (${imageFiles.length}):</strong>
                        <div style="max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; margin-top: 8px;">
                            ${imageFiles.length > 0 ? 
                                imageFiles.map(file => `<div style="padding: 2px 0;">📄 ${file}</div>`).join('') :
                                '<div style="color: #ff6b6b;">Keine Bilddateien gefunden</div>'
                            }
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <strong>Alle Dateien (${allFiles.length}):</strong>
                        <div style="max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; margin-top: 8px;">
                            ${allFiles.length > 0 ? 
                                allFiles.map(file => `<div style="padding: 2px 0;">📄 ${file}</div>`).join('') :
                                '<div style="color: #ff6b6b;">Keine Dateien gefunden</div>'
                            }
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Schließen</button>
                    </div>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadCategoryIntoForm(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        // Populate form fields
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryType').value = category.type;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('categoryDescription').value = category.description || '';
    }

    loadTileIntoForm(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (!tile) return;

        // Populate form fields
        document.getElementById('tileName').value = tile.name;
        document.getElementById('tileCategory').value = tile.categoryId;
        document.getElementById('tileMovementCost').value = tile.movementCost;
        document.getElementById('tileDefenseBonus').value = tile.defenseBonus;
        document.getElementById('tileResources').value = tile.resources || '';
        document.getElementById('tileDescription').value = tile.description || '';

        // Update category options
        this.updateTileCategoryOptions();
    }

    updateTileCategoryOptions() {
        const tileCategorySelect = document.getElementById('tileCategory');
        if (!tileCategorySelect) return;

        // Clear existing options
        tileCategorySelect.innerHTML = '';

        // Add category options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            tileCategorySelect.appendChild(option);
        });
    }

    saveCategory() {
        // this.debug('Saving category...');
        
        if (!this.selectedCategoryId) {
            alert('Bitte wähle eine Kategorie aus oder erstelle eine neue');
            return;
        }
        
        // Get form data
        const formData = new FormData(document.getElementById('categoryForm'));
        const categoryData = {
            id: this.selectedCategoryId,
            name: formData.get('categoryName'),
            type: formData.get('categoryType'),
            color: formData.get('categoryColor'),
            description: formData.get('categoryDescription')
        };

        // Update category
        const categoryIndex = this.categories.findIndex(c => c.id === this.selectedCategoryId);
        if (categoryIndex !== -1) {
            this.categories[categoryIndex] = categoryData;
            this.updateCategoriesList();
            this.updateCategoryFilter();
            this.updateCategoryPreview(this.selectedCategoryId);
            
            // Save biome data to file
            this.saveBiomeCategory(categoryData).then(success => {
                if (success) {
                    // this.debug('Biome data saved to file');
                } else {
                    // console.('[TileEditor] Failed to save biome data to file');
                }
            });
            
            // Close modal
            this.closeCategoryModal();
            
            this.showToast('Kategorie gespeichert!', 'success');
            // this.debug('Category saved:', categoryData);
        }
    }

    async saveTile() {
        // this.debug('Saving tile...');
        
        if (!this.selectedTileId) {
            alert('Bitte wähle ein Tile aus oder erstelle ein neues');
            return;
        }
        
        // Get form data
        const formData = new FormData(document.getElementById('tileForm'));
        const tileData = {
            id: this.selectedTileId,
            name: formData.get('tileName'),
            categoryId: parseInt(formData.get('tileCategory')),
            image: formData.get('tileImage') || this.tiles.find(t => t.id === this.selectedTileId)?.image || '',
            movementCost: parseInt(formData.get('tileMovementCost')),
            defenseBonus: parseInt(formData.get('tileDefenseBonus')),
            resources: formData.get('tileResources'),
            description: formData.get('tileDescription')
        };

        // Update tile in local array
        const tileIndex = this.tiles.findIndex(t => t.id === this.selectedTileId);
        if (tileIndex !== -1) {
            this.tiles[tileIndex] = tileData;
            
            // Get the category for this tile
            const category = this.categories.find(c => c.id === tileData.categoryId);
            if (category) {
                // Save updated tiles list to file
                const success = await this.saveBiomeTiles(category.name, this.tiles.filter(t => t.categoryId === category.id));
                if (success) {
                    // this.debug('Tiles saved to file for category:', category.name);
                } else {
                    // console.('[TileEditor] Failed to save tiles to file for category:', category.name);
                    this.showToast('Fehler beim Speichern der Tiles', 'error');
                    return;
                }
            }
            
            this.updateTilesList();
            this.updateTilePreview(this.selectedTileId);
            
            // Close modal
            this.closeTileModal();
            
            this.showToast('Tile gespeichert!', 'success');
            // this.debug('Tile saved:', tileData);
        }
    }

    deleteCategory() {
        if (!this.selectedCategoryId) {
            this.showToast('Bitte wähle eine Kategorie aus', 'warning');
            return;
        }

        if (confirm('Möchtest du diese Kategorie wirklich löschen? Alle zugehörigen Tiles werden ebenfalls gelöscht.')) {
            // Get the category before deleting
            const categoryToDelete = this.categories.find(c => c.id === this.selectedCategoryId);
            
            // Delete category and associated tiles
            this.categories = this.categories.filter(c => c.id !== this.selectedCategoryId);
            this.tiles = this.tiles.filter(t => t.categoryId !== this.selectedCategoryId);
            
            this.selectedCategoryId = null;
            this.selectedTileId = null;
            
            this.updateCategoriesList();
            this.updateCategoryFilter();
            this.updateTilesList();
            
            // Clear preview
            const previewContainer = document.getElementById('tilePreview');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="preview-placeholder">
                        <p>Wähle eine Kategorie aus um Details zu sehen</p>
                    </div>
                `;
            }
            
            // Save the updated biome data to file
            if (categoryToDelete) {
                this.saveBiomeCategory(categoryToDelete).then(success => {
                    if (success) {
                        // this.debug('Biome data updated after category deletion');
                    } else {
                        // console.('[TileEditor] Failed to update biome data after category deletion');
                    }
                });
            }
            
            this.showToast('Kategorie gelöscht!', 'success');
            // this.debug('Category deleted');
        }
    }

    deleteTile() {
        if (!this.selectedTileId) {
            this.showToast('Bitte wähle ein Tile aus', 'warning');
            return;
        }

        if (confirm('Möchtest du dieses Tile wirklich löschen?')) {
            // Get the tile and its category before deleting
            const tileToDelete = this.tiles.find(t => t.id === this.selectedTileId);
            const category = this.categories.find(c => c.id === tileToDelete?.categoryId);
            
            if (!tileToDelete || !category) {
                this.showToast('Fehler: Tile oder Kategorie nicht gefunden', 'error');
                return;
            }
            
            this.tiles = this.tiles.filter(t => t.id !== this.selectedTileId);
            this.selectedTileId = null;
            this.updateTilesList();
            
            // Clear preview
            const previewContainer = document.getElementById('tilePreview');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="preview-placeholder">
                        <p>Wähle ein Tile aus um Details zu sehen</p>
                    </div>
                `;
            }
            
            // Save the updated biome data to file immediately
            this.saveBiomeCategory(category).then(success => {
                if (success) {
                    // this.debug('Biome data updated after tile deletion');
                    this.showToast('Tile gelöscht und gespeichert!', 'success');
                    
                    // Force reload biome data to ensure consistency - IMMEDIATE
                    this.forceReloadBiomeData(category.name);
                } else {
                    // console.('[TileEditor] Failed to update biome data after tile deletion');
                    this.showToast('Fehler beim Speichern der Änderungen', 'error');
                }
            });
            
            // this.debug('Tile deleted');
        }
    }

    setupEventListeners() {
        
        // Category controls
        const newCategoryBtn = document.getElementById('newCategory');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => this.createNewCategory());
        }

        // Reset category order button
        const resetOrderBtn = document.getElementById('resetCategoryOrder');
        if (resetOrderBtn) {
            resetOrderBtn.addEventListener('click', () => this.resetCategoryOrder());
        }

        // Save all biome data button
        const saveAllBiomesBtn = document.getElementById('saveAllBiomes');
        if (saveAllBiomesBtn) {
            saveAllBiomesBtn.addEventListener('click', () => this.saveAllBiomeData());
        }

        // Refresh building images button
        const refreshBuildingImagesBtn = document.getElementById('refreshBuildingImages');
        if (refreshBuildingImagesBtn) {
            refreshBuildingImagesBtn.addEventListener('click', async () => {
                await this.refreshBuildingImages();
            });
        }

        // Tile controls
        const newTileBtn = document.getElementById('newTile');
        if (newTileBtn) {
            newTileBtn.addEventListener('click', () => this.createNewTile());
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategoryId = e.target.value ? parseInt(e.target.value) : null;
                this.updateTilesList();
                this.updateCategoriesList();
            });
        }

        // Category modal controls
        const closeCategoryModalBtn = document.getElementById('closeCategoryModal');
        if (closeCategoryModalBtn) {
            closeCategoryModalBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        const cancelCategoryBtn = document.getElementById('cancelCategory');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => this.closeCategoryModal());
        }

        const saveCategoryBtn = document.getElementById('saveCategory');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => this.saveCategory());
        }

        const deleteCategoryBtn = document.getElementById('deleteCategory');
        if (deleteCategoryBtn) {
            deleteCategoryBtn.addEventListener('click', () => this.deleteCategory());
        }

        // Tile modal controls
        const closeTileModalBtn = document.getElementById('closeTileModal');
        if (closeTileModalBtn) {
            closeTileModalBtn.addEventListener('click', () => this.closeTileModal());
        }

        // Header biome filter
        const headerBiomeFilter = document.getElementById('headerBiomeFilter');
        if (headerBiomeFilter) {
            headerBiomeFilter.addEventListener('change', (e) => {
                this.filterByBiome(e.target.value);
            });
        }

        // Debug mode toggle
        const debugCheckbox = document.getElementById('debugMode');
        if (debugCheckbox) {
            debugCheckbox.addEventListener('change', (e) => {
                this.debugMode = e.target.checked;
                this.saveDebugMode();
                this.updateDebugMode();
                // this.debug('Debug mode', this.debugMode ? 'enabled' : 'disabled');
            });
        }



        // Sort controls event listeners
        this.setupSortEventListeners();

        const cancelTileBtn = document.getElementById('cancelTile');
        if (cancelTileBtn) {
            cancelTileBtn.addEventListener('click', () => this.closeTileModal());
        }

        const saveTileBtn = document.getElementById('saveTile');
        if (saveTileBtn) {
            saveTileBtn.addEventListener('click', async () => await this.saveTile());
        }

        const deleteTileBtn = document.getElementById('deleteTile');
        if (deleteTileBtn) {
            deleteTileBtn.addEventListener('click', () => this.deleteTile());
        }

        // Close modals when clicking outside
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal) {
            categoryModal.addEventListener('click', (e) => {
                if (e.target === categoryModal) {
                    this.closeCategoryModal();
                }
            });
        }

        const tileModal = document.getElementById('tileModal');
        if (tileModal) {
            tileModal.addEventListener('click', (e) => {
                if (e.target === tileModal) {
                    this.closeTileModal();
                }
            });
        }

        // Biome modal controls
        const closeBiomeModalHeaderBtn = document.getElementById('closeBiomeModalHeaderBtn');
        if (closeBiomeModalHeaderBtn) {
            closeBiomeModalHeaderBtn.addEventListener('click', () => this.closeBiomeModal());
        }

        const closeBiomeModalActionBtn = document.getElementById('closeBiomeModalActionBtn');
        if (closeBiomeModalActionBtn) {
            closeBiomeModalActionBtn.addEventListener('click', () => this.closeBiomeModal());
        }

        const addTileToBiomeBtn = document.getElementById('addTileToBiome');
        if (addTileToBiomeBtn) {
            addTileToBiomeBtn.addEventListener('click', () => this.addTileToBiome());
        }

        const importTilesToBiomeBtn = document.getElementById('importTilesToBiome');
        if (importTilesToBiomeBtn) {
            importTilesToBiomeBtn.addEventListener('click', () => this.importTilesToBiome());
        }

        const saveBiomeChangesBtn = document.getElementById('saveBiomeChanges');
        if (saveBiomeChangesBtn) {
            saveBiomeChangesBtn.addEventListener('click', () => this.saveBiomeChanges());
        }

        const exportBiomeDataBtn = document.getElementById('exportBiomeData');
        if (exportBiomeDataBtn) {
            exportBiomeDataBtn.addEventListener('click', () => this.exportBiomeData());
        }

        // Test progress counter button
        const testProgressCounterBtn = document.getElementById('testProgressCounter');
        if (testProgressCounterBtn) {
            testProgressCounterBtn.addEventListener('click', () => {
                if (this.uiManager && this.uiManager.testProgressCounter) {
                    this.uiManager.testProgressCounter();
                } else {
                    console.log('UIManager or testProgressCounter not available');
                }
            });
        }

        // Close biome modal when clicking outside
        const biomeModal = document.getElementById('biomeModal');
        if (biomeModal) {
            biomeModal.addEventListener('click', (e) => {
                if (e.target === biomeModal) {
                    this.closeBiomeModal();
                }
            });
        }

        // this.debug('Event listeners setup complete');
    }



    assignTile(tileId) {
        // this.debug('Assigning tile to category:', tileId);
        
        // Open assignment modal
        this.openAssignmentModal(tileId);
    }

    openAssignmentModal(tileId) {
        // this.debug('Opening assignment modal for tile:', tileId);
        
        // Create and show assignment modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Tile Kategorie zuweisen</h3>
                    <button type="button" class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="assignmentCategory">Kategorie auswählen:</label>
                        <select id="assignmentCategory" class="form-control">
                            <option value="">Kategorie wählen...</option>
                            ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-primary" onclick="window.tileEditor.confirmAssignment('${tileId}')">Zuweisen</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    confirmAssignment(tileId) {
        const categorySelect = document.getElementById('assignmentCategory');
        const categoryId = categorySelect.value;
        
        if (!categoryId) {
            this.showToast('Bitte wähle eine Kategorie aus', 'warning');
            return;
        }
        
                    // this.debug('Assigning tile:', tileId, 'to category:', categoryId);
        
        // Here you would implement the actual assignment logic
        // For now, just show a success message
        this.showToast('Tile erfolgreich der Kategorie zugewiesen!', 'success');
        
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
    }

    filterByBiome(biomeId) {
        // this.debug('Filtering by biome:', biomeId);
        
        if (!biomeId) {
            // Show all tiles
            this.updateTilesList();
            return;
        }

        // Filter tiles by specific biome
        const biomeTiles = this.getTilesByBiome(biomeId);
        this.updateTilesList(biomeTiles);
    }

    getTilesByBiome(biomeId) {
        if (window.BIOME_CONFIG && window.BIOME_CONFIG[biomeId]) {
            return window.BIOME_CONFIG[biomeId].tiles || [];
        }
        return [];
    }



    async refreshBiomeCategories() {
        // this.debug('Refreshing biome categories...');
        
        try {
            // Reload categories from folders
            this.categories = await this.loadCategoriesFromBiomeFolders();
            
            // Reload tiles
            this.tiles = await this.loadTilesFromBiomeFolders();
            
            // Update UI
            this.updateCategoriesList();
            this.updateCategoryFilter();
            this.updateTilesList();
            
            // Update header filter
            this.updateHeaderBiomeFilter();
            
            // Benachrichtige HexMap Editor über Änderungen
            if (window.updateHexMapBiomeOptions) {
                window.updateHexMapBiomeOptions();
            }
            
            // this.debug('Biome categories refreshed successfully');
            this.showToast('Biome-Kategorien wurden erfolgreich neu geladen!', 'success');
            
        } catch (error) {
            // console.('[TileEditor] Failed to refresh biome categories:', error);
            this.showToast('Fehler beim Neuladen der Biome-Kategorien', 'error');
        }
    }

    updateHeaderBiomeFilter() {
        const headerFilter = document.getElementById('headerBiomeFilter');
        if (!headerFilter) return;

        // Clear existing options
        headerFilter.innerHTML = '<option value="">Alle Biome</option>';
        
        // Add biome options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.biomeKey || category.name.toLowerCase();
            option.textContent = category.name;
            headerFilter.appendChild(option);
        });
    }

    setupSortEventListeners() {
        // this.debug('Setting up sort event listeners...');
        
        // Setup DOM event listeners immediately - NO DELAY
        // Category sort buttons
        const sortCategoriesByName = document.getElementById('sortCategoriesByName');
        const sortCategoriesByType = document.getElementById('sortCategoriesByType');
        const sortCategoriesByColor = document.getElementById('sortCategoriesByColor');

        // this.debug('Category sort buttons:', {
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

        // Tile sort buttons
        const sortTilesByName = document.getElementById('sortTilesByName');
        const sortTilesByCost = document.getElementById('sortTilesByCost');
        const sortTilesByRarity = document.getElementById('sortTilesByRarity');

        // this.debug('Tile sort buttons:', {
            sortTilesByName: !!sortTilesByName,
            sortTilesByCost: !!sortTilesByCost,
            sortTilesByRarity: !!sortTilesByRarity
        });

        if (sortTilesByName) {
            sortTilesByName.addEventListener('click', () => {
                // this.debug('Tile sort by name clicked');
                this.sortTiles('name');
            });
        }
        if (sortTilesByCost) {
            sortTilesByCost.addEventListener('click', () => {
                // this.debug('Tile sort by cost clicked');
                this.sortTiles('movementCost');
            });
        }
        if (sortTilesByRarity) {
            sortTilesByRarity.addEventListener('click', () => {
                // this.debug('Tile sort by rarity clicked');
                this.sortTiles('rarity');
            });
        }
        
        // this.debug('Sort event listeners setup complete');
    }

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

    sortTiles(sortBy) {
        // this.debug('Sorting tiles by:', sortBy);
        
        // Update active sort button
        this.updateActiveSortButton('tiles', sortBy);
        
        // Get current tiles (filtered if needed)
        let tilesToSort = this.getCurrentTiles();
        
        // Sort tiles based on criteria
        switch (sortBy) {
            case 'name':
                tilesToSort.sort((a, b) => a.name.localeCompare(b.name, 'de'));
                break;
            case 'movementCost':
                tilesToSort.sort((a, b) => a.movementCost - b.movementCost);
                break;
            case 'rarity':
                const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };
                tilesToSort.sort((a, b) => {
                    const aOrder = rarityOrder[a.rarity] || 0;
                    const bOrder = rarityOrder[b.rarity] || 0;
                    return aOrder - bOrder;
                });
                break;
        }
        
        // Update display
        this.displayTiles(tilesToSort);
    }

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

    getCurrentTiles() {
        // Get tiles based on current filter
        if (this.selectedCategoryId) {
            return this.tiles.filter(tile => tile.categoryId === this.selectedCategoryId);
        }
        return [...this.tiles];
    }

    // REMOVED: Duplicate displayCategories method - using UIManager.displayCategories instead
    // This was causing race conditions and cards appearing/disappearing

    // REMOVED: Duplicate displayTiles function - now handled by TileEditor.js displayTilesAsTable/Cards

    destroy() {
        // this.debug('Destroying...');
        // Cleanup event listeners and references
        this.isInitialized = false;
    }

    testSortFunctionality() {
        // this.debug('Testing sort functionality...');
        
        // Test if sort buttons exist and have event listeners
        const sortButtons = document.querySelectorAll('.sort-btn');
        // this.debug('Found sort buttons:', sortButtons.length);
        
        sortButtons.forEach((btn, index) => {
            // this.debug(`Button ${index}:`, {
                id: btn.id,
                text: btn.textContent,
                hasListeners: btn.onclick !== null || btn._listeners !== undefined
            });
            
            // Test click functionality
            btn.addEventListener('click', (e) => {
                // this.debug(`Sort button clicked:`, btn.id, btn.textContent);
            });
        });
        
        // Test manual sorting - REMOVED FOR FASTER STARTUP
        // if (this.categories.length > 0) {
        //     this.sortCategories('name');
        // }
    }

    setupCategoryDragAndDrop(categoryItem, category) {
        let draggedItem = null;
        let draggedIndex = -1;

        // Drag start
        categoryItem.addEventListener('dragstart', (e) => {
            draggedItem = categoryItem;
            draggedIndex = Array.from(categoryItem.parentNode.children).indexOf(categoryItem);
            categoryItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', categoryItem.outerHTML);
        });

        // Drag end
        categoryItem.addEventListener('dragend', (e) => {
            categoryItem.classList.remove('dragging');
            draggedItem = null;
            draggedIndex = -1;
        });

        // Drag over
        categoryItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedItem && draggedItem !== categoryItem) {
                categoryItem.classList.add('drag-over');
            }
        });

        // Drag leave
        categoryItem.addEventListener('dragleave', (e) => {
            categoryItem.classList.remove('drag-over');
        });

        // Drop
        categoryItem.addEventListener('drop', (e) => {
            e.preventDefault();
            categoryItem.classList.remove('drag-over');
            
            if (draggedItem && draggedItem !== categoryItem) {
                const dropIndex = Array.from(categoryItem.parentNode.children).indexOf(categoryItem);
                this.reorderCategories(draggedIndex, dropIndex);
            }
        });
    }

    reorderCategories(fromIndex, toIndex) {
        // this.debug('Reordering categories from', fromIndex, 'to', toIndex);
        
        // Reorder the categories array
        const reorderedCategories = [...this.categories];
        const [movedCategory] = reorderedCategories.splice(fromIndex, 1);
        reorderedCategories.splice(toIndex, 0, movedCategory);
        
        // Update the categories array
        this.categories = reorderedCategories;
        
        // Update the display
        this.displayCategories(this.categories);
        
        // Update other UI elements
        this.updateCategoryFilter();
        
        // Save the new order to localStorage
        this.saveCategoryOrder();
        
        // this.debug('Categories reordered successfully');
    }

    saveCategoryOrder() {
        try {
            const orderData = this.categories.map((cat, index) => ({
                id: cat.id,
                name: cat.name,
                order: index
            }));
            localStorage.setItem('tileEditor_categoryOrder', JSON.stringify(orderData));
            // this.debug('Category order saved to localStorage');
        } catch (error) {
            // console.('[TileEditor] Failed to save category order:', error);
        }
    }

    loadCategoryOrder() {
        try {
            const savedOrder = localStorage.getItem('tileEditor_categoryOrder');
            if (savedOrder) {
                const orderData = JSON.parse(savedOrder);
                // this.debug('Loaded saved category order:', orderData);
                
                // Reorder categories based on saved order
                const orderedCategories = [];
                orderData.forEach(item => {
                    const category = this.categories.find(cat => cat.id === item.id);
                    if (category) {
                        orderedCategories.push(category);
                    }
                });
                
                // Add any new categories that weren't in the saved order
                this.categories.forEach(category => {
                    if (!orderData.find(item => item.id === category.id)) {
                        orderedCategories.push(category);
                    }
                });
                
                this.categories = orderedCategories;
                return true;
            }
        } catch (error) {
            // console.('[TileEditor] Failed to load category order:', error);
        }
        return false;
    }

    resetCategoryOrder() {
        if (confirm('Möchtest du die Kategorie-Reihenfolge wirklich zurücksetzen?')) {
            // this.debug('Resetting category order...');
            
            // Remove saved order from localStorage
            localStorage.removeItem('tileEditor_categoryOrder');
            
            // Reload categories from original source
            this.loadTileAssets().then(() => {
                this.initializeCategories();
                // this.debug('Category order reset successfully');
                this.showToast('Kategorie-Reihenfolge wurde zurückgesetzt!', 'success');
            });
        }
    }

    async saveBiomeCategory(category) {
        try {
            // Get tiles for this category
            const categoryTiles = this.tiles.filter(tile => tile.categoryId === category.id);
            
            const biomeData = {
                name: category.name,
                type: category.type,
                color: category.color,
                description: category.description,
                folderPath: category.folderPath,
                icon: category.icon,
                tiles: categoryTiles.map(tile => ({
                    name: tile.name,
                    image: tile.image,
                    movementCost: tile.movementCost,
                    defenseBonus: tile.defenseBonus,
                    resources: tile.resources,
                    description: tile.description
                }))
            };
            
            // Save to biomeData.js file
            const success = await this.saveBiomeSettings(category.name, biomeData);
            if (success) {
                // // // // // // console.log(`[TileEditor] Biome category ${category.name} saved successfully`);
                return true;
            } else {
                // console.(`[TileEditor] Failed to save biome category ${category.name}`);
                return false;
            }
        } catch (error) {
            // console.(`[TileEditor] Error saving biome category ${category.name}:`, error);
            return false;
        }
    }

    async saveAllBiomeData() {
        // this.debug('Saving all biome data...');
        
        const savePromises = this.categories.map(category => this.saveBiomeCategory(category));
        const results = await Promise.all(savePromises);
        
        const successCount = results.filter(result => result).length;
        // this.debug(`Successfully saved ${successCount}/${this.categories.length} biome categories`);
        
        return successCount === this.categories.length;
    }

    async refreshBuildingImages() {
        console.log('[TileEditor] Refreshing building images...');
        
        try {
            // Show loading state
            const refreshBtn = document.getElementById('refreshBuildingImages');
            if (refreshBtn) {
                refreshBtn.textContent = '⏳ Loading...';
                refreshBtn.disabled = true;
            }
            
            // Force refresh using TileDataManager
            if (window.TileDataManager) {
                const tileDataManager = new window.TileDataManager();
                await tileDataManager.forceRefreshBuildingImages();
            }
            
            // Reload Buildings biome data
            await this.reloadBiomeData('Buildings');
            
            // Update UI
            this.updateTilesList();
            this.displayCategories(this.categories);
            
            // Show success message
            this.showToast('Building images refreshed successfully!', 'success');
            
            console.log('[TileEditor] Building images refresh completed');
        } catch (error) {
            console.error('[TileEditor] Error refreshing building images:', error);
            this.showToast('Error refreshing building images', 'error');
        } finally {
            // Restore button state
            const refreshBtn = document.getElementById('refreshBuildingImages');
            if (refreshBtn) {
                refreshBtn.textContent = '🔄 Buildings';
                refreshBtn.disabled = false;
            }
        }
    }

    async reloadBiomeData(biomeName) {
        // this.debug(`Reloading biome data for ${biomeName}`);
        
        try {
            // Reload the specific biome data
            const biomeData = await this.loadBiomeData(biomeName);
            if (biomeData && biomeData.tiles) {
                // Find the category
                const category = this.categories.find(c => c.name === biomeName);
                if (category) {
                    // Remove old tiles for this category
                    this.tiles = this.tiles.filter(t => t.categoryId !== category.id);
                    
                    // Add new tiles
                    let newId = Math.max(...this.tiles.map(t => t.id), 0) + 1;
                    biomeData.tiles.forEach(tile => {
                        this.tiles.push({
                            id: newId++,
                            name: tile.name,
                            categoryId: category.id,
                            image: tile.image,
                            movementCost: tile.movementCost || 1,
                            defenseBonus: tile.defenseBonus || 0,
                            resources: tile.resources || '',
                            description: tile.description || `Tile aus ${category.name}`
                        });
                    });
                    
                    // this.debug(`Reloaded ${biomeData.tiles.length} tiles for ${biomeName}`);
                    
                    // Update UI
                    this.updateTilesList();
                    this.displayCategories(this.categories);
                }
            }
        } catch (error) {
            // console.(`[TileEditor] Failed to reload biome data for ${biomeName}:`, error);
        }
    }

    async forceReloadBiomeData(biomeName) {
        // this.debug(`Force reloading biome data for ${biomeName}`);
        
        try {
            // Add cache-busting parameter to force fresh load
            const timestamp = Date.now();
            const response = await fetch(`assets/biomes/${biomeName}/biomeData.js?t=${timestamp}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (response.ok) {
                const jsContent = await response.text();
                // Extract the data from the JS file
                const dataMatch = jsContent.match(/window\.BIOME_DATA\s*=\s*({[\s\S]*});/);
                if (dataMatch) {
                    const biomeData = eval('(' + dataMatch[1] + ')');
                    
                    // Find the category
                    const category = this.categories.find(c => c.name === biomeName);
                    if (category) {
                        // Remove old tiles for this category
                        this.tiles = this.tiles.filter(t => t.categoryId !== category.id);
                        
                        // Add new tiles
                        let newId = Math.max(...this.tiles.map(t => t.id), 0) + 1;
                        biomeData.tiles.forEach(tile => {
                            this.tiles.push({
                                id: newId++,
                                name: tile.name,
                                categoryId: category.id,
                                image: tile.image,
                                movementCost: tile.movementCost || 1,
                                defenseBonus: tile.defenseBonus || 0,
                                resources: tile.resources || '',
                                description: tile.description || `Tile aus ${category.name}`
                            });
                        });
                        
                        // this.debug(`Force reloaded ${biomeData.tiles.length} tiles for ${biomeName}`);
                        
                        // Update UI immediately
                        this.updateTilesList();
                        this.displayCategories(this.categories);
                        
                        // Also update biome modal if it's open
                        if (document.getElementById('biomeModal').classList.contains('show')) {
                            this.loadBiomeTiles(category);
                        }
                    }
                }
            }
        } catch (error) {
            // console.(`[TileEditor] Failed to force reload biome data for ${biomeName}:`, error);
        }
    }

    async saveBiomeCategory(category) {
        try {
            // Get tiles for this category
            const categoryTiles = this.tiles.filter(tile => tile.categoryId === category.id);
            
            const biomeData = {
                name: category.name,
                type: category.type,
                color: category.color,
                description: category.description,
                folderPath: category.folderPath,
                icon: category.icon,
                tiles: categoryTiles.map(tile => ({
                    name: tile.name,
                    image: tile.image,
                    movementCost: tile.movementCost,
                    defenseBonus: tile.defenseBonus,
                    resources: tile.resources,
                    description: tile.description
                }))
            };
            
            // Save to biomeData.js file
            const success = await this.saveBiomeSettings(category.name, biomeData);
            if (success) {
                // // // // // // console.log(`[TileEditor] Biome category ${category.name} saved successfully`);
                return true;
            } else {
                // console.(`[TileEditor] Failed to save biome category ${category.name}`);
                return false;
            }
        } catch (error) {
            // console.(`[TileEditor] Error saving biome category ${category.name}:`, error);
            return false;
        }
    }

    async saveBiomeTiles(biomeName, tiles) {
        try {
            // this.debug(`Saving tiles for biome ${biomeName}:`, tiles);
            
            // Use DataManager to save tiles list
            if (this.dataManager) {
                const success = await this.dataManager.saveTilesList(biomeName, tiles);
                if (success) {
                    // this.debug(`Tiles saved successfully for ${biomeName}`);
                    return true;
                } else {
                    // console.(`[TileEditor] Failed to save tiles for ${biomeName}`);
                    return false;
                }
            } else {
                // console.('[TileEditor] DataManager not available');
                return false;
            }
        } catch (error) {
            // console.(`[TileEditor] Error saving tiles for ${biomeName}:`, error);
            return false;
        }
    }

    async saveTilesList(biomeName, tilesListContent) {
        try {
            // this.debug(`Saving tiles list for biome ${biomeName}`);
            
            // Use DataManager to save tiles list
            if (this.dataManager) {
                // Parse the content to extract tiles array
                const tilesMatch = tilesListContent.match(/const\s+\w+TilesList\s*=\s*(\[[\s\S]*?\]);/);
                if (tilesMatch) {
                    const tiles = eval('(' + tilesMatch[1] + ')');
                    const success = await this.dataManager.saveTilesList(biomeName, tiles);
                    if (success) {
                        // this.debug(`Tiles list saved successfully for ${biomeName}`);
                        return true;
                    } else {
                        // console.(`[TileEditor] Failed to save tiles list for ${biomeName}`);
                        return false;
                    }
                } else {
                    // console.(`[TileEditor] Could not parse tiles from content for ${biomeName}`);
                    return false;
                }
            } else {
                // console.('[TileEditor] DataManager not available');
                return false;
            }
        } catch (error) {
            // console.(`[TileEditor] Error saving tiles list for ${biomeName}:`, error);
            return false;
        }
    }

    async loadBiomeSettings(biomeName) {
        try {
            // this.debug(`Loading biome settings for ${biomeName}`);
            
            // Check cache first
            const cacheKey = `biomeSettings_${biomeName}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const biomeSettings = JSON.parse(cachedData);
                    // this.debug(`Loaded from cache for ${biomeName}:`, biomeSettings);
                    return biomeSettings;
                } catch (e) {
                    // console.(`[TileEditor] Invalid cached data for ${biomeName}, loading from server`);
                }
            }
            
            // Add cache-busting parameter to force fresh load
            const timestamp = Date.now();
            
            // Try to load from biomeName.js first
            let response = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?t=${timestamp}`, {
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
                    // this.debug(`Loaded ${biomeName} data:`, biomeData);
                    
                    // Cache the result
                    localStorage.setItem(cacheKey, JSON.stringify(biomeData));
                    return biomeData;
                }
            }
            
            // console.(`[TileEditor] Could not load ${biomeName}.js, using fallback`);
            return null;
        } catch (error) {
            // console.(`[TileEditor] Error loading ${biomeName} data:`, error);
            return null;
        }
    }

    clearBadlandsCache() {
        // Clear all Badlands-related cache entries
        localStorage.removeItem('biomeData_Badlands');
        localStorage.removeItem('biomeSettings_Badlands');
        localStorage.removeItem('biomeSettings_Badlands_parsed');
        
        // Also clear any cached tiles data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes('Badlands') || key.includes('badlands')) {
                localStorage.removeItem(key);
                // this.debug(`Removed cache key: ${key}`);
            }
        });
        
        // this.debug('Cleared Badlands cache');
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            // console.('[TileEditor] Toast container not found');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button type="button" class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast with animation - IMMEDIATE
        toast.classList.add('show');
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Make TileEditor available globally immediately
// window.tileEditor = new TileEditor(); // REMOVED - index.js handles this

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // this.debug('DOM ready, initializing...');
        if (window.tileEditor) {
            window.tileEditor.initialize();
        }
    });
} else {
            // this.debug('DOM already ready, initializing...');
    if (window.tileEditor) {
        window.tileEditor.initialize();
    }
}

// Global availability
window.TileEditor = TileEditor;

// Ensure methods are available globally for UIManager
window.tileEditor.openTileModal = window.tileEditor.openTileModal.bind(window.tileEditor);
window.tileEditor.openTileModalFromBiome = window.tileEditor.openTileModalFromBiome.bind(window.tileEditor);
