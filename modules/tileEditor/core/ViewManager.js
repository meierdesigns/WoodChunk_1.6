/**
 * ViewManager - Handles view mode switching (table/cards)
 */
class ViewManager {
    constructor() {
        this.currentViewMode = 'table';
    }

    switchViewMode(mode) {
        console.log('[ViewManager] Switching view mode to:', mode);
        
        // Update active button using both data-view and specific IDs
        const allViewButtons = document.querySelectorAll('button[data-view]');
        allViewButtons.forEach(btn => btn.classList.remove('active'));
        
        // Also update specific button IDs
        const tableViewBtn = document.getElementById('toggleTableView');
        const cardsViewBtn = document.getElementById('toggleCardView');
        
        console.log('[ViewManager] Found buttons for activation:', {
            tableViewBtn: !!tableViewBtn,
            cardsViewBtn: !!cardsViewBtn
        });
        
        if (tableViewBtn) tableViewBtn.classList.remove('active');
        if (cardsViewBtn) cardsViewBtn.classList.remove('active');
        
        if (mode === 'table') {
            if (tableViewBtn) {
                tableViewBtn.classList.add('active');
                console.log('[ViewManager] Table button activated');
            } else {
                console.warn('[ViewManager] Table button not found for activation');
            }
        } else if (mode === 'cards') {
            if (cardsViewBtn) {
                cardsViewBtn.classList.add('active');
                console.log('[ViewManager] Cards button activated');
            } else {
                console.warn('[ViewManager] Cards button not found for activation');
            }
        }
        
        // Store view mode preference
        localStorage.setItem('tileEditorViewMode', mode);
        console.log('[ViewManager] View mode saved to localStorage:', mode);
        
        // DEBUG: Check current view mode
        const currentViewMode = localStorage.getItem('tileEditorViewMode');
        console.log('[ViewManager] Current view mode from localStorage:', currentViewMode);
        
        this.currentViewMode = mode;
    }

    updateAnyOpenModalView(mode) {
        console.log('[ViewManager] Trying to find any open modal to update view mode');
        
        // Try to find any visible modal
        const visibleModal = document.querySelector('.modal[style*="display: block"], .modal[style*="display:block"]');
        
        if (visibleModal) {
            console.log('[ViewManager] Found visible modal:', visibleModal);
            
            // Try to find tiles container within this modal
            const tilesContainer = visibleModal.querySelector('#biomeTilesList') ||
                                  visibleModal.querySelector('.biome-tiles-container') || 
                                  visibleModal.querySelector('.tiles-container') ||
                                  visibleModal.querySelector('#tilesContainer') ||
                                  visibleModal.querySelector('.modal-content .tiles-section') ||
                                  visibleModal.querySelector('.tiles-section') ||
                                  visibleModal.querySelector('.biome-tiles-list');
            
            console.log('[ViewManager] Tiles container found in visible modal:', !!tilesContainer);
            
            if (tilesContainer) {
                if (mode === 'table') {
                    console.log('[ViewManager] Displaying tiles as table in visible modal');
                    this.displayTilesAsTable(tilesContainer);
                } else if (mode === 'cards') {
                    console.log('[ViewManager] Displaying tiles as cards in visible modal');
                    this.displayTilesAsCards(tilesContainer);
                }
            } else {
                console.warn('[ViewManager] No tiles container found in visible modal');
                // Try to find container in document body as fallback
                const fallbackContainer = document.querySelector('#biomeTilesList') ||
                                         document.querySelector('.biome-tiles-container') ||
                                         document.querySelector('.tiles-container');
                
                if (fallbackContainer) {
                    console.log('[ViewManager] Using fallback container');
                    if (mode === 'table') {
                        this.displayTilesAsTable(fallbackContainer);
                    } else if (mode === 'cards') {
                        this.displayTilesAsCards(fallbackContainer);
                    }
                }
            }
        } else {
            console.log('[ViewManager] No visible modal found, view mode will be applied when modal opens');
        }
    }

    displayTilesAsTable(container) {
        // Delegate to main TileEditor
        if (window.tileEditor && window.tileEditor.displayTilesAsTable) {
            window.tileEditor.displayTilesAsTable(container);
        }
    }

    displayTilesAsCards(container) {
        // Delegate to main TileEditor
        if (window.tileEditor && window.tileEditor.displayTilesAsCards) {
            window.tileEditor.displayTilesAsCards(container);
        }
    }

    restoreViewMode() {
        const savedMode = localStorage.getItem('tileEditorViewMode');
        if (savedMode) {
            console.log('[ViewManager] Restoring view mode from localStorage:', savedMode);
            this.switchViewMode(savedMode);
            return savedMode;
        }
        return 'table';
    }

    getCurrentViewMode() {
        return this.currentViewMode;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViewManager;
}
