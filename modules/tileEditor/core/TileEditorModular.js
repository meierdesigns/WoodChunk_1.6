/**
 * TileEditor Modular - Main class with modular architecture
 */
class TileEditorModular {
    constructor() {
        this.categories = [];
        this.tiles = [];
        this.selectedCategoryId = null;
        this.selectedTileId = null;
        this.isInitialized = false;
        
        // Initialize modular components
        this.styleManager = new StyleManager();
        this.viewManager = new ViewManager();
        
        // Initialize managers
        this.modalManager = null;
        this.uiManager = null;
        
        // Add global styles
        this.styleManager.addGlobalStyles();
    }

    async initialize() {
        try {
            console.log('[TileEditorModular] Initializing...');
            
            // Force reapply styles
            this.styleManager.forceReapplyStyles();
            
            // Load categories and tiles
            await this.loadCategoriesFromBiomeFolders();
            await this.loadTilesFromBiomeFolders();
            
            // Initialize UI
            await this.initializeCategories();
            this.initializeTiles();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Restore view mode
            this.viewManager.restoreViewMode();
            
            this.isInitialized = true;
            console.log('[TileEditorModular] Initialization complete');
            
        } catch (error) {
            console.error('[TileEditorModular] Initialization error:', error);
        }
    }

    async loadCategoriesFromBiomeFolders() {
        // Load categories from biome folders
        const folders = await this.getBiomeFolders();
        this.categories = await this.createCategoriesFromFolders(folders);
    }

    async loadTilesFromBiomeFolders() {
        const tiles = [];
        let id = 1;
        
        console.log('[TileEditorModular] Starting to load tiles from biome folders');
        console.log('[TileEditorModular] Categories available:', this.categories);
        
        for (const category of this.categories) {
            console.log('[TileEditorModular] Loading tiles for category:', category.name, '(ID:', category.id, ')');
            
            const categoryTiles = await this.loadTilesFromBiomeFolder(category);
            console.log('[TileEditorModular] Found', categoryTiles.length, 'tiles for', category.name);
            
            for (const tile of categoryTiles) {
                tile.id = id++;
                tile.categoryId = category.id;
                tile.categoryName = category.name;
                tiles.push(tile);
                console.log('[TileEditorModular] Added tile:', tile.name, 'with categoryId:', tile.categoryId, 'for category:', category.name, '(ID:', category.id, ')');
            }
        }
        
        console.log('[TileEditorModular] Total tiles loaded:', tiles.length);
        console.log('[TileEditorModular] Tiles by categoryId:', tiles.reduce((acc, tile) => {
            acc[tile.categoryId] = (acc[tile.categoryId] || 0) + 1;
            return acc;
        }, {}));
        
        // Store tiles as immutable
        this.tiles = Object.freeze(tiles);
        console.log('[TileEditorModular] Stored tiles in this.tiles:', this.tiles);
        console.log('[TileEditorModular] Sample tile from this.tiles:', this.tiles[0]);
        
        return tiles;
    }

    async loadTilesFromBiomeFolder(category) {
        const tiles = [];
        
        try {
            // Load from tilesList.js file
            const tilesList = await this.loadTilesList(category.name);
            console.log('[TileEditorModular] Loaded', tilesList.length, 'tiles from tilesList.js for', category.name);
            
            for (const tile of tilesList) {
                const tileImagePath = this.fixImagePath(tile.image);
                tiles.push({
                    ...tile,
                    image: tileImagePath
                });
            }
            
        } catch (error) {
            console.error('[TileEditorModular] Error loading tiles for', category.name, ':', error);
        }
        
        return tiles;
    }

