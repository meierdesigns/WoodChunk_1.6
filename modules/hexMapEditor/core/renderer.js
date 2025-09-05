// Renderer-Modul für die Canvas-Zeichnung
class MapRenderer {
    constructor(canvas, core) {
        // console.log('[renderer] Constructor called');
        // console.log('[renderer] Canvas:', canvas);
        // console.log('[renderer] Core:', core);
        
        this.canvas = canvas;
        
        // Make cache clearing function globally available
        window.clearMapRendererCache = () => {
            this.clearCache();
        };
        this.ctx = canvas.getContext('2d');
        this.core = core;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.hoveredHex = null;
        
        // Performance-Optimierungen
        this.renderThrottle = null;
        this.lastRenderTime = 0;
        this.renderThrottleDelay = 32; // ~30 FPS für bessere Performance
        this.panThrottleDelay = 16; // ~60 FPS für Panning

        this.pendingTiles = new Set(); // Für Batch-Updates
        this.lastPaintedPos = null; // Letzte gemalte Position
        this.lastHoveredHex = null; // Letzte Hover-Position für Änderungserkennung
        this.previewLine = null; // Vorschau der zu zeichnenden Linie
        
        // Initialisiere Caching-Systeme sofort
        this.biomeTileCache = new Map();
        this.imagePromiseCache = new Map(); // Cache für Image-Promises
        this.preloadedImages = new Set(); // Set der vorgeladenen Bilder
        this.loadingQueue = new Map(); // Queue für paralleles Laden
        this.transparencyCache = new Map(); // Cache für Transparenz-Erkennung
        this.scaledImageCache = new Map(); // Cache für skalierte Bilder
        
        this.setupCanvas();
        this.setupEventListeners();
        
        // Höre auf Core-Events
        this.core.addObserver(this);
    }

    // Hilfsfunktion für pixel-perfekte Koordinaten
    snapToPixel(x, y) {
        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    // Hilfsfunktion für pixel-perfekte Hexagon-Punkte
    snapHexPoints(pixelPos, points) {
        // Da pixelPos und points bereits pixel-perfekt sind, verwende sie direkt
        return points.map(point => ({
            x: pixelPos.x + point.x,
            y: pixelPos.y + point.y
        }));
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Pixel-perfekte Rendering-Einstellungen
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Deaktiviere Sub-Pixel-Rendering für scharfe Kanten
        this.ctx.textRenderingOptimization = 'optimizeSpeed';
        
        // Setze Canvas-Rendering-Kontext auf pixel-perfekte Darstellung
        this.ctx.imageSmoothingEnabled = false;
        
        // Aktiviere Pixel-Perfect-Rendering
        this.enablePixelPerfectRendering();
        
        // Preload häufig verwendete Biome-Tiles sofort
        this.preloadCommonTiles();
        
        // Debug: Zeige Cache-Status
        console.log('[renderer] Biome tile cache initialized with', this.biomeTileCache.size, 'entries');
    }
    
    // Aktiviere Pixel-Perfect-Rendering
    enablePixelPerfectRendering() {
        // Verschiebe um 0.5 Pixel für scharfe Linien
        this.ctx.translate(0.5, 0.5);
        
        // Deaktiviere Anti-Aliasing für scharfe Kanten
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Setze Linienbreite auf 1 Pixel für konsistente Ränder
        this.ctx.lineWidth = 1;
    }
    
    // Deaktiviere Pixel-Perfect-Rendering
    disablePixelPerfectRendering() {
        // Keine restore() hier, da das in render() gemacht wird
        // Nur die Pixel-Perfect-Einstellungen zurücksetzen
        this.ctx.translate(-0.5, -0.5);
    }
    
    // Hilfsfunktion für pixel-perfekte Canvas-Operationen
    pixelPerfectDrawImage(img, x, y, width, height) {
        // Runde alle Koordinaten auf ganze Pixel
        const drawX = Math.round(x);
        const drawY = Math.round(y);
        const drawWidth = Math.round(width);
        const drawHeight = Math.round(height);
        
        this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
    
    // Hilfsfunktion für pixel-perfekte Linien
    pixelPerfectLineTo(x, y) {
        this.ctx.lineTo(Math.round(x), Math.round(y));
    }
    
    // Hilfsfunktion für pixel-perfekte Bewegungen
    pixelPerfectMoveTo(x, y) {
        this.ctx.moveTo(Math.round(x), Math.round(y));
    }
    
    // Hilfsfunktion für pixel-perfekte Koordinaten
    snapToPixel(x, y) {
        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    resizeCanvas() {
        // Stelle sicher, dass die Canvas-Größe korrekt gesetzt wird
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        } else {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
        
        // Force re-render nach Größenänderung
        this.render();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        
        // Verhindere Kontextmenü bei rechter Maustaste
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseDown(e) {
        if (e.button === 0) { // Left click - Malen
            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.handleTileClick(e);
        } else if (e.button === 2) { // Right click - Pannen
            this.isPanning = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        // Performance-Optimierung: Berechne rect nur einmal
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.core.settings.offsetX) / this.core.settings.zoom;
        const y = (e.clientY - rect.top - this.core.settings.offsetY) / this.core.settings.zoom;
        const hexPos = this.pixelToHex(x, y);
        
        // Aktualisiere den Hover-Effekt (außer im Ursprung-Setz-Modus)
        if (this.core.selectedTileType !== 'ORIGIN_SETTER') {
            if (hexPos) {
                // Aktualisiere Hover-Position
                this.hoveredHex = { q: hexPos.q, r: hexPos.r };
            } else {
                // Kein Hexagon unter der Maus
                this.hoveredHex = null;
            }
        } else {
            // Im Ursprung-Setz-Modus: Hover-Effekt ausblenden
            this.hoveredHex = null;
        }
        
        // Hover-Effekt rendern (throttled für Performance)
        if (this.hoveredHex !== this.lastHoveredHex) {
            this.lastHoveredHex = this.hoveredHex;
            this.renderThrottled();
        }
        
        if (this.isDragging) {
            // Verwende bereits berechnete hexPos
            if (hexPos) {
                // Wenn wir im Linien-Modus sind, zeige Vorschau der Linie
                if (this.core.settings.currentMode === 'line' && this.core.lineStartPoint) {
                    // Aktualisiere die Vorschau der Linie
                    this.previewLine = { 
                        start: this.core.lineStartPoint, 
                        end: { q: hexPos.q, r: hexPos.r } 
                    };
                    this.renderThrottled();
                } else if (this.surroundingChecker && this.surroundingChecker.isActive) {
                    this.surroundingChecker.setSelectedTile(hexPos.q, hexPos.r);
                } else if (this.core.selectedTileType === 'ORIGIN_SETTER') {
                    // Ursprung setzen
                    this.core.setOrigin(hexPos.q, hexPos.r);
                    this.renderThrottled();
                } else {
                    // Nur malen, wenn sich die Position geändert hat
                    const currentPos = `${hexPos.q},${hexPos.r}`;
                    if (this.lastPaintedPos !== currentPos) {
                        // Verwende die neue Layer-basierte Methode
                        const currentLayer = this.core.getCurrentLayer();
                        
                        // Debug: Zeige das ausgewählte Tile
                                // console.log('[renderer] Painting with selectedTileType:', this.core.selectedTileType);
        // console.log('[renderer] Current selectedTile:', this.core.selectedTile ? this.core.selectedTile.name : 'none');
        // console.log('[renderer] Current selectedTile image:', this.core.selectedTile ? this.core.selectedTile.image : 'none');
        // console.log('[renderer] Painting at position:', hexPos.q, hexPos.r);
                        
                        // Stelle sicher, dass wir das korrekte selectedTileType verwenden
                        // Versuche das ausgewählte Tile aus dem BiomeTileSelector zu bekommen
                        let tileTypeToUse = this.core.selectedTileType;
                        let selectedTile = this.core.selectedTile;
                        
                        // Fallback: Versuche das ausgewählte Tile aus dem BiomeTileSelector zu bekommen
                        if (!selectedTile && window.biomeTileSelector && window.biomeTileSelector.selectedTile) {
                            selectedTile = window.biomeTileSelector.selectedTile;
                        }
                        
                        // Verwende das Bild des ausgewählten Tiles falls verfügbar
                        if (selectedTile && selectedTile.image) {
                            tileTypeToUse = selectedTile.image;
                        }
                        
                        // Debug: Prüfe ob das selectedTileType von der Position abhängt
                                // console.log('[renderer] Debug - selectedTileType should NOT depend on position:', hexPos.q, hexPos.r);
        // console.log('[renderer] Debug - selectedTileType before painting:', this.core.selectedTileType);
        // console.log('[renderer] Debug - settings.selectedTileType before painting:', this.core.settings.selectedTileType);
                        
                        if (currentLayer === 'streets') {
                            // Im Streets-Layer: Nur Gebäude platzieren
                            const tileData = {
                                position: hexPos,
                                type: tileTypeToUse,
                                color: this.core.settings.selectedColor,
                                biomeName: this.core.getBiomeNameForLayer(currentLayer),
                                selectedTile: selectedTile // Verwende das gefundene selectedTile
                            };
                            this.core.setTileAt(hexPos.q, hexPos.r, tileData, 'streets');
                        } else {
                            // Im Terrain-Layer: Verwende applyBrushToArea für Pinselgröße
                            
                            // Prüfe ob es sich um Void handelt
                            if (tileTypeToUse === TileTypes.VOID || tileTypeToUse === 'void' || 
                                this.core.selectedTileType === TileTypes.VOID || this.core.selectedTileType === 'void') {
                                this.core.applyBrushToArea(hexPos.q, hexPos.r, TileTypes.VOID);
                            } else {
                                this.core.applyBrushToArea(hexPos.q, hexPos.r, tileTypeToUse);
                            }
                        }
                        
                        this.lastPaintedPos = currentPos;
                        // Rendering wird über Core-Events ausgelöst, nicht hier
                    }
                }
            }
            
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        } else if (this.isPanning) {
            // Rechte Maustaste - Karte verschieben
            const deltaX = e.clientX - this.lastMousePos.x;
            const deltaY = e.clientY - this.lastMousePos.y;
            
            this.core.settings.offsetX += deltaX;
            this.core.settings.offsetY += deltaY;
            
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            
            // Automatisch speichern beim Panning
            this.scheduleAutoSave();
            
            // Optimiertes Pan-Rendering für bessere Performance
            this.renderPanThrottled();
        }
    }

    onMouseUp(e) {
        // Wenn wir im Linien-Modus sind und eine Linie zeichnen, beende sie
        if (this.core.settings.currentMode === 'line' && this.core.lineStartPoint) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.core.settings.offsetX) / this.core.settings.zoom;
            const y = (e.clientY - rect.top - this.core.settings.offsetY) / this.core.settings.zoom;
            const hexPos = this.pixelToHex(x, y);
            
            if (hexPos) {
                this.core.finishLine(hexPos.q, hexPos.r);
            }
            
            // Vorschau zurücksetzen
            this.previewLine = null;
        }
        
        this.isDragging = false;
        this.isPanning = false;
        this.canvas.style.cursor = 'default';
    }

    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, this.core.settings.zoom * delta));
        
