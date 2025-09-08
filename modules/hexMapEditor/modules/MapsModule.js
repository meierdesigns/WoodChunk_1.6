/**
 * MapsModule - Handles saving and loading complete maps
 */
class MapsModule {
    constructor(core) {
        this.core = core;
        this.savedMaps = [];
        this.currentMapName = '';
        this.autoSaveInterval = null;
        
        console.log('[MapsModule] Initialized with core:', !!core);
        
        // Setup immediately if core is available
        if (core) {
            this.setupMapsModule();
        }
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
                    <h2>🗺️ Maps Manager v2.0</h2>
                    <div class="header-actions">
                        <button id="refresh-maps-btn" class="btn-icon" title="Maps aktualisieren">🔄</button>
                        <button class="maps-modal-close" id="maps-modal-close">&times;</button>
                    </div>
                </div>
                
                <div class="maps-modal-body">
                    <!-- SAVE SECTION -->
                    <div class="save-section">
                        <h3>💾 Map Speichern</h3>
                        <div class="save-controls">
                            <div class="input-group">
                                <input type="text" id="map-name-input" placeholder="Map-Name eingeben..." maxlength="50" autocomplete="off">
                                <div class="input-validation" id="input-validation"></div>
                            </div>
                            <div class="save-buttons">
                                <button id="quick-save-btn" class="btn-primary" title="Schnell speichern">
                                    <span class="btn-icon">💾</span>
                                    <span class="btn-text">Speichern</span>
                                </button>
                                <button id="save-with-metadata-btn" class="btn-secondary" title="Mit Details speichern">
                                    <span class="btn-icon">📝</span>
                                    <span class="btn-text">Details</span>
                                </button>
                            </div>
                        </div>
                        <div class="save-status" id="save-status"></div>
                    </div>
                    
                    <!-- LOAD SECTION -->
                    <div class="load-section">
                        <h3>📂 Gespeicherte Maps</h3>
                        <div class="maps-controls">
                            <div class="search-controls">
                                <input type="text" id="search-maps-input" placeholder="Maps durchsuchen..." autocomplete="off">
                                <select id="sort-maps-select">
                                    <option value="newest">Neueste zuerst</option>
                                    <option value="oldest">Älteste zuerst</option>
                                    <option value="name">Nach Name</option>
                                    <option value="size">Nach Größe</option>
                                </select>
                            </div>
                            <div class="bulk-actions">
                                <button id="select-all-btn" class="btn-small">Alle auswählen</button>
                                <button id="delete-selected-btn" class="btn-danger btn-small">Ausgewählte löschen</button>
                            </div>
                        </div>
                        <div class="maps-list" id="maps-list">
                            <div class="loading-indicator" id="loading-indicator">Lade Maps...</div>
                        </div>
                    </div>
                    
                    <!-- IMPORT/EXPORT SECTION -->
                    <div class="import-export-section">
                        <h3>📤 Import / Export</h3>
                        <div class="ie-controls">
                            <button id="export-all-btn" class="btn-secondary">
                                <span class="btn-icon">📤</span>
                                <span class="btn-text">Alle exportieren</span>
                            </button>
                            <button id="export-selected-btn" class="btn-secondary" disabled>
                                <span class="btn-icon">📤</span>
                                <span class="btn-text">Ausgewählte exportieren</span>
                            </button>
                            <button id="import-maps-btn" class="btn-secondary">
                                <span class="btn-icon">📥</span>
                                <span class="btn-text">Importieren</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- DEBUG SECTION -->
                    <div class="debug-section">
                        <h3>🔧 Debug & Tools</h3>
                        <div class="debug-controls">
                            <button id="debug-save-btn" class="btn-debug">
                                <span class="btn-icon">🔍</span>
                                <span class="btn-text">Speichern debuggen</span>
                            </button>
                            <button id="debug-load-btn" class="btn-debug">
                                <span class="btn-icon">🔍</span>
                                <span class="btn-text">Laden debuggen</span>
                            </button>
                            <button id="clear-cache-btn" class="btn-debug">
                                <span class="btn-icon">🧹</span>
                                <span class="btn-text">Cache leeren</span>
                            </button>
                        </div>
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
        
        // Event-Listener für alle Buttons SOFORT setzen
        console.log('[MapsModule] Setting up NEW MODAL event listeners...');
        this.setupNewModalEventListeners();
        
        
        // Debug: Prüfe ob alle Elemente gefunden wurden
        setTimeout(() => {
            this.debugElements();
        }, 200);
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
            
            // Event-Listener ERNEUT setzen beim Öffnen des Modals
            console.log('[MapsModule] Re-setting event listeners when modal opens...');
            this.setupEventListeners();
            
            // Debug: Prüfe Save-Button beim Öffnen
            setTimeout(() => {
                console.log('[MapsModule] === MODAL OPEN DEBUG ===');
                const saveBtn = document.getElementById('save-map-btn');
                const inputField = document.getElementById('map-name-input');
                console.log('[MapsModule] Save button found:', !!saveBtn);
                console.log('[MapsModule] Input field found:', !!inputField);
                if (saveBtn) {
                    console.log('[MapsModule] Save button disabled:', saveBtn.disabled);
                    console.log('[MapsModule] Save button text:', saveBtn.textContent);
                }
                console.log('[MapsModule] === END MODAL OPEN DEBUG ===');
            }, 100);
            
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
    
    setupNewModalEventListeners() {
        console.log('[MapsModule] Setting up NEW MODAL event listeners...');
        
        // REFRESH BUTTON
        const refreshBtn = document.getElementById('refresh-maps-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('[MapsModule] Refresh button clicked');
                this.loadSavedMaps();
            });
        }
        
