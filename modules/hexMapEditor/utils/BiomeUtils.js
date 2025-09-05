// Utility-Funktionen für Biome-Management
class BiomeUtils {
    static async getBiomeFolders() {
        // Skip server request for faster loading - use fallback immediately
        const biomeFolders = [
            'Void', 'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Unassigned', 'Buildings'
        ];
        
        const standardBiomes = biomeFolders.map(folderName => ({
            id: folderName.toLowerCase(),
            name: folderName,
            type: folderName.toLowerCase() === 'buildings' ? 'entities' : 'biome',
            color: BiomeUtils.getColorForBiome(folderName),
            description: BiomeUtils.getDescriptionForBiome(folderName),
            icon: BiomeUtils.getFolderIcon(folderName)
        }));
        
        // Entities Biomes (Gebäude und Strukturen) - Buildings is now in standardBiomes
        const entitiesBiomes = [];
        
        // Kombiniere alle Biomes
        const allBiomes = [...standardBiomes, ...entitiesBiomes];
        
        // Stelle sicher, dass Buildings Biome vorhanden ist
        if (!allBiomes.find(b => b.name === 'Buildings')) {
            allBiomes.push({
                id: 'buildings',
                name: 'Buildings',
                type: 'entities',
                color: '#00fc02',
                description: 'Gebäude und Strukturen',
                icon: '🏗️'
            });
        }
        
        return allBiomes;
    }

    static getColorForBiome(biomeName) {
        const colorMap = {
            'void': '#000000',
            'forest': '#4CAF50',
            'mountains': '#795548',
            'water': '#2196F3',
            'desert': '#FF9800',
            'swamp': '#8BC34A',
            'plain': '#CDDC39',
            'jungle': '#388E3C',
            'badlands': '#8D6E63',
            'snow': '#FFFFFF',
            'ocean': '#1976D2',
            'unassigned': '#9E9E9E',
            'buildings': '#00fc02'
        };
        
        const lowerName = biomeName.toLowerCase();
        return colorMap[lowerName] || '#9C27B0';
    }

    static getDescriptionForBiome(biomeName) {
        const descMap = {
            'void': 'Leerer Raum - Tiles werden entfernt',
            'forest': 'Dichte Wälder mit hohen Bäumen',
            'mountains': 'Steile Berge und Felsen',
            'water': 'Flüsse, Seen und Ozeane',
            'desert': 'Heiße Sandwüsten',
            'swamp': 'Feuchte Sümpfe und Moore',
            'plain': 'Weite Ebenen und Grasland',
            'jungle': 'Dichter Dschungel mit exotischer Vegetation',
            'badlands': 'Trockene, unwirtliche Landschaften',
            'snow': 'Schneebedeckte Berge und Tundren',
            'ocean': 'Tiefe Ozeane und Küstengewässer',
            'unassigned': 'Noch nicht zugeordnete Tiles',
            'buildings': 'Gebäude und Strukturen'
        };
        
        const lowerName = biomeName.toLowerCase();
        return descMap[lowerName] || `Biome: ${biomeName}`;
    }

    static getTypeName(type) {
        const typeNames = {
            'terrain': 'Terrain',
            'biome': 'Biome',
            'entities': 'Entities',
            'special': 'Spezial'
        };
        return typeNames[type] || type;
    }

    static determineTypeFromFolder(folderName) {
        const biomeTypes = ['forest', 'wald', 'mountain', 'gebirge', 'water', 'wasser', 'desert', 'wüste'];
        const terrainTypes = ['cave', 'höhle', 'swamp', 'sumpf', 'volcano', 'vulkan'];
        const entityTypes = ['buildings', 'gebäude', 'structures', 'strukturen'];
        
        const lowerName = folderName.toLowerCase();
        
        if (biomeTypes.some(type => lowerName.includes(type))) {
            return 'biome';
        } else if (terrainTypes.some(type => lowerName.includes(type))) {
            return 'terrain';
        } else if (entityTypes.some(type => lowerName.includes(type))) {
            return 'entities';
        } else {
            return 'special';
        }
    }

