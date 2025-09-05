// Entferne ES6-Imports und verwende globale Klassen
// import { ToastManager } from '../utils/ToastManager.js';

class SettingsModule {
    constructor(core) {
        this.core = core;
        this.zoomUpdateThrottle = null;
    }

    setupSettingsModule() {
        const settingsContent = document.getElementById('settings-content');
        if (!settingsContent) return;
        settingsContent.innerHTML = `
            <!-- Hex-Größe -->
            <div class="section-header">
                <div class="section-title">Hex-Größe</div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 6px;">Hex-Größe (px):</label>
                <input type="number" id="hex-size-input" min="20" max="100" value="${this.core.settings.hexSize || 60}" style="width: 100%; padding: 4px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px;">
            </div>
        
            <!-- Rotation -->
            <div class="section-header">
                <div class="section-title">Rotation</div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Hex-Rotation (Grad):</label>
                <input type="number" id="rotation-input" min="0" max="360" value="${this.core.settings.rotation || 0}" step="15" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
                <div style="color: #999; font-size: 9px; margin-top: 3px;">0° = Spitze nach oben, 30° = Flach nach oben</div>
            </div>
        
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Layout-Rotation (Grad):</label>
                <input type="number" id="layout-rotation-input" min="0" max="360" value="${this.core.settings.layoutRotation || 0}" step="15" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
                <div style="color: #999; font-size: 9px; margin-top: 3px;">Rotiert das gesamte Grid um den Mittelpunkt</div>
            </div>
        
            <!-- Abstände -->
            <div class="section-header">
                <div class="section-title">Abstände</div>
            </div>
            <div style="margin-bottom: 16px; display: flex; gap: 20px;">
                <div style="width: 80px;">
                    <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">H (px):</label>
                    <input type="number" id="horizontal-spacing-input" min="-50" max="50" value="${this.core.settings.horizontalSpacing || 0}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
                </div>
                <div style="width: 80px;">
                    <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">V (px):</label>
                    <input type="number" id="vertical-spacing-input" min="-50" max="50" value="${this.core.settings.verticalSpacing || 0}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
                </div>
            </div>
        
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Strichstärke (px):</label>
                <input type="number" id="outline-width-input" min="0" max="10" value="${this.core.settings.outlineWidth || 2}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
            </div>
        
            <div style="margin-bottom: 16px; display: flex; gap: 20px;">
                <div style="width: 80px;">
                    <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Zoom:</label>
                    <input type="number" id="zoom-input" min="0.1" max="5" step="0.1" value="${this.core.settings.zoom || 1}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px; display: block;">
                </div>
            </div>
            
            <div style="margin-bottom: 16px; display: flex; gap: 20px;">
                <div style="width: 80px;">
                    <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">X-Pos:</label>
                    <input type="number" id="offset-x-input" step="1" value="${this.core.settings.offsetX || 0}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px; display: block;">
                </div>
                <div style="width: 80px;">
                    <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Y-Pos:</label>
                    <input type="number" id="offset-y-input" step="1" value="${this.core.settings.offsetY || 0}" style="width: 100%; padding: 3px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px; display: block;">
                </div>
            </div>
        

        
            <!-- Anzeige-Einstellungen -->
            <div class="section-header">
                <div class="section-title">Anzeige</div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 11px;">
                    <input type="checkbox" id="show-fps-checkbox" ${this.core.settings.showFPS !== false ? 'checked' : ''}>
                    FPS anzeigen
                </label>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 11px;">
                    <input type="checkbox" id="show-grid-checkbox" ${this.core.settings.showGrid !== false ? 'checked' : ''}>
                    Grid anzeigen
                </label>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 11px;">
                    <input type="checkbox" id="show-coordinates-checkbox" ${this.core.settings.showCoordinates ? 'checked' : ''}>
                    Koordinaten anzeigen
                </label>
            </div>
            
            <!-- Building-Transparenz -->
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Building-Transparenz:</label>
                <input type="range" id="building-transparency-input" min="0" max="1" step="0.1" value="${this.core.settings.buildingTransparency || 0.7}" style="width: 100%;">
                <div style="color: #999; font-size: 9px; margin-top: 3px;">0 = vollständig transparent, 1 = undurchsichtig</div>
            </div>
            
            <!-- Building-Größe -->
            <div style="margin-bottom: 16px;">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Building-Größe: <span id="building-scale-value" style="color: #fff; font-weight: bold;">${Math.round((this.core.settings.buildingScale || 0.8) * 100)}%</span></label>
                <input type="range" id="building-scale-input" min="0.5" max="1.5" step="0.1" value="${this.core.settings.buildingScale || 0.8}" style="width: 100%;">
                <div style="color: #999; font-size: 9px; margin-top: 3px;">0.5 = 50% Größe, 1.0 = 100% Größe, 1.5 = 150% Größe</div>
            </div>
            
            <!-- Native Transparenz -->
            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 11px;">
                    <input type="checkbox" id="use-native-transparency-checkbox" ${this.core.settings.useNativeTransparency !== false ? 'checked' : ''}>
                    Native Transparenz aus Bilddateien verwenden
                </label>
                <div style="color: #999; font-size: 9px; margin-top: 3px;">Verwendet Transparenz-Informationen aus PNG-Dateien</div>
            </div>
            
            <!-- Textur-Auflösung -->
            <div class="section-header">
                <div class="section-title">Textur-Auflösung</div>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 11px;">
                    <input type="checkbox" id="max-texture-resolution-checkbox" ${this.core.settings.maxTextureResolution ? 'checked' : ''}>
                    Maximale Textur-Auflösung begrenzen
                </label>
                <div style="color: #999; font-size: 9px; margin-top: 3px;">Reduziert Speicherverbrauch und verbessert Performance</div>
            </div>
            
            <div id="texture-resolution-dropdown-container" style="margin-bottom: 16px; ${this.core.settings.maxTextureResolution ? '' : 'display: none;'}">
                <label style="display: block; color: #ccc; font-size: 10px; margin-bottom: 4px;">Maximale Auflösung:</label>
                <select id="texture-resolution-dropdown" style="width: 100%; padding: 4px; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px; font-size: 11px;">
                    <option value="16" ${this.core.settings.textureResolutionLimit === 16 ? 'selected' : ''}>16x16 px</option>
                    <option value="32" ${this.core.settings.textureResolutionLimit === 32 ? 'selected' : ''}>32x32 px</option>
                    <option value="64" ${this.core.settings.textureResolutionLimit === 64 ? 'selected' : ''}>64x64 px</option>
                    <option value="256" ${this.core.settings.textureResolutionLimit === 256 ? 'selected' : ''}>256x256 px</option>
                    <option value="512" ${this.core.settings.textureResolutionLimit === 512 ? 'selected' : ''}>512x512 px</option>
                    <option value="1024" ${this.core.settings.textureResolutionLimit === 1024 ? 'selected' : ''}>1024x1024 px</option>
                    <option value="2048" ${this.core.settings.textureResolutionLimit === 2048 ? 'selected' : ''}>2048x2048 px</option>
                </select>
                <div style="color: #999; font-size: 9px; margin-top: 3px;">Größere Texturen werden automatisch skaliert</div>
            </div>
        
            <!-- Aktionen -->
            <div style="margin-top: 20px;">
                <button id="reset-settings-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Zurücksetzen</button>
                <button id="apply-settings-btn" style="font-size: 10px; height: 20px; padding: 2px 6px;">Anwenden</button>
                <button id="save-map-btn" style="font-size: 10px; height: 20px; padding: 2px 6px;">Speichern</button>
                
                <!-- Debug Toggle Button -->
                <button id="debug-toggle-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px; margin-top: 4px; width: 100%;">🐛 Debug Tools ▼</button>
                
                <!-- Debug Buttons Container (versteckt) -->
                <div id="debug-buttons-container" style="display: none; flex-direction: column; gap: 2px; margin-top: 4px;">
                    <button id="reload-map-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Neu laden</button>
                    <button id="clear-map-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Löschen</button>
                    <button id="core-status-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Status</button>
                    <button id="test-core-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Test</button>
                    <button id="force-correct-settings-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Korrigieren</button>
                    <button id="clear-all-storage-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Storage löschen</button>
                    <button id="debug-localstorage-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Debug</button>
                    <button id="analyze-spacing-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Analysieren</button>
                    <button id="fix-spacing-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Reparieren</button>
                    <button id="test-spacing-width-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Testen</button>
                    <button id="force-refresh-ui-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">UI neu laden</button>
                    <button id="repair-storage-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Storage reparieren</button>
                    <button id="monitor-storage-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Überwachen</button>
                    <button id="debug-storage-btn" class="secondary" style="font-size: 10px; height: 20px; padding: 2px 6px;">Debug Storage</button>
                </div>
            </div>
            
            <!-- Map Status Anzeige -->
            <div style="margin-top: 16px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="color: #ccc; font-size: 11px; margin-bottom: 8px;">Map Status:</div>
                <div id="map-status-display" style="color: #fff; font-size: 12px; font-weight: bold;">
                    <span id="map-status-text">Keine Map geladen</span>
                    <span id="map-status-details" style="color: #999; font-weight: normal; margin-left: 8px;"></span>
                </div>
            </div>
        `;
        

        
        this.setupSettingsEventListeners();
        this.setupDebugToggle();
        this.setupZoomObserver();
        
        // Mache SettingsModule global verfügbar für Renderer
        window.settingsModule = this;
    }
    
