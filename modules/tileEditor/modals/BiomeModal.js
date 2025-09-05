/**
 * BiomeModal - Standalone Modal Module
 * Handles biome management with independent table component
 * Optimized for better integration and flexibility
 */

class BiomeModal {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            modalId: 'biomeModal',
            container: options.container || document.body,
            autoInit: options.autoInit !== false,
            tableComponent: options.tableComponent || BiomeTableComponent,
            eventPrefix: options.eventPrefix || 'biomeModal',
            debug: options.debug || false,
            ...options
        };

        // State
        this.isOpen = false;
        this.currentBiome = null;
        this.tableComponent = null;
        this.eventListeners = new Map();
        this.modalElement = null;

        // Initialize if autoInit is enabled
        if (this.config.autoInit) {
            this.init();
        }
    }
    
    // Cache busting utility for Buildings images
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Add cache busting for Buildings tiles
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const separator = imagePath.includes('?') ? '&' : '?';
            return `${imagePath}${separator}_cb=${timestamp}`;
        }
        
        return imagePath;
    }

    init() {
        this.createModalHTML();
        this.setupEventListeners();
        this.initTableComponent();
        this.debug('BiomeModal initialized');
        this.emit('initialized');
    }

    createModalHTML() {
        // Check if modal already exists
        if (document.getElementById(this.config.modalId)) {
            this.modalElement = document.getElementById(this.config.modalId);
            return;
        }

        const modalHTML = this.generateModalHTML();
        
        // Insert into specified container
        if (this.config.container === document.body) {
            this.config.container.insertAdjacentHTML('beforeend', modalHTML);
        } else {
            this.config.container.innerHTML = modalHTML;
        }
        
        this.modalElement = document.getElementById(this.config.modalId);
    }

    generateModalHTML() {
        return `
            <div id="${this.config.modalId}" class="modal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3 id="biomeModalTitle">Biome Verwalten</h3>
                        <button type="button" class="modal-close" id="closeBiomeModalHeaderBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="biome-modal-content">
                            <div class="biome-info-section">
                                <div class="biome-content-row">
                                    <img id="biomeMainImage" src="" alt="Biome" class="biome-title-image">
                                    <div class="biome-details">
                                        <div id="biomeName">Biome Name</div>
                                        <div class="biome-stats">
                                            <span class="biome-stat">
                                                <span class="stat-icon">📁</span>
                                                <span id="biomeFolderPath">assets/biomes/...</span>
                                            </span>
                                        </div>
                                        <div class="biome-description" id="biomeDescription">
                                            Beschreibung des Biomes...
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="biome-settings-section">
                                <div class="settings-header">
                                    <h4>Biome Einstellungen</h4>
                                    <button type="button" id="toggleBiomeSettings" class="toggle-btn collapsed">▶</button>
                                </div>
                                <div class="settings-content collapsed" id="biomeSettingsContent">
                                    <div class="settings-tabs">
                                        <div class="tab-buttons">
                                            <button type="button" class="tab-btn active" data-tab="colorTab">🎨 Farbe</button>
                                            <button type="button" class="tab-btn" data-tab="descriptionTab">📝 Beschreibung</button>
                                            <button type="button" class="tab-btn" data-tab="imageTab">🖼️ Titelbild</button>
                                        </div>
                                        <div class="tab-content">
                                            <div class="tab-panel active" id="colorTab">
                                                <div class="color-input-container">
                                                    <div class="color-preview" id="colorPreview"></div>
                                                    <div class="color-input-group">
                                                        <input type="text" id="biomeColorInput" placeholder="#000000" maxlength="7">
                                                        <span class="color-input-separator">oder</span>
                                                        <div class="rgb-input-group">
                                                            <input type="number" id="biomeColorR" placeholder="R" min="0" max="255">
                                                            <input type="number" id="biomeColorG" placeholder="G" min="0" max="255">
                                                            <input type="number" id="biomeColorB" placeholder="B" min="0" max="255">
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="color-picker-sections-container">
                                                    <div class="color-picker-section">
                                                        <h4>Farben aus Titelbild wählen</h4>
                                                        <div class="color-picker-container">
                                                            <canvas id="colorPickerCanvas" width="300" height="200"></canvas>
                                                            <div class="color-picker-cursor" id="colorPickerCursor"></div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="color-picker-section">
                                                        <h4>Farben aus Gradient wählen</h4>
                                                        <div class="color-picker-container">
                                                            <canvas id="gradientPickerCanvas" width="300" height="200"></canvas>
                                                            <div class="color-picker-cursor" id="gradientPickerCursor"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tab-panel" id="descriptionTab">
                                                <textarea id="biomeDescriptionInput" class="biome-description-input" rows="3" placeholder="Beschreibe die Eigenschaften dieses Biomes..."></textarea>
                                            </div>
                                            <div class="tab-panel" id="imageTab">
                                                <div class="image-upload-container">
                                                    <input type="file" id="biomeImageUpload" class="image-upload-input" accept="image/*" style="display: none;">
                                                    <button type="button" id="biomeImageUploadBtn" class="image-upload-btn">📁 Bild auswählen</button>
                                                    <span class="image-upload-info">PNG, JPG bis 2MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="biome-tiles-section">
                                <div class="section-header">
                                    <div class="section-header-horizontal">
                                        <div class="section-header-left">
                                            <h4>Tiles in diesem Biome</h4>
                                        </div>
                                        <div class="section-header-center">
                                            <div class="biome-drag-drop-area">
                                                <div class="biome-drag-drop-zone" id="biomeDragDropZone">
                                                    <div class="drag-drop-content">
                                                        <h5>Bilder hier hineinziehen</h5>
                                                        <div class="drag-drop-info">oder klicken zum Auswählen</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="section-header-right">
                                            <div class="tile-action-buttons">
                                                <button type="button" id="addTileToBiome" class="btn btn-primary btn-small">+ Tile hinzufügen</button>
                                                <button type="button" id="importTilesToBiome" class="btn btn-secondary btn-small">Tiles importieren</button>
                                                <button type="button" id="cleanTilesBtn" class="btn btn-warning btn-small">🧹 Tiles säubern</button>
                                            </div>
                                            <div class="view-toggle-controls">
                                                <span class="view-label">Ansicht:</span>
                                                <button type="button" id="toggleTableView" class="btn btn-small view-toggle-btn active" data-view="table">📊 Tabelle</button>
                                                <button type="button" id="toggleCardView" class="btn btn-small view-toggle-btn" data-view="cards">🃏 Cards</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="filter-tabs" id="filterTabsContainer">
                                        <button type="button" class="filter-tab active" data-filter="all">Alle</button>
                                        <!-- Dynamic filter tabs will be generated here based on biome type -->
                                    </div>
                                </div>
                                
                                <div id="biomeTilesList" class="biome-tiles-list">
                                    <!-- Table component will render here -->
                                </div>
                            </div>
                            
                            <div class="biome-actions">
                                <button type="button" id="saveBiomeChanges" class="btn btn-success">💾 Speichern</button>
                                <button type="button" id="checkTilesFolder" class="btn btn-info">📁 Tiles Ordner prüfen</button>
                                <button type="button" id="exportBiomeData" class="btn btn-secondary">📤 Biome exportieren</button>
                                <button type="button" id="closeBiomeModalActionBtn" class="btn btn-secondary">Schließen</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initTableComponent() {
        if (this.config.tableComponent) {
            this.tableComponent = new this.config.tableComponent(this);
            this.debug('Table component initialized');
        }
    }

    setupEventListeners() {
        // Close buttons
        this.addEventListener('closeBiomeModalHeaderBtn', 'click', () => this.close());
        this.addEventListener('closeBiomeModalActionBtn', 'click', () => this.close());
        
        // Modal backdrop click
        this.addEventListener(this.config.modalId, 'click', (e) => {
            if (e.target.id === this.config.modalId) {
                this.close();
            }
        });

        // Settings toggle
        this.addEventListener('toggleBiomeSettings', 'click', () => this.toggleSettings());

        // View toggles - REMOVED: These conflict with TileEditor.js event delegation
        // The buttons are now handled by event delegation in TileEditor.js

        // Action buttons
        this.addEventListener('saveBiomeChanges', 'click', () => this.saveBiome());
        this.addEventListener('addTileToBiome', 'click', () => this.addTile());
        this.addEventListener('importTilesToBiome', 'click', () => this.importTiles());
        this.addEventListener('cleanTilesBtn', 'click', () => this.cleanTiles());

        // Tab buttons
        document.querySelectorAll('[data-tab]').forEach(btn => {
            this.addEventListener(btn.id, 'click', () => this.switchTab(btn.dataset.tab));
        });

        // Filter tabs will be set up dynamically in generateFilterTabs()
    }

    addEventListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.set(`${elementId}_${event}`, { element, event, handler });
        }
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
    }

    async open(biomeData) {
        if (!this.modalElement) {
            this.init();
        }

        this.currentBiome = biomeData;
        this.isOpen = true;
        
        await this.loadBiomeData(biomeData);
        this.show();
        
        // Load tiles into table component
        if (this.tableComponent) {
            await this.tableComponent.loadTiles(biomeData);
        }
        
        this.debug('BiomeModal opened for:', biomeData.name);
        this.emit('opened', biomeData);
    }

    close() {
        this.isOpen = false;
        this.hide();
        this.currentBiome = null;
        this.tableComponent?.clear();
        
        this.debug('BiomeModal closed');
        this.emit('closed');
    }

    show() {
        if (this.modalElement) {
            this.modalElement.classList.add('show');
        }
    }

    hide() {
        if (this.modalElement) {
            this.modalElement.classList.remove('show');
        }
    }

    async loadBiomeData(biomeData) {
        // Update modal title
        const title = document.getElementById('biomeModalTitle');
        if (title) {
            title.textContent = `Biome: ${biomeData.name}`;
        }

        // Update biome name
        const nameElement = document.getElementById('biomeName');
        if (nameElement) {
            nameElement.textContent = biomeData.name;
        }

        // Update folder path
        const pathElement = document.getElementById('biomeFolderPath');
        if (pathElement) {
            pathElement.textContent = `assets/biomes/${biomeData.name}`;
        }

        // Update description
        const descElement = document.getElementById('biomeDescription');
        if (descElement) {
            descElement.textContent = biomeData.description || 'Keine Beschreibung verfügbar';
        }

        // Update main image
        const imageElement = document.getElementById('biomeMainImage');
        if (imageElement && biomeData.image) {
            imageElement.src = biomeData.image;
        }

        // Update color preview
        if (biomeData.color) {
            this.updateColorPreview(biomeData.color);
        }

        // Generate filter tabs based on biome type
        this.generateFilterTabs(biomeData.type || 'terrain');
    }

    generateFilterTabs(biomeType) {
        const filterContainer = document.getElementById('filterTabsContainer');
        if (!filterContainer) return;

        // Clear existing filter tabs (except "Alle")
        const allButton = filterContainer.querySelector('[data-filter="all"]');
        filterContainer.innerHTML = '';
        if (allButton) {
            filterContainer.appendChild(allButton);
        }

        // Define filter tabs based on biome type
        let filterTabs = [];
        
        if (biomeType === 'entities' || biomeType === 'buildings') {
            filterTabs = [
                { filter: 'mining_site', label: '⛏️ Mining', icon: '⛏️' },
                { filter: 'tower', label: '🗼 Tower', icon: '🗼' },
                { filter: 'building', label: '🏢 Building', icon: '🏢' },
                { filter: 'settlement', label: '🏘️ Settlement', icon: '🏘️' },
                { filter: 'castle', label: '🏰 Castle', icon: '🏰' },
                { filter: 'village', label: '🏘️ Village', icon: '🏘️' },
                { filter: 'temple', label: '⛪ Temple', icon: '⛪' },
                { filter: 'ritual_site', label: '🔮 Ritual', icon: '🔮' }
            ];
        } else {
            // Default terrain filters
            filterTabs = [
                { filter: 'grass', label: '🌱 Grass', icon: '🌱' },
                { filter: 'dirt', label: '🟫 Dirt', icon: '🟫' },
                { filter: 'stone', label: '🪨 Stone', icon: '🪨' },
                { filter: 'water', label: '💧 Water', icon: '💧' },
                { filter: 'sand', label: '🏖️ Sand', icon: '🏖️' },
                { filter: 'snow', label: '❄️ Snow', icon: '❄️' },
                { filter: 'forest', label: '🌲 Forest', icon: '🌲' },
                { filter: 'mountain', label: '⛰️ Mountain', icon: '⛰️' }
            ];
        }

        // Create filter tab buttons
        filterTabs.forEach(tab => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-tab';
            button.dataset.filter = tab.filter;
            button.innerHTML = tab.label;
            filterContainer.appendChild(button);
        });

        // Re-attach event listeners
        this.setupFilterTabListeners();
    }

    setupFilterTabListeners() {
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', () => this.filterTiles(btn.dataset.filter));
        });
    }

    updateColorPreview(color) {
        const preview = document.getElementById('colorPreview');
        if (preview) {
            preview.style.backgroundColor = color;
        }
    }

    toggleSettings() {
        const content = document.getElementById('biomeSettingsContent');
        const toggleBtn = document.getElementById('toggleBiomeSettings');
        
        if (content && toggleBtn) {
            content.classList.toggle('collapsed');
            toggleBtn.classList.toggle('collapsed');
            toggleBtn.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === tabName + 'Tab') {
                panel.classList.add('active');
            }
        });
    }

    filterTiles(filter) {
        // Update filter tabs
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Apply filter to table component
        this.tableComponent?.filterTiles(filter);
    }

    async saveBiome() {
        if (!this.currentBiome) return;

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Save biome data
            await this.saveBiomeData(formData);
            
            this.debug('Biome saved successfully');
            this.emit('saved', this.currentBiome);
            
        } catch (error) {
            this.debugError('Failed to save biome:', error);
            this.emit('error', error);
        }
    }

    collectFormData() {
        const formData = {
            name: this.currentBiome.name,
            color: document.getElementById('biomeColorInput')?.value || this.currentBiome.color,
            description: document.getElementById('biomeDescriptionInput')?.value || this.currentBiome.description,
            image: this.currentBiome.image
        };

        return formData;
    }

    async saveBiomeData(formData) {
        // Implementation depends on your data management system
        // This is a placeholder for the actual save logic
        console.log('Saving biome data:', formData);
        
        // Update current biome with new data
        Object.assign(this.currentBiome, formData);
        
        // Update UI
        await this.loadBiomeData(this.currentBiome);
    }

    addTile() {
        this.tableComponent?.addTile();
    }

    importTiles() {
        this.tableComponent?.importTiles();
    }

    cleanTiles() {
        this.tableComponent?.cleanTiles();
    }

    // Configuration methods
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.debug('Configuration updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Event system with prefix support
    emit(event, data) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        const eventListeners = this.eventListeners.get(fullEvent) || [];
        eventListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.debugError('Event listener error:', error);
            }
        });
        
        // Also emit without prefix for backward compatibility
        const legacyListeners = this.eventListeners.get(event) || [];
        legacyListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                this.debugError('Event listener error:', error);
            }
        });
    }

    on(event, listener) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        if (!this.eventListeners.has(fullEvent)) {
            this.eventListeners.set(fullEvent, []);
        }
        this.eventListeners.get(fullEvent).push(listener);
    }

    off(event, listener) {
        const fullEvent = `${this.config.eventPrefix}:${event}`;
        const listeners = this.eventListeners.get(fullEvent);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Debug methods
    debug(message, ...args) {
        if (this.config.debug) {
            console.debug(`[${this.config.eventPrefix}]`, message, ...args);
        }
    }

    debugError(message, error) {
        if (this.config.debug) {
            console.error(`[${this.config.eventPrefix}]`, message, error);
        }
    }

    // Public API
    getCurrentBiome() {
        return this.currentBiome;
    }

    isModalOpen() {
        return this.isOpen;
    }

    getTableComponent() {
        return this.tableComponent;
    }

    getModalElement() {
        return this.modalElement;
    }

    // Lifecycle methods
    destroy() {
        this.removeEventListeners();
        this.tableComponent?.destroy();
        
        if (this.modalElement && this.config.container === document.body) {
            this.modalElement.remove();
        }
        
        this.debug('BiomeModal destroyed');
        this.emit('destroyed');
    }

    // Static factory method for easy instantiation
    static create(options = {}) {
        return new BiomeModal(options);
    }

    // Static method to check if BiomeModal is available
    static isAvailable() {
        return typeof BiomeModal !== 'undefined';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomeModal;
} else if (typeof window !== 'undefined') {
    window.BiomeModal = BiomeModal;
}
