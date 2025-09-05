/**
 * TileEditor Core - Modular Architecture
 */
class TileEditorCore {
    constructor() {
        this.categories = [];
        this.selectedCategoryId = null;
        this.debugMode = false;
        
        // Initialize modules
        this.biomeManager = new BiomeManager();
        this.modalManager = null; // Will be set after ModalManager loads
        
        // Bind methods
        this.loadBiomeTiles = this.loadBiomeTiles.bind(this);
        this.openTileModalFromBiome = this.openTileModalFromBiome.bind(this);
        this.removeTileFromBiome = this.removeTileFromBiome.bind(this);
        
        // Initialize
        this.init();
    }

    /**
     * Initialize TileEditor
     */
    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.setupBiomeManagerEvents();
            
            console.log('[TileEditorCore] Initialized successfully');
        } catch (error) {
            console.error('[TileEditorCore] Initialization error:', error);
        }
    }

    /**
     * Load categories from server
     */
    async loadCategories() {
        try {
            // Load categories from server or use defaults
            const response = await fetch('/api/categories');
            if (response.ok) {
                this.categories = await response.json();
            } else {
                // Fallback to default categories
                this.categories = this.getDefaultCategories();
            }
            
            this.renderCategories();
        } catch (error) {
            console.error('[TileEditorCore] Error loading categories:', error);
            this.categories = this.getDefaultCategories();
            this.renderCategories();
        }
    }

    /**
     * Get default categories
     */
    getDefaultCategories() {
        return [
            { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50' },
            { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548' },
            { id: 'water', name: 'Water', type: 'biome', color: '#2196F3' },
            { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800' },
            { id: 'buildings', name: 'Buildings', type: 'entities', color: '#9C27B0' }
        ];
    }

    /**
     * Render categories to DOM
     */
    renderCategories() {
        const container = document.getElementById('categoriesList');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <div class="category-item" data-category-id="${category.id}">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-type">${category.type}</div>
                </div>
                <div class="category-actions">
                    <button class="category-action-btn" onclick="window.tileEditor.openBiomeModal('${category.id}')">📁</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Category selection
        document.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const categoryId = categoryItem.dataset.categoryId;
                this.selectCategory(categoryId);
            }
        });

        // Debug mode toggle
        const debugCheckbox = document.getElementById('debugMode');
        if (debugCheckbox) {
            debugCheckbox.addEventListener('change', (e) => {
                this.debugMode = e.target.checked;
                this.debug('Debug mode:', this.debugMode ? 'enabled' : 'disabled');
            });
        }
    }

    /**
     * Setup BiomeManager events
     */
    setupBiomeManagerEvents() {
        this.biomeManager.on('biomeLoaded', (data) => {
            this.debug('Biome loaded:', data.category.name, data.tileCount, 'tiles');
        });

        this.biomeManager.on('biomeSaved', (data) => {
            this.debug('Biome saved:', data.biomeName, data.tileCount, 'tiles');
        });
    }

    /**
     * Select a category
     */
    selectCategory(categoryId) {
        this.selectedCategoryId = categoryId;
        
        // Update UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.debug('Category selected:', categoryId);
    }

    /**
     * Load biome tiles using BiomeManager
     */
    async loadBiomeTiles(category) {
        if (!category) {
            console.error('[TileEditorCore] No category provided for loadBiomeTiles');
            return;
        }

        try {
            await this.biomeManager.loadBiomeTiles(category, {
                viewMode: 'cards',
                batchSize: 10,
                delay: 0
            });
        } catch (error) {
            console.error('[TileEditorCore] Error loading biome tiles:', error);
        }
    }

    /**
     * Open biome modal
     */
    openBiomeModal(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            console.error('[TileEditorCore] Category not found:', categoryId);
            return;
        }

        // Load biome tiles first
        this.loadBiomeTiles(category);

        // Open modal using ModalManager if available
        if (this.modalManager && this.modalManager.openBiomeModal) {
            this.modalManager.openBiomeModal(category);
        } else {
            // Fallback: show modal directly
            this.showBiomeModal(category);
        }
    }

    /**
     * Show biome modal (fallback)
     */
    showBiomeModal(category) {
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Update modal content
            const title = document.getElementById('biomeModalTitle');
            if (title) {
                title.textContent = `${category.name} verwalten`;
            }
        }
    }

    /**
     * Open tile modal from biome
     */
    openTileModalFromBiome(tileId) {
        this.debug('Opening tile modal for tile:', tileId);
        
        // Close biome modal first
        this.closeBiomeModal();
        
        // Open tile modal using ModalManager if available
        if (this.modalManager && this.modalManager.openTileModal) {
            this.modalManager.openTileModal(tileId);
        } else {
            console.error('[TileEditorCore] ModalManager not available for tile modal');
        }
    }

    /**
     * Remove tile from biome
     */
    async removeTileFromBiome(tileId) {
        if (!this.biomeManager.currentBiome) {
            console.error('[TileEditorCore] No current biome selected');
            return;
        }

        if (confirm('Möchtest du dieses Tile wirklich aus dem Biome entfernen?')) {
            try {
                await this.biomeManager.removeTileFromBiome(tileId, this.biomeManager.currentBiome.name);
                this.showToast('Tile aus Biome entfernt!', 'success');
            } catch (error) {
                console.error('[TileEditorCore] Error removing tile:', error);
                this.showToast('Fehler beim Entfernen des Tiles', 'error');
            }
        }
    }

    /**
     * Close biome modal
     */
    closeBiomeModal() {
        const modal = document.getElementById('biomeModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Debug logging
     */
    debug(...args) {
        if (this.debugMode) {
            console.log('[TileEditorCore]', ...args);
        }
    }

    /**
     * Show toast message
     */
    showToast(message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    /**
     * Get TileEditor statistics
     */
    getStats() {
        return {
            categories: this.categories.length,
            selectedCategory: this.selectedCategoryId,
            debugMode: this.debugMode,
            biomeManager: this.biomeManager.getStats()
        };
    }
}

// Export for use in other modules
window.TileEditorCore = TileEditorCore;