    setupDebugToggle() {
        const debugToggleBtn = document.getElementById('debug-toggle-btn');
        const debugContainer = document.getElementById('debug-buttons-container');
        
        if (debugToggleBtn && debugContainer) {
            debugToggleBtn.addEventListener('click', () => {
                const isVisible = debugContainer.style.display !== 'none';
                
                if (isVisible) {
                    // Verstecken
                    debugContainer.style.display = 'none';
                    debugToggleBtn.textContent = '🐛 Debug Tools ▼';
                } else {
                    // Anzeigen
                    debugContainer.style.display = 'flex';
                    debugToggleBtn.textContent = '🐛 Debug Tools ▲';
                }
            });
        }
    }
    
    setupZoomObserver() {
        this.zoomUpdateThrottle = null;
        
        // Höre auf Core-Events für Zoom- und Position-Änderungen
        if (this.core) {
            this.core.addObserver({
                onEvent: (event, data) => {
                    if (event === 'settingsChanged' && (data.zoom !== undefined || data.offsetX !== undefined || data.offsetY !== undefined)) {
                        console.log('[SettingsModule] View settings changed via observer:', data);
                        this.scheduleZoomUpdate();
                    }
                }
            });
        }
        
        // Initialisiere die Inputfelder mit den aktuellen Werten
        setTimeout(() => {
            this.updateZoomInput();
        }, 100);
    }
    
