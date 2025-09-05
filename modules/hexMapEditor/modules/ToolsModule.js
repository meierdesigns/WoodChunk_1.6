// Entferne ES6-Imports und verwende globale Klassen
// import { ToastManager } from '../utils/ToastManager.js';

class ToolsModule {
    constructor(core) {
        console.log('[ToolsModule] Constructor called');
        this.core = core;
        this.currentMode = 'paint';
        
        // Ensure default mode is set in core settings
        if (this.core && this.core.settings) {
            this.core.settings.currentMode = 'paint';
            this.core.settings.brushSize = 0; // Default brush size
        }
        
        // Setup tools module immediately
        this.setupToolsModule();
    }

    setupToolsModule() {
        console.log('[ToolsModule] Setup tools module');
        
        const toolsContent = document.getElementById('tools-content');
        if (!toolsContent) return;
        
        toolsContent.innerHTML = `
            <!-- Pinsel-Größe -->
            <div class="section-header">
                <div class="section-title">Pinsel-Größe</div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 6px;">Größe: <span id="brush-size-display">1</span></label>
                <input type="range" id="brush-size-slider" min="0" max="3" value="1" style="width: 80%; margin: 8px 0;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; margin-top: 8px;">
                    <button id="brush-0" class="brush-btn" data-size="0" title="Einzel-Tile">1</button>
                    <button id="brush-1" class="brush-btn active" data-size="1" title="7 Tiles">7</button>
                    <button id="brush-2" class="brush-btn" data-size="2" title="19 Tiles">19</button>
                    <button id="brush-3" class="brush-btn" data-size="3" title="37 Tiles">37</button>
                </div>
            </div>
            
            <!-- Mal-Modi -->
            <div class="section-header">
                <div class="section-title">Mal-Modi</div>
            </div>
            <div style="margin-bottom: 16px;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
                    <button id="mode-paint" class="mode-btn active" data-mode="paint" title="Malen">🎨</button>
                    <button id="mode-fill" class="mode-btn" data-mode="fill" title="Fläche füllen">🪣</button>
                    <button id="mode-line" class="mode-btn" data-mode="line" title="Linie zeichnen">📏</button>
                    <button id="mode-circle" class="mode-btn" data-mode="circle" title="Kreis zeichnen">⭕</button>
                </div>
            </div>
            

            
            <!-- Werkzeug-Aktionen -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 20px;">
                <button id="reset-view-btn" class="secondary" style="font-size: 11px;">Ansicht zurücksetzen</button>
                <button id="center-map-btn" class="secondary" style="font-size: 11px;">Karte zentrieren</button>
            </div>
        `;
        
        this.setupToolsEventListeners();
    }