    static getFolderIcon(folderName) {
        const iconMap = {
            'forest': '🌲',
            'mountains': '⛰️',
            'water': '💧',
            'desert': '🏜️',
            'swamp': '🌿',
            'plain': '🌾',
            'jungle': '🌴',
            'badlands': '🏔️',
            'snow': '❄️',
            'ocean': '🌊',
            'buildings': '🏗️',
            'coast': '🏖️',
        };
        
        const lowerName = folderName.toLowerCase();
        return iconMap[lowerName] || '📁';
    }

    static loadBiomesFromAssets() {
        const additionalBiomes = [];
        
        console.log('[BiomeUtils] Loading biomes from assets...');
        
        // Prüfe auf globale Biome-Daten (von Tile Editor geladen)
        if (window.BIOME_DATA) {
            const biomeData = window.BIOME_DATA;
            if (biomeData.name && biomeData.type) {
                additionalBiomes.push({
                    id: biomeData.name.toLowerCase(),
                    name: biomeData.name,
                    type: biomeData.type,
                    color: biomeData.color || '#00fc02',
                    description: biomeData.description || `Biome: ${biomeData.name}`,
                    icon: biomeData.icon || '🏗️'
                });
                console.log('[BiomeUtils] Added global biome data:', biomeData.name);
            }
        }
        
        // Prüfe auf weitere Biome-Daten im localStorage (vom Tile Editor gespeichert)
        try {
            const allBiomes = localStorage.getItem('all_biomes');
            if (allBiomes) {
                const parsedBiomes = JSON.parse(allBiomes);
                console.log('[BiomeUtils] Found biomes in localStorage:', parsedBiomes.length);
                
                parsedBiomes.forEach(biome => {
                    if (biome.type === 'entities' && !additionalBiomes.find(b => b.name === biome.name)) {
                        additionalBiomes.push({
                            id: biome.name.toLowerCase(),
                            name: biome.name,
                            type: biome.type,
                            color: biome.color || '#00fc02',
                            description: biome.description || `Biome: ${biome.name}`,
                            icon: biome.icon || '🏗️'
                        });
                        console.log('[BiomeUtils] Added entities biome from localStorage:', biome.name);
                    }
                });
            } else {
                console.log('[BiomeUtils] No biomes found in localStorage');
            }
        } catch (error) {
            console.warn('[BiomeUtils] Error loading biomes from localStorage:', error);
        }
        
        console.log('[BiomeUtils] Loaded additional biomes from assets:', additionalBiomes.length);
        console.log('[BiomeUtils] Additional biomes:', additionalBiomes.map(b => b.name));
        return additionalBiomes;
    }

    static migrateOldBiomeNames(savedBiomes) {
        // Mapping von alten zu neuen Biome-Namen
        const nameMappings = {
            'Forests': 'Forest'
        };
        
        let hasChanges = false;
        
        for (const biome of savedBiomes) {
            if (nameMappings[biome.name]) {
                const oldName = biome.name;
                const newName = nameMappings[biome.name];
                
                console.log('[BiomeUtils] Migrating biome name:', oldName, '→', newName);
                
                // Aktualisiere den Biome-Namen
                biome.name = newName;
                biome.id = newName.toLowerCase();
                
                // Markiere den alten Namen als gelöscht
                localStorage.setItem(`deleted_biome_${oldName.toLowerCase()}`, 'true');
                
                // Entferne den alten Biome-Eintrag
                const oldBiomeKey = `biome_${oldName.toLowerCase()}`;
                localStorage.removeItem(oldBiomeKey);
                
                hasChanges = true;
            }
        }
        
        // Wenn Änderungen vorgenommen wurden, aktualisiere die globale Liste
        if (hasChanges) {
            localStorage.setItem('all_biomes', JSON.stringify(savedBiomes));
            console.log('[BiomeUtils] Biome names migrated successfully');
        }
    }

