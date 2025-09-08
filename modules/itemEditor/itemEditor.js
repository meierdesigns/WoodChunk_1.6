/**
 * ItemEditor Module - Handles item editor functionality
 */
class ItemEditor {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedItemId = null;
        this.currentCategory = 'all';
        this.isInitialized = false;
        
        // Performance optimizations
        this.itemCache = new Map();
        this.loadingCache = new Map();
        this.lastLoadTime = 0;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Column configuration for each category (will be loaded from files)
        this.columnConfig = {};
        this.sortConfig = {};
        
        console.log('[ItemEditor] Constructor called');
        
        // Load CSS if not already loaded
        this.loadCSS();
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

    loadCSS() {
        // Check if CSS is already loaded
        const existingCSS = document.querySelector('link[href*="itemEditor.css"]');
        if (!existingCSS) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/modules/itemEditor/itemEditor.css';
            cssLink.onload = () => console.log('[ItemEditor] CSS loaded successfully');
            cssLink.onerror = () => console.error('[ItemEditor] Failed to load CSS');
            document.head.appendChild(cssLink);
            console.log('[ItemEditor] CSS loading initiated');
        } else {
            console.log('[ItemEditor] CSS already loaded');
        }
    }

    async initialize() {
        console.log('[ItemEditor] Initializing...');
        
        try {
            // Wait for the module container to be available
            const moduleContainer = document.getElementById('itemEditorContainer');
            if (!moduleContainer) {
                console.error('[ItemEditor] Module container not found');
                return;
            }

            // Setup the editor HTML structure
            this.setupEditor();
            
            // Load saved category preference
            await this.loadSavedCategory();
            
            // Load saved column configuration
            this.loadColumnConfig();
            
            // Initialize category tabs
            this.initializeCategoryTabs();
            
            // Load item assets
            await this.loadItemAssets();
            
            // Load saved items from localStorage
            this.loadSavedItems();
            
            // Initialize table
            this.initializeItemTable();
            
            // Apply saved category filter and show items immediately
            this.filterItemsByCategory(this.currentCategory);
            
            // Ensure items are displayed even if no category is selected
            if (this.filteredItems.length === 0 && this.items.length > 0) {
                this.filteredItems = [...this.items];
                this.updateItemTable();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup dropdown after event listeners
            this.setupDropdown();
            
                        // Setup slider event listeners
            this.setupSliderEventListeners();
            this.setupInventoryGrid();
            
            // Update add item button
            this.updateAddItemButton();
            
            this.isInitialized = true;
            console.log('[ItemEditor] Initialized successfully');
        } catch (error) {
            console.error('[ItemEditor] Failed to initialize:', error);
        }
    }

    setupEditor() {
        console.log('[ItemEditor] Setting up editor...');
        const container = document.getElementById('itemEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="item-editor">
                    <div class="toolbar">
                        <div class="dropdown">
                            <button id="addItemBtn" class="btn btn-primary dropdown-toggle">➕ Neues Item</button>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item" data-category="weapons">⚔️ Waffe</a>
                                <a href="#" class="dropdown-item" data-category="armor">🛡️ Rüstung</a>
                                <a href="#" class="dropdown-item" data-category="potions">🧪 Trank</a>
                                <a href="#" class="dropdown-item" data-category="materials">📦 Material</a>
                                <a href="#" class="dropdown-item" data-category="quest">📜 Quest-Item</a>
                            </div>
                        </div>
                        <button id="configureColumnsBtn" class="btn btn-secondary">⚙️ Spalten konfigurieren</button>
                        <button id="refreshItemsBtn" class="btn btn-info">🔄 Ordner neu scannen</button>
                    </div>
                    
                    <div class="category-tabs">
                        <button class="category-tab active" data-category="all">📋 Alle</button>
                        <button class="category-tab" data-category="weapons">⚔️ Waffen</button>
                        <button class="category-tab" data-category="armor">🛡️ Rüstung</button>
                        <button class="category-tab" data-category="potions">🧪 Tränke</button>
                        <button class="category-tab" data-category="materials">📦 Materialien</button>

                    </div>
                    
                    <div class="table-container">
                        <div class="table-header">
                            <h3 id="categoryTitle">📋 Alle Items</h3>
                        </div>
                        
                        <div class="table-wrapper">
                            <table class="items-table">
                                <thead id="tableHeader">
                                    <!-- Wird dynamisch gefüllt -->
                                </thead>
                                <tbody id="itemsTableBody">
                                    <!-- Wird dynamisch gefüllt -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="item-count">
                            <span id="itemCount">0 Items gefunden</span>
                        </div>
                    </div>
                </div>
                
                <!-- Item Modal -->
                <div id="itemModal" class="item-modal">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modalItemName">Item Details</h3>
                            <button id="closeModalBtn" class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="modal-item-info">
                                <div class="modal-item-icon">
                                    <div class="icon-drop-zone" id="iconDropZone">
                                        <img id="modalItemIcon" src="" alt="" class="modal-icon">
                                        <div class="drop-hint">
                                            <span>📎 Icon hierher ziehen</span>
                                            <small>oder klicken zum Auswählen</small>
                                        </div>
                                        <input type="file" id="iconFileInput" accept="image/*" style="display: none;">
                                    </div>
                                </div>
                                <div class="modal-item-details">
                                    <!-- Basic Properties -->
                                    <div class="detail-section">
                                        <h4 class="section-title">📋 Grundlegende Eigenschaften</h4>
                                    <div class="detail-row">
                                        <label>Name:</label>
                                        <input type="text" id="modalName" class="detail-input">
                                    </div>
                                    <div class="detail-row">
                                        <label>Kategorie:</label>
                                        <span id="modalCategory" class="detail-value"></span>
                                    </div>
                                        <div class="detail-row two-columns">
                                            <div class="detail-col">
                                        <label>Typ:</label>
                                        <select id="modalType" class="detail-input">
                                            <option value="">Typ auswählen...</option>
                                        </select>
                                    </div>
                                            <div class="detail-col">
                                        <label>Material:</label>
                                        <select id="modalMaterial" class="detail-input">
                                            <option value="">Material auswählen...</option>
                                        </select>
                                    </div>
                                        </div>
                                    </div>

                                    <!-- Physical Properties -->
                                    <div class="detail-section">
                                        <h4 class="section-title">⚖️ Physische Eigenschaften</h4>
                                        <div class="detail-row">
                                            <label>Gewicht:</label>
                                            <input type="number" id="modalWeight" class="detail-input" placeholder="Gewicht" min="0" step="0.1">
                                        </div>
                                        <div class="detail-row" id="inventorySizeRow">
                                            <label>Inventargröße:</label>
                                            <div class="inventory-size-container">
                                                <div class="inventory-controls">
                                                    <div class="inventory-slider-group">
                                                        <label>Breite:</label>
                                                        <div class="slider-container">
                                                            <input type="range" id="modalInventoryWidth" class="slider" min="1" max="4" step="1" value="1">
                                                            <span class="slider-value" id="inventoryWidthValue">1</span>
                                                        </div>
                                                    </div>
                                                    <div class="inventory-slider-group">
                                                        <label>Höhe:</label>
                                                        <div class="slider-container">
                                                            <input type="range" id="modalInventoryHeight" class="slider" min="1" max="4" step="1" value="1">
                                                            <span class="slider-value" id="inventoryHeightValue">1</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="inventory-grid" id="modalInventoryGrid">
                                                    <!-- Grid wird dynamisch generiert -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Economic Properties -->
                                    <div class="detail-section">
                                        <h4 class="section-title">💰 Wirtschaftliche Eigenschaften</h4>
                                        <div class="detail-row">
                                            <label>Wert (Gold):</label>
                                            <input type="number" id="modalValue" class="detail-input" min="0">
                                        </div>
                                        <div class="detail-row">
                                            <label>Seltenheit:</label>
                                            <select id="modalRarity" class="detail-input">
                                                <option value="common">Gewöhnlich</option>
                                                <option value="uncommon">Ungewöhnlich</option>
                                                <option value="rare">Selten</option>
                                                <option value="epic">Episch</option>
                                                <option value="legendary">Legendär</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Gameplay Properties -->
                                    <div class="detail-section">
                                        <h4 class="section-title">🎮 Spielmechanik</h4>
                                    <div class="detail-row">
                                        <label>Level:</label>
                                        <input type="number" id="modalLevel" class="detail-input" min="1">
                                    </div>
                                    <div class="detail-row full-width">
                                        <label>Beschreibung:</label>
                                        <textarea id="modalDescription" class="detail-textarea"></textarea>
                                        </div>
                                    </div>
                                    <!-- Category-specific fields -->
                                    <div id="categorySpecificFields">
                                        <div class="detail-section">
                                            <h4 class="section-title">⚔️ Kampfeigenschaften</h4>
                                        <div class="detail-row two-columns" id="damageRow" style="display: none;">
                                            <div class="detail-col">
                                                <label>Schaden (von-bis):</label>
                                                <div class="range-input-group">
                                                    <input type="number" id="modalDamageMin" class="detail-input range-input" placeholder="Min" min="0">
                                                    <span class="range-separator">-</span>
                                                    <input type="number" id="modalDamageMax" class="detail-input range-input" placeholder="Max" min="0">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="detail-row two-columns" id="defenseRow" style="display: none;">
                                            <div class="detail-col">
                                                <label>Verteidigung (von-bis):</label>
                                                <div class="range-input-group">
                                                    <input type="number" id="modalDefenseMin" class="detail-input range-input" placeholder="Min" min="0">
                                                    <span class="range-separator">-</span>
                                                    <input type="number" id="modalDefenseMax" class="detail-input range-input" placeholder="Max" min="0">
                                                </div>
                                            </div>
                                        </div>
                                            <div class="detail-row" id="criticalChanceRow" style="display: none;">
                                                <label>Kritische Chance:</label>
                                                <div class="slider-container">
                                                    <input type="range" id="modalCriticalChance" class="slider" min="0" max="1" step="0.01" value="0.05">
                                                    <span class="slider-value" id="criticalChanceValue">5%</span>
                                                </div>
                                            </div>
                                            <div class="detail-row" id="criticalMultiplierRow" style="display: none;">
                                                <label>Kritischer Multiplikator:</label>
                                                <div class="slider-container">
                                                    <input type="range" id="modalCriticalMultiplier" class="slider" min="1" max="5" step="0.1" value="2.0">
                                                    <span class="slider-value" id="criticalMultiplierValue">2.0x</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="saveItemBtn" class="btn btn-primary">💾 Speichern</button>
                            <button id="duplicateItemBtn" class="btn btn-success">📋 Duplizieren</button>
                            <button id="deleteItemBtn" class="btn btn-danger">🗑️ Löschen</button>
                            <button id="cancelModalBtn" class="btn btn-secondary">❌ Abbrechen</button>
                        </div>
                    </div>
                </div>
                


                <!-- Optimized Modal CSS -->
                <style>
                    /* Compact Modal Layout */
                    .modal-content {
                        max-width: 900px;
                        max-height: 85vh;
                    }
                    
                    .modal-item-info {
                        display: flex;
                        gap: 20px;
                        align-items: flex-start;
                    }
                    
                    .modal-item-icon {
                        flex-shrink: 0;
                        width: 180px;
                    }
                    
                    .icon-drop-zone {
                        height: 160px;
                        border: 2px dashed #ccc;
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #fafafa;
                        transition: border-color 0.3s ease;
                    }
                    
                    .icon-drop-zone:hover {
                        border-color: #007bff;
                        background: #f0f8ff;
                    }
                    
                    .modal-item-details {
                        flex: 1;
                        max-height: 60vh;
                        overflow-y: auto;
                        padding-right: 8px;
                    }
                    
                    /* Compact Section Styling */
                    .detail-section {
                        margin-bottom: 16px;
                        padding: 12px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        border-left: 3px solid #007bff;
                    }
                    
                    .section-title {
                        margin: 0 0 12px 0;
                        font-size: 13px;
                        font-weight: 600;
                        color: #495057;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    /* Compact Row Layouts */
                    .detail-row {
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .detail-row.two-columns {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 12px !important;
                        align-items: start !important;
                    }
                    
                    .detail-col {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 3px !important;
                        width: 100% !important;
                    }
                    
                    .detail-row.full-width {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 6px;
                    }
                    
                    /* Compact Labels and Inputs */
                    .detail-row label {
                        min-width: 100px;
                        font-weight: 500;
                        color: #495057;
                        font-size: 12px;
                    }
                    
                    .detail-row.two-columns label {
                        min-width: auto;
                        font-size: 11px;
                    }
                    
                    .detail-input, .detail-textarea {
                        flex: 1;
                        padding: 6px 10px;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        font-size: 12px;
                        transition: border-color 0.2s ease;
                    }
                    
                    .detail-input:focus, .detail-textarea:focus {
                        outline: none;
                        border-color: #007bff;
                        box-shadow: 0 0 0 2px rgba(0,7,255,0.1);
                    }
                    
                    .detail-textarea {
                        min-height: 60px;
                        resize: vertical;
                        font-family: inherit;
                    }
                    
                    .detail-value {
                        flex: 1;
                        padding: 6px 10px;
                        background: #ffffff;
                        border: 1px solid #e9ecef;
                        border-radius: 4px;
                        color: #6c757d;
                        font-style: italic;
                        font-size: 12px;
                    }
                    
                    /* Range Input Styling */
                    .range-input-group {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        width: 100%;
                    }
                    
                    .range-input {
                        flex: 1;
                        min-width: 0;
                    }
                    
                    .range-separator {
                        color: #6c757d;
                        font-weight: 500;
                        font-size: 12px;
                        user-select: none;
                    }
                    
                    /* Slider Styling */
                    .slider-container {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                    }
                    
                    .slider {
                        flex: 1;
                        height: 6px;
                        border-radius: 3px;
                        background: #e9ecef;
                        outline: none;
                        -webkit-appearance: none;
                        appearance: none;
                    }
                    
                    .slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #007bff;
                        cursor: pointer;
                        border: 2px solid #ffffff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    .slider::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #007bff;
                        cursor: pointer;
                        border: 2px solid #ffffff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    .slider-value {
                        min-width: 60px;
                        text-align: right;
                        font-weight: 500;
                        color: #495057;
                        font-size: 12px;
                    }
                    
                    .inventory-size-container {
                        display: flex;
                        flex-direction: row;
                        gap: 20px;
                        align-items: flex-start;
                    }
                    
                    .inventory-grid {
                        display: grid;
                        gap: 2px;
                        background: #2a2a2a;
                        padding: 10px;
                        border-radius: 5px;
                        border: 2px solid #444;
                    }
                    
                    .inventory-slot {
                        width: 25px;
                        height: 25px;
                        background: #333;
                        border: 1px solid #555;
                        border-radius: 3px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .inventory-slot:hover {
                        background: #444;
                        border-color: #666;
                    }
                    
                    .inventory-slot.selected {
                        background: #4CAF50;
                        border-color: #45a049;
                        box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
                    }
                    
                    .inventory-controls {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        width: 200px;
                        order: -1;
                    }
                    
                    .inventory-slider-group {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                    }
                    
                    .inventory-slider-group label {
                        font-size: 12px;
                        font-weight: 500;
                        color: #495057;
                        margin-bottom: 2px;
                    }
                    
                    /* Custom Scrollbar */
                    .modal-item-details::-webkit-scrollbar {
                        width: 4px;
                    }
                    
                    .modal-item-details::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 2px;
                    }
                    
                    .modal-item-details::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 2px;
                    }
                    
                    .modal-item-details::-webkit-scrollbar-thumb:hover {
                        background: #a8a8a8;
                    }
                    
                    /* Button Styles */
                    .btn {
                        padding: 8px 16px;
                        border: 1px solid transparent;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-decoration: none;
                        display: inline-block;
                        text-align: center;
                    }
                    
                    .btn-primary {
                        background: #007bff;
                        border-color: #007bff;
                        color: white;
                    }
                    
                    .btn-primary:hover {
                        background: #0056b3;
                        border-color: #0056b3;
                    }
                    
                    .btn-success {
                        background: #28a745;
                        border-color: #28a745;
                        color: white;
                    }
                    
                    .btn-success:hover {
                        background: #1e7e34;
                        border-color: #1e7e34;
                    }
                    
                    .btn-danger {
                        background: #dc3545;
                        border-color: #dc3545;
                        color: white;
                    }
                    
                    .btn-danger:hover {
                        background: #c82333;
                        border-color: #bd2130;
                    }
                    
                    .btn-secondary {
                        background: #6c757d;
                        border-color: #6c757d;
                        color: white;
                    }
                    
                    .btn-secondary:hover {
                        background: #545b62;
                        border-color: #4e555b;
                    }
                </style>
                
                <!-- Column Configuration Modal -->
                <div id="columnConfigModal" class="item-modal">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Spalten konfigurieren - <span id="configCategoryTitle">Kategorie</span></h3>
                            <button id="closeColumnConfigBtn" class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="column-config-container">
                                <p>Ziehe die Spalten in die gewünschte Reihenfolge und aktiviere/deaktiviere sie:</p>
                                <div class="column-draggable-list" id="columnDraggableList">
                                    <!-- Wird dynamisch gefüllt -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="saveColumnConfigBtn" class="btn btn-primary">💾 Speichern</button>
                            <button id="cancelColumnConfigBtn" class="btn btn-secondary">❌ Abbrechen</button>
                        </div>
                    </div>
                </div>
                
                <!-- Toast Container -->
                <div id="toastContainer" class="toast-container"></div>
            `;
        }
    }

    async loadSavedCategory() {
        try {
            const savedCategory = localStorage.getItem('itemEditorCategory');
            if (savedCategory) {
                this.currentCategory = savedCategory;
            }
        } catch (error) {
            console.warn('[ItemEditor] Failed to load saved category:', error);
        }
    }

    initializeCategoryTabs() {
        console.log('[ItemEditor] Initializing category tabs...');
        const tabs = document.querySelectorAll('.category-tab');
        console.log('[ItemEditor] Found category tabs:', tabs.length);
        
        tabs.forEach((tab, index) => {
            const category = tab.dataset.category;
            console.log('[ItemEditor] Setting up tab:', category);
            
            // Set initial active state based on saved category
            if (category === this.currentCategory) {
                tab.style.background = '#007bff';
                tab.classList.add('active');
            } else {
                tab.style.background = '#6c757d';
                tab.classList.remove('active');
            }
            
            tab.addEventListener('click', () => {
                console.log('[ItemEditor] Category tab clicked:', category);
                
                // Update tab styles
                tabs.forEach(t => {
                    t.style.background = '#6c757d';
                    t.classList.remove('active');
                });
                tab.style.background = '#007bff';
                tab.classList.add('active');
                
                // Update current category
                this.currentCategory = category;
                
                // Save category preference
                this.saveCurrentCategory();
                
                // Update add item button
                this.updateAddItemButton();
                
                // Filter items by category
                this.filterItemsByCategory(category);
                
                console.log('[ItemEditor] Switched to category:', category);
            });
        });
        
        console.log('[ItemEditor] Category tabs initialized');
        }
    
    async scanCategoryFiles(category) {
        // For now, return a hardcoded list of files for each category
        const fileLists = {
            materials: [
                'adamantium.js', 'amethyst.js', 'bronze.js', 'cloth.js', 'copper.js', 
                'cotton.js', 'crystal.js', 'diamond.js', 'ebony.js', 'emerald.js', 
                'gold.js', 'granite.js', 'iron.js', 'leather.js', 'mahogany.js', 
                'marble.js', 'mythril.js', 'oak.js', 'obsidian.js', 'opal.js', 
                'pine.js', 'ruby.js', 'sapphire.js', 'silk.js', 'silver.js', 
                'steel.js', 'topaz.js', 'wood.js', 'wool.js'
            ],
            weapons: [
                'axe_iron.js', 'bow_wood.js', 'iron_sword.js', 'neue_waffe.js', 
                'neue_waffe_1.js', 'sword_mythril.js', 'sword_steel.js'
            ],
            armor: [
                'armor_chain.js', 'armor_leather.js', 'chain_armor_kopie_1.js'
            ],
            potions: [
                'agilityPotion.js', 'antidotePotion.js', 'berserkPotion.js', 
                'fireResistancePotion.js', 'frostResistancePotion.js', 
                'greaterHealthPotion.js', 'greaterManaPotion.js', 'greaterPoisonPotion.js', 
                'hastePotion.js', 'healthPotion.js', 'invisibilityPotion.js', 
                'intelligencePotion.js', 'levitationPotion.js', 'luckyPotion.js', 
                'manaPotion.js', 'nightVisionPotion.js', 'poisonPotion.js', 
                'potion_health.js', 'regenerationPotion.js', 'staminaPotion.js', 
                'strengthPotion.js', 'ultimateHealingPotion.js', 'waterBreathingPotion.js'
            ],
            quest: [
                'ancient_key.js', 'treasure_map.js'
            ]
        };
        
        return fileLists[category] || [];
    }
    
        async loadItemFile(category, filename) {
        const cacheKey = `${category}/${filename}`;
        
        // Check cache first
        if (this.itemCache.has(cacheKey)) {
            const cachedItem = this.itemCache.get(cacheKey);
            this.items.push(cachedItem);
            return;
        }
        
        // Check if already loading
        if (this.loadingCache.has(cacheKey)) {
            await this.loadingCache.get(cacheKey);
            return;
        }
        
        // Create loading promise
        const loadingPromise = this.loadItemFileFromServer(category, filename, cacheKey);
        this.loadingCache.set(cacheKey, loadingPromise);
        
        try {
            await loadingPromise;
        } finally {
            this.loadingCache.delete(cacheKey);
        }
    }
    
    async loadItemFileFromServer(category, filename, cacheKey) {
        try {
            const filePath = `/assets/items/${category}/${filename}`;
            const response = await fetch(filePath);
            
            if (response.ok) {
                const itemContent = await response.text();
                
                // Optimized parsing with better error handling
                const itemData = this.parseItemContent(itemContent, filename);
                
                if (!itemData) {
                    console.warn(`[ItemEditor] Skipping item ${filename}: Invalid data`);
                    return;
                }
                
                // Validate item data
                if (!itemData.name || itemData.name.trim() === '') {
                    console.warn(`[ItemEditor] Skipping item ${filename}: No name found`);
                    return;
                }
                
                // Transform item data with optimized object creation
                const transformedItem = this.transformItemData(itemData, category, filename);
                
                // Cache the item
                this.itemCache.set(cacheKey, transformedItem);
                
                this.items.push(transformedItem);
                console.log(`[ItemEditor] Loaded item: ${transformedItem.name} (${transformedItem.category})`);
            }
        } catch (error) {
            console.warn(`[ItemEditor] Failed to load item file ${filename}:`, error);
        }
    }
    
    parseItemContent(content, filename) {
        try {
            // Enhanced content cleaning for various export formats
            let cleanContent = content
                // Remove export default statements completely
                .replace(/export\s+default\s*/, '')
                // Remove export const statements
                .replace(/export\s+const\s+\w+\s*=\s*/, '')
                // Remove any remaining export statements
                .replace(/export\s*/, '')
                // Remove comments
                .replace(/\/\/.*$/gm, '')
                // Remove trailing semicolons
                .replace(/;$/, '')
                .trim();
            
            // Find the object definition (everything between { and })
            const objectMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                cleanContent = objectMatch[0];
            } else {
                console.warn(`[ItemEditor] No object found in ${filename}`);
                return null;
            }
            
            // Validate that we have valid object content
            if (!cleanContent.includes('{') || !cleanContent.includes('}')) {
                console.warn(`[ItemEditor] Invalid object content in ${filename}:`, cleanContent);
                return null;
            }
            
            // Parse the object
            const parsedObject = eval('(' + cleanContent + ')');
            
            // Validate the parsed object
            if (!parsedObject || typeof parsedObject !== 'object') {
                console.warn(`[ItemEditor] Invalid parsed object in ${filename}:`, parsedObject);
                return null;
            }
            
            return parsedObject;
        } catch (error) {
            console.warn(`[ItemEditor] Failed to parse ${filename}:`, error);
            return null;
        }
    }
    
    transformItemData(itemData, category, filename) {
        // Use object spread for better performance
        return {
            id: itemData.id || filename.replace('.js', ''),
            name: itemData.name || 'Unknown Item',
            category: itemData.category || category,
            level: itemData.level || 1,
            rarity: itemData.rarity || 'common',
            value: itemData.buyPrice || itemData.sellPrice || itemData.value || 0,
            icon: itemData.icon || this.getEmojiIcon(itemData.category, itemData.type),
            type: itemData.type || 'unknown',
            material: itemData.material || 'unknown',
            description: itemData.description || '',
            damage: itemData.damage || 0,
            defense: itemData.defense || 0,
            weight: itemData.weight || 0,
            durability: itemData.durability || 0,
            sellPrice: itemData.sellPrice || 0,
            buyPrice: itemData.buyPrice || 0,
            stackSize: itemData.stackSize || 1,
            color: itemData.color || '',
            iconFrame: itemData.iconFrame || 'common',
            effects: itemData.effects || [],
            enchantments: itemData.enchantments || []
        };
    }
    
    // Helper function to generate random values within a range
    getRandomValue(min, max, fallbackMin, fallbackMax, shouldRound = true) {
        let result;
        if (min !== undefined && max !== undefined) {
            // If both min and max are provided, generate random value in that range
            result = Math.random() * (max - min) + min;
        } else if (min !== undefined) {
            // If only min is provided, generate random value from min to min*2
            result = Math.random() * min + min;
        } else {
            // If no range provided, use fallback range
            result = Math.random() * (fallbackMax - fallbackMin) + fallbackMin;
        }
        
        // Round the result if shouldRound is true (default for most values)
        return shouldRound ? Math.round(result) : result;
    }

        async loadItemAssets() {
        console.log('[ItemEditor] Loading items with optimized batch processing...');
        
        // Check if we should use cache
        const now = Date.now();
        if (this.lastLoadTime > 0 && (now - this.lastLoadTime) < this.cacheExpiry && this.items.length > 0) {
            console.log('[ItemEditor] Using cached items, skipping reload');
            return;
        }
        
        try {
            this.items = [];
            
            // Load all categories in parallel for better performance
            const loadPromises = [
                this.loadMaterialsFromFile(),
                this.loadCategoryBatch('weapons'),
                this.loadCategoryBatch('armor'),
                this.loadCategoryBatch('potions'),
                this.loadCategoryBatch('quest')
            ];
            
            // Wait for all categories to load
            await Promise.all(loadPromises);
            
            // Update last load time
            this.lastLoadTime = now;
            
            console.log(`[ItemEditor] Loaded ${this.items.length} items total`);
            
            // Update table with items
            this.updateItemTable();
            
        } catch (error) {
            console.error('[ItemEditor] Failed to load items, falling back to mock data:', error);
            this.loadMockData();
        }
    }
    
    async loadCategoryBatch(category) {
        console.log(`[ItemEditor] Loading category batch: ${category}`);
        try {
            const files = await this.scanCategoryFiles(category);
            
            // Process files in batches of 5 for better performance
            const batchSize = 5;
            const batches = [];
            
            for (let i = 0; i < files.length; i += batchSize) {
                batches.push(files.slice(i, i + batchSize));
            }
            
            // Process batches sequentially to avoid overwhelming the server
            for (const batch of batches) {
                const batchPromises = batch.map(file => 
                    this.loadItemFile(category, file)
                );
                
                await Promise.all(batchPromises);
                
                // Small delay between batches to prevent server overload
                if (batches.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            console.log(`[ItemEditor] Completed loading ${files.length} files for ${category}`);
            
        } catch (error) {
            console.warn(`[ItemEditor] Failed to load category ${category}:`, error);
        }
    }
    
    async loadMaterialsFromFile() {
        try {
            const response = await fetch('/assets/items/materials.js');
            if (response.ok) {
                const content = await response.text();
                
                // Parse the materials object from the JS file
                const materialsMatch = content.match(/export const materials = ({[\s\S]*?});/);
                if (materialsMatch) {
                    const materialsData = eval('(' + materialsMatch[1] + ')');
                    
                    // Convert materials object to array of items
                    Object.entries(materialsData).forEach(([key, material]) => {
                        const transformedItem = {
                            id: key,
                            name: material.name,
                            category: material.category,
                            level: material.level || 1,
                            rarity: material.rarity || 'common',
                            value: material.buyPrice || material.sellPrice || 0,
                            icon: material.icon || this.getEmojiIcon(material.category, material.material),
                            type: material.material || 'unknown',
                            material: material.material || 'unknown',
                            description: material.description || '',
                            damage: 0,
                            defense: 0,
                            weight: material.weight || 0,
                            durability: material.durability || 0,
                            sellPrice: material.sellPrice || 0,
                            buyPrice: material.buyPrice || 0,
                            stackSize: 1,
                            color: '',
                            iconFrame: 'common',
                            effects: [],
                            enchantments: []
                        };
                        
                        this.items.push(transformedItem);
                        console.log(`[ItemEditor] Loaded material: ${transformedItem.name} (${transformedItem.category})`);
                    });
                    
                    console.log(`[ItemEditor] Loaded ${Object.keys(materialsData).length} materials from materials.js`);
                }
            }
        } catch (error) {
            console.warn('[ItemEditor] Failed to load materials.js, trying individual files:', error);
            // Fallback to individual material files
            const materialFiles = await this.scanCategoryFiles('materials');
            for (const file of materialFiles) {
                if (file.endsWith('.js') && file !== 'columns.js') {
                    await this.loadItemFile('materials', file);
                }
            }
        }
    }

    loadMockData() {
        console.log('[ItemEditor] Loading mock data...');
        this.items = [
            { 
                id: 1, 
                name: 'Iron Sword', 
                category: 'weapons', 
                type: 'sword',
                material: 'iron',
                level: 1, 
                rarity: 'common', 
                value: 150, 
                icon: '⚔️',
                damage: 25,
                weight: 3.2,
                durability: 100,
                sellPrice: 75,
                buyPrice: 150,
                description: 'A basic iron sword for beginners'
            },
            { 
                id: 2, 
                name: 'Steel Axe', 
                category: 'weapons', 
                type: 'axe',
                material: 'steel',
                level: 5, 
                rarity: 'uncommon', 
                value: 280, 
                icon: '🪓',
                damage: 35,
                weight: 4.5,
                durability: 120,
                sellPrice: 140,
                buyPrice: 280,
                description: 'A sturdy steel axe for experienced warriors'
            },
            { 
                id: 3, 
                name: 'Leather Armor', 
                category: 'armor', 
                type: 'chest',
                material: 'leather',
                level: 1, 
                rarity: 'common', 
                value: 120, 
                icon: '🛡️',
                defense: 8,
                weight: 4.0,
                durability: 80,
                sellPrice: 60,
                buyPrice: 120,
                description: 'Basic leather armor for protection'
            },
            { 
                id: 4, 
                name: 'Chain Mail', 
                category: 'armor', 
                type: 'chest',
                material: 'metal',
                level: 8, 
                rarity: 'uncommon', 
                value: 450, 
                icon: '🔗',
                defense: 15,
                weight: 8.0,
                durability: 150,
                sellPrice: 225,
                buyPrice: 450,
                description: 'Heavy chain mail for maximum protection'
            },
            { 
                id: 5, 
                name: 'Health Potion', 
                category: 'potions', 
                type: 'health',
                material: 'herb',
                level: 1, 
                rarity: 'common', 
                value: 25, 
                icon: '🧪',
                weight: 0.5,
                durability: 1,
                sellPrice: 12,
                buyPrice: 25,
                description: 'Restores health when consumed'
            }
        ];
        
        console.log('[ItemEditor] Mock data loaded');
        this.updateItemTable();
    }

    getItemIcon(category, type, itemName = '') {
        // First try to find a PNG icon with the same name
        if (itemName) {
            const iconPath = this.generateIconPath(category, itemName);
            // Return both icon and fallback, icon will be hidden if it fails to load
            const emojiIcon = this.getEmojiIcon(category, type);
            return `<img src="${iconPath}" alt="${itemName}" class="item-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" /><span class="fallback-icon" style="display: none;">${emojiIcon}</span>`;
        }
        
        // Fallback to emoji icons only
        const emojiIcon = this.getEmojiIcon(category, type);
        return `<span class="fallback-icon">${emojiIcon}</span>`;
    }

    generateIconPath(category, itemName) {
        // Convert item name to a more sensible filename
        let filename = itemName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
        
        // Handle special cases for better filename matching
        const specialCases = {
            'iron_axe': 'axe_iron',
            'wooden_bow': 'bow_wood',
            'iron_sword_kopie': 'iron_sword',
            'mythril_sword': 'sword_mythril',
            'steel_sword': 'sword_steel',
            'chain_armor_kopie': 'armor_chain',
            'health_potion': 'potion_health'
        };
        
        if (specialCases[filename]) {
            filename = specialCases[filename];
        }
        
        return `assets/items/${category}/${filename}.png`;
    }

    getEmojiIcon(category, type) {
        const iconMap = {
            weapons: {
                sword: '⚔️',
                axe: '🪓',
                bow: '🏹',
                dagger: '🗡️',
                default: '⚔️'
            },
            armor: {
                chest: '🛡️',
                helmet: '⛑️',
                boots: '👢',
                gloves: '🧤',
                default: '🛡️'
            },
            potions: {
                health: '🧪',
                mana: '🔮',
                default: '🧪'
            },
            materials: {
                ore: '⛏️',
                wood: '🪵',
                gem: '💎',
                default: '📦'
            },
            quest: {
                key: '🗝️',
                scroll: '📜',
                map: '🗺️',
                default: '📜'
            }
        };
        
        return iconMap[category]?.[type] || iconMap[category]?.default || '📦';
    }

    initializeItemTable() {
        console.log('[ItemEditor] Initializing item table...');
        this.updateItemTable();
        console.log('[ItemEditor] Item table initialized');
    }

    updateTableHeader() {
        const tableHeader = document.getElementById('tableHeader');
        if (!tableHeader) {
            console.error('[ItemEditor] Table header not found');
            return;
        }

        const config = this.columnConfig[this.currentCategory] || this.columnConfig.weapons;
        
        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.className = 'table-header-row';
        
        // Sort columns by order property
        const sortedColumns = Object.entries(config)
            .filter(([key, column]) => column.enabled)
            .sort((a, b) => a[1].order - b[1].order);
        
        sortedColumns.forEach(([key, column]) => {
            const th = document.createElement('th');
            th.className = 'table-header-cell';
            
            // No text for icon and actions columns
            if (key !== 'icon' && key !== 'actions') {
                th.textContent = column.label;
            }
            
            if (column.width) {
                th.style.width = column.width;
            }
            
            // Add sort indicator if column is sortable
            if (column.sortable) {
                th.classList.add('sortable');
                th.style.cursor = 'pointer';
                
                // Add sort icon
                const sortIcon = document.createElement('span');
                sortIcon.className = 'sort-icon';
                sortIcon.textContent = '↕️';
                th.appendChild(sortIcon);
                
                // Add click handler for sorting
                th.addEventListener('click', () => this.sortByColumn(key));
            }
            
            headerRow.appendChild(th);
        });
        
        // Clear and update header
        tableHeader.innerHTML = '';
        tableHeader.appendChild(headerRow);
        
        console.log(`[ItemEditor] Updated table header for category: ${this.currentCategory}`);
    }

    updateItemTable() {
        const tableBody = document.getElementById('itemsTableBody');
        if (!tableBody) {
            console.error('[ItemEditor] Table body not found');
            return;
        }

        // Update table header first
        this.updateTableHeader();

        // Clear existing rows
        tableBody.innerHTML = '';

        // Add items to table
        this.filteredItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            row.dataset.itemId = item.id;
            
            if (this.selectedItemId === item.id) {
                row.classList.add('selected');
            }

            // Create row content based on column configuration
            let rowContent = '';
            const config = this.columnConfig[item.category] || this.columnConfig.weapons;
            
            // Sort columns by order property
            const sortedColumns = Object.entries(config)
                .filter(([key, column]) => column.enabled)
                .sort((a, b) => a[1].order - b[1].order);
            
            sortedColumns.forEach(([key, column]) => {
                switch (key) {
                    case 'icon':
                        rowContent += `
                            <td class="table-cell item-icon-cell">
                                <span class="item-placeholder">${item.icon}</span>
                            </td>`;
                        break;
                    case 'name':
                        rowContent += `
                            <td class="table-cell">
                                <span class="item-name-link" data-item-id="${item.id}" title="Klicken um Details zu öffnen">${item.name}</span>
                            </td>`;
                        break;
                    case 'level':
                        rowContent += `
                            <td class="table-cell">${Math.round(item.level || 0)}</td>`;
                        break;
                    case 'rarity':
                        rowContent += `
                            <td class="table-cell">
                                <span class="rarity rarity-${item.rarity}">${item.rarity}</span>
                            </td>`;
                        break;
                    case 'value':
                        rowContent += `
                            <td class="table-cell">${Math.round(item.value || 0)} Gold</td>`;
                        break;
                    case 'actions':
                        rowContent += `
                            <td class="table-cell center">
                                <button class="action-btn action-btn-edit" data-item-id="${item.id}">✏️</button>
                                <button class="action-btn action-btn-delete" data-item-id="${item.id}">🗑️</button>
                            </td>`;
                        break;
                }
            });
            
            row.innerHTML = rowContent;

            // Add click handler for row selection
            row.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn') && !e.target.classList.contains('item-name-link')) {
                    this.selectItem(item.id);
                }
            });

            // Add click handler for item name links
            const nameLink = row.querySelector('.item-name-link');
            if (nameLink) {
                nameLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.itemEditor.openItemModal(item);
                });
            }

            // Add event listeners for action buttons
            const editBtn = row.querySelector('.action-btn-edit');
            const deleteBtn = row.querySelector('.action-btn-delete');
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editItem(item.id);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteItem(item.id);
                });
            }

            tableBody.appendChild(row);
        });

        // Update item count
        const itemCount = document.getElementById('itemCount');
        if (itemCount) {
            itemCount.textContent = `${this.filteredItems.length} Items gefunden`;
        }

        // Update category title
        const categoryTitle = document.getElementById('categoryTitle');
        if (categoryTitle) {
            const categoryNames = {
                'all': '📋 Alle Items',
                'weapons': '⚔️ Waffen',
                'armor': '🛡️ Rüstung',
                'potions': '🧪 Tränke',
                'materials': '📦 Materialien',
                'quest': '📜 Quest'
            };
            categoryTitle.textContent = categoryNames[this.currentCategory] || this.currentCategory;
        }
    }

    filterItemsByCategory(category) {
        console.log('[ItemEditor] Filtering items by category:', category);
        
        if (category === 'all') {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => item.category === category);
        }
        
        // If no items found in category, show all items as fallback
        if (this.filteredItems.length === 0 && this.items.length > 0) {
            console.log('[ItemEditor] No items found in category, showing all items');
            this.filteredItems = [...this.items];
        }
        
        this.currentPage = 1;
        this.updateItemTable();
        console.log('[ItemEditor] Filtered items:', this.filteredItems.length);
    }

    selectItem(itemId) {
        console.log('[ItemEditor] Selecting item:', itemId);
        
        // Remove previous selection
        const prevSelected = document.querySelector('.table-row.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add selection to current row
        const currentRow = document.querySelector(`[data-item-id="${itemId}"]`);
        if (currentRow) {
            currentRow.classList.add('selected');
        }
        
        this.selectedItemId = itemId;
    }

    createNewItem(category = null) {
        console.log('[ItemEditor] Creating new item with category:', category);
        
        // Use provided category or current category
        const itemCategory = category || this.currentCategory;
        
        // Generate unique name to avoid duplicates
        const baseName = this.getBaseNameForCategory(itemCategory);
        const uniqueName = this.generateUniqueName(baseName, itemCategory);
        
        const newItem = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: uniqueName,
            category: itemCategory,
            level: 1,
            rarity: 'common',
            value: 0,
            icon: this.getEmojiIcon(itemCategory, 'default'),
            type: this.getDefaultTypeForCategory(itemCategory),
            material: this.getDefaultMaterialForCategory(itemCategory),
            weight: 1,
            description: `Ein neues ${this.getCategoryDisplayName(itemCategory)}`,
            filename: this.generateFilename(uniqueName, itemCategory),
            // Add inventory size based on category
            inventoryWidth: this.getDefaultInventoryWidth(itemCategory),
            inventoryHeight: this.getDefaultInventoryHeight(itemCategory),
            // Add category-specific properties
            damage: itemCategory === 'weapons' ? 1 : 0,
            damageMax: itemCategory === 'weapons' ? 1 : 0,
            criticalChance: itemCategory === 'weapons' ? 0.05 : 0,
            criticalMultiplier: itemCategory === 'weapons' ? 2.0 : 1.0,
            defense: itemCategory === 'armor' ? 1 : 0,
            defenseMax: itemCategory === 'armor' ? 1 : 0
        };
        
        this.items.push(newItem);
        
        // Switch to the category tab if a specific category was selected
        if (category && category !== this.currentCategory) {
            this.switchToCategory(category);
        }
        
        // Create the actual JS file
        this.createItemFile(newItem);
        
        this.filterItemsByCategory(this.currentCategory);
        this.selectItem(newItem.id);
        
        // Open edit modal for the new item
        this.openEditModal(newItem);
        
        console.log('[ItemEditor] New item created and saved:', newItem);
        
        // Show success message
        this.showToast(`Item "${uniqueName}" wurde erfolgreich erstellt!`, 'success');
    }

    getBaseNameForCategory(category) {
        const baseNames = {
            weapons: 'Neue Waffe',
            armor: 'Neue Rüstung',
            potions: 'Neuer Trank',
            materials: 'Neues Material',
            quest: 'Neues Quest-Item'
        };
        return baseNames[category] || 'Neues Item';
    }

    generateUniqueName(baseName, category) {
        let counter = 1;
        let name = baseName;
        
        // Check if name already exists
        while (this.items.some(item => item.name === name && item.category === category)) {
            name = `${baseName} ${counter}`;
            counter++;
        }
        
        return name;
    }

    getDefaultTypeForCategory(category) {
        const defaultTypes = {
            weapons: 'sword',
            armor: 'chest',
            potions: 'potion',
            materials: 'material',
            quest: 'quest'
        };
        return defaultTypes[category] || 'item';
    }

    getDefaultMaterialForCategory(category) {
        const defaultMaterials = {
            weapons: 'iron',
            armor: 'leather',
            potions: 'potion',
            materials: 'material',
            quest: 'quest'
        };
        return defaultMaterials[category] || 'basic';
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            weapons: 'Waffe',
            armor: 'Rüstung',
            potions: 'Trank',
            materials: 'Material',
            quest: 'Quest-Item'
        };
        return displayNames[category] || 'Item';
    }

    toggleDropdown() {
        console.log('[ItemEditor] Toggle dropdown called');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        console.log('[ItemEditor] Dropdown menu found:', dropdownMenu);
        if (dropdownMenu) {
            const isVisible = dropdownMenu.classList.contains('show');
            console.log('[ItemEditor] Dropdown currently visible:', isVisible);
            dropdownMenu.classList.toggle('show');
            console.log('[ItemEditor] Dropdown toggled, now visible:', dropdownMenu.classList.contains('show'));
        } else {
            console.warn('[ItemEditor] Dropdown menu not found!');
        }
    }

    switchToCategory(category) {
        // Find and click the appropriate category tab
        const tabButton = document.querySelector(`[data-category="${category}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }

    setupDropdown() {
        console.log('[ItemEditor] Setting up dropdown...');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        console.log('[ItemEditor] Setting up dropdown, found:', dropdownMenu);
        
        if (dropdownMenu) {
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown')) {
                    dropdownMenu.classList.remove('show');
                }
            });

            // Close dropdown with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                }
            });

            // Handle dropdown item clicks
            const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
            console.log('[ItemEditor] Found dropdown items:', dropdownItems.length);
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const category = item.getAttribute('data-category');
                    console.log('[ItemEditor] Dropdown item clicked, category:', category);
                    this.createNewItem(category);
                    dropdownMenu.classList.remove('show');
                });
            });
            
            console.log('[ItemEditor] Dropdown setup complete');
        } else {
            console.error('[ItemEditor] Dropdown menu not found! Retrying in 1 second...');
            // Retry after 1 second if still not found
            setTimeout(() => this.setupDropdown(), 1000);
        }
    }

    editItem(itemId) {
        console.log('[ItemEditor] Editing item:', itemId);
        
        // Suche zuerst in den gefilterten Daten (was in der Tabelle angezeigt wird)
        let item = this.filteredItems.find(i => i.id === itemId);
        
        // Fallback: Suche in allen Daten falls nicht in gefilterten gefunden
        if (!item) {
            item = this.items.find(i => i.id === itemId);
        }
        
        if (item) {
            console.log('[ItemEditor] Found item for editing:', item);
            console.log('[ItemEditor] Source:', item === this.filteredItems.find(i => i.id === itemId) ? 'filtered' : 'all');
            this.openEditModal(item);
        } else {
            console.error('[ItemEditor] Item not found for editing:', itemId);
        }
    }

    async openEditModal(item) {
        console.log('[ItemEditor] Opening edit modal for item:', item);
        
        // Suche die aktuellen Daten aus dem filteredItems Array
        let currentItem = this.filteredItems.find(i => i.id === item.id);
        if (!currentItem) {
            currentItem = item; // Fallback auf übergebene Daten
        }
        
        console.log('[ItemEditor] Using item data from:', currentItem === item ? 'passed data' : 'filtered data');
        console.log('[ItemEditor] Current item data:', currentItem);
        
        // Fill modal fields with current data
        console.log('[ItemEditor] Filling modal fields with:', {
            name: currentItem.name,
            type: currentItem.type,
            material: currentItem.material,
            category: currentItem.category
        });
        
        // Check if DOM elements exist - ALL elements must be declared first
        const modalItemName = document.getElementById('modalItemName');
        const modalName = document.getElementById('modalName');
        const modalCategory = document.getElementById('modalCategory');
        const modalType = document.getElementById('modalType');
        const modalMaterial = document.getElementById('modalMaterial');
        const modalWeight = document.getElementById('modalWeight');
        const modalValue = document.getElementById('modalValue');
        const modalRarity = document.getElementById('modalRarity');
        const modalLevel = document.getElementById('modalLevel');
        const modalDescription = document.getElementById('modalDescription');
        const modalDamageMin = document.getElementById('modalDamageMin');
        const modalDamageMax = document.getElementById('modalDamageMax');
        const modalDefenseMin = document.getElementById('modalDefenseMin');
        const modalDefenseMax = document.getElementById('modalDefenseMax');
        const modalCriticalChance = document.getElementById('modalCriticalChance');
        const modalCriticalMultiplier = document.getElementById('modalCriticalMultiplier');
        const modalItemIcon = document.getElementById('modalItemIcon');
        
        console.log('[ItemEditor] DOM elements found:', {
            modalItemName: !!modalItemName,
            modalName: !!modalName,
            modalCategory: !!modalCategory,
            modalType: !!modalType,
            modalMaterial: !!modalMaterial,
            modalWeight: !!modalWeight,
            modalValue: !!modalValue,
            modalRarity: !!modalRarity,
            modalLevel: !!modalLevel,
            modalDescription: !!modalDescription,
            modalDamageMin: !!modalDamageMin,
            modalDamageMax: !!modalDamageMax,
            modalDefenseMin: !!modalDefenseMin,
            modalDefenseMax: !!modalDefenseMax,
            modalCriticalChance: !!modalCriticalChance,
            modalCriticalMultiplier: !!modalCriticalMultiplier,
            modalItemIcon: !!modalItemIcon
        });
        
        if (modalItemName) modalItemName.textContent = currentItem.name || '';
        if (modalName) modalName.value = currentItem.name || '';
        if (modalCategory) modalCategory.textContent = currentItem.category || '';
        
        // Store current item for saving FIRST
        this.currentEditItem = currentItem;
        
        // Update dropdowns FIRST with preserved values
        await this.updateTypeDropdown(item.category, currentItem.type);
        
        // Update material dropdown only for non-materials
        if (item.category !== 'materials') {
            await this.updateMaterialDropdown(currentItem.material);
        }
        
        // NOW set all field values AFTER dropdowns are ready
        if (modalType) modalType.value = currentItem.type || '';
        if (modalMaterial) modalMaterial.value = currentItem.material || '';
        
        // Set all other fields with DOM validation (using already declared variables)
        if (modalWeight) modalWeight.value = Math.round((currentItem.weight || 0) * 10) / 10;
        if (modalValue) modalValue.value = Math.round(currentItem.value || 0);
        if (modalRarity) modalRarity.value = currentItem.rarity || 'common';
        if (modalLevel) modalLevel.value = Math.round(currentItem.level || 1);
        if (modalDescription) modalDescription.value = currentItem.description || '';
        
        // Set inventory size
        this.inventoryWidth = currentItem.inventoryWidth || this.getDefaultInventoryWidth(currentItem.category);
        this.inventoryHeight = currentItem.inventoryHeight || this.getDefaultInventoryHeight(currentItem.category);
        this.generateInventoryGrid();
        this.updateInventorySliderValues();
        
        // Set slider values
        const widthSlider = document.getElementById('modalInventoryWidth');
        const heightSlider = document.getElementById('modalInventoryHeight');
        if (widthSlider) widthSlider.value = this.inventoryWidth;
        if (heightSlider) heightSlider.value = this.inventoryHeight;
        
        // Fill category-specific fields with DOM validation
        if (currentItem.category === 'weapons') {
            if (modalDamageMin) modalDamageMin.value = currentItem.damageMin || currentItem.damage || 0;
            if (modalDamageMax) modalDamageMax.value = currentItem.damageMax || currentItem.damage || 0;
            if (modalCriticalChance) {
                modalCriticalChance.value = currentItem.criticalChance || 0.05;
                this.updateSliderValue('criticalChance', modalCriticalChance.value);
            }
            if (modalCriticalMultiplier) {
                modalCriticalMultiplier.value = currentItem.criticalMultiplier || 2.0;
                this.updateSliderValue('criticalMultiplier', modalCriticalMultiplier.value);
            }
        } else if (currentItem.category === 'armor') {
            if (modalDefenseMin) modalDefenseMin.value = currentItem.defenseMin || currentItem.defense || 0;
            if (modalDefenseMax) modalDefenseMax.value = currentItem.defenseMax || currentItem.defense || 0;
        }
        
        // Update item icon if available with DOM validation
        if (currentItem.icon && modalItemIcon) {
            if (currentItem.icon.startsWith('http') || currentItem.icon.startsWith('assets/')) {
                modalItemIcon.src = currentItem.icon;
                modalItemIcon.style.display = 'block';
            } else {
                // Fallback für Emoji-Icons
                modalItemIcon.style.display = 'none';
                const iconContainer = modalItemIcon.parentElement;
                const emojiSpan = iconContainer.querySelector('.item-emoji') || 
                    document.createElement('span');
                emojiSpan.className = 'item-emoji';
                emojiSpan.textContent = currentItem.icon;
                emojiSpan.style.fontSize = '32px';
                if (!iconContainer.querySelector('.item-emoji')) {
                    iconContainer.appendChild(emojiSpan);
                }
            }
        }
        
        // Values are already set above, no need to set them again
        
        // Show/hide category-specific fields
        this.showCategorySpecificFields(currentItem.category);
        
        // Ensure category-specific fields are properly filled
        setTimeout(() => {
            this.showCategorySpecificFields(currentItem.category);
        }, 100);
        
        // Show modal
        document.getElementById('itemModal').style.display = 'block';
        
        // Ensure values are set after modal is fully displayed
        setTimeout(() => {
            console.log('[ItemEditor] ✅ FINAL VERIFICATION - Re-checking modal values after delay...');
            console.log('[ItemEditor] 📋 Item data being verified:', {
                name: currentItem.name,
                type: currentItem.type,
                material: currentItem.material,
                category: currentItem.category
            });
            
            // FORCE set critical values one more time
            if (modalName) {
                modalName.value = currentItem.name || '';
                console.log('[ItemEditor] ✅ Final modalName.value:', modalName.value, '(expected:', currentItem.name + ')');
            }
            if (modalType) {
                modalType.value = currentItem.type || '';
                console.log('[ItemEditor] ✅ Final modalType.value:', modalType.value, '(expected:', currentItem.type + ')');
                console.log('[ItemEditor] 🔍 Type dropdown options available:', Array.from(modalType.options).map(o => o.value));
            }
            if (modalMaterial) {
                modalMaterial.value = currentItem.material || '';
                console.log('[ItemEditor] ✅ Final modalMaterial.value:', modalMaterial.value, '(expected:', currentItem.material + ')');
                console.log('[ItemEditor] 🔍 Material dropdown options available:', Array.from(modalMaterial.options).map(o => o.value));
            }
            
            // Verify all other fields
            if (modalWeight) console.log('[ItemEditor] ✅ modalWeight.value:', modalWeight.value, '(expected:', currentItem.weight + ')');
            if (modalValue) console.log('[ItemEditor] ✅ modalValue.value:', modalValue.value, '(expected:', currentItem.value + ')');
            if (modalRarity) console.log('[ItemEditor] ✅ modalRarity.value:', modalRarity.value, '(expected:', currentItem.rarity + ')');
            if (modalLevel) console.log('[ItemEditor] ✅ modalLevel.value:', modalLevel.value, '(expected:', currentItem.level + ')');
            if (modalDescription) console.log('[ItemEditor] ✅ modalDescription.value:', modalDescription.value, '(expected:', currentItem.description + ')');
            
            console.log('[ItemEditor] 🎯 DIAGNOSIS COMPLETE - Check if values match expectations above!');
            
            // Setup range validation
            this.setupRangeValidation();
        }, 100);
    }
    
    setupRangeValidation() {
        // Damage range validation
        const damageMin = document.getElementById('modalDamageMin');
        const damageMax = document.getElementById('modalDamageMax');
        
        if (damageMin && damageMax) {
            damageMin.addEventListener('input', () => {
                const minValue = parseInt(damageMin.value) || 0;
                damageMax.min = minValue;
                if (parseInt(damageMax.value) < minValue) {
                    damageMax.value = minValue;
                }
                // Trigger change event to update the item data
                damageMax.dispatchEvent(new Event('change'));
            });
            
            damageMax.addEventListener('input', () => {
                const maxValue = parseInt(damageMax.value) || 0;
                damageMin.max = maxValue;
                if (parseInt(damageMin.value) > maxValue) {
                    damageMin.value = maxValue;
                }
                // Trigger change event to update the item data
                damageMin.dispatchEvent(new Event('change'));
            });
        }
        
        // Defense range validation
        const defenseMin = document.getElementById('modalDefenseMin');
        const defenseMax = document.getElementById('modalDefenseMax');
        
        if (defenseMin && defenseMax) {
            defenseMin.addEventListener('input', () => {
                const minValue = parseInt(defenseMin.value) || 0;
                defenseMax.min = minValue;
                if (parseInt(defenseMax.value) < minValue) {
                    defenseMax.value = minValue;
                }
                // Trigger change event to update the item data
                defenseMax.dispatchEvent(new Event('change'));
            });
            
            defenseMax.addEventListener('input', () => {
                const maxValue = parseInt(defenseMax.value) || 0;
                defenseMin.max = maxValue;
                if (parseInt(defenseMin.value) > maxValue) {
                    defenseMin.value = maxValue;
                }
                // Trigger change event to update the item data
                defenseMin.dispatchEvent(new Event('change'));
            });
        }
    }

    async updateTypeDropdown(category, preserveValue = null) {
        const typeSelect = document.getElementById('modalType');
        if (!typeSelect) return;
        
        // Store current value before clearing (prefer preserveValue over current value)
        const currentValue = preserveValue !== null ? preserveValue : typeSelect.value;
        
        // Clear existing options
        typeSelect.innerHTML = '<option value="">Typ auswählen...</option>';
        
        // Define types for each category with emojis
        const categoryTypes = {
            weapons: [
                { value: 'sword', label: '⚔️ Schwert' },
                { value: 'axe', label: '🪓 Axt' },
                { value: 'bow', label: '🏹 Bogen' },
                { value: 'dagger', label: '🗡️ Dolch' },
                { value: 'staff', label: '🦯 Stab' },
                { value: 'wand', label: '🪄 Zauberstab' },
                { value: 'mace', label: '🔨 Streitkolben' },
                { value: 'spear', label: '🔱 Speer' },
                { value: 'crossbow', label: '🏹 Armbrust' }
            ],
            armor: [
                { value: 'helmet', label: '⛑️ Helm' },
                { value: 'chest', label: '🛡️ Brustplatte' },
                { value: 'shoulders', label: '👔 Schultern' },
                { value: 'gloves', label: '🧤 Handschuhe' },
                { value: 'belt', label: '👖 Gürtel' },
                { value: 'pants', label: '👖 Hose' },
                { value: 'boots', label: '👢 Stiefel' },
                { value: 'shield', label: '🛡️ Schild' },
                { value: 'ring', label: '💍 Ring' },
                { value: 'necklace', label: '📿 Halskette' }
            ],
            potions: [
                { value: 'health', label: '❤️ Heilung' },
                { value: 'mana', label: '🔮 Mana' },
                { value: 'stamina', label: '⚡ Ausdauer' },
                { value: 'strength', label: '💪 Stärke' },
                { value: 'agility', label: '🏃 Geschicklichkeit' },
                { value: 'intelligence', label: '🧠 Intelligenz' },
                { value: 'poison', label: '☠️ Gift' },
                { value: 'antidote', label: '💊 Gegengift' }
            ],
            materials: [
                { value: 'ore', label: '⛏️ Erz' },
                { value: 'wood', label: '🪵 Holz' },
                { value: 'gem', label: '💎 Edelstein' },
                { value: 'herb', label: '🌿 Kraut' },
                { value: 'leather', label: '🦔 Leder' },
                { value: 'cloth', label: '🧵 Stoff' },
                { value: 'metal', label: '⚒️ Metall' },
                { value: 'crystal', label: '💎 Kristall' }
            ],
            quest: [
                { value: 'key', label: '🗝️ Schlüssel' },
                { value: 'scroll', label: '📜 Schriftrolle' },
                { value: 'map', label: '🗺️ Karte' },
                { value: 'document', label: '📄 Dokument' },
                { value: 'artifact', label: '🏺 Artefakt' },
                { value: 'relic', label: '⚜️ Reliquie' },
                { value: 'trophy', label: '🏆 Trophäe' }
            ]
        };
        
        // Add types for the selected category
        const types = categoryTypes[category] || [];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            typeSelect.appendChild(option);
        });
        
                                // Handle materials category differently
                        if (category === 'materials') {
                            // Hide type and material dropdowns for materials
                            this.updateMaterialDropdownForMaterials();
                        } else if (category === 'weapons' || category === 'armor') {
                            // Show all fields for weapons and armor
                            this.showAllFields();
                        } else {
                            // Show type and material dropdowns for other categories
                            this.showTypeAndMaterialDropdowns();
                        }
        
        // Restore the original value if it exists in the new options
        if (currentValue && types.some(type => type.value === currentValue)) {
            typeSelect.value = currentValue;
            console.log(`[ItemEditor] Restored type value: ${currentValue}`);
                        }
        
        console.log(`[ItemEditor] Updated type dropdown for category: ${category} with ${types.length} types`);
    }

    async updateMaterialDropdown(preserveValue = null) {
        const materialSelect = document.getElementById('modalMaterial');
        if (!materialSelect) return;
        
        // Store current value before clearing (prefer preserveValue over current value)
        const currentValue = preserveValue !== null ? preserveValue : materialSelect.value;
        
        try {
            // Load materials from the materials.js file
            const response = await fetch('/assets/items/materials.js');
            if (response.ok) {
                const content = await response.text();
                
                // Parse the materials object from the JS file
                const materialsMatch = content.match(/export const materials = ({[\s\S]*?});/);
                if (materialsMatch) {
                    const materialsData = eval('(' + materialsMatch[1] + ')');
                    
                    // Clear existing options
                    materialSelect.innerHTML = '<option value="">Material auswählen...</option>';
                    
                    // Add materials with their icons
                    Object.entries(materialsData).forEach(([key, material]) => {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = `${material.icon} ${material.name}`;
                        materialSelect.appendChild(option);
                    });
                    
                    console.log(`[ItemEditor] Updated material dropdown with ${Object.keys(materialsData).length} materials from materials.js`);
                    
                    // Restore the original value if it exists in the new options
                    if (currentValue && materialsData[currentValue]) {
                        materialSelect.value = currentValue;
                        console.log(`[ItemEditor] Restored material value: ${currentValue}`);
                    }
                }
            } else {
                // Fallback to hardcoded materials if file not found
                this.loadFallbackMaterials(materialSelect, currentValue);
            }
        } catch (error) {
            console.error('[ItemEditor] Failed to load materials:', error);
            this.loadFallbackMaterials(materialSelect, currentValue);
        }
    }

    loadFallbackMaterials(materialSelect, preserveValue = null) {
        // Store current value before clearing (prefer preserveValue over current value)
        const currentValue = preserveValue !== null ? preserveValue : materialSelect.value;
        
        // Clear existing options
        materialSelect.innerHTML = '<option value="">Material auswählen...</option>';
        
        // Use the actual material names from the files with icons
        const fallbackMaterials = [
            { value: 'iron', label: '⚒️ Eisen' },
            { value: 'steel', label: '⚔️ Stahl' },
            { value: 'mythril', label: '💎 Mithril' },
            { value: 'adamantium', label: '🔷 Adamantium' },
            { value: 'bronze', label: '🟠 Bronze' },
            { value: 'copper', label: '🔴 Kupfer' },
            { value: 'silver', label: '⚪ Silber' },
            { value: 'gold', label: '🟡 Gold' },
            { value: 'leather', label: '🦔 Leder' },
            { value: 'cloth', label: '🧵 Stoff' },
            { value: 'silk', label: '🕷️ Seide' },
            { value: 'wool', label: '🐑 Wolle' },
            { value: 'cotton', label: '🌱 Baumwolle' },
            { value: 'wood', label: '🪵 Holz' },
            { value: 'oak', label: '🪵 Eiche' },
            { value: 'pine', label: '🪵 Kiefer' },
            { value: 'mahogany', label: '🪵 Mahagoni' },
            { value: 'ebony', label: '🪵 Ebenholz' },
            { value: 'crystal', label: '💎 Kristall' },
            { value: 'diamond', label: '💎 Diamant' },
            { value: 'ruby', label: '❤️ Rubin' },
            { value: 'emerald', label: '💚 Smaragd' },
            { value: 'sapphire', label: '💙 Saphir' },
            { value: 'opal', label: '🌈 Opal' },
            { value: 'amethyst', label: '💜 Amethyst' },
            { value: 'topaz', label: '💛 Topas' },
            { value: 'obsidian', label: '🖤 Obsidian' },
            { value: 'marble', label: '🏛️ Marmor' },
            { value: 'granite', label: '🪨 Granit' }
        ];
        
        fallbackMaterials.forEach(material => {
            const option = document.createElement('option');
            option.value = material.value;
            option.textContent = material.label;
            materialSelect.appendChild(option);
        });
        
        // Restore the original value if it exists in the fallback options
        if (currentValue && fallbackMaterials.some(material => material.value === currentValue)) {
            materialSelect.value = currentValue;
            console.log(`[ItemEditor] Restored material value from fallback: ${currentValue}`);
        }
        
        console.log('[ItemEditor] Loaded fallback materials:', fallbackMaterials.length);
    }
    
    loadSavedItems() {
        try {
            const savedItems = JSON.parse(localStorage.getItem('itemEditor_savedItems') || '{}');
            console.log('[ItemEditor] Loading saved items from localStorage:', Object.keys(savedItems).length);
            
            Object.values(savedItems).forEach(savedItem => {
                // Check if item already exists in items array
                const existingItem = this.items.find(item => item.id === savedItem.item.id);
                if (!existingItem) {
                    // Add saved item to items array
                    this.items.push(savedItem.item);
                    console.log('[ItemEditor] Restored saved item:', savedItem.item.name);
                } else {
                    // Update existing item with saved data
                    Object.assign(existingItem, savedItem.item);
                    console.log('[ItemEditor] Updated existing item with saved data:', savedItem.item.name);
                }
            });
            
            // Update filtered items
            this.filterItemsByCategory(this.currentCategory);
            
        } catch (error) {
            console.warn('[ItemEditor] Failed to load saved items:', error);
        }
    }
    
    exportSavedItems() {
        try {
            const savedItems = JSON.parse(localStorage.getItem('itemEditor_savedItems') || '{}');
            console.log('[ItemEditor] Exporting saved items:', Object.keys(savedItems).length);
            
            // Create export data
            const exportData = {
                timestamp: Date.now(),
                items: savedItems,
                summary: {
                    totalItems: Object.keys(savedItems).length,
                    categories: {}
                }
            };
            
            // Count items by category
            Object.values(savedItems).forEach(savedItem => {
                const category = savedItem.item.category;
                exportData.summary.categories[category] = (exportData.summary.categories[category] || 0) + 1;
            });
            
            // Create and download export file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `itemEditor_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[ItemEditor] Export completed');
            this.showToast(`Export abgeschlossen: ${Object.keys(savedItems).length} Items`, 'success');
            
        } catch (error) {
            console.error('[ItemEditor] Export failed:', error);
            this.showToast('Export fehlgeschlagen', 'error');
        }
    }

    updateMaterialDropdownForMaterials() {
        const typeRow = document.querySelector('.detail-row:has(#modalType)');
        const materialRow = document.querySelector('.detail-row:has(#modalMaterial)');
        const weightRow = document.querySelector('.detail-row:has(#modalWeight)');
        
        // Hide type, material, and weight rows for materials category
        if (typeRow) {
            typeRow.style.display = 'none';
        }
        if (materialRow) {
            materialRow.style.display = 'none';
        }
        if (weightRow) {
            weightRow.style.display = 'none';
        }
        
        console.log('[ItemEditor] Type, Material, and Weight fields hidden for materials category');
    }

    showAllFields() {
        const typeRow = document.querySelector('.detail-row:has(#modalType)');
        const materialRow = document.querySelector('.detail-row:has(#modalMaterial)');
        const weightRow = document.querySelector('.detail-row:has(#modalWeight)');
        
        // Show all fields for weapons and armor
        if (typeRow) {
            typeRow.style.display = 'block';
        }
        if (materialRow) {
            materialRow.style.display = 'block';
        }
        if (weightRow) {
            weightRow.style.display = 'block';
        }
        
        console.log('[ItemEditor] All fields shown for weapons/armor category');
    }

    showTypeAndMaterialDropdowns() {
        const typeRow = document.querySelector('.detail-row:has(#modalType)');
        const materialRow = document.querySelector('.detail-row:has(#modalMaterial)');
        const weightRow = document.querySelector('.detail-row:has(#modalWeight)');
        
        // Show type, material, and weight rows for other categories
        if (typeRow) {
            typeRow.style.display = 'block';
        }
        if (materialRow) {
            materialRow.style.display = 'block';
        }
        if (weightRow) {
            weightRow.style.display = 'block';
        }
        
        console.log('[ItemEditor] Type, Material, and Weight fields shown for non-materials category');
    }

    openColumnConfigModal() {
        const modal = document.getElementById('columnConfigModal');
        const configCategoryTitle = document.getElementById('configCategoryTitle');
        const columnDraggableList = document.getElementById('columnDraggableList');
        
        if (!modal || !configCategoryTitle || !columnDraggableList) {
            console.error('[ItemEditor] Column config modal elements not found');
            return;
        }
        
        // Update category title
        const categoryNames = {
            'all': '📋 Alle Items',
            'weapons': '⚔️ Waffen',
            'armor': '🛡️ Rüstung',
            'potions': '🧪 Tränke',
            'materials': '📦 Materialien',
            'quest': '📜 Quest'
        };
        configCategoryTitle.textContent = categoryNames[this.currentCategory] || this.currentCategory;
        
        // Generate draggable list for current category
        const config = this.columnConfig[this.currentCategory] || this.columnConfig.weapons;
        columnDraggableList.innerHTML = '';
        
        // Sort columns by current order
        const sortedColumns = Object.entries(config).sort((a, b) => a[1].order - b[1].order);
        
        sortedColumns.forEach(([key, column]) => {
            const columnItem = document.createElement('div');
            columnItem.className = 'column-draggable-item';
            columnItem.draggable = true;
            columnItem.dataset.columnKey = key;
            
            // Drag handle
            const dragHandle = document.createElement('div');
            dragHandle.className = 'drag-handle';
            dragHandle.innerHTML = '☰';
            
            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox_${key}`;
            checkbox.checked = column.enabled;
            checkbox.dataset.columnKey = key;
            
            // Label (no text for icon and actions)
            const label = document.createElement('label');
            label.htmlFor = `checkbox_${key}`;
            if (key === 'icon' || key === 'actions') {
                label.textContent = column.label;
            } else {
                label.textContent = column.label;
            }
            
            // Order input
            const orderInput = document.createElement('input');
            orderInput.type = 'number';
            orderInput.className = 'order-input';
            orderInput.value = column.order;
            orderInput.min = 1;
            orderInput.dataset.columnKey = key;
            
            columnItem.appendChild(dragHandle);
            columnItem.appendChild(checkbox);
            columnItem.appendChild(label);
            columnItem.appendChild(orderInput);
            columnDraggableList.appendChild(columnItem);
        });
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Show modal
        modal.style.display = 'block';
    }

    setupDragAndDrop() {
        const items = document.querySelectorAll('.column-draggable-item');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.columnKey);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedKey = e.dataTransfer.getData('text/plain');
                const targetKey = item.dataset.columnKey;
                
                if (draggedKey !== targetKey) {
                    this.swapColumnOrder(draggedKey, targetKey);
                }
            });
        });
    }

    swapColumnOrder(draggedKey, targetKey) {
        const config = this.columnConfig[this.currentCategory];
        if (!config || !config[draggedKey] || !config[targetKey]) return;
        
        // Swap order values
        const tempOrder = config[draggedKey].order;
        config[draggedKey].order = config[targetKey].order;
        config[targetKey].order = tempOrder;
        
        // Update order inputs
        const draggedInput = document.querySelector(`[data-column-key="${draggedKey}"] .order-input`);
        const targetInput = document.querySelector(`[data-column-key="${targetKey}"] .order-input`);
        
        if (draggedInput) draggedInput.value = config[draggedKey].order;
        if (targetInput) targetInput.value = config[targetKey].order;
        
        console.log(`[ItemEditor] Swapped column order: ${draggedKey} <-> ${targetKey}`);
    }

    closeColumnConfigModal() {
        const modal = document.getElementById('columnConfigModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveColumnConfig() {
        const columnDraggableList = document.getElementById('columnDraggableList');
        if (!columnDraggableList) return;
        
        // Update column configuration based on checkboxes and order inputs
        const columnItems = columnDraggableList.querySelectorAll('.column-draggable-item');
        columnItems.forEach(item => {
            const columnKey = item.dataset.columnKey;
            if (columnKey && this.columnConfig[this.currentCategory]) {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const orderInput = item.querySelector('.order-input');
                
                // Update enabled state
                if (checkbox) {
                    this.columnConfig[this.currentCategory][columnKey].enabled = checkbox.checked;
                }
                
                // Update order
                if (orderInput) {
                    this.columnConfig[this.currentCategory][columnKey].order = parseInt(orderInput.value) || 1;
                }
            }
        });
        
        // Save to localStorage
        localStorage.setItem(`itemEditor_columns_${this.currentCategory}`, JSON.stringify(this.columnConfig[this.currentCategory]));
        
        // Update table
        this.updateItemTable();
        
        // Close modal
        this.closeColumnConfigModal();
        
        // Show success message
        this.showToast('Spalten-Konfiguration gespeichert!', 'success');
        
        console.log(`[ItemEditor] Column configuration saved for ${this.currentCategory}:`, this.columnConfig[this.currentCategory]);
    }

    sortByColumn(columnKey) {
        const config = this.columnConfig[this.currentCategory];
        if (!config || !config[columnKey] || !config[columnKey].sortable) {
            return;
        }

        // Get current sort state
        const currentSort = this.sortConfig[this.currentCategory];
        let newDirection = 'asc';
        
        // Toggle direction if same column
        if (currentSort.column === columnKey) {
            newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }
        
        // Update sort configuration
        this.sortConfig[this.currentCategory] = {
            column: columnKey,
            direction: newDirection
        };
        
        // Sort items
        this.filteredItems.sort((a, b) => {
            let aValue = a[columnKey];
            let bValue = b[columnKey];
            
            // Handle special cases
            if (columnKey === 'rarity') {
                const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
                aValue = rarityOrder[aValue] || 0;
                bValue = rarityOrder[bValue] || 0;
            }
            
            // Convert to numbers for numeric sorting
            if (typeof aValue === 'string' && !isNaN(aValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            
            if (newDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        // Update table
        this.updateItemTable();
        
        // Update sort indicators
        this.updateSortIndicators(columnKey, newDirection);
        
        console.log(`[ItemEditor] Sorted by ${columnKey} in ${newDirection} order`);
    }

    updateSortIndicators(activeColumn, direction) {
        const headers = document.querySelectorAll('.table-header-cell.sortable');
        headers.forEach(header => {
            const sortIcon = header.querySelector('.sort-icon');
            if (sortIcon) {
                // Reset all icons
                sortIcon.textContent = '↕️';
                
                // Update active column icon
                if (header.textContent.includes(this.columnConfig[this.currentCategory][activeColumn]?.label)) {
                    sortIcon.textContent = direction === 'asc' ? '↑' : '↓';
                }
            }
        });
    }

    async loadColumnConfig() {
        console.log('[ItemEditor] Loading column configuration from files...');
        
        const categories = ['weapons', 'armor', 'potions', 'materials', 'quest'];
        
        for (const category of categories) {
            try {
                // Load columns.js file from each category folder
                const response = await fetch(`/assets/items/${category}/columns.js`);
                if (response.ok) {
                    const content = await response.text();
                    
                    // Parse the JavaScript content (remove export default and parse)
                    const cleanContent = content
                        .replace(/export\s+default\s*/, '')
                        .replace(/;?\s*$/, '');
                    
                    try {
                        const config = eval(`(${cleanContent})`);
                        
                        // Store column configuration
                        this.columnConfig[category] = config.columns;
                        
                        // Store sort configuration
                        this.sortConfig[category] = config.defaultSort;
                        
                        console.log(`[ItemEditor] Loaded column config for ${category}:`, config);
                    } catch (parseError) {
                        console.error(`[ItemEditor] Failed to parse column config for ${category}:`, parseError);
                        // Use fallback configuration
                        this.setFallbackColumnConfig(category);
                    }
                } else {
                    console.warn(`[ItemEditor] Failed to load column config for ${category}:`, response.status);
                    // Use fallback configuration
                    this.setFallbackColumnConfig(category);
                }
            } catch (error) {
                console.error(`[ItemEditor] Error loading column config for ${category}:`, error);
                // Use fallback configuration
                this.setFallbackColumnConfig(category);
            }
        }
        
        // Load saved user preferences from localStorage
        this.loadSavedColumnPreferences();
        
        console.log('[ItemEditor] Column configuration loaded:', this.columnConfig);
    }

    setFallbackColumnConfig(category) {
        // Fallback configuration if file loading fails
        const fallbackConfigs = {
            weapons: {
                icon: { enabled: true, label: 'Icon', width: '50px', sortable: false, order: 1 },
                name: { enabled: true, label: 'Name', width: '200px', sortable: true, order: 2 },
                level: { enabled: true, label: 'Level', width: '80px', sortable: true, order: 3 },
                rarity: { enabled: true, label: 'Seltenheit', width: '120px', sortable: true, order: 4 },
                value: { enabled: true, label: 'Wert', width: '100px', sortable: true, order: 5 },
                actions: { enabled: true, label: 'Aktionen', width: '120px', sortable: false, order: 6 }
            },
            armor: {
                icon: { enabled: true, label: 'Icon', width: '50px', sortable: false, order: 1 },
                name: { enabled: true, label: 'Name', width: '200px', sortable: true, order: 2 },
                level: { enabled: true, label: 'Level', width: '80px', sortable: true, order: 3 },
                rarity: { enabled: true, label: 'Seltenheit', width: '120px', sortable: true, order: 4 },
                value: { enabled: true, label: 'Wert', width: '100px', sortable: true, order: 5 },
                actions: { enabled: true, label: 'Aktionen', width: '120px', sortable: false, order: 6 }
            },
            potions: {
                icon: { enabled: true, label: 'Icon', width: '50px', sortable: false, order: 1 },
                name: { enabled: true, label: 'Name', width: '200px', sortable: true, order: 2 },
                value: { enabled: true, label: 'Wert', width: '100px', sortable: true, order: 3 },
                actions: { enabled: true, label: 'Aktionen', width: '120px', sortable: false, order: 4 }
            },
            materials: {
                icon: { enabled: true, label: 'Icon', width: '50px', sortable: false, order: 1 },
                name: { enabled: true, label: 'Name', width: '200px', sortable: true, order: 2 },
                value: { enabled: true, label: 'Wert', width: '100px', sortable: true, order: 3 },
                actions: { enabled: true, label: 'Aktionen', width: '120px', sortable: false, order: 4 }
            },
            quest: {
                icon: { enabled: true, label: 'Icon', width: '50px', sortable: false, order: 1 },
                name: { enabled: true, label: 'Name', width: '200px', sortable: true, order: 2 },
                value: { enabled: true, label: 'Wert', width: '100px', sortable: true, order: 3 },
                actions: { enabled: true, label: 'Aktionen', width: '120px', sortable: false, order: 4 }
            }
        };
        
        this.columnConfig[category] = fallbackConfigs[category] || fallbackConfigs.weapons;
        this.sortConfig[category] = { column: 'name', direction: 'asc' };
    }

    loadSavedColumnPreferences() {
        // Load saved user preferences from localStorage
        Object.keys(this.columnConfig).forEach(category => {
            const saved = localStorage.getItem(`itemEditor_columns_${category}`);
            if (saved) {
                try {
                    const savedConfig = JSON.parse(saved);
                    Object.keys(savedConfig).forEach(key => {
                        if (this.columnConfig[category][key]) {
                            this.columnConfig[category][key].enabled = savedConfig[key].enabled;
                        }
                    });
                } catch (error) {
                    console.warn(`[ItemEditor] Failed to load saved preferences for ${category}:`, error);
                }
            }
        });
    }

    showCategorySpecificFields(category) {
        // Get DOM elements safely
        const damageRow = document.getElementById('damageRow');
        const defenseRow = document.getElementById('defenseRow');
        const criticalChanceRow = document.getElementById('criticalChanceRow');
        const criticalMultiplierRow = document.getElementById('criticalMultiplierRow');
        const inventorySizeRow = document.getElementById('inventorySizeRow');
        
        // Check if elements exist before accessing their style
        if (damageRow) damageRow.style.display = 'none';
        if (defenseRow) defenseRow.style.display = 'none';
        if (criticalChanceRow) criticalChanceRow.style.display = 'none';
        if (criticalMultiplierRow) criticalMultiplierRow.style.display = 'none';
        
        // Show/hide inventory size field based on category
        if (inventorySizeRow) {
            if (category === 'materials') {
                inventorySizeRow.style.display = 'none';
            } else {
                inventorySizeRow.style.display = 'flex';
            }
        }
        
        // Show relevant fields based on category
        if (category === 'weapons') {
            if (damageRow) damageRow.style.display = 'block';
            if (criticalChanceRow) criticalChanceRow.style.display = 'block';
            if (criticalMultiplierRow) criticalMultiplierRow.style.display = 'block';
        } else if (category === 'armor') {
            if (defenseRow) defenseRow.style.display = 'block';
        }
        
        console.log(`[ItemEditor] Category-specific fields updated for: ${category}`);
    }

    closeEditModal() {
        document.getElementById('itemModal').style.display = 'none';
        this.currentEditItem = null;
    }

    saveEditedItem() {
        if (!this.currentEditItem) return;
        
        console.log('[ItemEditor] Saving edited item:', this.currentEditItem);
        
        // Update item data from modal fields
        this.currentEditItem.name = document.getElementById('modalName').value;
        this.currentEditItem.type = document.getElementById('modalType').value;
        this.currentEditItem.material = document.getElementById('modalMaterial').value;
        this.currentEditItem.weight = parseFloat(document.getElementById('modalWeight').value) || 0;
        this.currentEditItem.value = Math.round(parseFloat(document.getElementById('modalValue').value) || 0);
        this.currentEditItem.rarity = document.getElementById('modalRarity').value;
        this.currentEditItem.level = Math.round(parseFloat(document.getElementById('modalLevel').value) || 1);
        this.currentEditItem.description = document.getElementById('modalDescription').value;
        this.currentEditItem.inventoryWidth = this.inventoryWidth;
        this.currentEditItem.inventoryHeight = this.inventoryHeight;
        
        // Update category-specific fields
        if (this.currentEditItem.category === 'weapons') {
            this.currentEditItem.damage = parseInt(document.getElementById('modalDamageMin').value) || 0;
            this.currentEditItem.damageMax = parseInt(document.getElementById('modalDamageMax').value) || 0;
            this.currentEditItem.criticalChance = parseFloat(document.getElementById('modalCriticalChance').value) || 0;
            this.currentEditItem.criticalMultiplier = parseFloat(document.getElementById('modalCriticalMultiplier').value) || 1;
        } else if (this.currentEditItem.category === 'armor') {
            this.currentEditItem.defense = parseInt(document.getElementById('modalDefenseMin').value) || 0;
            this.currentEditItem.defenseMax = parseInt(document.getElementById('modalDefenseMax').value) || 0;
        }
        
        // Suche in beiden Arrays und aktualisiere beide
        const itemInAll = this.items.find(i => i.id === this.currentEditItem.id);
        const itemInFiltered = this.filteredItems.find(i => i.id === this.currentEditItem.id);
        
        if (itemInAll) {
            // Aktualisiere alle Felder in beiden Arrays
            Object.assign(itemInAll, this.currentEditItem);
            if (itemInFiltered) {
                Object.assign(itemInFiltered, this.currentEditItem);
            }
            
            console.log('[ItemEditor] Updated in all items:', itemInAll);
            console.log('[ItemEditor] Updated in filtered items:', itemInFiltered);
            
            // Save the updated item to file
            this.saveItemToFile(this.currentEditItem);
        }
        
        // Update table
        this.filterItemsByCategory(this.currentCategory);
        
        // Close modal
        this.closeEditModal();
        
        console.log('[ItemEditor] Item saved successfully');
    }
    
    saveItemToFile(item) {
        try {
            console.log('[ItemEditor] Saving item to file:', item);
            
            // Generate the JavaScript content for the item
            const itemContent = this.generateItemFileContent(item);
            
            // Generate JSON content for the item
            const jsonContent = this.generateItemJsonContent(item);
            
            // Save to localStorage as backup
            const savedItems = JSON.parse(localStorage.getItem('itemEditor_savedItems') || '{}');
            savedItems[item.id] = {
                content: itemContent,
                jsonContent: jsonContent,
                item: item,
                timestamp: Date.now()
            };
            localStorage.setItem('itemEditor_savedItems', JSON.stringify(savedItems));
            
            // Try to save to server (both JS and JSON files)
            this.saveItemToServer(item, itemContent, jsonContent);
            
        } catch (error) {
            console.error('[ItemEditor] Error in saveItemToFile:', error);
            this.showToast(`Fehler beim Speichern von "${item.name}"`, 'error');
        }
    }
    
    generateItemJsonContent(item) {
        // Generate JSON content for the item
        const jsonItem = {
            id: item.id,
            name: item.name,
            category: item.category,
            type: item.type || '',
            material: item.material || '',
            weight: item.weight || 0,
            value: item.value || 0,
            rarity: item.rarity || 'common',
            level: item.level || 1,
            description: item.description || ''
        };
        
        // Add inventory size only for non-material items
        if (item.category !== 'materials') {
            jsonItem.inventoryWidth = item.inventoryWidth || this.getDefaultInventoryWidth(item.category);
            jsonItem.inventoryHeight = item.inventoryHeight || this.getDefaultInventoryHeight(item.category);
        }
        
        // Add category-specific properties
        if (item.category === 'weapons') {
            jsonItem.damage = item.damage || 0;
            jsonItem.damageMax = item.damageMax || 0;
            jsonItem.criticalChance = item.criticalChance || 0.05;
            jsonItem.criticalMultiplier = item.criticalMultiplier || 2.0;
        } else if (item.category === 'armor') {
            jsonItem.defense = item.defense || 0;
            jsonItem.defenseMax = item.defenseMax || 0;
        }
        
        return JSON.stringify(jsonItem, null, 2);
    }
    
    saveItemToServer(item, jsContent, jsonContent) {
        // Try to save JS file to server
        fetch('/api/save-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: jsContent,
                item: item,
                filePath: `/assets/items/${item.category}/${item.id}.js`,
                fileType: 'js'
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('[ItemEditor] JS file saved to server successfully');
            } else {
                console.warn('[ItemEditor] JS file server save failed, using localStorage backup');
            }
        })
        .catch(error => {
            console.warn('[ItemEditor] JS file server save failed, using localStorage backup:', error);
        });
        
        // Try to save JSON file to server
        fetch('/api/save-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: jsonContent,
                item: item,
                filePath: `/assets/items/${item.category}/${item.id}.json`,
                fileType: 'json'
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('[ItemEditor] JSON file saved to server successfully');
            } else {
                console.warn('[ItemEditor] JSON file server save failed, using localStorage backup');
            }
        })
        .catch(error => {
            console.warn('[ItemEditor] JSON file server save failed, using localStorage backup:', error);
        });
    }
    
    generateItemFileContent(item) {
        // Generate the JavaScript content for the item file
        return `export const ${item.id} = {
    id: "${item.id}",
    name: "${item.name}",
    category: "${item.category}",
    type: "${item.type || ''}",
    material: "${item.material || ''}",
    weight: ${item.weight || 0},
    value: ${item.value || 0},
    rarity: "${item.rarity || 'common'}",
    level: ${item.level || 1},
    description: "${item.description || ''}",
    inventoryWidth: ${item.inventoryWidth || 1},
    inventoryHeight: ${item.inventoryHeight || 1}${item.category === 'weapons' ? `,
    damage: ${item.damage || 0},
    damageMax: ${item.damageMax || 0},
    criticalChance: ${item.criticalChance || 0.05},
    criticalMultiplier: ${item.criticalMultiplier || 2.0}` : ''}${item.category === 'armor' ? `,
    defense: ${item.defense || 0},
    defenseMax: ${item.defenseMax || 0}` : ''}
};`;
    }

    duplicateItem() {
        if (!this.currentEditItem) return;
        
        console.log('[ItemEditor] Duplicating item:', this.currentEditItem);
        
        // Create a deep copy of the current item
        const duplicatedItem = JSON.parse(JSON.stringify(this.currentEditItem));
        
        // Generate new unique ID
        duplicatedItem.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Modify name to indicate it's a copy
        duplicatedItem.name = duplicatedItem.name + ' (Kopie)';
        
        // Generate filename based on name
        const filename = this.generateFilename(duplicatedItem.name, duplicatedItem.category);
        duplicatedItem.filename = filename;
        
        // Add to items array
        this.items.push(duplicatedItem);
        
        // Create the actual JS file in the assets folder
        this.createItemFile(duplicatedItem);
        
        // Update table
        this.filterItemsByCategory(this.currentCategory);
        
        // Close modal
        this.closeEditModal();
        
        // Select the new duplicated item
        this.selectItem(duplicatedItem.id);
        
        console.log('[ItemEditor] Item duplicated successfully:', duplicatedItem);
        
        // Show success toast
        this.showToast(`Item "${duplicatedItem.name}" wurde erfolgreich dupliziert!`, 'success');
    }
    
    deleteItem() {
        if (!this.currentEditItem) return;
        
        console.log('[ItemEditor] Deleting item:', this.currentEditItem);
        
        // Show confirmation dialog
        const confirmed = confirm(`Möchten Sie das Item "${this.currentEditItem.name}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`);
        
        if (!confirmed) return;
        
        // Remove from items array
        const itemIndex = this.items.findIndex(i => i.id === this.currentEditItem.id);
        if (itemIndex !== -1) {
            this.items.splice(itemIndex, 1);
        }
        
        // Remove from filtered items array
        const filteredIndex = this.filteredItems.findIndex(i => i.id === this.currentEditItem.id);
        if (filteredIndex !== -1) {
            this.filteredItems.splice(filteredIndex, 1);
        }
        
        // Close modal
        this.closeEditModal();
        
        // Update table
        this.filterItemsByCategory(this.currentCategory);
        
        console.log('[ItemEditor] Item deleted successfully:', this.currentEditItem.name);
        
        // Show success toast
        this.showToast(`Item "${this.currentEditItem.name}" wurde erfolgreich gelöscht!`, 'success');
        
        // Clear current edit item
        this.currentEditItem = null;
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        // Add to container
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            // Show toast
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideToast(toast);
            }, 5000);
            
            // Close button functionality
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideToast(toast);
                });
            }
        }
    }

    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    generateFilename(name, category) {
        // Convert name to filename format (lowercase, replace spaces with underscores)
        const baseName = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        return `${baseName}.js`;
    }

    async createItemFile(item) {
        try {
            // Create the JS file content
            const fileContent = this.generateJSFileContent(item);
            
            // Send file to server to save in assets folder
            const response = await fetch('/api/save-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    category: item.category,
                    fileContent: fileContent
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`[ItemEditor] File saved successfully:`, result);
            
        } catch (error) {
            console.error('[ItemEditor] Failed to save item file:', error);
            alert('Fehler beim Speichern der Datei. Das Item wurde trotzdem dupliziert.');
        }
    }

    generateJSFileContent(item) {
        // Generate JS file content in the same format as the original files
        return `// ${item.name} - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "${item.id}",
    name: "${item.name}",
    filename: "${item.filename}",
    category: "${item.category}",
    type: "${item.type || 'unknown'}",
    material: "${item.material || 'unknown'}",
    
    // Combat Stats - Edit these!
    damage: ${item.damage || 0},
    criticalChance: ${item.criticalChance || 0.20},
    criticalMultiplier: ${item.criticalMultiplier || 2.0},
    
    // Physical Properties - Edit these!
    weight: ${item.weight || 1},
    durability: ${item.durability || 100},
    maxDurability: ${item.durability || 100},
    
    // Economic - Edit these!
    sellPrice: ${item.value || 0},
    buyPrice: ${item.value || 0},
    
    // Gameplay - Edit these!
    level: ${item.level || 1},
    rarity: "${item.rarity || 'common'}",
    stackSize: 1,
    
    // Description - Edit this!
    description: "${item.description || ''}",
    
    // Special Properties - Add/edit these!
    effects: [],
    enchantments: [],
    
    // Visual - Edit these!
    color: "#8C7853",
    iconFrame: "${item.rarity || 'common'}"
};`;
    }

    async deleteItem(itemId) {
        console.log('[ItemEditor] Deleting item:', itemId);
        const item = this.items.find(i => i.id === itemId);
        if (!item) {
            console.error('[ItemEditor] Item not found for deletion:', itemId);
            return;
        }

        if (confirm('Möchtest du dieses Item wirklich löschen?')) {
            try {
                // Delete file from server
                const response = await fetch('/api/delete-item', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: item.name,
                        category: item.category
                    })
                });

                if (response.ok) {
                    // Remove from local array
                    this.items = this.items.filter(i => i.id !== itemId);
                    this.filterItemsByCategory(this.currentCategory);
                    this.selectedItemId = null;
                    
                    this.showToast(`Item "${item.name}" wurde erfolgreich gelöscht!`, 'success');
                    console.log('[ItemEditor] Item deleted successfully:', itemId);
                } else {
                    const errorData = await response.json();
                    this.showToast(`Fehler beim Löschen: ${errorData.error}`, 'error');
                    console.error('[ItemEditor] Failed to delete item:', errorData.error);
                }
            } catch (error) {
                this.showToast('Fehler beim Löschen des Items', 'error');
                console.error('[ItemEditor] Error deleting item:', error);
            }
        }
    }

    exportItems() {
        console.log('[ItemEditor] Exporting items...');
        const dataStr = JSON.stringify(this.filteredItems, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `items_${this.currentCategory}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('[ItemEditor] Items exported');
    }

    importItems() {
        console.log('[ItemEditor] Importing items...');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedItems = JSON.parse(e.target.result);
                        this.items.push(...importedItems);
                        this.filterItemsByCategory(this.currentCategory);
                        alert(`${importedItems.length} Items importiert`);
                        console.log('[ItemEditor] Items imported:', importedItems.length);
                    } catch (error) {
                        alert('Fehler beim Importieren der Datei');
                        console.error('[ItemEditor] Import error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    setupEventListeners() {
        console.log('[ItemEditor] Setting up event listeners...');
        
        // Toolbar buttons
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[ItemEditor] Add button clicked, preventing default');
                this.toggleDropdown();
                return false;
            });
        }

        // Dropdown functionality will be set up in initialize() after DOM is ready

        const configureColumnsBtn = document.getElementById('configureColumnsBtn');
        if (configureColumnsBtn) {
            configureColumnsBtn.addEventListener('click', () => this.openColumnConfigModal());
        }

        const refreshItemsBtn = document.getElementById('refreshItemsBtn');
        if (refreshItemsBtn) {
            refreshItemsBtn.addEventListener('click', () => this.refresh());
        }

        // Modal event listeners
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeEditModal());
        }

        const cancelModalBtn = document.getElementById('cancelModalBtn');
        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', () => this.closeEditModal());
        }

        const saveItemBtn = document.getElementById('saveItemBtn');
        if (saveItemBtn) {
            saveItemBtn.addEventListener('click', () => this.saveEditedItem());
        }

        const duplicateItemBtn = document.getElementById('duplicateItemBtn');
        if (duplicateItemBtn) {
            duplicateItemBtn.addEventListener('click', () => this.duplicateItem());
        }

        const deleteItemBtn = document.getElementById('deleteItemBtn');
        if (deleteItemBtn) {
            deleteItemBtn.addEventListener('click', () => this.deleteItem());
        }

        // Close modal when clicking overlay
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeEditModal());
        }

        // Icon drop zone functionality
        const iconDropZone = document.getElementById('iconDropZone');
        if (iconDropZone) {
            iconDropZone.addEventListener('click', () => {
                document.getElementById('iconFileInput').click();
            });
        }

        const iconFileInput = document.getElementById('iconFileInput');
        if (iconFileInput) {
            iconFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleIconUpload(file);
                }
            });
        }
        
        // Setup name input listener for modal title update
        const modalNameInput = document.getElementById('modalName');
        if (modalNameInput) {
            modalNameInput.addEventListener('input', (e) => {
                this.updateModalTitle(e.target.value);
            });
        }

        // Column configuration modal event listeners
        const closeColumnConfigBtn = document.getElementById('closeColumnConfigBtn');
        if (closeColumnConfigBtn) {
            closeColumnConfigBtn.addEventListener('click', () => this.closeColumnConfigModal());
        }

        const cancelColumnConfigBtn = document.getElementById('cancelColumnConfigBtn');
        if (cancelColumnConfigBtn) {
            cancelColumnConfigBtn.addEventListener('click', () => this.closeColumnConfigModal());
        }

        const saveColumnConfigBtn = document.getElementById('saveColumnConfigBtn');
        if (saveColumnConfigBtn) {
            saveColumnConfigBtn.addEventListener('click', () => this.saveColumnConfig());
        }

        // Close column config modal when clicking overlay
        const columnConfigModalOverlay = document.querySelector('#columnConfigModal .modal-overlay');
        if (columnConfigModalOverlay) {
            columnConfigModalOverlay.addEventListener('click', () => this.closeColumnConfigModal());
        }

        console.log('[ItemEditor] Event listeners setup complete');
    }
    
    updateModalTitle(name) {
        const modalItemName = document.getElementById('modalItemName');
        if (modalItemName) {
            // Update the modal title with the new name
            modalItemName.textContent = name || 'Item Details';
        }
    }

    handleIconUpload(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('modalItemIcon');
                img.src = e.target.result;
                img.style.display = 'block';
                document.querySelector('.drop-hint').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    saveCurrentCategory() {
        try {
            localStorage.setItem('itemEditorCategory', this.currentCategory);
        } catch (error) {
            console.warn('[ItemEditor] Failed to save category:', error);
        }
    }

    async refresh() {
        console.log('[ItemEditor] Refreshing items...');
        
        try {
            // Clear caches
            this.itemCache.clear();
            this.loadingCache.clear();
            this.lastLoadTime = 0;
            
            // Clear current items
            this.items = [];
            this.filteredItems = [];
            
            // Show loading indicator
            this.showToast('Items werden neu geladen...', 'info');
            
            // Reload all items
            await this.loadItemAssets();
            
            // Reload saved items
            this.loadSavedItems();
            
            // Update table
            this.filterItemsByCategory(this.currentCategory);
            
            // Update add item button
            this.updateAddItemButton();
            
            console.log('[ItemEditor] Refresh completed successfully');
            this.showToast(`Refresh abgeschlossen: ${this.items.length} Items geladen`, 'success');
            
        } catch (error) {
            console.error('[ItemEditor] Refresh failed:', error);
            this.showToast('Refresh fehlgeschlagen', 'error');
        }
    }
    
    clearCache() {
        console.log('[ItemEditor] Clearing all caches...');
        this.itemCache.clear();
        this.loadingCache.clear();
        this.lastLoadTime = 0;
        console.log('[ItemEditor] Caches cleared');
    }

    openItemModal(item) {
        console.log('[ItemEditor] Opening item modal for:', item.name);
        
        // Use the full openEditModal function instead of duplicating logic
        this.openEditModal(item);
    }

    destroy() {
        console.log('[ItemEditor] Destroying...');
        // Cleanup event listeners and references
        this.isInitialized = false;
    }
    
    // OPTIMIZED ITEM LOADING METHODS
    async loadItemAssetsOptimized() {
        console.log('[ItemEditor] Loading items with OPTIMIZED batch loading...');
        try {
            // OPTIMIZATION: Try new optimized endpoint first
            const response = await fetch('/api/load-all-items');
            if (response.ok) {
                const data = await response.json();
                console.log('[ItemEditor] Batch loaded items:', data);
                
                if (data.status === 'success' && data.items) {
                    this.items = data.items.map(itemData => ({
                        id: itemData.id || itemData.filename?.replace('.js', '') || 'unknown',
                        name: itemData.name || 'Unknown Item',
                        category: itemData.category || 'unknown',
                        level: itemData.level || 1,
                        rarity: itemData.rarity || 'common',
                        value: itemData.buyPrice || itemData.sellPrice || 0,
                        icon: this.getItemIcon(itemData.category, itemData.type, itemData.name),
                        type: itemData.type || 'unknown',
                        material: itemData.material || 'unknown',
                        description: itemData.description || '',
                        damage: itemData.damage || 0,
                        defense: itemData.defense || 0,
                        weight: itemData.weight || 0,
                        durability: itemData.durability || 0
                    }));
                    
                    console.log(`[ItemEditor] OPTIMIZED: Loaded ${this.items.length} items in single request`);
                    return true;
                }
            }
            
            console.log('[ItemEditor] Optimized endpoint failed, using legacy method...');
            return false;
            
        } catch (error) {
            console.error('[ItemEditor] Failed to load items with optimized method:', error);
            return false;
        }
    }
    
    async loadItemAssetsBatch() {
        console.log('[ItemEditor] Loading items with BATCH method (medium performance)...');
        try {
            // BATCH OPTIMIZATION: Load all JS files in parallel instead of sequentially
            const response = await fetch('/api/scan-items');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status === 'success' && data.items) {
                this.items = [];
                
                // Collect all file paths first
                const allFilePaths = [];
                for (const [category, categoryData] of Object.entries(data.items)) {
                    if (category === 'classes') continue;
                    if (categoryData.items && Array.isArray(categoryData.items)) {
                        allFilePaths.push(...categoryData.items.map(item => ({ ...item, category })));
                    }
                }
                
                console.log(`[ItemEditor] BATCH: Loading ${allFilePaths.length} files in parallel...`);
                
                // Load all files in parallel using Promise.all
                const filePromises = allFilePaths.map(async (itemFile) => {
                    try {
                        const itemResponse = await fetch(itemFile.path);
                        if (itemResponse.ok) {
                            const itemContent = await itemResponse.text();
                            
                            // Parse JS file content
                            const cleanContent = itemContent
                                .replace(/export\s+default\s*/, '')
                                .replace(/export\s+const\s+\w+\s*=\s*/, '')
                                .replace(/\/\/.*$/gm, '')
                                .trim();
                            
                            let itemData;
                            try {
                                const finalContent = cleanContent.replace(/;$/, '');
                                itemData = eval('(' + finalContent + ')');
                            } catch (evalError) {
                                console.warn(`[ItemEditor] Failed to parse item ${itemFile.file}:`, evalError);
                                return null;
                            }
                            
                            if (!itemData.name || itemData.name.trim() === '') {
                                return null;
                            }
                            
                            return {
                                id: itemData.id || itemFile.file.replace('.js', ''),
                                name: itemData.name || 'Unknown Item',
                                category: itemData.category || itemFile.category,
                                level: itemData.level || 1,
                                rarity: itemData.rarity || 'common',
                                value: itemData.buyPrice || itemData.sellPrice || 0,
                                icon: this.getItemIcon(itemData.category, itemData.type, itemData.name),
                                type: itemData.type || 'unknown',
                                material: itemData.material || 'unknown',
                                description: itemData.description || '',
                                damage: itemData.damage || 0,
                                defense: itemData.defense || 0,
                                weight: itemData.weight || 0,
                                durability: itemData.durability || 0
                            };
                        }
                    } catch (itemError) {
                        console.warn(`[ItemEditor] Failed to load item ${itemFile.file}:`, itemError);
                        return null;
                    }
                    return null;
                });
                
                // Wait for all files to load
                const results = await Promise.all(filePromises);
                
                // Filter out failed loads
                this.items = results.filter(item => item !== null);
                
                console.log(`[ItemEditor] BATCH: Loaded ${this.items.length} items in parallel`);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('[ItemEditor] Failed to load items with batch method:', error);
            return false;
        }
    }
    
    updateSliderValue(sliderType, value) {
        const valueElement = document.getElementById(`${sliderType}Value`);
        if (valueElement) {
            if (sliderType === 'criticalChance') {
                valueElement.textContent = `${Math.round(value * 100)}%`;
            } else if (sliderType === 'criticalMultiplier') {
                valueElement.textContent = `${value}x`;
            }
        }
    }
    
    setupSliderEventListeners() {
        // Critical Chance Slider
        const criticalChanceSlider = document.getElementById('modalCriticalChance');
        if (criticalChanceSlider) {
            criticalChanceSlider.addEventListener('input', (e) => {
                this.updateSliderValue('criticalChance', e.target.value);
            });
        }
        
        // Critical Multiplier Slider
        const criticalMultiplierSlider = document.getElementById('modalCriticalMultiplier');
        if (criticalMultiplierSlider) {
            criticalMultiplierSlider.addEventListener('input', (e) => {
                this.updateSliderValue('criticalMultiplier', e.target.value);
            });
        }
    }
    
    setupInventoryGrid() {
        // Set default inventory size based on category
        this.inventoryWidth = 1;
        this.inventoryHeight = 1;
        this.generateInventoryGrid();
        this.setupInventoryControls();
    }
    
    generateInventoryGrid() {
        const grid = document.getElementById('modalInventoryGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(4, 25px)`;
        grid.style.gridTemplateRows = `repeat(4, 25px)`;
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                slot.dataset.x = x;
                slot.dataset.y = y;
                
                // Mark slots as selected based on current size
                if (x < this.inventoryWidth && y < this.inventoryHeight) {
                    slot.classList.add('selected');
                }
                
                slot.addEventListener('click', () => {
                    this.selectInventorySize(x + 1, y + 1);
                });
                
                grid.appendChild(slot);
            }
        }
    }
    
    selectInventorySize(width, height) {
        this.inventoryWidth = width;
        this.inventoryHeight = height;
        this.generateInventoryGrid();
        this.updateInventorySliderValues();
        
        // Update slider values
        const widthSlider = document.getElementById('modalInventoryWidth');
        const heightSlider = document.getElementById('modalInventoryHeight');
        if (widthSlider) widthSlider.value = this.inventoryWidth;
        if (heightSlider) heightSlider.value = this.inventoryHeight;
    }
    
    setupInventoryControls() {
        const widthSlider = document.getElementById('modalInventoryWidth');
        const heightSlider = document.getElementById('modalInventoryHeight');
        
        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                this.inventoryWidth = parseInt(e.target.value);
                this.generateInventoryGrid();
                this.updateInventorySliderValues();
            });
        }
        
        if (heightSlider) {
            heightSlider.addEventListener('input', (e) => {
                this.inventoryHeight = parseInt(e.target.value);
                this.generateInventoryGrid();
                this.updateInventorySliderValues();
            });
        }
        
        this.updateInventorySliderValues();
    }
    
    updateInventorySliderValues() {
        const widthValue = document.getElementById('inventoryWidthValue');
        const heightValue = document.getElementById('inventoryHeightValue');
        
        if (widthValue) widthValue.textContent = this.inventoryWidth;
        if (heightValue) heightValue.textContent = this.inventoryHeight;
    }
    
    updateAddItemButton() {
        const addItemBtn = document.getElementById('addItemBtn');
        if (!addItemBtn) return;
        
        const categoryLabels = {
            'all': '➕ Neues Item',
            'weapons': '⚔️ Neue Waffe',
            'armor': '🛡️ Neue Rüstung',
            'potions': '🧪 Neuer Trank',
            'materials': '📦 Neues Material',
            'quest': '📜 Neues Quest-Item'
        };
        
        const label = categoryLabels[this.currentCategory] || categoryLabels['all'];
        addItemBtn.textContent = label;
        
        // Update dropdown behavior
        if (this.currentCategory === 'all') {
            // Show dropdown menu for all categories
            addItemBtn.classList.add('dropdown-toggle');
            addItemBtn.onclick = null; // Let dropdown handle click
        } else {
            // Direct creation for specific category
            addItemBtn.classList.remove('dropdown-toggle');
            addItemBtn.onclick = () => this.createNewItem(this.currentCategory);
        }
    }
    
    getDefaultInventoryWidth(category) {
        switch (category) {
            case 'weapons':
                return 2; // Most weapons are 2x1 or 2x2
            case 'armor':
                return 2; // Most armor pieces are 2x1 or 2x2
            case 'potions':
                return 1; // Potions are always 1x1
            case 'materials':
                return 0; // Materials have no inventory slots
            case 'quest':
                return 1; // Quest items are usually 1x1
            default:
                return 1;
        }
    }
    
    getDefaultInventoryHeight(category) {
        switch (category) {
            case 'weapons':
                return 2; // Most weapons are 2x1 or 2x2
            case 'armor':
                return 2; // Most armor pieces are 2x1 or 2x2
            case 'potions':
                return 1; // Potions are always 1x1
            case 'materials':
                return 0; // Materials have no inventory slots
            case 'quest':
                return 1; // Quest items are usually 1x1
            default:
                return 1;
        }
    }
}

// Make ItemEditor available globally immediately
window.itemEditor = new ItemEditor();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[ItemEditor] DOM ready, initializing...');
        if (window.itemEditor) {
            window.itemEditor.initialize();
        }
    });
} else {
    console.log('[ItemEditor] DOM already ready, initializing...');
    if (window.itemEditor) {
        window.itemEditor.initialize();
    }
}

// Globale Verfügbarkeit
window.ItemEditor = ItemEditor;
