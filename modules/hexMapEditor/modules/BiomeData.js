"use strict";

// Entferne ES6-Imports und verwende globale Klassen
// import { BiomeUtils } from '../utils/BiomeUtils.js';
// import { StorageUtils } from '../utils/StorageUtils.js';
// import { DOMUtils } from '../utils/DOMUtils.js';
// import { ToastManager } from '../utils/ToastManager.js';

class BiomeData {
    constructor(core) {
        this.core = core;
        // Module-Referenzen werden später im BiomeModule verknüpft
    }

    loadBiomeDataFromBuildingsTilesList() {
        // console.log('[BiomeData] Loading biome data from buildings tiles list...');
        
        try {
            // Entfernt: Keine Abhängigkeit mehr vom TileEditor
            // Der HexMap Editor lädt Biome direkt aus den Dateien
            return this.getFallbackBiomeData();
        } catch (error) {
            console.error('[BiomeData] Error loading biome data:', error);
            console.error('[BiomeData] Error details:', error.message, error.stack);
            return this.getFallbackBiomeData();
        }
    }

    getFallbackBiomeData() {
        // console.log('[BiomeData] Using fallback biome data');
        
        const fallbackBiomes = [
            { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50', description: 'Waldlandschaft', folderPath: 'assets/biomes/Forest', icon: '🌲' },
            { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548', description: 'Berglandschaft', folderPath: 'assets/biomes/Mountains', icon: '⛰️' },
            { id: 'water', name: 'Water', type: 'biome', color: '#2196F3', description: 'Wasserlandschaft', folderPath: 'assets/biomes/Water', icon: '💧' },
            { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800', description: 'Wüstenlandschaft', folderPath: 'assets/biomes/Desert', icon: '🏜️' },
            { id: 'buildings', name: 'Buildings', type: 'entities', color: '#9C27B0', description: 'Gebäude und Siedlungen', folderPath: 'assets/biomes/Buildings', icon: '🏢' },
            { id: 'swamp', name: 'Swamp', type: 'biome', color: '#8BC34A', description: 'Sumpflandschaft', folderPath: 'assets/biomes/Swamp', icon: '🌿' },
            { id: 'plain', name: 'Plain', type: 'biome', color: '#CDDC39', description: 'Ebenenlandschaft', folderPath: 'assets/biomes/Plain', icon: '🌾' },
            { id: 'jungle', name: 'Jungle', type: 'biome', color: '#4CAF50', description: 'Dschungellandschaft', folderPath: 'assets/biomes/Jungle', icon: '🌴' },
            { id: 'badlands', name: 'Badlands', type: 'biome', color: '#FF5722', description: 'Ödland', folderPath: 'assets/biomes/Badlands', icon: '🏔️' },
            { id: 'snow', name: 'Snow', type: 'biome', color: '#E3F2FD', description: 'Schneelandschaft', folderPath: 'assets/biomes/Snow', icon: '❄️' },
            { id: 'ocean', name: 'Ocean', type: 'biome', color: '#1976D2', description: 'Meereslandschaft', folderPath: 'assets/biomes/Ocean', icon: '🌊' }
        ];
        
        localStorage.setItem('tile_editor_biomes', JSON.stringify(fallbackBiomes));
        // console.log('[BiomeData] Fallback biome data saved to localStorage');
        
        return fallbackBiomes;
    }

    async loadBiomeOptionsForHexTiles(select) {
        try {
            let categories = await BiomeUtils.getBiomeFolders();
            
            // Prüfe den aktuellen Layer
            const currentLayer = this.core.getCurrentLayer();
                    // console.log('[BiomeData] Current layer:', currentLayer);
        // console.log('[BiomeData] All categories before filtering:', categories.map(c => ({name: c.name, type: c.type})));
            
            // Wenn kein select-Element übergeben wurde, gib die gefilterten Daten zurück
            if (!select) {
                const filteredCategories = categories.filter(category => {
                    if (currentLayer === 'streets') {
                        return category.name && category.type === 'entities';
                    } else if (currentLayer === 'terrain') {
                        return category.name && category.type === 'biome';
                    } else {
                        return category.name && category.type === 'biome';
                    }
                });
                
                // console.log('[BiomeData] Returning filtered categories:', filteredCategories.length);
                return filteredCategories;
            }
            
            categories.forEach(category => {
                // Für "streets" Layer: Zeige nur entities Biomes (Gebäude)
                // Für "terrain" Layer: Zeige nur biome Biomes (Landschaft)
                if (currentLayer === 'streets') {
                    if (category.name && category.type === 'entities') {
                        const option = document.createElement('option');
                        option.value = category.id || category.name.toLowerCase();
                        option.textContent = category.name;
                        option.style.color = category.color || '#fff';
                        
                        // Markiere das aktuell ausgewählte Biome
                        if (this.core && this.core.settings && this.core.settings.selectedBiome) {
                            if (option.value === this.core.settings.selectedBiome) {
                                option.selected = true;
                            }
                        }
                        
                        select.appendChild(option);
                    }
                } else if (currentLayer === 'terrain') {
                    if (category.name && category.type === 'biome') {
                        const option = document.createElement('option');
                        option.value = category.id || category.name.toLowerCase();
                        option.textContent = category.name;
                        option.style.color = category.color || '#fff';
                        
                        // Markiere das aktuell ausgewählte Biome
                        if (this.core && this.core.settings && this.core.settings.selectedBiome) {
                            if (option.value === this.core.settings.selectedBiome) {
                                option.selected = true;
                            }
                        }
                        
                        select.appendChild(option);
                    }
                } else {
                    // Standard: Zeige nur biome Biomes
                    if (category.name && category.type === 'biome') {
                        const option = document.createElement('option');
                        option.value = category.id || category.name.toLowerCase();
                        option.textContent = category.name;
                        option.style.color = category.color || '#fff';
                        
                        // Markiere das aktuell ausgewählte Biome
                        if (this.core && this.core.settings && this.core.settings.selectedBiome) {
                            if (option.value === this.core.settings.selectedBiome) {
                                option.selected = true;
                            }
                        }
                        
                        select.appendChild(option);
                    }
                }
            });
            
            // console.log('[BiomeData] Loaded biome options for hex tiles:', categories.length, 'for layer:', currentLayer);
        } catch (error) {
            console.log('[BiomeData] Could not load biome options for hex tiles:', error);
            return [];
        }
    }

    async loadTilesForBiomeAndDisplay(biome, biomeItem, shouldExpand = false) {
        console.log('[BiomeData] Loading tiles for biome:', biome.name);
        
        // Erstelle Container für Tiles, falls nicht vorhanden
        let tileContainer = biomeItem.querySelector('.biome-tiles-container');
        if (!tileContainer) {
            tileContainer = document.createElement('div');
            tileContainer.className = 'biome-tiles-container';
            tileContainer.style.cssText = `
                display: none;
                flex-direction: column;
                gap: 2px;
                margin-top: 4px;
                padding: 4px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            `;
            biomeItem.appendChild(tileContainer);
        }
        
        try {
            // Try to load from biome config first
            const biomeData = await this.loadBiomeData(biome.name);
            let tiles = [];
            
            if (biomeData && biomeData.tiles && biomeData.tiles.length > 0) {
                tiles = biomeData.tiles;
                console.log('[BiomeData] Loaded tiles from biome config:', tiles.length);
            } else {
                console.log('[BiomeData] No tiles found in biome config for:', biome.name);
            }
            
            // Display tiles
            if (tiles && tiles.length > 0) {
                console.log('[BiomeData] Displaying tiles:', tiles.length, 'tiles');
                this.displayTilesForSelection(tiles, tileContainer);
            } else {
                console.log('[BiomeData] No tiles to display for biome:', biome.name);
                tileContainer.innerHTML = '<p>Keine Tiles in diesem Biome vorhanden.</p>';
            }
            
            // Show container if expanded
            if (shouldExpand) {
                tileContainer.style.display = 'flex';
            }
            
            console.log('[BiomeData] Tiles loaded and displayed for biome:', biome.name);
            
        } catch (error) {
            console.error('[BiomeData] Error loading tiles for biome:', error);
            tileContainer.innerHTML = '<p>Fehler beim Laden der Tiles.</p>';
        }
    }

    loadBuildingsTilesForDisplay(category, categoryItem) {
        // console.log('[BiomeData] Loading Buildings tiles for display:', category.name);
        
        // Erstelle Container für Editor Tiles, falls nicht vorhanden
        let tileEditorContainer = categoryItem.querySelector('.tile-editor-tiles-container');
        if (!tileEditorContainer) {
            tileEditorContainer = document.createElement('div');
            tileEditorContainer.className = 'buildings-tiles-container';
            tileEditorContainer.style.cssText = `
                display: block;
                visibility: visible;
                flex-direction: column;
                gap: 2px;
                margin-top: 4px;
                padding: 4px;
                background: rgba(255, 152, 0, 0.05);
                border-radius: 4px;
                border: 1px solid rgba(255, 152, 0, 0.2);
            `;
            categoryItem.appendChild(tileEditorContainer);
            // console.log('[BiomeData] Container HTML after creation:', tileEditorContainer.innerHTML);
        }
        
        // Lade Tiles aus der entsprechenden tilesList.js Datei
        let tiles = [];
        
        try {
            // Versuche zuerst aus globalen Variablen zu laden
            const globalTilesList = window[`${category.name}TilesList`];
            if (globalTilesList && Array.isArray(globalTilesList)) {
                tiles = globalTilesList;
                // console.log('[BiomeData] Loaded tiles from global variable:', tiles.length);
            } else {
                // Fallback: Lade aus Datei
                const tilesListPath = `assets/biomes/${category.name}/tilesList.js`;
                // console.log('[BiomeData] Attempting to load from:', tilesListPath);
                
                // Simuliere das Laden der Datei (da wir keinen echten Server haben)
                tiles = this.loadTilesFromFile(tilesListPath);
            }
        } catch (error) {
            console.error('[BiomeData] Error loading Tile Editor tiles for display:', error);
            console.error('[BiomeData] Error details:', error.message, error.stack);
        }
        
        // Fallback: Verwende Mock-Tiles
        if (!tiles || tiles.length === 0) {
            // console.log('[BiomeData] No tiles found, using mock tiles');
            tiles = this.getMockTilesForBiome(category.name);
        }
        
        // Zeige Tiles an
        if (tiles && tiles.length > 0) {
            // console.log('[BiomeData] Displaying tiles:', tiles.length);
            // Diese Methode wird vom BiomeUI-Modul bereitgestellt
            if (this.biomeUI) {
                this.biomeUI.displayBuildingsTiles(tiles, tileEditorContainer);
            }
        } else {
            // console.log('[BiomeData] No tiles to display');
            tileEditorContainer.innerHTML = `
                <div style="color: #999; text-align: center; padding: 10px; font-size: 12px;">
                    Keine Tiles verfügbar
                </div>
            `;
        }
        
        // console.log('[BiomeData] Existing container HTML:', tileEditorContainer.innerHTML);
    }

    loadTilesFromFile(filePath) {
        // console.log('[BiomeData] Loading tiles from file:', filePath);
        
        // Simuliere das Laden von Tiles aus einer Datei
        // In einer echten Implementierung würde hier ein fetch() stehen
        const mockTiles = [
            { name: 'Haus', image: 'slice_333.png', buildingCategory: 'building' },
            { name: 'Turm', image: 'slice_344.png', buildingCategory: 'tower' },
            { name: 'Burg', image: 'slice_352.png', buildingCategory: 'castle' },
            { name: 'Mine', image: 'slice_358.png', buildingCategory: 'mining_site' }
        ];
        
        return mockTiles;
    }

    displayTilesForSelection(tiles, container) {
        // console.log('[BiomeData] Displaying tiles for selection:', tiles.length, 'tiles');
        
        // Lösche vorhandene Tiles
        container.innerHTML = '';
        
        tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'biome-tile-item';
            tileElement.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-height: 32px;
            `;
            
            // Korrigiere den Bildpfad
            const correctedImagePath = this.correctImagePath(tile.image);
            
            tileElement.innerHTML = `
                <img src="${correctedImagePath}" alt="${tile.name}" style="width: 24px; height: 24px; object-fit: contain;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; console.log('[BiomeData] Image failed to load:', '${correctedImagePath}');"
                     onload="this.style.display='block'; this.nextElementSibling.style.display='none'; console.log('[BiomeData] Image loaded successfully:', '${correctedImagePath}');">
                <div class="tile-fallback" style="display: none; width: 24px; height: 24px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #ccc;">🏢</div>
                <div style="font-size: 10px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tile.name}</div>
            `;
            
            tileElement.addEventListener('click', () => {
                this.selectTileForPainting(tile);
            });
            
            tileElement.addEventListener('mouseenter', () => {
                tileElement.style.background = 'rgba(255, 255, 255, 0.2)';
                tileElement.style.transform = 'scale(1.02)';
            });
            
            tileElement.addEventListener('mouseleave', () => {
                tileElement.style.background = 'rgba(255, 255, 255, 0.1)';
                tileElement.style.transform = 'scale(1)';
            });
            
            container.appendChild(tileElement);
        });
        
        // console.log('[BiomeData] Tiles displayed for selection');
    }

    // Bildpfad-Korrektur
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Korrigiere den Bildpfad
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
            console.log('[BiomeData] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        return imagePath;
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
                    console.log(`[BiomeData] Loaded ${tiles.length} tiles from tilesList.js for ${biomeName}`);
                    return { tiles: tiles };
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
                    console.log(`[BiomeData] Loaded ${biomeName} data:`, biomeData);
                    return biomeData;
                }
            }
            
            console.warn(`[BiomeData] Could not load tiles for ${biomeName}`);
            return null;
        } catch (error) {
            console.error(`[BiomeData] Error loading ${biomeName} data:`, error);
            return null;
        }
    }

    filterDeletedTilesFromMockTiles(tiles, biomeName) {
        console.log('[BiomeData] Filtering deleted tiles from mock tiles for biome:', biomeName);
        
        try {
            // Get deleted tiles from ModalManager
            let deletedTiles = new Set();
            
            // Method 1: Try to get from window.tileEditor
            if (window.tileEditor && window.tileEditor.modalManager && window.tileEditor.modalManager.deletedTiles) {
                deletedTiles = window.tileEditor.modalManager.deletedTiles;
                console.log('[BiomeData] Got deleted tiles from window.tileEditor.modalManager:', deletedTiles.size);
            }
            
            // Method 2: Try to get from localStorage
            if (deletedTiles.size === 0) {
                const storedDeletedTiles = localStorage.getItem('deletedTiles');
                if (storedDeletedTiles) {
                    try {
                        const deletedTilesArray = JSON.parse(storedDeletedTiles);
                        deletedTiles = new Set(deletedTilesArray);
                        console.log('[BiomeData] Got deleted tiles from localStorage:', deletedTiles.size);
                    } catch (error) {
                        console.warn('[BiomeData] Could not parse deleted tiles from localStorage:', error);
                    }
                }
            }
            
            // Method 3: Try to get from global variable
            if (deletedTiles.size === 0 && window.deletedTiles) {
                deletedTiles = window.deletedTiles;
                console.log('[BiomeData] Got deleted tiles from global variable:', deletedTiles.size);
            }
            
            // Filter out deleted tiles
            if (deletedTiles.size > 0) {
                const originalCount = tiles.length;
                tiles = tiles.filter(tile => {
                    const isDeleted = deletedTiles.has(tile.image) || deletedTiles.has(tile.name);
                    if (isDeleted) {
                        console.log('[BiomeData] Filtered out deleted tile:', tile.name, 'image:', tile.image);
                    }
                    return !isDeleted;
                });
                
                if (tiles.length !== originalCount) {
                    console.log('[BiomeData] Filtered out', originalCount - tiles.length, 'deleted tiles from mock tiles');
                }
            }
            
        } catch (error) {
            console.error('[BiomeData] Error filtering deleted tiles:', error);
        }
        
        return tiles;
    }

    // Lade Tiles für eine Kategorie
    async loadTilesForCategory(category) {
        // Versuche direkt auf buildingsTilesList zuzugreifen
        if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
            try {
                let tiles = window.buildingsTilesList.filter(tile => 
                    tile.buildingCategory === category || 
                    category === 'building'
                );
                
                // Filter out deleted tiles from buildingsTilesList
                tiles = this.filterDeletedTilesFromLocalStorage(tiles, category);
                
                if (tiles && tiles.length > 0) {
                    return tiles;
                }
            } catch (error) {
                console.warn('[BiomeData] Failed to load from buildingsTilesList:', error);
            }
        }
        
        // Fallback zu Mock-Tiles
        return this.getMockTilesForCategory(category);
    }

    getMockTilesForCategory(category) {
        const mockTiles = {
            'building': [
                { name: 'Haus', image: 'slice_333.png', icon: '🏠', movementCost: 1, defenseBonus: 0, buildingCategory: 'building' },
                { name: 'Turm', image: 'slice_344.png', icon: '🗼', movementCost: 1, defenseBonus: 2, buildingCategory: 'tower' },
                { name: 'Burg', image: 'slice_352.png', icon: '🏰', movementCost: 1, defenseBonus: 3, buildingCategory: 'castle' },
                { name: 'Mine', image: 'slice_358.png', icon: '⛏️', movementCost: 1, defenseBonus: 0, buildingCategory: 'mining_site' }
            ],
            'tower': [
                { name: 'Wachturm', image: 'slice_344.png', icon: '🗼', movementCost: 1, defenseBonus: 2, buildingCategory: 'tower' }
            ],
            'castle': [
                { name: 'Burg', image: 'slice_352.png', icon: '🏰', movementCost: 1, defenseBonus: 3, buildingCategory: 'castle' }
            ],
            'temple': [
                { name: 'Tempel', image: 'slice_344.png', icon: '⛪', movementCost: 1, defenseBonus: 1, buildingCategory: 'tower' }
            ],
            'mining_site': [
                { name: 'Mine', image: 'slice_358.png', icon: '⛏️', movementCost: 1, defenseBonus: 0, buildingCategory: 'mining_site' }
            ]
        };
        
        let tiles = mockTiles[category] || [];
        
        // Filter out deleted tiles from category mock tiles
        tiles = this.filterDeletedTilesFromMockTiles(tiles, category);
        
        return tiles;
    }

    filterDeletedTilesFromLocalStorage(tiles, biomeName) {
        try {
            // Get deleted tiles from ModalManager
            let deletedTiles = new Set();
            
            // Method 1: Try to get from window.tileEditor
            if (window.tileEditor && window.tileEditor.modalManager && window.tileEditor.modalManager.deletedTiles) {
                deletedTiles = window.tileEditor.modalManager.deletedTiles;
            }
            
            // Method 2: Try to get from localStorage
            if (deletedTiles.size === 0) {
                const storedDeletedTiles = localStorage.getItem('deletedTiles');
                if (storedDeletedTiles) {
                    try {
                        const deletedTilesArray = JSON.parse(storedDeletedTiles);
                        deletedTiles = new Set(deletedTilesArray);
                    } catch (error) {
                        console.warn('[BiomeData] Could not parse deleted tiles from localStorage:', error);
                    }
                }
            }
            
            // Method 3: Try to get from global variable
            if (deletedTiles.size === 0 && window.deletedTiles) {
                deletedTiles = window.deletedTiles;
                console.log('[BiomeData] Got deleted tiles from global variable:', deletedTiles.size);
            }
            
            // Filter out deleted tiles
            if (deletedTiles.size > 0) {
                const originalCount = tiles.length;
                tiles = tiles.filter(tile => {
                    const isDeleted = deletedTiles.has(tile.image) || deletedTiles.has(tile.name);
                    if (isDeleted) {
                        console.log('[BiomeData] Filtered out deleted tile from localStorage:', tile.name, 'image:', tile.image);
                    }
                    return !isDeleted;
                });
                
                if (tiles.length !== originalCount) {
                    console.log('[BiomeData] Filtered out', originalCount - tiles.length, 'deleted tiles from localStorage');
                }
            }
            
        } catch (error) {
            console.error('[BiomeData] Error filtering deleted tiles from localStorage:', error);
        }
        
        return tiles;
    }
    selectTileForPainting(tile) {
        if (!this.core) {
            console.warn('[BiomeData] Core not available for tile selection');
            return;
        }

        console.log('[BiomeData] Selecting tile for painting:', tile.name);
        
        // Setze das ausgewählte Tile
        if (this.core.setSelectedTile) {
            this.core.setSelectedTile(tile);
        }
        
        // Zeige Bestätigung
        ToastManager.showToast(`Tile "${tile.name}" ausgewählt`, 'success');
        
        console.log('[BiomeData] Tile selected for painting:', tile.name);
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.BiomeData = BiomeData;
    
    // Automatische Debug-Funktion
    window.autoDebug = () => {
        console.log('🔍 === AUTOMATISCHE DEBUG-ANALYSE ===');
        console.log('📦 Tiles verfügbar:', !!window.buildingsTilesList);
        console.log('📦 Anzahl Tiles:', window.buildingsTilesList?.length || 0);
        console.log('🔧 Debug-Funktionen:', !!(window.debugImageLoadingIssue && window.comprehensiveBiomeMenuDebug));
        console.log('🌐 DOM-Elemente:', !!(document.querySelector('.sidebar') && document.querySelector('#biome-menu')));
        console.log('🖼️ Tile-Elemente:', document.querySelectorAll('.tile-element').length);
        console.log('🖼️ Tile-Bilder:', document.querySelectorAll('.tile-element img').length);
        
        const tileImages = document.querySelectorAll('.tile-element img');
        let loadedImages = 0;
        let brokenImages = 0;
        
        tileImages.forEach(img => {
            if (img.complete && img.naturalHeight > 0) {
                loadedImages++;
            } else if (img.complete && img.naturalHeight === 0) {
                brokenImages++;
            }
        });
        
        console.log('✅ Geladene Bilder:', loadedImages);
        console.log('❌ Fehlende Bilder:', brokenImages);
        const loadRate = (loadedImages + brokenImages) > 0 ? ((loadedImages / (loadedImages + brokenImages)) * 100).toFixed(1) : 0;
        console.log('📊 Bild-Lade-Rate:', loadRate + '%');
        
        if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
            console.log('✅ SYSTEM FUNKTIONIERT KORREKT');
        } else {
            console.log('❌ SYSTEM HAT PROBLEME');
        }
        
        console.log('🔍 === ENDE DEBUG-ANALYSE ===');
    };
    
    // Automatische Ausführung nach 2 Sekunden
    setTimeout(() => {
        console.log('🚀 Starte automatische Debug-Analyse...');
        window.autoDebug();
    }, 2000);
    
    // Automatische Debug-Funktion beim Laden
    window.autoDebug = () => {
        console.log('🔍 === AUTOMATISCHE DEBUG-ANALYSE ===');
        
        // 1. Grundlegende Verfügbarkeit
        console.log('📦 GRUNDLEGENDE VERFÜGBARKEIT:');
        console.log('  - buildingsTilesList verfügbar:', !!window.buildingsTilesList);
        console.log('  - Anzahl Tiles:', window.buildingsTilesList?.length || 0);
        if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
            console.log('  - Sample Tile:', window.buildingsTilesList[0]);
        }
        
        // 2. BiomeData Status
        console.log('🔧 BIOMEDATA STATUS:');
        console.log('  - BiomeData verfügbar:', !!window.BiomeData);
        console.log('  - debugImageLoadingIssue verfügbar:', !!window.debugImageLoadingIssue);
        console.log('  - comprehensiveBiomeMenuDebug verfügbar:', !!window.comprehensiveBiomeMenuDebug);
        
        // 3. DOM-Elemente
        console.log('🌐 DOM-ELEMENTE:');
        console.log('  - Sidebar gefunden:', !!document.querySelector('.sidebar'));
        console.log('  - Biome-Menü gefunden:', !!document.querySelector('#biome-menu'));
        console.log('  - Kategorien-Liste gefunden:', !!document.querySelector('#biome-categories-list'));
        console.log('  - Subkategorien gefunden:', document.querySelectorAll('.subcategory-item').length);
        console.log('  - Tile-Elemente gefunden:', document.querySelectorAll('.tile-element').length);
        console.log('  - Tile-Bilder gefunden:', document.querySelectorAll('.tile-element img').length);
        
        // 4. Bild-Ladung
        console.log('🖼️ BILD-LADUNG:');
        const tileImages = document.querySelectorAll('.tile-element img');
        let loadedImages = 0;
        let brokenImages = 0;
        
        tileImages.forEach(img => {
            if (img.complete && img.naturalHeight > 0) {
                loadedImages++;
            } else if (img.complete && img.naturalHeight === 0) {
                brokenImages++;
            }
        });
        
        console.log('  - Geladene Bilder:', loadedImages);
        console.log('  - Fehlende Bilder:', brokenImages);
        const loadRate = (loadedImages + brokenImages) > 0 ? ((loadedImages / (loadedImages + brokenImages)) * 100).toFixed(1) : 0;
        console.log('  - Bild-Lade-Rate:', loadRate + '%');
        
        // 5. Zusammenfassung
        console.log('📊 ZUSAMMENFASSUNG:');
        const summary = {
            tilesAvailable: !!window.buildingsTilesList && window.buildingsTilesList.length > 0,
            tilesCount: window.buildingsTilesList?.length || 0,
            debugFunctionsAvailable: !!(window.debugImageLoadingIssue && window.comprehensiveBiomeMenuDebug),
            domElementsFound: !!(document.querySelector('.sidebar') && document.querySelector('#biome-menu')),
            subcategoriesFound: document.querySelectorAll('.subcategory-item').length,
            tileElementsFound: document.querySelectorAll('.tile-element').length,
            imagesLoaded: loadedImages,
            imagesBroken: brokenImages,
            imageLoadRate: loadRate + '%'
        };
        
        console.log('  - Zusammenfassung:', summary);
        
        // 6. Status-Bewertung
        console.log('🎯 STATUS-BEWERTUNG:');
        if (summary.tilesAvailable && summary.debugFunctionsAvailable && summary.domElementsFound) {
            console.log('  ✅ SYSTEM FUNKTIONIERT KORREKT');
            console.log('  ✅ Echte Tiles werden geladen');
            console.log('  ✅ Debug-Funktionen verfügbar');
            console.log('  ✅ DOM-Elemente gefunden');
        } else {
            console.log('  ❌ SYSTEM HAT PROBLEME');
            if (!summary.tilesAvailable) console.log('  ❌ Keine Tiles verfügbar');
            if (!summary.debugFunctionsAvailable) console.log('  ❌ Debug-Funktionen fehlen');
            if (!summary.domElementsFound) console.log('  ❌ DOM-Elemente nicht gefunden');
        }
        
        console.log('🔍 === ENDE DEBUG-ANALYSE ===');
        
        return summary;
    };
    
    // Automatische Ausführung nach 2 Sekunden
    setTimeout(() => {
        console.log('🚀 Starte automatische Debug-Analyse...');
        window.autoDebug();
    }, 2000);
    
    // Umfassende Debug-Funktion für den Biome-Menüpunkt
    window.comprehensiveBiomeMenuDebug = () => {
        console.log('[DEBUG] === GLOBALE UMFASSENDE BIOME-MENÜ DEBUG ===');
        
        if (window.BiomeData && window.BiomeData.prototype) {
            const testInstance = new window.BiomeData({});
            return testInstance.comprehensiveBiomeMenuDebug();
        } else {
            console.error('[DEBUG] BiomeData nicht verfügbar');
            return null;
        }
    };
    
    // Schnelle Debug-Funktion für TileEditor-Integration
    window.quickBiomeDebug = () => {
        console.log('[DEBUG] === SCHNELLE BIOME DEBUG ===');
        console.log('[DEBUG] Buildings tiles list verfügbar:', !!window.buildingsTilesList);
        console.log('[DEBUG] buildingsTilesList verfügbar:', !!window.buildingsTilesList);
        console.log('[DEBUG] buildingsTilesList Anzahl:', window.buildingsTilesList?.length || 0);
        console.log('[DEBUG] Biome-Kategorien gefunden:', document.querySelectorAll('.subcategory-item').length);
        console.log('[DEBUG] Tile-Bilder gefunden:', document.querySelectorAll('.tile-element img').length);
        console.log('[DEBUG] === ENDE SCHNELLE DEBUG ===');
    };
    
    // Spezielle Debug-Funktion für Bild-Ladungsproblem
    window.debugImageLoadingIssue = () => {
        console.log('[DEBUG] === GLOBALE BILD-LADUNGS-PROBLEM DEBUG ===');
        
        if (window.BiomeData && window.BiomeData.prototype) {
            const testInstance = new window.BiomeData({});
            return testInstance.debugImageLoadingIssue();
        } else {
            console.error('[DEBUG] BiomeData nicht verfügbar');
            return null;
        }
    };
}
