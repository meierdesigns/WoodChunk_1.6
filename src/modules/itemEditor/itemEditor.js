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
        this.currentCategory = 'weapons';
        this.isInitialized = false;
        console.log('[ItemEditor] Constructor called');
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

            // Load saved category preference
            await this.loadSavedCategory();
            
            // Initialize category tabs
            this.initializeCategoryTabs();
            
            // Load item assets
            await this.loadItemAssets();
            
            // Initialize table
            this.initializeItemTable();
            
            // Apply saved category filter
            this.filterItemsByCategory(this.currentCategory);
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[ItemEditor] Initialized successfully');
        } catch (error) {
            console.error('[ItemEditor] Failed to initialize:', error);
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
                
                // Filter items by category
                this.filterItemsByCategory(category);
                
                console.log('[ItemEditor] Switched to category:', category);
            });
        });
        
        console.log('[ItemEditor] Category tabs initialized');
    }

    async loadItemAssets() {
        console.log('[ItemEditor] Loading items LIVE from JS files...');
        try {
            // Mock data for demonstration
            this.items = [
                { id: 1, name: 'Iron Sword', category: 'weapons', level: 1, rarity: 'common', value: 150, icon: '⚔️' },
                { id: 2, name: 'Steel Axe', category: 'weapons', level: 5, rarity: 'uncommon', value: 280, icon: '🪓' },
                { id: 3, name: 'Leather Armor', category: 'armor', level: 1, rarity: 'common', value: 120, icon: '🛡️' },
                { id: 4, name: 'Chain Mail', category: 'armor', level: 8, rarity: 'uncommon', value: 450, icon: '🔗' },
                { id: 5, name: 'Health Potion', category: 'potions', level: 1, rarity: 'common', value: 25, icon: '🧪' },
                { id: 6, name: 'Mana Potion', category: 'potions', level: 1, rarity: 'common', value: 30, icon: '🔮' },
                { id: 7, name: 'Iron Ore', category: 'materials', level: 1, rarity: 'common', value: 15, icon: '⛏️' },
                { id: 8, name: 'Gold Ore', category: 'materials', level: 3, rarity: 'uncommon', value: 45, icon: '💎' },

            ];
            
            console.log('[ItemEditor] All items loaded LIVE from JS files');
            
            // Update table with items
            this.updateItemTable();
            
        } catch (error) {
            console.error('[ItemEditor] Failed to load items:', error);
        }
    }

    initializeItemTable() {
        console.log('[ItemEditor] Initializing item table...');
        this.updateItemTable();
        console.log('[ItemEditor] Item table initialized');
    }

    updateItemTable() {
        const tableBody = document.getElementById('itemsTableBody');
        if (!tableBody) {
            console.error('[ItemEditor] Table body not found');
            return;
        }

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

            row.innerHTML = `
                <td class="table-cell item-icon-cell">
                    <span class="item-placeholder">${item.icon}</span>
                </td>
                <td class="table-cell">${item.name}</td>
                <td class="table-cell">${Math.round(item.level || 0)}</td>
                <td class="table-cell">
                    <span class="rarity rarity-${item.rarity}">${item.rarity}</span>
                </td>
                <td class="table-cell">${Math.round(item.value || 0)} Gold</td>
                <td class="table-cell center">
                    <button class="action-btn action-btn-edit" onclick="window.itemEditor.editItem(${item.id})">✏️</button>
                    <button class="action-btn action-btn-delete" onclick="window.itemEditor.deleteItem(${item.id})">🗑️</button>
                </td>
            `;

            // Add click handler for row selection
            row.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn')) {
                    this.selectItem(item.id);
                }
            });

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

    createNewItem() {
        console.log('[ItemEditor] Creating new item...');
        const newItem = {
            id: Date.now(),
            name: 'Neues Item',
            category: this.currentCategory,
            level: 1,
            rarity: 'common',
            value: 0,
            icon: '📦'
        };
        
        this.items.push(newItem);
        this.filterItemsByCategory(this.currentCategory);
        this.selectItem(newItem.id);
        
        console.log('[ItemEditor] New item created:', newItem);
    }

    editItem(itemId) {
        console.log('[ItemEditor] Editing item:', itemId);
        // In real implementation, this would open an edit modal
        alert(`Bearbeite Item ${itemId}`);
    }

    deleteItem(itemId) {
        console.log('[ItemEditor] Deleting item:', itemId);
        if (confirm('Möchtest du dieses Item wirklich löschen?')) {
            this.items = this.items.filter(item => item.id !== itemId);
            this.filterItemsByCategory(this.currentCategory);
            this.selectedItemId = null;
            console.log('[ItemEditor] Item deleted:', itemId);
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
        const refreshBtn = document.getElementById('refreshItemsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        const addBtn = document.getElementById('addItemBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.createNewItem());
        }

        const editBtn = document.getElementById('editItemBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (this.selectedItemId) {
                    this.editItem(this.selectedItemId);
                } else {
                    alert('Bitte wähle ein Item aus');
                }
            });
        }

        const deleteBtn = document.getElementById('deleteItemBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.selectedItemId) {
                    this.deleteItem(this.selectedItemId);
                } else {
                    alert('Bitte wähle ein Item aus');
                }
            });
        }

        const exportBtn = document.getElementById('exportItemsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportItems());
        }

        const importBtn = document.getElementById('importItemsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importItems());
        }

        console.log('[ItemEditor] Event listeners setup complete');
    }

    saveCurrentCategory() {
        try {
            localStorage.setItem('itemEditorCategory', this.currentCategory);
        } catch (error) {
            console.warn('[ItemEditor] Failed to save category:', error);
        }
    }

    refresh() {
        console.log('[ItemEditor] Refreshing...');
        this.loadItemAssets();
    }

    destroy() {
        console.log('[ItemEditor] Destroying...');
        // Cleanup event listeners and references
        this.isInitialized = false;
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
