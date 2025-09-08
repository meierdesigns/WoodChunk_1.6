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
                    
            <div class="abilities-filter">
                <div class="filter-group">
                    <label>Völker:</label>
                    <div class="multiselect-dropdown">
                        <div class="multiselect-trigger">
                            <div class="multiselect-selected">
                                <span class="multiselect-text">Alle Völker</span>
                            </div>
                            <div class="multiselect-actions">
                                <button class="multiselect-clear" style="display: none;">✕</button>
                                <span class="multiselect-arrow">▼</span>
                            </div>
                        </div>
                        <div class="multiselect-options">
                            <div class="race-item">
                                <input type="checkbox" value="Humans" class="race-checkbox" id="race-humans">
                                <label for="race-humans" class="race-label">
                                    <img src="../../assets/peoples/humans/humans.png" alt="Menschen" class="race-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                    <span class="race-icon" style="display: none;">👤</span>
                                    <span>Menschen</span>
                                </label>
                            </div>
                            <div class="race-item">
                                <input type="checkbox" value="Elves" class="race-checkbox" id="race-elves">
                                <label for="race-elves" class="race-label">
                                    <img src="../../assets/peoples/elves/elves.png" alt="Elfen" class="race-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                    <span class="race-icon" style="display: none;">🧝</span>
                                    <span>Elfen</span>
                                </label>
                            </div>
                            <div class="race-item">
                                <input type="checkbox" value="Dwarves" class="race-checkbox" id="race-dwarves">
                                <label for="race-dwarves" class="race-label">
                                    <img src="../../assets/peoples/dwarves/dwarves.png" alt="Zwerge" class="race-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                    <span class="race-icon" style="display: none;">🧔</span>
                                    <span>Zwerge</span>
                                </label>
                            </div>
                            <div class="race-item">
                                <input type="checkbox" value="Orcs" class="race-checkbox" id="race-orcs">
                                <label for="race-orcs" class="race-label">
                                    <img src="../../assets/peoples/orcs/orcs.png" alt="Orks" class="race-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                    <span class="race-icon" style="display: none;">🧌</span>
                                    <span>Orks</span>
                                </label>
                            </div>
                            <div class="race-item">
                                <input type="checkbox" value="Goblins" class="race-checkbox" id="race-goblins">
                                <label for="race-goblins" class="race-label">
                                    <img src="../../assets/peoples/goblins/goblins.png" alt="Goblins" class="race-portrait" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                    <span class="race-icon" style="display: none;">👺</span>
                                    <span>Goblins</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                        <div class="filter-group">
                            <label for="abilityMagicFilter">Magie-Anforderung:</label>
                            <select id="abilityMagicFilter">
                                <option value="">Alle</option>
                                <option value="none">Keine</option>
                                <option value="basic">Basis</option>
                                <option value="advanced">Fortgeschritten</option>
                                <option value="master">Meister</option>
                                <option value="legendary">Legendär</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="abilitySearchFilter">Suche:</label>
                            <input type="text" id="abilitySearchFilter" placeholder="Fähigkeit suchen...">
                        </div>
                    </div>
                    
                    <div class="abilities-table-container">
                        <table class="abilities-table">
                            <thead>
                                <tr id="abilitiesTableHeader">
                                    <th class="col-icon">Icon</th>
                                    <th class="col-name">Name</th>
                                    <th class="col-description">Beschreibung</th>
                                    <th class="col-cost">Kosten</th>
                                    <th class="col-damage">Schaden</th>
                                    <th class="col-healing">Heilung</th>
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
                
                // Apply all filters including the new category
                this.applyFilters();
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
        
        // Filter event listeners
        this.setupFilterListeners();
        
        // Race selection listeners removed - using AbilityDetailsModal instead
    }

    setupFilterListeners() {
        // Multiselect dropdown toggle
        const multiselectTrigger = document.querySelector('.multiselect-trigger');
        const multiselectOptions = document.querySelector('.multiselect-options');
        
        if (multiselectTrigger && multiselectOptions) {
            multiselectTrigger.addEventListener('click', (e) => {
                // Don't toggle if clicking on clear button
                if (!e.target.classList.contains('multiselect-clear')) {
                    multiselectTrigger.classList.toggle('active');
                    multiselectOptions.classList.toggle('show');
                }
            });
            
            // Clear button functionality
            const clearButton = document.querySelector('.multiselect-clear');
            if (clearButton) {
                clearButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.clearAllRaces();
                });
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!multiselectTrigger.contains(e.target) && !multiselectOptions.contains(e.target)) {
                    multiselectTrigger.classList.remove('active');
                    multiselectOptions.classList.remove('show');
                }
            });
        }
        
        // Race checkboxes
        const raceCheckboxes = document.querySelectorAll('.race-checkbox');
        raceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateMultiselectText();
                this.applyFilters();
            });
        });
        
        // Magic requirement filter
        const magicFilter = document.getElementById('abilityMagicFilter');
        if (magicFilter) {
            magicFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Search filter
        const searchFilter = document.getElementById('abilitySearchFilter');
        if (searchFilter) {
            searchFilter.addEventListener('input', () => {
                this.applyFilters();
            });
        }
    }

    updateMultiselectText() {
        const checkedBoxes = document.querySelectorAll('.race-checkbox:checked');
        const multiselectSelected = document.querySelector('.multiselect-selected');
        const clearButton = document.querySelector('.multiselect-clear');
        
        if (!multiselectSelected) return;
        
        // Clear existing content
        multiselectSelected.innerHTML = '';
        
        if (checkedBoxes.length === 0) {
            multiselectSelected.innerHTML = '<span class="multiselect-text">Alle Völker</span>';
            if (clearButton) clearButton.style.display = 'none';
        } else {
            // Show selected race portraits
            checkedBoxes.forEach(checkbox => {
                const label = checkbox.nextElementSibling;
                const portrait = label.querySelector('.race-portrait');
                const icon = label.querySelector('.race-icon');
                
                const portraitElement = document.createElement('img');
                portraitElement.className = 'multiselect-selected-portrait';
                portraitElement.src = portrait.src;
                portraitElement.alt = portrait.alt;
                portraitElement.onerror = function() {
                    this.style.display = 'none';
                    const fallback = document.createElement('span');
                    fallback.textContent = icon.textContent;
                    fallback.style.fontSize = '14px';
                    multiselectSelected.appendChild(fallback);
                };
                
                multiselectSelected.appendChild(portraitElement);
            });
            
            if (clearButton) clearButton.style.display = 'inline-block';
        }
    }

    clearAllRaces() {
        const raceCheckboxes = document.querySelectorAll('.race-checkbox');
        raceCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateMultiselectText();
        this.applyFilters();
    }

    applyFilters() {
        const raceCheckboxes = document.querySelectorAll('.race-checkbox:checked');
        const magicFilter = document.getElementById('abilityMagicFilter');
        const searchFilter = document.getElementById('abilitySearchFilter');
        
        const filters = {
            category: this.core.currentCategory,
            races: Array.from(raceCheckboxes).map(checkbox => checkbox.value),
            magicRequirement: magicFilter ? magicFilter.value : '',
            search: searchFilter ? searchFilter.value : ''
        };
        
        this.core.filterAbilitiesAdvanced(filters);
        this.updateDisplay();
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
        if (this.abilityDetailsModal && ability && ability.id) {
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
