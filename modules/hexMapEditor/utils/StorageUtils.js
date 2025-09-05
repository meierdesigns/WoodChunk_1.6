// LocalStorage Utilities
class StorageUtils {
    static saveBiomeCategoryOrder(categories) {
        try {
            const orderData = categories.map((cat, index) => ({
                id: cat.id,
                name: cat.name,
                order: index
            }));
            localStorage.setItem('hexMapEditor_biomeCategoryOrder', JSON.stringify(orderData));
            console.log('[StorageUtils] Biome category order saved to localStorage');
            return true;
        } catch (error) {
            console.error('[StorageUtils] Failed to save biome category order:', error);
            return false;
        }
    }

    static loadBiomeCategoryOrder() {
        try {
            const savedOrder = localStorage.getItem('hexMapEditor_biomeCategoryOrder');
            if (savedOrder) {
                const orderData = JSON.parse(savedOrder);
                console.log('[StorageUtils] Loaded saved biome category order:', orderData);
                return orderData;
            }
        } catch (error) {
            console.error('[StorageUtils] Failed to load biome category order:', error);
        }
        return null;
    }

    static removeBiomeCategoryOrder() {
        try {
            localStorage.removeItem('hexMapEditor_biomeCategoryOrder');
            console.log('[StorageUtils] Biome category order removed from localStorage');
            return true;
        } catch (error) {
            console.error('[StorageUtils] Failed to remove biome category order:', error);
            return false;
        }
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.StorageUtils = StorageUtils;
}