        // QUICK SAVE BUTTON
        const quickSaveBtn = document.getElementById('quick-save-btn');
        if (quickSaveBtn) {
            quickSaveBtn.addEventListener('click', () => {
                console.log('[MapsModule] Quick save button clicked');
                this.quickSaveMap();
            });
        }
        
        // SAVE WITH METADATA BUTTON
        const saveWithMetadataBtn = document.getElementById('save-with-metadata-btn');
        if (saveWithMetadataBtn) {
            saveWithMetadataBtn.addEventListener('click', () => {
                console.log('[MapsModule] Save with metadata button clicked');
                this.saveMapWithMetadata();
            });
        }
        
        // SEARCH INPUT
        const searchInput = document.getElementById('search-maps-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterMaps(e.target.value);
            });
        }
        
        // SORT SELECT
        const sortSelect = document.getElementById('sort-maps-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortMaps(e.target.value);
            });
        }
        
        // SELECT ALL BUTTON
        const selectAllBtn = document.getElementById('select-all-btn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllMaps();
            });
        }
        
        // DELETE SELECTED BUTTON
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.deleteSelectedMaps();
            });
        }
        
        // EXPORT ALL BUTTON
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportAllMaps();
            });
        }
        
        // EXPORT SELECTED BUTTON
        const exportSelectedBtn = document.getElementById('export-selected-btn');
        if (exportSelectedBtn) {
            exportSelectedBtn.addEventListener('click', () => {
                this.exportSelectedMaps();
            });
        }
        
        // IMPORT BUTTON
        const importBtn = document.getElementById('import-maps-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importMaps();
            });
        }
        
        // DEBUG SAVE BUTTON
        const debugSaveBtn = document.getElementById('debug-save-btn');
        if (debugSaveBtn) {
            debugSaveBtn.addEventListener('click', () => {
                this.debugSaveButton();
            });
        }
        
        // DEBUG LOAD BUTTON
        const debugLoadBtn = document.getElementById('debug-load-btn');
        if (debugLoadBtn) {
            debugLoadBtn.addEventListener('click', () => {
                this.debugLoadButton();
            });
        }
        
        // CLEAR CACHE BUTTON
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
        
        // MAP NAME INPUT VALIDATION
        const mapNameInput = document.getElementById('map-name-input');
        if (mapNameInput) {
            mapNameInput.addEventListener('input', (e) => {
                this.validateMapName(e.target.value);
            });
            
            mapNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.quickSaveMap();
                }
            });
        }
        
        console.log('[MapsModule] NEW MODAL event listeners setup complete');
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
            
            // Entferne alle bestehenden Event-Listener
            saveMapBtn.onclick = null;
            saveMapBtn.removeEventListener('click', this.saveCurrentMap);
            
            // Setze neuen Event-Listener
            saveMapBtn.addEventListener('click', (e) => {
                console.log('[MapsModule] 🔘 ===========================================');
                console.log('[MapsModule] 🔘 SAVE BUTTON CLICKED (addEventListener)');
                console.log('[MapsModule] 🔘 ===========================================');
                console.log('[MapsModule] 🔘 Event:', e);
                console.log('[MapsModule] 🔘 Event type:', e.type);
                console.log('[MapsModule] 🔘 Event target:', e.target);
                console.log('[MapsModule] 🔘 Event currentTarget:', e.currentTarget);
                console.log('[MapsModule] 🔘 Button element:', saveMapBtn);
                console.log('[MapsModule] 🔘 Button disabled:', saveMapBtn.disabled);
                console.log('[MapsModule] 🔘 Button text:', saveMapBtn.textContent);
                
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[MapsModule] 🔘 Calling saveCurrentMap()...');
                this.saveCurrentMap();
            });
            
            // Zusätzlicher direkter Event-Listener als Fallback
            saveMapBtn.onclick = (e) => {
                console.log('[MapsModule] 🔘 ===========================================');
                console.log('[MapsModule] 🔘 SAVE BUTTON CLICKED (onclick)');
                console.log('[MapsModule] 🔘 ===========================================');
                console.log('[MapsModule] 🔘 Event:', e);
                console.log('[MapsModule] 🔘 Event type:', e.type);
                console.log('[MapsModule] 🔘 Event target:', e.target);
                console.log('[MapsModule] 🔘 Button element:', saveMapBtn);
                console.log('[MapsModule] 🔘 Button disabled:', saveMapBtn.disabled);
                console.log('[MapsModule] 🔘 Button text:', saveMapBtn.textContent);
                
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[MapsModule] 🔘 Calling saveCurrentMap()...');
                this.saveCurrentMap();
            };
            
            // Test ob der Button funktioniert
            console.log('[MapsModule] Save button setup complete, testing...');
            setTimeout(() => {
                console.log('[MapsModule] Save button test - simulating click');
                // Simuliere einen Klick zum Testen
                const testEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                saveMapBtn.dispatchEvent(testEvent);
            }, 1000);
            
        } else {
            console.warn('[MapsModule] save-map-btn not found');
        }
        
        // NEUER SPEICHERN-BUTTON
        const newSaveBtn = document.getElementById('new-save-btn');
        if (newSaveBtn) {
            console.log('[MapsModule] Found new-save-btn, setting up listener');
            newSaveBtn.addEventListener('click', () => {
                console.log('[MapsModule] 🚀 NEUER SPEICHERN-BUTTON GEKLICKT!');
                this.newSaveFunction();
            });
        } else {
            console.warn('[MapsModule] new-save-btn not found');
        }
        
        // Debug-Button
        const debugBtn = document.getElementById('debug-save-btn');
        if (debugBtn) {
            console.log('[MapsModule] Found debug-save-btn, setting up listener');
            debugBtn.addEventListener('click', () => {
                console.log('[MapsModule] Debug button clicked!');
                this.debugSaveButton();
            });
        } else {
            console.warn('[MapsModule] debug-save-btn not found');
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
        debugBtn.onclick = () => this.debugSaveButton();
        
        const mapsActions = document.querySelector('.maps-actions');
        if (mapsActions) {
            mapsActions.appendChild(debugBtn);
        }
        
        console.log('[MapsModule] Event listeners setup complete');
    }
    
    debugElements() {
        console.log('[MapsModule] === DEBUG ELEMENTS ===');
        
        const elements = [
            'map-name-input',
            'save-map-btn',
            'export-maps-btn',
            'import-maps-btn',
            'maps-modal',
            'maps-modal-backdrop'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            console.log(`[MapsModule] Element ${id}:`, !!element);
            if (element) {
                console.log(`[MapsModule] Element ${id} details:`, {
                    tagName: element.tagName,
                    className: element.className,
                    style: element.style.display,
                    disabled: element.disabled
                });
            }
        });
        
        // Test save button click
        const saveBtn = document.getElementById('save-map-btn');
        if (saveBtn) {
            console.log('[MapsModule] Save button found, testing click...');
            // Don't actually click, just log that we could
            console.log('[MapsModule] Save button is clickable');
        }
        
        console.log('[MapsModule] === END DEBUG ELEMENTS ===');
    }
    
    debugSaveButton() {
        console.log('[MapsModule] === DEBUG NEUE SPEICHERFUNKTION ===');
        
        // 1. Prüfe alle Elemente
        const mapNameInput = document.getElementById('map-name-input');
        const saveMapBtn = document.getElementById('save-map-btn');
        const mapsModal = document.getElementById('maps-modal');
        
        console.log('[MapsModule] 🔍 Elemente-Check:', {
            mapNameInput: !!mapNameInput,
            saveMapBtn: !!saveMapBtn,
            mapsModal: !!mapsModal
        });
        
        // 2. Teste Validierung
        console.log('[MapsModule] 🔍 Teste Validierung...');
        if (mapNameInput) {
            mapNameInput.value = 'test-map';
            const validation = this.validateSaveInput();
            console.log('[MapsModule] ✅ Validierung:', validation);
        }
        
        // 3. Teste Map-Daten-Sammlung
        console.log('[MapsModule] 🔍 Teste Map-Daten-Sammlung...');
        const mapData = this.collectMapData();
        console.log('[MapsModule] ✅ Map-Daten:', mapData ? 'Erfolgreich gesammelt' : 'Fehler');
        
        // 4. Prüfe Core-Status
        console.log('[MapsModule] 🔍 Core-Status:', {
            available: !!this.core,
            type: this.core ? this.core.constructor.name : 'N/A',
            hasGetMapData: this.core ? typeof this.core.getMapData : 'N/A',
            tilesCount: this.core && this.core.tiles ? this.core.tiles.size : 0
        });
        
        // 5. Teste Server-Verbindung
        console.log('[MapsModule] 🔍 Teste Server-Verbindung...');
        fetch('/api/maps')
            .then(response => {
                console.log('[MapsModule] ✅ Server-Status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('[MapsModule] ✅ Server-Daten:', data);
            })
            .catch(error => {
                console.error('[MapsModule] ❌ Server-Fehler:', error);
            });
        
        // 6. Simuliere kompletten Speichervorgang
        console.log('[MapsModule] 🔍 Simuliere Speichervorgang...');
        if (mapNameInput) {
            mapNameInput.value = 'debug-test-map';
            try {
                    this.saveCurrentMap();
                console.log('[MapsModule] ✅ Speichervorgang gestartet');
            } catch (error) {
                console.error('[MapsModule] ❌ Speichervorgang-Fehler:', error);
            }
        }
        
        // 7. Prüfe alle Save-Buttons
        const allSaveButtons = document.querySelectorAll('button[id*="save"]');
        console.log('[MapsModule] 🔍 Alle Save-Buttons:', allSaveButtons.length);
        allSaveButtons.forEach((btn, index) => {
            console.log(`[MapsModule] Button ${index}:`, {
                id: btn.id,
                text: btn.textContent,
                disabled: btn.disabled,
                onclick: typeof btn.onclick
            });
        });
        
        console.log('[MapsModule] === ENDE DEBUG NEUE SPEICHERFUNKTION ===');
    }
    
    // Globale Test-Funktion für einfachen Zugriff
    quickSaveMap() {
        console.log('[MapsModule] 🚀 Quick Save Map');
        
        const mapNameInput = document.getElementById('map-name-input');
        if (!mapNameInput) {
            this.showToast('Eingabefeld nicht gefunden!', 'error');
            return;
        }
        
        const mapName = mapNameInput.value.trim();
        if (!mapName) {
            this.showToast('Bitte geben Sie einen Map-Namen ein!', 'warning');
            mapNameInput.focus();
            return;
        }
        
        this.newSaveFunction();
    }
    
    saveMapWithMetadata() {
        console.log('[MapsModule] 📝 Save Map with Metadata');
        
        const mapNameInput = document.getElementById('map-name-input');
        if (!mapNameInput) {
            this.showToast('Eingabefeld nicht gefunden!', 'error');
            return;
        }
        
        const mapName = mapNameInput.value.trim();
        if (!mapName) {
            this.showToast('Bitte geben Sie einen Map-Namen ein!', 'warning');
            mapNameInput.focus();
            return;
        }
        
        // Hier könnte eine erweiterte Metadaten-Eingabe kommen
        this.newSaveFunction();
    }
    
    validateMapName(name) {
        const validationDiv = document.getElementById('input-validation');
        if (!validationDiv) return;
        
        if (!name) {
            validationDiv.innerHTML = '';
            return;
        }
        
        if (name.length < 2) {
            validationDiv.innerHTML = '<span style="color: #ff6b6b;">⚠️ Mindestens 2 Zeichen</span>';
        } else if (name.length > 50) {
            validationDiv.innerHTML = '<span style="color: #ff6b6b;">⚠️ Maximal 50 Zeichen</span>';
        } else if (/[<>:"/\\|?*]/.test(name)) {
            validationDiv.innerHTML = '<span style="color: #ff6b6b;">⚠️ Ungültige Zeichen</span>';
        } else {
            validationDiv.innerHTML = '<span style="color: #51cf66;">✅ Gültig</span>';
        }
    }
    
    filterMaps(searchTerm) {
        console.log('[MapsModule] Filtering maps:', searchTerm);
        
        const mapsList = document.getElementById('maps-list');
        if (!mapsList) return;
        
        const mapItems = mapsList.querySelectorAll('.map-item');
        mapItems.forEach(item => {
            const mapName = item.querySelector('.map-name')?.textContent.toLowerCase() || '';
            const matches = mapName.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }
    
    sortMaps(sortBy) {
        console.log('[MapsModule] Sorting maps by:', sortBy);
        
        const mapsList = document.getElementById('maps-list');
        if (!mapsList) return;
        
        const mapItems = Array.from(mapsList.querySelectorAll('.map-item'));
        
        mapItems.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.dataset.timestamp) - new Date(a.dataset.timestamp);
                case 'oldest':
                    return new Date(a.dataset.timestamp) - new Date(b.dataset.timestamp);
                case 'name':
                    return a.querySelector('.map-name')?.textContent.localeCompare(b.querySelector('.map-name')?.textContent) || 0;
                case 'size':
                    return parseInt(b.dataset.size) - parseInt(a.dataset.size);
                default:
                    return 0;
            }
        });
        
        mapItems.forEach(item => mapsList.appendChild(item));
    }
    
    selectAllMaps() {
        console.log('[MapsModule] Selecting all maps');
        
        const mapItems = document.querySelectorAll('.map-item');
        const selectAllBtn = document.getElementById('select-all-btn');
        
        const allSelected = Array.from(mapItems).every(item => item.querySelector('.map-checkbox')?.checked);
        
        mapItems.forEach(item => {
            const checkbox = item.querySelector('.map-checkbox');
            if (checkbox) {
                checkbox.checked = !allSelected;
            }
        });
        
        selectAllBtn.textContent = allSelected ? 'Alle auswählen' : 'Alle abwählen';
        this.updateBulkActions();
    }
    
    deleteSelectedMaps() {
        console.log('[MapsModule] Deleting selected maps');
        
        const selectedMaps = document.querySelectorAll('.map-item .map-checkbox:checked');
        if (selectedMaps.length === 0) {
            this.showToast('Keine Maps ausgewählt!', 'warning');
            return;
        }
        
        if (confirm(`Möchten Sie ${selectedMaps.length} Map(s) wirklich löschen?`)) {
            selectedMaps.forEach(checkbox => {
                const mapItem = checkbox.closest('.map-item');
                const mapId = mapItem.dataset.mapId;
                this.deleteMap(mapId);
            });
        }
    }
    
    exportSelectedMaps() {
        console.log('[MapsModule] Exporting selected maps');
        
        const selectedMaps = document.querySelectorAll('.map-item .map-checkbox:checked');
        if (selectedMaps.length === 0) {
            this.showToast('Keine Maps ausgewählt!', 'warning');
            return;
        }
        
        // Hier würde die Export-Logik für ausgewählte Maps kommen
        this.showToast(`${selectedMaps.length} Maps werden exportiert...`, 'info');
    }
    
    updateBulkActions() {
        const selectedCount = document.querySelectorAll('.map-item .map-checkbox:checked').length;
        const exportSelectedBtn = document.getElementById('export-selected-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        
        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = selectedCount === 0;
        }
        
        if (deleteSelectedBtn) {
            deleteSelectedBtn.disabled = selectedCount === 0;
            deleteSelectedBtn.textContent = selectedCount > 0 ? `Ausgewählte löschen (${selectedCount})` : 'Ausgewählte löschen';
        }
    }
    
    debugLoadButton() {
        console.log('[MapsModule] === DEBUG LOAD FUNCTION ===');
        
        // Teste das Laden der Maps
        this.getSavedMapsFromStorage()
            .then(maps => {
                console.log('[MapsModule] Loaded maps:', maps);
                console.log('[MapsModule] Maps count:', maps.length);
            })
            .catch(error => {
                console.error('[MapsModule] Load error:', error);
            });
        
        console.log('[MapsModule] === END DEBUG LOAD ===');
    }
    
    clearCache() {
        console.log('[MapsModule] Clearing cache...');
        
        // Lösche alle Caches
        if (window.clearMapRendererCache) {
            window.clearMapRendererCache();
        }
        
        // Lösche localStorage
        localStorage.removeItem('maps_cache');
        localStorage.removeItem('maps_list');
        
        this.showToast('Cache geleert!', 'success');
        console.log('[MapsModule] Cache cleared');
    }
    
    newSaveFunction() {
        console.log('[MapsModule] 🚀 ===========================================');
        console.log('[MapsModule] 🚀 NEUE SPEICHERFUNKTION GESTARTET');
        console.log('[MapsModule] 🚀 ===========================================');
        
        // 1. EINGABE PRÜFEN
        const mapNameInput = document.getElementById('map-name-input');
        if (!mapNameInput) {
            console.error('[MapsModule] ❌ Input-Feld nicht gefunden!');
            this.showToast('Eingabefeld nicht gefunden!', 'error');
            return;
        }
        
        const mapName = mapNameInput.value.trim();
        if (!mapName) {
            console.error('[MapsModule] ❌ Kein Map-Name eingegeben!');
            this.showToast('Bitte geben Sie einen Map-Namen ein!', 'warning');
            mapNameInput.focus();
            return;
        }
        
        console.log('[MapsModule] ✅ Map-Name:', mapName);
        
        // 2. CORE PRÜFEN
        if (!this.core) {
            console.error('[MapsModule] ❌ Core nicht verfügbar!');
            this.showToast('Core nicht verfügbar!', 'error');
            return;
        }
        
        console.log('[MapsModule] ✅ Core verfügbar');
        
        // 3. MAP-DATEN HOLEN
        let mapData;
        try {
            mapData = this.core.getMapData();
            console.log('[MapsModule] ✅ Map-Daten geholt:', {
                tilesCount: mapData.tiles ? mapData.tiles.length : 0,
                settingsCount: mapData.settings ? Object.keys(mapData.settings).length : 0
            });
            } catch (error) {
            console.error('[MapsModule] ❌ Fehler beim Holen der Map-Daten:', error);
            this.showToast('Fehler beim Holen der Map-Daten!', 'error');
            return;
        }
        
        // 4. MAP-OBJEKT ERSTELLEN
        const mapObject = {
            id: `map_${Date.now()}`,
            name: mapName,
            timestamp: Date.now(),
            version: '1.0',
            data: mapData,
            metadata: {
                tilesCount: mapData.tiles ? mapData.tiles.length : 0,
                settingsCount: mapData.settings ? Object.keys(mapData.settings).length : 0,
                createdBy: 'HexMapEditor',
                editorVersion: '1.6'
            }
        };
        
        console.log('[MapsModule] ✅ Map-Objekt erstellt:', mapObject);
        
        // 5. BUTTON-STATUS ÄNDERN
        const newSaveBtn = document.getElementById('new-save-btn');
        if (newSaveBtn) {
            newSaveBtn.disabled = true;
            newSaveBtn.textContent = '💾 Speichere...';
            newSaveBtn.style.opacity = '0.7';
        }
        
        // 6. AN SERVER SENDEN
        console.log('[MapsModule] 🌐 Sende an Server...');
        fetch('/api/maps/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mapObject)
        })
        .then(response => {
            console.log('[MapsModule] 📡 Server-Antwort:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('[MapsModule] ✅ Server-Daten:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Unbekannter Server-Fehler');
            }
            
            // ERFOLG!
            console.log('[MapsModule] 🎉 SPEICHERN ERFOLGREICH!');
            
            // Button zurücksetzen
            if (newSaveBtn) {
                newSaveBtn.disabled = false;
                newSaveBtn.textContent = '🚀 NEU SPEICHERN';
                newSaveBtn.style.opacity = '1';
            }
            
            // Erfolgsmeldung
            this.showToast(`Map "${mapName}" erfolgreich gespeichert!`, 'success');
            
            // Input leeren
            mapNameInput.value = '';
            
            // Map-Liste aktualisieren
            this.loadSavedMaps();
            
            console.log('[MapsModule] 🚀 ===========================================');
            console.log('[MapsModule] 🚀 SPEICHERFUNKTION ERFOLGREICH ABGESCHLOSSEN');
            console.log('[MapsModule] 🚀 ===========================================');
        })
        .catch(error => {
            console.error('[MapsModule] ❌ SPEICHERFEHLER:', error);
            
            // Button zurücksetzen
            if (newSaveBtn) {
                newSaveBtn.disabled = false;
                newSaveBtn.textContent = '🚀 NEU SPEICHERN';
                newSaveBtn.style.opacity = '1';
            }
            
            // Fehlermeldung
            this.showToast(`Fehler beim Speichern: ${error.message}`, 'error');
            
            console.log('[MapsModule] 🚀 ===========================================');
            console.log('[MapsModule] 🚀 SPEICHERFUNKTION FEHLGESCHLAGEN');
            console.log('[MapsModule] 🚀 ===========================================');
        });
    }
    
    saveCurrentMap() {
        console.log('[MapsModule] 🚀 NEUE SPEICHERFUNKTION GESTARTET');
        
        // 1. VALIDIERUNG
        const validation = this.validateSaveInput();
        if (!validation.valid) {
            this.showToast(validation.message, 'warning');
            return;
        }
        
        // 2. MAP-DATEN SAMMELN
        const mapData = this.collectMapData();
            if (!mapData) {
            this.showToast('Fehler beim Sammeln der Map-Daten', 'error');
                return;
            }
            
        // 3. SPEICHERN
        this.performSave(mapData);
    }
    
    validateSaveInput() {
        console.log('[MapsModule] 🔍 Validiere Eingabe...');
        
        const mapNameInput = document.getElementById('map-name-input');
        if (!mapNameInput) {
            return { valid: false, message: 'Eingabefeld nicht gefunden' };
        }
        
        const mapName = mapNameInput.value.trim();
        if (!mapName) {
            mapNameInput.focus();
            return { valid: false, message: 'Bitte geben Sie einen Map-Namen ein' };
        }
        
        if (mapName.length < 2) {
            mapNameInput.focus();
            return { valid: false, message: 'Map-Name muss mindestens 2 Zeichen lang sein' };
        }
        
        if (mapName.length > 50) {
            mapNameInput.focus();
            return { valid: false, message: 'Map-Name darf maximal 50 Zeichen lang sein' };
        }
        
        // Prüfe auf ungültige Zeichen
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(mapName)) {
            mapNameInput.focus();
            return { valid: false, message: 'Map-Name enthält ungültige Zeichen' };
        }
        
        this.currentMapName = mapName;
        console.log('[MapsModule] ✅ Eingabe validiert:', mapName);
        return { valid: true, message: 'OK' };
    }
    
    collectMapData() {
        console.log('[MapsModule] 📊 Sammle Map-Daten...');
        
        if (!this.core) {
            console.error('[MapsModule] ❌ Core nicht verfügbar');
            return null;
        }
        
        try {
            const mapData = this.core.getMapData();
            console.log('[MapsModule] ✅ Map-Daten gesammelt:', {
                tilesCount: mapData.tiles ? mapData.tiles.length : 0,
                settingsCount: mapData.settings ? Object.keys(mapData.settings).length : 0,
                dataSize: JSON.stringify(mapData).length
            });
            return mapData;
        } catch (error) {
            console.error('[MapsModule] ❌ Fehler beim Sammeln der Map-Daten:', error);
            return null;
        }
    }
    
    performSave(mapData) {
        console.log('[MapsModule] 💾 Starte Speichervorgang...');
        
        const mapObject = {
            id: `map_${Date.now()}`,
                name: this.currentMapName,
                timestamp: Date.now(),
            version: '1.0',
                data: mapData,
            metadata: {
                tilesCount: mapData.tiles ? mapData.tiles.length : 0,
                settingsCount: mapData.settings ? Object.keys(mapData.settings).length : 0,
                createdBy: 'HexMapEditor',
                editorVersion: '1.6'
            }
        };
        
        console.log('[MapsModule] 📦 Map-Objekt erstellt:', mapObject);
        
        // Zeige Lade-Indikator
        this.showSaveProgress();
        
        // Speichere auf Server
        this.saveToServer(mapObject)
            .then(response => this.handleSaveSuccess(response, mapObject))
            .catch(error => this.handleSaveError(error));
    }
    
    showSaveProgress() {
        const saveBtn = document.getElementById('save-map-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '💾 Speichere...';
            saveBtn.style.opacity = '0.7';
        }
    }
    
    hideSaveProgress() {
        const saveBtn = document.getElementById('save-map-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Speichern';
            saveBtn.style.opacity = '1';
        }
    }
    
    saveToServer(mapObject) {
        console.log('[MapsModule] 🌐 Sende an Server...');
        
        return fetch('/api/maps/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mapObject)
        })
        .then(response => {
            console.log('[MapsModule] 📡 Server-Antwort erhalten:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('[MapsModule] ✅ Server-Daten:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Unbekannter Server-Fehler');
            }
            
            return data;
        });
    }
    
    handleSaveSuccess(response, mapObject) {
        console.log('[MapsModule] 🎉 Speichern erfolgreich!');
        
        this.hideSaveProgress();
        
        // Aktualisiere Map-Liste
        this.loadSavedMaps();
        
        // Zeige Erfolgsmeldung
        const message = `Map "${this.currentMapName}" erfolgreich gespeichert!`;
        this.showToast(message, 'success');
        
        // Lösche Eingabefeld
        const mapNameInput = document.getElementById('map-name-input');
        if (mapNameInput) {
            mapNameInput.value = '';
        }
        this.currentMapName = '';
        
        console.log('[MapsModule] ✅ Speichervorgang abgeschlossen');
    }
    
    handleSaveError(error) {
        console.error('[MapsModule] ❌ Speicherfehler:', error);
        
        this.hideSaveProgress();
        
        const message = `Fehler beim Speichern: ${error.message}`;
        this.showToast(message, 'error');
        
        console.error('[MapsModule] ❌ Speichervorgang fehlgeschlagen');
    }
    
    
    getSavedMapsFromStorage() {
        try {
            // Load maps from server instead of localStorage
            return fetch('/api/maps')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        return data.maps || [];
                    } else {
                        console.error('[MapsModule] Server error loading maps:', data.message);
                        return [];
                    }
                })
                .catch(error => {
                    console.error('[MapsModule] Error loading maps from server:', error);
                    return [];
                });
        } catch (error) {
            console.error('[MapsModule] Error loading saved maps from storage:', error);
            return Promise.resolve([]);
        }
    }
    
    loadSavedMaps() {
        try {
            this.getSavedMapsFromStorage().then(maps => {
                this.savedMaps = maps;
            this.updateMapsList();
            this.updateMapsCount();
            }).catch(error => {
                console.error('[MapsModule] Error loading saved maps:', error);
                this.showToast('Fehler beim Laden der gespeicherten Maps', 'error');
            });
            
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
            
            // TODO: Implement server-side map deletion
            // For now, just remove from local list
            this.savedMaps = this.savedMaps.filter(map => map.id !== mapId);
            
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
