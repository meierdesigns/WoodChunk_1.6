"use strict";

/**
 * HexMapEditor Debug System
 * Umfassende Debug-Funktionen für den HexMapEditor
 */

class HexMapEditorDebugger {
    constructor() {
        this.debugMode = false;
        this.logHistory = [];
        this.maxLogEntries = 100;
    }

    // Haupt-Debug-Funktion
    runFullDebug() {
        console.log('🔍 === HEXMAPEDITOR VOLLSTÄNDIGE DEBUG-ANALYSE ===');
        
        this.logHistory = [];
        this.addLog('🚀 Starte vollständige Debug-Analyse...');
        
        // 1. Grundlegende Verfügbarkeit
        this.debugBasicAvailability();
        
        // 2. Core-System
        this.debugCoreSystem();
        
        // 3. Renderer-System
        this.debugRendererSystem();
        
        // 4. UI-System
        this.debugUISystem();
        
        // 5. Biome-System
        this.debugBiomeSystem();
        
        // 6. Tile-System
        this.debugTileSystem();
        
        // 7. Performance
        this.debugPerformance();
        
        // 8. Fehler-Analyse
        this.debugErrors();
        
        this.addLog('✅ Debug-Analyse abgeschlossen');
        this.printLogHistory();
        
        console.log('🔍 === ENDE HEXMAPEDITOR DEBUG-ANALYSE ===');
    }

    // Debug Grundlegende Verfügbarkeit
    debugBasicAvailability() {
        this.addLog('📦 Prüfe grundlegende Verfügbarkeit...');
        
        const modules = {
            'MapCore': typeof window.MapCore !== 'undefined',
            'MapRenderer': typeof window.MapRenderer !== 'undefined',
            'MapSettings': typeof window.MapSettings !== 'undefined',
            'HexPosition': typeof window.HexPosition !== 'undefined',
            'HexTile': typeof window.HexTile !== 'undefined',
            'TileTypes': typeof window.TileTypes !== 'undefined'
        };

        Object.entries(modules).forEach(([name, available]) => {
            this.addLog(`${name}: ${available ? '✅ Verfügbar' : '❌ Fehlt'}`);
        });

        // Prüfe globale Variablen
        const globals = {
            'hexMapEditor': typeof window.hexMapEditor !== 'undefined',
            'settingsModule': typeof window.settingsModule !== 'undefined',
            'toolsModule': typeof window.toolsModule !== 'undefined',
            'biomeModule': typeof window.biomeModule !== 'undefined',
            'mapsModule': typeof window.mapsModule !== 'undefined'
        };

        Object.entries(globals).forEach(([name, available]) => {
            this.addLog(`${name}: ${available ? '✅ Verfügbar' : '❌ Fehlt'}`);
        });
    }

    // Debug Core-System
    debugCoreSystem() {
        this.addLog('🔧 Prüfe Core-System...');
        
        if (!window.hexMapEditor || !window.hexMapEditor.core) {
            this.addLog('❌ Core nicht verfügbar');
            return;
        }

        const core = window.hexMapEditor.core;
        
        // Prüfe Core-Eigenschaften
        const coreProperties = {
            'settings': !!core.settings,
            'tiles': !!core.tiles,
            'layers': !!core.layers,
            'observers': !!core.observers,
            'currentLayer': core.currentLayer || 'undefined'
        };

        Object.entries(coreProperties).forEach(([name, available]) => {
            this.addLog(`  ${name}: ${available ? '✅' : '❌'}`);
        });

        // Prüfe Core-Funktionen
        const coreFunctions = [
            'saveMap', 'loadMap', 'setTileAt', 'getTileAt', 'notifyObservers',
            'addObserver', 'removeObserver', 'getCurrentLayer', 'setCurrentLayer'
        ];

        coreFunctions.forEach(funcName => {
            const available = typeof core[funcName] === 'function';
            this.addLog(`  ${funcName}(): ${available ? '✅' : '❌'}`);
        });

        // Prüfe Settings
        if (core.settings) {
            this.addLog('  Settings:');
            this.addLog(`    hexSize: ${core.settings.hexSize}`);
            this.addLog(`    zoom: ${core.settings.zoom}`);
            this.addLog(`    brushSize: ${core.settings.brushSize}`);
            this.addLog(`    buildingScale: ${core.settings.buildingScale}`);
            this.addLog(`    buildingTransparency: ${core.settings.buildingTransparency}`);
        }

        // Prüfe Tiles
        if (core.tiles) {
            this.addLog(`  Tiles: ${core.tiles.size} Tiles geladen`);
        }

        // Prüfe Layers
        if (core.layers) {
            Object.keys(core.layers).forEach(layerName => {
                const layerSize = core.layers[layerName] ? core.layers[layerName].size : 0;
                this.addLog(`    ${layerName}: ${layerSize} Tiles`);
            });
        }
    }

