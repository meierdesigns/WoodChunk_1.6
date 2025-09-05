// Core-Modul für die Geschäftslogik

// Load color configuration if available
if (typeof getColor === 'undefined') {
    // Fallback colors if color system is not loaded
    const getColor = (category, name) => {
        const fallbackColors = {
            biomes: {
                forest: '#4CAF50',
                mountains: '#795548',
                water: '#2196F3',
                desert: '#FF9800',
                snow: '#FFFFFF'
            },
            terrain: {
                grass: '#4CAF50'
            }
        };
        return fallbackColors[category]?.[name] || '#9E9E9E';
    };
}

class MapCore {
    constructor() {
        // console.log('[MapCore] Constructor called');
        
        this.settings = new MapSettings();
        this.tiles = new Map();
        this.layers = {
            terrain: new Map(),
            streets: new Map()
        };
        this.currentLayer = 'terrain';
        this.isDrawing = false;
        this.observers = [];
        
        // Initialize TileMapper
        this.tileMapper = new TileMapper(this);
        
        // Lade verfügbare Biome-Tiles (asynchron)
        this.loadBiomeTiles().then(() => {
    
        }).catch(error => {
            console.warn('[MapCore] Biome tiles loading failed:', error);
        });
        
        // Versuche gespeicherte Einstellungen zu laden
        this.loadMap();
        
        // Korrigiere alte Standardwerte IMMEDIATELY nach dem Laden
        this.correctOldDefaultValues();
        
        // Setze das ausgewählte Tool aus den gespeicherten Einstellungen
        this.selectedTileType = this.settings.selectedTileType;
        
        // KEINE automatische Grid-Initialisierung mehr
        // Die Map bleibt leer, wenn keine Tiles gespeichert sind
    }

    correctOldDefaultValues() {
        let needsSave = false;
        
        // AGGRESSIVE Korrektur: Setze horizontalSpacing auf 0 wenn es 5 ist oder undefined
        if (this.settings.horizontalSpacing === 5 || this.settings.horizontalSpacing === undefined) {
            this.settings.horizontalSpacing = 0;
            needsSave = true;
        }
        
        // Stelle sicher, dass tileSpacingWidth gesetzt ist
        if (this.settings.tileSpacingWidth === undefined) {
            this.settings.tileSpacingWidth = 1;
            needsSave = true;
        }
        
        // Stelle sicher, dass verticalSpacing 0 ist
        if (this.settings.verticalSpacing === undefined) {
            this.settings.verticalSpacing = 0;
            needsSave = true;
        }
        
        if (needsSave) {
            this.saveMap();
            
            // Update UI immediately after correction
            setTimeout(() => {
                this.updateSettingsUI();
            }, 100);
        }
    }
    
    forceCorrectSettings() {
        // Force set the correct values
        this.settings.horizontalSpacing = 0;
        this.settings.verticalSpacing = 0;
        this.settings.tileSpacingWidth = 1;
        
        // Save immediately
        this.saveMap();
        
        // Notify observers
        this.notifyObservers('settingsChanged', { 
            horizontalSpacing: 0,
            verticalSpacing: 0,
            tileSpacingWidth: 1,
            forceCorrected: true
        });
        
        // Force UI update by directly updating input elements
        this.updateSettingsUI();
    }
    
    clearAllStorage() {
        // Clear all map-related localStorage entries
        localStorage.removeItem('mapEditorData');
        localStorage.removeItem('mapEditorSettings');
        
        // Reset settings to defaults
        this.settings = new MapSettings();
        
        // Clear all tiles and layers
        this.tiles.clear();
        Object.keys(this.layers).forEach(layerName => {
            this.layers[layerName].clear();
        });
        
        // Notify observers
        this.notifyObservers('mapCleared', {});
        this.notifyObservers('settingsChanged', { reset: true });
        
        // Update UI after clearing
        setTimeout(() => {
            this.updateSettingsUI();
        }, 100);
        
        return true;
    }
    
    updateSettingsUI() {
        // Update horizontal spacing input
        const horizontalSpacingInput = document.getElementById('horizontal-spacing-input');
        if (horizontalSpacingInput) {
            const newValue = this.settings.horizontalSpacing;
            horizontalSpacingInput.value = newValue;
            horizontalSpacingInput.setAttribute('value', newValue);
            
            // Force a DOM update
            horizontalSpacingInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Verify the update worked
            setTimeout(() => {
                const actualValue = horizontalSpacingInput.value;
                if (actualValue != newValue) {
                    console.warn('[MapCore] UI update may have failed for horizontal spacing. Expected:', newValue, 'Actual:', actualValue);
                }
            }, 50);
        } else {
            console.warn('[MapCore] Horizontal spacing input element not found');
        }
        
                // Update vertical spacing input
        const verticalSpacingInput = document.getElementById('vertical-spacing-input');
        if (verticalSpacingInput) {
            verticalSpacingInput.value = this.settings.verticalSpacing;
            verticalSpacingInput.setAttribute('value', this.settings.verticalSpacing);
        }

        // Update tile spacing width input
        const tileSpacingWidthInput = document.getElementById('tile-spacing-width-input');
        if (tileSpacingWidthInput) {
            tileSpacingWidthInput.value = this.settings.tileSpacingWidth;
            tileSpacingWidthInput.setAttribute('value', this.settings.tileSpacingWidth);
        }

        // Update zoom input
        const zoomInput = document.getElementById('zoom-input');
        if (zoomInput) {
            zoomInput.value = this.settings.zoom;
            zoomInput.setAttribute('value', this.settings.zoom);
        }

        // Update outline width input
        const outlineWidthInput = document.getElementById('outline-width-input');
        if (outlineWidthInput) {
            outlineWidthInput.value = this.settings.outlineWidth;
            outlineWidthInput.setAttribute('value', this.settings.outlineWidth);
        }

        // Update brush size display
        const brushSizeDisplay = document.getElementById('brush-size-display');
        if (brushSizeDisplay) {
            brushSizeDisplay.textContent = this.settings.brushSize || 0;
        }
        
        // Update building scale input
        const buildingScaleInput = document.getElementById('building-scale-input');
        if (buildingScaleInput) {
            buildingScaleInput.value = this.settings.buildingScale || 0.8;
            buildingScaleInput.setAttribute('value', this.settings.buildingScale || 0.8);
            
            // Update the value display
            const valueDisplay = document.getElementById('building-scale-value');
            if (valueDisplay) {
                valueDisplay.textContent = Math.round((this.settings.buildingScale || 0.8) * 100) + '%';
            }
        }
        
        // Update building transparency input
        const buildingTransparencyInput = document.getElementById('building-transparency-input');
        if (buildingTransparencyInput) {
            buildingTransparencyInput.value = this.settings.buildingTransparency || 0.7;
            buildingTransparencyInput.setAttribute('value', this.settings.buildingTransparency || 0.7);
            
            // Update the value display
            const transparencyValueDisplay = document.getElementById('building-transparency-value');
            if (transparencyValueDisplay) {
                transparencyValueDisplay.textContent = Math.round((this.settings.buildingTransparency || 0.7) * 100) + '%';
            }
        }
        
        // Update native transparency checkbox
        const useNativeTransparencyCheckbox = document.getElementById('use-native-transparency-checkbox');
        if (useNativeTransparencyCheckbox) {
            useNativeTransparencyCheckbox.checked = this.settings.useNativeTransparency !== false;
        }
    }
    
    forceRefreshSettingsUI() {
        console.log('[MapCore] Force refreshing settings UI...');
        
        // Try to find and refresh the settings module
        if (window.settingsModule && window.settingsModule.setupSettingsModule) {
            console.log('[MapCore] Refreshing settings module...');
            window.settingsModule.setupSettingsModule();
        } else {
            console.warn('[MapCore] Settings module not found, trying alternative refresh...');
            
            // Alternative: Trigger a settings change event
            this.notifyObservers('settingsChanged', { 
                horizontalSpacing: this.settings.horizontalSpacing,
                verticalSpacing: this.settings.verticalSpacing,
                tileSpacingWidth: this.settings.tileSpacingWidth,
                forceRefresh: true
            });
        }
    }
    
    debugLocalStorage() {
        console.log('[MapCore] Debugging localStorage...');
        
        const mapEditorData = localStorage.getItem('mapEditorData');
        const mapEditorSettings = localStorage.getItem('mapEditorSettings');
        
        console.log('[MapCore] mapEditorData exists:', !!mapEditorData);
        console.log('[MapCore] mapEditorSettings exists:', !!mapEditorSettings);
        
        if (mapEditorData) {
            try {
                const parsedData = JSON.parse(mapEditorData);
                console.log('[MapCore] mapEditorData structure:', {
                    hasSettings: !!parsedData.settings,
                    settingsKeys: parsedData.settings ? Object.keys(parsedData.settings) : [],
                    horizontalSpacing: parsedData.settings?.horizontalSpacing,
                    verticalSpacing: parsedData.settings?.verticalSpacing,
                    tileSpacingWidth: parsedData.settings?.tileSpacingWidth
                });
            } catch (e) {
                console.error('[MapCore] Error parsing mapEditorData:', e);
            }
        }
        
        if (mapEditorSettings) {
            try {
                const parsedSettings = JSON.parse(mapEditorSettings);
                console.log('[MapCore] mapEditorSettings structure:', {
                    keys: Object.keys(parsedSettings),
                    horizontalSpacing: parsedSettings.horizontalSpacing,
                    verticalSpacing: parsedSettings.verticalSpacing,
                    tileSpacingWidth: parsedSettings.tileSpacingWidth
                });
            } catch (e) {
                console.error('[MapCore] Error parsing mapEditorSettings:', e);
            }
        }
        
        return {
            mapEditorData: !!mapEditorData,
            mapEditorSettings: !!mapEditorSettings,
            currentSettings: {
                horizontalSpacing: this.settings.horizontalSpacing,
                verticalSpacing: this.settings.verticalSpacing,
                tileSpacingWidth: this.settings.tileSpacingWidth
            }
        };
    }
    
    analyzeHorizontalSpacingIssue() {
        console.log('[MapCore] === ANALYZING HORIZONTAL SPACING ISSUE ===');
        
        // 1. Check current settings
        console.log('[MapCore] 1. Current settings:', {
            horizontalSpacing: this.settings.horizontalSpacing,
            verticalSpacing: this.settings.verticalSpacing,
            tileSpacingWidth: this.settings.tileSpacingWidth
        });
        
        // 2. Check localStorage
        const mapEditorData = localStorage.getItem('mapEditorData');
        const mapEditorSettings = localStorage.getItem('mapEditorSettings');
        
        console.log('[MapCore] 2. localStorage check:');
        console.log('[MapCore] - mapEditorData exists:', !!mapEditorData);
        console.log('[MapCore] - mapEditorSettings exists:', !!mapEditorSettings);
        
        if (mapEditorData) {
            try {
                const parsedData = JSON.parse(mapEditorData);
                console.log('[MapCore] - mapEditorData.horizontalSpacing:', parsedData.settings?.horizontalSpacing);
            } catch (e) {
                console.error('[MapCore] - Error parsing mapEditorData:', e);
            }
        }
        
        if (mapEditorSettings) {
            try {
                const parsedSettings = JSON.parse(mapEditorSettings);
                console.log('[MapCore] - mapEditorSettings.horizontalSpacing:', parsedSettings.horizontalSpacing);
            } catch (e) {
                console.error('[MapCore] - Error parsing mapEditorSettings:', e);
            }
        }
        
        // 3. Check UI element
        const horizontalSpacingInput = document.getElementById('horizontal-spacing-input');
        console.log('[MapCore] 3. UI element check:');
        console.log('[MapCore] - Element exists:', !!horizontalSpacingInput);
        if (horizontalSpacingInput) {
            console.log('[MapCore] - Element value:', horizontalSpacingInput.value);
            console.log('[MapCore] - Element value attribute:', horizontalSpacingInput.getAttribute('value'));
            console.log('[MapCore] - Element defaultValue:', horizontalSpacingInput.defaultValue);
        }
        
        // 4. Check if settingsModule is available
        console.log('[MapCore] 4. SettingsModule check:');
        console.log('[MapCore] - window.settingsModule exists:', !!window.settingsModule);
        if (window.settingsModule) {
            console.log('[MapCore] - settingsModule.core exists:', !!window.settingsModule.core);
            if (window.settingsModule.core) {
                console.log('[MapCore] - settingsModule.core.settings.horizontalSpacing:', window.settingsModule.core.settings.horizontalSpacing);
            }
        }
        
        // 5. Check MapSettings constructor
        console.log('[MapCore] 5. MapSettings constructor check:');
        const testSettings = new MapSettings();
        console.log('[MapCore] - New MapSettings().horizontalSpacing:', testSettings.horizontalSpacing);
        
        console.log('[MapCore] === ANALYSIS COMPLETE ===');
        
        return {
            currentValue: this.settings.horizontalSpacing,
            uiValue: horizontalSpacingInput ? horizontalSpacingInput.value : 'N/A',
            localStorageValue: mapEditorData ? (() => {
                try {
                    return JSON.parse(mapEditorData).settings?.horizontalSpacing;
                } catch (e) {
                    return 'Parse Error';
                }
            })() : 'N/A',
            defaultValue: testSettings.horizontalSpacing
        };
    }
    
