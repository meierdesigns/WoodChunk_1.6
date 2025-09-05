/**
 * MapsModule - Handles saving and loading complete maps
 */
class MapsModule {
    constructor(core) {
        this.core = core;
        this.savedMaps = [];
        this.currentMapName = '';
        this.autoSaveInterval = null;
        
        console.log('[MapsModule] Initialized');
    }
    
    setupMapsModule() {
        console.log('[MapsModule] Setting up maps module...');
        
        // Erstelle das Modal
        this.createMapsModal();
        
        // Füge den Maps-Button zum Header hinzu
        this.addMapsButtonToHeader();
        
        console.log('[MapsModule] Maps module setup complete');
    }
    
    createMapsModal() {
        // Entferne bestehendes Modal und Backdrop falls vorhanden
        const existingModal = document.getElementById('maps-modal');
        const existingBackdrop = document.getElementById('maps-modal-backdrop');
        if (existingModal) {
            existingModal.remove();
        }
        if (existingBackdrop) {
            existingBackdrop.remove();
        }
        
        // Erstelle Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'maps-modal-backdrop';
        backdrop.className = 'maps-modal-backdrop';
        backdrop.style.display = 'none';
        
        // Erstelle Modal-Container
        const modal = document.createElement('div');
        modal.id = 'maps-modal';
        modal.className = 'maps-modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        
        // Setze initiale Zentrierung
        this.centerModal(modal);
        
        modal.innerHTML = `
            <div class="maps-modal-content">
                <div class="maps-modal-header" id="maps-modal-drag-handle">
                    <h2>🗺️ Maps Manager</h2>
                    <button class="maps-modal-close" id="maps-modal-close">&times;</button>
                </div>
                
                <div class="maps-modal-body">
                    <div class="maps-controls">
                        <div class="map-name-input">
                            <input type="text" id="map-name-input" placeholder="Map-Name eingeben..." maxlength="50">
                            <button id="save-map-btn" class="btn-primary" title="Aktuelle Map speichern">💾 Speichern</button>
                        </div>
                        
                        <div class="maps-actions">
                            <button id="export-maps-btn" class="btn-secondary" title="Alle Maps exportieren">📤 Exportieren</button>
                            <button id="import-maps-btn" class="btn-secondary" title="Maps importieren">📥 Importieren</button>
                        </div>
                    </div>
                    
                    <div class="saved-maps-list" id="saved-maps-list">
                        <!-- Wird dynamisch gefüllt -->
                    </div>
                    
                    <div class="maps-info">
                        <small>💡 Maps werden als vollständige Karten mit allen Tiles und Einstellungen gespeichert</small>
                    </div>
                </div>
            </div>
        `;
        
        // Füge Backdrop und Modal zum Body hinzu
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        
        // Event-Listener für Modal schließen
        const closeBtn = document.getElementById('maps-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideMapsModal());
        }
        
        // Schließe Modal beim Klick außerhalb (nach dem Hinzufügen zum DOM)
        setTimeout(() => {
            // Schließe Modal beim Klick außerhalb
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideMapsModal();
                }
            });
            
