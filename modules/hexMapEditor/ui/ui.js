// Entferne ES6-Imports und verwende globale Klassen
// import { SettingsModule } from './modules/SettingsModule.js';
// import { ToolsModule } from './modules/ToolsModule.js';
// import { BiomeModule } from './modules/BiomeModule.js';
// import { MapsModule } from './modules/MapsModule.js';
// import { ToastManager } from './utils/ToastManager.js';

// UI-Modul für die Benutzeroberfläche
class UIManager {
    constructor(core, renderer) {
        this.core = core;
        this.renderer = renderer;
        this.surroundingChecker = null;
        
        // Initialisiere Module
        this.settingsModule = new SettingsModule(core);
        this.toolsModule = new ToolsModule(core);
        this.biomeModule = new BiomeModule(core);
        this.mapsModule = new MapsModule(core);
        
        // Make modules globally available
        window.settingsModule = this.settingsModule;
        window.mapsModule = this.mapsModule;
        window.toolsModule = this.toolsModule;
        window.biomeModule = this.biomeModule;
        
        // Überprüfe Core-Initialisierung
        if (!this.core) {
            console.error('[UIManager] Core is not initialized!');
            return;
        }
        
        this.setupUI();
        this.setupEventListeners();
        
        // Höre auf Core-Events
        this.core.addObserver(this);
        
        // console.log('[UIManager] Initialized with core:', !!this.core);
    }
    
    setupUI() {
        // console.log('[UIManager] Setting up UI modules...');
        
        try {
            this.settingsModule.setupSettingsModule();
            // console.log('[UIManager] SettingsModule setup complete');
        } catch (error) {
            console.error('[UIManager] Error setting up SettingsModule:', error);
        }
        
        try {
            this.toolsModule.setupToolsModule();
            // console.log('[UIManager] ToolsModule setup complete');
        } catch (error) {
            console.error('[UIManager] Error setting up ToolsModule:', error);
        }
        
        try {
            this.biomeModule.setupBiomeModule();
            // console.log('[UIManager] BiomeModule setup complete');
        } catch (error) {
            console.error('[UIManager] Error setting up BiomeModule:', error);
        }
        
        try {
            this.mapsModule.setupMapsModule();
            // console.log('[UIManager] MapsModule setup complete');
        } catch (error) {
            console.error('[UIManager] Error setting up MapsModule:', error);
        }
        
        this.setupLayersModule();
        this.setupToolbar();
        
        // Initialisiere Map-Status
        this.initializeMapStatus();
        
        // console.log('[UIManager] All UI modules setup complete');
    }
    
    // Initialisiere Map-Status
    initializeMapStatus() {
        // Warte bis der Core vollständig initialisiert ist
        this.waitForCoreFunctions();
    }
    