    // Debug Renderer-System
    debugRendererSystem() {
        this.addLog('🎨 Prüfe Renderer-System...');
        
        if (!window.hexMapEditor || !window.hexMapEditor.renderer) {
            this.addLog('❌ Renderer nicht verfügbar');
            return;
        }

        const renderer = window.hexMapEditor.renderer;
        
        // Prüfe Canvas
        if (renderer.canvas) {
            this.addLog(`  Canvas: ${renderer.canvas.width}x${renderer.canvas.height}`);
        } else {
            this.addLog('❌ Canvas nicht verfügbar');
        }

        // Prüfe Caches
        const caches = {
            'biomeTileCache': renderer.biomeTileCache ? renderer.biomeTileCache.size : 0,
            'preloadedImages': renderer.preloadedImages ? renderer.preloadedImages.size : 0,
            'imagePromiseCache': renderer.imagePromiseCache ? renderer.imagePromiseCache.size : 0,
            'transparencyCache': renderer.transparencyCache ? renderer.transparencyCache.size : 0
        };

        Object.entries(caches).forEach(([name, size]) => {
            this.addLog(`  ${name}: ${size} Einträge`);
        });

        // Prüfe Renderer-Funktionen
        const rendererFunctions = [
            'render', 'renderThrottled', 'renderCachedTiles', 'renderTileOptimized',
            'preloadImage', 'clearCache', 'correctImagePath'
        ];

        rendererFunctions.forEach(funcName => {
            const available = typeof renderer[funcName] === 'function';
            this.addLog(`  ${funcName}(): ${available ? '✅' : '❌'}`);
        });
    }

    // Debug UI-System
    debugUISystem() {
        this.addLog('🖥️ Prüfe UI-System...');
        
        // Prüfe DOM-Elemente
        const domElements = {
            'canvas': 'canvas',
            'sidebar': '.sidebar',
            'settings-content': '#settings-content',
            'tools-content': '#tools-content',
            'biome-menu': '#biome-menu',
            'maps-content': '#maps-content',
            'brush-size-controls': '#brush-size-controls'
        };

        Object.entries(domElements).forEach(([name, selector]) => {
            const element = document.querySelector(selector);
            this.addLog(`  ${name}: ${element ? '✅ Gefunden' : '❌ Fehlt'}`);
        });

        // Prüfe UI-Module
        const uiModules = {
            'settingsModule': window.settingsModule,
            'toolsModule': window.toolsModule,
            'biomeModule': window.biomeModule,
            'mapsModule': window.mapsModule
        };

        Object.entries(uiModules).forEach(([name, module]) => {
            this.addLog(`  ${name}: ${module ? '✅ Verfügbar' : '❌ Fehlt'}`);
        });
    }

    // Debug Biome-System
    debugBiomeSystem() {
        this.addLog('🌍 Prüfe Biome-System...');
        
        // Prüfe Biome-Daten
        const biomeData = {
            'BIOME_DATA': window.BIOME_DATA,
            'buildingsTilesList': window.buildingsTilesList,
            'forestTilesList': window.forestTilesList,
            'mountainsTilesList': window.mountainsTilesList,
            'waterTilesList': window.waterTilesList,
            'plainTilesList': window.plainTilesList
        };

        Object.entries(biomeData).forEach(([name, data]) => {
            const available = data && Array.isArray(data);
            const count = available ? data.length : 0;
            this.addLog(`  ${name}: ${available ? `✅ ${count} Tiles` : '❌ Fehlt'}`);
        });

        // Prüfe Biome-Module
        const biomeModules = {
            'BiomeData': typeof window.BiomeData !== 'undefined',
            'BiomeUI': typeof window.BiomeUI !== 'undefined',
            'BiomeTileSelector': typeof window.BiomeTileSelector !== 'undefined'
        };

        Object.entries(biomeModules).forEach(([name, available]) => {
            this.addLog(`  ${name}: ${available ? '✅ Verfügbar' : '❌ Fehlt'}`);
        });
    }