    fixHorizontalSpacingIssue() {
        console.log('[MapCore] === FIXING HORIZONTAL SPACING ISSUE ===');
        
        // 1. Force correct the value
        this.settings.horizontalSpacing = 0;
        console.log('[MapCore] 1. Set horizontalSpacing to 0');
        
        // 2. Save immediately
        this.saveMap();
        console.log('[MapCore] 2. Saved to localStorage');
        
        // 3. Update UI
        this.updateSettingsUI();
        console.log('[MapCore] 3. Updated UI');
        
        // 4. Force refresh settings module if available
        if (window.settingsModule && window.settingsModule.setupSettingsModule) {
            console.log('[MapCore] 4. Refreshing settings module');
            window.settingsModule.setupSettingsModule();
        }
        
        // 5. Notify observers
        this.notifyObservers('settingsChanged', { 
            horizontalSpacing: 0,
            forceFixed: true
        });
        console.log('[MapCore] 5. Notified observers');
        
        console.log('[MapCore] === FIX COMPLETE ===');
        
        return {
            success: true,
            newValue: this.settings.horizontalSpacing,
            message: 'Horizontal spacing issue should be fixed'
        };
    }
    
    testTileSpacingWidth() {
        console.log('[MapCore] === TESTING TILE SPACING WIDTH ===');
        
        // Teste verschiedene Werte
        const testValues = [0, 1, 3, 5];
        
        testValues.forEach(value => {
            console.log(`[MapCore] Testing tileSpacingWidth = ${value}`);
            this.settings.tileSpacingWidth = value;
            
            // Benachrichtige Observer
            this.notifyObservers('settingsChanged', { 
                tileSpacingWidth: value,
                testMode: true
            });
            
            // Kurze Pause zwischen Tests
            setTimeout(() => {
                console.log(`[MapCore] Test completed for value ${value}`);
            }, 500);
        });
        
        console.log('[MapCore] === TILE SPACING WIDTH TEST COMPLETE ===');
        
        return {
            success: true,
            message: 'Tile spacing width test completed - check console for results'
        };
    }

    async loadBiomeTiles() {

        
        // Lade Biome-Daten aus den .js Dateien
        await this.loadBiomeData();
        
        // Dynamisch alle verfügbaren Biome laden
        await this.loadAllBiomeTiles();
        
        // Fallback-Tiles für grundlegende Biome definieren
        this.setupFallbackTiles();
        

    }

    async loadAllBiomeTiles() {

        
        // Liste aller bekannten Biome
        const biomeNames = [
            'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Coast', 'Buildings'
        ];
        
        // Paralleles Laden für bessere Performance
        const loadPromises = biomeNames.map(biomeName => 
            this.loadBiomeTilesList(biomeName).catch(error => {
                console.warn(`[MapCore] Could not load tiles for ${biomeName}:`, error);
                return null; // Verhindere, dass ein Fehler das gesamte Promise.all stoppt
            })
        );
        
        try {
            await Promise.all(loadPromises);
    
        } catch (error) {
            console.warn('[MapCore] Some biome tiles failed to load:', error);
        }
        
        // Entfernt: Keine Abhängigkeit mehr vom TileEditor
        // Der HexMap Editor lädt nur noch die Tiles direkt aus den Dateien
    }

