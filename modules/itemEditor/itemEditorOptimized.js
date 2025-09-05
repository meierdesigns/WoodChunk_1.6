/**
 * OPTIMIZED ItemEditor Module - Handles item editor functionality with improved performance
 */
class ItemEditorOptimized {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.currentCategory = 'all';
        this.isInitialized = false;
        console.log('[ItemEditorOptimized] Constructor called');
    }

    async initialize() {
        console.log('[ItemEditorOptimized] Initializing...');
        
        try {
            // Initialize the editor
            this.setupEditor();
            await this.loadItemAssetsOptimized();
            this.initializeCategoryTabs();
            this.initializeItemTable();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[ItemEditorOptimized] Module initialized successfully');
        } catch (error) {
            console.error('[ItemEditorOptimized] Failed to initialize:', error);
            this.showError(error);
        }
    }

    setupEditor() {
        console.log('[ItemEditorOptimized] Setting up editor...');
        const container = document.getElementById('itemEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="item-editor">
                    <h2>Item Editor (OPTIMIZED)</h2>
                    
                    <div class="category-tabs">
                        <button class="category-btn active" data-category="all">
                            <span>Alle</span>
                        </button>
                        <button class="category-btn" data-category="weapons">
                            <span>⚔️ Waffen</span>
                        </button>
                        <button class="category-btn" data-category="armor">
                            <span>🛡️ Rüstung</span>
                        </button>
                        <button class="category-btn" data-category="potions">
                            <span>🧪 Tränke</span>
                        </button>
                        <button class="category-btn" data-category="materials">
                            <span>⛏️ Materialien</span>
                        </button>

                    </div>
                    
                    <div class="toolbar">
                        <button id="refreshItemsBtn" class="btn btn-success">🔄 Neu Laden</button>
                        <button id="addItemBtn" class="btn btn-primary">➕ Neues Item</button>
                        <button id="editItemBtn" class="btn btn-secondary">✏️ Bearbeiten</button>
                        <button id="deleteItemBtn" class="btn btn-danger">🗑️ Löschen</button>
                        <button id="exportItemsBtn" class="btn btn-info">📝 Exportieren</button>
                    </div>
                    
                    <div class="items-table-container">
                        <table class="items-table">
                            <thead>
                                <tr id="itemsTableHeader">
                                    <th class="col-icon">Icon</th>
                                    <th class="col-name">Name</th>
                                    <th class="col-category">Kategorie</th>
                                    <th class="col-level">Level</th>
                                    <th class="col-rarity">Seltenheit</th>
                                    <th class="col-value">Wert</th>
                                    <th class="col-actions">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="itemsTableBody">
                                <!-- Wird dynamisch gefüllt -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="items-count">
                        <span id="itemsCount">0</span> Items gefunden
                    </div>
                </div>
            `;
        }
    }

    async loadItemAssetsOptimized() {
        console.log('[ItemEditorOptimized] Loading items with OPTIMIZED batch loading...');
        try {
            // OPTIMIZATION: Load all items in one batch request
            const response = await fetch('/api/load-all-items');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[ItemEditorOptimized] Batch loaded items:', data);
            
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
                
                this.filteredItems = [...this.items];
                console.log(`[ItemEditorOptimized] OPTIMIZED: Loaded ${this.items.length} items in single request`);
            } else {
                throw new Error('Invalid response format from optimized endpoint');
            }
            
        } catch (error) {
            console.error('[ItemEditorOptimized] Failed to load items:', error);
            this.showError(error);
        }
    }

    getItemIcon(category, type, name) {
        // Simple icon mapping based on category and type
        const iconMap = {
            weapons: {
                sword: '⚔️',
                axe: '🪓',
                bow: '🏹',
                staff: '🦯',
                default: '⚔️'
            },
            armor: {
                helmet: '🪖',
                chest: '🥋',
                boots: '👢',
                shield: '🛡️',
                default: '🛡️'
            },
            potions: {
                health: '❤️',
                mana: '🔮',
                default: '🧪'
            },
            materials: {
                ore: '⛏️',
                wood: '🪵',
                herb: '🌿',
                default: '📦'
            },
            quest: {
                key: '🗝️',
                scroll: '📜',
                default: '🎯'
            }
        };
        
        const categoryIcons = iconMap[category] || {};
        const typeKey = type ? type.toLowerCase() : '';
        const nameKey = name ? name.toLowerCase() : '';
        
        // Try to find matching icon
        for (const [keyword, icon] of Object.entries(categoryIcons)) {
            if (typeKey.includes(keyword) || nameKey.includes(keyword)) {
                return icon;
            }
        }
        
        return categoryIcons.default || '📦';
    }

    initializeCategoryTabs() {
        console.log('[ItemEditorOptimized] Initializing category tabs...');
        
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                
                this.filterItemsByCategory();
                console.log('[ItemEditorOptimized] Switched to category:', this.currentCategory);
            });
        });
        
        console.log('[ItemEditorOptimized] Category tabs initialized');
    }

    filterItemsByCategory() {
        if (this.currentCategory === 'all') {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => item.category === this.currentCategory);
        }
        
        this.updateItemTable();
    }

    initializeItemTable() {
        console.log('[ItemEditorOptimized] Initializing item table...');
        this.updateItemTable();
    }

    updateItemTable() {
        const tbody = document.getElementById('itemsTableBody');
        const countSpan = document.getElementById('itemsCount');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.filteredItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="item-icon-cell">${item.icon}</td>
                <td class="item-name-cell">${item.name}</td>
                <td class="item-category-cell">${item.category}</td>
                <td class="item-level-cell">${Math.round(item.level || 0)}</td>
                <td class="item-rarity-cell">${item.rarity}</td>
                <td class="item-value-cell">${Math.round(item.value || 0)}</td>
                <td class="item-actions-cell">
                    <button class="btn-edit" data-id="${item.id}">Bearbeiten</button>
                    <button class="btn-delete" data-id="${item.id}">Löschen</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        if (countSpan) {
            countSpan.textContent = this.filteredItems.length;
        }
        
        console.log(`[ItemEditorOptimized] Updated table with ${this.filteredItems.length} items`);
    }

    setupEventListeners() {
        console.log('[ItemEditorOptimized] Setting up event listeners...');
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshItemsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
        
        // Add item button
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addNewItem();
            });
        }
        
        // Edit and delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit')) {
                const id = e.target.dataset.id;
                this.editItem(id);
            } else if (e.target.classList.contains('btn-delete')) {
                const id = e.target.dataset.id;
                this.deleteItem(id);
            }
        });
        
        console.log('[ItemEditorOptimized] Event listeners setup complete');
    }

    refresh() {
        console.log('[ItemEditorOptimized] Refreshing...');
        this.loadItemAssetsOptimized();
    }

    addNewItem() {
        console.log('[ItemEditorOptimized] Adding new item...');
        // Implementation for adding new items
    }

    editItem(id) {
        console.log('[ItemEditorOptimized] Editing item:', id);
        // Implementation for editing items
    }

    deleteItem(id) {
        console.log('[ItemEditorOptimized] Deleting item:', id);
        // Implementation for deleting items
    }

    showError(error) {
        const container = document.getElementById('itemEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Fehler beim Laden des Item Editors</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Neu laden</button>
                </div>
            `;
        }
    }

    destroy() {
        console.log('[ItemEditorOptimized] Destroying...');
        this.isInitialized = false;
    }
}

// Make ItemEditorOptimized available globally
window.ItemEditorOptimized = ItemEditorOptimized;