    // Debug Tile-System
    debugTileSystem() {
        this.addLog('🧩 Prüfe Tile-System...');
        
        if (!window.hexMapEditor || !window.hexMapEditor.core) {
            this.addLog('❌ Core nicht verfügbar für Tile-Debug');
            return;
        }

        const core = window.hexMapEditor.core;
        
        // Prüfe Tile-Typen
        if (window.TileTypes) {
            this.addLog('  TileTypes verfügbar:');
            Object.keys(window.TileTypes).forEach(type => {
                this.addLog(`    ${type}: ${window.TileTypes[type]}`);
            });
        } else {
            this.addLog('❌ TileTypes nicht verfügbar');
        }

        // Prüfe Tile-Farben
        if (core.getTileColor) {
            const testColors = ['grass', 'water', 'forest', 'mountain'];
            testColors.forEach(type => {
                try {
                    const color = core.getTileColor(type);
                    this.addLog(`    ${type}: ${color}`);
                } catch (error) {
                    this.addLog(`    ${type}: ❌ Fehler - ${error.message}`);
                }
            });
        }

        // Prüfe Tile-Positionen
        if (core.tiles && core.tiles.size > 0) {
            const sampleTiles = Array.from(core.tiles.entries()).slice(0, 5);
            this.addLog(`  Sample Tiles (${sampleTiles.length}):`);
            sampleTiles.forEach(([key, tile]) => {
                this.addLog(`    ${key}: ${tile.type} (${tile.position?.q}, ${tile.position?.r})`);
            });
        }
    }

    // Debug Performance
    debugPerformance() {
        this.addLog('⚡ Prüfe Performance...');
        
        // Prüfe Memory
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            this.addLog(`  Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`);
        }

        // Prüfe FPS (falls verfügbar)
        if (window.hexMapEditor && window.hexMapEditor.renderer) {
            const renderer = window.hexMapEditor.renderer;
            this.addLog(`  Render Throttle Delay: ${renderer.renderThrottleDelay || 'undefined'}ms`);
            this.addLog(`  Pan Throttle Delay: ${renderer.panThrottleDelay || 'undefined'}ms`);
        }

