/**
 * People Editor Module
 */
class PeopleEditor {
    constructor() {
        this.isInitialized = false;
        this.peoples = [];
        this.filteredPeoples = [];
        this.currentTab = 'all';
        this.currentCategory = 'all';
        this.availableAbilities = [];
        this.selectedAbilities = [];
        this.currentEditingPerson = null;
        
        // Load CSS if not already loaded
        this.loadCSS();
        
        console.log('[PeopleEditor] Constructor called');
        this.initialize();
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
        const existingCSS = document.querySelector('link[href*="peopleEditor.css"]');
        if (!existingCSS) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'peopleEditor.css?v=v1';
            cssLink.onload = () => console.log('[PeopleEditor] CSS loaded successfully');
            cssLink.onerror = () => console.error('[PeopleEditor] Failed to load CSS');
            document.head.appendChild(cssLink);
            console.log('[PeopleEditor] CSS loading initiated');
        } else {
            console.log('[PeopleEditor] CSS already loaded');
        }
    }

    async initialize() {
        console.log('[PeopleEditor] Initializing...');
        
        try {
            // Initialize the editor
            this.setupEditor();
            await this.loadPeoplesFromAssets();
            this.initializeTabs();
            this.initializeCategoryTabs();
            this.initializePeopleTable();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[PeopleEditor] Module initialized successfully');
        } catch (error) {
            console.error('[PeopleEditor] Failed to initialize:', error);
            this.showError(error);
        }
    }

         setupEditor() {
         console.log('[PeopleEditor] Setting up editor...');
         const container = document.getElementById('peopleEditorContainer');
         if (container) {
             container.innerHTML = `
                 <div class="people-editor">
                     <div class="category-tabs">
                         <button class="category-btn active" data-category="all">
                             <span>Alle</span>
                         </button>
                         <button class="category-btn" data-category="humans">
                             <img src="../../assets/peoples/humans/humans.png" alt="Menschen" class="category-icon" onerror="this.style.display='none'">
                             <span>Menschen</span>
                         </button>
                         <button class="category-btn" data-category="elves">
                             <img src="../../assets/peoples/elves/elves.png" alt="Elfen" class="category-icon" onerror="this.style.display='none'">
                             <span>Elfen</span>
                         </button>
                         <button class="category-btn" data-category="dwarves">
                             <img src="../../assets/peoples/dwarves/dwarves.png" alt="Zwerge" class="category-icon" onerror="this.style.display='none'">
                             <span>Zwerge</span>
                         </button>
                         <button class="category-btn" data-category="orcs">
                             <img src="../../assets/peoples/orcs/orcs.png" alt="Orks" class="category-icon" onerror="this.style.display='none'">
                             <span>Orks</span>
                         </button>
                         <button class="category-btn" data-category="goblins">
                             <img src="../../assets/peoples/goblins/goblins.png" alt="Goblins" class="category-icon" onerror="this.style.display='none'">
                             <span>Goblins</span>
                         </button>
                     </div>
                     
                                          <div class="people-table-container">
                          <table class="peoples-table" id="peoplesTable">
                              <!-- Table wird dynamisch generiert -->
                          </table>
                      </div>
                      
                      <div class="people-count">
                          <span id="peopleCount">0</span> Klassen/Berufe gefunden
                      </div>
                 </div>
                 
                 <!-- Edit Modal -->
                 <div id="editModal" class="modal" style="display: none;">
                     <div class="modal-content">
                         <div class="modal-header">
                             <h3>Klasse/Beruf bearbeiten</h3>
                             <span class="close">&times;</span>
                         </div>
                         <div class="modal-body">
                             <form id="editForm">
                                 <div class="form-layout-with-icon">
                                     <div class="job-icon-sidebar">
                                         <div class="job-icon-display">
                                             <img id="currentJobIconPreview" src="" alt="Berufsgrafik" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd; display: none;">
                                             <div id="noJobIconPreview" class="no-icon-preview-sidebar">📋</div>
                                         </div>
                                         <div class="job-icon-controls-sidebar">
                                             <input type="file" id="editJobIcon" name="jobIcon" accept="image/*" style="display: none;">
                                             <button type="button" class="btn btn-secondary btn-small" id="selectJobIconBtn">Grafik wählen</button>
                                             <button type="button" class="btn btn-secondary btn-small" id="removeJobIconBtn" style="display: none;">Entfernen</button>
                                         </div>
                                         <input type="hidden" id="editJobIconPath" name="jobIconPath">
                                     </div>
                                     <div class="form-content">
                                         <div class="form-group">
                                             <label for="editName">Name:</label>
                                             <input type="text" id="editName" name="name" required>
                                         </div>
                                         <div class="form-group">
                                             <label for="editDescription">Beschreibung:</label>
                                             <textarea id="editDescription" name="description" rows="3"></textarea>
                                         </div>
                                     </div>
                                 </div>
                                                                 <div class="form-group">
                                    <label for="editAbilities">Fähigkeiten:</label>
                                    <div class="abilities-list-container">
                                        <div class="abilities-filter-tabs">
                                            <button type="button" class="ability-tab active" data-category="all">
                                                <span>Alle</span>
                                            </button>
                                            <button type="button" class="ability-tab" data-category="combat">
                                                <span>⚔️ Kampf</span>
                                            </button>
                                            <button type="button" class="ability-tab" data-category="magic">
                                                <span>🔮 Magie</span>
                                            </button>
                                            <button type="button" class="ability-tab" data-category="craft">
                                                <span>⚒️ Handwerk</span>
                                            </button>
                                            <button type="button" class="ability-tab" data-category="social">
                                                <span>💬 Sozial</span>
                                            </button>
                                        </div>
                                        
                                        <div class="abilities-dual-panel">
                                            <div class="selected-abilities-panel">
                                                <h4 class="panel-title">✅ Ausgewählte Fähigkeiten</h4>
                                                <div class="selected-abilities-list" id="selectedAbilitiesList">
                                                    <!-- Ausgewählte Fähigkeiten werden hier angezeigt -->
                                                </div>
                                            </div>
                                            
                                            <div class="available-abilities-panel">
                                                <h4 class="panel-title">📋 Verfügbare Fähigkeiten</h4>
                                                <div class="abilities-search-bar">
                                                    <input type="text" id="abilitiesQuickSearch" placeholder="🔍 Fähigkeit suchen..." class="quick-search">
                                                </div>
                                                <div class="abilities-clickable-list" id="abilitiesClickableList">
                                                    <!-- Fähigkeiten werden hier als klickbare Liste angezeigt -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 <div class="form-actions">
                                     <button type="submit" class="btn btn-primary">Speichern</button>
                                     <button type="button" class="btn btn-secondary" id="cancelEdit">Abbrechen</button>
                                 </div>
                             </form>
                         </div>
                     </div>
                 </div>
             `;
         }
     }

        async loadPeoplesFromAssets() {
        console.log('[PeopleEditor] Loading peoples data...');
        
        try {
            // Load peoples data from the JSON file
            console.log('[PeopleEditor] Loading peoples from JSON file...');
            const response = await fetch('../../assets/peoples/peoples.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[PeopleEditor] Peoples data received:', data);
            
            if (data.peoples && Array.isArray(data.peoples)) {
                this.peoples = data.peoples.map(people => ({
                    ...people,
                    // Fix portrait paths to be relative to the editor
                    portrait: people.portrait ? people.portrait.replace('assets/', '../../assets/') : null,
                    // Add jobIconPath for table display
                    jobIconPath: people.portrait ? people.portrait.replace('assets/', '../../assets/') : null
                }));
                
                this.filteredPeoples = [...this.peoples];
                console.log(`[PeopleEditor] Total peoples loaded: ${this.peoples.length}`);
                return;
            } else {
                throw new Error('Invalid JSON format - missing peoples array');
            }
            
        } catch (error) {
            console.error('[PeopleEditor] Failed to load peoples from JSON:', error);
            // Fallback to mock data
            this.loadMockData();
        }
    }
    
    getCharacterClass(charData) {
        // Try to determine class from abilities or description
        if (charData.abilities) {
            const abilities = charData.abilities.toLowerCase();
            if (abilities.includes('magie') || abilities.includes('zauber')) return 'Magier';
            if (abilities.includes('bogen') || abilities.includes('schütze')) return 'Bogenschütze';
            if (abilities.includes('schwert') || abilities.includes('krieger')) return 'Krieger';
            if (abilities.includes('händler') || abilities.includes('merchant')) return 'Händler';
        }
        
        // Default class based on race
        const raceClasses = {
            'humans': 'Mensch',
            'elves': 'Elf',
            'dwarves': 'Zwerg',
            'orcs': 'Ork',
            'goblins': 'Goblin'
        };
        
        return raceClasses[charData.type] || 'Unbekannt';
    }
    
    loadMockData() {
        console.log('[PeopleEditor] Loading mock data...');
        this.peoples = [
            { 
                id: 1, 
                name: 'Ranger', 
                race: 'humans', 
                description: 'Waldläufer und Späher', 
                abilities: 'Überleben, Spurenlesen, Bogenkampf',
                jobIconPath: '../../assets/peoples/humans/humans.png'
            },
            { 
                id: 2, 
                name: 'Archer', 
                race: 'elves', 
                description: 'Bogenschütze und Jäger', 
                abilities: 'Präzision, Schnelligkeit, Waldkenntnis',
                jobIconPath: '../../assets/peoples/elves/elves.png'
            },
            { 
                id: 3, 
                name: 'Warrior', 
                race: 'dwarves', 
                description: 'Krieger und Verteidiger', 
                abilities: 'Kampf, Ausdauer, Schmiedekunst',
                jobIconPath: '../../assets/peoples/dwarves/dwarves.png'
            },
            { 
                id: 4, 
                name: 'Wizard', 
                race: 'humans', 
                description: 'Magier und Gelehrter', 
                abilities: 'Magie, Wissen, Rituale',
                jobIconPath: '../../assets/peoples/humans/humans.png'
            },
            { 
                id: 5, 
                name: 'Berserker', 
                race: 'orcs', 
                description: 'Wilde Krieger', 
                abilities: 'Kampfrausch, Stärke, Aggression',
                jobIconPath: '../../assets/peoples/orcs/orcs.png'
            },
            { 
                id: 6, 
                name: 'Scout', 
                race: 'goblins', 
                description: 'Späher und Kundschafter', 
                abilities: 'Tarnung, Schnelligkeit, List',
                jobIconPath: '../../assets/peoples/goblins/goblins.png'
            }
        ];
        this.filteredPeoples = [...this.peoples];
    }

    initializeTabs() {
        console.log('[PeopleEditor] Initializing tabs...');
        // No tab functionality needed anymore - only category filtering remains
    }

         initializeCategoryTabs() {
         console.log('[PeopleEditor] Initializing category tabs...');
         
         // Load saved category from localStorage
         const savedCategory = localStorage.getItem('peopleEditorCategory');
         if (savedCategory) {
             this.currentCategory = savedCategory;
             console.log('[PeopleEditor] Restored saved category:', savedCategory);
         }
         
         const categoryBtns = document.querySelectorAll('.category-btn');
         categoryBtns.forEach(btn => {
             btn.addEventListener('click', () => {
                 categoryBtns.forEach(b => b.classList.remove('active'));
                 btn.classList.add('active');
                 this.currentCategory = btn.dataset.category;
                 
                 // Save category to localStorage
                 localStorage.setItem('peopleEditorCategory', this.currentCategory);
                 console.log('[PeopleEditor] Saved category to localStorage:', this.currentCategory);
                 
                 this.filterPeoples();
             });
         });
         
         // Set active state for saved category
         if (savedCategory) {
             const savedBtn = document.querySelector(`[data-category="${savedCategory}"]`);
             if (savedBtn) {
                 categoryBtns.forEach(b => b.classList.remove('active'));
                 savedBtn.classList.add('active');
                 
                 // Filter data for saved category
                 this.filterPeoples();
             }
         }
     }

    filterPeoples() {
        this.filteredPeoples = this.peoples.filter(people => {
            const categoryMatch = this.currentCategory === 'all' || people.race === this.currentCategory;
            return categoryMatch;
        });
        this.updatePeopleTable();
    }

    initializePeopleTable() {
        console.log('[PeopleEditor] Initializing people table...');
        this.updatePeopleTable();
    }

             updatePeopleTable() {
        const table = document.getElementById('peoplesTable');
        const countSpan = document.getElementById('peopleCount');
        
        if (!table) return;
        
        const showRaceColumn = this.currentCategory === 'all';
        
        // Generate table header
        const headerCells = [
            '<th>Grafik</th>',
            '<th>Klasse/Beruf</th>',
            '<th>Beschreibung</th>',
            '<th>Aktionen</th>'
        ].join('');
        
        // Generate table rows
        const rows = this.filteredPeoples.map(people => {
            const raceIcon = showRaceColumn ? `
                <img src="${this.getRacePortraitPath(people.race)}" 
                     alt="${this.getRaceDisplayName(people.race)}" 
                     class="race-icon-inline"
                     title="${this.getRaceDisplayName(people.race)}">
            ` : '';
            
            return `
                <tr>
                    <td class="job-icon-cell">
                        ${people.portrait ? 
                            `<img src="${people.portrait}" alt="${people.name}" class="job-icon-table">` : 
                            '<div class="no-job-icon">📋</div>'
                        }
                    </td>
                    <td class="job-name-cell">
                        <div class="job-name-with-race">
                            ${raceIcon}
                            <span class="job-name">${people.name}</span>
                        </div>
                    </td>
                    <td>${people.description}</td>
                    <td>
                        <button class="btn-edit" data-id="${people.id}">Bearbeiten</button>
                        <button class="btn-delete" data-id="${people.id}">Löschen</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update table HTML
        table.innerHTML = `
            <thead>
                <tr>${headerCells}</tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        `;
         
         // Add event listeners to buttons
         const tbody = table.querySelector('tbody');
         if (tbody) {
             tbody.querySelectorAll('.btn-edit').forEach(btn => {
                 btn.addEventListener('click', (e) => {
                     const id = parseInt(e.target.dataset.id);
                     this.editPeople(id);
                 });
             });
             
             tbody.querySelectorAll('.btn-delete').forEach(btn => {
                 btn.addEventListener('click', (e) => {
                     const id = parseInt(e.target.dataset.id);
                     this.deletePeople(id);
                 });
             });
         }
         
         if (countSpan) {
             countSpan.textContent = this.filteredPeoples.length;
         }
     }

    getRaceDisplayName(race) {
        const raceNames = {
            'humans': 'Menschen',
            'elves': 'Elfen',
            'dwarves': 'Zwerge',
            'orcs': 'Orks',
            'goblins': 'Goblins'
        };
        return raceNames[race] || race;
    }

    getRacePortraitPath(race) {
        const racePortraits = {
            'humans': '../../assets/peoples/humans/humans.png',
            'elves': '../../assets/peoples/elves/elves.png',
            'dwarves': '../../assets/peoples/dwarves/dwarves.png',
            'orcs': '../../assets/peoples/orcs/orcs.png',
            'goblins': '../../assets/peoples/goblins/goblins.png'
        };
        return racePortraits[race] || '../../assets/default-race.png';
    }

    setupEventListeners() {
        console.log('[PeopleEditor] Setting up event listeners...');
        // Event listeners sind bereits in den Tab-Methoden implementiert
        
        // Setup cleanup button
        const cleanupBtn = document.getElementById('cleanupAbilities');
        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => {
                this.cleanupAllAbilities();
            });
        }
        
        // Setup abilities-related event listeners
        this.setupAbilitiesEventListeners();
    }

    cleanupAllAbilities() {
        if (confirm('Alle nicht-ausgewählten Fähigkeiten von allen Völkern entfernen?\n\nDies kann nicht rückgängig gemacht werden!')) {
            console.log('[PeopleEditor] Starting abilities cleanup for all peoples...');
            
            let cleanedCount = 0;
            this.peoples.forEach(people => {
                const oldAbilities = people.abilities;
                
                // If no assignedAbilities, clear everything
                if (!people.assignedAbilities || !Array.isArray(people.assignedAbilities) || people.assignedAbilities.length === 0) {
                    people.assignedAbilities = [];
                    people.abilities = '';
                    if (oldAbilities && oldAbilities.trim() !== '') {
                        cleanedCount++;
                        console.log(`[PeopleEditor] Cleared all abilities for ${people.name}`);
                    }
                } else {
                    // Keep only assigned abilities
                    people.abilities = people.assignedAbilities.join(', ');
                    if (oldAbilities !== people.abilities) {
                        cleanedCount++;
                        console.log(`[PeopleEditor] Cleaned abilities for ${people.name}: ${people.assignedAbilities.length} abilities kept`);
                    }
                }
            });
            
            // Save the cleaned data immediately
            console.log('[PeopleEditor] Saving cleaned peoples data...');
            this.savePeoples(true);
            
            // Update the UI
            this.filterPeoples();
            
            alert(`✅ Bereinigung abgeschlossen!\n\n${cleanedCount} Charaktere wurden bereinigt.\n\nDaten wurden automatisch gespeichert.`);
            console.log(`[PeopleEditor] Cleanup completed. ${cleanedCount} peoples were cleaned and saved.`);
        }
    }

         editPeople(id) {
         const people = this.peoples.find(p => p.id === id);
         if (people) {
             this.openEditModal(people);
         }
     }
     
     openEditModal(people) {
         const modal = document.getElementById('editModal');
         const form = document.getElementById('editForm');
         
         // Store current editing person
         this.currentEditingPerson = people;
         
                 // Fill form with current data
        document.getElementById('editName').value = people.name;
        document.getElementById('editDescription').value = people.description;
        
        // Handle job icon
        this.setupJobIconSelector(people);
         
                 // Setup abilities display - only use properly assigned abilities
        this.selectedAbilities = [];
        if (people.assignedAbilities && Array.isArray(people.assignedAbilities)) {
            // Use the properly assigned abilities
            this.selectedAbilities = [...people.assignedAbilities];
        } else {
            // Clear any legacy abilities - force fresh selection
            this.selectedAbilities = [];
        }
         
                 // Update modal title to show race
        const raceName = this.getRaceDisplayName(people.race);
        const availableAbilitiesTitle = document.querySelector('.available-abilities-panel .panel-title');
        if (availableAbilitiesTitle) {
            availableAbilitiesTitle.textContent = `Verfügbare Fähigkeiten für ${raceName}`;
        }
        
        // Load and render both abilities lists
        this.loadAndRenderAbilitiesList();
         
         // Store the people ID for form submission
         form.dataset.peopleId = people.id;
         
         // Show modal
         modal.style.display = 'block';
         
         // Setup modal event listeners
         this.setupModalEvents();
         
                 // Setup abilities event listeners after modal is shown
        setTimeout(() => {
            this.setupAbilitiesEventListeners();
        }, 100);
    }

    setupJobIconSelector(people) {
        console.log('[PeopleEditor] Setting up job icon selector for:', people.name);
        
        const jobIconPath = people.jobIconPath || '';
        const previewImg = document.getElementById('currentJobIconPreview');
        const noIconPreview = document.getElementById('noJobIconPreview');
        const jobIconPathInput = document.getElementById('editJobIconPath');
        const selectBtn = document.getElementById('selectJobIconBtn');
        const removeBtn = document.getElementById('removeJobIconBtn');
        const fileInput = document.getElementById('editJobIcon');
        
        // Set initial state
        jobIconPathInput.value = jobIconPath;
        
        if (jobIconPath) {
            previewImg.src = jobIconPath;
            previewImg.style.display = 'block';
            noIconPreview.style.display = 'none';
            removeBtn.style.display = 'inline-block';
        } else {
            previewImg.style.display = 'none';
            noIconPreview.style.display = 'block';
            removeBtn.style.display = 'none';
        }
        
        // Setup event listeners
        selectBtn.onclick = () => {
            fileInput.click();
        };
        
        removeBtn.onclick = () => {
            this.removeJobIcon();
        };
        
        fileInput.onchange = (event) => {
            this.handleJobIconUpload(event);
        };
    }

    removeJobIcon() {
        console.log('[PeopleEditor] Removing job icon');
        
        const previewImg = document.getElementById('currentJobIconPreview');
        const noIconPreview = document.getElementById('noJobIconPreview');
        const jobIconPathInput = document.getElementById('editJobIconPath');
        const removeBtn = document.getElementById('removeJobIconBtn');
        
        previewImg.style.display = 'none';
        noIconPreview.style.display = 'block';
        removeBtn.style.display = 'none';
        jobIconPathInput.value = '';
    }

    async handleJobIconUpload(event) {
        console.log('[PeopleEditor] Handling job icon upload');
        
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('jobIcon', file);
            formData.append('peopleId', this.currentEditingPerson.id);
            formData.append('peopleName', this.currentEditingPerson.name);
            
            // Upload to server
            const response = await fetch('/api/upload-job-icon', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('[PeopleEditor] Job icon uploaded:', result.path);
                
                // Update preview
                const previewImg = document.getElementById('currentJobIconPreview');
                const noIconPreview = document.getElementById('noJobIconPreview');
                const jobIconPathInput = document.getElementById('editJobIconPath');
                const removeBtn = document.getElementById('removeJobIconBtn');
                
                previewImg.src = result.path;
                previewImg.style.display = 'block';
                noIconPreview.style.display = 'none';
                removeBtn.style.display = 'inline-block';
                jobIconPathInput.value = result.path;
                
            } else {
                throw new Error(`Upload failed: ${response.status}`);
            }
        } catch (error) {
            console.error('[PeopleEditor] Failed to upload job icon:', error);
            alert('Fehler beim Hochladen der Grafik. Bitte versuchen Sie es erneut.');
        }
    }
     
     setupModalEvents() {
         const modal = document.getElementById('editModal');
         const closeBtn = modal.querySelector('.close');
         const cancelBtn = document.getElementById('cancelEdit');
         const form = document.getElementById('editForm');
         
         // Close modal
         const closeModal = () => {
             modal.style.display = 'none';
         };
         
         // Close on X button
         closeBtn.onclick = closeModal;
         
         // Close on cancel button
         cancelBtn.onclick = closeModal;
         
         // Close on outside click
         window.onclick = (event) => {
             if (event.target === modal) {
                 closeModal();
             }
         };
         
         // Handle form submission
         form.onsubmit = (e) => {
             e.preventDefault();
             this.saveEditForm();
         };
     }
     
         saveEditForm() {
        const form = document.getElementById('editForm');
        const peopleId = parseInt(form.dataset.peopleId);
        const people = this.peoples.find(p => p.id === peopleId);
        
        if (people) {
            // Update people data
            people.name = document.getElementById('editName').value;
            people.description = document.getElementById('editDescription').value;
            people.jobIconPath = document.getElementById('editJobIconPath').value;
            
            // Clean abilities - only save what was actually selected
            people.assignedAbilities = [...this.selectedAbilities];
            people.abilities = this.selectedAbilities.join(', ');
            
            // Clear any legacy ability references not in selectedAbilities
            if (people.legacyAbilities) {
                delete people.legacyAbilities;
            }
            
            // Save peoples data
            this.savePeoples();
            
            // Update table
            this.filterPeoples();
            
            // Close modal
            document.getElementById('editModal').style.display = 'none';
            
            console.log('[PeopleEditor] Updated people:', people);
        }
    }

    async savePeoples(isCleanupSave = false) {
        console.log('[PeopleEditor] Saving peoples data...');
        
        // Clean up all peoples before saving (only if not already cleaned in cleanup)
        if (!isCleanupSave) {
            this.cleanupAllPeoples();
        }
        
        try {
            const response = await fetch('/api/save-peoples', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    peoples: this.peoples,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('[PeopleEditor] Peoples saved successfully:', result.message);
                if (isCleanupSave) {
                    console.log('[PeopleEditor] ✅ Cleanup data saved to server');
                }
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('[PeopleEditor] Failed to save peoples:', error);
            // For now, just use localStorage as fallback
            localStorage.setItem('peoplesData', JSON.stringify(this.peoples));
            console.log('[PeopleEditor] Saved peoples to localStorage as fallback');
            if (isCleanupSave) {
                console.log('[PeopleEditor] ⚠️ Cleanup data saved to localStorage (server failed)');
            }
        }
    }

    cleanupAllPeoples() {
        console.log('[PeopleEditor] Cleaning up abilities for all peoples...');
        
        this.peoples.forEach(people => {
            // If people has assignedAbilities, use only those
            if (people.assignedAbilities && Array.isArray(people.assignedAbilities)) {
                people.abilities = people.assignedAbilities.join(', ');
                console.log(`[PeopleEditor] Cleaned abilities for ${people.name}: ${people.assignedAbilities.length} abilities`);
            } else if (!people.assignedAbilities) {
                // If no assignedAbilities, clear the abilities field
                people.assignedAbilities = [];
                people.abilities = '';
                console.log(`[PeopleEditor] Cleared all abilities for ${people.name}`);
            }
            
            // Remove any legacy fields
            if (people.legacyAbilities) {
                delete people.legacyAbilities;
            }
        });
    }



    deletePeople(id) {
        if (confirm('Völk wirklich löschen?')) {
            this.peoples = this.peoples.filter(p => p.id !== id);
            this.savePeoples();
            this.filterPeoples();
        }
    }

    showError(error) {
        const container = document.getElementById('peopleEditorContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Fehler beim Laden des Völker Editors</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Neu laden</button>
                </div>
            `;
        }
    }

    refresh() {
        console.log('[PeopleEditor] Refreshing module...');
        this.filterPeoples();
    }

    destroy() {
        console.log('[PeopleEditor] Destroying module...');
        this.isInitialized = false;
    }

    // ========================================
    // Abilities Management Methods
    // ========================================

    async loadAvailableAbilities() {
        console.log('[PeopleEditor] Loading available abilities...');
        
        try {
            // Load abilities from the same API that AbilitiesEditor uses
            const response = await fetch('/api/load-abilities');
            
            if (response.ok) {
                const data = await response.json();
                console.log('[PeopleEditor] Server abilities data received:', data);
                
                if (data.abilities && Array.isArray(data.abilities) && data.abilities.length > 0) {
                    this.availableAbilities = data.abilities;
                    console.log(`[PeopleEditor] Loaded ${this.availableAbilities.length} abilities from server`);
                    return;
                }
            }
            
            // Fallback: Load from asset scanning
            const assetResponse = await fetch('/api/scan-abilities');
            const assetData = await assetResponse.json();
            console.log('[PeopleEditor] Asset abilities data received:', assetData);
            
            if (assetData.status === 'success' && assetData.abilities) {
                this.availableAbilities = [];
                let id = 1;
                
                // Process each category
                for (const [categoryKey, categoryData] of Object.entries(assetData.abilities)) {
                    if (categoryData.abilities) {
                        for (const ability of categoryData.abilities) {
                            try {
                                // Load ability data from JS file
                                const abilityResponse = await fetch(ability.path);
                                if (abilityResponse.ok) {
                                    const abilityText = await abilityResponse.text();
                                    // Parse the JS object
                                    const abilityData = JSON.parse(abilityText.replace(/^\(|\)$/g, ''));
                                    
                                    // Create ability object
                                    const abilityObj = {
                                        id: id++,
                                        name: abilityData.name || ability.file.replace('.js', ''),
                                        category: categoryKey,
                                        type: abilityData.type || 'Unbekannt',
                                        description: abilityData.description || 'Keine Beschreibung verfügbar',
                                        cost: abilityData.cost || 'Keine Kosten definiert',
                                        icon: abilityData.icon || '⚡',
                                        characterData: abilityData
                                    };
                                    
                                    this.availableAbilities.push(abilityObj);
                                }
                            } catch (abilityError) {
                                console.warn(`[PeopleEditor] Failed to load ability ${ability.file}:`, abilityError);
                            }
                        }
                    }
                }
                
                console.log(`[PeopleEditor] Loaded ${this.availableAbilities.length} abilities from assets`);
            }
            
        } catch (error) {
            console.error('[PeopleEditor] Failed to load abilities:', error);
            this.availableAbilities = [];
        }
    }

    async loadAndRenderAbilitiesList() {
        console.log('[PeopleEditor] Loading and rendering abilities list...');
        
        // Load abilities if not already loaded
        if (this.availableAbilities.length === 0) {
            console.log('[PeopleEditor] Loading abilities from server...');
            await this.loadAvailableAbilities();
        }
        
        console.log('[PeopleEditor] Available abilities:', this.availableAbilities.length);
        console.log('[PeopleEditor] Selected abilities:', this.selectedAbilities);
        
        this.renderAbilitiesList();
        this.renderSelectedAbilitiesList();
    }

    filterAbilitiesByRace(abilities, race) {
        console.log(`[PeopleEditor] Filtering abilities for race: ${race}`);
        
        if (!abilities || abilities.length === 0) {
            console.log('[PeopleEditor] No abilities to filter');
            return [];
        }
        
        // Convert race name to match Abilities Editor format
        const raceMapping = {
            'humans': ['Humans', 'Menschen'],
            'elves': ['Elves', 'Elfen'], 
            'dwarves': ['Dwarves', 'Zwerge'],
            'orcs': ['Orcs', 'Orks'],
            'goblins': ['Goblins']
        };
        
        const raceNames = raceMapping[race] || [race];
        console.log(`[PeopleEditor] Mapped race names: ${raceNames.join(', ')}`);
        
        // Filter abilities that are assigned to this race in the Abilities Editor
        const filteredAbilities = abilities.filter(ability => {
            // Check if ability has race assignments in the races array
            if (ability.races && Array.isArray(ability.races)) {
                const isAssigned = raceNames.some(raceName => ability.races.includes(raceName));
                if (isAssigned) {
                    const matchedRace = raceNames.find(raceName => ability.races.includes(raceName));
                    console.log(`[PeopleEditor] Ability "${ability.name}" is assigned to ${matchedRace}`);
                }
                return isAssigned;
            }
            
            // Also check characterData.availableFor (legacy format)
            if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor)) {
                const isAssigned = raceNames.some(raceName => 
                    ability.characterData.availableFor.includes(raceName.toLowerCase()) ||
                    ability.characterData.availableFor.includes(raceName)
                );
                if (isAssigned) {
                    console.log(`[PeopleEditor] Ability "${ability.name}" is available for ${race} (legacy format)`);
                }
                return isAssigned;
            }
            
            // If no race assignments exist, don't show the ability
            console.log(`[PeopleEditor] Ability "${ability.name}" has no race assignments - excluding`);
            return false;
        });
        
        console.log(`[PeopleEditor] Filtered ${filteredAbilities.length} abilities for ${race} from ${abilities.length} total`);
        
        // If no abilities are assigned to this race, show a message in the console
        if (filteredAbilities.length === 0) {
            console.warn(`[PeopleEditor] No abilities assigned to ${race} in Abilities Editor. Please assign abilities in the Abilities Editor first.`);
        }
        
        return filteredAbilities;
    }

    renderAbilitiesList() {
        console.log('[PeopleEditor] Rendering abilities list...');
        const listContainer = document.getElementById('abilitiesClickableList');
        if (!listContainer) {
            console.warn('[PeopleEditor] abilitiesClickableList element not found');
            return;
        }
        
        // Get active tab category
        const activeTab = document.querySelector('.ability-tab.active');
        const categoryFilter = activeTab ? activeTab.dataset.category : 'all';
        const searchFilter = document.getElementById('abilitiesQuickSearch')?.value?.toLowerCase() || '';
        
        // Filter abilities
        let filteredAbilities = this.availableAbilities;
        
        // Filter by race assignments from Abilities Editor
        if (this.currentEditingPerson && this.currentEditingPerson.race) {
            filteredAbilities = this.filterAbilitiesByRace(filteredAbilities, this.currentEditingPerson.race);
        }
        
        if (categoryFilter !== 'all') {
            filteredAbilities = filteredAbilities.filter(ability => ability.category === categoryFilter);
        }
        if (searchFilter) {
            filteredAbilities = filteredAbilities.filter(ability => 
                ability.name.toLowerCase().includes(searchFilter) ||
                ability.description.toLowerCase().includes(searchFilter)
            );
        }
        
        // Sort abilities: selected first, then alphabetically
        filteredAbilities.sort((a, b) => {
            const aSelected = this.selectedAbilities.includes(a.name);
            const bSelected = this.selectedAbilities.includes(b.name);
            
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Render abilities as clickable list
        listContainer.innerHTML = filteredAbilities.map(ability => {
            const isSelected = this.selectedAbilities.includes(ability.name);
            return `
                <div class="ability-list-item ${isSelected ? 'selected' : ''}" 
                     data-ability-name="${ability.name}">
                    <div class="ability-status">
                        <span class="ability-check">${isSelected ? '✅' : '⚪'}</span>
                    </div>
                    <div class="ability-icon-small">${ability.icon || '⚡'}</div>
                    <div class="ability-details">
                        <div class="ability-name-small">${ability.name}</div>
                        <div class="ability-meta">
                            <span class="ability-category-small">${this.getCategoryDisplayName(ability.category)}</span>
                            <span class="ability-cost-small">${ability.cost}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click event listeners to ability items
        const abilityItems = listContainer.querySelectorAll('.ability-list-item');
        abilityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const abilityName = item.dataset.abilityName;
                this.toggleAbilityInList(abilityName);
            });
        });
        
        // Show count
        const count = filteredAbilities.length;
        const selectedCount = this.selectedAbilities.length;
        
        // Remove existing count info
        const parentPanel = listContainer.closest('.available-abilities-panel');
        const existingCountInfo = parentPanel?.querySelector('.abilities-count-info');
        if (existingCountInfo) {
            existingCountInfo.remove();
        }
        
        // Add new count info
        if (parentPanel) {
            parentPanel.insertAdjacentHTML('beforeend', 
                `<div class="abilities-count-info">${selectedCount} von ${count} Fähigkeiten ausgewählt</div>`
            );
        }
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'combat': '⚔️ Kampf',
            'magic': '🔮 Magie',
            'craft': '⚒️ Handwerk',
            'social': '💬 Sozial'
        };
        return categoryNames[category] || category;
    }

    toggleAbilityInList(abilityName) {
        console.log('[PeopleEditor] Toggling ability in list:', abilityName);
        console.log('[PeopleEditor] Current selected abilities:', this.selectedAbilities);
        
        const index = this.selectedAbilities.indexOf(abilityName);
        if (index > -1) {
            this.selectedAbilities.splice(index, 1);
            console.log('[PeopleEditor] Removed ability:', abilityName);
        } else {
            this.selectedAbilities.push(abilityName);
            console.log('[PeopleEditor] Added ability:', abilityName);
        }
        
        console.log('[PeopleEditor] New selected abilities:', this.selectedAbilities);
        
        // Update current person's abilities immediately
        if (this.currentEditingPerson) {
            this.currentEditingPerson.assignedAbilities = [...this.selectedAbilities];
            this.currentEditingPerson.abilities = this.selectedAbilities.join(', ');
            console.log('[PeopleEditor] Updated person abilities:', this.currentEditingPerson.abilities);
        }
        
        // Re-render both lists to show updated state
        this.renderAbilitiesList();
        this.renderSelectedAbilitiesList();
    }

    renderSelectedAbilitiesList() {
        console.log('[PeopleEditor] Rendering selected abilities list...');
        const selectedList = document.getElementById('selectedAbilitiesList');
        if (!selectedList) {
            console.warn('[PeopleEditor] selectedAbilitiesList element not found');
            return;
        }
        
        if (this.selectedAbilities.length === 0) {
            selectedList.innerHTML = '<div class="no-selected-abilities">Keine Fähigkeiten ausgewählt</div>';
            return;
        }
        
        // Get selected abilities with full data
        const selectedAbilitiesData = this.selectedAbilities.map(abilityName => {
            return this.availableAbilities.find(ab => ab.name === abilityName);
        }).filter(Boolean);
        
        selectedList.innerHTML = selectedAbilitiesData.map(ability => {
            return `
                <div class="selected-ability-item" data-ability-name="${ability.name}">
                    <div class="selected-ability-icon">${ability.icon || '⚡'}</div>
                    <div class="selected-ability-details">
                        <div class="selected-ability-name">${ability.name}</div>
                        <div class="selected-ability-category">${this.getCategoryDisplayName(ability.category)}</div>
                    </div>
                    <button type="button" class="remove-selected-ability" data-ability-name="${ability.name}" title="Entfernen">
                        ❌
                    </button>
                </div>
            `;
        }).join('');
        
        // Add click event listeners to remove buttons
        const removeButtons = selectedList.querySelectorAll('.remove-selected-ability');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const abilityName = button.dataset.abilityName;
                this.toggleAbilityInList(abilityName);
            });
        });
    }

    setupAbilitiesEventListeners() {
        // Tab event listeners
        const abilityTabs = document.querySelectorAll('.ability-tab');
        abilityTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                abilityTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                e.target.closest('.ability-tab').classList.add('active');
                // Re-render list
                this.renderAbilitiesList();
            });
        });
        
        // Search input event listener
        const quickSearch = document.getElementById('abilitiesQuickSearch');
        if (quickSearch) {
            quickSearch.addEventListener('input', () => {
                this.renderAbilitiesList();
                this.renderSelectedAbilitiesList();
            });
        }
    }
}

// Globale Verfügbarkeit
window.PeopleEditor = PeopleEditor;

// Erstelle globale Instanz
let peopleEditor;
document.addEventListener('DOMContentLoaded', () => {
    peopleEditor = new PeopleEditor();
    // Stelle sicher, dass die Instanz global verfügbar ist
    window.peopleEditor = peopleEditor;
});