    setupToolsEventListeners() {
        console.log('[ToolsModule] Setting up event listeners');
        
        // Pinsel-Größe
        const brushSizeSlider = document.getElementById('brush-size-slider');
        const brushSizeDisplay = document.getElementById('brush-size-display');
        const brushSizeReset = document.getElementById('brush-size-reset');
        const brushSizeControls = document.getElementById('brush-size-controls');
        
        console.log('[ToolsModule] Found elements:', {
            slider: !!brushSizeSlider,
            display: !!brushSizeDisplay,
            reset: !!brushSizeReset,
            controls: !!brushSizeControls
        });
        
        if (brushSizeSlider && brushSizeDisplay) {
            console.log('[ToolsModule] Setting up slider event listener');
            brushSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                console.log('[ToolsModule] Slider changed to:', size);
                brushSizeDisplay.textContent = size;
                this.setBrushSize(size);
            });
        } else {
            console.error('[ToolsModule] Slider or display not found!');
        }
        
        // Reset button
        if (brushSizeReset) {
            brushSizeReset.addEventListener('click', () => {
                this.selectBrushSize(0);
            });
        }
        
        // Show/hide controls based on current layer
        const updateBrushControlsVisibility = () => {
            if (brushSizeControls) {
                const currentLayer = this.core.getCurrentLayer();
                console.log('[ToolsModule] Current layer:', currentLayer);
                if (currentLayer === 'terrain') {
                    brushSizeControls.style.display = 'block';
                    console.log('[ToolsModule] Showing brush controls');
                } else {
                    brushSizeControls.style.display = 'none';
                    console.log('[ToolsModule] Hiding brush controls');
                }
            } else {
                console.error('[ToolsModule] Brush controls not found!');
            }
        };
        
        // Initialize visibility
        updateBrushControlsVisibility();
        
        // Update visibility when layer changes
        this.core.addObserver({
            onEvent: (event, data) => {
                if (event === 'layerChanged') {
                    updateBrushControlsVisibility();
                }
            }
        });
        
        // Initialize with current brush size from core settings
        if (this.core.settings && this.core.settings.brushSize !== undefined) {
            const currentSize = this.core.settings.brushSize;
            if (brushSizeSlider) brushSizeSlider.value = currentSize;
            if (brushSizeDisplay) brushSizeDisplay.textContent = currentSize;
            console.log('[ToolsModule] Initialized with brush size:', currentSize);
        }
        
        // Pinsel-Buttons
        const brushButtons = document.querySelectorAll('.brush-btn');
        brushButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.target.dataset.size);
                this.selectBrushSize(size);
            });
        });
        
        // Mal-Modi
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.selectMode(mode);
            });
        });
        

        
        // Werkzeug-Aktionen
        const resetViewBtn = document.getElementById('reset-view-btn');
        const centerMapBtn = document.getElementById('center-map-btn');
        
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.resetView());
        }
        
        if (centerMapBtn) {
            centerMapBtn.addEventListener('click', () => this.centerMap());
        }
    }

    selectBrushSize(size) {
        // Aktiven Button markieren
        const brushButtons = document.querySelectorAll('.brush-btn');
        brushButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-size="${size}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        // Slider aktualisieren
        const slider = document.getElementById('brush-size-slider');
        if (slider) slider.value = size;
        
        // Display aktualisieren
        const display = document.getElementById('brush-size-display');
        if (display) display.textContent = size;
        
        // Core-Einstellung aktualisieren
        this.setBrushSize(size);
        
        console.log('[ToolsModule] Brush size selected:', size);
    }

    setBrushSize(size) {
        if (this.core && this.core.settings) {
            // Stelle sicher, dass size eine Zahl ist
            const numericSize = parseInt(size, 10);
            this.core.settings.brushSize = numericSize;
            this.core.notifyObservers('brushSizeChanged', { size: numericSize });
            console.log('[ToolsModule] Brush size set to:', numericSize, '(original:', size, ')');
            
            // Speichere die Einstellungen sofort
            this.core.saveMap();
        }
    }

    selectMode(mode) {
        // Aktiven Button markieren
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-mode="${mode}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        this.currentMode = mode;
        
        // Setze den Mal-Modus im Core
        if (this.core && this.core.settings) {
            this.core.settings.currentMode = mode;
            this.core.notifyObservers('modeChanged', { mode });
        }
        
        console.log('[ToolsModule] Mode changed to:', mode);
        
        ToastManager.showToast(`Modus: ${this.getModeDisplayName(mode)}`, 'info');
    }

    getModeDisplayName(mode) {
        const names = {
            'paint': 'Malen',
            'fill': 'Fläche füllen',
            'line': 'Linie zeichnen',
            'circle': 'Kreis zeichnen'
        };
        return names[mode] || mode;
    }







    resetView() {
        if (this.core && this.core.settings) {
            this.core.settings.zoom = 1;
            this.core.settings.offsetX = 0;
            this.core.settings.offsetY = 0;
            this.core.notifyObservers('viewReset', {});
            ToastManager.showToast('Ansicht zurückgesetzt', 'success');
        }
    }

    centerMap() {
        if (this.core && this.core.settings) {
            // Zentriere die Karte basierend auf den vorhandenen Tiles
            const tiles = Array.from(this.core.tiles.values());
            if (tiles.length > 0) {
                let minQ = Infinity, maxQ = -Infinity;
                let minR = Infinity, maxR = -Infinity;
                
                tiles.forEach(tile => {
                    minQ = Math.min(minQ, tile.position.q);
                    maxQ = Math.max(maxQ, tile.position.q);
                    minR = Math.min(minR, tile.position.r);
                    maxR = Math.max(maxR, tile.position.r);
                });
                
                const centerQ = (minQ + maxQ) / 2;
                const centerR = (minR + maxR) / 2;
                
                // Berechne Offset um die Karte zu zentrieren
                const canvas = document.getElementById('map-canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    // Konvertiere Hex-Koordinaten zu Pixel
                    const hexSize = this.core.settings.hexSize || 30;
                    const pixelX = centerQ * hexSize * Math.sqrt(3);
                    const pixelY = centerR * hexSize * 1.5;
                    
                    this.core.settings.offsetX = centerX - pixelX;
                    this.core.settings.offsetY = centerY - pixelY;
                    
                    this.core.notifyObservers('mapCentered', {});
                    ToastManager.showToast('Karte zentriert', 'success');
                }
            }
        }
    }

    // Hilfsmethoden für externe Aufrufe
    getCurrentMode() {
        return this.currentMode;
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.ToolsModule = ToolsModule;
}
