"use strict";

/**
 * TileMapper - Handles mapping of tiles to hexagones
 * Manages tile placement, rotation, and hexagon mapping
 */
class TileMapper {
    constructor(core) {
        this.core = core;
        this.tileCache = new Map();
        this.hexTileMap = new Map();
        this.selectedTile = null;
        this.rotation = 0;
        this.init();
    }

    init() {
        console.log('[TileMapper] Initializing TileMapper...');
        this.setupEventListeners();
        this.loadTileCache();
    }

    setupEventListeners() {
        // Listen for tile selection events
        document.addEventListener('tileSelected', (event) => {
            this.setSelectedTile(event.detail.tile);
        });

        // Listen for hexagon click events
        document.addEventListener('hexagonClicked', (event) => {
            this.handleHexagonClick(event.detail);
        });
    }

    loadTileCache() {
        // Load tiles from buildingsTilesList if available
        if (window.buildingsTilesList && Array.isArray(window.buildingsTilesList)) {
            console.log('[TileMapper] Loading tiles from buildingsTilesList:', window.buildingsTilesList.length);
            window.buildingsTilesList.forEach(tile => {
                this.tileCache.set(tile.id, tile);
            });
        }
    }

    setSelectedTile(tile) {
        this.selectedTile = tile;
        console.log('[TileMapper] Selected tile:', tile?.name);
        
        // Notify observers
        if (this.core && this.core.notifyObservers) {
            this.core.notifyObservers('tileSelected', { tile: tile });
        }
    }

    getSelectedTile() {
        return this.selectedTile;
    }

    handleHexagonClick(hexData) {
        if (!this.selectedTile) {
            console.log('[TileMapper] No tile selected for placement');
            return;
        }

        console.log('[TileMapper] Placing tile on hexagon:', hexData.x, hexData.y);
        this.placeTileOnHexagon(hexData.x, hexData.y, this.selectedTile);
    }

    placeTileOnHexagon(x, y, tile) {
        const hexKey = `${x},${y}`;
        
        // Store tile mapping
        this.hexTileMap.set(hexKey, {
            tile: tile,
            rotation: this.rotation,
            timestamp: Date.now()
        });

        // Update visual representation
        this.updateHexagonVisual(x, y, tile);
        
        // Notify core about tile placement
        if (this.core && this.core.onTilePlaced) {
            this.core.onTilePlaced(x, y, tile, this.rotation);
        }

        console.log('[TileMapper] Tile placed successfully:', tile.name, 'at', hexKey);
    }

    updateHexagonVisual(x, y, tile) {
        // Find the hexagon element
        const hexElement = document.querySelector(`[data-hex-x="${x}"][data-hex-y="${y}"]`);
        if (!hexElement) {
            console.warn('[TileMapper] Hexagon element not found for:', x, y);
            return;
        }

        // Create tile visual
        const tileVisual = this.createTileVisual(tile);
        if (tileVisual) {
            // Clear existing content
            hexElement.innerHTML = '';
            hexElement.appendChild(tileVisual);
        }
    }

    createTileVisual(tile) {
        if (!tile || !tile.image) {
            return null;
        }

        const tileElement = document.createElement('div');
        tileElement.className = 'hex-tile';
        tileElement.style.cssText = `
            width: 100%;
            height: 100%;
            background-image: url('${this.correctImagePath(tile.image)}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 50%;
            transform: rotate(${this.rotation}deg);
        `;

        return tileElement;
    }

    correctImagePath(imagePath) {
        // Correct image path similar to BiomeUI
        if (imagePath.startsWith('assets/')) {
            return '/' + imagePath;
        } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            // Spezielle Behandlung für Buildings tiles
            if (imagePath.includes('slice_') || imagePath.includes('tile_')) {
                return '/assets/biomes/Buildings/tiles/' + imagePath;
            }
            // Für andere Tiles, verwende den Standard-Pfad basierend auf dem Tile-Typ
            if (imagePath.includes('forest') || imagePath.includes('Forest')) {
                return '/assets/biomes/Forest/tiles/' + imagePath;
            } else if (imagePath.includes('mountain') || imagePath.includes('Mountain')) {
                return '/assets/biomes/Mountains/tiles/' + imagePath;
            } else if (imagePath.includes('desert')) {
                return '/assets/biomes/Desert/tiles/' + imagePath;
            } else if (imagePath.includes('water')) {
                return '/assets/biomes/Water/tiles/' + imagePath;
            } else if (imagePath.includes('Slice ')) {
                return '/assets/biomes/Unassigned/tiles/' + imagePath;
            }
            // Standard: Buildings für unbekannte Tiles
            return '/assets/biomes/Buildings/tiles/' + imagePath;
        }
        
        // Add cache busting for Buildings tiles
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const cacheBustedPath = imagePath + (imagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[TileMapper] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        return imagePath;
    }

    setRotation(rotation) {
        this.rotation = rotation % 360;
        console.log('[TileMapper] Rotation set to:', this.rotation);
    }

    getRotation() {
        return this.rotation;
    }

    getTileAtHexagon(x, y) {
        const hexKey = `${x},${y}`;
        return this.hexTileMap.get(hexKey);
    }

    removeTileFromHexagon(x, y) {
        const hexKey = `${x},${y}`;
        const removed = this.hexTileMap.delete(hexKey);
        
        if (removed) {
            // Clear visual representation
            const hexElement = document.querySelector(`[data-hex-x="${x}"][data-hex-y="${y}"]`);
            if (hexElement) {
                hexElement.innerHTML = '';
            }
            
            console.log('[TileMapper] Tile removed from:', hexKey);
        }
        
        return removed;
    }

    clearAllTiles() {
        this.hexTileMap.clear();
        console.log('[TileMapper] All tiles cleared');
    }

    getTileMap() {
        return new Map(this.hexTileMap);
    }

    // Debug functions
    debugTileMap() {
        console.log('[TileMapper] === TILE MAP DEBUG ===');
        console.log('Selected tile:', this.selectedTile?.name);
        console.log('Rotation:', this.rotation);
        console.log('Tile cache size:', this.tileCache.size);
        console.log('Hex tile map size:', this.hexTileMap.size);
        console.log('Hex tile map entries:', Array.from(this.hexTileMap.entries()));
    }
}

// Global availability
if (typeof window !== 'undefined') {
    window.TileMapper = TileMapper;
    
    // Global debug function
    window.debugTileMapper = () => {
        if (window.tileMapper) {
            window.tileMapper.debugTileMap();
        } else {
            console.log('[TileMapper] TileMapper instance not found');
        }
    };
}
