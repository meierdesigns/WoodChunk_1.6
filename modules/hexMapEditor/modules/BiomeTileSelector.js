"use strict";

class BiomeTileSelector {
    constructor(core) {
        this.core = core;
        this.biomeData = null;
        this.currentLayer = 'terrain';
        this.selectedBiome = null;
        this.selectedCategory = null;
        this.selectedTile = null;
        this.init();
    }

    init() {
        console.log('[BiomeTileSelector] Initializing BiomeTileSelector module');
        this.setupEventListeners();
        
        // Warte bis DOM vollständig geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadInitialData();
            });
        } else {
            // DOM ist bereits geladen, aber warte noch etwas für andere Module
            setTimeout(() => {
                this.loadInitialData();
            }, 500);
        }
    }

    setupEventListeners() {
        // Layer-Tab Event Listener
        document.addEventListener('layerChanged', (event) => {
            this.currentLayer = event.detail.layer;
            this.saveSelection(); // Speichere Layer-Änderung
            this.refreshBiomeList();
        });

        // Global event listener für Layer-Tabs
        const layerTabs = document.querySelectorAll('.layer-tab');
        layerTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                const layerName = event.target.getAttribute('data-layer');
                if (layerName) {
                    this.currentLayer = layerName;
                    this.saveSelection(); // Speichere Layer-Änderung
                    this.refreshBiomeList();
                }
            });
        });
    }

    async loadInitialData() {
        console.log('[BiomeTileSelector] Loading initial data...');
        
        // Prüfe ob Container existiert
        let container = document.getElementById('biome-categories-list');
        if (!container) {
            console.log('[BiomeTileSelector] Container not found, waiting...');
            
            // Warte bis Container verfügbar ist
            let attempts = 0;
            while (!container && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                container = document.getElementById('biome-categories-list');
                attempts++;
                console.log('[BiomeTileSelector] Attempt', attempts, 'to find container');
            }
            
            if (!container) {
                console.error('[BiomeTileSelector] Container still not found after', attempts, 'attempts');
                return;
            }
        }
        
        // Lade BiomeData wenn verfügbar
        if (window.biomeData) {
            this.biomeData = window.biomeData;
            console.log('[BiomeTileSelector] BiomeData loaded from global');
        }
        
        // Lade gespeicherte Auswahl
        const savedSelection = this.loadSelection();
        
        // Initiale Anzeige
        await this.refreshBiomeList();
        
        // Stelle gespeicherte Auswahl wieder her
        if (savedSelection) {
            this.restoreSelection(savedSelection);
        } else {
            // Keine gespeicherte Auswahl: Synchronisiere mit UI-Tabs
            this.syncWithUITabs();
        }
        
        console.log('[BiomeTileSelector] Initial data loading completed');
    }
    
    // Globale Initialisierungsfunktion
    static initializeWhenReady() {
        console.log('[BiomeTileSelector] Static initialization check...');
        
        // Prüfe ob Container existiert
        const container = document.getElementById('biome-categories-list');
        if (container) {
            console.log('[BiomeTileSelector] Container found, initializing...');
            return true;
        }
        
        // Prüfe ob andere Biome-Module bereits geladen sind
        if (window.biomeUI || window.biomeCore) {
            console.log('[BiomeTileSelector] Other biome modules found, waiting for them...');
            return false;
        }
        
        return false;
    }

    async refreshBiomeList() {
        console.log('[BiomeTileSelector] === START refreshBiomeList ===');
        console.log('[BiomeTileSelector] Current layer:', this.currentLayer);
        
        const container = document.getElementById('biome-categories-list');
        if (!container) {
            console.error('[BiomeTileSelector] Container not found!');
            console.log('[BiomeTileSelector] Available containers:', document.querySelectorAll('[id*="biome"]'));
            
            // Versuche Container zu finden oder zu erstellen
            const sidebar = document.querySelector('.sidebar') || document.querySelector('#sidebar');
            if (sidebar) {
                console.log('[BiomeTileSelector] Found sidebar, creating container...');
                const newContainer = document.createElement('div');
                newContainer.id = 'biome-categories-list';
                newContainer.className = 'biome-categories-list';
                sidebar.appendChild(newContainer);
                
                console.log('[BiomeTileSelector] Created new container');
            } else {
                console.error('[BiomeTileSelector] No sidebar found, cannot create container');
                return;
            }
        }

        // Lösche vorhandene Inhalte
        container.innerHTML = '';
        
        // Lade Biome-Daten basierend auf Layer
        let biomes = await this.loadBiomesForLayer();
        
        // Erstelle hierarchische Struktur
        await this.createHierarchicalStructure(container, biomes);
        
        console.log('[BiomeTileSelector] === END refreshBiomeList ===');
    }

    async loadBiomesForLayer() {
        console.log('[BiomeTileSelector] Loading biomes for layer:', this.currentLayer);
        
        let biomes = [];
        
        if (this.currentLayer === 'streets') {
            // Für Straßen und Siedlungen: Lade echte Buildings-Daten
            console.log('[BiomeTileSelector] Loading real buildings data...');
            
            // Versuche echte Buildings-Daten zu laden
            let buildingsData = await this.loadRealBuildingsData();
            
            if (buildingsData && buildingsData.length > 0) {
                console.log('[BiomeTileSelector] Using real buildings data:', buildingsData.length, 'categories');
                biomes = [{
                    name: 'Buildings',
                    type: 'entities',
                    icon: '🏗️',
                    color: '#00fc02',
                    categories: buildingsData
                }];
            } else {
                console.log('[BiomeTileSelector] Using fallback buildings data');
                biomes = [{
                    name: 'Buildings',
                    type: 'entities',
                    icon: '🏗️',
                    color: '#00fc02',
                    categories: this.getFallbackBuildingsCategories()
                }];
            }
            
            // Debug: Zeige geladene Daten
            console.log('[BiomeTileSelector] Final buildings biomes:', biomes);
            if (biomes[0] && biomes[0].categories) {
                biomes[0].categories.forEach((category, index) => {
                    console.log(`[BiomeTileSelector] Category ${index}:`, category.name, 'with', category.tiles ? category.tiles.length : 0, 'tiles');
                });
            }
        } else {
            // Für Terrain: Lade echte Biome-Daten
            console.log('[BiomeTileSelector] Loading real terrain biomes...');
            
            // Versuche echte Terrain-Biome-Daten zu laden
            let terrainBiomes = await this.loadRealTerrainBiomes();
            
            if (terrainBiomes && terrainBiomes.length > 0) {
                console.log('[BiomeTileSelector] Using real terrain biomes:', terrainBiomes.length, 'biomes');
                biomes = terrainBiomes;
            } else {
                console.log('[BiomeTileSelector] Using fallback terrain biomes');
                biomes = this.getFallbackTerrainBiomes();
            }
        }
        
        console.log('[BiomeTileSelector] Loaded biomes:', biomes.length);
        return biomes;
    }

    async createHierarchicalStructure(container, biomes) {
        console.log('[BiomeTileSelector] Creating hierarchical structure for', biomes.length, 'biomes');
        
        for (const biome of biomes) {
            const biomeElement = this.createBiomeElement(biome);
            container.appendChild(biomeElement);
            
            // Prüfe ob es ein Terrain-Biome ist (sollte direkt ohne Kategorien angezeigt werden)
            const isTerrainBiome = biome.type === 'biome' && biome.name !== 'Buildings';
            
            if (isTerrainBiome) {
                // Terrain-Biome: Zeige Tiles direkt ohne Kategorien
                console.log('[BiomeTileSelector] Terrain biome detected:', biome.name, '- showing tiles directly');
                
                // Sammle alle Tiles aus dem Biome
                const allTiles = [];
                if (biome.tiles) {
                    allTiles.push(...biome.tiles);
                }
                
                // Erstelle Tiles direkt unter der Biome-Hauptkarte
                for (const tile of allTiles) {
                    const tileElement = this.createTileElement(tile, null, biome);
                    biomeElement.appendChild(tileElement);
                }
            } else if (biome.categories && biome.categories.length > 0) {
                // Nicht-Terrain Biome mit Kategorien: Zeige Kategorien-Struktur
                for (const category of biome.categories) {
                    const categoryElement = this.createCategoryElement(category, biome);
                    biomeElement.appendChild(categoryElement);
                    
                    // Erstelle Tiles für jede Kategorie
                    for (const tile of category.tiles) {
                        const tileElement = this.createTileElement(tile, category, biome);
                        categoryElement.appendChild(tileElement);
                    }
                }
            } else {
                // Fallback: Keine Kategorien vorhanden - zeige Tiles direkt
                console.log('[BiomeTileSelector] No categories found for biome:', biome.name, '- showing tiles directly');
                
                const allTiles = [];
                if (biome.tiles) {
                    allTiles.push(...biome.tiles);
                }
                
                for (const tile of allTiles) {
                    const tileElement = this.createTileElement(tile, null, biome);
                    biomeElement.appendChild(tileElement);
                }
            }
        }
        
        // Update Kategorien-Zähler
        this.updateCategoryCount(biomes.length);
    }

    createBiomeElement(biome) {
        const biomeElement = document.createElement('div');
        biomeElement.className = 'biome-selector-biome';
        biomeElement.setAttribute('data-biome-name', biome.name);
        biomeElement.style.cssText = `
            margin: 8px 0;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid ${biome.color};
            border-radius: 6px;
            width: 100%;
            box-sizing: border-box;
        `;
        
        const biomeHeader = document.createElement('div');
        biomeHeader.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
            font-size: 14px;
            color: ${biome.color};
            margin-bottom: 8px;
            cursor: pointer;
        `;
        
        biomeHeader.innerHTML = `
            <span style="font-size: 18px;">${biome.icon}</span>
            <span>${biome.name}</span>
            <span style="margin-left: auto; font-size: 12px; color: #999;">(${biome.type})</span>
        `;
        
        biomeHeader.addEventListener('click', () => {
            this.selectBiome(biome);
        });
        
        // Hover-Effekte für Biome
        biomeHeader.addEventListener('mouseenter', () => {
            if (!this.selectedBiome || this.selectedBiome.name !== biome.name) {
                biomeHeader.style.background = 'rgba(255, 255, 255, 0.1)';
                biomeHeader.style.transform = 'scale(1.02)';
            }
        });
        
        biomeHeader.addEventListener('mouseleave', () => {
            if (!this.selectedBiome || this.selectedBiome.name !== biome.name) {
                biomeHeader.style.background = 'transparent';
                biomeHeader.style.transform = 'scale(1)';
            }
        });
        
        biomeElement.appendChild(biomeHeader);
        return biomeElement;
    }

    createCategoryElement(category, biome) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'biome-selector-category';
        categoryElement.setAttribute('data-category-name', category.name);
        categoryElement.setAttribute('data-biome-name', biome.name);
        categoryElement.style.cssText = `
            margin: 4px 0 4px 8px;
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid ${category.color};
            border-radius: 4px;
            width: calc(100% - 8px);
            box-sizing: border-box;
        `;
        
        const categoryHeader = document.createElement('div');
        categoryHeader.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: bold;
            font-size: 12px;
            color: ${category.color};
            margin-bottom: 6px;
            cursor: pointer;
        `;
        
        categoryHeader.innerHTML = `
            <span style="font-size: 14px;">${category.icon}</span>
            <span>${category.name}</span>
        `;
        
        categoryHeader.addEventListener('click', () => {
            this.selectCategory(category, biome);
        });
        
        // Hover-Effekte für Kategorien
        categoryHeader.addEventListener('mouseenter', () => {
            if (!this.selectedCategory || this.selectedCategory.name !== category.name) {
                categoryHeader.style.background = 'rgba(255, 255, 255, 0.1)';
                categoryHeader.style.transform = 'scale(1.02)';
            }
        });
        
        categoryHeader.addEventListener('mouseleave', () => {
            if (!this.selectedCategory || this.selectedCategory.name !== category.name) {
                categoryHeader.style.background = 'transparent';
                categoryHeader.style.transform = 'scale(1)';
            }
        });
        
        categoryElement.appendChild(categoryHeader);
        return categoryElement;
    }

    createTileElement(tile, category, biome) {
        const tileElement = document.createElement('div');
        tileElement.className = 'biome-selector-tile';
        tileElement.setAttribute('data-tile-name', tile.name);
        tileElement.setAttribute('data-category-name', category ? category.name : 'direct');
        tileElement.setAttribute('data-biome-name', biome.name);
        
        // Größere Tiles für direkte Anzeige unter Biomes (ohne Kategorien)
        const isDirectTile = !category;
        const tileSize = isDirectTile ? 32 : 20;
        const marginLeft = isDirectTile ? 8 : 16;
        
        tileElement.style.cssText = `
            margin: 4px 0 4px ${marginLeft}px;
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            width: calc(100% - ${marginLeft}px);
            box-sizing: border-box;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // Korrigiere Bildpfad mit Biome-Kontext
        const correctedImagePath = this.correctImagePathWithBiome(tile.image, biome.name);
        
        console.log('[BiomeTileSelector] Creating tile element:', {
            tileName: tile.name,
            originalImage: tile.image,
            correctedImage: correctedImagePath,
            biomeName: biome.name,
            isDirectTile: isDirectTile
        });
        
        tileElement.innerHTML = `
            <img src="${correctedImagePath}" alt="${tile.name}" style="width: ${tileSize}px; height: ${tileSize}px; object-fit: contain; border-radius: 3px; border: 1px solid rgba(255, 255, 255, 0.3);"
                 onerror="console.log('[BiomeTileSelector] Image failed to load:', '${correctedImagePath}'); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 onload="console.log('[BiomeTileSelector] Image loaded successfully:', '${correctedImagePath}'); this.style.display='block'; this.nextElementSibling.style.display='none';">
            <div class="tile-fallback" style="display: none; width: ${tileSize}px; height: ${tileSize}px; background: rgba(255, 255, 255, 0.2); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: ${isDirectTile ? '14px' : '12px'}; color: #ccc; border: 1px solid rgba(255, 255, 255, 0.3);">${tile.icon || '🧩'}</div>
            <span style="font-size: ${isDirectTile ? '12px' : '10px'}; color: #ccc; font-weight: ${isDirectTile ? 'bold' : 'normal'};">${tile.name}</span>
        `;
        
        tileElement.addEventListener('click', () => {
            this.selectTile(tile, category, biome);
        });
        
        tileElement.addEventListener('mouseenter', () => {
            // Nur Hover-Effekt anzeigen wenn nicht bereits selektiert
            if (!this.selectedTile || this.selectedTile.name !== tile.name) {
                tileElement.style.background = 'rgba(255, 255, 255, 0.25)';
                tileElement.style.transform = 'scale(1.03)';
                tileElement.style.boxShadow = '0 0 6px rgba(255, 255, 255, 0.3)';
            }
        });
        
        tileElement.addEventListener('mouseleave', () => {
            // Zurücksetzen auf Standard-Zustand
            if (!this.selectedTile || this.selectedTile.name !== tile.name) {
                tileElement.style.background = 'rgba(255, 255, 255, 0.1)';
                tileElement.style.transform = 'scale(1)';
                tileElement.style.boxShadow = 'none';
                tileElement.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
        
        return tileElement;
    }

    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        if (imagePath.startsWith('assets/')) {
            return '/' + imagePath;
        } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            // Prüfe ob es ein Buildings-Tile ist (für Streets-Layer)
            if (this.currentLayer === 'streets') {
                return '/assets/biomes/Buildings/tiles/' + imagePath;
            } else {
                // Für Terrain-Biome: Verwende den Biome-Namen aus dem Kontext
                return '/assets/biomes/' + this.getBiomeNameForImage(imagePath) + '/tiles/' + imagePath;
            }
        }
        return imagePath;
    }
    
    correctImagePathWithBiome(imagePath, biomeName) {
        if (!imagePath) return '';
        
        console.log('[BiomeTileSelector] Correcting image path:', imagePath, 'for biome:', biomeName);
        
        // Wenn der Pfad bereits vollständig ist
        if (imagePath.startsWith('assets/')) {
            const correctedPath = '/' + imagePath;
            console.log('[BiomeTileSelector] Already full path, corrected to:', correctedPath);
            return correctedPath;
        }
        
        // Wenn der Pfad bereits mit / beginnt
        if (imagePath.startsWith('/')) {
            console.log('[BiomeTileSelector] Already absolute path:', imagePath);
            return imagePath;
        }
        
        // Wenn es eine URL ist
        if (imagePath.startsWith('http')) {
            console.log('[BiomeTileSelector] Already URL:', imagePath);
            return imagePath;
        }
        
        // Für relative Pfade: Konstruiere den korrekten Pfad
        let correctedPath;
        
        // Prüfe ob es ein Buildings-Tile ist (für Streets-Layer)
        if (this.currentLayer === 'streets') {
            correctedPath = '/assets/biomes/Buildings/tiles/' + imagePath;
        } else {
            // Für Terrain-Biome: Verwende den übergebenen Biome-Namen
            correctedPath = '/assets/biomes/' + biomeName + '/tiles/' + imagePath;
        }
        
        console.log('[BiomeTileSelector] Corrected path:', correctedPath);
        
        // Add cache busting for Buildings tiles
        if (biomeName === 'Buildings' || correctedPath.includes('Buildings')) {
            const timestamp = Date.now();
            const cacheBustedPath = correctedPath + (correctedPath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[BiomeTileSelector] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        return correctedPath;
    }
    
    getBiomeNameForImage(imagePath) {
        // Bestimme Biome basierend auf dem Bildnamen
        if (imagePath.includes('forest') || imagePath.includes('wald') || imagePath.includes('Forest')) {
            return 'Forest';
        } else if (imagePath.includes('mountain') || imagePath.includes('berg') || imagePath.includes('Mountain')) {
            return 'Mountains';
        } else if (imagePath.includes('water') || imagePath.includes('wasser')) {
            return 'Water';
        } else if (imagePath.includes('desert')) {
            return 'Desert';
        } else if (imagePath.includes('swamp')) {
            return 'Swamp';
        } else if (imagePath.includes('snow')) {
            return 'Snow';
        } else if (imagePath.includes('jungle')) {
            return 'Jungle';
        } else if (imagePath.includes('badlands')) {
            return 'Badlands';
        } else if (imagePath.includes('Slice ')) {
            return 'Unassigned';
        } else if (imagePath.includes('void') || imagePath.includes('Void')) {
            return 'Unassigned';
        }
        return 'Forest'; // Fallback
    }

    updateCategoryCount(count) {
        const countElement = document.getElementById('biome-categories-count');
        if (countElement) {
            countElement.textContent = `${count} Kategorien`;
        }
    }

    // Selection Methods
    selectBiome(biome) {
        console.log('[BiomeTileSelector] Biome selected:', biome.name);
        this.selectedBiome = biome;
        this.selectedCategory = null;
        this.selectedTile = null;
        
        // Speichere Auswahl persistent
        this.saveSelection();
        
        // Visual feedback
        this.updateSelectionVisuals();
        
        // Notify core
        if (this.core) {
            if (this.core.onBiomeSelected) {
                this.core.onBiomeSelected(biome);
            }
            if (this.core.setSelectedBiome) {
                this.core.setSelectedBiome(biome.name);
            }
        }
    }

    selectCategory(category, biome) {
        console.log('[BiomeTileSelector] Category selected:', category.name, 'in biome:', biome.name);
        this.selectedBiome = biome;
        this.selectedCategory = category;
        this.selectedTile = null;
        
        // Speichere Auswahl persistent
        this.saveSelection();
        
        // Visual feedback
        this.updateSelectionVisuals();
        
        // Notify core
        if (this.core) {
            if (this.core.onCategorySelected) {
                this.core.onCategorySelected(category, biome);
            }
            if (this.core.setSelectedBiome) {
                this.core.setSelectedBiome(biome.name);
            }
        }
    }

    selectTile(tile, category, biome) {
        console.log('[BiomeTileSelector] Tile selected:', tile.name, 'in category:', category ? category.name : 'direct', 'biome:', biome.name);
        console.log('[BiomeTileSelector] Tile details:', {
            name: tile.name,
            image: tile.image,
            icon: tile.icon
        });
        
        // Speichere vorherige Auswahl für Debug
        const previousTile = this.selectedTile;
        if (previousTile) {
            console.log('[BiomeTileSelector] Previous tile:', previousTile.name);
        }
        
        this.selectedBiome = biome;
        this.selectedCategory = category;
        this.selectedTile = tile;
        
        // Speichere Auswahl persistent
        this.saveSelection();
        
        // Visual feedback
        this.updateSelectionVisuals();
        
        // Notify core
        if (this.core) {
            console.log('[BiomeTileSelector] Core object available:', !!this.core);
            console.log('[BiomeTileSelector] Core has setSelectedTile:', typeof this.core.setSelectedTile);
            if (this.core.setSelectedTile) {
                console.log('[BiomeTileSelector] Calling core.setSelectedTile with:', tile);
                this.core.setSelectedTile(tile);
                console.log('[BiomeTileSelector] After setSelectedTile - core.selectedTile:', this.core.selectedTile?.name);
            } else {
                console.error('[BiomeTileSelector] Core does not have setSelectedTile method!');
            }
            if (this.core.setSelectedBiome) {
                this.core.setSelectedBiome(biome.name);
            }
        } else {
            console.error('[BiomeTileSelector] Core object is not available!');
        }
        
        // Show toast
        if (window.ToastManager) {
            window.ToastManager.showToast(`Tile "${tile.name}" ausgewählt`, 'success');
        }
        
        // Debug: Prüfe ob alle Tiles korrekt zurückgesetzt wurden
        setTimeout(() => {
            const allTiles = document.querySelectorAll('.biome-selector-tile');
            const selectedTiles = Array.from(allTiles).filter(t => 
                t.style.borderColor === 'rgb(76, 175, 80)' || 
                t.style.borderColor === '#4CAF50'
            );
            console.log('[BiomeTileSelector] Debug - Selected tiles count:', selectedTiles.length);
            if (selectedTiles.length > 1) {
                console.warn('[BiomeTileSelector] Multiple tiles appear selected!');
                selectedTiles.forEach((tile, index) => {
                    console.log(`  Tile ${index + 1}:`, tile.getAttribute('data-tile-name'));
                });
            }
        }, 100);
    }

    updateSelectionVisuals() {
        // Reset all selections
        document.querySelectorAll('.biome-selector-biome, .biome-selector-category, .biome-selector-tile').forEach(el => {
            // Reset biome elements
            if (el.classList.contains('biome-selector-biome')) {
                el.style.borderWidth = '2px';
                el.style.background = 'rgba(0, 0, 0, 0.3)';
                el.style.boxShadow = 'none';
                el.style.transform = 'scale(1)';
            }
            // Reset category elements
            if (el.classList.contains('biome-selector-category')) {
                el.style.borderWidth = '1px';
                el.style.background = 'rgba(255, 255, 255, 0.05)';
                el.style.boxShadow = 'none';
                el.style.transform = 'scale(1)';
            }
            // Reset tile elements
            if (el.classList.contains('biome-selector-tile')) {
                el.style.borderWidth = '1px';
                el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                el.style.background = 'rgba(255, 255, 255, 0.1)';
                el.style.boxShadow = 'none';
                el.style.transform = 'scale(1)';
            }
        });
        
        // Highlight selected elements
        if (this.selectedBiome) {
            const biomeElement = document.querySelector(`[data-biome-name="${this.selectedBiome.name}"]`);
            if (biomeElement) {
                biomeElement.style.borderWidth = '3px';
                biomeElement.style.background = 'rgba(0, 0, 0, 0.5)';
                biomeElement.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.3)';
            }
        }
        
        if (this.selectedCategory) {
            const categoryElement = document.querySelector(`[data-category-name="${this.selectedCategory.name}"][data-biome-name="${this.selectedBiome.name}"]`);
            if (categoryElement) {
                categoryElement.style.borderWidth = '2px';
                categoryElement.style.background = 'rgba(255, 255, 255, 0.15)';
                categoryElement.style.boxShadow = '0 0 6px rgba(255, 255, 255, 0.2)';
            }
        }
        
        if (this.selectedTile) {
            const categoryName = this.selectedCategory ? this.selectedCategory.name : 'direct';
            const tileElement = document.querySelector(`[data-tile-name="${this.selectedTile.name}"][data-category-name="${categoryName}"][data-biome-name="${this.selectedBiome.name}"]`);
            if (tileElement) {
                tileElement.style.borderWidth = '2px';
                tileElement.style.borderColor = '#4CAF50';
                tileElement.style.background = 'rgba(76, 175, 80, 0.3)';
                tileElement.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.5)';
                tileElement.style.transform = 'scale(1.05)';
            }
        }
    }

    // Public API
    getSelectedBiome() {
        return this.selectedBiome;
    }

    getSelectedCategory() {
        return this.selectedCategory;
    }

    getSelectedTile() {
        return this.selectedTile;
    }

    setCurrentLayer(layer) {
        console.log('[BiomeTileSelector] Setting current layer:', layer);
        this.currentLayer = layer;
        this.saveSelection(); // Speichere Layer-Änderung
        
        // Aktualisiere UI-Tabs
        this.updateLayerTabs(layer);
        
        this.refreshBiomeList();
    }
    
    updateLayerTabs(activeLayer) {
        console.log('[BiomeTileSelector] Updating layer tabs, active layer:', activeLayer);
        
        const layerTabs = document.querySelectorAll('.layer-tab');
        layerTabs.forEach(tab => {
            const layerName = tab.getAttribute('data-layer');
            if (layerName === activeLayer) {
                tab.classList.add('active');
                console.log('[BiomeTileSelector] Activated tab:', layerName);
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    syncWithUITabs() {
        console.log('[BiomeTileSelector] Syncing with UI tabs...');
        
        const activeTab = document.querySelector('.layer-tab.active');
        if (activeTab) {
            const layerName = activeTab.getAttribute('data-layer');
            if (layerName && layerName !== this.currentLayer) {
                console.log('[BiomeTileSelector] Syncing layer from UI tab:', layerName);
                this.setCurrentLayer(layerName);
            }
        } else {
            // Kein aktiver Tab gefunden, setze Standard
            console.log('[BiomeTileSelector] No active tab found, setting default layer: terrain');
            this.setCurrentLayer('terrain');
        }
    }

    // Buildings Data Loading
    async loadRealBuildingsData() {
        console.log('[BiomeTileSelector] Loading real buildings data...');
        
        let categories = [];
        
        // 1. Versuche buildingsTilesList zu laden
        if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
            console.log('[BiomeTileSelector] Found buildingsTilesList:', window.buildingsTilesList.length, 'tiles');
            categories = this.processBuildingsTilesList(window.buildingsTilesList);
        } else {
            // Skip tilesList.js loading for faster performance
            console.log('[BiomeTileSelector] No buildingsTilesList found, using fallback');
        }
        
        // 3. Fallback: Verwende andere Datenquellen
        if (categories.length === 0) {
            console.log('[BiomeTileSelector] No categories found, using fallback');
        }
        
        console.log('[BiomeTileSelector] Final buildings categories:', categories.length);
        return categories;
    }
    
    processBuildingsTiles(tiles) {
        console.log('[BiomeTileSelector] Processing Buildings tiles:', tiles.length);
        
        // Gruppiere Tiles nach Kategorien
        const categories = {};
        
        tiles.forEach(tile => {
            // Bestimme Kategorie basierend auf Tile-Eigenschaften
            let categoryName = 'building'; // Standard
            
            if (tile.buildingCategory) {
                categoryName = tile.buildingCategory;
            } else if (tile.categoryName) {
                categoryName = tile.categoryName;
            } else if (tile.name) {
                // Versuche Kategorie aus dem Namen zu extrahieren
                const name = tile.name.toLowerCase();
                if (name.includes('turm') || name.includes('tower')) {
                    categoryName = 'tower';
                } else if (name.includes('burg') || name.includes('castle')) {
                    categoryName = 'castle';
                } else if (name.includes('tempel') || name.includes('temple')) {
                    categoryName = 'temple';
                } else if (name.includes('mine') || name.includes('mining')) {
                    categoryName = 'mining_site';
                } else if (name.includes('dorf') || name.includes('village')) {
                    categoryName = 'village';
                } else if (name.includes('siedlung') || name.includes('settlement')) {
                    categoryName = 'settlement';
                }
            }
            
            if (!categories[categoryName]) {
                categories[categoryName] = {
                    name: this.getCategoryDisplayName(categoryName),
                    icon: this.getCategoryIcon(categoryName),
                    color: this.getCategoryColor(categoryName),
                    tiles: []
                };
            }
            
            categories[categoryName].tiles.push({
                name: tile.name || 'Unbekannt',
                image: tile.image || '',
                icon: tile.icon || this.getCategoryIcon(categoryName)
            });
        });
        
        console.log('[BiomeTileSelector] Created categories:', Object.keys(categories));
        return Object.values(categories);
    }
    
    // Terrain Biomes Data Loading
    async loadRealTerrainBiomes() {
        console.log('[BiomeTileSelector] Loading real terrain biomes...');
        
        try {
            // Versuche verschiedene Datenquellen für Terrain-Biome
            let terrainBiomes = [];
            
            // 1. Aus BiomeData (Hauptquelle)
            if (window.biomeData && typeof window.biomeData.loadBiomeOptionsForHexTiles === 'function') {
                console.log('[BiomeTileSelector] Using BiomeData for terrain biomes');
                terrainBiomes = await this.loadTerrainBiomesFromBiomeData();
            }
            // 2. Aus globalen Biome-Daten
            else if (window.BIOME_DATA) {
                console.log('[BiomeTileSelector] Using global BIOME_DATA');
                terrainBiomes = await this.loadTerrainBiomesFromGlobalData();
            }
            
            return terrainBiomes;
        } catch (error) {
            console.error('[BiomeTileSelector] Error loading real terrain biomes:', error);
            return null;
        }
    }
    
    async loadTerrainBiomesFromBiomeData() {
        console.log('[BiomeTileSelector] Loading terrain biomes from BiomeData...');
        
        try {
            const biomeOptions = await window.biomeData.loadBiomeOptionsForHexTiles();
            console.log('[BiomeTileSelector] BiomeData returned:', biomeOptions);
            console.log('[BiomeTileSelector] BiomeData type:', typeof biomeOptions);
            console.log('[BiomeTileSelector] BiomeData is array:', Array.isArray(biomeOptions));
            
            if (!biomeOptions || !Array.isArray(biomeOptions)) {
                console.warn('[BiomeTileSelector] Invalid biome options from BiomeData');
                return [];
            }
            
            const terrainBiomes = [];
            
            for (const biomeOption of biomeOptions) {
                console.log('[BiomeTileSelector] Processing biome option:', biomeOption);
                
                if (biomeOption.type === 'biome' && biomeOption.name !== 'Buildings') {
                    console.log('[BiomeTileSelector] Processing biome:', biomeOption.name);
                    
                    const biome = {
                        name: biomeOption.name,
                        type: 'biome',
                        icon: this.getBiomeIcon(biomeOption.name),
                        color: this.getBiomeColor(biomeOption.name),
                        categories: [], // Leere Kategorien für Terrain-Biomes
                        tiles: [] // Direkte Tiles für Terrain-Biomes
                    };
                    
                    // Lade Tiles aus der tilesList.js Datei
                    const tiles = await this.loadTilesFromTilesList(biomeOption.name);
                    if (tiles && tiles.length > 0) {
                        biome.tiles = tiles;
                        console.log('[BiomeTileSelector] Loaded', tiles.length, 'tiles for biome', biomeOption.name);
                    } else {
                        // Sammle alle Tiles aus allen Kategorien des Biomes als Fallback
                        if (biomeOption.categories && Array.isArray(biomeOption.categories)) {
                            for (const category of biomeOption.categories) {
                                if (category.tiles && Array.isArray(category.tiles)) {
                                    biome.tiles.push(...category.tiles);
                                }
                            }
                        }
                        
                        // Fallback: Erstelle ein Standard-Tile wenn keine Tiles gefunden wurden
                        if (biome.tiles.length === 0) {
                            // Use existing tile files instead of generating non-existent names
                            const fallbackImageMap = {
                                'Forest': 'forest.png',
                                'Mountains': 'Mountain.png',
                                'Water': 'water.png',
                                'Desert': 'desert.png',
                                'Swamp': 'swamp.png',
                                'Plain': 'grass.png',
                                'Jungle': 'jungle.png',
                                'Badlands': 'badlands.png',
                                'Snow': 'snow.png',
                                'Ocean': 'ocean.png',
                                'Unassigned': 'Slice 1.png'
                            };
                            
                            biome.tiles.push({
                                name: biomeOption.name,
                                image: fallbackImageMap[biomeOption.name] || `${biomeOption.name.toLowerCase()}.png`,
                                icon: this.getBiomeIcon(biomeOption.name)
                            });
                        }
                    }
                    
                    console.log('[BiomeTileSelector] Biome', biomeOption.name, 'has', biome.tiles.length, 'tiles');
                    terrainBiomes.push(biome);
                } else {
                    console.log('[BiomeTileSelector] Skipping biome:', biomeOption.name, 'type:', biomeOption.type);
                }
            }
            
            console.log('[BiomeTileSelector] Processed terrain biomes:', terrainBiomes.length);
            console.log('[BiomeTileSelector] Terrain biomes:', terrainBiomes.map(b => ({name: b.name, tiles: b.tiles.length})));
            return terrainBiomes;
            
        } catch (error) {
            console.error('[BiomeTileSelector] Error loading from BiomeData:', error);
            return [];
        }
    }
    
    async loadTilesFromTilesList(biomeName) {
        console.log('[BiomeTileSelector] Skipping tilesList.js loading for biome:', biomeName, '- using fallback');
        
        // Spezialbehandlung für Void
        if (biomeName === 'Void') {
            console.log('[BiomeTileSelector] Void biome detected, returning empty tiles list');
            return [];
        }
        
        // Skip tilesList.js loading for faster performance
        return [];
    }
    
    async loadTerrainBiomesFromGlobalData() {
        console.log('[BiomeTileSelector] Loading terrain biomes from global BIOME_DATA...');
        
        try {
            const terrainBiomes = [];
            const biomes = window.BIOME_DATA || [];
            
            for (const biome of biomes) {
                if (biome.type === 'biome' && biome.name !== 'Buildings') {
                    const terrainBiome = {
                        name: biome.name,
                        type: 'biome',
                        icon: this.getBiomeIcon(biome.name),
                        color: this.getBiomeColor(biome.name),
                        categories: [], // Leere Kategorien für Terrain-Biomes
                        tiles: [] // Direkte Tiles für Terrain-Biomes
                    };
                    
                    // Lade Tiles aus der tilesList.js Datei
                    const tiles = await this.loadTilesFromTilesList(biome.name);
                    if (tiles && tiles.length > 0) {
                        terrainBiome.tiles = tiles;
                        console.log('[BiomeTileSelector] Loaded', tiles.length, 'tiles for biome', biome.name);
                    } else {
                        // Fallback: Sammle alle Tiles aus allen Kategorien des Biomes
                        if (biome.categories && Array.isArray(biome.categories)) {
                            for (const category of biome.categories) {
                                if (category.tiles && Array.isArray(category.tiles)) {
                                    terrainBiome.tiles.push(...category.tiles);
                                }
                            }
                        }
                    }
                    
                    console.log('[BiomeTileSelector] Biome', biome.name, 'has', terrainBiome.tiles.length, 'tiles');
                    terrainBiomes.push(terrainBiome);
                }
            }
            
            return terrainBiomes;
        } catch (error) {
            console.error('[BiomeTileSelector] Error loading from global BIOME_DATA:', error);
            return [];
        }
    }
    
    processBuildingsTilesList(tilesList) {
        console.log('[BiomeTileSelector] Processing buildingsTilesList...');
        
        // Gruppiere Tiles nach Kategorien
        const categoryMap = new Map();
        
        tilesList.forEach(tile => {
            const category = tile.buildingCategory || tile.categoryName || 'building';
            const displayName = this.getCategoryDisplayName(category);
            
            if (!categoryMap.has(displayName)) {
                categoryMap.set(displayName, {
                    name: displayName,
                    icon: this.getCategoryIcon(category),
                    color: this.getCategoryColor(category),
                    tiles: []
                });
            }
            
            // Korrigiere den Bildpfad für Buildings
            let correctedImage = tile.image || tile.imagePath || tile.fileName;
            if (correctedImage) {
                // Entferne den assets/ Pfad-Prefix, da er später hinzugefügt wird
                if (correctedImage.startsWith('assets/biomes/Buildings/tiles/')) {
                    correctedImage = correctedImage.replace('assets/biomes/Buildings/tiles/', '');
                } else if (correctedImage.startsWith('/assets/biomes/Buildings/tiles/')) {
                    correctedImage = correctedImage.replace('/assets/biomes/Buildings/tiles/', '');
                }
            }
            
            categoryMap.get(displayName).tiles.push({
                name: tile.name || tile.tileName || 'Unbekannt',
                image: correctedImage,
                icon: tile.icon || this.getCategoryIcon(category)
            });
        });
        
        console.log('[BiomeTileSelector] Processed buildings categories:', Array.from(categoryMap.keys()));
        return Array.from(categoryMap.values());
    }
    
    getCategoryDisplayName(category) {
        const displayNames = {
            'building': 'Haus',
            'tower': 'Turm',
            'castle': 'Burg',
            'temple': 'Tempel',
            'mining_site': 'Mine',
            'village': 'Dorf',
            'settlement': 'Siedlung',
            'ritual_site': 'Ritualstätte'
        };
        return displayNames[category] || category;
    }
    
    getCategoryIcon(category) {
        const icons = {
            'building': '🏠',
            'tower': '🗼',
            'castle': '🏰',
            'temple': '⛪',
            'mining_site': '⛏️',
            'village': '🏘️',
            'settlement': '🏘️',
            'ritual_site': '🔮'
        };
        return icons[category] || '🏗️';
    }
    
    getCategoryColor(category) {
        const colors = {
            'building': '#4CAF50',
            'tower': '#FF9800',
            'castle': '#9C27B0',
            'temple': '#2196F3',
            'mining_site': '#795548',
            'village': '#8BC34A',
            'settlement': '#607D8B',
            'ritual_site': '#E91E63'
        };
        return colors[category] || '#00fc02';
    }
    
    getBiomeIcon(biomeName) {
        const icons = {
            'Forest': '🌲',
            'Mountains': '⛰️',
            'Water': '💧',
            'Desert': '🏜️',
            'Snow': '❄️',
            'Swamp': '🌿',
            'Plains': '🌾',
            'Hills': '⛰️',
            'Cave': '🕳️',
            'Volcano': '🌋',
            'Island': '🏝️',
            'Beach': '🏖️'
        };
        return icons[biomeName] || '🌍';
    }
    
    getBiomeColor(biomeName) {
        const colors = {
            'Forest': '#4CAF50',
            'Mountains': '#795548',
            'Water': '#2196F3',
            'Desert': '#FF9800',
            'Snow': '#FFFFFF',
            'Swamp': '#8BC34A',
            'Plains': '#CDDC39',
            'Hills': '#9E9E9E',
            'Cave': '#424242',
            'Volcano': '#F44336',
            'Island': '#4CAF50',
            'Beach': '#FFC107'
        };
        return colors[biomeName] || '#9E9E9E';
    }
    
    getFallbackBuildingsCategories() {
        return [
            {
                name: 'Haus',
                icon: '🏠',
                color: '#4CAF50',
                tiles: [
                    { name: 'Haus', image: 'slice_333.png', icon: '🏠', buildingCategory: 'building' }
                ]
            },
            {
                name: 'Turm',
                icon: '🗼',
                color: '#FF9800',
                tiles: [
                    { name: 'Wachturm', image: 'slice_344.png', icon: '🗼', buildingCategory: 'tower' }
                ]
            },
            {
                name: 'Burg',
                icon: '🏰',
                color: '#9C27B0',
                tiles: [
                    { name: 'Burg', image: 'slice_352.png', icon: '🏰', buildingCategory: 'castle' }
                ]
            },
            {
                name: 'Mine',
                icon: '⛏️',
                color: '#795548',
                tiles: [
                    { name: 'Mine', image: 'slice_358.png', icon: '⛏️', buildingCategory: 'mining_site' }
                ]
            }
        ];
    }
    
    getFallbackTerrainBiomes() {
        return [
            {
                name: 'Forest',
                type: 'biome',
                icon: '🌲',
                color: '#4CAF50',
                categories: []
            },
            {
                name: 'Mountains',
                type: 'biome',
                icon: '⛰️',
                color: '#795548',
                categories: []
            },
            {
                name: 'Water',
                type: 'biome',
                icon: '💧',
                color: '#2196F3',
                categories: []
            }
        ];
    }

    // Persistenz-Methoden
    saveSelection() {
        const selection = {
            layer: this.currentLayer,
            biome: this.selectedBiome?.name,
            category: this.selectedCategory?.name,
            tile: this.selectedTile?.name,
            timestamp: Date.now()
        };
        
        localStorage.setItem('biomeTileSelector_selection', JSON.stringify(selection));
        console.log('[BiomeTileSelector] Selection saved:', selection);
    }
    
    loadSelection() {
        try {
            const saved = localStorage.getItem('biomeTileSelector_selection');
            if (saved) {
                const selection = JSON.parse(saved);
                console.log('[BiomeTileSelector] Loading saved selection:', selection);
                
                // Prüfe ob die gespeicherte Auswahl noch gültig ist (nicht älter als 1 Stunde)
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                if (selection.timestamp && selection.timestamp > oneHourAgo) {
                    this.currentLayer = selection.layer || 'terrain';
                    return selection;
                } else {
                    console.log('[BiomeTileSelector] Saved selection too old, using defaults');
                }
            }
        } catch (error) {
            console.warn('[BiomeTileSelector] Error loading selection:', error);
        }
        
        return null;
    }
    
    restoreSelection(selection) {
        if (!selection) return;
        
        console.log('[BiomeTileSelector] Restoring selection:', selection);
        
        // Setze Layer
        if (selection.layer && selection.layer !== this.currentLayer) {
            console.log('[BiomeTileSelector] Restoring layer from', this.currentLayer, 'to', selection.layer);
            this.setCurrentLayer(selection.layer);
            
            // Warte bis die Biome-Liste geladen ist, dann stelle die Auswahl wieder her
            setTimeout(() => {
                this.restoreBiomeSelection(selection);
            }, 1000); // Längere Wartezeit für Layer-Wechsel
        } else {
            // Layer ist bereits korrekt, stelle sofort wieder her
            setTimeout(() => {
                this.restoreBiomeSelection(selection);
            }, 500);
        }
    }
    
    restoreBiomeSelection(selection) {
        if (!selection.biome) return;
        
        // Finde das gespeicherte Biome
        const biomeElements = document.querySelectorAll('.biome-selector-biome');
        for (const biomeElement of biomeElements) {
            const biomeName = biomeElement.getAttribute('data-biome-name');
            if (biomeName === selection.biome) {
                console.log('[BiomeTileSelector] Found saved biome:', biomeName);
                
                // Simuliere Biome-Klick
                const biomeHeader = biomeElement.querySelector('div');
                if (biomeHeader) {
                    biomeHeader.click();
                    
                    // Warte und stelle dann Kategorie wieder her
                    setTimeout(() => {
                        this.restoreCategorySelection(selection);
                    }, 200);
                }
                break;
            }
        }
    }
    
    restoreCategorySelection(selection) {
        if (!selection.category) return;
        
        // Finde die gespeicherte Kategorie
        const categoryElements = document.querySelectorAll('.biome-selector-category');
        for (const categoryElement of categoryElements) {
            const categoryName = categoryElement.getAttribute('data-category-name');
            if (categoryName === selection.category) {
                console.log('[BiomeTileSelector] Found saved category:', categoryName);
                
                // Simuliere Kategorie-Klick
                const categoryHeader = categoryElement.querySelector('div');
                if (categoryHeader) {
                    categoryHeader.click();
                    
                    // Warte und stelle dann Tile wieder her
                    setTimeout(() => {
                        this.restoreTileSelection(selection);
                    }, 200);
                }
                break;
            }
        }
    }
    
    restoreTileSelection(selection) {
        if (!selection.tile) return;
        
        // Finde das gespeicherte Tile
        const tileElements = document.querySelectorAll('.biome-selector-tile');
        for (const tileElement of tileElements) {
            const tileName = tileElement.getAttribute('data-tile-name');
            if (tileName === selection.tile) {
                console.log('[BiomeTileSelector] Found saved tile:', tileName);
                
                // Simuliere Tile-Klick
                tileElement.click();
                break;
            }
        }
    }
    
    // Debug methods
    debug() {
        console.log('[BiomeTileSelector] Debug Info:');
        console.log('- Current Layer:', this.currentLayer);
        console.log('- Selected Biome:', this.selectedBiome?.name);
        console.log('- Selected Category:', this.selectedCategory?.name);
        console.log('- Selected Tile:', this.selectedTile?.name);
        console.log('- BiomeData available:', !!this.biomeData);
        console.log('- buildingsTilesList available:', !!(window.buildingsTilesList && window.buildingsTilesList.length > 0));
        
        // Prüfe verfügbare Module
        console.log('- window.biomeData:', !!window.biomeData);
        console.log('- window.BIOME_DATA:', !!window.BIOME_DATA);
        
        // Prüfe BiomeData-Funktionen
        if (window.biomeData) {
            console.log('- biomeData.loadBiomeOptionsForHexTiles:', typeof window.biomeData.loadBiomeOptionsForHexTiles);
            console.log('- biomeData.loadTilesForCategory:', typeof window.biomeData.loadTilesForCategory);
        }
        
        // Zeige gespeicherte Auswahl
        const saved = localStorage.getItem('biomeTileSelector_selection');
        if (saved) {
            console.log('- Saved selection:', JSON.parse(saved));
        } else {
            console.log('- No saved selection found');
        }
    }
    
    // Debug-Funktion für Terrain-Biome-Ladung
    async debugTerrainLoading() {
        console.log('[BiomeTileSelector] === TERRAIN LOADING DEBUG ===');
        
        try {
            // Teste BiomeData
            if (window.biomeData && typeof window.biomeData.loadBiomeOptionsForHexTiles === 'function') {
                console.log('[BiomeTileSelector] Testing BiomeData...');
                const biomeOptions = await window.biomeData.loadBiomeOptionsForHexTiles();
                console.log('[BiomeTileSelector] BiomeData result:', biomeOptions);
            } else {
                console.log('[BiomeTileSelector] BiomeData not available');
            }
            
            // Teste global BIOME_DATA
            if (window.BIOME_DATA) {
                console.log('[BiomeTileSelector] Global BIOME_DATA:', window.BIOME_DATA);
            } else {
                console.log('[BiomeTileSelector] Global BIOME_DATA not available');
            }
            
            // Teste BiomeUtils
            if (window.BiomeUtils) {
                console.log('[BiomeTileSelector] Testing BiomeUtils...');
                const biomeFolders = await window.BiomeUtils.getBiomeFolders();
                console.log('[BiomeTileSelector] BiomeUtils result:', biomeFolders);
            } else {
                console.log('[BiomeTileSelector] BiomeUtils not available');
            }
            
        } catch (error) {
            console.error('[BiomeTileSelector] Debug error:', error);
        }
        
        console.log('[BiomeTileSelector] === END TERRAIN LOADING DEBUG ===');
    }
}

// Globale Initialisierungsfunktion
window.initializeBiomeTileSelector = () => {
    console.log('[BiomeTileSelector] Global initialization triggered...');
    
    // Prüfe ob bereits eine Instanz existiert
    if (window.biomeTileSelector) {
        console.log('[BiomeTileSelector] Instance already exists, refreshing...');
        window.biomeTileSelector.refreshBiomeList();
        return;
    }
    
    // Prüfe ob Core verfügbar ist
    if (window.mapCore) {
        console.log('[BiomeTileSelector] Creating new instance with mapCore...');
        window.biomeTileSelector = new BiomeTileSelector(window.mapCore);
    } else {
        console.log('[BiomeTileSelector] mapCore not available, creating standalone instance...');
        window.biomeTileSelector = new BiomeTileSelector(null);
    }
};

// Automatische Initialisierung nach DOM-Load
document.addEventListener('DOMContentLoaded', () => {
    console.log('[BiomeTileSelector] DOM loaded, checking initialization...');
    
    // Warte kurz und prüfe dann
    setTimeout(() => {
        if (!window.biomeTileSelector) {
            console.log('[BiomeTileSelector] No instance found, initializing...');
            window.initializeBiomeTileSelector();
        }
    }, 1000);
});

// Fallback: Initialisierung nach 3 Sekunden
setTimeout(() => {
    if (!window.biomeTileSelector) {
        console.log('[BiomeTileSelector] Fallback initialization...');
        window.initializeBiomeTileSelector();
    }
}, 3000);

// Export für globale Verwendung
window.BiomeTileSelector = BiomeTileSelector;
