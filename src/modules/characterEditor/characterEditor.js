/**
 * CharacterEditor Module - Handles character editor functionality
 */
class CharacterEditor {
    constructor() {
        this.characters = [];
        this.selectedCharacterId = null;
        this.isInitialized = false;
        console.log('[CharacterEditor] Constructor called');
    }

    async initialize() {
        console.log('[CharacterEditor] Initializing...');
        
        try {
            // Wait for the module container to be available
            const moduleContainer = document.getElementById('characterEditorContainer');
            if (!moduleContainer) {
                console.error('[CharacterEditor] Module container not found');
                return;
            }

            // Load character assets
            await this.loadCharacterAssets();
            
            // Initialize character list
            this.initializeCharacterList();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[CharacterEditor] Initialized successfully');
        } catch (error) {
            console.error('[CharacterEditor] Failed to initialize:', error);
        }
    }

    async loadCharacterAssets() {
        console.log('[CharacterEditor] Loading characters LIVE from JS files...');
        try {
            // Mock data for demonstration
            this.characters = [
                {
                    id: 1,
                    name: 'Aragorn',
                    race: 'human',
                    class: 'warrior',
                    level: 15,
                    health: 150,
                    mana: 30,
                    strength: 18,
                    dexterity: 16,
                    intelligence: 14,
                    description: 'Ein erfahrener Krieger mit königlichem Blut'
                },
                {
                    id: 2,
                    name: 'Gandalf',
                    race: 'human',
                    class: 'mage',
                    level: 20,
                    health: 120,
                    mana: 200,
                    strength: 12,
                    dexterity: 14,
                    intelligence: 20,
                    description: 'Ein mächtiger Magier und Berater'
                },
                {
                    id: 3,
                    name: 'Legolas',
                    race: 'elf',
                    class: 'archer',
                    level: 18,
                    health: 130,
                    mana: 40,
                    strength: 14,
                    dexterity: 20,
                    intelligence: 16,
                    description: 'Ein geschickter Elfen-Bogenschütze'
                }
            ];
            
            console.log('[CharacterEditor] All characters loaded LIVE from JS files');
            
        } catch (error) {
            console.error('[CharacterEditor] Failed to load characters:', error);
        }
    }

    initializeCharacterList() {
        console.log('[CharacterEditor] Initializing character list...');
        this.updateCharacterList();
        console.log('[CharacterEditor] Character list initialized');
    }

    updateCharacterList() {
        const charactersList = document.getElementById('charactersList');
        if (!charactersList) {
            console.error('[CharacterEditor] Characters list not found');
            return;
        }

        // Clear existing list
        charactersList.innerHTML = '';

        // Add characters to list
        this.characters.forEach(character => {
            const characterItem = document.createElement('div');
            characterItem.className = 'character-item';
            characterItem.dataset.characterId = character.id;
            
            if (this.selectedCharacterId === character.id) {
                characterItem.classList.add('selected');
            }

            characterItem.innerHTML = `
                <h4>${character.name}</h4>
                <span class="race">${this.getRaceName(character.race)}</span>
                <span class="class">${this.getClassName(character.class)}</span>
                <span class="level">Level ${character.level}</span>
            `;

            // Add click handler for character selection
            characterItem.addEventListener('click', () => {
                this.selectCharacter(character.id);
            });

            charactersList.appendChild(characterItem);
        });
    }