    async loadBiomeTilesList(biomeName) {
        try {
            const biomeKey = biomeName.toLowerCase();
            const biomeTilesListName = `${biomeKey}TilesList`;
            
            // Prüfe, ob bereits geladen
            if (window[biomeTilesListName]) {
                return;
            }
            
            // Skip tilesList.js loading for faster performance
            console.log(`[MapCore] Skipping tilesList.js loading for ${biomeName} - using fallback`);
            
            // Use fallback tiles immediately
            this.setupFallbackTiles();
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.warn(`[MapCore] Timeout loading tiles for ${biomeName}`);
            } else {
                console.warn(`[MapCore] Error loading tiles list for ${biomeName}:`, error);
            }
        }
    }

    setupFallbackTiles() {
        // Nur Fallback-Tiles für Biome erstellen, die noch keine haben
        if (!window.forestTilesList) {
            window.forestTilesList = [
                {
                    "id": 5,
                    "name": "Eichenwald",
                    "categoryId": 5,
                    "categoryName": "Forest",
                    "image": "/assets/biomes/Forest/tiles/Slice_1.png",
                    "movementCost": 1,
                    "defenseBonus": 0,
                    "resources": "Holz, Eicheln",
                    "description": "Eichenwald",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                }
            ];
        }
        
        if (!window.mountainsTilesList) {
            window.mountainsTilesList = [
                {
                    "id": 36,
                    "name": "Felswand",
                    "categoryId": 6,
                    "categoryName": "Mountains",
                    "image": "/assets/biomes/Mountains/tiles/Slice_36.png",
                    "movementCost": 3,
                    "defenseBonus": 2,
                    "resources": "Stein, Erz",
                    "description": "Steile Felswand",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                }
            ];
        }
        
        // Fallback für Buildings-Tiles
        if (!window.buildingsTilesList) {
            window.buildingsTilesList = [
                {
                    "id": 333,
                    "name": "Haus",
                    "categoryId": 1,
                    "categoryName": "Buildings",
                    "image": "/assets/biomes/Buildings/tiles/Slice_333.png",
                    "movementCost": 1,
                    "defenseBonus": 0,
                    "resources": "",
                    "description": "Einfaches Haus",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                },
                {
                    "id": 344,
                    "name": "Turm",
                    "categoryId": 1,
                    "categoryName": "Buildings",
                    "image": "/assets/biomes/Buildings/tiles/Slice_344.png",
                    "movementCost": 1,
                    "defenseBonus": 2,
                    "resources": "",
                    "description": "Wachturm",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                },
                {
                    "id": 352,
                    "name": "Burg",
                    "categoryId": 1,
                    "categoryName": "Buildings",
                    "image": "/assets/biomes/Buildings/tiles/Slice_352.png",
                    "movementCost": 1,
                    "defenseBonus": 3,
                    "resources": "",
                    "description": "Festung",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                },
                {
                    "id": 358,
                    "name": "Mine",
                    "categoryId": 1,
                    "categoryName": "Buildings",
                    "image": "/assets/biomes/Buildings/tiles/Slice_358.png",
                    "movementCost": 1,
                    "defenseBonus": 0,
                    "resources": "Erz",
                    "description": "Bergwerk",
                    "isDefault": true,
                    "items": [],
                    "isUnassigned": false
                }
            ];
        }
        
        const loadedCount = Object.keys(window).filter(key => key.endsWith('TilesList')).length;
        // console.log(`[MapCore] Total biome tile lists available: ${loadedCount}`);
    }
    
    async loadBiomeData() {

        
        // Liste aller verfügbaren Biome
        const biomeNames = [
            'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Coast', 'Buildings'
        ];
        
        for (const biomeName of biomeNames) {
            try {
                await this.loadBiomeDataFile(biomeName);
            } catch (error) {
                console.warn(`[MapCore] Could not load biome data for ${biomeName}:`, error);
            }
        }
        

    }
    
    async loadBiomeDataFile(biomeName) {
        const biomeDataPath = `/assets/biomes/${biomeName}/${biomeName}.js`;
        
        try {
            // Lade das Script dynamisch
            const script = document.createElement('script');
            script.src = biomeDataPath;
            script.async = true;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    const biomeDataName = `${biomeName.toLowerCase()}BiomeData`;
                    if (window.BIOME_DATA) {
                        window[biomeDataName] = window.BIOME_DATA;
                        console.log(`[MapCore] Loaded ${biomeName} biome data:`, window.BIOME_DATA);
                        // Lösche die globale Variable nach dem Laden
                        delete window.BIOME_DATA;
                    }
                    resolve();
                };
                script.onerror = () => {
                    console.warn(`[MapCore] Could not load ${biomeDataPath}`);
                    reject(new Error(`Failed to load ${biomeDataPath}`));
                };
                document.head.appendChild(script);
            });
        } catch (error) {
            console.warn(`[MapCore] Error loading biome data for ${biomeName}:`, error);
        }
    }

    initializeGrid() {
        // Erstelle nur 3 Layer um 0,0 mit korrekter hexagonaler Distanz
        const positions = [];
        
        // Generiere alle Koordinaten in einem Radius von 3
        for (let q = -3; q <= 3; q++) {
            for (let r = -3; r <= 3; r++) {
                // Berechne die hexagonale Distanz
                const s = -q - r;
                const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
                
                // Nur Koordinaten mit Distanz <= 3 hinzufügen
                if (distance <= 3) {
                    positions.push(new HexPosition(q, r));
                }
            }
        }
        
        positions.forEach(pos => {
            const key = `${pos.q},${pos.r}`;
            this.tiles.set(key, new HexTile(pos, this.settings.defaultTileType));
        });
    }

    setTileType(q, r, type) {
        console.log('setTileType aufgerufen:', q, r, type, 'Pinselgröße:', this.settings.brushSize);
        
        // Verwende das ausgewählte Biome, falls verfügbar
        let tileType = type;
        if (this.settings.selectedBiome && type !== TileTypes.VOID) {
            // Konvertiere Biome-Namen zu Tile-Typ
            tileType = this.convertBiomeToTileType(this.settings.selectedBiome);
            console.log('[MapCore] Using selected biome:', this.settings.selectedBiome, '-> tile type:', tileType);
        }
        
        // Wenn es das erste Tile ist (leerer Screen), setze es als (0,0)
        if (this.tiles.size === 0 && tileType !== TileTypes.VOID) {
            console.log('Erstes Tile gesetzt, setze es als (0,0)');
            // Füge das Tile an der aktuellen Position hinzu
            this.addTileDirectly(q, r, tileType);
            // Setze dann den Ursprung auf diese Position, sodass es (0,0) wird
            this.setOrigin(q, r);
            return;
        }
        
        // Verwende den aktuellen Mal-Modus
        const currentMode = this.settings.currentMode || 'paint';
        
        // Debug: Log the current mode and brush size
        console.log('[MapCore] Current mode:', currentMode, 'Brush size:', this.settings.brushSize);
        console.log('[MapCore] Tile type to apply:', tileType, 'Is VOID:', tileType === TileTypes.VOID);
        
        switch (currentMode) {
            case 'fill':
                this.fillArea(q, r, tileType);
                break;
            case 'line':
                // Linien-Modus: Startpunkt wird bei Mouse-Down gesetzt, Endpunkt bei Mouse-Up
                // Hier wird nur der Startpunkt gespeichert, die Linie wird bei Mouse-Up gezeichnet
                if (!this.lineStartPoint) {
                    this.lineStartPoint = { q, r };
                    console.log('[MapCore] Linie gestartet bei:', q, r);
                }
                break;
            case 'circle':
                this.drawCircle(q, r, tileType);
                break;
            default: // paint
                this.applyBrushToArea(q, r, tileType);
                break;
        }
    }
    
    setSelectedTileType(type) {
        this.selectedTileType = type;
        this.settings.selectedTileType = type;
        console.log('[MapCore] Selected tile type set to:', type, 'Is VOID:', type === TileTypes.VOID);
        this.saveMap(); // Speichere die Änderung
    }

    setSelectedBiome(biomeName) {
        this.selectedBiome = biomeName;
        this.settings.selectedBiome = biomeName;
        
        // Convert biome name to tile type
        const tileType = this.convertBiomeToTileType(biomeName);
        this.selectedTileType = tileType;
        this.settings.selectedTileType = tileType;
        
        this.saveMap(); // Speichere die Änderung
        console.log('[MapCore] Selected biome:', biomeName, 'converted to tile type:', tileType, 'Is VOID:', tileType === TileTypes.VOID);
        
        // Benachrichtige Observer über Biome-Änderung
        this.notifyObservers('biomeChanged', { biomeName, tileType });
    }

    setSelectedTile(tile) {
        this.selectedTile = tile;
        this.settings.selectedTile = tile;
        
        // Konvertiere das Tile in einen TileType für das Malen
        if (tile && tile.name) {
            // Für Buildings: Verwende den Bildnamen als TileType
            if (tile.image) {
                this.selectedTileType = tile.image;
                this.settings.selectedTileType = tile.image;
                console.log('[MapCore] Selected tile type set to:', tile.image, 'for tile:', tile.name);
            } else {
                // Fallback: Verwende den Tile-Namen
                this.selectedTileType = tile.name;
                this.settings.selectedTileType = tile.name;
                console.log('[MapCore] Selected tile type set to:', tile.name);
            }
        } else {
            // Fallback: Verwende den Tile-Namen auch wenn kein Bild vorhanden
            this.selectedTileType = tile ? tile.name : 'unknown';
            this.settings.selectedTileType = tile ? tile.name : 'unknown';
            console.log('[MapCore] Selected tile type set to:', this.selectedTileType);
        }
        
        this.saveMap(); // Speichere die Änderung
        console.log('[MapCore] Selected tile:', tile ? tile.name : 'unknown');
        console.log('[MapCore] Selected tile image:', tile ? tile.image : 'none');
        console.log('[MapCore] Final selectedTileType:', this.selectedTileType);
        
        // Debug: Prüfe ob das selectedTileType korrekt gesetzt wurde
        setTimeout(() => {
            console.log('[MapCore] Debug - selectedTileType after setSelectedTile:', this.selectedTileType);
            console.log('[MapCore] Debug - settings.selectedTileType after setSelectedTile:', this.settings.selectedTileType);
        }, 100);
        
        // Debug: Prüfe ob das selectedTileType von der Position abhängt
        console.log('[MapCore] Debug - selectedTileType should NOT depend on position');
    }

    // Konvertiere Biome-Namen zu Tile-Typen
    convertBiomeToTileType(biomeName) {
        const biomeToTileMap = {
            'Void': TileTypes.VOID,
            'Forest': TileTypes.FOREST,
            'Mountains': TileTypes.MOUNTAIN,
            'Water': TileTypes.WATER,
            'Desert': TileTypes.DESERT,
            'Swamp': TileTypes.FOREST, // Swamp wird als Forest behandelt
            'Plain': TileTypes.GRASS,
            'Plains': TileTypes.GRASS, // Plains mit 's' hinzugefügt
            'Jungle': TileTypes.FOREST,
            'Badlands': TileTypes.DESERT,
            'Snow': TileTypes.SNOW,
            'Ocean': TileTypes.WATER,
            'Unassigned': TileTypes.GRASS
        };
        
        const tileType = biomeToTileMap[biomeName];
        if (tileType) {
            console.log('[MapCore] Converted biome', biomeName, 'to tile type:', tileType);
            return tileType;
        } else {
            console.warn('[MapCore] Unknown biome:', biomeName, 'using default GRASS');
            return TileTypes.GRASS;
        }
    }
    
    getBrushPreview(q, r) {
        const brushSize = this.settings.brushSize || 0;
        const previewTiles = [];
        
        // Bei Pinselgröße 0: Zeige nur das angeklickte Feld
        if (brushSize === 0) {
            const centerKey = `${q},${r}`;
            const centerExists = this.tiles.has(centerKey) || this.layers[this.currentLayer]?.has(centerKey);
            previewTiles.push({ q, r, distance: 0, exists: centerExists });
            return previewTiles;
        }
        
        // Bei Pinselgröße 1: Zeige das Zentrum und alle 6 Nachbarn
        if (brushSize === 1) {
            // Zentrum
            const centerKey = `${q},${r}`;
            const centerExists = this.tiles.has(centerKey) || this.layers[this.currentLayer]?.has(centerKey);
            previewTiles.push({ q, r, distance: 0, exists: centerExists });
            
            // Alle 6 Nachbarn - exakt die gleichen Offsets wie in applyBrushToArea
            const neighbors = [
                { dq: 1, dr: 0 }, { dq: -1, dr: 0 },
                { dq: 0, dr: 1 }, { dq: 0, dr: -1 },
                { dq: 1, dr: -1 }, { dq: -1, dr: 1 }
            ];
            
            neighbors.forEach(({ dq, dr }) => {
                const newQ = q + dq;
                const newR = r + dr;
                const key = `${newQ},${newR}`;
                const exists = this.tiles.has(key) || this.layers[this.currentLayer]?.has(key);
                previewTiles.push({ q: newQ, r: newR, distance: 1, exists });

            });
            
            return previewTiles;
        }
        
        // Berechne alle Felder, die vom Pinsel betroffen wären
        // Verwende exakt die gleiche Logik wie in applyBrushToArea
        const range = brushSize;
        for (let dq = -range; dq <= range; dq++) {
            for (let dr = -range; dr <= range; dr++) {
                const newQ = q + dq;
                const newR = r + dr;
                
                // Berechne hexagonale Distanz vom Zentrum
                // Korrekte hexagonale Distanz-Formel: max(|dq|, |dr|, |dq + dr|)
                const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                
                // Nur Felder innerhalb der Pinselgröße (exakte hexagonale Distanz)
                if (distance <= brushSize) {
                    const key = `${newQ},${newR}`;
                    const exists = this.tiles.has(key) || this.layers[this.currentLayer]?.has(key);
                    previewTiles.push({ q: newQ, r: newR, distance, exists });
                }
            }
        }
        
        return previewTiles;
    }
    
    applyBrushToArea(centerQ, centerR, type) {
        // Direkt aus den Einstellungen lesen und als Zahl behandeln
        const brushSize = parseInt(this.settings.brushSize, 10) || 0;
        const affectedTiles = [];
        
        console.log('[MapCore] applyBrushToArea called with brushSize:', brushSize, 'at position:', centerQ, centerR, 'type:', type);
        console.log('[MapCore] Current settings brushSize:', this.settings.brushSize);
        console.log('[MapCore] Parsed brushSize:', brushSize);
        console.log('[MapCore] Settings object:', this.settings);
        
        // Bei Pinselgröße 0: Behandle nur das angeklickte Feld
        if (brushSize === 0) {
            if (type === TileTypes.VOID) {
                // Void entfernt das Feld komplett - aus ALLEN Layern
                console.log('[MapCore] Void: Removing center tile at', centerQ, centerR, 'from all layers');
                this.removeTileAt(centerQ, centerR, this.currentLayer);
                
                // Zusätzlich explizit aus allen Layern entfernen
                Object.keys(this.layers).forEach(layerKey => {
                    const key = `${centerQ},${centerR}`;
                    if (this.layers[layerKey] && this.layers[layerKey].has(key)) {
                        this.layers[layerKey].delete(key);
                        console.log('[MapCore] Void: Removed center from layer:', layerKey);
                    }
                });
                
                // Aus der Legacy-Map entfernen
                const key = `${centerQ},${centerR}`;
                if (this.tiles.has(key)) {
                    this.tiles.delete(key);
                    console.log('[MapCore] Void: Removed center from legacy map');
                }
                
                affectedTiles.push({ q: centerQ, r: centerR, action: 'removed' });
                console.log('[MapCore] Void: Completely removed center tile at', centerQ, centerR);
            } else {
                // Normale Tile-Typen: Setze das Tile
                const tileData = {
                    position: new HexPosition(centerQ, centerR),
                    type: type,
                    color: this.settings.selectedColor,
                    biomeName: this.getBiomeNameForLayer(this.currentLayer)
                };
                this.setTileAt(centerQ, centerR, tileData, this.currentLayer);
                affectedTiles.push({ q: centerQ, r: centerR, action: 'changed', type });
            }
        } else if (brushSize === 1) {
            // Bei Pinselgröße 1: Behandle das Zentrum und alle 6 Nachbarn
            // Zentrum
            if (type === TileTypes.VOID) {
                console.log('[MapCore] Void: Removing center tile at', centerQ, centerR, 'from all layers');
                this.removeTileAt(centerQ, centerR, this.currentLayer);
                
                // Zusätzlich explizit aus allen Layern entfernen
                Object.keys(this.layers).forEach(layerKey => {
                    const key = `${centerQ},${centerR}`;
                    if (this.layers[layerKey] && this.layers[layerKey].has(key)) {
                        this.layers[layerKey].delete(key);
                        console.log('[MapCore] Void: Removed center from layer:', layerKey);
                    }
                });
                
                // Aus der Legacy-Map entfernen
                const key = `${centerQ},${centerR}`;
                if (this.tiles.has(key)) {
                    this.tiles.delete(key);
                    console.log('[MapCore] Void: Removed center from legacy map');
                }
                
                affectedTiles.push({ q: centerQ, r: centerR, action: 'removed' });
                console.log('[MapCore] Void: Completely removed center tile at', centerQ, centerR);
            } else {
                const centerTileData = {
                    position: new HexPosition(centerQ, centerR),
                    type: type,
                    color: this.settings.selectedColor,
                    biomeName: this.getBiomeNameForLayer(this.currentLayer)
                };
                this.setTileAt(centerQ, centerR, centerTileData, this.currentLayer);
                affectedTiles.push({ q: centerQ, r: centerR, action: 'changed', type });
            }
            
            // Alle 6 Nachbarn - exakt die gleichen Offsets wie in getBrushPreview
            const neighbors = [
                { dq: 1, dr: 0 }, { dq: -1, dr: 0 },
                { dq: 0, dr: 1 }, { dq: 0, dr: -1 },
                { dq: 1, dr: -1 }, { dq: -1, dr: 1 }
            ];
            
            neighbors.forEach(({ dq, dr }) => {
                const q = centerQ + dq;
                const r = centerR + dr;
                
                if (type === TileTypes.VOID) {
                    console.log('[MapCore] Void: Removing neighbor tile at', q, r, 'from all layers');
                    this.removeTileAt(q, r, this.currentLayer);
                    
                    // Zusätzlich explizit aus allen Layern entfernen
                    Object.keys(this.layers).forEach(layerKey => {
                        const key = `${q},${r}`;
                        if (this.layers[layerKey] && this.layers[layerKey].has(key)) {
                            this.layers[layerKey].delete(key);
                            console.log('[MapCore] Void: Removed neighbor from layer:', layerKey);
                        }
                    });
                    
                    // Aus der Legacy-Map entfernen
                    const key = `${q},${r}`;
                    if (this.tiles.has(key)) {
                        this.tiles.delete(key);
                        console.log('[MapCore] Void: Removed neighbor from legacy map');
                    }
                    
                    affectedTiles.push({ q, r, action: 'removed' });
                    console.log('[MapCore] Void: Completely removed neighbor tile at', q, r);
                } else {
                    const neighborTileData = {
                        position: new HexPosition(q, r),
                        type: type,
                        color: this.settings.selectedColor,
                        biomeName: this.getBiomeNameForLayer(this.currentLayer)
                    };
                    this.setTileAt(q, r, neighborTileData, this.currentLayer);
                    affectedTiles.push({ q, r, action: 'changed', type });
                }
            });
        } else {
            // Normale Pinsel-Logik für andere Größen
            const range = brushSize;
            for (let dq = -range; dq <= range; dq++) {
                for (let dr = -range; dr <= range; dr++) {
                    const q = centerQ + dq;
                    const r = centerR + dr;
                    
                    // Berechne hexagonale Distanz vom Zentrum
                    // Korrekte hexagonale Distanz-Formel: max(|dq|, |dr|, |dq + dr|)
                    const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                    
                    // Nur Felder innerhalb der Pinselgröße (exakte hexagonale Distanz)
                    if (distance <= brushSize) {
                        if (type === TileTypes.VOID) {
                            // Void entfernt das Feld komplett - aus ALLEN Layern
                            console.log('[MapCore] Void: Removing tile at', q, r, 'from all layers');
                            this.removeTileAt(q, r, this.currentLayer);
                            
                            // Zusätzlich explizit aus allen Layern entfernen
                            Object.keys(this.layers).forEach(layerKey => {
                                const layerKey2 = `${q},${r}`;
                                if (this.layers[layerKey] && this.layers[layerKey].has(layerKey2)) {
                                    this.layers[layerKey].delete(layerKey2);
                                    console.log('[MapCore] Void: Removed from layer:', layerKey);
                                }
                            });
                            
                            // Aus der Legacy-Map entfernen
                            const key = `${q},${r}`;
                            if (this.tiles.has(key)) {
                                this.tiles.delete(key);
                                console.log('[MapCore] Void: Removed from legacy map');
                            }
                            
                            affectedTiles.push({ q, r, action: 'removed' });
                            console.log('[MapCore] Void: Completely removed tile at', q, r);
                        } else {
                            // Normale Tile-Typen: Setze das Tile
                            const tileData = {
                                position: new HexPosition(q, r),
                                type: type,
                                color: this.settings.selectedColor,
                                biomeName: this.getBiomeNameForLayer(this.currentLayer)
                            };
                            this.setTileAt(q, r, tileData, this.currentLayer);
                            affectedTiles.push({ q, r, action: 'changed', type });
                        }
                    }
                }
            }
        }
        
        // Batch-Update für bessere Performance
        if (affectedTiles.length > 0) {
            console.log('[MapCore] Batch update with', affectedTiles.length, 'affected tiles');
            console.log('[MapCore] Affected tiles:', affectedTiles);
            this.notifyObservers('tilesBatchUpdated', { tiles: affectedTiles });
            
            // Force save after void operations
            if (type === TileTypes.VOID) {
                console.log('[MapCore] Force saving after void operation');
                this.saveMap();
                
                // Force complete render update for void operations
                setTimeout(() => {
                    this.notifyObservers('mapChanged', {});
                }, 100);
            }
        } else {
            console.warn('[MapCore] No tiles were affected by brush operation!');
        }
    }
    
    // Debug-Methode zum Überprüfen von Tile-Änderungen
    debugTileChanges(affectedTiles) {
        console.log('[MapCore] Debug: Überprüfe', affectedTiles.length, 'Tile-Änderungen...');
        
        affectedTiles.forEach(tile => {
            const key = `${tile.q},${tile.r}`;
            if (tile.action === 'changed') {
                const currentTile = this.tiles.get(key);
                if (currentTile) {
                    console.log(`[MapCore] Debug: Tile ${key} hat jetzt Typ ${currentTile.type} (sollte ${tile.type} sein)`);
                } else {
                    console.error(`[MapCore] Debug: Tile ${key} existiert nicht mehr nach Änderung!`);
                }
            } else if (tile.action === 'added') {
                const currentTile = this.tiles.get(key);
                if (currentTile) {
                    console.log(`[MapCore] Debug: Neues Tile ${key} mit Typ ${currentTile.type} hinzugefügt`);
                } else {
                    console.error(`[MapCore] Debug: Neues Tile ${key} wurde nicht hinzugefügt!`);
                }
            } else if (tile.action === 'removed') {
                const currentTile = this.tiles.get(key);
                if (currentTile) {
                    console.error(`[MapCore] Debug: Tile ${key} existiert noch nach Entfernung!`);
                } else {
                    console.log(`[MapCore] Debug: Tile ${key} erfolgreich entfernt`);
                }
            }
        });
    }
    
    expandMapAround(q, r) {
        const expansionValue = this.settings.expansionValue;
        const newPositions = [];
        
        // Generiere neue Koordinaten um das angeklickte Feld
        for (let dq = -expansionValue; dq <= expansionValue; dq++) {
            for (let dr = -expansionValue; dr <= expansionValue; dr++) {
                const newQ = q + dq;
                const newR = r + dr;
                
                // Berechne die hexagonale Distanz
                const s = -newQ - newR;
                const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(s));
                
                // Nur Koordinaten innerhalb des Erweiterungsradius hinzufügen
                if (distance <= expansionValue) {
                    const key = `${newQ},${newR}`;
                    if (!this.tiles.has(key)) {
                        newPositions.push(new HexPosition(newQ, newR));
                    }
                }
            }
        }
        
        // Füge neue Tiles hinzu (als normale Tiles, nicht als Void)
        // Verwende addTileDirectly um Endlosschleifen zu vermeiden
        newPositions.forEach(pos => {
            const key = `${pos.q},${pos.r}`;
            if (!this.tiles.has(key)) {
                this.tiles.set(key, new HexTile(pos, this.settings.defaultTileType));
                // Benachrichtige Observer direkt ohne setTileType aufzurufen
                this.notifyObservers('tileAdded', { q: pos.q, r: pos.r, type: this.settings.defaultTileType });
            }
        });
        
        if (newPositions.length > 0) {
            this.notifyObservers('mapExpanded', { newTiles: newPositions.length });
            console.log('[MapCore] Auto-saving map after map expansion...');
            this.saveMap();
        }
    }
    
    // Hilfsmethode um zu prüfen, ob ein Tile Nachbarn hat
    hasNeighboringTiles(q, r) {
        const neighbors = [
            { dq: 1, dr: 0 }, { dq: -1, dr: 0 },
            { dq: 0, dr: 1 }, { dq: 0, dr: -1 },
            { dq: 1, dr: -1 }, { dq: -1, dr: 1 }
        ];
        
        for (const { dq, dr } of neighbors) {
            const neighborKey = `${q + dq},${r + dr}`;
            if (this.tiles.has(neighborKey)) {
                return true; // Hat mindestens einen Nachbarn
            }
        }
        
        return false; // Keine Nachbarn gefunden
    }

    // Linie bei Mouse-Up zeichnen
    finishLine(endQ, endR) {
        if (this.lineStartPoint && this.settings.currentMode === 'line') {
            const tileType = this.settings.selectedBiome ? 
                this.convertBiomeToTileType(this.settings.selectedBiome) : 
                this.settings.defaultTileType;
            
            console.log('[MapCore] Zeichne Linie mit Brush-Größe:', this.settings.brushSize);
            this.drawLine(this.lineStartPoint.q, this.lineStartPoint.r, endQ, endR, tileType);
            this.lineStartPoint = null;
            console.log('[MapCore] Linie beendet bei:', endQ, endR);
        }
    }

    // Fläche füllen (Flood Fill)
    fillArea(q, r, tileType) {
        console.log('[MapCore] Fülle Fläche bei:', q, r, 'mit Typ:', tileType);
        
        const targetType = this.getTileTypeAt(q, r);
        if (targetType === tileType) {
            console.log('[MapCore] Fläche bereits mit gewünschtem Typ gefüllt');
            return;
        }
        
        const affectedTiles = [];
        const queue = [{ q, r }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.q},${current.r}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // Prüfe ob das aktuelle Tile den Zieltyp hat
            if (this.getTileTypeAt(current.q, current.r) === targetType) {
                // Ändere das Tile in der aktuellen Ebene
                const tileData = {
                    position: new HexPosition(current.q, current.r),
                    type: tileType,
                    color: this.settings.selectedColor,
                    biomeName: this.getBiomeNameForLayer(this.currentLayer)
                };
                
                // Im Streets-Layer: Nur Gebäude platzieren, Terrain nicht verändern
                if (this.currentLayer === 'streets') {
                    tileData.biomeName = this.getBiomeNameForLayer(this.currentLayer);
                    this.setTileAt(current.q, current.r, tileData, 'streets');
                } else {
                    this.setTileAt(current.q, current.r, tileData, this.currentLayer);
                }
                affectedTiles.push({ q: current.q, r: current.r, action: 'changed', type: tileType, oldType: targetType });
                
                // Füge Nachbarn zur Queue hinzu
                const neighbors = [
                    { dq: 1, dr: 0 }, { dq: -1, dr: 0 },
                    { dq: 0, dr: 1 }, { dq: 0, dr: -1 },
                    { dq: 1, dr: -1 }, { dq: -1, dr: 1 }
                ];
                
                neighbors.forEach(({ dq, dr }) => {
                    const newQ = current.q + dq;
                    const newR = current.r + dr;
                    const neighborKey = `${newQ},${newR}`;
                    
                    if (!visited.has(neighborKey) && this.getTileTypeAt(newQ, newR) === targetType) {
                        queue.push({ q: newQ, r: newR });
                    }
                });
            }
        }
        
        if (affectedTiles.length > 0) {
            this.notifyObservers('tilesBatchUpdated', { tiles: affectedTiles });
            console.log('[MapCore] Fläche gefüllt:', affectedTiles.length, 'Tiles geändert');
        }
    }

    // Linie zeichnen zwischen zwei Punkten
    drawLine(startQ, startR, endQ, endR, tileType) {
        const brushSize = this.settings.brushSize || 0;
        
        const affectedTiles = [];
        const points = this.getLinePoints(startQ, startR, endQ, endR);
        
        // Für jeden Punkt auf der Linie: Zeichne einen Kreis mit der aktuellen Brush-Größe
        points.forEach(({ q, r }) => {
            if (brushSize === 0) {
                // Einzel-Tile
                const tileData = {
                    position: new HexPosition(q, r),
                    type: tileType,
                    color: this.settings.selectedColor,
                    biomeName: this.getBiomeNameForLayer(this.currentLayer)
                };
                
                // Im Streets-Layer: Nur Gebäude platzieren, Terrain nicht verändern
                if (this.currentLayer === 'streets') {
                    tileData.biomeName = this.getBiomeNameForLayer(this.currentLayer);
                    this.setTileAt(q, r, tileData, 'streets');
                } else {
                    this.setTileAt(q, r, tileData, this.currentLayer);
                }
                affectedTiles.push({ q, r, action: 'changed', type: tileType });
            } else {
                // Zeichne einen Kreis um den Punkt mit der Brush-Größe
                const radius = brushSize;
                
                for (let dq = -radius; dq <= radius; dq++) {
                    for (let dr = -radius; dr <= radius; dr++) {
                        const newQ = q + dq;
                        const newR = r + dr;
                        
                        // Berechne hexagonale Distanz vom Zentrum
                        const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                        
                        // Nur Punkte innerhalb des Radius
                        if (distance <= radius) {
                            const tileData = {
                                position: new HexPosition(newQ, newR),
                                type: tileType,
                                color: this.settings.selectedColor,
                                biomeName: this.getBiomeNameForLayer(this.currentLayer)
                            };
                            
                            // Im Streets-Layer: Nur Gebäude platzieren, Terrain nicht verändern
                            if (this.currentLayer === 'streets') {
                                tileData.biomeName = this.getBiomeNameForLayer(this.currentLayer);
                                this.setTileAt(newQ, newR, tileData, 'streets');
                            } else {
                                this.setTileAt(newQ, newR, tileData, this.currentLayer);
                            }
                            affectedTiles.push({ q: newQ, r: newR, action: 'changed', type: tileType });
                        }
                    }
                }
            }
        });
        
        if (affectedTiles.length > 0) {
            this.notifyObservers('tilesBatchUpdated', { tiles: affectedTiles });
        }
    }

    // Kreisförmigen Bereich zeichnen
    drawCircle(centerQ, centerR, tileType) {
        console.log('[MapCore] Zeichne Kreis bei:', centerQ, centerR);
        
        const radius = this.settings.brushSize || 1;
        const affectedTiles = [];
        
        // Generiere alle Punkte im Kreis
        for (let dq = -radius; dq <= radius; dq++) {
            for (let dr = -radius; dr <= radius; dr++) {
                const newQ = centerQ + dq;
                const newR = centerR + dr;
                
                // Berechne hexagonale Distanz vom Zentrum
                const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                
                // Nur Punkte innerhalb des Radius
                if (distance <= radius) {
                    const tileData = {
                        position: new HexPosition(newQ, newR),
                        type: tileType,
                        color: this.settings.selectedColor,
                        biomeName: this.getBiomeNameForLayer(this.currentLayer)
                    };
                    
                    // Im Streets-Layer: Nur Gebäude platzieren, Terrain nicht verändern
                    if (this.currentLayer === 'streets') {
                        tileData.biomeName = this.getBiomeNameForLayer(this.currentLayer);
                        this.setTileAt(newQ, newR, tileData, 'streets');
                    } else {
                        this.setTileAt(newQ, newR, tileData, this.currentLayer);
                    }
                    affectedTiles.push({ q: newQ, r: newR, action: 'changed', type: tileType });
                }
            }
        }
        
        if (affectedTiles.length > 0) {
            this.notifyObservers('tilesBatchUpdated', { tiles: affectedTiles });
            console.log('[MapCore] Kreis gezeichnet:', affectedTiles.length, 'Tiles');
        }
    }

    // Hilfsmethoden für die Mal-Modi
    getTileTypeAt(q, r) {
        // Prüfe zuerst in der aktuellen Ebene
        const currentLayerTile = this.getTileAt(q, r, this.currentLayer);
        if (currentLayerTile) {
            return currentLayerTile.type;
        }
        
        // Fallback auf die alte tiles Map für Kompatibilität
        const key = `${q},${r}`;
        const tile = this.tiles.get(key);
        return tile ? tile.type : null;
    }



    // Bresenham-Algorithmus für hexagonale Linien
    getLinePoints(startQ, startR, endQ, endR) {
        const points = [];
        let q = startQ, r = startR;
        const dq = endQ - startQ;
        const dr = endR - startR;
        
        // Einfache Implementierung: Gehe zu jedem Punkt auf dem Weg
        const steps = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
        
        for (let i = 0; i <= steps; i++) {
            const roundedQ = Math.round(q);
            const roundedR = Math.round(r);
            points.push({ q: roundedQ, r: roundedR });
            q += dq / steps;
            r += dr / steps;
        }
        
        return points;
    }

    getTileColor(type) {
        // Prüfe ob es sich um einen Biome-Typ handelt
        if (typeof type === 'string' && type !== 'ORIGIN_SETTER') {
            // Verwende Biome-spezifische Farben
            return this.getBiomeTileColor(type, type);
        }
        
        // Use centralized color system if available
        if (typeof getColor === 'function') {
            const colorMap = {
                [TileTypes.GRASS]: getColor('terrain', 'grass'),
                [TileTypes.WATER]: getColor('biomes', 'water'),
                [TileTypes.MOUNTAIN]: getColor('biomes', 'mountains'),
                [TileTypes.FOREST]: getColor('biomes', 'forest'),
                [TileTypes.DESERT]: getColor('biomes', 'desert'),
                [TileTypes.SNOW]: getColor('biomes', 'snow'),
                [TileTypes.VOID]: '#000000'
            };
            return colorMap[type] || getColor('terrain', 'grass');
        }
        
        // Standard-Farben für vordefinierte Tile-Typen
        const colors = {
            [TileTypes.GRASS]: '#4CAF50',
            [TileTypes.WATER]: '#2196F3',
            [TileTypes.MOUNTAIN]: '#795548',
            [TileTypes.FOREST]: '#388E3C',
            [TileTypes.DESERT]: '#FF9800',
            [TileTypes.SNOW]: '#FFFFFF',
            [TileTypes.VOID]: '#000000'
        };
        return colors[type] || '#4CAF50';
    }

    getBiomeTileColor(type, biomeId) {
        // Versuche Biome-Daten aus den geladenen Biome-Dateien zu verwenden (höchste Priorität)
        try {
            const biomeName = biomeId.charAt(0).toUpperCase() + biomeId.slice(1).toLowerCase();
            const biomeDataName = `${biomeName.toLowerCase()}BiomeData`;
            
            if (window[biomeDataName] && window[biomeDataName].color) {
                return window[biomeDataName].color;
            }
        } catch (error) {
            console.warn(`[MapCore] Error loading biome data for ${biomeId}:`, error);
        }
        
        // Biome-spezifische Farben basierend auf Biome-Ordner
        const biomeColors = {
            'void': '#000000',
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
            'coast': '#03A9F4',
            'buildings': '#FF5722',
            'unassigned': '#9E9E9E',
            // Neue Gebäude-Kategorien
            'tower': '#FF9800',
            'castle': '#8D6E63',
            'mine': '#795548',
            'house': '#FF5722',
            'village': '#FF9800',
            'settlement': '#FF9800',
            'wall': '#795548',
            'gate': '#795548',
            'bridge': '#795548',
            'street': '#9E9E9E',
            'square': '#9E9E9E',
            'market': '#FF9800',
            'temple': '#FFD700',
            'church': '#FFD700',
            'tavern': '#FF5722',
            'smithy': '#795548',
            'mill': '#795548',
            'warehouse': '#795548',
            'stable': '#795548',
            'garden': '#4CAF50',
            'well': '#2196F3',
            'ruin': '#9E9E9E',
            'building': '#FF5722'
        };
        
        const lowerBiomeId = biomeId.toLowerCase();
        if (biomeColors[lowerBiomeId]) {
            return biomeColors[lowerBiomeId];
        }
        
        // Fallback zu Standard-Farben
        const fallbackColors = {
            'grass': '#4CAF50',
            'water': '#2196F3',
            'mountain': '#795548',
            'forest': '#388E3C',
            'desert': '#FF9800',
            'snow': '#FFFFFF',
            'void': '#000000'
        };
        return fallbackColors[type] || '#4CAF50';
    }

    getFilteredTiles() {
        // Temporarily disable filtering to show all tiles
        console.log('[MapCore] Returning all tiles without filtering');
        return this.tiles;
        
        // Original filtering logic (commented out)
        /*
        // Wenn ein Biome ausgewählt ist, filtere die Tiles
        if (this.settings.selectedBiome && this.settings.selectedBiome !== '') {
            const filteredTiles = new Map();
            
            this.tiles.forEach((tile, key) => {
                // Prüfe ob das Tile zum ausgewählten Biome gehört
                if (this.tileBelongsToBiome(tile, this.settings.selectedBiome)) {
                    filteredTiles.set(key, tile);
                }
            });
            
            return filteredTiles;
        }
        
        // Kein Filter: Alle Tiles zurückgeben
        return this.tiles;
        */
    }

    tileBelongsToBiome(tile, biomeId) {
        // Prüfe ob das Tile zum ausgewählten Biome gehört
        const biomeName = biomeId.toLowerCase();
        
        // Einfache Zuordnung basierend auf Tile-Typ und Biome-Name
        const biomeTileTypes = {
            'forest': [TileTypes.FOREST],
            'mountain': [TileTypes.MOUNTAIN],
            'water': [TileTypes.WATER],
            'desert': [TileTypes.DESERT],
            'grass': [TileTypes.GRASS],
            'snow': [TileTypes.SNOW],
            'lava': [TileTypes.LAVA]
        };
        
        for (const [biomeKey, tileTypes] of Object.entries(biomeTileTypes)) {
            if (biomeName.includes(biomeKey) && tileTypes.includes(tile.type)) {
                return true;
            }
        }
        
        // Prüfe ob es sich um einen Biome-Typ handelt
        if (typeof tile.type === 'string' && tile.type !== 'ORIGIN_SETTER') {
            // Wenn der Tile-Typ ein Biome-Name ist, zeige ihn an
            return true;
        }
        
        // Standard: Alle Tiles anzeigen
        return true;
    }

    updateSettings(newSettings) {
        console.log('[MapCore] updateSettings called with:', newSettings);
        Object.assign(this.settings, newSettings);
        this.notifyObservers('settingsChanged', this.settings);
        // Automatisch speichern bei Ansicht-Einstellungen mit Throttling
        if (newSettings.zoom !== undefined || newSettings.offsetX !== undefined || newSettings.offsetY !== undefined) {
            console.log('[MapCore] Scheduling auto-save for view settings');
            this.scheduleAutoSave();
        }
    }

    scheduleAutoSave() {
        console.log('[MapCore] scheduleAutoSave called');
        if (this.autoSaveThrottle) {
            console.log('[MapCore] Clearing existing auto-save throttle');
            clearTimeout(this.autoSaveThrottle);
        }
        
        this.autoSaveThrottle = setTimeout(() => {
            console.log('[MapCore] Auto-saving map...');
            this.saveMap();
            this.autoSaveThrottle = null;
        }, 1000); // Speichere maximal einmal pro Sekunde
    }

    getTileAt(q, r) {
        const key = `${q},${r}`;
        return this.tiles.get(key);
    }

    getAllTiles() {
        return Array.from(this.tiles.values());
    }

    clearMap() {
        // Setze alle Tiles auf void anstatt sie zu löschen
        this.tiles.forEach((tile, position) => {
            tile.biome = 'void';
            tile.elevation = 0;
            tile.moisture = 0;
            tile.temperature = 0;
        });
        // Keine automatische Grid-Initialisierung mehr
        this.notifyObservers('mapCleared');
        this.saveMap(); // Speichere die Map mit void-Tiles
    }
    
    setOrigin(q, r) {
        console.log('Setze Ursprung auf:', q, r);
        
        // Berechne den aktuellen Pixel-Mittelpunkt des angeklickten Feldes
        const currentPixelPos = hexToPixel(new HexPosition(q, r), this.settings.hexSize, this.settings.horizontalSpacing, this.settings.verticalSpacing, this.settings.layoutRotation);
        
        // Erstelle eine neue Map mit verschobenen Koordinaten
        const newTiles = new Map();
        const offsetQ = -q;
        const offsetR = -r;
        
        // Verschiebe alle existierenden Tiles
        this.tiles.forEach((tile, key) => {
            const newQ = tile.position.q + offsetQ;
            const newR = tile.position.r + offsetR;
            const newKey = `${newQ},${newR}`;
            
            // Erstelle neue Position und Tile
            const newPosition = new HexPosition(newQ, newR);
            const newTile = new HexTile(newPosition, tile.type);
            newTile.color = tile.color;
            
            newTiles.set(newKey, newTile);
        });
        
        // Ersetze die alte Map
        this.tiles = newTiles;
        
        // Passe den Offset an, damit das angeklickte Feld visuell an der gleichen Stelle bleibt
        // Berechne die Pixel-Position des neuen Ursprungs (0,0) in den neuen Koordinaten
        const newOriginPixelPos = hexToPixel(new HexPosition(0, 0), this.settings.hexSize, this.settings.horizontalSpacing, this.settings.verticalSpacing, this.settings.layoutRotation);
        
        // Passe den Offset an, damit das angeklickte Feld visuell an der gleichen Stelle bleibt
        this.settings.offsetX += (currentPixelPos.x - newOriginPixelPos.x) * this.settings.zoom;
        this.settings.offsetY += (currentPixelPos.y - newOriginPixelPos.y) * this.settings.zoom;
        
        // Benachrichtige Observer
        this.notifyObservers('mapChanged'); // Map-Daten haben sich geändert
        this.notifyObservers('settingsChanged', this.settings); // Offset hat sich geändert
        this.saveMap(); // Speichere die neue Map und Einstellungen
    }
    
    // Hilfsmethode um ein Tile direkt hinzuzufügen (ohne setOrigin-Loop)
    addTileDirectly(q, r, type) {
        const key = `${q},${r}`;
        if (!this.tiles.has(key)) {
            const tile = new HexTile(new HexPosition(q, r), type);
            
            // Speichere den ursprünglichen Biome-Namen falls verfügbar
            if (this.settings.selectedBiome && type !== TileTypes.VOID) {
                tile.biomeName = this.settings.selectedBiome;
            }
            
            this.tiles.set(key, tile);
            this.notifyObservers('tileAdded', { q, r, type });
            console.log('[MapCore] Auto-saving map after direct tile addition...');
            this.saveMap();
            return true;
        }
        return false;
    }

    saveMap() {
        // console.log('[MapCore] saveMap called');
        // console.log('[MapCore] Current settings:', {
        //     zoom: this.settings.zoom,
        //     offsetX: this.settings.offsetX,
        //     offsetY: this.settings.offsetY
        // });
        
        try {
            
            
            // Test localStorage vor dem Speichern
            const testKey = 'hexMapEditor_save_test';
            const testValue = 'save_test_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const testRead = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (testValue !== testRead) {
                throw new Error('localStorage write/read test failed');
            }
            
            // Erstelle eine saubere Kopie der Settings (ohne Funktionen)
            const cleanSettings = {};
            Object.keys(this.settings).forEach(key => {
                if (typeof this.settings[key] !== 'function') {
                    cleanSettings[key] = this.settings[key];
                }
            });
            
            
            
            // Erstelle eine saubere Kopie der Tiles
            const cleanTiles = [];
            this.tiles.forEach((tile, key) => {
                cleanTiles.push([
                    key,
                    {
                        position: { q: tile.position.q, r: tile.position.r },
                        type: tile.type,
                        color: tile.color,
                        biomeName: tile.biomeName // Speichere den Biome-Namen
                    }
                ]);
            });
            
    
            
            // Erstelle saubere Kopien der Ebenen
            const cleanLayers = {};
            Object.keys(this.layers).forEach(layerName => {
                cleanLayers[layerName] = [];
                this.layers[layerName].forEach((tile, key) => {
                    cleanLayers[layerName].push([
                        key,
                        {
                            position: { q: tile.position.q, r: tile.position.r },
                            type: tile.type,
                            color: tile.color,
                            biomeName: tile.biomeName
                        }
                    ]);
                });
            });
            
            const mapData = {
                settings: cleanSettings,
                tiles: cleanTiles,
                layers: cleanLayers,
                currentLayer: this.currentLayer,
                timestamp: Date.now()
            };
            
            const jsonData = JSON.stringify(mapData);
    
            
            // Speichere in localStorage
            localStorage.setItem('mapEditorData', jsonData);
            
            // Verifiziere das Speichern
            const verifyData = localStorage.getItem('mapEditorData');
            if (!verifyData) {
                throw new Error('Failed to verify saved data');
            }
            
                    // console.log('[MapCore] Map saved successfully:', {
        //     settings: Object.keys(cleanSettings),
        //     zoom: cleanSettings.zoom,
        //     tilesCount: cleanTiles.length,
        //     dataSize: jsonData.length,
        //     timestamp: new Date(mapData.timestamp).toLocaleString(),
        //     verification: 'PASSED'
        // });
            
            this.notifyObservers('mapSaved', { tilesCount: cleanTiles.length });
            return true;
        } catch (error) {
            console.error('[MapCore] Failed to save map:', error);
            console.error('[MapCore] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Fallback: Versuche nur die Settings zu speichern
            try {
                console.log('[MapCore] Attempting fallback save...');
                const cleanSettings = {};
                Object.keys(this.settings).forEach(key => {
                    if (typeof this.settings[key] !== 'function') {
                        cleanSettings[key] = this.settings[key];
                    }
                });
                
                const settingsData = JSON.stringify(cleanSettings);
                localStorage.setItem('mapEditorSettings', settingsData);
                console.log('[MapCore] Settings saved as fallback');
                return true;
            } catch (fallbackError) {
                console.error('[MapCore] Fallback save also failed:', fallbackError);
                return false;
            }
        }
    }

    loadMap() {
        try {
    
            
            // Test localStorage vor dem Laden
            const testKey = 'hexMapEditor_load_test';
            const testValue = 'load_test_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const testRead = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (testValue !== testRead) {
                throw new Error('localStorage write/read test failed during load');
            }
            
            // Versuche zuerst die vollständige Map zu laden
            const savedData = localStorage.getItem('mapEditorData');

            
            if (savedData) {

                
                const mapData = JSON.parse(savedData);
                console.log('[MapCore] Parsed data structure:', {
                    hasSettings: !!mapData.settings,
                    hasTiles: !!mapData.tiles,
                    settingsKeys: mapData.settings ? Object.keys(mapData.settings) : [],
                    tilesCount: mapData.tiles ? mapData.tiles.length : 0
                });
                
                // Validiere die geladenen Daten
                if (!mapData.settings || !mapData.tiles) {
                    throw new Error('Invalid map data structure - missing settings or tiles');
                }
                
                // Lade Settings
                console.log('[MapCore] Loading settings...');
                console.log('[MapCore] Raw settings from storage:', mapData.settings);
                console.log('[MapCore] Zoom from storage:', mapData.settings.zoom);
                this.settings = Object.assign(new MapSettings(), mapData.settings);
                
                // AGGRESSIVE Korrektur der Standardwerte
                if (this.settings.horizontalSpacing === undefined || this.settings.horizontalSpacing === 5) {
                    console.log('[MapCore] Correcting horizontalSpacing from', this.settings.horizontalSpacing, 'to 0');
                    this.settings.horizontalSpacing = 0;
                }
                if (this.settings.verticalSpacing === undefined) {
                    console.log('[MapCore] Setting verticalSpacing to 0');
                    this.settings.verticalSpacing = 0;
                }
                if (this.settings.tileSpacingWidth === undefined) {
                    console.log('[MapCore] Setting tileSpacingWidth to 1');
                    this.settings.tileSpacingWidth = 1;
                }
                if (this.settings.outlineWidth === undefined) {
                    console.log('[MapCore] Setting outlineWidth to 2');
                    this.settings.outlineWidth = 2;
                }
                if (this.settings.zoom === undefined) {
                    console.log('[MapCore] Setting zoom to 1');
                    this.settings.zoom = 1;
                }
                if (this.settings.brushSize === undefined) {
                    console.log('[MapCore] Setting brushSize to 0');
                    this.settings.brushSize = 0;
                }
                
                console.log('[MapCore] Settings after correction:', {
                    horizontalSpacing: this.settings.horizontalSpacing,
                    verticalSpacing: this.settings.verticalSpacing,
                    tileSpacingWidth: this.settings.tileSpacingWidth,
                    outlineWidth: this.settings.outlineWidth,
                    zoom: this.settings.zoom,
                    buildingScale: this.settings.buildingScale,
                    buildingTransparency: this.settings.buildingTransparency,
                    useNativeTransparency: this.settings.useNativeTransparency
                });
                console.log('[MapCore] Settings loaded, keys:', Object.keys(this.settings));
                
                // Update UI after loading and correcting settings
                setTimeout(() => {
                    this.updateSettingsUI();
                }, 200);
                
                // Lade Tiles
                console.log('[MapCore] Loading tiles...');
                this.tiles.clear(); // Lösche alle bestehenden Tiles
                
                // Lade Ebenen falls verfügbar
                if (mapData.layers) {
                    console.log('[MapCore] Loading layers...');
                    Object.keys(this.layers).forEach(layerName => {
                        this.layers[layerName].clear();
                        if (mapData.layers[layerName]) {
                            let loadedLayerTiles = 0;
                            mapData.layers[layerName].forEach(([key, tileData], index) => {
                                if (tileData && tileData.position && tileData.type) {
                                    try {
                                        const tile = new HexTile(
                                            new HexPosition(tileData.position.q, tileData.position.r), 
                                            tileData.type
                                        );
                                        if (tileData.color) {
                                            tile.color = tileData.color;
                                        }
                                        if (tileData.biomeName) {
                                            tile.biomeName = tileData.biomeName;
                                        }
                                        if (tileData.selectedTile) {
                                            tile.selectedTile = tileData.selectedTile;
                                        }
                                        this.layers[layerName].set(key, tile);
                                        loadedLayerTiles++;
                                    } catch (tileError) {
                                        console.error(`[MapCore] Failed to load ${layerName} tile at index`, index, ':', tileError);
                                    }
                                }
                            });
                            console.log(`[MapCore] Loaded ${loadedLayerTiles} tiles for layer ${layerName}`);
                        }
                    });
                    
                    // Stelle die aktuelle Ebene wieder her
                    if (mapData.currentLayer && this.layers[mapData.currentLayer]) {
                        this.currentLayer = mapData.currentLayer;
                        console.log(`[MapCore] Restored current layer: ${this.currentLayer}`);
                    }
                }
                
                let loadedTiles = 0;
                mapData.tiles.forEach(([key, tileData], index) => {
                    if (tileData && tileData.position && tileData.type) {
                        try {
                            const tile = new HexTile(
                                new HexPosition(tileData.position.q, tileData.position.r), 
                                tileData.type
                            );
                            if (tileData.color) {
                                tile.color = tileData.color;
                            }
                            // Lade den Biome-Namen falls verfügbar
                            if (tileData.biomeName) {
                                tile.biomeName = tileData.biomeName;
                            }
                            // Lade das selectedTile falls verfügbar
                            if (tileData.selectedTile) {
                                tile.selectedTile = tileData.selectedTile;
                            }
                            this.tiles.set(key, tile);
                            loadedTiles++;
                        } catch (tileError) {
                            console.error('[MapCore] Failed to load tile at index', index, ':', tileError);
                        }
                    } else {
                        console.warn('[MapCore] Skipping invalid tile data at index', index, ':', tileData);
                    }
                });
                
                console.log('[MapCore] Successfully loaded', loadedTiles, 'tiles');
                
                // Stelle sicher, dass der selectedTileType korrekt geladen wird
                this.selectedTileType = this.settings.selectedTileType;
                
                // Stelle sicher, dass das ausgewählte Biome korrekt geladen wird
                if (this.settings.selectedBiome) {
                    this.selectedBiome = this.settings.selectedBiome;
                    console.log('[MapCore] Restored selected biome:', this.selectedBiome);
                }
                
                console.log('[MapCore] Map loaded successfully:', {
                    settings: Object.keys(this.settings),
                    tilesCount: this.tiles.size,
                    loadedTiles: loadedTiles,
                    timestamp: mapData.timestamp ? new Date(mapData.timestamp).toLocaleString() : 'unknown'
                });
                
                // Benachrichtige alle Observer über das Laden der Map
                this.notifyObservers('mapLoaded', { 
                    tilesCount: this.tiles.size,
                    settings: this.settings 
                });
                
                // Benachrichtige auch über alle geladenen Tiles
                this.tiles.forEach((tile, key) => {
                    const [q, r] = key.split(',').map(Number);
                    this.notifyObservers('tileAdded', { q, r, type: tile.type });
                });
                
                return true;
            }
            
            // Fallback: Versuche nur die Settings zu laden
            console.log('[MapCore] No map data found, trying settings fallback...');
            const settingsData = localStorage.getItem('mapEditorSettings');
            if (settingsData) {
                console.log('[MapCore] Found settings data, loading...');
                const settings = JSON.parse(settingsData);
                this.settings = Object.assign(new MapSettings(), settings);
                
                // AGGRESSIVE Korrektur der Standardwerte (Fallback)
                if (this.settings.horizontalSpacing === undefined || this.settings.horizontalSpacing === 5) {
                    console.log('[MapCore] Fallback: Correcting horizontalSpacing from', this.settings.horizontalSpacing, 'to 0');
                    this.settings.horizontalSpacing = 0;
                }
                if (this.settings.verticalSpacing === undefined) {
                    console.log('[MapCore] Fallback: Setting verticalSpacing to 0');
                    this.settings.verticalSpacing = 0;
                }
                if (this.settings.tileSpacingWidth === undefined) {
                    console.log('[MapCore] Fallback: Setting tileSpacingWidth to 1');
                    this.settings.tileSpacingWidth = 1;
                }
                
                console.log('[MapCore] Settings loaded as fallback, keys:', Object.keys(this.settings));
                this.notifyObservers('settingsLoaded');
                return true;
            }
            
            console.log('[MapCore] No saved data found, using defaults');
            return false;
        } catch (error) {
            console.error('[MapCore] Failed to load map:', error);
            console.error('[MapCore] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Versuche localStorage zu bereinigen falls es beschädigt ist
            try {
                console.log('[MapCore] Clearing corrupted localStorage data...');
                localStorage.removeItem('mapEditorData');
                localStorage.removeItem('mapEditorSettings');
                console.log('[MapCore] Cleared corrupted localStorage data');
            } catch (clearError) {
                console.error('[MapCore] Failed to clear localStorage:', clearError);
            }
            return false;
        }
    }

    reloadMap() {
        try {
            console.log('[MapCore] Reloading map...');
            console.log('[MapCore] Current state before reload:');
            console.log('- Tiles count:', this.tiles.size);
            console.log('- Settings keys:', Object.keys(this.settings));
            
            // Versuche localStorage zu reparieren falls nötig
            if (typeof this.repairLocalStorage === 'function') {
                console.log('[MapCore] Attempting localStorage repair before reload...');
                this.repairLocalStorage();
            }
            
            // Lösche alle aktuellen Tiles
            this.tiles.clear();
            console.log('[MapCore] Cleared current tiles');
            
            // Lade die Map neu
            const success = this.loadMap();
            if (success) {
                console.log('[MapCore] Map reloaded successfully');
                console.log('[MapCore] New state after reload:');
                console.log('- Tiles count:', this.tiles.size);
                console.log('- Settings keys:', Object.keys(this.settings));
                this.notifyObservers('mapReloaded', { tilesCount: this.tiles.size });
            } else {
                console.log('[MapCore] Failed to reload map');
            }
            return success;
        } catch (error) {
            console.error('[MapCore] Reload failed with error:', error);
            return false;
        }
    }

    forceSaveMap() {
        try {
            console.log('[MapCore] Force saving map...');
            console.log('[MapCore] Current state before force save:');
            console.log('- Tiles count:', this.tiles.size);
            console.log('- Settings keys:', Object.keys(this.settings));
            console.log('- Selected tile type:', this.selectedTileType);
            
            // Versuche localStorage zu reparieren falls nötig
            if (typeof this.repairLocalStorage === 'function') {
                console.log('[MapCore] Attempting localStorage repair before save...');
                this.repairLocalStorage();
            }
            
            const success = this.saveMap();
            if (success) {
                console.log('[MapCore] Map force saved successfully');
                this.notifyObservers('mapForceSaved', { tilesCount: this.tiles.size });
                
                // Verifiziere das Speichern
                const verifyData = localStorage.getItem('mapEditorData');
                if (verifyData) {
                    console.log('[MapCore] Force save verification: PASSED');
                } else {
                    console.error('[MapCore] Force save verification: FAILED');
                }
            } else {
                console.error('[MapCore] Failed to force save map');
            }
            return success;
        } catch (error) {
            console.error('[MapCore] Force save failed with error:', error);
            return false;
        }
    }

    clearMap() {
        console.log('[MapCore] Clearing map...');
        this.tiles.clear();
        localStorage.removeItem('mapEditorData');
        localStorage.removeItem('mapEditorSettings');
        console.log('[MapCore] Map cleared and localStorage reset');
        this.notifyObservers('mapCleared');
    }
    
    // Funktion um localStorage zu reparieren
    repairLocalStorage() {
        try {
            console.log('[MapCore] Attempting to repair localStorage...');
            
            // Lösche alle beschädigten Daten
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('hexMapEditor')) {
                    try {
                        const value = localStorage.getItem(key);
                        if (value) {
                            JSON.parse(value); // Test ob JSON gültig ist
                        }
                    } catch (error) {
                        console.log('[MapCore] Found corrupted key:', key, 'removing...');
                        keysToRemove.push(key);
                    }
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log('[MapCore] Removed corrupted key:', key);
            });
            
            // Test localStorage-Funktionalität
            const testKey = 'hexMapEditor_repair_test';
            const testValue = 'repair_test_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const testRead = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const success = testValue === testRead;
            console.log('[MapCore] localStorage repair test:', success ? 'SUCCESS' : 'FAILED');
            
            return success;
        } catch (error) {
            console.error('[MapCore] Failed to repair localStorage:', error);
            return false;
        }
    }
    
    // Funktion um localStorage-Status in Echtzeit zu überwachen
    monitorLocalStorage() {
        try {
            console.log('[MapCore] Starting localStorage monitoring...');
            
            // Überwache localStorage-Änderungen
            const originalSetItem = localStorage.setItem;
            const originalRemoveItem = localStorage.removeItem;
            const originalClear = localStorage.clear;
            
            localStorage.setItem = function(key, value) {
                console.log('[MapCore] localStorage.setItem called:', key, 'value length:', value ? value.length : 0);
                return originalSetItem.apply(this, arguments);
            };
            
            localStorage.removeItem = function(key) {
                console.log('[MapCore] localStorage.removeItem called:', key);
                return originalRemoveItem.apply(this, arguments);
            };
            
            localStorage.clear = function() {
                console.log('[MapCore] localStorage.clear called');
                return originalClear.apply(this, arguments);
            };
            
            console.log('[MapCore] localStorage monitoring enabled');
            return true;
        } catch (error) {
            console.error('[MapCore] Failed to enable localStorage monitoring:', error);
            return false;
        }
    }
    
    // Funktion um den Core-Status zu testen
    testCoreStatus() {
        try {
            console.log('[MapCore] Testing core status...');
            
            const status = {
                coreType: this.constructor.name,
                isMapCore: this instanceof MapCore,
                hasTiles: !!this.tiles,
                tilesType: this.tiles ? this.tiles.constructor.name : 'undefined',
                tilesSize: this.tiles ? this.tiles.size : 'undefined',
                hasSettings: !!this.settings,
                settingsType: this.settings ? this.settings.constructor.name : 'undefined',
                functions: {
                    saveMap: typeof this.saveMap === 'function',
                    loadMap: typeof this.loadMap === 'function',
                    forceSaveMap: typeof this.forceSaveMap === 'function',
                    reloadMap: typeof this.reloadMap === 'function',
                    clearMap: typeof this.clearMap === 'function',
                    debugStorage: typeof this.debugStorage === 'function',
                    repairLocalStorage: typeof this.repairLocalStorage === 'function',
                    monitorLocalStorage: typeof this.monitorLocalStorage === 'function',
                    getMapData: typeof this.getMapData === 'function',
                    loadMapFromData: typeof this.loadMapFromData === 'function'
                }
            };
            
            console.log('[MapCore] Core status test result:', status);
            return status;
        } catch (error) {
            console.error('[MapCore] Core status test failed:', error);
            return { error: error.message };
        }
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (observer.onEvent) {
                observer.onEvent(event, data);
            }
        });
    }

    // TileMapper integration
    setSelectedTile(tile) {
        if (this.tileMapper) {
            this.tileMapper.setSelectedTile(tile);
        }
    }

    getSelectedTile() {
        return this.tileMapper ? this.tileMapper.getSelectedTile() : null;
    }

    onTilePlaced(x, y, tile, rotation) {
        console.log('[MapCore] Tile placed:', tile.name, 'at', x, y, 'rotation:', rotation);
        // Store in layers
        const layerKey = `${x},${y}`;
        this.layers[this.currentLayer].set(layerKey, {
            tile: tile,
            rotation: rotation,
            timestamp: Date.now()
        });
        
        // Notify observers
        this.notifyObservers('tilePlaced', { x, y, tile, rotation, layer: this.currentLayer });
    }
    
    // BiomeTileSelector Integration
    onBiomeSelected(biome) {
        console.log('[MapCore] Biome selected:', biome.name);
        this.selectedBiome = biome;
        this.notifyObservers('biomeSelected', { biome });
    }
    
    onCategorySelected(category, biome) {
        console.log('[MapCore] Category selected:', category.name, 'in biome:', biome.name);
        this.selectedCategory = category;
        this.selectedBiome = biome;
        this.notifyObservers('categorySelected', { category, biome });
    }
    
    // Ebenen-Verwaltung
    setCurrentLayer(layerName) {
        if (this.layers.hasOwnProperty(layerName)) {
            this.currentLayer = layerName;
            this.notifyObservers('layerChanged', { layer: layerName });
            console.log(`[MapCore] Switched to layer: ${layerName}`);
        }
    }
    
    getCurrentLayer() {
        return this.currentLayer;
    }
    
    getBiomeNameForLayer(layer) {
        // Layer-spezifische Biome-Namen
        if (layer === 'streets') {
            // Für Streets-Layer: Bestimme Biome basierend auf dem ausgewählten Tile
            return this.getBiomeNameForSelectedTile();
        } else if (layer === 'terrain') {
            // Verwende das ausgewählte Terrain-Biome
            return this.selectedBiome || 'Forest';
        }
        return this.selectedBiome || 'Forest';
    }
    
    getBiomeNameForSelectedTile() {
        // Bestimme den korrekten Biome-Namen basierend auf dem ausgewählten Tile
        if (this.selectedTile && this.selectedTile.name) {
            const tileName = this.selectedTile.name.toLowerCase();
            
            // Kategorisiere Gebäude basierend auf ihrem Namen
            if (tileName.includes('turm') || tileName.includes('tower')) {
                return 'Tower';
            } else if (tileName.includes('burg') || tileName.includes('castle')) {
                return 'Castle';
            } else if (tileName.includes('mine')) {
                return 'Mine';
            } else if (tileName.includes('haus') || tileName.includes('house')) {
                return 'House';
            } else if (tileName.includes('dorf') || tileName.includes('village')) {
                return 'Village';
            } else if (tileName.includes('siedlung') || tileName.includes('settlement')) {
                return 'Settlement';
            } else if (tileName.includes('mauer') || tileName.includes('wall')) {
                return 'Wall';
            } else if (tileName.includes('tor') || tileName.includes('gate')) {
                return 'Gate';
            } else if (tileName.includes('brücke') || tileName.includes('bridge')) {
                return 'Bridge';
            } else if (tileName.includes('straße') || tileName.includes('street') || tileName.includes('road')) {
                return 'Street';
            } else if (tileName.includes('platz') || tileName.includes('square')) {
                return 'Square';
            } else if (tileName.includes('markt') || tileName.includes('market')) {
                return 'Market';
            } else if (tileName.includes('tempel') || tileName.includes('temple')) {
                return 'Temple';
            } else if (tileName.includes('kirche') || tileName.includes('church')) {
                return 'Church';
            } else if (tileName.includes('taverne') || tileName.includes('tavern')) {
                return 'Tavern';
            } else if (tileName.includes('schmiede') || tileName.includes('smith')) {
                return 'Smithy';
            } else if (tileName.includes('mühle') || tileName.includes('mill')) {
                return 'Mill';
            } else if (tileName.includes('lager') || tileName.includes('warehouse')) {
                return 'Warehouse';
            } else if (tileName.includes('stall') || tileName.includes('stable')) {
                return 'Stable';
            } else if (tileName.includes('garten') || tileName.includes('garden')) {
                return 'Garden';
            } else if (tileName.includes('brunnen') || tileName.includes('well')) {
                return 'Well';
            } else if (tileName.includes('ruine') || tileName.includes('ruin')) {
                return 'Ruin';
            } else {
                // Fallback für unbekannte Gebäudetypen
                return 'Building';
            }
        }
        
        // Fallback wenn kein Tile ausgewählt ist
        return 'Building';
    }
    
    getLayerTiles(layerName) {
        return this.layers[layerName] || new Map();
    }
    
    getAllLayers() {
        return this.layers;
    }
    
    // Tile-Verwaltung für Ebenen
    setTileAt(x, y, tileData, layerName = null) {
        const layer = layerName || this.currentLayer;
        const key = `${x},${y}`;
        
        if (this.layers[layer]) {
            this.layers[layer].set(key, tileData);
            
            // Auch in die Legacy-Map schreiben für Kompatibilität
            this.tiles.set(key, tileData);
            
            this.notifyObservers('tileChanged', { x, y, layer, tileData });
            console.log('[MapCore] setTileAt: Set tile at', x, y, 'in layer', layer, 'type:', tileData.type);
        }
    }
    
    getTileAt(x, y, layerName = null) {
        const layer = layerName || this.currentLayer;
        const key = `${x},${y}`;
        
        return this.layers[layer]?.get(key) || null;
    }
    
    removeTileAt(x, y, layerName = null) {
        const layer = layerName || this.currentLayer;
        const key = `${x},${y}`;
        
        console.log('[MapCore] removeTileAt called for:', x, y, 'in layer:', layer);
        
        let removed = false;
        
        // Remove from specified layer
        if (this.layers[layer] && this.layers[layer].has(key)) {
            this.layers[layer].delete(key);
            console.log('[MapCore] Removed tile from layer:', layer);
            removed = true;
        }
        
        // Also remove from legacy tiles map for compatibility
        if (this.tiles.has(key)) {
            this.tiles.delete(key);
            console.log('[MapCore] Removed tile from legacy tiles map');
            removed = true;
        }
        
        // Remove from all layers to ensure complete cleanup
        Object.keys(this.layers).forEach(layerKey => {
            if (this.layers[layerKey] && this.layers[layerKey].has(key)) {
                this.layers[layerKey].delete(key);
                console.log('[MapCore] Removed tile from additional layer:', layerKey);
                removed = true;
            }
        });
        
        if (removed) {
            this.notifyObservers('tileRemoved', { x, y, layer });
            // Force render update
            this.notifyObservers('mapChanged', {});
        }
    }
    
    clearLayer(layerName = null) {
        const layer = layerName || this.currentLayer;
        
        if (this.layers[layer]) {
            this.layers[layer].clear();
            this.notifyObservers('layerCleared', { layer });
            console.log(`[MapCore] Cleared layer: ${layer}`);
        }
    }
    
    // Debug-Funktion für localStorage-Status
    debugStorage() {
        try {
            console.log('[MapCore] Testing localStorage functionality...');
            
            // Test localStorage-Schreibzugriff
            const testKey = 'hexMapEditor_test';
            const testValue = 'test_value_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const readValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            console.log('[MapCore] localStorage write/read test:', testValue === readValue ? 'SUCCESS' : 'FAILED');
            
            const mapData = localStorage.getItem('mapEditorData');
            const settingsData = localStorage.getItem('mapEditorSettings');
            
            console.log('[MapCore] Storage Debug Info:');
            console.log('- localStorage available:', typeof localStorage !== 'undefined');
            console.log('- localStorage setItem available:', typeof localStorage.setItem === 'function');
            console.log('- localStorage getItem available:', typeof localStorage.getItem === 'function');
            console.log('- mapEditorData exists:', !!mapData);
            console.log('- mapEditorSettings exists:', !!settingsData);
            
            if (mapData) {
                try {
                    const parsed = JSON.parse(mapData);
                    console.log('- Map data size:', mapData.length);
                    console.log('- Tiles count:', parsed.tiles ? parsed.tiles.length : 0);
                    console.log('- Settings keys:', Object.keys(parsed.settings || {}));
                } catch (parseError) {
                    console.error('- Failed to parse mapData:', parseError);
                }
            }
            
            if (settingsData) {
                try {
                    const parsed = JSON.parse(settingsData);
                    console.log('- Settings data size:', settingsData.length);
                    console.log('- Settings keys:', Object.keys(parsed));
                } catch (parseError) {
                    console.error('- Failed to parse settingsData:', parseError);
                }
            }
            
            // Aktueller Core-Status
            console.log('[MapCore] Current Core Status:');
            console.log('- Tiles count:', this.tiles.size);
            console.log('- Settings:', Object.keys(this.settings));
            console.log('- Selected tile type:', this.selectedTileType);
            
            // Teste localStorage-Größe
            let totalSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        totalSize += key.length + value.length;
                    }
                }
            }
            console.log('- Total localStorage size (chars):', totalSize);
            console.log('- localStorage quota (estimated):', '~5-10 MB');
            
            // Teste alle Core-Funktionen
            console.log('[MapCore] Core Function Tests:');
            console.log('- saveMap:', typeof this.saveMap === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- loadMap:', typeof this.loadMap === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- forceSaveMap:', typeof this.forceSaveMap === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- reloadMap:', typeof this.reloadMap === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- clearMap:', typeof this.clearMap === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- debugStorage:', typeof this.debugStorage === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- repairLocalStorage:', typeof this.repairLocalStorage === 'function' ? 'AVAILABLE' : 'MISSING');
            console.log('- monitorLocalStorage:', typeof this.monitorLocalStorage === 'function' ? 'AVAILABLE' : 'MISSING');
            
            // Teste Core-Instanz
            console.log('[MapCore] Core Instance Tests:');
            console.log('- this constructor:', this.constructor.name);
            console.log('- this instanceof MapCore:', this instanceof MapCore);
            console.log('- this.tiles instanceof Map:', this.tiles instanceof Map);
            console.log('- this.settings instanceof MapSettings:', this.settings && this.settings.constructor && this.settings.constructor.name === 'MapSettings');
            
            return { 
                mapData: !!mapData, 
                settingsData: !!settingsData,
                localStorageWorking: testValue === readValue,
                currentTilesCount: this.tiles.size,
                totalStorageSize: totalSize,
                coreFunctions: {
                    saveMap: typeof this.saveMap === 'function',
                    loadMap: typeof this.loadMap === 'function',
                    forceSaveMap: typeof this.forceSaveMap === 'function',
                    reloadMap: typeof this.reloadMap === 'function',
                    clearMap: typeof this.clearMap === 'function',
                    debugStorage: typeof this.debugStorage === 'function',
                    repairLocalStorage: typeof this.repairLocalStorage === 'function',
                    monitorLocalStorage: typeof this.monitorLocalStorage === 'function'
                },
                coreInstance: {
                    constructor: this.constructor.name,
                    isMapCore: this instanceof MapCore,
                    tilesType: this.tiles instanceof Map,
                    settingsType: this.settings && this.settings.constructor && this.settings.constructor.name === 'MapSettings'
                }
            };
        } catch (error) {
            console.error('[MapCore] Storage debug failed:', error);
            return { error: error.message };
        }
    }

    // Map explizit speichern
    forceSaveMap() {
        try {
            console.log('[MapCore] Force saving map...');
            const result = this.saveMap();
            if (result) {
                this.notifyObservers('mapForceSaved', { tilesCount: this.tiles.size });
                console.log('[MapCore] Map force saved successfully');
            }
            return result;
        } catch (error) {
            console.error('[MapCore] Force save failed:', error);
            return false;
        }
    }

    // Map neu laden
    reloadMap() {
        try {
            console.log('[MapCore] Reloading map...');
            this.tiles.clear();
            const result = this.loadMap();
            if (result) {
                this.notifyObservers('mapReloaded', { tilesCount: this.tiles.size });
                console.log('[MapCore] Map reloaded successfully');
            }
            return result;
        } catch (error) {
            console.error('[MapCore] Reload failed:', error);
            return false;
        }
    }

    // Map löschen
    clearMap() {
        try {
            console.log('[MapCore] Clearing map...');
            this.tiles.clear();
            localStorage.removeItem('mapEditorData');
            localStorage.removeItem('mapEditorSettings');
            this.notifyObservers('mapCleared', { tilesCount: 0 });
            console.log('[MapCore] Map cleared successfully');
            return true;
        } catch (error) {
            console.error('[MapCore] Clear failed:', error);
            return false;
        }
    }

    // localStorage reparieren
    repairLocalStorage() {
        try {
            console.log('[MapCore] Repairing localStorage...');
            
            // Entferne beschädigte Keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('hexMapEditor_')) {
                    try {
                        const value = localStorage.getItem(key);
                        if (value) {
                            JSON.parse(value); // Teste ob JSON gültig ist
                        }
                    } catch (error) {
                        console.warn('[MapCore] Corrupted localStorage key:', key);
                        keysToRemove.push(key);
                    }
                }
            }
            
            // Entferne beschädigte Keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log('[MapCore] Removed corrupted key:', key);
            });
            
            // Teste localStorage-Funktionalität
            const testKey = 'hexMapEditor_repair_test';
            const testValue = 'test_' + Date.now();
            localStorage.setItem(testKey, testValue);
            const readValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const success = testValue === readValue;
            console.log('[MapCore] localStorage repair test:', success ? 'SUCCESS' : 'FAILED');
            
            return success;
        } catch (error) {
            console.error('[MapCore] localStorage repair failed:', error);
            return false;
        }
    }

    // localStorage überwachen
    monitorLocalStorage() {
        try {
            console.log('[MapCore] Setting up localStorage monitoring...');
            
            // Speichere originale Funktionen
            const originalSetItem = localStorage.setItem;
            const originalRemoveItem = localStorage.removeItem;
            const originalClear = localStorage.clear;
            
            // Überschreibe setItem für Logging
            localStorage.setItem = function(key, value) {
                console.log('[localStorage] SET:', key, '=', value ? value.substring(0, 100) + '...' : 'null');
                return originalSetItem.call(this, key, value);
            };
            
            // Überschreibe removeItem für Logging
            localStorage.removeItem = function(key) {
                console.log('[localStorage] REMOVE:', key);
                return originalRemoveItem.call(this, key);
            };
            
            // Überschreibe clear für Logging
            localStorage.clear = function() {
                console.log('[localStorage] CLEAR all');
                return originalClear.call(this);
            };
            
            console.log('[MapCore] localStorage monitoring activated');
            return true;
        } catch (error) {
            console.error('[MapCore] Failed to setup localStorage monitoring:', error);
            return false;
        }
    }

    // Core-Status testen
    testCoreStatus() {
        try {
            console.log('[MapCore] Testing core status...');
            
            const status = {
                coreType: this.constructor.name,
                isMapCore: this instanceof MapCore,
                hasTiles: !!this.tiles,
                tilesType: this.tiles ? this.tiles.constructor.name : 'undefined',
                tilesSize: this.tiles ? this.tiles.size : 'undefined',
                hasSettings: !!this.settings,
                settingsType: this.settings ? this.settings.constructor.name : 'undefined',
                functions: {
                    saveMap: typeof this.saveMap === 'function',
                    loadMap: typeof this.loadMap === 'function',
                    forceSaveMap: typeof this.forceSaveMap === 'function',
                    reloadMap: typeof this.reloadMap === 'function',
                    clearMap: typeof this.clearMap === 'function',
                    debugStorage: typeof this.debugStorage === 'function',
                    repairLocalStorage: typeof this.repairLocalStorage === 'function',
                    monitorLocalStorage: typeof this.monitorLocalStorage === 'function'
                }
            };
            
            console.log('[MapCore] Core status test result:', status);
            return status;
        } catch (error) {
            console.error('[MapCore] Core status test failed:', error);
            return { error: error.message };
        }
    }
    
    // Map exportieren
    exportMap() {
        try {
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: this.settings,
                tiles: Array.from(this.tiles.entries()).map(([key, tile]) => ({
                    key,
                    q: tile.position.q,
                    r: tile.position.r,
                    type: tile.type
                })),
                tilesCount: this.tiles.size,
                origin: this.origin ? { q: this.origin.q, r: this.origin.r } : null
            };
            
            console.log('[MapCore] Map exportiert:', exportData.tilesCount, 'Tiles');
            return exportData;
        } catch (error) {
            console.error('[MapCore] Fehler beim Exportieren der Map:', error);
            throw new Error('Fehler beim Exportieren der Map: ' + error.message);
        }
    }
    
    // Neue Funktionen für das MapsModule
    
    // Hole aktuelle Map-Daten für das Speichern
    getMapData() {
        try {
            console.log('[MapCore] Getting map data for saving...');
            console.log('[MapCore] Current tiles count:', this.tiles ? this.tiles.size : 'undefined');
            console.log('[MapCore] Current settings keys:', this.settings ? Object.keys(this.settings) : 'undefined');
            
            // Erstelle eine saubere Kopie der Settings (ohne Funktionen)
            const cleanSettings = {};
            if (this.settings) {
                Object.keys(this.settings).forEach(key => {
                    if (typeof this.settings[key] !== 'function') {
                        cleanSettings[key] = this.settings[key];
                    }
                });
            }
            
            // Erstelle eine saubere Kopie der Tiles
            const cleanTiles = [];
            if (this.tiles && this.tiles.size > 0) {
                this.tiles.forEach((tile, key) => {
                    try {
                        cleanTiles.push([
                            key,
                            {
                                position: { q: tile.position.q, r: tile.position.r },
                                type: tile.type,
                                color: tile.color,
                                biomeName: tile.biomeName || null
                            }
                        ]);
                    } catch (tileError) {
                        console.warn('[MapCore] Error processing tile:', tileError);
                    }
                });
            }
            
            const mapData = {
                settings: cleanSettings,
                tiles: cleanTiles,
                timestamp: Date.now()
            };
            
            console.log('[MapCore] Map data prepared successfully:', {
                settings: Object.keys(cleanSettings),
                tilesCount: cleanTiles.length,
                timestamp: new Date(mapData.timestamp).toLocaleString(),
                hasTiles: cleanTiles.length > 0,
                hasSettings: Object.keys(cleanSettings).length > 0
            });
            
            return mapData;
            
        } catch (error) {
            console.error('[MapCore] Error getting map data:', error);
            console.error('[MapCore] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            return null;
        }
    }
    
    // Lade Map aus gespeicherten Daten
    loadMapFromData(mapData) {
        try {
            console.log('[MapCore] Loading map from saved data...');
            
            if (!mapData || !mapData.settings || !mapData.tiles) {
                console.error('[MapCore] Invalid map data format');
                return false;
            }
            
            // Lade Settings
            if (mapData.settings) {
                Object.keys(mapData.settings).forEach(key => {
                    if (typeof this.settings[key] !== 'function') {
                        this.settings[key] = mapData.settings[key];
                    }
                });
                console.log('[MapCore] Settings loaded:', Object.keys(mapData.settings));
            }
            
            // Lösche aktuelle Tiles
            this.tiles.clear();
            
            // Lade Tiles synchron
            if (mapData.tiles && Array.isArray(mapData.tiles)) {
                for (const [key, tileData] of mapData.tiles) {
                    try {
                        // Verwende die bereits geladenen Klassen
                        const position = new HexPosition(tileData.position.q, tileData.position.r);
                        const tile = new HexTile(position, tileData.type);
                        
                        if (tileData.color) {
                            tile.color = tileData.color;
                        }
                        
                        if (tileData.biomeName) {
                            tile.biomeName = tileData.biomeName;
                        }
                        
                        this.tiles.set(key, tile);
                        
                    } catch (tileError) {
                        console.warn('[MapCore] Failed to load tile:', tileError);
                    }
                }
                
                console.log('[MapCore] Tiles loaded:', this.tiles.size);
            }
            
            // Benachrichtige Observer
            this.notifyObservers('mapLoaded', { 
                tilesCount: this.tiles.size,
                source: 'savedMap'
            });
            
            console.log('[MapCore] Map loaded successfully from saved data');
            return true;
            
        } catch (error) {
            console.error('[MapCore] Error loading map from data:', error);
            return false;
        }
    }

    getBiomeColor(biomeId, type = 'grass') {
        try {
            // Biome-spezifische Farben basierend auf Biome-Ordner
            const biomeColors = {
                'void': '#000000',
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
                'coast': '#03A9F4',
                'buildings': '#FF5722',
                'unassigned': '#9E9E9E'
            };
            
            const lowerBiomeId = biomeId.toLowerCase();
            if (biomeColors[lowerBiomeId]) {
                return biomeColors[lowerBiomeId];
            }
            
            // Fallback zu Standard-Farben
            const fallbackColors = {
                'grass': '#4CAF50',
                'water': '#2196F3',
                'mountain': '#795548',
                'forest': '#388E3C',
                'desert': '#FF9800',
                'snow': '#FFFFFF',
                'void': '#000000'
            };
            return fallbackColors[type] || '#4CAF50';
        } catch (error) {
            console.warn(`[MapCore] Error loading biome data for ${biomeId}:`, error);
            return '#4CAF50'; // Standard-Farbe
        }
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.MapCore = MapCore;
}

// Globale Variable für andere Module (Fallback)
window.MapCore = MapCore;