    async loadTilesList(biomeName) {
        try {
            const timestamp = Date.now();
            const response = await fetch(`/assets/biomes/${biomeName}/tiles/tilesList.js?v=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            const match = content.match(/export\s+default\s+(\[.*\]);?/s);
            
            if (match) {
                const tiles = JSON.parse(match[1]);
                return tiles;
            } else {
                console.warn('[TileEditorModular] No tiles found in tilesList.js for', biomeName);
                return [];
            }
            
        } catch (error) {
            console.error('[TileEditorModular] Error loading tilesList.js for', biomeName, ':', error);
            return [];
        }
    }

    fixImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Remove any existing query parameters
        const cleanPath = imagePath.split('?')[0];
        
        // Ensure path starts with /
        let fixedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
        
        // Add cache busting to prevent caching issues
        if (!imagePath.includes('?')) {
            fixedPath += '?v=' + Date.now();
        }
        
        return fixedPath;
    }

    async createCategoriesFromFolders(folders) {
        const categories = [];
        
        // Load all biome settings in parallel for better performance
        const biomePromises = folders.map(async (folder) => {
            const biomeSettings = await this.loadBiomeSettings(folder.name);
            return {
                id: categories.length + 1,
                name: folder.name,
                type: this.determineTypeFromFolder(folder.name),
                color: await this.getColorForBiome(folder.name),
                description: this.getDescriptionForBiome(folder.name),
                icon: this.getFolderIcon(folder.name),
                settings: biomeSettings
            };
        });
        
        const biomeData = await Promise.all(biomePromises);
        categories.push(...biomeData);
        
        return categories;
    }

    async loadBiomeSettings(biomeName) {
        try {
            const response = await fetch(`/assets/biomes/${biomeName}/${biomeName}.js?v=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            const match = content.match(/export\s+default\s+(\{.*\});?/s);
            
            if (match) {
                return JSON.parse(match[1]);
            } else {
                console.warn('[TileEditorModular] No settings found in', biomeName + '.js');
                return {};
            }
            
        } catch (error) {
            console.error('[TileEditorModular] Error loading biome settings for', biomeName, ':', error);
            return {};
        }
    }

    determineTypeFromFolder(folderName) {
        const biomeTypes = ['forest', 'wald', 'mountain', 'gebirge', 'water', 'wasser', 'desert', 'wüste'];
        const lowerName = folderName.toLowerCase();
        
        for (const type of biomeTypes) {
            if (lowerName.includes(type)) {
                return this.getTypeName(type);
            }
        }
        
        return 'Standard';
    }

    getTypeName(type) {
        const typeNames = {
            'forest': 'Wald',
            'wald': 'Wald',
            'mountain': 'Gebirge',
            'gebirge': 'Gebirge',
            'water': 'Wasser',
            'wasser': 'Wasser',
            'desert': 'Wüste',
            'wüste': 'Wüste'
        };
        
        return typeNames[type] || 'Standard';
    }

    async getColorForBiome(biomeName) {
        const colorMap = {
            'Forest': '#4CAF50',
            'Mountains': '#795548',
            'Water': '#2196F3',
            'Desert': '#FF9800',
            'Swamp': '#8BC34A',
            'Plain': '#9E9E9E',
            'Jungle': '#2E7D32',
            'Badlands': '#D84315',
            'Snow': '#E3F2FD',
            'Ocean': '#1976D2',
            'Buildings': '#607D8B'
        };
        
        return colorMap[biomeName] || '#9E9E9E';
    }

    getDescriptionForBiome(biomeName) {
        const descMap = {
            'Forest': 'Dichte Wälder mit hohen Bäumen',
            'Mountains': 'Hochgebirge mit steilen Hängen',
            'Water': 'Gewässer und Seen',
            'Desert': 'Trockene Wüstenlandschaft',
            'Swamp': 'Sumpfige Feuchtgebiete',
            'Plain': 'Weite Ebenen und Grasland',
            'Jungle': 'Dichter Dschungel',
            'Badlands': 'Öde und unwirtliche Landschaft',
            'Snow': 'Schneebedeckte Gebiete',
            'Ocean': 'Weite Meeresflächen',
            'Buildings': 'Gebäude und Siedlungen'
        };
        
        return descMap[biomeName] || 'Standard-Biom';
    }

    getFolderIcon(folderName) {
        const iconMap = {
            'Forest': '🌲',
            'Mountains': '⛰️',
            'Water': '💧',
            'Desert': '🏜️',
            'Swamp': '🐸',
            'Plain': '🌾',
            'Jungle': '🌿',
            'Badlands': '🏔️',
            'Snow': '❄️',
            'Ocean': '🌊',
            'Buildings': '🏘️'
        };
        
        return iconMap[folderName] || '📁';
    }

    async getBiomeFolders() {
        // This would typically fetch from server
        // For now, return static list
        return [
            { name: 'Forest' },
            { name: 'Mountains' },
            { name: 'Water' },
            { name: 'Desert' },
            { name: 'Swamp' },
            { name: 'Plain' },
            { name: 'Jungle' },
            { name: 'Badlands' },
            { name: 'Snow' },
            { name: 'Ocean' },
            { name: 'Buildings' }
        ];
    }

    async initializeCategories() {
        console.log('[TileEditorModular] initializeCategories called, categories:', this.categories?.length);
        
        if (this.uiManager && this.uiManager.displayCategories) {
            await this.uiManager.displayCategories(this.categories);
        }
    }

    initializeTiles() {
        const tilesList = document.getElementById('tilesList');
        if (tilesList) {
            tilesList.innerHTML = '';
        }
    }

    setupEventListeners() {
        console.log('[TileEditorModular] Setting up event listeners');
        
        // View mode buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('button[data-view="table"]')) {
                console.log('[TileEditorModular] Table view button clicked');
                this.viewManager.switchViewMode('table');
                this.viewManager.updateAnyOpenModalView('table');
            } else if (e.target.matches('button[data-view="cards"]')) {
                console.log('[TileEditorModular] Cards view button clicked');
                this.viewManager.switchViewMode('cards');
                this.viewManager.updateAnyOpenModalView('cards');
            }
        });
    }

    // Biome Modal Methods
    async openBiomeModal(categoryId) {
        console.log('[TileEditorModular] openBiomeModal called with categoryId:', categoryId);
        
        if (this.modalManager) {
            await this.modalManager.openBiomeModal(categoryId);
        }
    }

    closeBiomeModal() {
        if (this.modalManager) {
            this.modalManager.closeBiomeModal();
        }
    }

    selectTile(tileId) {
        this.selectedTileId = tileId;
    }

    selectCategory(categoryId) {
        this.selectedCategoryId = categoryId;
    }

    editCategory(categoryId) {
        console.log('[TileEditorModular] editCategory called with categoryId:', categoryId);
    }

    destroy() {
        // Cleanup modular components
        if (this.styleManager) {
            this.styleManager.destroy();
        }
        
        // Cleanup event listeners and references
        this.categories = [];
        this.tiles = [];
        this.selectedCategoryId = null;
        this.selectedTileId = null;
        this.isInitialized = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TileEditorModular;
}