    scheduleZoomUpdate() {
        // Throttling für Zoom-Updates
        if (this.zoomUpdateThrottle) {
            clearTimeout(this.zoomUpdateThrottle);
        }
        
        this.zoomUpdateThrottle = setTimeout(() => {
            this.updateZoomInput();
            this.zoomUpdateThrottle = null;
        }, 100); // 100ms Throttling
    }
    
    // Methode die vom Renderer aufgerufen werden kann
    onZoomChanged(newZoom) {
        console.log('[SettingsModule] Direct zoom change notification:', newZoom);
        this.scheduleZoomUpdate();
    }
    
    // Methode für Position-Änderungen
    onPositionChanged(offsetX, offsetY) {
        // console.log('[SettingsModule] Direct position change notification:', { offsetX, offsetY });
        this.scheduleZoomUpdate();
    }
    
    setupSettingsEventListeners() {
        // Hex-Größe
        const hexSizeInput = document.getElementById('hex-size-input');
        if (hexSizeInput) {
            hexSizeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.hexSize = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { hexSize: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Rotation
        const rotationInput = document.getElementById('rotation-input');
        if (rotationInput) {
            rotationInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.rotation = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { rotation: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Layout-Rotation
        const layoutRotationInput = document.getElementById('layout-rotation-input');
        if (layoutRotationInput) {
            layoutRotationInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.layoutRotation = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { layoutRotation: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Horizontaler Abstand
        const horizontalSpacingInput = document.getElementById('horizontal-spacing-input');
        if (horizontalSpacingInput) {
            horizontalSpacingInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.horizontalSpacing = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { horizontalSpacing: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Vertikaler Abstand
        const verticalSpacingInput = document.getElementById('vertical-spacing-input');
        if (verticalSpacingInput) {
            verticalSpacingInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.verticalSpacing = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { verticalSpacing: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Strichstärke
        const outlineWidthInput = document.getElementById('outline-width-input');
        if (outlineWidthInput) {
            outlineWidthInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (this.core && this.core.settings) {
                    this.core.settings.outlineWidth = parseInt(value);
                    this.core.notifyObservers('settingsChanged', { outlineWidth: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Zoom
        const zoomInput = document.getElementById('zoom-input');
        console.log('[SettingsModule] Zoom input found:', !!zoomInput);
        if (zoomInput) {
            console.log('[SettingsModule] Zoom input value:', zoomInput.value);
            zoomInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                console.log('[SettingsModule] Zoom changed to:', value);
                if (this.core && this.core.settings) {
                    this.core.settings.zoom = value;
                    this.core.notifyObservers('settingsChanged', { zoom: value });
                    this.core.saveMap();
                }
            });
            
            // Auch bei Enter-Taste und Blur-Event
            zoomInput.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                console.log('[SettingsModule] Zoom changed via change event:', value);
                if (this.core && this.core.settings) {
                    this.core.settings.zoom = value;
                    this.core.notifyObservers('settingsChanged', { zoom: value });
                    this.core.saveMap();
                }
            });
        } else {
            console.error('[SettingsModule] Zoom input not found!');
        }
        
        // Position Inputs (X und Y)
        const offsetXInput = document.getElementById('offset-x-input');
        if (offsetXInput) {
            offsetXInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (this.core && this.core.settings) {
                    this.core.settings.offsetX = value;
                    this.core.notifyObservers('settingsChanged', { offsetX: value });
                    this.core.saveMap();
                }
            });
            
            offsetXInput.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                if (this.core && this.core.settings) {
                    this.core.settings.offsetX = value;
                    this.core.notifyObservers('settingsChanged', { offsetX: value });
                    this.core.saveMap();
                }
            });
        }
        
        const offsetYInput = document.getElementById('offset-y-input');
        if (offsetYInput) {
            offsetYInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (this.core && this.core.settings) {
                    this.core.settings.offsetY = value;
                    this.core.notifyObservers('settingsChanged', { offsetY: value });
                    this.core.saveMap();
                }
            });
            
            offsetYInput.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                if (this.core && this.core.settings) {
                    this.core.settings.offsetY = value;
                    this.core.notifyObservers('settingsChanged', { offsetY: value });
                    this.core.saveMap();
                }
            });
        }
        

        
        // Checkboxen
        const showFpsCheckbox = document.getElementById('show-fps-checkbox');
        if (showFpsCheckbox) {
            showFpsCheckbox.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    this.core.settings.showFPS = e.target.checked;
                    this.core.notifyObservers('settingsChanged', { showFPS: e.target.checked });
                    this.core.saveMap();
                }
            });
        }
        