        if (newZoom !== this.core.settings.zoom) {
            // Berechne die Mausposition relativ zum Canvas
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Berechne den Zoom-Faktor
            const zoomFactor = newZoom / this.core.settings.zoom;
            
            // Passe den Offset so an, dass der Zoom von der Mausposition ausgeht
            this.core.settings.offsetX = mouseX - (mouseX - this.core.settings.offsetX) * zoomFactor;
            this.core.settings.offsetY = mouseY - (mouseY - this.core.settings.offsetY) * zoomFactor;
            
            this.core.settings.zoom = newZoom;
            
            // console.log('[renderer] Zoom changed to:', newZoom);
            
            // Benachrichtige SettingsModule über Zoom-Änderung
            if (window.settingsModule && typeof window.settingsModule.onZoomChanged === 'function') {
                window.settingsModule.onZoomChanged(newZoom);
            }
            
            // Automatisch speichern
            this.scheduleAutoSave();
            
            this.renderThrottled();
        }
    }

    handleTileClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.core.settings.offsetX) / this.core.settings.zoom;
        const y = (e.clientY - rect.top - this.core.settings.offsetY) / this.core.settings.zoom;
        
        // Convert pixel to hex coordinates
        const hexPos = this.pixelToHex(x, y);
        if (hexPos) {
            // Prüfe ob Lösch-Modus aktiv ist
            if (this.core.settings.currentMode === 'delete') {
                const currentLayer = this.core.getCurrentLayer();
                
                if (currentLayer === 'streets') {
                    // Im Streets-Layer: Lösche nur Gebäude, nicht Terrain
                    const buildingTile = this.core.getTileAt(hexPos.q, hexPos.r, 'streets');
                    if (buildingTile) {
                        // Lösche nur aus Streets-Ebene
                        this.core.layers.streets.delete(`${hexPos.q},${hexPos.r}`);
                        
                        // Aktualisiere die Anzeige
                        this.render();
                        
                        // Zeige Erfolgsmeldung
                        if (window.ToastManager) {
                            window.ToastManager.showToast('Gebäude gelöscht', 'success');
                        }
                        
                        // Benachrichtige Core
                        this.core.notifyObservers('tileDeleted', { 
                            x: hexPos.q, 
                            y: hexPos.r,
                            layer: 'streets' 
                        });
                        
                        if (this.core.settings.debugMode) {
                            // console.log('[renderer] Building deleted at', hexPos.q, hexPos.r, 'from streets layer');
                        }
                    } else {
                        if (window.ToastManager) {
                            window.ToastManager.showToast('Kein Gebäude an dieser Position', 'warning');
                        }
                    }
                } else {
                    // Im Terrain-Layer: Normales Löschen
                    const success = this.core.tileMapper.removeTileFromHexagon(hexPos.q, hexPos.r);
                    if (success) {
                        // Aktualisiere die Anzeige
                        this.render();
                        
                        // Zeige Erfolgsmeldung
                        if (window.ToastManager) {
                            window.ToastManager.showToast('Tile gelöscht', 'success');
                        }
                        
                        // Benachrichtige Core
                        this.core.notifyObservers('tileDeleted', { 
                            x: hexPos.q, 
                            y: hexPos.r,
                            layer: currentLayer 
                        });
                    } else {
                        if (window.ToastManager) {
                            window.ToastManager.showToast('Kein Tile an dieser Position', 'warning');
                        }
                    }
                }
                return;
            }
            
            // Wenn SurroundingChecker aktiv ist, setze das ausgewählte Feld
            if (this.surroundingChecker && this.surroundingChecker.isActive) {
                this.surroundingChecker.setSelectedTile(hexPos.q, hexPos.r);
            } else if (this.core.selectedTileType === 'ORIGIN_SETTER') {
                // Ursprung setzen
                this.core.setOrigin(hexPos.q, hexPos.r);
            } else {
                // Prüfe aktuellen Layer für spezielle Behandlung
                const currentLayer = this.core.getCurrentLayer();
                
                // Debug: Zeige das ausgewählte Tile beim Klicken
                        // console.log('[renderer] Clicking with selectedTileType:', this.core.selectedTileType);
        // console.log('[renderer] Current selectedTile:', this.core.selectedTile ? this.core.selectedTile.name : 'none');
        // console.log('[renderer] Current selectedTile image:', this.core.selectedTile ? this.core.selectedTile.image : 'none');
        // console.log('[renderer] Clicking at position:', hexPos.q, hexPos.r);
                
                // Stelle sicher, dass wir das korrekte selectedTileType verwenden
                const tileTypeToUse = this.core.selectedTileType;
                // console.log('[renderer] Using tileTypeToUse for click:', tileTypeToUse);
                
                if (currentLayer === 'streets') {
                    // Im Streets-Layer: Nur Gebäude platzieren, Terrain nicht verändern
                    const tileData = {
                        position: hexPos,
                        type: tileTypeToUse,
                        color: this.core.settings.selectedColor,
                        biomeName: this.core.getBiomeNameForLayer(currentLayer)
                    };
                    // Setze nur in Streets-Ebene, nicht in Terrain-Ebene
                    this.core.setTileAt(hexPos.q, hexPos.r, tileData, 'streets');
                    
                    // Debug: Zeige dass nur Building platziert wurde
                    if (this.core.settings.debugMode) {
                                // console.log('[renderer] Building placed at', hexPos.q, hexPos.r, 'in streets layer');
        // console.log('[renderer] Terrain at this position remains unchanged');
                    }
                } else {
                    // Im Terrain-Layer: Verwende applyBrushToArea für Pinselgröße
                    console.log('[renderer] Calling applyBrushToArea with tileTypeToUse:', tileTypeToUse);
                    this.core.applyBrushToArea(hexPos.q, hexPos.r, tileTypeToUse);
                }
            }
            // Rendering wird über Core-Events ausgelöst
        }
    }

    pixelToHex(x, y) {
        const { hexSize, horizontalSpacing, verticalSpacing } = this.core.settings;
        
        // Verwende nur die spezifischen Abstand-Parameter ohne hexSize
        const totalHorizontalSpacing = horizontalSpacing;
        const totalVerticalSpacing = verticalSpacing;
        
        // Zuerst prüfe existierende Tiles
        const tiles = this.core.getAllTiles();
        for (const tile of tiles) {
            const pixelPos = hexToPixel(tile.position, hexSize, totalHorizontalSpacing, totalVerticalSpacing, this.core.settings.layoutRotation);
            const distance = Math.sqrt((x - pixelPos.x) ** 2 + (y - pixelPos.y) ** 2);
            if (distance <= hexSize) {
                return tile.position;
            }
        }
        
        // Wenn kein existierendes Tile gefunden wurde, prüfe mögliche Nachbarpositionen
        // Generiere alle möglichen Hex-Positionen um existierende Tiles
        const possiblePositions = new Set();
        
        tiles.forEach(tile => {
            // Füge alle 6 Nachbarpositionen hinzu
            const neighbors = [
                { q: tile.position.q + 1, r: tile.position.r },
                { q: tile.position.q - 1, r: tile.position.r },
                { q: tile.position.q, r: tile.position.r + 1 },
                { q: tile.position.q, r: tile.position.r - 1 },
                { q: tile.position.q + 1, r: tile.position.r - 1 },
                { q: tile.position.q - 1, r: tile.position.r + 1 }
            ];
            
            neighbors.forEach(pos => {
                const key = `${pos.q},${pos.r}`;
                if (!this.core.tiles.has(key)) {
                    possiblePositions.add(key);
                }
            });
        });
        
        // Prüfe alle möglichen Nachbarpositionen
        for (const posKey of possiblePositions) {
            const [q, r] = posKey.split(',').map(Number);
            const pos = { q, r };
            const pixelPos = hexToPixel(pos, hexSize, totalHorizontalSpacing, totalVerticalSpacing, this.core.settings.layoutRotation);
            const distance = Math.sqrt((x - pixelPos.x) ** 2 + (y - pixelPos.y) ** 2);
            if (distance <= hexSize) {
                return pos;
            }
        }
        
        // Virtueller Grid ist IMMER aktiv für bessere Abdeckung
        // Verwende konsistente Abstandsberechnung mit der korrigierten pixelToHex Funktion
        const spacingX = hexSize * 1.5 + totalHorizontalSpacing;
        const spacingY = hexSize * Math.sqrt(3) + totalVerticalSpacing;
        
        // Generiere einen virtuellen Grid um den Mauszeiger
        const gridRadius = 12; // Größerer Radius für bessere Abdeckung im leeren Void
        
        // Verwende einen einfacheren Ansatz: Generiere alle möglichen Hex-Positionen
        // in einem größeren Bereich um den Mauszeiger
        for (let dq = -gridRadius; dq <= gridRadius; dq++) {
            for (let dr = -gridRadius; dr <= gridRadius; dr++) {
                // Berechne hexagonale Distanz
                const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                if (distance <= gridRadius) {
                    // Berechne die absolute Hex-Position - verwende die korrigierte pixelToHex Funktion
                    const testPos = pixelToHex(x, y, hexSize, totalHorizontalSpacing, totalVerticalSpacing, this.core.settings.layoutRotation);
                    if (testPos) {
                        const absQ = testPos.q + dq;
                        const absR = testPos.r + dr;
                        
                        // Erstelle eine HexPosition
                        const hexPos = new HexPosition(absQ, absR);
                        const pixelPos = hexToPixel(hexPos, hexSize, totalHorizontalSpacing, totalVerticalSpacing, this.core.settings.layoutRotation);
                        
                        // Prüfe, ob die Maus über diesem Hex ist - präzisere Erkennung
                        const mouseDistance = Math.sqrt((x - pixelPos.x) ** 2 + (y - pixelPos.y) ** 2);
                        if (mouseDistance <= hexSize * 0.8) { // Etwas größerer Erkennungsbereich
                            return hexPos;
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Hilfsmethode um Welt-Koordinaten zu Hex-Koordinaten zu konvertieren
    worldToHex(x, y) {
        const { hexSize, horizontalSpacing, verticalSpacing } = this.core.settings;
        
        // Verwende die korrigierte pixelToHex Funktion für konsistente Berechnung
        return pixelToHex(x, y, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations first
        this.ctx.save();
        this.ctx.translate(this.core.settings.offsetX, this.core.settings.offsetY);
        this.ctx.scale(this.core.settings.zoom, this.core.settings.zoom);
        
        // Aktiviere Pixel-Perfect-Rendering nach den Transformationen
        this.enablePixelPerfectRendering();
        
        // Verwende optimiertes Rendering mit gecachten Grafiken
        this.renderCachedTiles();
        
        // Debug: Zeige Transparenz-Einstellungen
        if (this.core.settings.debugMode) {
            const buildingAlpha = this.core.settings.buildingTransparency || 0.7;
                    // console.log('[renderer] Building transparency:', buildingAlpha);
        // console.log('[renderer] Use native transparency:', this.core.settings.useNativeTransparency);
        // console.log('[renderer] Current layer:', this.core.getCurrentLayer());
        // console.log('[renderer] Buildings visible:', this.core.getCurrentLayer() !== 'terrain');
        }
        
        // Render surrounding checker overlay
        if (this.surroundingChecker) {
            this.surroundingChecker.renderSurrounding(
                this.ctx, 
                this.core.settings.hexSize, 
                this.core.settings.horizontalSpacing, 
                this.core.settings.verticalSpacing
            );
        }
        
        // Render hover effect for brush preview
        if (this.hoveredHex) {
            this.renderBrushPreview(this.hoveredHex);
        }
        
        // Render line preview if in line mode
        if (this.previewLine) {
            this.renderLinePreview(this.previewLine);
        }
        
        // Deaktiviere Pixel-Perfect-Rendering und restore transformations
        this.disablePixelPerfectRendering();
        this.ctx.restore();
    }
    
    // Rendert eine spezifische Ebene
    renderLayer(layerName, alpha = 1.0) {
        const layerTiles = this.core.getLayerTiles(layerName);
        if (layerTiles && layerTiles.size > 0) {
            layerTiles.forEach(tile => {
                // Setze Transparenz für die gesamte Ebene
                this.ctx.globalAlpha = alpha;
                this.renderHex(tile);
            });
        }
        // Reset alpha
        this.ctx.globalAlpha = 1.0;
    }
    
    // Neue Methode: Rendert alle Tiles an einer Position (Terrain + Buildings)
    renderAllTilesAtPosition(x, y) {
        const currentLayer = this.core.getCurrentLayer();
        
        // 1. Rendere Terrain-Tile (falls vorhanden)
        const terrainTile = this.core.getTileAt(x, y, 'terrain');
        if (terrainTile && terrainTile.type !== 'void' && terrainTile.type !== TileTypes.VOID) {
            this.ctx.globalAlpha = 1.0; // Terrain immer vollständig sichtbar
            this.renderHex(terrainTile);
        }
        
        // 2. Rendere Building-Tile mit angepasster Transparenz je nach Layer
        const buildingTile = this.core.getTileAt(x, y, 'streets');
        if (buildingTile && buildingTile.type !== 'void' && buildingTile.type !== TileTypes.VOID) {
            if (currentLayer === 'terrain') {
                // Im Terrain-Layer: Gebäude mit Einstellungs-Transparenz
                this.ctx.globalAlpha = this.core.settings.buildingTransparency || 0.7;
            } else {
                // Im Streets-Layer: Gebäude mit voller Sichtbarkeit (100%)
                this.ctx.globalAlpha = 1.0;
            }
            this.renderHex(buildingTile);
        }
        
        // Reset alpha
        this.ctx.globalAlpha = 1.0;
    }
    
    // Neue Methode: Rendert alle Positionen mit beiden Ebenen
    renderAllPositions() {
        // Sammle alle Positionen aus beiden Ebenen
        const allPositions = new Set();
        
        // Sammle Positionen aus Terrain-Ebene
        const terrainTiles = this.core.getLayerTiles('terrain');
        if (terrainTiles) {
            terrainTiles.forEach((tile, key) => {
                // Ignoriere Void-Tiles
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                // Extrahiere Position aus dem Key oder Tile-Objekt
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else if (tile.q !== undefined && tile.r !== undefined) {
                    q = tile.q;
                    r = tile.r;
                } else {
                    console.warn('[renderer] Could not extract position from tile:', tile);
                    return;
                }
                allPositions.add(`${q},${r}`);
            });
        }
        
        // Sammle Positionen aus Streets-Ebene
        const streetsTiles = this.core.getLayerTiles('streets');
        if (streetsTiles) {
            streetsTiles.forEach((tile, key) => {
                // Ignoriere Void-Tiles
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                // Extrahiere Position aus dem Key oder Tile-Objekt
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else if (tile.q !== undefined && tile.r !== undefined) {
                    q = tile.q;
                    r = tile.r;
                } else {
                    console.warn('[renderer] Could not extract position from tile:', tile);
                    return;
                }
                allPositions.add(`${q},${r}`);
            });
        }
        
        // Rendere alle Positionen mit beiden Ebenen
        allPositions.forEach(positionKey => {
            const [q, r] = positionKey.split(',').map(Number);
            this.renderAllTilesAtPosition(q, r);
        });
        
        // Debug: Zeige Anzahl der gerenderten Positionen
        if (this.core.settings.debugMode) {
                    // console.log('[renderer] Rendered positions:', allPositions.size);
        // console.log('[renderer] Terrain tiles:', terrainTiles ? terrainTiles.size : 0);
        // console.log('[renderer] Streets tiles:', streetsTiles ? streetsTiles.size : 0);
        }
    }
    
    // Optimiertes Rendering mit Grafik-Caching
    renderFast() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.translate(this.core.settings.offsetX, this.core.settings.offsetY);
        this.ctx.scale(this.core.settings.zoom, this.core.settings.zoom);
        
        // Verwende gecachte Grafiken für bessere Performance
        this.renderCachedTiles();
        
        this.ctx.restore();
    }
    
    // Rendert Tiles mit gecachten Grafiken
    renderCachedTiles() {
        const { hexSize, horizontalSpacing, verticalSpacing } = this.core.settings;
        
        // Berechne sichtbaren Bereich
        const visibleLeft = -this.core.settings.offsetX / this.core.settings.zoom;
        const visibleTop = -this.core.settings.offsetY / this.core.settings.zoom;
        const visibleRight = visibleLeft + this.canvas.width / this.core.settings.zoom;
        const visibleBottom = visibleTop + this.canvas.height / this.core.settings.zoom;
        
        // Erweitere sichtbaren Bereich um Puffer
        const buffer = hexSize * 2;
        const extendedLeft = visibleLeft - buffer;
        const extendedTop = visibleTop - buffer;
        const extendedRight = visibleRight + buffer;
        const extendedBottom = visibleBottom + buffer;
        
        // Sammle alle Positionen aus beiden Ebenen
        const allPositions = new Set();
        
        // Sammle Positionen aus Terrain-Ebene
        const terrainTiles = this.core.getLayerTiles('terrain');
        if (terrainTiles) {
            terrainTiles.forEach((tile, key) => {
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else {
                    return;
                }
                
                // Prüfe ob Tile im sichtbaren Bereich ist
                const pixelPos = hexToPixel(new HexPosition(q, r), hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
                if (pixelPos.x >= extendedLeft && pixelPos.x <= extendedRight && 
                    pixelPos.y >= extendedTop && pixelPos.y <= extendedBottom) {
                    allPositions.add(`${q},${r}`);
                }
            });
        }
        
        // Sammle Positionen aus Streets-Ebene
        const streetsTiles = this.core.getLayerTiles('streets');
        if (streetsTiles) {
            streetsTiles.forEach((tile, key) => {
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else {
                    return;
                }
                
                // Prüfe ob Tile im sichtbaren Bereich ist
                const pixelPos = hexToPixel(new HexPosition(q, r), hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
                if (pixelPos.x >= extendedLeft && pixelPos.x <= extendedRight && 
                    pixelPos.y >= extendedTop && pixelPos.y <= extendedBottom) {
                    allPositions.add(`${q},${r}`);
                }
            });
        }
        
        // Rendere alle Positionen mit beiden Ebenen
        allPositions.forEach(posKey => {
            const [q, r] = posKey.split(',').map(Number);
            this.renderAllTilesAtPosition(q, r);
        });
    }
    
    // Optimiertes Tile-Rendering mit gecachten Grafiken
    renderTileOptimized(tile, q, r) {
        const { hexSize, horizontalSpacing, verticalSpacing, rotation } = this.core.settings;
        const hexPos = new HexPosition(q, r);
        const pixelPos = hexToPixel(hexPos, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
        const points = getHexPoints(hexSize, rotation);
        
        // Verwende gecachte Grafik wenn verfügbar
        const imageSrc = tile.image || tile.type;
        if (imageSrc) {
            console.log('[MapRenderer] Rendering tile:', tile.type, 'with image:', imageSrc);
            
            // Korrigiere den Bildpfad
            const correctedImagePath = this.correctImagePath(imageSrc);
            console.log('[MapRenderer] Corrected image path:', correctedImagePath);
            
            // Prüfe Cache mit korrigiertem Pfad
            if (this.biomeTileCache.has(correctedImagePath)) {
                const cachedImage = this.biomeTileCache.get(correctedImagePath);
                if (cachedImage && cachedImage.complete && cachedImage.naturalWidth > 0) {
                    console.log('[MapRenderer] Using cached image for:', correctedImagePath);
                    // Zeichne gecachtes Bild mit Hexagon-Clipping
                    this.ctx.save();
                    
                    // Erstelle Hexagon-Pfad für Clipping mit pixel-perfekten Koordinaten
                    this.ctx.beginPath();
                    this.pixelPerfectMoveTo(pixelPos.x + points[0].x, pixelPos.y + points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        this.pixelPerfectLineTo(pixelPos.x + points[i].x, pixelPos.y + points[i].y);
                    }
                    this.ctx.closePath();
                    this.ctx.clip();
                    
                    // Zeichne das Bild mit pixel-perfekten Koordinaten
                    this.ctx.translate(Math.round(pixelPos.x), Math.round(pixelPos.y));
                    this.ctx.rotate(rotation * Math.PI / 180);
                    
                    // Verwende pixel-perfekte Zeichnung mit korrekter Hexagon-Größe
                    const drawX = -hexSize;
                    const drawY = -hexSize * Math.sqrt(3) / 2;
                    const drawWidth = hexSize * 2;
                    const drawHeight = hexSize * Math.sqrt(3);
                    
                    this.pixelPerfectDrawImage(cachedImage, drawX, drawY, drawWidth, drawHeight);
                    
                    this.ctx.restore();
                    return;
                } else {
                    console.warn('[MapRenderer] Cached image not ready for:', correctedImagePath);
                }
            } else {
                console.log('[MapRenderer] Image not in cache, loading:', correctedImagePath);
            }
            
            // Sofortiges Laden und Rendern
            this.loadAndRenderImage(imageSrc, pixelPos, points, hexSize, rotation);
            return;
        }
        
        console.log('[MapRenderer] No image source, using fallback color for:', tile.type);
        // Fallback: Zeichne einfaches Hexagon mit Farbe und pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        this.ctx.beginPath();
        this.pixelPerfectMoveTo(snappedPoints[0].x, snappedPoints[0].y);
        for (let i = 1; i < snappedPoints.length; i++) {
            this.pixelPerfectLineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        this.ctx.closePath();
        
        const color = this.getTileColor(tile.type);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    // Einfache Farbzuordnung für schnelles Rendering
    getTileColor(tileType) {
        const colorMap = {
            'grass': '#4CAF50',
            'water': '#2196F3',
            'mountain': '#795548',
            'forest': '#388E3C',
            'desert': '#FF9800',
            'snow': '#FFFFFF',
            'void': '#000000'
        };
        return colorMap[tileType] || '#9E9E9E';
    }

    // Optimiertes Rendering: Nur sichtbare Tiles rendern
    renderVisibleTiles() {
        const { hexSize, horizontalSpacing, verticalSpacing } = this.core.settings;
        const canvasWidth = this.canvas.width / this.core.settings.zoom;
        const canvasHeight = this.canvas.height / this.core.settings.zoom;
        
        // Berechne sichtbaren Bereich
        const visibleLeft = -this.core.settings.offsetX / this.core.settings.zoom;
        const visibleTop = -this.core.settings.offsetY / this.core.settings.zoom;
        const visibleRight = visibleLeft + canvasWidth;
        const visibleBottom = visibleTop + canvasHeight;
        
        // Erweitere sichtbaren Bereich um einen Puffer
        const buffer = hexSize * 2;
        const extendedLeft = visibleLeft - buffer;
        const extendedTop = visibleTop - buffer;
        const extendedRight = visibleRight + buffer;
        const extendedBottom = visibleBottom + buffer;
        
        // Sammle nur sichtbare Positionen
        const visiblePositions = new Set();
        
        // Sammle Positionen aus Terrain-Ebene
        const terrainTiles = this.core.getLayerTiles('terrain');
        if (terrainTiles) {
            terrainTiles.forEach((tile, key) => {
                // Ignoriere Void-Tiles
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                // Extrahiere Position
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else if (tile.q !== undefined && tile.r !== undefined) {
                    q = tile.q;
                    r = tile.r;
                } else {
                    return;
                }
                
                // Prüfe ob Tile im sichtbaren Bereich ist
                const pixelPos = hexToPixel(new HexPosition(q, r), hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
                if (pixelPos.x >= extendedLeft && pixelPos.x <= extendedRight && 
                    pixelPos.y >= extendedTop && pixelPos.y <= extendedBottom) {
                    visiblePositions.add(`${q},${r}`);
                }
            });
        }
        
        // Sammle Positionen aus Streets-Ebene
        const streetsTiles = this.core.getLayerTiles('streets');
        if (streetsTiles) {
            streetsTiles.forEach((tile, key) => {
                // Ignoriere Void-Tiles
                if (tile.type === 'void' || tile.type === TileTypes.VOID) {
                    return;
                }
                
                // Extrahiere Position
                let q, r;
                if (key.includes(',')) {
                    [q, r] = key.split(',').map(Number);
                } else if (tile.position) {
                    q = tile.position.q;
                    r = tile.position.r;
                } else if (tile.q !== undefined && tile.r !== undefined) {
                    q = tile.q;
                    r = tile.r;
                } else {
                    return;
                }
                
                // Prüfe ob Tile im sichtbaren Bereich ist
                const pixelPos = hexToPixel(new HexPosition(q, r), hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
                if (pixelPos.x >= extendedLeft && pixelPos.x <= extendedRight && 
                    pixelPos.y >= extendedTop && pixelPos.y <= extendedBottom) {
                    visiblePositions.add(`${q},${r}`);
                }
            });
        }
        
        // Rendere nur sichtbare Positionen
        visiblePositions.forEach(positionKey => {
            const [q, r] = positionKey.split(',').map(Number);
            this.renderAllTilesAtPosition(q, r);
        });
    }
    
    // Throttled render für bessere Performance
    renderThrottled() {
        const now = Date.now();
        if (now - this.lastRenderTime < this.renderThrottleDelay) {
            // Throttle das Rendering
            if (this.renderThrottle) {
                clearTimeout(this.renderThrottle);
            }
            this.renderThrottle = setTimeout(() => {
                this.render();
                this.lastRenderTime = Date.now();
                this.renderThrottle = null;
            }, this.renderThrottleDelay);
        } else {
            // Direkt rendern
            this.render();
            this.lastRenderTime = now;
        }
    }
    
    // Optimiertes Pan-Rendering für bessere Performance
    renderPanThrottled() {
        const now = Date.now();
        if (now - this.lastRenderTime < this.panThrottleDelay) {
            // Throttle das Pan-Rendering
            if (this.renderThrottle) {
                clearTimeout(this.renderThrottle);
            }
            this.renderThrottle = setTimeout(() => {
                this.renderFast();
                this.lastRenderTime = Date.now();
                this.renderThrottle = null;
            }, this.panThrottleDelay);
        } else {
            // Direkt rendern
            this.renderFast();
            this.lastRenderTime = now;
        }
    }
    
    // Rendert die Vorschau einer zu zeichnenden Linie
    renderLinePreview(lineData) {
        if (!lineData.start || !lineData.end) return;
        
        const { hexSize, horizontalSpacing, verticalSpacing } = this.core.settings;
        const brushSize = this.core.settings.brushSize || 0;
        
        // Konvertiere Start- und Endpunkte zu Pixel-Koordinaten
        const startPos = hexToPixel(
            new HexPosition(lineData.start.q, lineData.start.r), 
            hexSize, 
            horizontalSpacing, 
            verticalSpacing, 
            this.core.settings.layoutRotation
        );
        const endPos = hexToPixel(
            new HexPosition(lineData.end.q, lineData.end.r), 
            hexSize, 
            horizontalSpacing, 
            verticalSpacing, 
            this.core.settings.layoutRotation
        );
        
        // Zeichne die Vorschau-Linie
        this.ctx.save();
        this.ctx.strokeStyle = '#FFD700'; // Goldene Farbe für Vorschau
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]); // Gestrichelte Linie
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
        
        // Zeichne Vorschau der Brush-Größe an Start- und Endpunkt
        if (brushSize > 0) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([]); // Solide Linie für Kreise
            this.ctx.globalAlpha = 0.4;
            
            // Startpunkt-Kreis
            this.ctx.beginPath();
            this.ctx.arc(startPos.x, startPos.y, hexSize * (brushSize + 0.5), 0, 2 * Math.PI);
            this.ctx.stroke();
            
            // Endpunkt-Kreis
            this.ctx.beginPath();
            this.ctx.arc(endPos.x, endPos.y, hexSize * (brushSize + 0.5), 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    // Vereinfachte Hover-Behandlung
    
    // Rendert nur den Hover-Effekt ohne die komplette Map neu zu zeichnen
    renderHoverOnly() {
        if (!this.hoveredHex) return;
        
        // Lösche nur den Hover-Bereich
        const { hexSize, horizontalSpacing, verticalSpacing, rotation } = this.core.settings;
        const hexPos = new HexPosition(this.hoveredHex.q, this.hoveredHex.r);
        const pixelPos = hexToPixel(hexPos, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
        const points = getHexPoints(hexSize, rotation);
        
        // Lösche den Hover-Bereich
        this.ctx.save();
        this.ctx.translate(this.core.settings.offsetX, this.core.settings.offsetY);
        this.ctx.scale(this.core.settings.zoom, this.core.settings.zoom);
        
        // Lösche nur den Hexagon-Bereich mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        for (let i = 1; i < snappedPoints.length; i++) {
            this.ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Zeichne den Hover-Effekt neu
        this.renderBrushPreview(this.hoveredHex);
        
        this.ctx.restore();
    }

    renderHex(tile) {
        const { hexSize, horizontalSpacing, verticalSpacing, rotation } = this.core.settings;
        
        // Verwende nur die spezifischen Abstand-Parameter ohne hexSize
        const totalHorizontalSpacing = horizontalSpacing;
        const totalVerticalSpacing = verticalSpacing;
        
        // Extrahiere Position aus Tile-Objekt
        let position;
        if (tile.position) {
            position = tile.position;
        } else if (tile.q !== undefined && tile.r !== undefined) {
            position = { q: tile.q, r: tile.r };
        } else {
            console.warn('[renderer] Could not extract position from tile:', tile);
            return;
        }
        
        const pixelPos = hexToPixel(position, hexSize, totalHorizontalSpacing, totalVerticalSpacing, this.core.settings.layoutRotation);
        const points = getHexPoints(hexSize, rotation);
        
        // Draw hexagon mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        this.ctx.beginPath();
        this.ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        
        for (let i = 1; i < snappedPoints.length; i++) {
            this.ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        this.ctx.closePath();
        
        // Versuche Biome-spezifische Tiles zu laden und zu rendern
        // Verwende den ursprünglichen Biome-Namen falls verfügbar
        const biomeName = tile.biomeName || tile.type;
        
        // Verwende das gespeicherte selectedTile falls verfügbar
        if (tile.selectedTile && tile.selectedTile.image) {
            console.log('[renderer] Using saved selected tile:', tile.selectedTile.name, 'for tile at', position.q, position.r);
            this.renderBiomeTile(tile.selectedTile, pixelPos, hexSize, points);
        }
        // Für Streets-Layer: Verwende immer das ausgewählte Tile aus dem Core
        else if (this.core.getCurrentLayer() === 'streets' && this.core.selectedTile && this.core.selectedTile.image) {
            console.log('[renderer] Using selected tile from core for streets layer:', this.core.selectedTile.name, 'for tile at', position.q, position.r);
            this.renderBiomeTile(this.core.selectedTile, pixelPos, hexSize, points);
        }
        // Prüfe ob es sich um ein spezifisches Tile handelt (Bildpfad)
        else if (tile.type && (tile.type.includes('/') || tile.type.includes('Slice_'))) {
            console.log('[renderer] Detected specific tile type:', tile.type);
            // Es ist ein spezifisches Tile mit Bildpfad - verwende es direkt
            const specificTile = this.getSpecificSelectedTile(tile.type);
            if (specificTile) {
                console.log('[renderer] Using found specific tile:', specificTile.name);
                // Verwende das gefundene spezifische Tile
                this.renderBiomeTile(specificTile, pixelPos, hexSize, points);
            } else {
                console.log('[renderer] Specific tile not found, using fallback');
                // Fallback: Erstelle ein Tile-Objekt aus dem Pfad
                const fallbackTile = {
                    name: tile.type.split('/').pop()?.replace('.png', '') || 'Unknown',
                    image: tile.type,
                    categoryName: biomeName
                };
                this.renderBiomeTile(fallbackTile, pixelPos, hexSize, points);
            }
        } else if (this.core.selectedTile && this.core.selectedTile.image) {
            // Verwende das aktuell ausgewählte Tile aus dem Core
            console.log('[renderer] Using selected tile from core:', this.core.selectedTile.name);
            this.renderBiomeTile(this.core.selectedTile, pixelPos, hexSize, points);
        } else {
            // Verwende Biome-basiertes Tile-System
            const biomeTile = this.getBiomeTile(biomeName, position);
            if (biomeTile && biomeTile.image) {
                // Rendere Biome-Tile als Bild
                this.renderBiomeTile(biomeTile, pixelPos, hexSize, points);
            } else {
                // Fallback: Verwende die aktuelle Farbe vom Core
                const tileColor = this.core.getTileColor(tile.type);
                this.ctx.fillStyle = tileColor;
                this.ctx.fill();
            }
        }
        
        // Outline
        // Verwende nur outlineWidth für die Strichstärke
        const lineWidth = this.core.settings.outlineWidth || 0;
        // Nur zeichnen wenn die Strichstärke größer als 0 ist
        if (lineWidth > 0) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }
        
        // Draw coordinates
        this.drawCoordinates(position, pixelPos, hexSize);
    }
    
    getSpecificSelectedTile(tileType) {
        // Suche das spezifische ausgewählte Tile basierend auf dem tileType
        if (!tileType) return null;
        
        console.log('[renderer] getSpecificSelectedTile called with:', tileType);
        
        // Prüfe ob es sich um einen Bildpfad handelt
        if (tileType.includes('/') || tileType.includes('Slice_')) {
            // Extrahiere den Dateinamen aus dem Pfad
            const fileName = tileType.split('/').pop()?.replace('.png', '') || tileType;
            console.log('[renderer] Extracted fileName:', fileName);
            
            // Suche in allen verfügbaren Tile-Listen
            const tileListNames = Object.keys(window).filter(key => key.endsWith('TilesList'));
            console.log('[renderer] Available tile lists:', tileListNames);
            
            for (const listName of tileListNames) {
                const tileList = window[listName];
                if (tileList && Array.isArray(tileList)) {
                    console.log(`[renderer] Searching in ${listName}, ${tileList.length} tiles`);
                    // Suche nach dem spezifischen Tile
                    const foundTile = tileList.find(tile => {
                        if (!tile.image) return false;
                        
                        // Prüfe verschiedene Möglichkeiten der Übereinstimmung
                        const tileImage = tile.image.toLowerCase();
                        const searchFileName = fileName.toLowerCase();
                        const searchTileType = tileType.toLowerCase();
                        
                        const matches = tileImage.includes(searchFileName) || 
                               tileImage.includes(searchTileType) ||
                               tileImage.endsWith(searchFileName + '.png') ||
                               tileImage.endsWith(searchTileType);
                        
                        if (matches) {
                            console.log(`[renderer] Found match: ${tile.name} (${tile.image})`);
                        }
                        
                        return matches;
                    });
                    
                    if (foundTile) {
                        console.log(`[renderer] Found specific tile: ${foundTile.name} in ${listName}`);
                        return foundTile;
                    }
                }
            }
            
            // Wenn nicht gefunden, versuche es mit dem ursprünglichen tileType
            console.log(`[renderer] Specific tile not found for: ${tileType}`);
        }
        
        return null;
    }
    
    getBiomeTile(biomeType, tilePosition) {
        // Prüfe ob es sich um einen Biome-Typ handelt
        if (!biomeType || biomeType === 'ORIGIN_SETTER') {
            return null;
        }
        
        // Versuche Biome-Tiles zu laden
        try {
            // Konvertiere Biome-Namen zu den erwarteten Schlüsseln
            const biomeNameMap = {
                'Forest': 'forest',
                'Mountains': 'mountains', 
                'Water': 'water',
                'Desert': 'desert',
                'Swamp': 'swamp',
                'Plain': 'plain',
                'Jungle': 'jungle',
                'Badlands': 'badlands',
                'Snow': 'snow',
                'Ocean': 'ocean',
                'Coast': 'coast',
                'Buildings': 'buildings',
                // Neue Gebäude-Kategorien
                'Tower': 'buildings',
                'Castle': 'buildings',
                'Mine': 'buildings',
                'House': 'buildings',
                'Village': 'buildings',
                'Settlement': 'buildings',
                'Wall': 'buildings',
                'Gate': 'buildings',
                'Bridge': 'buildings',
                'Street': 'buildings',
                'Square': 'buildings',
                'Market': 'buildings',
                'Temple': 'buildings',
                'Church': 'buildings',
                'Tavern': 'buildings',
                'Smithy': 'buildings',
                'Mill': 'buildings',
                'Warehouse': 'buildings',
                'Stable': 'buildings',
                'Garden': 'buildings',
                'Well': 'buildings',
                'Ruin': 'buildings',
                'Building': 'buildings'
            };
            
            const biomeKey = biomeNameMap[biomeType] || biomeType.toLowerCase();
            const biomeTilesListName = `${biomeKey}TilesList`;
            
            if (window[biomeTilesListName] && window[biomeTilesListName].length > 0) {
                // Verwende ein konsistentes Tile basierend auf der Position
                const tileIndex = Math.abs(tilePosition.q + tilePosition.r * 1000) % window[biomeTilesListName].length;
                const selectedTile = window[biomeTilesListName][tileIndex];
                
                return selectedTile;
            }
            
            // Entfernt: Keine Abhängigkeit mehr vom TileEditor
            // Der HexMap Editor lädt Tiles direkt aus den Dateien
        } catch (error) {
            console.warn(`[renderer] Error loading biome tiles for ${biomeType}:`, error);
        }
        
        return null;
    }
    
    // Preload häufig verwendete Biome-Tiles für bessere Performance
    async preloadCommonTiles() {
        console.log('[MapRenderer] Starting preload for common tiles...');
        
        // Warte kurz, damit die Biome-Daten geladen werden können
        setTimeout(async () => {
            const commonBiomes = ['forest', 'mountains', 'water', 'ocean', 'desert', 'plains', 'snow', 'jungle', 'swamp', 'badlands'];
            const preloadPromises = [];
            
            console.log('[MapRenderer] Starting preload for biomes:', commonBiomes);
            
            for (const biomeKey of commonBiomes) {
                const biomeTilesListName = `${biomeKey}TilesList`;
                console.log('[MapRenderer] Checking biome:', biomeKey, 'list name:', biomeTilesListName);
                
                if (window[biomeTilesListName] && window[biomeTilesListName].length > 0) {
                    console.log('[MapRenderer] Found', window[biomeTilesListName].length, 'tiles for biome:', biomeKey);
                    // Preload ALLE Tiles jedes Bioms
                    const tilesToPreload = window[biomeTilesListName];
                    
                    for (const tile of tilesToPreload) {
                        if (tile.image) {
                            console.log('[MapRenderer] Preloading tile:', tile.image, 'for biome:', biomeKey);
                            preloadPromises.push(this.preloadImage(tile.image));
                        }
                    }
                } else {
                    console.log('[MapRenderer] No tiles found for biome:', biomeKey);
                }
            }
            
            // Auch ALLE Buildings preloaden
            if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
                console.log('[MapRenderer] Preloading', window.buildingsTilesList.length, 'building tiles');
                for (const building of window.buildingsTilesList) {
                    if (building.image) {
                        preloadPromises.push(this.preloadImage(building.image));
                    }
                }
            }
            
            // Lade auch alle verfügbaren Biome-Daten
            if (window.BIOME_DATA) {
                console.log('[MapRenderer] Preloading from BIOME_DATA...');
                for (const [biomeName, biomeData] of Object.entries(window.BIOME_DATA)) {
                    if (biomeData.tiles && Array.isArray(biomeData.tiles)) {
                        console.log('[MapRenderer] Preloading', biomeData.tiles.length, 'tiles from BIOME_DATA for:', biomeName);
                        for (const tile of biomeData.tiles) {
                            if (tile.image) {
                                preloadPromises.push(this.preloadImage(tile.image));
                            }
                        }
                    }
                }
            }
            
            // Lade auch alle verfügbaren Biome-Daten aus den einzelnen Dateien
            const biomeFiles = ['Forest', 'Mountains', 'Water', 'Ocean', 'Desert', 'Plain', 'Snow', 'Jungle', 'Swamp', 'Badlands', 'Buildings'];
            for (const biomeName of biomeFiles) {
                try {
                    const biomeDataName = `${biomeName.toLowerCase()}TilesList`;
                    if (window[biomeDataName] && Array.isArray(window[biomeDataName])) {
                        console.log('[MapRenderer] Preloading', window[biomeDataName].length, 'tiles from', biomeName);
                        for (const tile of window[biomeDataName]) {
                            if (tile.image) {
                                preloadPromises.push(this.preloadImage(tile.image));
                            }
                        }
                    }
                } catch (error) {
                    console.warn('[MapRenderer] Error preloading biome:', biomeName, error);
                }
            }
            
            try {
                console.log('[MapRenderer] Starting to preload', preloadPromises.length, 'tiles...');
                await Promise.all(preloadPromises);
                console.log('[MapRenderer] Successfully preloaded', preloadPromises.length, 'tiles');
                // Force re-render nach dem Preloading
                this.renderThrottled();
            } catch (error) {
                console.warn('[MapRenderer] Some tiles failed to preload:', error);
            }
        }, 500); // Reduziert auf 500ms für schnellere Ladezeit
    }

// Preload Tiles für ein spezifisches Biome
async preloadBiomeTiles(biomeName) {
    if (!biomeName) return;
    
    console.log('[MapRenderer] Preloading tiles for biome:', biomeName);
    
    // Konvertiere Biome-Name zu lowercase für die Liste
    const biomeKey = biomeName.toLowerCase();
    const biomeTilesListName = `${biomeKey}TilesList`;
    
    console.log('[MapRenderer] Looking for tiles list:', biomeTilesListName);
    
    if (window[biomeTilesListName] && window[biomeTilesListName].length > 0) {
        console.log('[MapRenderer] Found', window[biomeTilesListName].length, 'tiles for biome:', biomeName);
        
        const preloadPromises = [];
        const tilesToPreload = window[biomeTilesListName].slice(0, 15); // Preload mehr Tiles für bessere Performance
        
        for (const tile of tilesToPreload) {
            if (tile.image && !this.preloadedImages.has(tile.image)) {
                console.log('[MapRenderer] Preloading tile:', tile.image, 'for biome:', biomeName);
                preloadPromises.push(this.preloadImage(tile.image));
            }
        }
        
        try {
            await Promise.all(preloadPromises);
            console.log('[MapRenderer] Successfully preloaded', preloadPromises.length, 'tiles for biome:', biomeName);
        } catch (error) {
            console.warn('[MapRenderer] Some tiles failed to preload for biome:', biomeName, error);
        }
    } else {
        console.log('[MapRenderer] No tiles found for biome:', biomeName);
    }
}
    
    // Preload ein einzelnes Bild mit Promise-basiertem Caching
    async preloadImage(imageSrc) {
        // Korrigiere den Bildpfad vor dem Laden
        const correctedImageSrc = this.correctImagePath(imageSrc);
        
        // Prüfe ob bereits im Cache
        if (this.preloadedImages.has(correctedImageSrc)) {
            return this.biomeTileCache.get(correctedImageSrc);
        }
        
        // Prüfe ob bereits im Promise-Cache
        if (this.imagePromiseCache.has(correctedImageSrc)) {
            return this.imagePromiseCache.get(correctedImageSrc);
        }
        
        console.log('[MapRenderer] Loading image:', imageSrc, '->', correctedImageSrc);
        
        const imagePromise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('[MapRenderer] Successfully loaded image:', correctedImageSrc);
                this.biomeTileCache.set(correctedImageSrc, img);
                this.preloadedImages.add(correctedImageSrc);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`[MapRenderer] Failed to preload image: ${correctedImageSrc}`);
                reject(new Error(`Failed to load ${correctedImageSrc}`));
            };
            img.src = correctedImageSrc;
        });
        
        this.imagePromiseCache.set(correctedImageSrc, imagePromise);
        return imagePromise;
    }

    // Sofortiges Laden und Rendern eines Bildes
    loadAndRenderImage(imageSrc, pixelPos, points, hexSize, rotation) {
        const correctedImageSrc = this.correctImagePath(imageSrc);
        
        console.log('[MapRenderer] Loading image:', imageSrc, '->', correctedImageSrc);
        
        // Prüfe ob bereits im Cache
        if (this.biomeTileCache.has(correctedImageSrc)) {
            const cachedImage = this.biomeTileCache.get(correctedImageSrc);
            if (cachedImage && cachedImage.complete && cachedImage.naturalWidth > 0) {
                console.log('[MapRenderer] Using cached image:', correctedImageSrc);
                this.renderImageWithClipping(cachedImage, pixelPos, points, hexSize, rotation);
                return;
            }
        }
        
        // Lade das Bild sofort
        const img = new Image();
        img.onload = () => {
            console.log('[MapRenderer] Successfully loaded image:', correctedImageSrc);
            this.biomeTileCache.set(correctedImageSrc, img);
            this.preloadedImages.add(correctedImageSrc);
            this.renderImageWithClipping(img, pixelPos, points, hexSize, rotation);
            // Trigger re-render für bessere Performance
            this.renderThrottled();
        };
        img.onerror = () => {
            console.warn('[MapRenderer] Failed to load image:', correctedImageSrc);
            // Fallback zu farbigem Hexagon
            this.renderColoredHexagon(pixelPos, points, 'grass');
        };
        img.src = correctedImageSrc;
    }

    // Rendert ein Bild mit Hexagon-Clipping
    renderImageWithClipping(img, pixelPos, points, hexSize, rotation) {
        this.ctx.save();
        
        // Prüfe ob es sich um ein Building handelt
        const isBuilding = this.isBuildingTile(img.src);
        
        // Verwende Gebäude-Skalierung wenn es ein Building ist
        const scale = isBuilding ? (this.core.settings.buildingScale || 0.8) : 1.0;
        
        // Erstelle Hexagon-Pfad für Clipping mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        this.ctx.beginPath();
        this.pixelPerfectMoveTo(snappedPoints[0].x, snappedPoints[0].y);
        for (let i = 1; i < snappedPoints.length; i++) {
            this.pixelPerfectLineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.clip();
        
        // Zeichne das Bild mit pixel-perfekter Skalierung
        const snappedPos = this.snapToPixel(pixelPos.x, pixelPos.y);
        this.ctx.translate(snappedPos.x, snappedPos.y);
        this.ctx.rotate(rotation * Math.PI / 180);
        
        // Verwende pixel-perfekte Zeichnung mit korrekter Hexagon-Größe
        const drawX = -hexSize * scale;
        const drawY = -hexSize * Math.sqrt(3) / 2 * scale;
        const drawWidth = hexSize * 2 * scale;
        const drawHeight = hexSize * Math.sqrt(3) * scale;
        
        this.pixelPerfectDrawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        this.ctx.restore();
    }

    // Rendert ein farbiges Hexagon als Fallback mit pixel-perfekten Koordinaten
    renderColoredHexagon(pixelPos, points, tileType) {
        this.ctx.beginPath();
        this.pixelPerfectMoveTo(pixelPos.x + points[0].x, pixelPos.y + points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.pixelPerfectLineTo(pixelPos.x + points[i].x, pixelPos.y + points[i].y);
        }
        this.ctx.closePath();
        
        const color = this.getTileColor(tileType);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    // Clear all caches to force reload of images
    clearCache() {
        console.log('[MapRenderer] Clearing all image caches');
        this.biomeTileCache.clear();
        this.preloadedImages.clear();
        this.imagePromiseCache.clear();
        this.transparencyCache.clear();
        this.scaledImageCache.clear();
        
        // Force re-render nach Cache-Clear
        setTimeout(() => {
            this.renderThrottled();
        }, 100);
    }
    
    // Korrigiert Bildpfade für Biome-Tiles
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        console.log('[MapRenderer] Correcting image path:', imagePath);
        
        // Wenn der Pfad bereits mit / beginnt, ist er bereits korrekt
        if (imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // Wenn der Pfad mit assets/ beginnt, mache ihn absolut
        if (imagePath.startsWith('assets/')) {
            return '/' + imagePath;
        }
        
        // Prüfe ob es sich um Void handelt
        if (imagePath.includes('void') || imagePath.includes('Void')) {
            return '/assets/biomes/Unassigned/tiles/void.png';
        }
        
        // Wenn der Pfad bereits einen vollständigen Pfad enthält (wie "assets/biomes/Plain/tiles/grass.png")
        if (imagePath.includes('assets/biomes/')) {
            return '/' + imagePath;
        }
        
        // Bestimme den korrekten Biome-Ordner basierend auf dem Tile-Typ
        let biomeFolder = 'Forest'; // Standard
        
        // Mappe Tile-Typen zu Biome-Ordnern
        const tileTypeToBiome = {
            'grass': 'Plain',
            'mountain': 'Mountains', 
            'water': 'Water',
            'forest': 'Forest',
            'ocean': 'Ocean',
            'desert': 'Desert',
            'snow': 'Snow',
            'jungle': 'Jungle',
            'swamp': 'Swamp',
            'badlands': 'Badlands',
            'brown': 'Desert',
            'white': 'Snow',
            'yellow': 'Desert',
            'orange': 'Desert',
            'blue': 'Water',
            'green': 'Forest'
        };
        
        // Prüfe ob der Bildname einem bekannten Tile-Typ entspricht
        for (const [tileType, biome] of Object.entries(tileTypeToBiome)) {
            if (imagePath.includes(tileType) || imagePath === tileType) {
                biomeFolder = biome;
                break;
            }
        }
        
        // Wenn wir im Streets-Layer sind und es ein Building-Tile ist
        const currentLayer = this.core.getCurrentLayer();
        if (currentLayer === 'streets' && (imagePath.includes('.png') || imagePath.includes('temple') || imagePath.includes('house'))) {
            biomeFolder = 'Buildings';
        }
        
        // Spezielle Behandlung für Temple-Bilder, die nicht existieren
        if (imagePath.includes('temple1.png') || imagePath.includes('temple2.png') || imagePath.includes('temple3.png')) {
            // Verwende ein existierendes Building-Bild als Fallback
            return '/assets/biomes/Buildings/tiles/slice_344.png';
        }
        
        // Spezielle Behandlung für Tile-Typen ohne .png Erweiterung
        if (!imagePath.includes('.png') && !imagePath.includes('.jpg') && !imagePath.includes('.jpeg')) {
            // Füge .png Erweiterung hinzu für Tile-Typen
            const finalPath = '/assets/biomes/' + biomeFolder + '/tiles/' + imagePath + '.png';
            console.log('[MapRenderer] Final corrected path:', finalPath);
            return finalPath;
        }
        
        const finalPath = '/assets/biomes/' + biomeFolder + '/tiles/' + imagePath;
        console.log('[MapRenderer] Final corrected path:', finalPath);
        
        // Add cache busting for Buildings tiles
        if (biomeFolder === 'Buildings') {
            const timestamp = Date.now();
            const cacheBustedPath = finalPath + (finalPath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[MapRenderer] Cache busted path for Buildings:', cacheBustedPath);
            return cacheBustedPath;
        }
        
        return finalPath;
    }
    
    renderBiomeTile(biomeTile, pixelPos, hexSize, points) {
        // Korrigiere den Bildpfad
        const correctedImagePath = this.correctImagePath(biomeTile.image);
        const cacheKey = correctedImagePath;
        
        // Add cache-busting parameter for new/updated images
        const timestamp = Date.now();
        const cacheBustedKey = cacheKey + (cacheKey.includes('?') ? '&' : '?') + '_cb=' + timestamp;
        
        // Schneller Check: Ist das Bild bereits im Cache und geladen?
        let img = this.biomeTileCache.get(cacheKey);
        
        if (img && img.complete && img.naturalWidth > 0) {
            // Sofortiges Zeichnen wenn Bild im Cache und geladen
            this.drawBiomeTileImage(img, pixelPos, hexSize, points);
            return;
        }
        
        // Fallback: Verwende die Farbe des Bioms während das Bild lädt
        const tileColor = this.core.getTileColor(biomeTile.categoryName || biomeTile.categoryId);
        this.ctx.fillStyle = tileColor;
        
        // Prüfe ob es sich um ein Building handelt
        const isBuilding = this.isBuildingTile(correctedImagePath);
        
        // Verwende die aktuelle globalAlpha-Einstellung (von renderLayer gesetzt)
        // Keine zusätzliche Transparenz hier, da sie bereits von renderLayer gesetzt wird
        
        this.ctx.fill();
        
        // Debug-Ausgabe für fehlende Bilder
        if (this.core.settings.debugMode) {
            console.log('[MapRenderer] Using fallback color for tile:', {
                biomeTile: biomeTile.name || biomeTile.image,
                correctedPath: correctedImagePath,
                tileColor: tileColor,
                isBuilding: isBuilding
            });
        }
        
        // Outline für Biome-Tiles
        const lineWidth = this.core.settings.outlineWidth || 0;
        // Nur zeichnen wenn die Strichstärke größer als 0 ist
        if (lineWidth > 0) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }
        
        // Asynchrones Laden mit Promise-basiertem Caching
        if (!img) {
            // Prüfe, ob bereits ein Ladevorgang läuft
            if (this.imagePromiseCache.has(cacheKey)) {
                this.imagePromiseCache.get(cacheKey).then(() => {
                    // Nur re-rendern wenn das Bild erfolgreich geladen wurde
                    if (this.biomeTileCache.has(cacheKey)) {
                        this.scheduleRender();
                    }
                }).catch(() => {
                    // Stille Behandlung von Fehlern - Farbe wurde bereits gezeichnet
                });
                return;
            }
            
            // Starte neuen Ladevorgang mit dem ursprünglichen Bildpfad
            const imagePromise = this.preloadImage(biomeTile.image);
            imagePromise.then(() => {
                this.scheduleRender();
            }).catch(() => {
                // Stille Behandlung von Fehlern
            });
        }
    }
    
    // Optimiertes Rendering mit Throttling
    scheduleRender() {
        if (this.renderThrottle) {
            clearTimeout(this.renderThrottle);
        }
        
        this.renderThrottle = setTimeout(() => {
            this.render();
            this.renderThrottle = null;
        }, this.renderThrottleDelay || 16); // ~60 FPS
    }

    // Automatisches Speichern SOFORT
    scheduleAutoSave() {
        // console.log('[renderer] Auto-saving immediately...');
        // console.log('[renderer] Core available:', !!this.core);
        // console.log('[renderer] saveMap function available:', !!(this.core && typeof this.core.saveMap === 'function'));
        
        if (this.core && typeof this.core.saveMap === 'function') {
            // console.log('[renderer] Auto-saving map...');
            // console.log('[renderer] Current settings:', {
            //     zoom: this.core.settings.zoom,
            //     offsetX: this.core.settings.offsetX,
            //     offsetY: this.core.settings.offsetY
            // });
            this.core.saveMap();
        } else {
            // console.error('[renderer] Core or saveMap function not available');
            // console.error('[renderer] Core:', this.core);
            // console.error('[renderer] saveMap type:', typeof this.core?.saveMap);
        }
    }


    
    drawBiomeTileImage(img, pixelPos, hexSize, points) {
        // Berechne die Skalierung für das Hexagon
        const hexWidth = Math.abs(points[2].x - points[5].x);
        const hexHeight = Math.abs(points[1].y - points[4].y);
        
        // Prüfe ob es sich um ein Building handelt
        const isBuilding = this.isBuildingTile(img.src);
        
        // Verwende Gebäude-Skalierung wenn es ein Building ist
        const scale = isBuilding ? (this.core.settings.buildingScale || 0.8) : 1.0;
        
        // Textur-Auflösungsbegrenzung anwenden
        let finalImg = img;
        if (this.core.settings.maxTextureResolution && img.naturalWidth > this.core.settings.textureResolutionLimit) {
            finalImg = this.getScaledImage(img, this.core.settings.textureResolutionLimit);
        }
        
        // Debug-Ausgabe für Building-Skalierung
        if (isBuilding && this.core.settings.debugMode) {
            console.log('[MapRenderer] Building tile detected:', {
                src: img.src,
                buildingScale: this.core.settings.buildingScale,
                appliedScale: scale,
                hexWidth: hexWidth,
                hexHeight: hexHeight,
                scaledWidth: hexWidth * scale,
                scaledHeight: hexHeight * scale,
                textureResolutionLimit: this.core.settings.maxTextureResolution ? this.core.settings.textureResolutionLimit : 'none'
            });
        }
        
        // Zeichne das Bild in das Hexagon
        this.ctx.save();
        
        // Erstelle einen Clipping-Pfad für das Hexagon mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        this.ctx.beginPath();
        this.ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        for (let i = 1; i < snappedPoints.length; i++) {
            this.ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.clip();
        
        // Verwende die aktuelle globalAlpha-Einstellung (von renderLayer gesetzt)
        // Für Buildings: Kombiniere Layer-Transparenz mit nativer Transparenz
        if (isBuilding && this.core.settings.useNativeTransparency && this.hasNativeTransparency(img)) {
            // Für Buildings mit nativer Transparenz: Verwende nur Layer-Transparenz
            // (native Transparenz wird automatisch vom Bild mitgebracht)
        } else if (isBuilding) {
            // Für Buildings ohne native Transparenz: Layer-Transparenz ist bereits gesetzt
        }
        
        // Debug-Ausgabe für Building-Transparenz
        if (isBuilding && this.core.settings.debugMode) {
            console.log('[MapRenderer] Building transparency:', {
                currentAlpha: this.ctx.globalAlpha,
                buildingTransparency: this.core.settings.buildingTransparency,
                useNativeTransparency: this.core.settings.useNativeTransparency,
                hasNativeTransparency: this.hasNativeTransparency(img)
            });
        }
        
        // Berechne die skalierte Größe für Buildings
        const scaledWidth = hexWidth * scale;
        const scaledHeight = hexHeight * scale;
        
        // Zeichne das Bild mit einem kleinen Offset, um die Ränder abzuschneiden
        const borderOffset = 2; // 2 Pixel Rand abschneiden
        
        // Zentriere das skalierte Bild im Hexagon mit pixel-perfekten Koordinaten
        const snappedPos = this.snapToPixel(pixelPos.x - scaledWidth/2 - borderOffset, pixelPos.y - scaledHeight/2 - borderOffset);
        const drawX = snappedPos.x;
        const drawY = snappedPos.y;
        
        this.ctx.drawImage(
            finalImg, 
            drawX, 
            drawY, 
            scaledWidth + borderOffset * 2, 
            scaledHeight + borderOffset * 2
        );
        
        this.ctx.restore();
    }
    
    hasNativeTransparency(img) {
        // Prüfe ob das Bild native Transparenz hat
        if (!img || !img.complete || img.naturalWidth === 0) {
            return false;
        }
        
        // Cache-Key für das Bild
        const cacheKey = `transparency_${img.src}`;
        
        // Prüfe Cache
        if (this.transparencyCache && this.transparencyCache.has(cacheKey)) {
            return this.transparencyCache.get(cacheKey);
        }
        
        try {
            // Erstelle ein temporäres Canvas um die Transparenz zu prüfen
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // Zeichne das Bild
            ctx.drawImage(img, 0, 0);
            
            // Prüfe Transparenz durch Sampling von Pixeln
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Prüfe einige Pixel auf Transparenz (Alpha < 255)
            const sampleSize = Math.min(50, data.length / 4); // Reduziert auf 50 Pixel für Performance
            const step = Math.max(1, Math.floor(data.length / 4 / sampleSize));
            
            let hasTransparency = false;
            for (let i = 3; i < data.length; i += step * 4) { // Alpha-Kanal ist bei Index 3
                if (data[i] < 255) {
                    hasTransparency = true;
                    break; // Früh abbrechen wenn Transparenz gefunden
                }
            }
            
            // Cache das Ergebnis
            if (!this.transparencyCache) {
                this.transparencyCache = new Map();
            }
            this.transparencyCache.set(cacheKey, hasTransparency);
            
            return hasTransparency;
        } catch (error) {
            console.warn('[renderer] Error checking native transparency:', error);
            return false;
        }
    }
    
    isBuildingTile(imageSrc) {
        // Prüfe ob das Bild zu einem Building gehört
        return imageSrc.includes('Buildings') || 
               imageSrc.includes('building') || 
               imageSrc.includes('house') || 
               imageSrc.includes('tower') || 
               imageSrc.includes('castle') || 
               imageSrc.includes('temple') || 
               imageSrc.includes('mine');
    }
    
    drawCoordinates(position, pixelPos, hexSize) {
        const { showCoordinates } = this.core.settings;
        if (!showCoordinates) return;
        
        // Koordinaten-Text
        const coordText = `${position.q},${position.r}`;
        
        // Text-Styling
        this.ctx.font = `${Math.max(8, hexSize / 6)}px Arial`;
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text zeichnen (zentriert im Hexagon)
        this.ctx.fillText(coordText, pixelPos.x, pixelPos.y);
    }

    // Funktion zum Aktualisieren aller bestehenden Tiles mit dem aktuell ausgewählten Tile
    updateAllTilesWithSelectedTile() {
        console.log('[renderer] Updating all tiles with selected tile:', this.core.selectedTile?.name);
        
        // Aktualisiere Tiles in allen Layern
        Object.keys(this.core.layers).forEach(layerName => {
            this.core.layers[layerName].forEach((tile, key) => {
                if (tile && this.core.selectedTile) {
                    tile.selectedTile = this.core.selectedTile;
                    console.log('[renderer] Updated tile at', key, 'with selectedTile:', this.core.selectedTile.name);
                }
            });
        });
        
        // Aktualisiere auch die Haupt-Tiles
        this.core.tiles.forEach((tile, key) => {
            if (tile && this.core.selectedTile) {
                tile.selectedTile = this.core.selectedTile;
                console.log('[renderer] Updated main tile at', key, 'with selectedTile:', this.core.selectedTile.name);
            }
        });
        
        // Rendere die Karte neu
        this.render();
    }

    setSelectedTileType(type) {
        this.core.selectedTileType = type;
    }
    
    setSurroundingChecker(checker) {
        this.surroundingChecker = checker;
    }
    
    onEvent(event, data) {
        // Reagiere auf Core-Events
        switch (event) {
            case 'tilesBatchUpdated':
                // Batch-Update für bessere Performance
                console.log('[renderer] tilesBatchUpdated event received, tiles:', data.tiles?.length || 0);
                this.renderThrottled();
                break;
            case 'tileRemoved':
                // Wenn ein Tile entfernt wurde, neu rendern
                console.log('[renderer] tileRemoved event received at:', data.x, data.y);
                this.renderThrottled();
                break;
            case 'tileAdded':
                // Wenn ein Tile hinzugefügt wurde, neu rendern
                console.log('[renderer] tileAdded event received');
                this.renderThrottled();
                break;
            case 'tileChanged':
                // Wenn ein Tile geändert wurde, neu rendern
                console.log('[renderer] tileChanged event received at:', data.x, data.y, 'layer:', data.layer);
                this.renderThrottled();
                break;
            case 'mapExpanded':
                // Wenn die Map erweitert wurde, neu rendern
                console.log('[renderer] mapExpanded event received');
                this.renderThrottled();
                break;
            case 'mapChanged':
                // Wenn sich die Map-Daten geändert haben, neu rendern
                console.log('[renderer] mapChanged event received');
                this.renderThrottled();
                break;
            case 'settingsChanged':
                // Wenn sich Einstellungen geändert haben, neu rendern
                console.log('[renderer] settingsChanged event received');
                this.renderThrottled();
                break;
            case 'biomeChanged':
                // Wenn sich das Biome geändert hat, Cache leeren und neu rendern
                console.log('[renderer] biomeChanged event received for biome:', data.biomeName);
                this.clearCache();
                
                // Preload Tiles für das neue Biome
                this.preloadBiomeTiles(data.biomeName);
                
                this.renderThrottled();
                break;
            case 'layerChanged':
                // Wenn sich der Layer geändert hat, Canvas-Größe korrigieren und neu rendern
                console.log('[renderer] layerChanged event received for layer:', data.layer);
                this.resizeCanvas();
                this.renderThrottled();
                break;
        }
    }
    
    renderBrushPreview(centerHex) {
        const { hexSize, horizontalSpacing, verticalSpacing, rotation } = this.core.settings;
        const brushSize = this.core.settings.brushSize;
        
        // Hole alle Felder, die vom Pinsel betroffen wären
        const previewTiles = this.core.getBrushPreview(centerHex.q, centerHex.r);
        
        // Zeichne Hover-Effekt für jedes betroffene Feld
        previewTiles.forEach(tileInfo => {
            // Erstelle ein HexPosition-Objekt für die korrekte Pixel-Berechnung
            const hexPos = new HexPosition(tileInfo.q, tileInfo.r);
            const pixelPos = hexToPixel(hexPos, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
            const points = getHexPoints(hexSize, rotation);
            
                                // Zeichne transparenten Hover-Effekt mit pixel-perfekten Koordinaten
            const snappedPoints = this.snapHexPoints(pixelPos, points);
            this.ctx.beginPath();
            this.ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
            
            for (let i = 1; i < snappedPoints.length; i++) {
                this.ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
            }
            this.ctx.closePath();
            
            // Hover-Styling basierend auf Feld-Status
            if (tileInfo.exists) {
                // Existierendes Feld - gelber Hover
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Gelb, transparent
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; // Gelb, weniger transparent
            } else {
                // Nicht-existierendes Feld (Void) - roter Hover für Void Reducer
                this.ctx.fillStyle = 'rgba(255, 87, 34, 0.3)'; // Rot-Orange, transparent
                this.ctx.strokeStyle = 'rgba(255, 87, 34, 0.8)'; // Rot-Orange, weniger transparent
            }
            
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    getScaledImage(img, maxSize) {
        // Cache-Key für das skalierte Bild
        const cacheKey = `scaled_${img.src}_${maxSize}`;
        
        // Prüfe Cache
        if (this.scaledImageCache && this.scaledImageCache.has(cacheKey)) {
            return this.scaledImageCache.get(cacheKey);
        }
        
        // Erstelle ein Canvas für die Skalierung
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Berechne die neue Größe (quadratisch)
        const scale = maxSize / Math.max(img.naturalWidth, img.naturalHeight);
        const newWidth = Math.round(img.naturalWidth * scale);
        const newHeight = Math.round(img.naturalHeight * scale);
        
        // Setze Canvas-Größe
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Zeichne das skalierte Bild
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Erstelle ein neues Bild-Objekt
        const scaledImg = new Image();
        scaledImg.src = canvas.toDataURL();
        
        // Cache das skalierte Bild
        if (!this.scaledImageCache) {
            this.scaledImageCache = new Map();
        }
        this.scaledImageCache.set(cacheKey, scaledImg);
        
        return scaledImg;
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.MapRenderer = MapRenderer;
}

// Globale Variable für andere Module (Fallback)
window.MapRenderer = MapRenderer;