        // Prüfe Cache-Performance
        if (window.hexMapEditor && window.hexMapEditor.renderer) {
            const renderer = window.hexMapEditor.renderer;
            const cacheSizes = {
                'Biome Tile Cache': renderer.biomeTileCache ? renderer.biomeTileCache.size : 0,
                'Preloaded Images': renderer.preloadedImages ? renderer.preloadedImages.size : 0,
                'Image Promise Cache': renderer.imagePromiseCache ? renderer.imagePromiseCache.size : 0
            };

            Object.entries(cacheSizes).forEach(([name, size]) => {
                this.addLog(`  ${name}: ${size} Einträge`);
            });
        }
    }

    // Debug Fehler
    debugErrors() {
        this.addLog('🚨 Prüfe Fehler...');
        
        // Sammle alle Fehler aus der Konsole
        const errors = [];
        
        // Prüfe auf 404-Fehler
        if (window.performance && window.performance.getEntriesByType) {
            const resources = window.performance.getEntriesByType('resource');
            const failedResources = resources.filter(resource => 
                resource.initiatorType === 'img' && 
                (resource.responseStatus === 404 || resource.responseStatus === 0)
            );
            
            if (failedResources.length > 0) {
                this.addLog(`  ❌ ${failedResources.length} fehlgeschlagene Bild-Ladeversuche:`);
                failedResources.slice(0, 5).forEach(resource => {
                    this.addLog(`    ${resource.name}`);
                });
                if (failedResources.length > 5) {
                    this.addLog(`    ... und ${failedResources.length - 5} weitere`);
                }
            } else {
                this.addLog('  ✅ Keine fehlgeschlagenen Bild-Ladeversuche gefunden');
            }
        }

        // Prüfe auf JavaScript-Fehler
        if (window.onerror) {
            this.addLog('  ✅ Global error handler verfügbar');
        } else {
            this.addLog('  ⚠️ Kein global error handler gesetzt');
        }

        // Prüfe auf uncaught exceptions
        if (window.addEventListener) {
            window.addEventListener('error', (event) => {
                this.addLog(`  🚨 JavaScript Error: ${event.message} in ${event.filename}:${event.lineno}`);
            });
        }
    }

    // Hilfsfunktionen
    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logHistory.push(logEntry);
        
        // Begrenze Log-Historie
        if (this.logHistory.length > this.maxLogEntries) {
            this.logHistory.shift();
        }
        
        console.log(logEntry);
    }

    printLogHistory() {
        console.log('📋 === DEBUG LOG HISTORIE ===');
        this.logHistory.forEach(entry => {
            console.log(entry);
        });
        console.log('📋 === ENDE LOG HISTORIE ===');
    }

    // Spezielle Debug-Funktionen
    debugImageLoading() {
        this.addLog('🖼️ Debug Image Loading...');
        
        if (!window.hexMapEditor || !window.hexMapEditor.renderer) {
            this.addLog('❌ Renderer nicht verfügbar');
            return;
        }

        const renderer = window.hexMapEditor.renderer;
        
        // Teste Bild-Pfad-Korrektur
        const testPaths = ['grass', 'mountain', 'water', 'forest', 'temple1.png'];
        testPaths.forEach(path => {
            try {
                const corrected = renderer.correctImagePath(path);
                this.addLog(`  ${path} -> ${corrected}`);
            } catch (error) {
                this.addLog(`  ❌ ${path}: ${error.message}`);
            }
        });

        // Teste Bild-Loading
        if (renderer.preloadImage) {
            this.addLog('  Teste Bild-Preloading...');
            testPaths.forEach(async (path) => {
                try {
                    await renderer.preloadImage(path);
                    this.addLog(`  ✅ ${path}: Erfolgreich geladen`);
                } catch (error) {
                    this.addLog(`  ❌ ${path}: ${error.message}`);
                }
            });
        }
    }

    debugTileRendering() {
        this.addLog('🎨 Debug Tile Rendering...');
        
        if (!window.hexMapEditor || !window.hexMapEditor.renderer) {
            this.addLog('❌ Renderer nicht verfügbar');
            return;
        }

        const renderer = window.hexMapEditor.renderer;
        const core = window.hexMapEditor.core;
        
        if (core.tiles && core.tiles.size > 0) {
            const sampleTile = Array.from(core.tiles.values())[0];
            this.addLog(`  Sample Tile: ${sampleTile.type} at (${sampleTile.position.q}, ${sampleTile.position.r})`);
            
            // Teste Rendering
            if (renderer.renderTileOptimized) {
                try {
                    renderer.renderTileOptimized(sampleTile, sampleTile.position.q, sampleTile.position.r);
                    this.addLog('  ✅ Tile-Rendering erfolgreich');
                } catch (error) {
                    this.addLog(`  ❌ Tile-Rendering fehlgeschlagen: ${error.message}`);
                }
            }
        } else {
            this.addLog('  ⚠️ Keine Tiles zum Testen verfügbar');
        }
    }

    // Export-Funktionen
    exportDebugReport() {
        const report = {
            timestamp: new Date().toISOString(),
            logHistory: this.logHistory,
            systemInfo: {
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                windowSize: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hexmapeditor-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addLog('📄 Debug-Report exportiert');
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.HexMapEditorDebugger = HexMapEditorDebugger;
    
    // Erstelle globale Debug-Instanz
    window.hexMapDebugger = new HexMapEditorDebugger();
    
    // Globale Debug-Funktionen
    window.debugHexMapEditor = () => {
        if (window.hexMapDebugger) {
            window.hexMapDebugger.runFullDebug();
        } else {
            console.error('HexMapEditor Debugger nicht verfügbar');
        }
    };
    
    window.debugImageLoading = () => {
        if (window.hexMapDebugger) {
            window.hexMapDebugger.debugImageLoading();
        }
    };
    
    window.debugTileRendering = () => {
        if (window.hexMapDebugger) {
            window.hexMapDebugger.debugTileRendering();
        }
    };
    
    window.exportDebugReport = () => {
        if (window.hexMapDebugger) {
            window.hexMapDebugger.exportDebugReport();
        }
    };
    
    // Automatische Debug-Ausführung nach 3 Sekunden
    setTimeout(() => {
        console.log('🔍 HexMapEditor Debugger geladen. Verwende debugHexMapEditor() für vollständige Analyse.');
    }, 3000);
}