        const showGridCheckbox = document.getElementById('show-grid-checkbox');
        if (showGridCheckbox) {
            showGridCheckbox.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    this.core.settings.showGrid = e.target.checked;
                    this.core.notifyObservers('settingsChanged', { showGrid: e.target.checked });
                    this.core.saveMap();
                }
            });
        }
        
        const showCoordinatesCheckbox = document.getElementById('show-coordinates-checkbox');
        if (showCoordinatesCheckbox) {
            showCoordinatesCheckbox.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    this.core.settings.showCoordinates = e.target.checked;
                    this.core.notifyObservers('settingsChanged', { showCoordinates: e.target.checked });
                    this.core.saveMap();
                }
            });
        }
        
        // Building-Transparenz
        const buildingTransparencyInput = document.getElementById('building-transparency-input');
        if (buildingTransparencyInput) {
            buildingTransparencyInput.addEventListener('input', (e) => {
                if (this.core && this.core.settings) {
                    const value = parseFloat(e.target.value);
                    this.core.settings.buildingTransparency = value;
                    this.core.notifyObservers('settingsChanged', { buildingTransparency: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Building-Größe
        const buildingScaleInput = document.getElementById('building-scale-input');
        if (buildingScaleInput) {
            buildingScaleInput.addEventListener('input', (e) => {
                if (this.core && this.core.settings) {
                    const value = parseFloat(e.target.value);
                    this.core.settings.buildingScale = value;
                    this.core.notifyObservers('settingsChanged', { buildingScale: value });
                    this.core.saveMap();
                    
                    // Aktualisiere die Wertanzeige
                    const valueDisplay = document.getElementById('building-scale-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = Math.round(value * 100) + '%';
                    }
                }
            });
        }
        
        // Native Transparenz
        const useNativeTransparencyCheckbox = document.getElementById('use-native-transparency-checkbox');
        if (useNativeTransparencyCheckbox) {
            useNativeTransparencyCheckbox.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    this.core.settings.useNativeTransparency = e.target.checked;
                    this.core.notifyObservers('settingsChanged', { useNativeTransparency: e.target.checked });
                    this.core.saveMap();
                }
            });
        }
        
        // Textur-Auflösung Checkbox
        const maxTextureResolutionCheckbox = document.getElementById('max-texture-resolution-checkbox');
        if (maxTextureResolutionCheckbox) {
            maxTextureResolutionCheckbox.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    this.core.settings.maxTextureResolution = e.target.checked;
                    this.core.notifyObservers('settingsChanged', { maxTextureResolution: e.target.checked });
                    this.core.saveMap();
                    
                    // Zeige/verstecke Dropdown basierend auf Checkbox-Status
                    const dropdownContainer = document.getElementById('texture-resolution-dropdown-container');
                    if (dropdownContainer) {
                        dropdownContainer.style.display = e.target.checked ? 'block' : 'none';
                    }
                }
            });
        }
        
        // Textur-Auflösung Dropdown
        const textureResolutionDropdown = document.getElementById('texture-resolution-dropdown');
        if (textureResolutionDropdown) {
            textureResolutionDropdown.addEventListener('change', (e) => {
                if (this.core && this.core.settings) {
                    const value = parseInt(e.target.value);
                    this.core.settings.textureResolutionLimit = value;
                    this.core.notifyObservers('settingsChanged', { textureResolutionLimit: value });
                    this.core.saveMap();
                }
            });
        }
        
        // Buttons
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetSettingsToDefaults();
            });
        }
        
        const applySettingsBtn = document.getElementById('apply-settings-btn');
        if (applySettingsBtn) {
            applySettingsBtn.addEventListener('click', () => {
                this.applySettings();
            });
        }
        
        // Save Map Button
        const saveMapBtn = document.getElementById('save-map-btn');
        if (saveMapBtn) {
            saveMapBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                setTimeout(() => {
                    if (this.core && typeof this.core.forceSaveMap === 'function') {
                        try {
                            const success = this.core.forceSaveMap();
                            if (success) {
                                ToastManager.showToast('Map wurde erfolgreich gespeichert!', 'success');
                            } else {
                                ToastManager.showToast('Fehler beim Speichern der Map!', 'error');
                            }
                        } catch (error) {
                            console.error('[SettingsModule] Error calling forceSaveMap:', error);
                            ToastManager.showToast('Fehler beim Speichern: ' + error.message, 'error');
                        }
                    } else {
                        console.error('[SettingsModule] forceSaveMap function not available');
                        ToastManager.showToast('Speichern-Funktion nicht verfügbar!', 'error');
                    }
                }, 200);
            });
        }
        
        // Reload Map Button
        const reloadMapBtn = document.getElementById('reload-map-btn');
        if (reloadMapBtn) {
            reloadMapBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                setTimeout(() => {
                    if (this.core && typeof this.core.reloadMap === 'function') {
                        try {
                            const success = this.core.reloadMap();
                            if (success) {
                                ToastManager.showToast('Map wurde erfolgreich neu geladen!', 'success');
                            } else {
                                ToastManager.showToast('Fehler beim Laden der Map!', 'error');
                            }
                        } catch (error) {
                            console.error('[SettingsModule] Error calling reloadMap:', error);
                            ToastManager.showToast('Fehler beim Laden: ' + error.message, 'error');
                        }
                    } else {
                        console.error('[SettingsModule] reloadMap function not available');
                        ToastManager.showToast('Neu laden-Funktion nicht verfügbar!', 'error');
                    }
                }, 200);
            });
        }
        
        // Clear Map Button
        const clearMapBtn = document.getElementById('clear-map-btn');
        if (clearMapBtn) {
            clearMapBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    alert('Core nicht verfügbar!');
                    return;
                }
                
                if (confirm('Möchtest du wirklich alle Map-Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
                    if (this.core.clearMap) {
                        this.core.clearMap();
                        ToastManager.showToast('Map wurde gelöscht!', 'success');
                    } else {
                        console.error('[SettingsModule] clearMap function not available');
                        ToastManager.showToast('Löschen-Funktion nicht verfügbar!', 'error');
                    }
                }
            });
        }
        
        // Core Status Button
        const coreStatusBtn = document.getElementById('core-status-btn');
        if (coreStatusBtn) {
            coreStatusBtn.addEventListener('click', () => {
                const status = this.checkCoreStatus();
                console.log('[SettingsModule] Core status:', status);
                
                let statusText = `Core Status:\n\nCore existiert: ${status.coreExists ? 'Ja' : 'Nein'}\n\nVerfügbare Funktionen:\n- forceSaveMap: ${status.coreFunctions.forceSaveMap ? 'Ja' : 'Nein'}\n- reloadMap: ${status.coreFunctions.reloadMap ? 'Ja' : 'Nein'}\n- clearMap: ${status.coreFunctions.clearMap ? 'Ja' : 'Nein'}\n- debugStorage: ${status.coreFunctions.debugStorage ? 'Ja' : 'Nein'}\n- saveMap: ${status.coreFunctions.saveMap ? 'Ja' : 'Nein'}\n- repairLocalStorage: ${status.coreFunctions.repairLocalStorage ? 'Ja' : 'Nein'}\n- monitorLocalStorage: ${status.coreFunctions.monitorLocalStorage ? 'Ja' : 'Nein'}\n\nSettings: ${status.settings ? 'Verfügbar' : 'Nicht verfügbar'}`;
                
                ToastManager.showToast(`Core Status: ${status.coreExists ? 'Verfügbar' : 'Nicht verfügbar'}`, status.coreExists ? 'success' : 'error');
                console.log('[SettingsModule] Core status details:', statusText);
            });
        }
        
        // Force Correct Settings Button
        const forceCorrectSettingsBtn = document.getElementById('force-correct-settings-btn');
        if (forceCorrectSettingsBtn) {
            forceCorrectSettingsBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.forceCorrectSettings) {
                    try {
                        this.core.forceCorrectSettings();
                        ToastManager.showToast('Settings wurden korrigiert!', 'success');
                        
                        // Refresh the settings module to show corrected values
                        setTimeout(() => {
                            this.setupSettingsModule();
                        }, 100);
                    } catch (error) {
                        console.error('[SettingsModule] Error calling forceCorrectSettings:', error);
                        ToastManager.showToast('Fehler beim Korrigieren: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] forceCorrectSettings function not available');
                    ToastManager.showToast('Korrigieren-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Force Refresh UI Button
        const forceRefreshUiBtn = document.getElementById('force-refresh-ui-btn');
        if (forceRefreshUiBtn) {
            forceRefreshUiBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.forceRefreshSettingsUI) {
                    try {
                        this.core.forceRefreshSettingsUI();
                        ToastManager.showToast('UI wurde neu geladen!', 'success');
                    } catch (error) {
                        console.error('[SettingsModule] Error calling forceRefreshSettingsUI:', error);
                        ToastManager.showToast('Fehler beim Neuladen: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] forceRefreshSettingsUI function not available');
                    ToastManager.showToast('Neuladen-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Analyze Spacing Button
        const analyzeSpacingBtn = document.getElementById('analyze-spacing-btn');
        if (analyzeSpacingBtn) {
            analyzeSpacingBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.analyzeHorizontalSpacingIssue) {
                    try {
                        const analysis = this.core.analyzeHorizontalSpacingIssue();
                        console.log('[SettingsModule] Spacing analysis result:', analysis);
                        
                        let analysisText = `Spacing Analyse:\n\n`;
                        analysisText += `Aktueller Wert: ${analysis.currentValue}\n`;
                        analysisText += `UI Wert: ${analysis.uiValue}\n`;
                        analysisText += `localStorage Wert: ${analysis.localStorageValue}\n`;
                        analysisText += `Standardwert: ${analysis.defaultValue}`;
                        
                        ToastManager.showToast('Spacing Analyse abgeschlossen', 'success');
                        console.log('[SettingsModule] Spacing analysis details:', analysisText);
                    } catch (error) {
                        console.error('[SettingsModule] Error calling analyzeHorizontalSpacingIssue:', error);
                        ToastManager.showToast('Fehler bei der Analyse: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] analyzeHorizontalSpacingIssue function not available');
                    ToastManager.showToast('Analyse-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Fix Spacing Button
        const fixSpacingBtn = document.getElementById('fix-spacing-btn');
        if (fixSpacingBtn) {
            fixSpacingBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.fixHorizontalSpacingIssue) {
                    try {
                        const result = this.core.fixHorizontalSpacingIssue();
                        console.log('[SettingsModule] Spacing fix result:', result);
                        
                        if (result.success) {
                            ToastManager.showToast('Spacing Problem wurde repariert!', 'success');
                            
                            // Refresh the settings module to show corrected values
                            setTimeout(() => {
                                this.setupSettingsModule();
                            }, 100);
                        } else {
                            ToastManager.showToast('Spacing Problem konnte nicht repariert werden', 'error');
                        }
                    } catch (error) {
                        console.error('[SettingsModule] Error calling fixHorizontalSpacingIssue:', error);
                        ToastManager.showToast('Fehler beim Reparieren: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] fixHorizontalSpacingIssue function not available');
                    ToastManager.showToast('Reparieren-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Test Spacing Width Button
        const testSpacingWidthBtn = document.getElementById('test-spacing-width-btn');
        if (testSpacingWidthBtn) {
            testSpacingWidthBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.testTileSpacingWidth) {
                    try {
                        const result = this.core.testTileSpacingWidth();
                        console.log('[SettingsModule] Spacing width test result:', result);
                        ToastManager.showToast('Strichstärke-Test gestartet - schaue in die Konsole!', 'success');
                    } catch (error) {
                        console.error('[SettingsModule] Error calling testTileSpacingWidth:', error);
                        ToastManager.showToast('Fehler beim Testen: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] testTileSpacingWidth function not available');
                    ToastManager.showToast('Test-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Debug LocalStorage Button
        const debugLocalStorageBtn = document.getElementById('debug-localstorage-btn');
        if (debugLocalStorageBtn) {
            debugLocalStorageBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (this.core.debugLocalStorage) {
                    try {
                        const debugInfo = this.core.debugLocalStorage();
                        console.log('[SettingsModule] localStorage debug info:', debugInfo);
                        
                        let debugText = `localStorage Debug:\n\n`;
                        debugText += `mapEditorData: ${debugInfo.mapEditorData ? '✓' : '✗'}\n`;
                        debugText += `mapEditorSettings: ${debugInfo.mapEditorSettings ? '✓' : '✗'}\n\n`;
                        debugText += `Current Settings:\n`;
                        debugText += `- horizontalSpacing: ${debugInfo.currentSettings.horizontalSpacing}\n`;
                        debugText += `- verticalSpacing: ${debugInfo.currentSettings.verticalSpacing}\n`;
                        debugText += `- tileSpacingWidth: ${debugInfo.currentSettings.tileSpacingWidth}`;
                        
                        ToastManager.showToast('localStorage Debug abgeschlossen', 'success');
                        console.log('[SettingsModule] localStorage debug details:', debugText);
                    } catch (error) {
                        console.error('[SettingsModule] Error calling debugLocalStorage:', error);
                        ToastManager.showToast('Fehler beim Debuggen: ' + error.message, 'error');
                    }
                } else {
                    console.error('[SettingsModule] debugLocalStorage function not available');
                    ToastManager.showToast('Debug-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Clear All Storage Button
        const clearAllStorageBtn = document.getElementById('clear-all-storage-btn');
        if (clearAllStorageBtn) {
            clearAllStorageBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    ToastManager.showToast('Core nicht verfügbar!', 'error');
                    return;
                }
                
                if (confirm('Möchtest du wirklich ALLE localStorage-Daten löschen? Dies wird alle gespeicherten Maps und Einstellungen unwiderruflich löschen!')) {
                    if (this.core.clearAllStorage) {
                        try {
                            this.core.clearAllStorage();
                            ToastManager.showToast('Alle localStorage-Daten wurden gelöscht!', 'success');
                            
                            // Refresh the settings module to show default values
                            setTimeout(() => {
                                this.setupSettingsModule();
                            }, 100);
                        } catch (error) {
                            console.error('[SettingsModule] Error calling clearAllStorage:', error);
                            ToastManager.showToast('Fehler beim Löschen: ' + error.message, 'error');
                        }
                    } else {
                        console.error('[SettingsModule] clearAllStorage function not available');
                        ToastManager.showToast('Löschen-Funktion nicht verfügbar!', 'error');
                    }
                }
            });
        }
        
        // Test Core Button
        const testCoreBtn = document.getElementById('test-core-btn');
        if (testCoreBtn) {
            testCoreBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    alert('Core nicht verfügbar!');
                    return;
                }
                
                if (this.core.testCoreStatus) {
                    const coreStatus = this.core.testCoreStatus();
                    console.log('[SettingsModule] Core test result:', coreStatus);
                    
                    let statusText = `Core Test Ergebnis:\n\n`;
                    statusText += `Core-Typ: ${coreStatus.coreType}\n`;
                    statusText += `Ist MapCore: ${coreStatus.isMapCore ? '✓' : '✗'}\n`;
                    statusText += `Hat Tiles: ${coreStatus.hasTiles ? '✓' : '✗'}\n`;
                    statusText += `Tiles-Typ: ${coreStatus.tilesType}\n`;
                    statusText += `Tiles-Größe: ${coreStatus.tilesSize}\n`;
                    statusText += `Hat Settings: ${coreStatus.hasSettings ? '✓' : '✗'}\n`;
                    statusText += `Settings-Typ: ${coreStatus.settingsType}\n\n`;
                    
                    statusText += `Funktionen:\n`;
                    statusText += `- saveMap: ${coreStatus.functions.saveMap ? '✓' : '✗'}\n`;
                    statusText += `- forceSaveMap: ${coreStatus.functions.forceSaveMap ? '✓' : '✗'}\n`;
                    statusText += `- reloadMap: ${coreStatus.functions.reloadMap ? '✓' : '✗'}\n`;
                    statusText += `- clearMap: ${coreStatus.functions.clearMap ? '✓' : '✗'}\n`;
                    statusText += `- debugStorage: ${coreStatus.functions.debugStorage ? '✓' : '✗'}\n`;
                    statusText += `- repairLocalStorage: ${coreStatus.functions.repairLocalStorage ? '✓' : '✗'}\n`;
                    statusText += `- monitorLocalStorage: ${coreStatus.functions.monitorLocalStorage ? '✓' : '✗'}`;
                    
                    if (coreStatus.error) {
                        statusText += `\n\nFehler: ${coreStatus.error}`;
                    }
                    
                    ToastManager.showToast(`Core Test: ${coreStatus.isMapCore ? 'Erfolgreich' : 'Fehlgeschlagen'}`, coreStatus.isMapCore ? 'success' : 'error');
                    console.log('[SettingsModule] Core test details:', statusText);
                } else {
                    console.error('[SettingsModule] testCoreStatus function not available');
                    ToastManager.showToast('Test-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Repair Storage Button
        const repairStorageBtn = document.getElementById('repair-storage-btn');
        if (repairStorageBtn) {
            repairStorageBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    alert('Core nicht verfügbar!');
                    return;
                }
                
                if (this.core.repairLocalStorage) {
                    const success = this.core.repairLocalStorage();
                    if (success) {
                        ToastManager.showToast('localStorage wurde erfolgreich repariert!', 'success');
                    } else {
                        ToastManager.showToast('Fehler beim Reparieren des localStorage!', 'error');
                    }
                } else {
                    console.error('[SettingsModule] repairLocalStorage function not available');
                    ToastManager.showToast('Reparieren-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Monitor Storage Button
        const monitorStorageBtn = document.getElementById('monitor-storage-btn');
        if (monitorStorageBtn) {
            monitorStorageBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    alert('Core nicht verfügbar!');
                    return;
                }
                
                if (this.core.monitorLocalStorage) {
                    const success = this.core.monitorLocalStorage();
                    if (success) {
                        ToastManager.showToast('localStorage-Überwachung wurde aktiviert!', 'success');
                    } else {
                        ToastManager.showToast('Fehler beim Aktivieren der localStorage-Überwachung!', 'error');
                    }
                } else {
                    console.error('[SettingsModule] monitorLocalStorage function not available');
                    ToastManager.showToast('Überwachungs-Funktion nicht verfügbar!', 'error');
                }
            });
        }
        
        // Debug Storage Button
        const debugStorageBtn = document.getElementById('debug-storage-btn');
        if (debugStorageBtn) {
            debugStorageBtn.addEventListener('click', () => {
                if (!this.isCoreAvailable()) {
                    alert('Core nicht verfügbar!');
                    return;
                }
                
                if (this.core.debugStorage) {
                    const debugInfo = this.core.debugStorage();
                    console.log('[SettingsModule] Storage debug info:', debugInfo);
                    
                    let debugText = `Storage Debug:\n\n`;
                    debugText += `Map-Daten: ${debugInfo.mapData ? 'Ja' : 'Nein'}\n`;
                    debugText += `Settings: ${debugInfo.settingsData ? 'Ja' : 'Nein'}\n`;
                    debugText += `localStorage funktioniert: ${debugInfo.localStorageWorking ? 'Ja' : 'Nein'}\n`;
                    debugText += `Aktuelle Tiles: ${debugInfo.currentTilesCount || 0}\n`;
                    
                    if (debugInfo.totalStorageSize !== undefined) {
                        debugText += `Gesamtgröße: ${debugInfo.totalStorageSize} Zeichen\n`;
                        debugText += `Quota: ~5-10 MB\n`;
                    }
                    
                    if (debugInfo.coreFunctions) {
                        debugText += `\nCore-Funktionen:\n`;
                        debugText += `- saveMap: ${debugInfo.coreFunctions.saveMap ? '✓' : '✗'}\n`;
                        debugText += `- forceSaveMap: ${debugInfo.coreFunctions.forceSaveMap ? '✓' : '✗'}\n`;
                        debugText += `- reloadMap: ${debugInfo.coreFunctions.reloadMap ? '✓' : '✗'}\n`;
                        debugText += `- clearMap: ${debugInfo.coreFunctions.clearMap ? '✓' : '✗'}\n`;
                        debugText += `- repairLocalStorage: ${debugInfo.coreFunctions.repairLocalStorage ? '✓' : '✗'}\n`;
                        debugText += `- monitorLocalStorage: ${debugInfo.coreFunctions.monitorLocalStorage ? '✓' : '✗'}\n`;
                    }
                    
                    if (debugInfo.coreInstance) {
                        debugText += `\nCore-Instanz:\n`;
                        debugText += `- Konstruktor: ${debugInfo.coreInstance.constructor}\n`;
                        debugText += `- Ist MapCore: ${debugInfo.coreInstance.isMapCore ? '✓' : '✗'}\n`;
                        debugText += `- Tiles ist Map: ${debugInfo.coreInstance.tilesType ? '✓' : '✗'}\n`;
                        debugText += `- Settings ist MapSettings: ${debugInfo.coreInstance.settingsType ? '✓' : '✗'}`;
                    }
                    
                    if (debugInfo.error) {
                        debugText += `\n\nFehler: ${debugInfo.error}`;
                    }
                    
                    ToastManager.showToast(`Storage Debug: ${debugInfo.mapData ? 'Map gefunden' : 'Keine Map'}`, debugInfo.mapData ? 'success' : 'warning');
                    console.log('[SettingsModule] Storage debug details:', debugText);
                } else {
                    console.error('[SettingsModule] debugStorage function not available');
                    ToastManager.showToast('Debug-Funktion nicht verfügbar!', 'error');
                }
            });
        }
    }
    
    resetSettingsToDefaults() {
        if (confirm('Möchtest du alle Einstellungen auf Standardwerte zurücksetzen?')) {
            if (this.core && this.core.settings) {
                this.core.settings.hexSize = 60;
                this.core.settings.rotation = 0;
                this.core.settings.layoutRotation = 0;
                this.core.settings.horizontalSpacing = 0;
                this.core.settings.verticalSpacing = 0;
                this.core.settings.outlineWidth = 2;
                this.core.settings.tileSpacingWidth = 1;
                this.core.settings.brushSize = 3;
                this.core.settings.toolStrength = 50;
                this.core.settings.toolRadius = 5;
                this.core.settings.selectedBrush = 'single';
                this.core.settings.selectedTerrainTool = null;
                this.core.settings.selectedSpecialTool = null;
                this.core.settings.showFPS = true;
                this.core.settings.showGrid = true;
                this.core.settings.showCoordinates = false;
                
                this.core.notifyObservers('settingsChanged', { reset: true });
                this.setupSettingsModule();
            }
        }
    }
    
    applySettings() {
        if (this.core && this.core.settings) {
            // Lese alle Eingabefelder aus und aktualisiere die Settings
            const hexSizeInput = document.getElementById('hex-size-input');
            if (hexSizeInput) {
                this.core.settings.hexSize = parseInt(hexSizeInput.value);
            }
            
            const rotationInput = document.getElementById('rotation-input');
            if (rotationInput) {
                this.core.settings.rotation = parseInt(rotationInput.value);
            }
            
            const layoutRotationInput = document.getElementById('layout-rotation-input');
            if (layoutRotationInput) {
                this.core.settings.layoutRotation = parseInt(layoutRotationInput.value);
            }
            
            const horizontalSpacingInput = document.getElementById('horizontal-spacing-input');
            if (horizontalSpacingInput) {
                this.core.settings.horizontalSpacing = parseInt(horizontalSpacingInput.value);
            }
            
            const verticalSpacingInput = document.getElementById('vertical-spacing-input');
            if (verticalSpacingInput) {
                this.core.settings.verticalSpacing = parseInt(verticalSpacingInput.value);
            }
            
            const outlineWidthInput = document.getElementById('outline-width-input');
            if (outlineWidthInput) {
                this.core.settings.outlineWidth = parseInt(outlineWidthInput.value);
            }
            
            const zoomInput = document.getElementById('zoom-input');
            if (zoomInput) {
                this.core.settings.zoom = parseFloat(zoomInput.value);
            }
            
            // Checkboxen
            const showFpsCheckbox = document.getElementById('show-fps-checkbox');
            if (showFpsCheckbox) {
                this.core.settings.showFPS = showFpsCheckbox.checked;
            }
            
            const showGridCheckbox = document.getElementById('show-grid-checkbox');
            if (showGridCheckbox) {
                this.core.settings.showGrid = showGridCheckbox.checked;
            }
            
            const showCoordinatesCheckbox = document.getElementById('show-coordinates-checkbox');
            if (showCoordinatesCheckbox) {
                this.core.settings.showCoordinates = showCoordinatesCheckbox.checked;
            }
            
            // Benachrichtige Observer und speichere
            this.core.notifyObservers('settingsChanged', { applied: true });
            this.core.saveMap();
            ToastManager.showToast('Einstellungen wurden angewendet und gespeichert!', 'success');
        }
    }

    isCoreAvailable() {
        if (!this.core) {
            console.error('[SettingsModule] Core is not available');
            return false;
        }
        
        if (!this.core.tiles || !this.core.settings) {
            console.warn('[SettingsModule] Core not fully initialized yet');
            return false;
        }
        
        return true;
    }
    
    checkCoreStatus() {
        const status = {
            coreExists: !!this.core,
            coreFunctions: {},
            settings: null
        };
        
        if (this.core) {
            status.coreFunctions.forceSaveMap = typeof this.core.forceSaveMap === 'function';
            status.coreFunctions.reloadMap = typeof this.core.reloadMap === 'function';
            status.coreFunctions.clearMap = typeof this.core.clearMap === 'function';
            status.coreFunctions.debugStorage = typeof this.core.debugStorage === 'function';
            status.coreFunctions.saveMap = typeof this.core.saveMap === 'function';
            status.coreFunctions.repairLocalStorage = typeof this.core.repairLocalStorage === 'function';
            status.coreFunctions.monitorLocalStorage = typeof this.core.monitorLocalStorage === 'function';
            status.coreFunctions.testCoreStatus = typeof this.core.testCoreStatus === 'function';
            status.settings = this.core.settings;
        }
        
        return status;
    }
    
    updateZoomInput() {
        // Asynchrone Aktualisierung mit Verzögerung
        setTimeout(() => {
            const zoomInput = document.getElementById('zoom-input');
            if (zoomInput && this.core && this.core.settings) {
                zoomInput.value = this.core.settings.zoom.toFixed(3);
                // console.log('[SettingsModule] Updated zoom input to:', this.core.settings.zoom);
            }
            
            // Aktualisiere auch die Position-Inputfelder
            const offsetXInput = document.getElementById('offset-x-input');
            if (offsetXInput && this.core && this.core.settings) {
                offsetXInput.value = Math.round(this.core.settings.offsetX);
            }
            
            const offsetYInput = document.getElementById('offset-y-input');
            if (offsetYInput && this.core && this.core.settings) {
                offsetYInput.value = Math.round(this.core.settings.offsetY);
            }
        }, 50); // 50ms Verzögerung für asynchrone Aktualisierung
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.SettingsModule = SettingsModule;
}