    // Warte auf Core-Funktionen
    waitForCoreFunctions() {
        const maxAttempts = 10;
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (this.core && this.core.tiles && this.core.settings) {
                // Prüfe ob alle benötigten Funktionen verfügbar sind
                const requiredFunctions = ['saveMap', 'clearMap'];
                const allAvailable = requiredFunctions.every(func => 
                    this.core[func] && typeof this.core[func] === 'function'
                );
                
                if (allAvailable) {
                    clearInterval(checkInterval);
                    // console.log('[UIManager] All core functions available after', attempts, 'attempts');
                    
                    // Initialisiere Map-Status
                    const hasMap = this.core.tiles.size > 0;
                    this.updateMapStatus(hasMap, this.core.tiles.size, hasMap ? 'Bereits geladen' : 'Keine Map vorhanden');
                    
                    ToastManager.showToast('Alle Core-Funktionen verfügbar!', 'success');
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('[UIManager] Core functions not available after', maxAttempts, 'attempts');
                    ToastManager.showToast('Core-Funktionen nicht verfügbar. Bitte Seite neu laden.', 'error');
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('[UIManager] Core not fully initialized after', maxAttempts, 'attempts');
                ToastManager.showToast('Core nicht vollständig initialisiert. Bitte Seite neu laden.', 'error');
            }
        }, 500); // Prüfe alle 500ms
    }
    
    // Überprüfe verfügbare Core-Funktionen
    checkCoreFunctions() {
        const functions = ['saveMap', 'clearMap'];
        const missing = functions.filter(func => !this.core[func] || typeof this.core[func] !== 'function');
        
        if (missing.length > 0) {
            console.warn('[UIManager] Missing core functions:', missing);
            ToastManager.showToast(`Fehlende Core-Funktionen: ${missing.join(', ')}`, 'warning');
            
            // Versuche es nur noch einmal nach einer weiteren Verzögerung
            // Core-Funktionen fehlen
            console.error('[UIManager] Core functions missing. Core may not be fully initialized.');
        } else {
            // console.log('[UIManager] All core functions available');
            ToastManager.showToast('Alle Core-Funktionen verfügbar!', 'success');
        }
    }

    setupEventListeners() {
        // Event Listener für UI-spezifische Interaktionen
    }
    
    setupLayersModule() {
        console.log('[UIManager] Setup layers module');
        
        // Layer-Tabs Event-Listener
        const layerTabs = document.querySelectorAll('.layer-tab');
        layerTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const layerName = e.target.dataset.layer;
                if (layerName && this.core) {
                    // Entferne active von allen Tabs
                    layerTabs.forEach(t => t.classList.remove('active'));
                    // Füge active zum geklickten Tab hinzu
                    e.target.classList.add('active');
                    
                    // Wechsle Layer im Core
                    this.core.setCurrentLayer(layerName);
                    
                    // Aktualisiere Biome-Liste für den neuen Layer
                    console.log('[UIManager] Updating biome list for layer:', layerName);
                    
                    // Versuche zuerst das neue BiomeTileSelector zu verwenden
                    if (window.biomeTileSelector) {
                        console.log('[UIManager] Using BiomeTileSelector for layer update');
                        window.biomeTileSelector.setCurrentLayer(layerName);
                    } else if (this.biomeUI) {
                        console.log('[UIManager] Using local biomeUI for layer update');
                        this.biomeUI.updateBiomeCategoriesList();
                    } else {
                        // Fallback: Suche nach BiomeUI global
                        setTimeout(() => {
                            if (window.biomeUI) {
                                console.log('[UIManager] Using global biomeUI');
                                window.biomeUI.updateBiomeCategoriesList();
                            } else {
                                console.warn('[UIManager] BiomeUI not available for layer update');
                            }
                        }, 100);
                    }
                    
                    console.log('[UIManager] Switched to layer:', layerName);
                    ToastManager.showToast(`Layer gewechselt: ${layerName}`, 'info');
                }
            });
        });
        
        console.log('[UIManager] Layer tabs setup complete');
    }

    setupToolbar() {
        console.log('[UIManager] Setup toolbar');
        
        // Toolbar Event-Listener
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        const clearBtn = document.getElementById('clear-btn');
        
        if (saveBtn && this.core) {
            saveBtn.addEventListener('click', () => {
                if (this.core.saveMap) {
                    this.core.saveMap();
                    ToastManager.showToast('Map gespeichert!', 'success');
                } else {
                    ToastManager.showToast('Speichern nicht verfügbar', 'error');
                }
            });
        }
        
        if (loadBtn && this.core) {
            loadBtn.addEventListener('click', () => {
                if (this.core.loadMap) {
                    this.core.loadMap();
                    ToastManager.showToast('Map geladen!', 'success');
                } else {
                    ToastManager.showToast('Laden nicht verfügbar', 'error');
                }
            });
        }
        
        if (clearBtn && this.core) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Möchtest du die gesamte Map löschen?')) {
                    if (this.core.clearMap) {
                        this.core.clearMap();
                        ToastManager.showToast('Map gelöscht!', 'warning');
                    } else {
                        ToastManager.showToast('Löschen nicht verfügbar', 'error');
                    }
                }
            });
        }
        
        console.log('[UIManager] Toolbar setup complete');
    }

    onEvent(event, data) {
        // console.log('[UIManager] Event:', event, data);
        
        switch (event) {
            case 'mapLoaded':
                console.log('[UIManager] Map loaded with', data.tilesCount, 'tiles');
                this.updateMapStatus(true, data.tilesCount, 'Map geladen');
                break;
            case 'mapReloaded':
                console.log('[UIManager] Map reloaded with', data.tilesCount, 'tiles');
                this.updateMapStatus(true, data.tilesCount, 'Map neu geladen');
                break;
            case 'mapSaved':
                // console.log('[UIManager] Map saved with', data.tilesCount, 'tiles');
                this.updateMapStatus(true, data.tilesCount, 'Map gespeichert');
                break;
            case 'mapForceSaved':
                console.log('[UIManager] Map force saved with', data.tilesCount, 'tiles');
                this.updateMapStatus(true, data.tilesCount, 'Map gespeichert');
                break;
            case 'mapCleared':
                console.log('[UIManager] Map cleared');
                this.updateMapStatus(false, 0, 'Map gelöscht');
                break;
            case 'tileAdded':
                console.log('[UIManager] Tile added at', data.q, data.r, 'type:', data.type);
                this.updateMapStatus(true, this.core.tiles.size, 'Tile hinzugefügt');
                break;
            case 'tileChanged':
                console.log('[UIManager] Tile changed at', data.q, data.r, 'type:', data.type);
                this.updateMapStatus(true, this.core.tiles.size, 'Tile geändert');
                break;
            case 'settingsChanged':
                console.log('[UIManager] Settings changed:', data);
                break;
            case 'mapChanged':
                console.log('[UIManager] Map changed');
                this.updateMapStatus(true, this.core.tiles.size, 'Map geändert');
                break;
        }
    }
    
    // Map Status aktualisieren
    updateMapStatus(hasMap, tilesCount, action = '') {
        const statusText = document.getElementById('map-status-text');
        const statusDetails = document.getElementById('map-status-details');
        
        if (statusText && statusDetails) {
            if (hasMap) {
                statusText.textContent = 'Map geladen';
                statusText.style.color = '#4CAF50';
                statusDetails.textContent = `${tilesCount} Tiles | ${action}`;
            } else {
                statusText.textContent = 'Keine Map geladen';
                statusText.style.color = '#f44336';
                statusDetails.textContent = action;
            }
        }
    }

    setSurroundingChecker(surroundingChecker) {
        this.surroundingChecker = surroundingChecker;
        console.log('[UIManager] SurroundingChecker set successfully');
    }
    
        // Hilfsfunktion um zu überprüfen, ob der Core verfügbar ist
    isCoreAvailable() {
        if (!this.core) {
            console.error('[UIManager] Core is not available');
            return false;
        }

        // Überprüfe ob der Core vollständig initialisiert ist
        if (!this.core.tiles || !this.core.settings) {
            console.warn('[UIManager] Core not fully initialized yet');
            return false;
        }

        return true;
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
