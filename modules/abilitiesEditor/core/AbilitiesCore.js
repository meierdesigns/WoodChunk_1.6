/**
 * Abilities Core Module
 * Handles data management, configuration, and business logic
 */
class AbilitiesCore {
    constructor() {
        this.abilities = [];
        this.filteredAbilities = [];
        this.availableRaces = [];
        this.currentCategory = 'all';
        this.isInitialized = false;
    }

    async initialize() {
        try {
            await Promise.all([
                this.loadAbilitiesFromAssets(),
                this.loadAvailableRaces()
            ]);
            this.isInitialized = true;
            console.log('[AbilitiesCore] Core module initialized successfully');
        } catch (error) {
            console.error('[AbilitiesCore] Failed to initialize:', error);
            throw error;
        }
    }

    async loadAbilitiesFromAssets() {
        console.log('[AbilitiesCore] Starting loadAbilitiesFromAssets...');
        
        // Check localStorage first for saved changes
        const savedAbilities = localStorage.getItem('abilitiesEditor_abilities');
        console.log('[AbilitiesCore] localStorage data found:', savedAbilities ? 'Yes' : 'No');
        
        if (savedAbilities) {
            console.log('[AbilitiesCore] Loading abilities from localStorage...');
            try {
                const abilitiesData = JSON.parse(savedAbilities);
                this.abilities = abilitiesData.abilities || [];
                console.log('[AbilitiesCore] Loaded', this.abilities.length, 'abilities from localStorage');
                
                // Still load peoples data for race mapping
                await this.loadAvailableRaces();
                
                console.log('[AbilitiesCore] Core module initialized successfully');
                return;
            } catch (error) {
                console.warn('[AbilitiesCore] Failed to load from localStorage, falling back to files:', error);
            }
        }
        
        // Fallback: Load from individual ability files
        console.log('[AbilitiesCore] Loading from individual ability files...');
        
        // Only fallback to abilities.json if individual files fail
        if (this.abilities.length === 0) {
            console.log('[AbilitiesCore] No abilities loaded from individual files, trying abilities.json as fallback...');
            try {
                const response = await fetch('../../assets/abilities/abilities.json');
                console.log('[AbilitiesCore] Response status:', response.status, response.statusText);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('[AbilitiesCore] Raw JSON data loaded:', data);
                    
                    if (data.abilities && Array.isArray(data.abilities) && data.abilities.length > 0) {
                        console.log('[AbilitiesCore] Processing', data.abilities.length, 'abilities from JSON...');
                        
                        this.abilities = data.abilities.map((ability, index) => {
                            console.log(`[AbilitiesCore] Processing ability ${index + 1}: ${ability.name}`);
                            
                            // Extract races from multiple possible sources
                            let races = [];
                            
                            // First priority: characterData.availableFor (most common and reliable)
                            if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor) && ability.characterData.availableFor.length > 0) {
                                races = ability.characterData.availableFor.map(race => 
                                    race.charAt(0).toUpperCase() + race.slice(1)
                                );
                                console.log(`[AbilitiesCore] ${ability.name} - Using characterData.availableFor:`, races);
                            }
                            // Second priority: direct availableFor field
                            else if (ability.availableFor && Array.isArray(ability.availableFor) && ability.availableFor.length > 0) {
                                races = ability.availableFor.map(race => 
                                    race.charAt(0).toUpperCase() + race.slice(1)
                                );
                                console.log(`[AbilitiesCore] ${ability.name} - Using availableFor:`, races);
                            }
                            // Third priority: direct races array (if not empty)
                            else if (ability.races && Array.isArray(ability.races) && ability.races.length > 0) {
                                races = [...ability.races];
                                console.log(`[AbilitiesCore] ${ability.name} - Using races:`, races);
                            }
                            // Fourth priority: characterData.races (legacy)
                            else if (ability.characterData && ability.characterData.races && Array.isArray(ability.characterData.races) && ability.characterData.races.length > 0) {
                                races = [...ability.characterData.races];
                                console.log(`[AbilitiesCore] ${ability.name} - Using characterData.races (legacy):`, races);
                            }
                            else {
                                console.log(`[AbilitiesCore] ${ability.name} - No race data found, using empty array`);
                            }
                            
                            // Normalize race names
                            races = races.map(race => {
                                const raceMap = {
                                    'humans': 'Humans',
                                    'elves': 'Elves', 
                                    'dwarves': 'Dwarves',
                                    'orcs': 'Orcs',
                                    'goblins': 'Goblins',
                                    'Menschen': 'Humans',
                                    'Elfen': 'Elves',
                                    'Zwerge': 'Dwarves',
                                    'Orks': 'Orcs'
                                };
                                return raceMap[race.toLowerCase()] || race;
                            });
                            
                            // Remove duplicates and normalize
                            races = [...new Set(races)];
                            
                            return {
                                id: ability.id || index + 1,
                                name: ability.name || 'Unbekannte Fähigkeit',
                                category: ability.category || 'combat',
                                type: ability.type || 'Unbekannt',
                                element: ability.element || null,
                                description: ability.description || 'Keine Beschreibung verfügbar',
                                cost: ability.cost || 'Keine Kosten definiert',
                                status: 'active',
                                races: races,
                                // Ensure characterData.availableFor is also set for consistency
                                characterData: {
                                    ...ability.characterData,
                                    availableFor: races.map(race => race.toLowerCase())
                                },
                                iconPath: ability.characterData?.iconPath || null
                            };
                        });
                        
                        this.filteredAbilities = [...this.abilities];
                        console.log(`[AbilitiesCore] Loaded ${this.abilities.length} abilities from abilities.json`);
                        return;
                    }
                }
            } catch (error) {
                console.error('[AbilitiesCore] Failed to load abilities.json:', error);
            }
        }
        
        // Final fallback: Load mock data
        if (this.abilities.length === 0) {
            console.log('[AbilitiesCore] No abilities loaded, using mock data...');
            this.loadMockData();
        }
    }

    async loadAbilitiesFromIndividualFiles() {
        console.log('[AbilitiesCore] Loading abilities from individual files...');
        
        try {
            // First, scan all ability files
            const scanResponse = await fetch('/api/scan-abilities');
            if (!scanResponse.ok) {
                throw new Error(`Scan failed: ${scanResponse.status}`);
            }
            
            const scanData = await scanResponse.json();
            console.log('[AbilitiesCore] Scan data received:', scanData);
            
            if (scanData.status !== 'success' || !scanData.abilities) {
                throw new Error('Invalid scan response');
            }
            
            // Load peoples data to get race assignments
            const peoplesResponse = await fetch('../../assets/peoples/peoples.json');
            if (!peoplesResponse.ok) {
                throw new Error(`Peoples load failed: ${peoplesResponse.status}`);
            }
            
            const peoplesData = await peoplesResponse.json();
            console.log('[AbilitiesCore] Peoples data loaded:', peoplesData);
            
            // Create ability-to-classes mapping from peoples data
            const abilityToClasses = {};
            peoplesData.peoples.forEach(people => {
                if (people.assignedAbilities && Array.isArray(people.assignedAbilities)) {
                    people.assignedAbilities.forEach(abilityName => {
                        if (!abilityToClasses[abilityName]) {
                            abilityToClasses[abilityName] = [];
                        }
                        abilityToClasses[abilityName].push({
                            name: people.name,
                            race: people.race
                        });
                        console.log(`[AbilitiesCore] Mapped ability "${abilityName}" to class "${people.name}" (${people.race})`);
                    });
                }
            });
            
            console.log('[AbilitiesCore] Ability-to-classes mapping:', abilityToClasses);
            console.log('[AbilitiesCore] Total abilities in mapping:', Object.keys(abilityToClasses).length);
            
            this.abilities = [];
            let id = 1;
            
            // Process each category
            for (const [categoryKey, categoryData] of Object.entries(scanData.abilities)) {
                if (categoryData.abilities) {
                    for (const abilityFile of categoryData.abilities) {
                        try {
                            // If the file has data, use it directly
                            if (abilityFile.data) {
                                const abilityData = abilityFile.data;
                                console.log(`[AbilitiesCore] Processing ability from file: ${abilityFile.file}`);
                                
                                // Get race assignments from peoples data
                                const abilityName = abilityData.name;
                                const assignedClasses = abilityToClasses[abilityName] || [];
                                
                                console.log(`[AbilitiesCore] Looking for ability "${abilityName}" in mapping...`);
                                console.log(`[AbilitiesCore] Found assigned classes:`, assignedClasses);
                                
                                // Convert classes to races
                                const races = [...new Set(assignedClasses.map(cls => {
                                    const raceMap = {
                                        'dwarves': 'Dwarves',
                                        'elves': 'Elves',
                                        'humans': 'Humans',
                                        'orcs': 'Orcs',
                                        'goblins': 'Goblins'
                                    };
                                    return raceMap[cls.race] || cls.race.charAt(0).toUpperCase() + cls.race.slice(1);
                                }))];
                                
                                console.log(`[AbilitiesCore] ${abilityName} - Assigned classes:`, assignedClasses);
                                console.log(`[AbilitiesCore] ${abilityName} - Converted races:`, races);
                                
                                const ability = {
                                    id: id++,
                                    name: abilityData.name || abilityFile.file.replace('.js', ''),
                                    category: categoryKey,
                                    type: abilityData.type || 'Unbekannt',
                                    element: abilityData.element || null,
                                    description: abilityData.description || 'Keine Beschreibung verfügbar',
                                    cost: abilityData.cost || 'Keine Kosten definiert',
                                    status: 'active',
                                    races: races,
                                    assignedClasses: assignedClasses,
                                    // Keep original characterData for compatibility
                                    characterData: {
                                        ...abilityData,
                                        availableFor: races.map(race => race.toLowerCase())
                                    },
                                    iconPath: abilityData.iconPath || null
                                };
                                
                                this.abilities.push(ability);
                                console.log(`[AbilitiesCore] Added ability: ${ability.name} with races:`, ability.races);
                            }
                        } catch (abilityError) {
                            console.warn(`[AbilitiesCore] Failed to process ability ${abilityFile.file}:`, abilityError);
                        }
                    }
                }
            }
            
            this.filteredAbilities = [...this.abilities];
            console.log(`[AbilitiesCore] Loaded ${this.abilities.length} abilities from individual files`);
            
            // Save to localStorage for future use
            try {
                const abilitiesData = {
                    abilities: this.abilities,
                    metadata: {
                        lastModified: new Date().toISOString(),
                        version: '1.0.0',
                        totalAbilities: this.abilities.length,
                        source: 'individual_files_with_peoples'
                    }
                };
                localStorage.setItem('abilitiesEditor_abilities', JSON.stringify(abilitiesData));
                console.log('[AbilitiesCore] Saved abilities to localStorage');
            } catch (saveError) {
                console.warn('[AbilitiesCore] Failed to save to localStorage:', saveError);
            }
            
        } catch (error) {
            console.error('[AbilitiesCore] Failed to load from individual files:', error);
            console.log('[AbilitiesCore] Falling back to mock data...');
            this.loadMockData();
        }
    }

    loadMockData() {
        console.log('[AbilitiesCore] Loading mock data...');
        this.abilities = [
            { 
                id: 1, 
                name: 'Schwerthieb', 
                category: 'combat', 
                type: 'Angriff', 
                element: 'physical',
                description: 'Ein mächtiger Hieb mit dem Schwert', 
                cost: '1 Aktion', 
                status: 'active',
                races: ['Humans', 'Elves', 'Dwarves'],
                classes: ['Krieger', 'Paladin']
            },
            { 
                id: 2, 
                name: 'Feuerball', 
                category: 'magic', 
                type: 'Zauber', 
                element: 'fire',
                description: 'Ein brennender Feuerball', 
                cost: '5 Mana', 
                status: 'active',
                races: ['Elves', 'Humans'],
                classes: ['Magier', 'Zauberer']
            },
            { 
                id: 3, 
                name: 'Schmiedekunst', 
                category: 'craft', 
                type: 'Handwerk', 
                element: null,
                description: 'Waffen und Rüstungen herstellen', 
                cost: 'Zeit + Material', 
                status: 'active',
                races: ['Dwarves'],
                classes: []
            }
        ];
        this.filteredAbilities = [...this.abilities];
        console.log('[AbilitiesCore] Mock data loaded:', this.abilities.length, 'abilities');
    }

    async loadAvailableRaces() {
        try {
            const response = await fetch('../../assets/peoples/peoples.json');
            if (response.ok) {
                const data = await response.json();
                if (data.peoples && Array.isArray(data.peoples)) {
                    this.availableRaces = data.peoples.map(people => people.name || people.id);
                    return;
                }
            }
        } catch (error) {
            console.warn('[AbilitiesCore] Failed to load races from peoples.json:', error);
        }
        
        // Fallback to default races
        this.availableRaces = ['Humans', 'Elves', 'Dwarves', 'Orcs', 'Goblins'];
    }

    filterAbilities() {
        this.filteredAbilities = this.abilities.filter(ability => {
            const categoryMatch = this.currentCategory === 'all' || ability.category === this.currentCategory;
            return categoryMatch;
        });
    }

    filterAbilitiesAdvanced(filters = {}) {
        this.filteredAbilities = this.abilities.filter(ability => {
            // Category filter
            const categoryMatch = !filters.category || filters.category === 'all' || ability.category === filters.category;
            
            // Race filter - multiple race selection
            let raceMatch = true;
            
            if (filters.races && filters.races.length > 0) {
                raceMatch = false;
                
                // Check characterData.availableFor (most reliable)
                if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor)) {
                    raceMatch = filters.races.some(selectedRace => 
                        ability.characterData.availableFor.includes(selectedRace.toLowerCase()) ||
                        ability.characterData.availableFor.includes(selectedRace)
                    );
                }
                
                // Check direct availableFor field
                if (!raceMatch && ability.availableFor && Array.isArray(ability.availableFor)) {
                    raceMatch = filters.races.some(selectedRace => 
                        ability.availableFor.includes(selectedRace.toLowerCase()) ||
                        ability.availableFor.includes(selectedRace)
                    );
                }
                
                // Check modern format (ability.races array)
                if (!raceMatch && ability.races && Array.isArray(ability.races)) {
                    raceMatch = filters.races.some(selectedRace => ability.races.includes(selectedRace));
                }
            }
            
            // Magic requirement filter
            let magicMatch = true;
            if (filters.magicRequirement) {
                const magicReq = ability.characterData?.magicRequirement || 'none';
                magicMatch = magicReq === filters.magicRequirement;
            }
            
            // Search filter
            let searchMatch = true;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                searchMatch = ability.name.toLowerCase().includes(searchTerm) ||
                             ability.description.toLowerCase().includes(searchTerm);
            }
            
            const finalMatch = categoryMatch && raceMatch && magicMatch && searchMatch;
            if (finalMatch) {
                console.log(`[AbilitiesCore] Ability "${ability.name}" passed all filters`);
            }
            
            return finalMatch;
        });
    }

    setCategory(category) {
        this.currentCategory = category;
        this.filterAbilities();
    }

    async saveAbilities() {
        console.log('[AbilitiesCore] Starting saveAbilities process...');
        console.log('[AbilitiesCore] Total abilities to save:', this.abilities.length);
        
        try {
            // Load current peoples data
            const peoplesResponse = await fetch('../../assets/peoples/peoples.json');
            if (!peoplesResponse.ok) {
                throw new Error(`Peoples load failed: ${peoplesResponse.status}`);
            }
            
            const peoplesData = await peoplesResponse.json();
            console.log('[AbilitiesCore] Current peoples data loaded:', peoplesData);
            
            // Update peoples data with new ability assignments
            const updatedPeoples = peoplesData.peoples.map(people => {
                // Find abilities assigned to this class
                const assignedAbilities = this.abilities
                    .filter(ability => 
                        ability.assignedClasses && 
                        ability.assignedClasses.some(cls => cls.name === people.name)
                    )
                    .map(ability => ability.name);
                
                console.log(`[AbilitiesCore] Updating ${people.name} with abilities:`, assignedAbilities);
                console.log(`[AbilitiesCore] All abilities with assignedClasses:`, this.abilities.map(a => ({name: a.name, assignedClasses: a.assignedClasses})));
                
                return {
                    ...people,
                    assignedAbilities: assignedAbilities,
                    abilities: assignedAbilities.join(', ')
                };
            });
            
            const updatedPeoplesData = {
                ...peoplesData,
                peoples: updatedPeoples
            };
            
            console.log('[AbilitiesCore] Updated peoples data:', updatedPeoplesData);
            
            // Save to localStorage as fallback
            const abilitiesData = {
                abilities: this.abilities,
                metadata: {
                    lastModified: new Date().toISOString(),
                    version: '1.0.0',
                    totalAbilities: this.abilities.length
                }
            };
            localStorage.setItem('abilitiesEditor_abilities', JSON.stringify(abilitiesData));
            console.log('[AbilitiesCore] Abilities saved to localStorage');
            
            // Try server save for peoples.json
            try {
                console.log('[AbilitiesCore] Attempting server save to peoples.json');
                console.log('[AbilitiesCore] Sending data:', updatedPeoplesData);
                const response = await fetch('http://localhost:8080/api/save-peoples', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedPeoplesData)
                });
                
                console.log('[AbilitiesCore] Server response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const responseData = await response.json();
                console.log('[AbilitiesCore] Server save response:', responseData);
                console.log('[AbilitiesCore] Successfully saved peoples.json to server');
                console.log('[AbilitiesCore] Updated class files:', responseData.updated_class_files);
                console.log('[AbilitiesCore] Updated files:', responseData.updated_files);
            } catch (error) {
                console.warn('[AbilitiesCore] Server save failed, using localStorage only:', error);
            }
        } catch (error) {
            console.error('[AbilitiesCore] Failed to save abilities:', error);
        }
    }

    // Public API methods
    getAbilities() {
        return this.abilities;
    }

    getFilteredAbilities() {
        return this.filteredAbilities;
    }

    getAvailableRaces() {
        return this.availableRaces;
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    addAbility(ability) {
        this.abilities.push(ability);
        this.filterAbilities();
    }

    updateAbility(id, updates) {
        const ability = this.abilities.find(a => a.id === id);
        if (ability) {
            Object.assign(ability, updates);
            this.filterAbilities();
        }
    }

    deleteAbility(id) {
        this.abilities = this.abilities.filter(a => a.id !== id);
        this.filterAbilities();
    }

    async saveAbilities() {
        try {
            // Save to localStorage first
            localStorage.setItem('abilitiesEditor_abilities', JSON.stringify({
                abilities: this.abilities
            }));
            console.log('[AbilitiesCore] Abilities saved to localStorage');
            
            // Now save to server (peoples.json and individual class files)
            console.log('[AbilitiesCore] Starting server save process...');
            console.log('[AbilitiesCore] Current abilities with assignedClasses:', this.abilities.map(a => ({name: a.name, assignedClasses: a.assignedClasses})));
            
            // Load existing peoples data first to preserve all classes
            let peoplesData;
            try {
                const response = await fetch('http://localhost:8080/assets/peoples/peoples.json');
                peoplesData = await response.json();
                console.log('[AbilitiesCore] Loaded existing peoples data:', peoplesData);
            } catch (error) {
                console.warn('[AbilitiesCore] Could not load existing peoples data, creating new structure:', error);
                peoplesData = { peoples: [] };
            }
            
            // Update assignedAbilities for each class based on current ability assignments
            peoplesData.peoples.forEach(people => {
                // Find abilities assigned to this class
                const assignedAbilities = this.abilities
                    .filter(ability => 
                        ability.assignedClasses && 
                        ability.assignedClasses.some(assignedCls => assignedCls.name === people.name)
                    )
                    .map(ability => ability.name);
                
                console.log(`[AbilitiesCore] Updating ${people.name} with abilities:`, assignedAbilities);
                
                // Update the assignedAbilities for this class
                people.assignedAbilities = assignedAbilities;
            });
            
            console.log('[AbilitiesCore] Prepared peoples data for server:', peoplesData);
            
            // Try server save for peoples.json
            try {
                console.log('[AbilitiesCore] Attempting server save to peoples.json');
                console.log('[AbilitiesCore] Sending data:', peoplesData);
                const response = await fetch('http://localhost:8080/api/save-peoples', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(peoplesData)
                });
                
                console.log('[AbilitiesCore] Server response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const responseData = await response.json();
                console.log('[AbilitiesCore] Server save response:', responseData);
                console.log('[AbilitiesCore] Successfully saved peoples.json to server');
                console.log('[AbilitiesCore] Updated class files:', responseData.updated_class_files);
                console.log('[AbilitiesCore] Updated files:', responseData.updated_files);
            } catch (error) {
                console.warn('[AbilitiesCore] Server save failed, using localStorage only:', error);
            }
            
        } catch (error) {
            console.error('[AbilitiesCore] Error saving abilities:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilitiesCore;
}

