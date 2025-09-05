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
        // Check localStorage first for saved changes
        const savedAbilities = localStorage.getItem('abilitiesEditor_abilities');
        if (savedAbilities) {
            try {
                const data = JSON.parse(savedAbilities);
                if (data.abilities && Array.isArray(data.abilities) && data.abilities.length > 0) {
                    this.abilities = data.abilities;
                    this.filteredAbilities = [...this.abilities];
                    return;
                }
            } catch (error) {
                console.warn('[AbilitiesCore] Failed to parse saved abilities from localStorage:', error);
            }
        }
        
        // Load from assets
        try {
            console.log('[AbilitiesCore] Trying to fetch abilities.json...');
            const response = await fetch('../../assets/abilities/abilities.json');
            console.log('[AbilitiesCore] Response status:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.abilities && Array.isArray(data.abilities) && data.abilities.length > 0) {
                    this.abilities = data.abilities.map((ability, index) => {
                        // Extract races from multiple possible sources
                        let races = [];
                        
                        // First priority: direct races array (if not empty)
                        if (ability.races && Array.isArray(ability.races) && ability.races.length > 0) {
                            races = ability.races;
                        }
                        // Second priority: characterData.availableFor (most common)
                        else if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor)) {
                            races = ability.characterData.availableFor.map(race => 
                                race.charAt(0).toUpperCase() + race.slice(1)
                            );
                        }
                        // Third priority: characterData.races
                        else if (ability.characterData && ability.characterData.races) {
                            races = Array.isArray(ability.characterData.races) ? ability.characterData.races : [];
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
                            characterData: ability.characterData || {},
                            iconPath: ability.characterData?.iconPath || null
                        };
                    });
                    
                    this.filteredAbilities = [...this.abilities];
                    console.log(`[AbilitiesCore] Loaded ${this.abilities.length} abilities from abilities.json`);
                    return;
                }
            }
            
            // Fallback: Load mock data
            this.loadMockData();
            
        } catch (error) {
            console.error('[AbilitiesCore] Failed to load abilities.json:', error);
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

    setCategory(category) {
        this.currentCategory = category;
        this.filterAbilities();
    }

    async saveAbilities() {
        try {
            const abilitiesData = {
                abilities: this.abilities,
                metadata: {
                    lastModified: new Date().toISOString(),
                    version: '1.0.0',
                    totalAbilities: this.abilities.length
                }
            };
            
            // Save to localStorage as fallback
            localStorage.setItem('abilitiesEditor_abilities', JSON.stringify(abilitiesData));
            
            // Try server save
            try {
                const response = await fetch('/api/save-abilities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(abilitiesData)
                });
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilitiesCore;
}
