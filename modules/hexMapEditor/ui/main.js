// Entferne ES6-Imports und verwende globale Klassen
// import { UIManager } from './ui.js';
// import { MapRenderer } from './renderer.js';
// import { SurroundingChecker } from './surrounding.js';
// import { FPSViewer } from './fps.js';
// import { MapCore } from './core.js';

// Hauptanwendung und Modul-Integration
class MapEditor {
    constructor(canvas, core) {
        this.core = core;
        this.canvas = canvas;
        this.renderer = null;
        this.ui = null;
        this.surroundingChecker = null;
        this.fpsViewer = null;
    }

    initializeComponents() {
        // console.log('[MapEditor] initializeComponents called');
        // console.log('[MapEditor] Canvas:', this.canvas);
        // console.log('[MapEditor] Core:', this.core);
        
        // Initialisiere alle Komponenten nachdem die Funktionen verfügbar sind
        this.renderer = new MapRenderer(this.canvas, this.core);
        this.ui = new UIManager(this.core, this.renderer);
        this.surroundingChecker = new SurroundingChecker(this.core, this.renderer);
        this.fpsViewer = new FPSViewer();
        
        // Initialisiere ToolsModule für Pinselgrößenregler
        if (typeof ToolsModule !== 'undefined') {
            this.toolsModule = new ToolsModule(this.core);
            console.log('[MapEditor] ToolsModule initialized');
        } else {
            console.error('[MapEditor] ToolsModule class not found!');
        }

        // Initialisiere das neue BiomeTileSelector Modul
        if (typeof BiomeTileSelector !== 'undefined') {
            this.biomeTileSelector = new BiomeTileSelector(this.core);
            
            // Speichere die Instanz global für Debug-Zugriff
            window.biomeTileSelector = this.biomeTileSelector;
            
            // console.log('[MapEditor] BiomeTileSelector initialized successfully');
        } else {
            console.error('[MapEditor] BiomeTileSelector class not found!');
        }

        // Initialisiere MapsModule separat für besseren Zugriff
        if (typeof MapsModule !== 'undefined') {
            this.mapsModule = new MapsModule(this.core);
            
            // Speichere die Instanz global für Debug-Zugriff
            window.mapsModule = this.mapsModule;
            
            console.log('[MapEditor] MapsModule initialized successfully');
        } else {
            console.error('[MapEditor] MapsModule class not found!');
        }

        // Verbinde den SurroundingChecker mit UI und Renderer
        this.ui.setSurroundingChecker(this.surroundingChecker);

        this.setupObservers();
        this.initialize();
    }

    setupObservers() {
        this.core.addObserver({
            onEvent: (event, data) => {
                switch (event) {
                    case 'tileChanged':
                        this.renderer.render();
                        break;
                    case 'settingsChanged':
                        this.renderer.render();
                        break;
                    case 'mapCleared':
                        this.renderer.render();
                        break;
                    case 'mapSaved':
                        // console.log('Map saved successfully');
                        break;
                    case 'mapLoaded':
                        this.renderer.render();
                        // Aktualisiere die Ebenen-Tabs
                        this.updateLayerTabs();
                        break;
                    case 'layerChanged':
                        console.log('Layer changed to:', data.layer);
                        // Aktualisiere die Ebenen-Tabs
                        this.updateLayerTabs();
                        this.renderer.render();
                        break;
                    case 'layerCleared':
                        console.log('Layer cleared:', data.layer);
                        this.renderer.render();
                        break;
                    case 'tileChanged':
                        this.renderer.render();
                        // Zeige Ebenen-Informationen an
                        this.updateLayerInfo();
                        break;
                }
            }
        });
    }

    initialize() {
        // Initial render
        this.renderer.render();
        
        // Toolbar-Buttons Event-Handler
        this.setupToolbarEvents();
        
        // Tastatur-Shortcuts einrichten
        this.setupKeyboardShortcuts();
        
        // Initialisiere BiomeTileSelector falls noch nicht geschehen
        if (!window.biomeTileSelector && typeof BiomeTileSelector !== 'undefined') {
            // console.log('[MapEditor] Initializing BiomeTileSelector in initialize()...');
            this.biomeTileSelector = new BiomeTileSelector(this.core);
            window.biomeTileSelector = this.biomeTileSelector;
        }
        
        // console.log('[MapEditor] Initialized successfully');
    }
    