    static clearOldBiomeEntries() {
        // Entferne alle alten Biome-Einträge aus dem localStorage
        const oldNames = ['Forests'];
        
        for (const oldName of oldNames) {
            const oldBiomeKey = `biome_${oldName.toLowerCase()}`;
            const oldAssetsKey = `biome_assets_${oldName.toLowerCase()}`;
            
            if (localStorage.getItem(oldBiomeKey)) {
                localStorage.removeItem(oldBiomeKey);
                console.log('[BiomeUtils] Removed old biome entry:', oldName);
            }
            
            if (localStorage.getItem(oldAssetsKey)) {
                localStorage.removeItem(oldAssetsKey);
                console.log('[BiomeUtils] Removed old biome assets entry:', oldName);
            }
        }
        
        console.log('[BiomeUtils] Old biome entries cleared');
    }

    static initializeBiomeMigration() {
        // Führe die Migration sofort durch (auch wenn bereits abgeschlossen)
        console.log('[BiomeUtils] Starting biome name migration...');
        
        // Führe Migration durch
        const savedBiomes = BiomeUtils.getAllSavedBiomes();
        BiomeUtils.migrateOldBiomeNames(savedBiomes);
        BiomeUtils.clearOldBiomeEntries();
        
        // Markiere Migration als abgeschlossen
        localStorage.setItem('biome_migration_v1_completed', 'true');
        console.log('[BiomeUtils] Biome migration completed');
    }