            // Zusätzlicher Event-Listener für Backdrop
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.hideMapsModal();
                }
            });
        }, 0);
        
        // ESC-Taste schließt Modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.hideMapsModal();
            }
        });
        
        // Maus-Tracking für Modal-Positionierung
        document.addEventListener('mousemove', (e) => {
            window.lastMouseX = e.clientX;
            window.lastMouseY = e.clientY;
        });
        
        // Drag-Funktionalität für Modal
        this.setupModalDrag(modal);
        
        // Event-Listener für alle Buttons setzen
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
        
        // Zusätzliche Event-Listener direkt setzen
        this.setupDirectEventListeners();
    }
    
    setupModalDrag(modal) {
        const dragHandle = document.getElementById('maps-modal-drag-handle');
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('maps-modal-close')) return;
            
            isDragging = true;
            const rect = modal.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            dragHandle.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const left = e.clientX - dragOffset.x;
            const top = e.clientY - dragOffset.y;
            
            // Begrenze auf Viewport
            const maxLeft = window.innerWidth - modal.offsetWidth - 20;
            const maxTop = window.innerHeight - modal.offsetHeight - 20;
            
            modal.style.left = Math.max(20, Math.min(left, maxLeft)) + 'px';
            modal.style.top = Math.max(20, Math.min(top, maxTop)) + 'px';
            modal.style.transform = 'none';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
            }
        });
    }
    
    addMapsButtonToHeader() {
        // Suche nach dem Header oder einer passenden Stelle
        const header = document.querySelector('.header, header, .main-header, .toolbar');
        if (!header) {
            console.warn('[MapsModule] Header not found, adding to body');
            document.body.insertAdjacentHTML('afterbegin', `
                <div class="maps-header-button-container" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">
                    <button id="open-maps-btn" class="btn-primary" style="padding: 8px 16px; font-size: 14px;">
                        🗺️ Maps
                    </button>
                </div>
            `);
        } else {
            // Füge Button zum Header hinzu
            const mapsBtn = document.createElement('button');
            mapsBtn.id = 'open-maps-btn';
            mapsBtn.className = 'btn-primary';
            mapsBtn.innerHTML = '🗺️ Maps';
            mapsBtn.style.marginLeft = '10px';
            
            header.appendChild(mapsBtn);
        }
        
        // Event-Listener für Maps-Button
        const openMapsBtn = document.getElementById('open-maps-btn');
        if (openMapsBtn) {
            openMapsBtn.addEventListener('click', () => this.showMapsModal());
        }
    }
    
    showMapsModal() {
        const modal = document.getElementById('maps-modal');
        const backdrop = document.getElementById('maps-modal-backdrop');
        if (modal && backdrop) {
            // Zeige Backdrop und Modal
            backdrop.style.display = 'block';
            modal.style.display = 'block';
            
            // Sofort zentrieren
            this.centerModal(modal);
            
            // Warte kurz bis das Modal gerendert ist, dann erneut zentrieren
            setTimeout(() => {
                this.centerModal(modal);
                
                // Position Modal am Mauszeiger falls verfügbar
                if (window.lastMouseX && window.lastMouseY) {
                    this.positionModalAtMouse(modal);
                }
            }, 50);
            
            // Zusätzliche Zentrierung nach längerer Verzögerung
            setTimeout(() => {
                this.centerModal(modal);
            }, 200);
            
            this.loadSavedMaps();
            
            // Fokus auf Input setzen
            const mapNameInput = document.getElementById('map-name-input');
            if (mapNameInput) {
                mapNameInput.focus();
            }
        }
    }
    
    centerModal(modal) {
        // Zentriere Modal in der Mitte des Viewports
        const modalWidth = 600;
        const modalHeight = 500;
        
        // Verwende getBoundingClientRect für präzise Positionierung
        const rect = modal.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Berechne Zentrum
        const left = Math.max(0, (viewportWidth - modalWidth) / 2);
        const top = Math.max(0, (viewportHeight - modalHeight) / 2);
        
        // Setze Position mit !important über CSS
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '50%', 'important');
        modal.style.setProperty('left', '50%', 'important');
        modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        modal.style.setProperty('margin', '0', 'important');
        
        // Zusätzlich: Setze explizite Pixel-Werte als Fallback
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        
        console.log('[MapsModule] Modal centered at:', { left, top, viewportWidth, viewportHeight });
    }
    
    positionModalAtMouse(modal) {
        // Hole aktuelle Mausposition
        const mouseX = window.lastMouseX || window.innerWidth / 2;
        const mouseY = window.lastMouseY || window.innerHeight / 2;
        
        // Modal-Dimensionen
        const modalWidth = 600;
        const modalHeight = 500;
        
        // Berechne Position (Modal soll nicht aus dem Viewport ragen)
        let left = mouseX - modalWidth / 2;
        let top = mouseY - modalHeight / 2;
        
        // Begrenze auf Viewport
        if (left < 20) left = 20;
        if (top < 20) top = 20;
        if (left + modalWidth > window.innerWidth - 20) {
            left = window.innerWidth - modalWidth - 20;
        }
        if (top + modalHeight > window.innerHeight - 20) {
            top = window.innerHeight - modalHeight - 20;
        }
        
        // Setze Position
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        modal.style.transform = 'none';
        
        console.log('[MapsModule] Modal positioned at:', { left, top, mouseX, mouseY });
    }
    
    hideMapsModal() {
        const modal = document.getElementById('maps-modal');
        const backdrop = document.getElementById('maps-modal-backdrop');
        if (modal) {
            modal.style.display = 'none';
        }
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        console.log('[MapsModule] Setting up event listeners...');
        
        // Map-Name Input
        const mapNameInput = document.getElementById('map-name-input');
        if (mapNameInput) {
            console.log('[MapsModule] Found map-name-input, setting up listeners');
            mapNameInput.addEventListener('input', (e) => {
                this.currentMapName = e.target.value.trim();
                console.log('[MapsModule] Map name updated:', this.currentMapName);
            });
            
            mapNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('[MapsModule] Enter pressed, saving map');
                    this.saveCurrentMap();
                }
            });
        } else {
            console.warn('[MapsModule] map-name-input not found');
        }
        
        // Speichern-Button
        const saveMapBtn = document.getElementById('save-map-btn');
        if (saveMapBtn) {
            console.log('[MapsModule] Found save-map-btn, setting up listener');
            saveMapBtn.addEventListener('click', () => {
                console.log('[MapsModule] Save button clicked');
                this.saveCurrentMap();
            });
        } else {
            console.warn('[MapsModule] save-map-btn not found');
        }
        
        // Export-Button
        const exportMapsBtn = document.getElementById('export-maps-btn');
        if (exportMapsBtn) {
            console.log('[MapsModule] Found export-maps-btn, setting up listener');
            exportMapsBtn.addEventListener('click', () => {
                console.log('[MapsModule] Export button clicked');
                this.exportAllMaps();
            });
        } else {
            console.warn('[MapsModule] export-maps-btn not found');
        }
        
        // Import-Button
        const importMapsBtn = document.getElementById('import-maps-btn');
        if (importMapsBtn) {
            console.log('[MapsModule] Found import-maps-btn, setting up listener');
            importMapsBtn.addEventListener('click', () => {
                console.log('[MapsModule] Import button clicked');
                this.importMaps();
            });
        } else {
            console.warn('[MapsModule] import-maps-btn not found');
        }
        
        // Event-Listener für Map-Aktionen (werden dynamisch hinzugefügt)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-load-map')) {
                const mapId = e.target.dataset.mapId;
                this.loadMap(mapId);
            } else if (e.target.classList.contains('btn-delete-map')) {
                const mapId = e.target.dataset.mapId;
                this.deleteMap(mapId);
            }
        });
        
        // Debug-Button hinzufügen
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug';
        debugBtn.className = 'btn-secondary';
        debugBtn.style.fontSize = '10px';
        debugBtn.style.height = '20px';
        debugBtn.style.padding = '2px 6px';
        debugBtn.onclick = () => this.debugCoreStatus();
        
        const mapsActions = document.querySelector('.maps-actions');
        if (mapsActions) {
            mapsActions.appendChild(debugBtn);
        }
        
        console.log('[MapsModule] Event listeners setup complete');
    }
    
    setupDirectEventListeners() {
        console.log('[MapsModule] Setting up direct event listeners...');
        
        // Direkte Event-Listener für alle Buttons
        const saveBtn = document.getElementById('save-map-btn');
        if (saveBtn) {
            console.log('[MapsModule] Setting up direct save button listener');
            saveBtn.onclick = () => {
                console.log('[MapsModule] Direct save button clicked');
                this.saveCurrentMap();
            };
        }
        
        const exportBtn = document.getElementById('export-maps-btn');
        if (exportBtn) {
            console.log('[MapsModule] Setting up direct export button listener');
            exportBtn.onclick = () => {
                console.log('[MapsModule] Direct export button clicked');
                this.exportAllMaps();
            };
        }
        
        const importBtn = document.getElementById('import-maps-btn');
        if (importBtn) {
            console.log('[MapsModule] Setting up direct import button listener');
            importBtn.onclick = () => {
                console.log('[MapsModule] Direct import button clicked');
                this.importMaps();
            };
        }
        
        const mapNameInput = document.getElementById('map-name-input');
        if (mapNameInput) {
            console.log('[MapsModule] Setting up direct input listeners');
            mapNameInput.oninput = (e) => {
                this.currentMapName = e.target.value.trim();
                console.log('[MapsModule] Direct input updated:', this.currentMapName);
            };
            
            mapNameInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    console.log('[MapsModule] Direct Enter pressed, saving map');
                    this.saveCurrentMap();
                }
            };
        }
        
        console.log('[MapsModule] Direct event listeners setup complete');
    }
    
    debugCoreStatus() {
        console.log('[MapsModule] === DEBUG CORE STATUS ===');
        console.log('[MapsModule] Core available:', !!this.core);
        
        if (this.core) {
            console.log('[MapsModule] Core type:', this.core.constructor.name);
            console.log('[MapsModule] Tiles available:', !!this.core.tiles);
            console.log('[MapsModule] Tiles count:', this.core.tiles ? this.core.tiles.size : 'undefined');
            console.log('[MapsModule] Settings available:', !!this.core.settings);
            console.log('[MapsModule] getMapData function:', typeof this.core.getMapData);
            console.log('[MapsModule] loadMapFromData function:', typeof this.core.loadMapFromData);
            
            // Test getMapData
            try {
                const testData = this.core.getMapData();
                console.log('[MapsModule] Test getMapData result:', testData);
            } catch (error) {
                console.error('[MapsModule] Test getMapData failed:', error);
            }
        }
        
        console.log('[MapsModule] === END DEBUG ===');
    }
    
    saveCurrentMap() {
        if (!this.currentMapName) {
            this.showToast('Bitte geben Sie einen Map-Namen ein', 'warning');
            document.getElementById('map-name-input').focus();
            return;
        }
        
        try {
            console.log('[MapsModule] Starting to save map:', this.currentMapName);
            
            // Prüfe ob Core verfügbar ist
            if (!this.core) {
                this.showToast('Core nicht verfügbar', 'error');
                return;
            }
            
            // Prüfe ob Tiles vorhanden sind
            if (!this.core.tiles || this.core.tiles.size === 0) {
                console.log('[MapsModule] No tiles found, checking if we should save anyway...');
                // Erlaube das Speichern auch ohne Tiles (leere Map)
            }
            
            // Hole aktuelle Map-Daten vom Core
            const mapData = this.core.getMapData();
            console.log('[MapsModule] Core returned map data:', mapData);
            
            if (!mapData) {
                this.showToast('Fehler beim Abrufen der Map-Daten vom Core', 'error');
                return;
            }
            
            // Erstelle Map-Objekt
            const savedMap = {
                id: Date.now().toString(),
                name: this.currentMapName,
                timestamp: Date.now(),
                data: mapData,
                tilesCount: mapData.tiles ? mapData.tiles.length : 0,
                settings: mapData.settings || {}
            };
            
            console.log('[MapsModule] Created saved map object:', savedMap);
            
            // Speichere in localStorage
            this.saveMapToStorage(savedMap);
            
            // Aktualisiere die Liste
            this.loadSavedMaps();
            
            // Zeige Erfolgsmeldung
            this.showToast(`Map "${this.currentMapName}" erfolgreich gespeichert (${savedMap.tilesCount} Tiles)`, 'success');
            
            // Lösche den Namen aus dem Input
            document.getElementById('map-name-input').value = '';
            this.currentMapName = '';
            
        } catch (error) {
            console.error('[MapsModule] Error saving map:', error);
            this.showToast(`Fehler beim Speichern der Map: ${error.message}`, 'error');
        }
    }
    
    saveMapToStorage(savedMap) {
        try {
            // Lade bestehende Maps
            const existingMaps = this.getSavedMapsFromStorage();
            
            // Prüfe ob bereits eine Map mit diesem Namen existiert
            const existingIndex = existingMaps.findIndex(map => map.name === savedMap.name);
            if (existingIndex !== -1) {
                // Überschreibe bestehende Map
                existingMaps[existingIndex] = savedMap;
            } else {
                // Füge neue Map hinzu
                existingMaps.push(savedMap);
            }
            
            // Speichere alle Maps
            localStorage.setItem('hexMapEditor_savedMaps', JSON.stringify(existingMaps));
            
            console.log(`[MapsModule] Map "${savedMap.name}" saved successfully`);
            
        } catch (error) {
            console.error('[MapsModule] Error saving map to storage:', error);
            throw error;
        }
    }
    
    getSavedMapsFromStorage() {
        try {
            const savedMapsData = localStorage.getItem('hexMapEditor_savedMaps');
            return savedMapsData ? JSON.parse(savedMapsData) : [];
        } catch (error) {
            console.error('[MapsModule] Error loading saved maps from storage:', error);
            return [];
        }
    }
    
    loadSavedMaps() {
        try {
            this.savedMaps = this.getSavedMapsFromStorage();
            this.updateMapsList();
            this.updateMapsCount();
            
        } catch (error) {
            console.error('[MapsModule] Error loading saved maps:', error);
            this.showToast('Fehler beim Laden der gespeicherten Maps', 'error');
        }
    }
    
    updateMapsList() {
        const mapsList = document.getElementById('saved-maps-list');
        if (!mapsList) return;
        
        if (this.savedMaps.length === 0) {
            mapsList.innerHTML = `
                <div class="no-maps-message">
                    <p>📝 Keine Maps gespeichert</p>
                    <small>Speichern Sie Ihre erste Map, um sie hier zu sehen</small>
                </div>
            `;
            return;
        }
        
        // Sortiere Maps nach Datum (neueste zuerst)
        const sortedMaps = [...this.savedMaps].sort((a, b) => b.timestamp - a.timestamp);
        
        mapsList.innerHTML = sortedMaps.map(map => `
            <div class="map-list-item" data-map-id="${map.id}">
                <span class="map-item-icon">🗺️</span>
                <span class="map-item-name">${map.name}</span>
                <span class="map-item-tiles">🔲 ${map.tilesCount}</span>
                <span class="map-item-date">📅 ${new Date(map.timestamp).toLocaleDateString()}</span>
                <div class="map-item-actions">
                    <button class="btn-load-map" title="Map laden" data-map-id="${map.id}">📂</button>
                    <button class="btn-delete-map" title="Map löschen" data-map-id="${map.id}">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    updateMapsCount() {
        const countElement = document.getElementById('maps-count');
        if (countElement) {
            countElement.textContent = this.savedMaps.length;
        }
    }
    
    loadMap(mapId) {
        try {
            const mapToLoad = this.savedMaps.find(map => map.id === mapId);
            if (!mapToLoad) {
                this.showToast('Map nicht gefunden', 'error');
                return;
            }
            
            // Lade die Map in den Core
            const success = this.core.loadMapFromData(mapToLoad.data);
            if (success) {
                this.showToast(`Map "${mapToLoad.name}" erfolgreich geladen`, 'success');
                
                // Aktualisiere den Map-Namen im Input
                document.getElementById('map-name-input').value = mapToLoad.name;
                this.currentMapName = mapToLoad.name;
                
            } else {
                this.showToast('Fehler beim Laden der Map', 'error');
            }
            
        } catch (error) {
            console.error('[MapsModule] Error loading map:', error);
            this.showToast('Fehler beim Laden der Map', 'error');
        }
    }
    
    deleteMap(mapId) {
        try {
            const mapToDelete = this.savedMaps.find(map => map.id === mapId);
            if (!mapToDelete) {
                this.showToast('Map nicht gefunden', 'error');
                return;
            }
            
            // Entferne Map aus der Liste (ohne Bestätigung)
            this.savedMaps = this.savedMaps.filter(map => map.id !== mapId);
            
            // Speichere aktualisierte Liste
            localStorage.setItem('hexMapEditor_savedMaps', JSON.stringify(this.savedMaps));
            
            // Aktualisiere UI
            this.updateMapsList();
            this.updateMapsCount();
            
            this.showToast(`Map "${mapToDelete.name}" gelöscht`, 'success');
            
        } catch (error) {
            console.error('[MapsModule] Error deleting map:', error);
            this.showToast('Fehler beim Löschen der Map', 'error');
        }
    }
    
    showMapsList() {
        // Die Liste wird bereits in der UI angezeigt
        console.log('[MapsModule] Maps list is already visible');
    }
    
    exportAllMaps() {
        try {
            if (this.savedMaps.length === 0) {
                this.showToast('Keine Maps zum Exportieren vorhanden', 'warning');
                return;
            }
            
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                maps: this.savedMaps
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `hexmap_maps_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showToast(`${this.savedMaps.length} Maps erfolgreich exportiert`, 'success');
            
        } catch (error) {
            console.error('[MapsModule] Error exporting maps:', error);
            this.showToast('Fehler beim Exportieren der Maps', 'error');
        }
    }
    
    importMaps() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.multiple = false;
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        
                        if (!importData.maps || !Array.isArray(importData.maps)) {
                            this.showToast('Ungültiges Import-Format', 'error');
                            return;
                        }
                        
                        // Lade bestehende Maps
                        const existingMaps = this.getSavedMapsFromStorage();
                        
                        // Füge neue Maps hinzu (mit neuen IDs)
                        const newMaps = importData.maps.map(map => ({
                            ...map,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            timestamp: Date.now()
                        }));
                        
                        // Kombiniere Maps (neue Maps überschreiben bestehende mit gleichem Namen)
                        const combinedMaps = [...existingMaps];
                        newMaps.forEach(newMap => {
                            const existingIndex = combinedMaps.findIndex(map => map.name === newMap.name);
                            if (existingIndex !== -1) {
                                combinedMaps[existingIndex] = newMap;
                            } else {
                                combinedMaps.push(newMap);
                            }
                        });
                        
                        // Speichere kombinierte Maps
                        localStorage.setItem('hexMapEditor_savedMaps', JSON.stringify(combinedMaps));
                        
                        // Aktualisiere UI
                        this.loadSavedMaps();
                        
                        this.showToast(`${newMaps.length} Maps erfolgreich importiert`, 'success');
                        
                    } catch (error) {
                        console.error('[MapsModule] Error parsing import file:', error);
                        this.showToast('Fehler beim Parsen der Import-Datei', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();
            
        } catch (error) {
            console.error('[MapsModule] Error importing maps:', error);
            this.showToast('Fehler beim Importieren der Maps', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        // Verwende den ToastManager falls verfügbar
        if (window.ToastManager) {
            window.ToastManager.showToast(message, type);
        } else {
            // Fallback: einfache Alert
            console.log(`[MapsModule] ${type.toUpperCase()}: ${message}`);
        }
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.MapsModule = MapsModule;
}