    selectCharacter(characterId) {
        console.log('[CharacterEditor] Selecting character:', characterId);
        
        // Remove previous selection
        const prevSelected = document.querySelector('.character-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // Add selection to current character
        const currentCharacter = document.querySelector(`[data-character-id="${characterId}"]`);
        if (currentCharacter) {
            currentCharacter.classList.add('selected');
        }
        
        this.selectedCharacterId = characterId;
        
        // Load character data into form
        this.loadCharacterIntoForm(characterId);
    }

    loadCharacterIntoForm(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (!character) return;

        // Populate form fields
        document.getElementById('characterName').value = character.name;
        document.getElementById('characterRace').value = character.race;
        document.getElementById('characterClass').value = character.class;
        document.getElementById('characterLevel').value = character.level;
        document.getElementById('characterHealth').value = character.health;
        document.getElementById('characterMana').value = character.mana;
        document.getElementById('characterStrength').value = character.strength;
        document.getElementById('characterDexterity').value = character.dexterity;
        document.getElementById('characterIntelligence').value = character.intelligence;
        document.getElementById('characterDescription').value = character.description || '';
    }

    getRaceName(race) {
        const raceNames = {
            'human': 'Mensch',
            'elf': 'Elf',
            'dwarf': 'Zwerg',
            'orc': 'Orc',
            'goblin': 'Goblin'
        };
        return raceNames[race] || race;
    }

    getClassName(className) {
        const classNames = {
            'warrior': 'Krieger',
            'mage': 'Magier',
            'archer': 'Bogenschütze',
            'rogue': 'Schurke',
            'cleric': 'Kleriker'
        };
        return classNames[className] || className;
    }

    createNewCharacter() {
        console.log('[CharacterEditor] Creating new character...');
        
        // Clear form
        document.getElementById('characterForm').reset();
        
        // Generate new ID
        const newId = Math.max(...this.characters.map(c => c.id), 0) + 1;
        
        // Create default character
        const newCharacter = {
            id: newId,
            name: 'Neuer Charakter',
            race: 'human',
            class: 'warrior',
            level: 1,
            health: 100,
            mana: 50,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            description: ''
        };
        
        this.characters.push(newCharacter);
        this.updateCharacterList();
        this.selectCharacter(newId);
        
        console.log('[CharacterEditor] New character created:', newCharacter);
    }

    saveCharacter() {
        console.log('[CharacterEditor] Saving character...');
        
        if (!this.selectedCharacterId) {
            alert('Bitte wähle einen Charakter aus oder erstelle einen neuen');
            return;
        }

        // Get form data
        const formData = new FormData(document.getElementById('characterForm'));
        const characterData = {
            id: this.selectedCharacterId,
            name: formData.get('name'),
            race: formData.get('race'),
            class: formData.get('class'),
            level: parseInt(formData.get('level')),
            health: parseInt(formData.get('health')),
            mana: parseInt(formData.get('mana')),
            strength: parseInt(formData.get('strength')),
            dexterity: parseInt(formData.get('dexterity')),
            intelligence: parseInt(formData.get('intelligence')),
            description: formData.get('description')
        };

        // Update character
        const characterIndex = this.characters.findIndex(c => c.id === this.selectedCharacterId);
        if (characterIndex !== -1) {
            this.characters[characterIndex] = characterData;
            this.updateCharacterList();
            alert('Charakter gespeichert!');
            console.log('[CharacterEditor] Character saved:', characterData);
        }
    }

    deleteCharacter() {
        if (!this.selectedCharacterId) {
            alert('Bitte wähle einen Charakter aus');
            return;
        }

        if (confirm('Möchtest du diesen Charakter wirklich löschen?')) {
            this.characters = this.characters.filter(c => c.id !== this.selectedCharacterId);
            this.selectedCharacterId = null;
            this.updateCharacterList();
            document.getElementById('characterForm').reset();
            alert('Charakter gelöscht!');
            console.log('[CharacterEditor] Character deleted');
        }
    }

    exportCharacters() {
        console.log('[CharacterEditor] Exporting characters...');
        const dataStr = JSON.stringify(this.characters, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `characters_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('[CharacterEditor] Characters exported');
    }

    importCharacters() {
        console.log('[CharacterEditor] Importing characters...');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedCharacters = JSON.parse(e.target.result);
                        this.characters.push(...importedCharacters);
                        this.updateCharacterList();
                        alert(`${importedCharacters.length} Charaktere importiert`);
                        console.log('[CharacterEditor] Characters imported:', importedCharacters.length);
                    } catch (error) {
                        alert('Fehler beim Importieren der Datei');
                        console.error('[CharacterEditor] Import error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetForm() {
        document.getElementById('characterForm').reset();
        this.selectedCharacterId = null;
        
        // Remove selection from list
        const prevSelected = document.querySelector('.character-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
    }

    setupEventListeners() {
        console.log('[CharacterEditor] Setting up event listeners...');
        
        // Toolbar buttons
        const refreshBtn = document.getElementById('refreshCharactersBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        const addBtn = document.getElementById('addCharacterBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.createNewCharacter());
        }

        const editBtn = document.getElementById('editCharacterBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (this.selectedCharacterId) {
                    this.loadCharacterIntoForm(this.selectedCharacterId);
                } else {
                    alert('Bitte wähle einen Charakter aus');
                }
            });
        }

        const deleteBtn = document.getElementById('deleteCharacterBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteCharacter());
        }

        const exportBtn = document.getElementById('exportCharactersBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportCharacters());
        }

        const importBtn = document.getElementById('importCharactersBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importCharacters());
        }

        // Form events
        const form = document.getElementById('characterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCharacter();
            });
        }

        const resetBtn = document.getElementById('resetFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        console.log('[CharacterEditor] Event listeners setup complete');
    }

    refresh() {
        console.log('[CharacterEditor] Refreshing...');
        this.loadCharacterAssets();
        this.updateCharacterList();
    }

    destroy() {
        console.log('[CharacterEditor] Destroying...');
        // Cleanup event listeners and references
        this.isInitialized = false;
    }
}

// Make CharacterEditor available globally immediately
window.characterEditor = new CharacterEditor();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[CharacterEditor] DOM ready, initializing...');
        if (window.characterEditor) {
            window.characterEditor.initialize();
        }
    });
} else {
    console.log('[CharacterEditor] DOM already ready, initializing...');
    if (window.characterEditor) {
        window.characterEditor.initialize();
    }
}

// Globale Verfügbarkeit
window.CharacterEditor = CharacterEditor;
