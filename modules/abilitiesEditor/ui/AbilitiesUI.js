/**
 * Abilities UI Module
 * Handles user interface, React components, and visual elements
 */
class AbilitiesUI {
    constructor(core, game) {
        this.core = core;
        this.game = game;
        this.abilitiesTable = null;
        this.abilityDetailsModal = null;
    }

    initialize() {
        console.log('[AbilitiesUI] UI module initializing...');
        
        // Load CSS if not already loaded
        this.loadCSS();
        
        // Initialize sub-modules
        if (typeof AbilityDetailsModal === 'undefined') {
            throw new Error('AbilityDetailsModal is not defined. Check if the module loaded correctly.');
        }
        if (typeof AbilitiesTable === 'undefined') {
            throw new Error('AbilitiesTable is not defined. Check if the module loaded correctly.');
        }
        
        this.abilityDetailsModal = new AbilityDetailsModal(this);
        this.abilitiesTable = new AbilitiesTable(this);
        
        // Setup the editor interface
        this.setupEditor();
        
        console.log('[AbilitiesUI] UI module initialized successfully');
    }

    loadCSS() {
        const existingCSS = document.querySelector('link[href*="abilitiesEditor.css"]');
        if (!existingCSS) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/modules/abilitiesEditor/abilitiesEditor.css';
            cssLink.onload = () => console.log('[AbilitiesUI] CSS loaded successfully');
            cssLink.onerror = () => console.error('[AbilitiesUI] Failed to load CSS');
            document.head.appendChild(cssLink);
            console.log('[AbilitiesUI] CSS loading initiated');
        } else {
            console.log('[AbilitiesUI] CSS already loaded');
        }
    }

    setupEditor() {
        const container = document.getElementById('abilitiesEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="abilities-editor">
                    <h2>Fähigkeiten Editor</h2>
                    
                    <div class="category-tabs">
                        <button class="category-btn active" data-category="all">
                            <span>Alle</span>
                        </button>
                        <button class="category-btn" data-category="combat">
                            <span>⚔️ Kampf</span>
                        </button>
                        <button class="category-btn" data-category="magic">
                            <span>🔮 Magie</span>
                        </button>
                        <button class="category-btn" data-category="craft">
                            <span>⚒️ Handwerk</span>
                        </button>
                        <button class="category-btn" data-category="social">
                            <span>💬 Sozial</span>
                        </button>
                    </div>
                    
                    <div class="toolbar">
                        <button id="refreshAbilitiesBtn" class="btn btn-success">🔄 Neu Laden</button>
                        <button id="addAbilityBtn" class="btn btn-primary">➕ Neue Fähigkeit</button>
                        <button id="resetToOriginalBtn" class="btn btn-warning">🔄 Original wiederherstellen</button>
                    </div>
                    
                    <div class="abilities-table-container">
                        <table class="abilities-table">
                            <thead>
                                <tr id="abilitiesTableHeader">
                                    <th class="col-icon">Icon</th>
                                    <th class="col-name">Name</th>
                                    <th class="col-description">Beschreibung</th>
                                    <th class="col-cost">Kosten</th>
                                </tr>
                            </thead>
                            <tbody id="abilitiesTableBody">
                                <!-- Wird dynamisch gefüllt -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="abilities-count">
                        <span id="abilitiesCount">0</span> Fähigkeiten gefunden
                    </div>
                </div>
                
                <!-- Modal wird dynamisch von AbilityDetailsModal erstellt -->
            `;
        }
    }

    initializeCategoryTabs() {
        const savedCategory = localStorage.getItem('abilitiesEditorCategory');
        if (savedCategory) {
            this.core.setCategory(savedCategory);
        }
        
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.core.setCategory(btn.dataset.category);
                
                // Save category to localStorage
                localStorage.setItem('abilitiesEditorCategory', this.core.getCurrentCategory());
                
                this.updateDisplay();
            });
        });
        
        // Set active state for saved category
        if (savedCategory) {
            const savedBtn = document.querySelector(`[data-category="${savedCategory}"]`);
            if (savedBtn) {
                categoryBtns.forEach(b => b.classList.remove('active'));
                savedBtn.classList.add('active');
            }
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshAbilitiesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
        
        // Add ability button
        const addBtn = document.getElementById('addAbilityBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addNewAbility();
            });
        }

        // Export titles button
        
        // Reset to original data button
        const resetBtn = document.getElementById('resetToOriginalBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToOriginalData();
            });
        }
        
        // Race selection listeners removed - using AbilityDetailsModal instead
    }

    // setupRaceSelectionListeners removed - using AbilityDetailsModal instead

    updateDisplay() {
        if (this.abilitiesTable) {
            this.abilitiesTable.updateAbilitiesTable();
        }
    }

    // Public API methods for other modules
    getCore() {
        return this.core;
    }

    getGame() {
        return this.game;
    }

    getAbilitiesTable() {
        return this.abilitiesTable;
    }

    getAbilityDetailsModal() {
        return this.abilityDetailsModal;
    }

    // Delegate methods for AbilitiesTable compatibility
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

    // Event handlers
    refresh() {
        localStorage.removeItem('abilitiesEditor_abilities');
        window.location.reload();
    }

    addNewAbility() {
        const newAbility = {
            id: Date.now(),
            name: 'Neue Fähigkeit',
            category: 'combat',
            type: 'Unbekannt',
            element: 'physical',
            description: 'Beschreibung der neuen Fähigkeit',
            cost: 'Keine Kosten',
            status: 'active',
            races: []
        };
        
        this.core.addAbility(newAbility);
        this.openEditModal(newAbility);
        this.core.saveAbilities();
    }


    resetToOriginalData() {
        if (confirm('Alle Änderungen verwerfen und zu den ursprünglichen Daten zurückkehren?')) {
            localStorage.removeItem('abilitiesEditor_abilities');
            localStorage.removeItem('abilitiesEditorCategory');
            window.location.reload();
        }
    }

    openEditModal(ability) {
        // Use the new AbilityDetailsModal instead
        if (this.abilityDetailsModal) {
            this.abilityDetailsModal.showAbilityDetails(ability.id);
        }
    }

    // Old modal methods removed - using AbilityDetailsModal instead

    showError(error) {
        console.error('[AbilitiesUI] Error:', error);
        const container = document.getElementById('abilitiesEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>Fehler beim Laden des Editors</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">Neu laden</button>
                </div>
            `;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilitiesUI;
}