    static resetBiomeStorage() {
        // Entferne alle Biome-bezogenen localStorage-Einträge
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('biome_') || key.startsWith('deleted_biome_') || key === 'all_biomes')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('[BiomeUtils] Removed biome storage key:', key);
        });
        
        // Entferne auch den Migrations-Key
        localStorage.removeItem('biome_migration_v1_completed');
        
        console.log('[BiomeUtils] Biome storage reset completed');
    }

    static forceBiomeReload() {
        // Setze den localStorage komplett zurück und lade Standard-Biome neu
        console.log('[BiomeUtils] Force reloading biomes...');
        
        // Entferne alle Biome-bezogenen Einträge
        BiomeUtils.resetBiomeStorage();
        
        // Entferne auch den Migrations-Key
        localStorage.removeItem('biome_migration_v1_completed');
        
        // Lade Standard-Biome neu
        const defaultBiomes = [
            'Void', 'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Unassigned'
        ];
        
        const freshBiomes = defaultBiomes.map(folderName => ({
            id: folderName.toLowerCase(),
            name: folderName,
            type: 'biome',
            color: BiomeUtils.getColorForBiome(folderName),
            description: BiomeUtils.getDescriptionForBiome(folderName)
        }));
        
        // Speichere die frischen Biome
        localStorage.setItem('all_biomes', JSON.stringify(freshBiomes));
        
        console.log('[BiomeUtils] Fresh biomes loaded:', freshBiomes.map(b => b.name));
        return freshBiomes;
    }

    static saveBiome(biome, oldName = null) {
        try {
            // Wenn ein alter Name übergeben wurde, entferne das alte Biome
            if (oldName && oldName !== biome.name) {
                console.log('[BiomeUtils] Renaming biome from', oldName, 'to', biome.name);
                
                // Markiere den alten Namen als gelöscht (VOR dem Speichern des neuen)
                localStorage.setItem(`deleted_biome_${oldName.toLowerCase()}`, 'true');
                
                // Entferne das alte Biome aus localStorage
                const oldBiomeKey = `biome_${oldName.toLowerCase()}`;
                localStorage.removeItem(oldBiomeKey);
                
                // Entferne auch aus der globalen Liste
                const allBiomes = BiomeUtils.getAllSavedBiomes();
                const oldIndex = allBiomes.findIndex(b => b.name === oldName);
                if (oldIndex >= 0) {
                    allBiomes.splice(oldIndex, 1);
                    console.log('[BiomeUtils] Removed old biome from list:', oldName);
                }
                
                // Aktualisiere die globale Liste ohne das alte Biome
                localStorage.setItem('all_biomes', JSON.stringify(allBiomes));
                
                // Erstelle Assets-Ordner für das neue Biome
                BiomeUtils.createBiomeAssetsFolder(biome, oldName);
                
                // Sende Biome-Daten an den Server zur Ordner-Erstellung
                BiomeUtils.saveBiomeToServer(biome, oldName);
            }
        
        // Speichere das neue Biome
        const biomeKey = `biome_${biome.id || biome.name.toLowerCase()}`;
        localStorage.setItem(biomeKey, JSON.stringify(biome));
        
        // Aktualisiere die globale Biome-Liste
        const allBiomes = BiomeUtils.getAllSavedBiomes();
        const existingIndex = allBiomes.findIndex(b => b.id === biome.id || b.name === biome.name);
        
        if (existingIndex >= 0) {
            allBiomes[existingIndex] = biome;
        } else {
            allBiomes.push(biome);
        }
        
        localStorage.setItem('all_biomes', JSON.stringify(allBiomes));
        
        console.log('[BiomeUtils] Biome saved:', biome.name, oldName ? `(renamed from ${oldName})` : '');
        return true;
        } catch (error) {
            console.error('[BiomeUtils] Error saving biome:', error);
            return false;
        }
    }

    static getAllSavedBiomes() {
        try {
            const saved = localStorage.getItem('all_biomes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('[BiomeUtils] Error loading saved biomes:', error);
            return [];
        }
    }

    static getBiomeFolders() {
        // Initialisiere Biome-Migration beim ersten Aufruf
        BiomeUtils.initializeBiomeMigration();
        
        // Lade zuerst gespeicherte Biome
        let savedBiomes = BiomeUtils.getAllSavedBiomes();
        console.log('[BiomeUtils] Loaded saved biomes:', savedBiomes.map(b => b.name));
        
        // Wenn keine Biome gefunden wurden oder alte Namen vorhanden sind, lade neu
        if (savedBiomes.length === 0 || savedBiomes.some(b => b.name === 'Forests')) {
            console.log('[BiomeUtils] Old biome names detected, forcing reload...');
            savedBiomes = BiomeUtils.forceBiomeReload();
        } else {
            // Aktualisiere alte Biome-Namen auf neue
            BiomeUtils.migrateOldBiomeNames(savedBiomes);
            
            // Bereinige alte Biome-Einträge
            BiomeUtils.clearOldBiomeEntries();
        }
        
        // Fallback auf Standard-Biome falls keine gespeicherten vorhanden
        const defaultBiomes = [
            'Void', 'Forest', 'Mountains', 'Water', 'Desert', 'Swamp', 'Plain', 
            'Jungle', 'Badlands', 'Snow', 'Ocean', 'Unassigned'
        ];
        
        // Füge Buildings als Entity-Kategorie hinzu
        const buildingsBiome = {
            id: 'buildings',
            name: 'Buildings',
            type: 'entities',
            color: '#00fc02',
            description: 'Buildings and settlements',
            icon: '🏗️'
        };
        
        // Kombiniere gespeicherte mit Standard-Biome
        const allBiomes = [...savedBiomes];
        
        // Prüfe ob Buildings bereits existiert
        const existingBuildings = allBiomes.find(b => b.name === 'Buildings');
        if (!existingBuildings) {
            console.log('[BiomeUtils] Adding Buildings category');
            allBiomes.push(buildingsBiome);
        }
        console.log('[BiomeUtils] Starting with saved biomes:', allBiomes.map(b => b.name));
        
        for (const folderName of defaultBiomes) {
            // Prüfe ob das Standard-Biome gelöscht wurde
            const isDeleted = localStorage.getItem(`deleted_biome_${folderName.toLowerCase()}`);
            if (isDeleted) {
                console.log('[BiomeUtils] Skipping deleted default biome:', folderName);
                continue; // Überspringe gelöschte Standard-Biome
            }
            
            const existingBiome = allBiomes.find(b => b.name === folderName);
            if (!existingBiome) {
                console.log('[BiomeUtils] Adding default biome:', folderName);
                allBiomes.push({
                    id: folderName.toLowerCase(),
                    name: folderName,
                    type: 'biome',
                    color: BiomeUtils.getColorForBiome(folderName),
                    description: BiomeUtils.getDescriptionForBiome(folderName)
                });
            } else {
                console.log('[BiomeUtils] Default biome already exists:', folderName);
            }
        }
        
        console.log('[BiomeUtils] Final biome list:', allBiomes.map(b => b.name));
        return allBiomes;
    }

    static createBiomeAssetsFolder(biome, oldName = null) {
        try {
            // Erstelle eine Struktur für den neuen Biome-Ordner
            const biomeStructure = {
                name: biome.name,
                id: biome.id || biome.name.toLowerCase(),
                type: 'biome',
                color: biome.color,
                description: biome.description,
                folderPath: `assets/biomes/${biome.name}/`,
                tiles: [],
                config: {
                    movementCost: 2,
                    defenseBonus: 1,
                    resources: [],
                    rarity: 'common'
                }
            };
            
            // Speichere die Biome-Struktur
            localStorage.setItem(`biome_assets_${biome.name.toLowerCase()}`, JSON.stringify(biomeStructure));
            
            // Wenn es ein Umbenennen war, aktualisiere auch die alte Struktur
            if (oldName) {
                // Speichere die Umbenennungs-Information
                const renameInfo = {
                    oldName: oldName,
                    newName: biome.name,
                    oldFolderPath: `assets/biomes/${oldName}/`,
                    newFolderPath: `assets/biomes/${biome.name}/`,
                    timestamp: new Date().toISOString(),
                    action: 'rename'
                };
                
                localStorage.setItem(`biome_rename_${oldName.toLowerCase()}_to_${biome.name.toLowerCase()}`, JSON.stringify(renameInfo));
                localStorage.setItem(`biome_assets_${oldName.toLowerCase()}_renamed_to_${biome.name}`, 'true');
                
                console.log('[BiomeUtils] Biome assets structure updated for rename:', oldName, '→', biome.name);
                console.log('[BiomeUtils] Rename info saved:', renameInfo);
            }
            
                    console.log('[BiomeUtils] Biome assets folder structure created:', biome.name);
        return true;
    } catch (error) {
        console.error('[BiomeUtils] Error creating biome assets folder:', error);
        return false;
    }
}

    

    // Sende Biome-Daten an den Server zur Ordner-Erstellung
    static async saveBiomeToServer(biome, oldName = null) {
        try {
            console.log('[BiomeUtils] Saving biome to server:', biome.name, oldName ? `(renamed from ${oldName})` : '');
            
            const response = await fetch('/api/save-biome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: biome.name,
                    oldName: oldName,
                    color: biome.color || '#ffffff',
                    description: biome.description || ''
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[BiomeUtils] Biome saved to server successfully:', result);
            
            // Zeige Toast-Benachrichtigung
            if (window.ToastManager) {
                if (result.isRename) {
                    window.ToastManager.showToast(`Biome-Ordner "${oldName}" wurde in "${biome.name}" umbenannt!`, 'success');
                } else {
                    window.ToastManager.showToast(`Biome-Ordner "${biome.name}" wurde erstellt!`, 'success');
                }
            }
            
            return true;
        } catch (error) {
            console.error('[BiomeUtils] Failed to save biome to server:', error);
            
            // Zeige Fehler-Benachrichtigung
            if (window.ToastManager) {
                window.ToastManager.showToast('Fehler beim Erstellen des Biome-Ordners auf dem Server!', 'error');
            }
            
            return false;
        }
    }


    
    static sortCategories(categories, sortBy) {
        const sortedCategories = [...categories];
        
        switch (sortBy) {
            case 'name':
                sortedCategories.sort((a, b) => a.name.localeCompare(b.name, 'de'));
                break;
            case 'type':
                sortedCategories.sort((a, b) => a.type.localeCompare(b.type, 'de'));
                break;
            case 'color':
                sortedCategories.sort((a, b) => a.color.localeCompare(b.color, 'de'));
                break;
        }
        
        return sortedCategories;
    }

    static createCategoryItem(category, onEdit, onDelete, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onClick) {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'biome-category-item';
        categoryItem.style.display = 'flex';
        categoryItem.style.flexDirection = 'column';
        categoryItem.style.alignItems = 'stretch';
        categoryItem.style.padding = '10px';
        categoryItem.style.marginBottom = '6px';
        categoryItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        categoryItem.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        categoryItem.style.borderRadius = '6px';
        categoryItem.style.fontSize = '10px';
        categoryItem.style.width = '100%';
        categoryItem.style.maxWidth = '200px';
        categoryItem.dataset.categoryId = category.id || category.name;
        
        // Erstelle einen Container für die Hauptzeile (Color Indicator, Category Info, Actions)
        const mainRow = document.createElement('div');
        mainRow.style.display = 'flex';
        mainRow.style.alignItems = 'center';
        mainRow.style.width = '100%';
        mainRow.style.maxWidth = '200px';
        
        // Color Indicator
        const colorIndicator = BiomeUtils.createColorIndicator(category.color);
        
        // Category Info
        const categoryInfo = BiomeUtils.createCategoryInfo(category);
        
            // Actions
    const actions = BiomeUtils.createActions(category, onEdit, null);
        
        // Append elements to main row
        mainRow.appendChild(colorIndicator);
        mainRow.appendChild(categoryInfo);
        mainRow.appendChild(actions);
        
        // Append main row to category item
        categoryItem.appendChild(mainRow);
        
        // Setup click functionality for biome selection
        if (onClick) {
            categoryItem.style.cursor = 'pointer';
            categoryItem.title = `Klicken um "${category.name}" als Malwerkzeug zu verwenden`;
            
            // Klick-Event für Biome-Auswahl
            categoryItem.addEventListener('click', (e) => {
                // Verhindere Klick wenn auf Edit/Delete Buttons geklickt wird
                if (e.target.closest('button')) {
                    return;
                }
                onClick(category);
            });
        }
        
        return categoryItem;
    }

    static createDragHandle() {
        const dragHandle = document.createElement('div');
        dragHandle.textContent = '⋮⋮';
        dragHandle.className = 'category-drag-handle';
        dragHandle.style.cursor = 'grab';
        dragHandle.style.marginRight = '12px';
        dragHandle.style.color = '#888';
        dragHandle.style.fontSize = '18px';
        dragHandle.style.fontWeight = 'bold';
        dragHandle.style.userSelect = 'none';
        dragHandle.style.minWidth = '24px';
        dragHandle.style.height = '24px';
        dragHandle.style.display = 'flex';
        dragHandle.style.alignItems = 'center';
        dragHandle.style.justifyContent = 'center';
        dragHandle.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        dragHandle.style.borderRadius = '4px';
        dragHandle.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        dragHandle.style.transition = 'all 0.2s ease';
        dragHandle.title = 'Zum Verschieben ziehen';
        
        return dragHandle;
    }

    static createColorIndicator(color) {
        const colorIndicator = document.createElement('div');
        colorIndicator.style.width = '12px';
        colorIndicator.style.height = '12px';
        colorIndicator.style.backgroundColor = color || '#999';
        colorIndicator.style.borderRadius = '2px';
        colorIndicator.style.marginRight = '8px';
        colorIndicator.style.flexShrink = '0';
        
        return colorIndicator;
    }

    static createCategoryInfo(category) {
        const categoryInfo = document.createElement('div');
        categoryInfo.style.flexGrow = '1';
        categoryInfo.style.minWidth = '0';
        categoryInfo.style.overflow = 'hidden';
        categoryInfo.style.display = 'flex';
        categoryInfo.style.alignItems = 'center';
        categoryInfo.style.justifyContent = 'space-between';
        
        const categoryDetails = document.createElement('div');
        
        const categoryName = document.createElement('div');
        categoryName.textContent = category.name;
        categoryName.style.color = '#fff';
        categoryName.style.fontWeight = 'bold';
        categoryName.style.marginBottom = '2px';
        categoryName.style.overflow = 'hidden';
        categoryName.style.textOverflow = 'ellipsis';
        categoryName.style.whiteSpace = 'nowrap';
        categoryName.style.maxWidth = '80px';
        
        const categoryType = document.createElement('div');
        categoryType.textContent = `Typ: ${BiomeUtils.getTypeName(category.type)}`;
        categoryType.style.color = '#ccc';
        categoryType.style.fontSize = '8px';
        categoryType.style.overflow = 'hidden';
        categoryType.style.textOverflow = 'ellipsis';
        categoryType.style.whiteSpace = 'nowrap';
        categoryType.style.maxWidth = '80px';
        
        // Expand-Indikator hinzufügen
        const expandIcon = document.createElement('div');
        expandIcon.className = 'expand-icon';
        expandIcon.textContent = '▶';
        expandIcon.style.color = '#ccc';
        expandIcon.style.fontSize = '12px';
        expandIcon.style.marginLeft = '8px';
        expandIcon.style.cursor = 'pointer';
        expandIcon.style.transition = 'transform 0.2s ease';
        expandIcon.title = 'Aufklappen';
        
        categoryDetails.appendChild(categoryName);
        categoryDetails.appendChild(categoryType);
        
        categoryInfo.appendChild(categoryDetails);
        categoryInfo.appendChild(expandIcon);
        
        return categoryInfo;
        categoryType.style.fontSize = '9px';
        
        categoryDetails.appendChild(categoryName);
        categoryDetails.appendChild(categoryType);
        
        // Expand-Indikator
        const expandIndicator = document.createElement('div');
        expandIndicator.className = 'expand-indicator';
        expandIndicator.textContent = '▶';
        expandIndicator.style.color = '#888';
        expandIndicator.style.fontSize = '12px';
        expandIndicator.style.marginLeft = '8px';
        expandIndicator.style.transition = 'transform 0.2s ease';
        
        categoryInfo.appendChild(categoryDetails);
        categoryInfo.appendChild(expandIndicator);
        
        return categoryInfo;
    }

    static createActions(category, onEdit, onDelete) {
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '4px';
        
        if (onEdit) {
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.title = 'Bearbeiten';
            editBtn.style.width = '20px';
            editBtn.style.height = '20px';
            editBtn.style.fontSize = '8px';
            editBtn.style.padding = '0';
            editBtn.style.border = '1px solid #666';
            editBtn.style.backgroundColor = '#444';
            editBtn.style.color = '#fff';
            editBtn.style.cursor = 'pointer';
            editBtn.style.borderRadius = '2px';
            
            editBtn.addEventListener('click', () => onEdit(category));
            actions.appendChild(editBtn);
        }
        
        return actions;
    }

    static setupDragAndDrop(categoryItem, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop) {
        let draggedItem = null;
        let draggedIndex = -1;

        categoryItem.addEventListener('dragstart', (e) => {
            draggedItem = categoryItem;
            draggedIndex = Array.from(categoryItem.parentNode.children).indexOf(categoryItem);
            categoryItem.style.opacity = '0.5';
            categoryItem.style.transform = 'rotate(2deg)';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', categoryItem.outerHTML);
            
            if (onDragStart) onDragStart(e, draggedItem, draggedIndex);
        });

        categoryItem.addEventListener('dragend', (e) => {
            categoryItem.style.opacity = '1';
            categoryItem.style.transform = 'none';
            draggedItem = null;
            draggedIndex = -1;
            
            if (onDragEnd) onDragEnd(e);
        });

        categoryItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedItem && draggedItem !== categoryItem) {
                categoryItem.style.borderColor = '#4CAF50';
                categoryItem.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            }
            
            if (onDragOver) onDragOver(e, draggedItem, categoryItem);
        });

        categoryItem.addEventListener('dragleave', (e) => {
            categoryItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            categoryItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            
            if (onDragLeave) onDragLeave(e, categoryItem);
        });

        categoryItem.addEventListener('drop', (e) => {
            e.preventDefault();
            categoryItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            categoryItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            
            if (draggedItem && draggedItem !== categoryItem) {
                const dropIndex = Array.from(categoryItem.parentNode.children).indexOf(categoryItem);
                if (onDrop) onDrop(e, draggedIndex, dropIndex);
            }
        });
    }
}

// Globale Verfügbarkeit für Debugging und manuelle Aufrufe
if (typeof window !== 'undefined') {
    window.BiomeUtils = BiomeUtils;
    
    // Debug-Funktionen
    window.resetBiomeStorage = () => {
        BiomeUtils.resetBiomeStorage();
        console.log('[Global] Biome storage reset. Please refresh the page.');
    };
    
    window.migrateBiomes = () => {
        BiomeUtils.initializeBiomeMigration();
        console.log('[Global] Biome migration completed. Please refresh the page.');
    };
    
    window.forceBiomeReload = () => {
        BiomeUtils.forceBiomeReload();
        console.log('[Global] Biome force reload completed. Please refresh the page.');
    };
}