    setupToolbarEvents() {
        // Lösch-Button für aktuelle Ebene
        const clearLayerBtn = document.getElementById('clear-layer-btn');
        if (clearLayerBtn) {
            clearLayerBtn.addEventListener('click', () => {
                this.clearCurrentLayer();
            });
        }
        
        // Lösch-Modus-Button
        const deleteModeBtn = document.getElementById('delete-mode-btn');
        if (deleteModeBtn) {
            deleteModeBtn.addEventListener('click', () => {
                this.toggleDeleteMode();
            });
        }
        
        // Ebenen-Tabs
        const layerTabs = document.querySelectorAll('.layer-tab');
        layerTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const selectedLayer = e.target.dataset.layer;
                console.log('[MapEditor] Ebenen-Wechsel zu:', selectedLayer);
                
                // Entferne active-Klasse von allen Tabs
                layerTabs.forEach(t => t.classList.remove('active'));
                
                // Aktiviere den geklickten Tab
                e.target.classList.add('active');
                
                // Wechsle Layer im Core
                this.core.setCurrentLayer(selectedLayer);
                
                // Aktualisiere das BiomeTileSelector Modul
                if (this.biomeTileSelector) {
                    this.biomeTileSelector.setCurrentLayer(selectedLayer);
                }
                
                // Füge active-Klasse zum geklickten Tab hinzu
                e.target.classList.add('active');
                
                // Setze die Ebene im Core
                this.core.setCurrentLayer(selectedLayer);
                
                // Aktualisiere die Anzeige
                this.renderer.render();
            });
        });
        
                        // Setze die aktuelle Ebene beim Start
                this.updateLayerTabs();
        
        // Speichern-Button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('[MapEditor] Speichern-Button geklickt');
                try {
                    this.core.saveMap();
                    // Visuelles Feedback
                    saveBtn.textContent = '✅ Gespeichert';
                    saveBtn.style.backgroundColor = '#4CAF50';
                    setTimeout(() => {
                        saveBtn.textContent = '💾 Speichern';
                        saveBtn.style.backgroundColor = '';
                    }, 2000);
                } catch (error) {
                    console.error('[MapEditor] Fehler beim Speichern:', error);
                    saveBtn.textContent = '❌ Fehler';
                    saveBtn.style.backgroundColor = '#f44336';
                    setTimeout(() => {
                        saveBtn.textContent = '💾 Speichern';
                        saveBtn.style.backgroundColor = '';
                    }, 2000);
                }
            });
        }
        
        // Laden-Button
        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                console.log('[MapEditor] Laden-Button geklickt');
                try {
                    this.core.loadMap();
                    // Visuelles Feedback
                    loadBtn.textContent = '✅ Geladen';
                    loadBtn.style.backgroundColor = '#2196F3';
                    setTimeout(() => {
                        loadBtn.textContent = '📂 Laden';
                        loadBtn.style.backgroundColor = '';
                    }, 2000);
                } catch (error) {
                    console.error('[MapEditor] Fehler beim Laden:', error);
                    loadBtn.textContent = '❌ Fehler';
                    loadBtn.style.backgroundColor = '#f44336';
                    setTimeout(() => {
                        loadBtn.textContent = '📂 Laden';
                        loadBtn.style.backgroundColor = '';
                    }, 2000);
                }
            });
        }
        
        // Export-Button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                console.log('[MapEditor] Export-Button geklickt');
                this.exportMap();
            });
        }
        
        // Löschen-Button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('[MapEditor] Löschen-Button geklickt');
                if (confirm('Möchten Sie wirklich alle Tiles aus ALLEN Ebenen löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                    this.clearAllLayers();
                }
            });
        }
        
        // Update-Tiles-Button
        const updateTilesBtn = document.getElementById('update-tiles-btn');
        if (updateTilesBtn) {
            updateTilesBtn.addEventListener('click', async () => {
                console.log('[MapEditor] Update-Tiles-Button geklickt');
                
                if (this.renderer && typeof this.renderer.updateAllTilesWithSelectedTileAsync === 'function') {
                    // Zeige Loading-Status
                    updateTilesBtn.textContent = '⏳ Aktualisiere...';
                    updateTilesBtn.style.backgroundColor = '#FF9800';
                    updateTilesBtn.disabled = true;
                    
                    try {
                        // Führe Update aus
                        await this.renderer.updateAllTilesWithSelectedTileAsync();
                        
                        // Erfolg-Feedback
                        updateTilesBtn.textContent = '✅ Aktualisiert';
                        updateTilesBtn.style.backgroundColor = '#4CAF50';
                        
                        // Nach 2 Sekunden zurücksetzen
                        setTimeout(() => {
                            updateTilesBtn.textContent = '🔄 Tiles aktualisieren';
                            updateTilesBtn.style.backgroundColor = '';
                            updateTilesBtn.disabled = false;
                        }, 2000);
                        
                    } catch (error) {
                        console.error('[MapEditor] Error updating tiles:', error);
                        updateTilesBtn.textContent = '❌ Fehler';
                        updateTilesBtn.style.backgroundColor = '#f44336';
                        
                        setTimeout(() => {
                            updateTilesBtn.textContent = '🔄 Tiles aktualisieren';
                            updateTilesBtn.style.backgroundColor = '';
                            updateTilesBtn.disabled = false;
                        }, 2000);
                    }
                } else if (this.renderer && typeof this.renderer.updateAllTilesWithSelectedTile === 'function') {
                    // Fallback zur synchronen Version
                    updateTilesBtn.textContent = '⏳ Aktualisiere...';
                    updateTilesBtn.style.backgroundColor = '#FF9800';
                    updateTilesBtn.disabled = true;
                    
                    try {
                        // Führe Update aus
                        this.renderer.updateAllTilesWithSelectedTile();
                        
                        // Erfolg-Feedback
                        updateTilesBtn.textContent = '✅ Aktualisiert';
                        updateTilesBtn.style.backgroundColor = '#4CAF50';
                        
                        // Nach 2 Sekunden zurücksetzen
                        setTimeout(() => {
                            updateTilesBtn.textContent = '🔄 Tiles aktualisieren';
                            updateTilesBtn.style.backgroundColor = '';
                            updateTilesBtn.disabled = false;
                        }, 2000);
                        
                    } catch (error) {
                        console.error('[MapEditor] Error updating tiles:', error);
                        updateTilesBtn.textContent = '❌ Fehler';
                        updateTilesBtn.style.backgroundColor = '#f44336';
                        
                        setTimeout(() => {
                            updateTilesBtn.textContent = '🔄 Tiles aktualisieren';
                            updateTilesBtn.style.backgroundColor = '';
                            updateTilesBtn.disabled = false;
                        }, 2000);
                    }
                } else {
                    console.error('[MapEditor] updateAllTilesWithSelectedTile Funktion nicht verfügbar');
                    updateTilesBtn.textContent = '❌ Fehler';
                    updateTilesBtn.style.backgroundColor = '#f44336';
                    setTimeout(() => {
                        updateTilesBtn.textContent = '🔄 Tiles aktualisieren';
                        updateTilesBtn.style.backgroundColor = '';
                    }, 2000);
                }
            });
        }
    }

    // Tastatur-Shortcuts für Pinselgrößen und Löschen
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Nur wenn keine Eingabefelder fokussiert sind
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case '1':
                    this.toolsModule.selectBrushSize(0);
                    ToastManager.showToast('Pinselgröße: 1 Tile', 'info');
                    break;
                case '2':
                    this.toolsModule.selectBrushSize(1);
                    ToastManager.showToast('Pinselgröße: 7 Tiles', 'info');
                    break;
                case '3':
                    this.toolsModule.selectBrushSize(2);
                    ToastManager.showToast('Pinselgröße: 19 Tiles', 'info');
                    break;
                case '4':
                    this.toolsModule.selectBrushSize(3);
                    ToastManager.showToast('Pinselgröße: 37 Tiles', 'info');
                    break;
                case 'Delete':
                case 'Backspace':
                    this.deleteSelectedTile();
                    break;
                case 'd':
                case 'D':
                    this.toggleDeleteMode();
                    break;
            }
        });
    }
    
    // Löschfunktion für ausgewählte Tiles
    deleteSelectedTile() {
        if (!this.core || !this.core.tileMapper) {
            console.warn('[MapEditor] Core or TileMapper not available for deletion');
            return;
        }
        
        // Prüfe ob ein Tile ausgewählt ist
        const selectedTile = this.core.getSelectedTile();
        if (!selectedTile) {
            ToastManager.showToast('Kein Tile ausgewählt zum Löschen', 'warning');
            return;
        }
        
        // Frage nach Bestätigung
        if (confirm('Möchtest du das ausgewählte Tile wirklich löschen?')) {
            // Lösche das Tile aus der aktuellen Ebene
            const currentLayer = this.core.getCurrentLayer();
            const success = this.core.tileMapper.removeTileFromHexagon(
                selectedTile.x, 
                selectedTile.y
            );
            
            if (success) {
                // Aktualisiere die Anzeige
                this.renderer.render();
                this.updateLayerInfo();
                
                // Zeige Erfolgsmeldung
                ToastManager.showToast('Tile erfolgreich gelöscht', 'success');
                
                // Benachrichtige Observer
                this.core.notifyObservers('tileDeleted', { 
                    x: selectedTile.x, 
                    y: selectedTile.y,
                    layer: currentLayer 
                });
            } else {
                ToastManager.showToast('Fehler beim Löschen des Tiles', 'error');
            }
        }
    }
    
    // Lösch-Modus umschalten
    toggleDeleteMode() {
        if (!this.core) {
            console.warn('[MapEditor] Core not available for delete mode');
            return;
        }
        
        const isDeleteMode = this.core.settings.currentMode === 'delete';
        
        if (isDeleteMode) {
            // Zurück zum normalen Modus
            this.core.settings.currentMode = 'normal';
            ToastManager.showToast('Lösch-Modus deaktiviert', 'info');
        } else {
            // Aktiviere Lösch-Modus
            this.core.settings.currentMode = 'delete';
            ToastManager.showToast('Lösch-Modus aktiviert - Klicke auf Tiles zum Löschen', 'warning');
        }
        
        // Aktualisiere UI
        this.updateDeleteModeUI();
    }
    
    // UI für Lösch-Modus aktualisieren
    updateDeleteModeUI() {
        const isDeleteMode = this.core.settings.currentMode === 'delete';
        
        // Aktualisiere Cursor
        const canvas = document.getElementById('map-canvas');
        if (canvas) {
            if (isDeleteMode) {
                canvas.style.cursor = 'crosshair';
            } else {
                canvas.style.cursor = 'default';
            }
        }
        
        // Aktualisiere Toolbar-Button falls vorhanden
        const deleteModeBtn = document.getElementById('delete-mode-btn');
        if (deleteModeBtn) {
            if (isDeleteMode) {
                deleteModeBtn.classList.add('active');
                deleteModeBtn.textContent = '❌ Lösch-Modus';
            } else {
                deleteModeBtn.classList.remove('active');
                deleteModeBtn.textContent = '🗑️ Lösch-Modus';
            }
        }
    }
    
    // Löschfunktion für alle Ebenen
    clearAllLayers() {
        try {
            console.log('[MapEditor] Clearing all layers...');
            
            // Lösche alle Ebenen
            const layers = ['terrain', 'streets'];
            let totalDeleted = 0;
            
            for (const layer of layers) {
                const success = this.core.clearLayer(layer);
                if (success) {
                    totalDeleted++;
                    console.log(`[MapEditor] Layer "${layer}" cleared`);
                }
            }
            
            // Aktualisiere die Anzeige
            this.renderer.render();
            this.updateLayerInfo();
            
            // Zeige Erfolgsmeldung
            ToastManager.showToast(`Alle ${totalDeleted} Ebenen erfolgreich gelöscht`, 'success');
            
            // Benachrichtige Observer
            this.core.notifyObservers('allLayersCleared', { 
                layers: layers,
                totalDeleted: totalDeleted
            });
            
            console.log('[MapEditor] All layers cleared successfully');
            
        } catch (error) {
            console.error('[MapEditor] Error clearing all layers:', error);
            ToastManager.showToast('Fehler beim Löschen aller Ebenen', 'error');
        }
    }
    
    // Löschfunktion für alle Tiles der aktuellen Ebene
    clearCurrentLayer() {
        const currentLayer = this.core.getCurrentLayer();
        
        // Frage nach Bestätigung
        if (confirm(`Möchtest du alle Tiles der Ebene "${currentLayer}" wirklich löschen?`)) {
            try {
                // Lösche alle Tiles der aktuellen Ebene
                const success = this.core.clearLayer(currentLayer);
                
                if (success) {
                    // Aktualisiere die Anzeige
                    this.renderer.render();
                    this.updateLayerInfo();
                    
                    // Zeige Erfolgsmeldung
                    ToastManager.showToast(`Alle Tiles der Ebene "${currentLayer}" gelöscht`, 'success');
                    
                    // Benachrichtige Observer
                    this.core.notifyObservers('layerCleared', { 
                        layer: currentLayer 
                    });
                } else {
                    ToastManager.showToast('Fehler beim Löschen der Ebene', 'error');
                }
            } catch (error) {
                console.error('[MapEditor] Error clearing layer:', error);
                ToastManager.showToast('Fehler beim Löschen der Ebene', 'error');
            }
        }
    }
    
    updateLayerInfo() {
        const currentLayer = this.core.getCurrentLayer();
        const allLayers = this.core.getAllLayers();
        
        // Zeige Informationen über die aktuelle Ebene an
        const layerTiles = allLayers[currentLayer];
        const tileCount = layerTiles ? layerTiles.size : 0;
        
        console.log(`[MapEditor] Current layer: ${currentLayer}, Tiles: ${tileCount}`);
        
        // Aktualisiere Tab-Labels mit Tile-Anzahl
        this.updateLayerTabs();
    }
    


    updateLayerTabs() {
        const currentLayer = this.core.getCurrentLayer();
        const allLayers = this.core.getAllLayers();
        
        const layerTabs = document.querySelectorAll('.layer-tab');
        layerTabs.forEach(tab => {
            const layerName = tab.dataset.layer;
            const layerTiles = allLayers[layerName];
            const tileCount = layerTiles ? layerTiles.size : 0;
            
            // Entferne active-Klasse von allen Tabs
            tab.classList.remove('active');
            
            // Füge active-Klasse zum aktuellen Tab hinzu
            if (layerName === currentLayer) {
                tab.classList.add('active');
            }
            
            // Aktualisiere den Text mit Tile-Anzahl
            const displayName = this.getLayerDisplayName(layerName);
            tab.textContent = `${this.getLayerIcon(layerName)} ${displayName} (${tileCount})`;
        });
    }
    
    getLayerIcon(layerName) {
        const icons = {
            terrain: '🌍',
            streets: '🛣️'
        };
        return icons[layerName] || '📄';
    }
    
    getLayerDisplayName(layerName) {
        const displayNames = {
            terrain: 'Terrain',
            streets: 'Straßen&Siedlungen'
        };
        return displayNames[layerName] || layerName;
    }
    
    exportMap() {
        try {
            const mapData = this.core.exportMap();
            const dataStr = JSON.stringify(mapData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `hexmap_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            link.click();
            
            console.log('[MapEditor] Map erfolgreich exportiert');
        } catch (error) {
            console.error('[MapEditor] Fehler beim Exportieren der Map:', error);
            alert('Fehler beim Exportieren der Map: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Warte bis alle benötigten Funktionen verfügbar sind
    const waitForFunctions = () => {
        if (typeof hexToPixel === 'undefined' || typeof getHexPoints === 'undefined') {
            // console.log('[MapEditor] Waiting for geometry functions...');
            setTimeout(waitForFunctions, 100);
            return;
        }
        
        // console.log('[MapEditor] All functions available, initializing...');
        
        // Erstelle Core und Canvas
        const core = new MapCore();
        const canvas = document.getElementById('map-canvas');
        
        // Erstelle MapEditor und initialisiere Komponenten
        const mapEditor = new MapEditor(canvas, core);
        mapEditor.initializeComponents();
        
        // Mache HexMap Editor global verfügbar
        window.hexMapEditor = mapEditor;
        
        // Globale Funktion um Biome-Optionen zu aktualisieren
        window.updateHexMapBiomeOptions = () => {
            if (mapEditor && mapEditor.ui) {
                mapEditor.ui.updateHexMapBiomeOptions();
            }
        };
        
        // Entfernt: Keine Abhängigkeit mehr vom TileEditor
        // Der HexMap Editor lädt Biome und Tiles direkt aus den Dateien
        
        // Initialisiere BiomeTileSelector falls noch nicht geschehen
        setTimeout(() => {
            if (!window.biomeTileSelector && typeof BiomeTileSelector !== 'undefined') {
                // console.log('[MapEditor] Final BiomeTileSelector initialization...');
                window.biomeTileSelector = new BiomeTileSelector(core);
            }
        }, 2000);
    };
    
    // Starte die Überprüfung
    waitForFunctions();
});
