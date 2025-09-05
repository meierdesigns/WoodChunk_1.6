/**
 * Abilities Editor Module - Modular Architecture
 * Main orchestrator that coordinates core, game, and ui modules
 */
class AbilitiesEditor {
    constructor() {
        this.isInitialized = false;
        
        // Initialize modules
        this.core = new AbilitiesCore();
        this.game = new AbilitiesGame(this.core);
        this.ui = new AbilitiesUI(this.core, this.game);
        
        console.log('[AbilitiesEditor] Constructor called - Modular architecture');
        this.initialize();
    }
    
    async initialize() {
        console.log('[AbilitiesEditor] Initializing modular architecture...');
        
        try {
            // Initialize core module first
            await this.core.initialize();
            
            // Initialize game module
            this.game.initialize();
            
            // Initialize UI module
            this.ui.initialize();
            
            // Setup UI components
            this.ui.initializeCategoryTabs();
            this.ui.setupEventListeners();
            
            // Initialize table after all modules are ready
            this.ui.getAbilitiesTable().initializeAbilitiesTable();
            
            this.isInitialized = true;
            console.log('[AbilitiesEditor] Module initialized successfully');
        } catch (error) {
            console.error('[AbilitiesEditor] Failed to initialize:', error);
            this.ui.showError(error);
        }
    }

    // Public API methods for backward compatibility
    getAbilities() {
        return this.core.getAbilities();
    }

    getFilteredAbilities() {
        return this.core.getFilteredAbilities();
    }

    getAvailableRaces() {
        return this.core.getAvailableRaces();
    }

    getCurrentCategory() {
        return this.core.getCurrentCategory();
    }

    // Delegate methods to appropriate modules
    getAbilityIcon(ability) {
        return this.game.getAbilityIcon(ability);
    }

    getElementDisplay(ability) {
        return this.game.getElementDisplay(ability);
    }

    getTypeIcon(ability) {
        return this.game.getTypeIcon(ability);
    }

    getEvolutionsDisplay(ability) {
        return this.game.getEvolutionsDisplay(ability);
    }
    
    // Cache busting utility for Buildings images
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const separator = imagePath.includes('?') ? '&' : '?';
            return `${imagePath}${separator}_cb=${timestamp}`;
        }
        
        return imagePath;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilitiesEditor;
}
