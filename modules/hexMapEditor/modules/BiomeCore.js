"use strict";

// Entferne ES6-Imports und verwende globale Klassen
// import { BiomeUtils } from '../utils/BiomeUtils.js';
// import { StorageUtils } from '../utils/StorageUtils.js';
// import { DOMUtils } from '../utils/DOMUtils.js';
// import { ToastManager } from '../utils/ToastManager.js';

class BiomeCore {
    constructor(core) {
        this.core = core;
        // Module-Referenzen werden später im BiomeModule verknüpft
    }

    setupBiomeModule() {
        // console.log('[BiomeCore] Setting up Biome module...');
        
        // Prüfe ob das neue BiomeTileSelector bereits existiert
        if (window.biomeTileSelector) {
            // console.log('[BiomeCore] BiomeTileSelector already exists, skipping old biome setup');
            return;
        }
        
        const refreshButton = document.getElementById('biome-refresh-btn');
        const addButton = document.getElementById('biome-add-btn');
        const hexTileBiomeSelector = document.getElementById('hex-tile-biome-selector');
        
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.refreshBiomeOptions();
            });
        }
        
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.openAddCategoryModal();
            });
        }

        // Warte bis DOM vollständig geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeBiomeModule();
            });
        } else {
            this.initializeBiomeModule();
        }
    }

    async     initializeBiomeModule() {
        // console.log('[BiomeCore] Initializing Biome module...');
        
        // Lade Biome-Daten vom Buildings Tiles List
        if (this.biomeData) {
            this.biomeData.loadBiomeDataFromBuildingsTilesList();
        }
        
        // Biome-Auswahl für Hex-Tiles wird über die biome-categories-list gemacht
        // Die Tile-Auswahl wird dynamisch basierend auf dem ausgewählten Biome geladen
        
        if (this.biomeUI) {
            this.biomeUI.updateBiomeCategoriesList();
        }
        
        // Stelle das gespeicherte Biome wieder her, falls vorhanden
        this.restoreSelectedBiomeSync();
        
        // Höre auf Layer-Änderungen
        this.setupLayerChangeListener();
        
        // console.log('[BiomeCore] Biome module setup complete');
    }

    setupLayerChangeListener() {
        if (this.core && this.core.observers) {
            this.core.addObserver('layerChanged', async (data) => {
                        // console.log('[BiomeCore] Layer changed to:', data.layer);
        // console.log('[BiomeCore] Updating biome options for new layer...');
                await this.updateBiomeOptionsForCurrentLayer();
                
                // Aktualisiere auch die Biome-Kategorien-Liste
                setTimeout(async () => {
                    if (this.biomeUI) {
                        // console.log('[BiomeCore] Refreshing biome categories list for new layer...');
                        await this.biomeUI.updateBiomeCategoriesList();
                    }
                }, 100);
            });
        }
    }

    async updateBiomeOptionsForCurrentLayer() {
        // console.log('[BiomeCore] Updating biome options for current layer...');
        
        const hexTileBiomeSelector = document.getElementById('hex-tile-biome-selector');
        if (hexTileBiomeSelector) {
            if (this.biomeData) {
                await this.biomeData.loadBiomeOptionsForHexTiles(hexTileBiomeSelector);
            }
        }
        
        // console.log('[BiomeCore] Updated biome options for current layer');
    }

    // Stelle das gespeicherte Biome wieder her (synchronous)
    restoreSelectedBiomeSync() {
        if (this.core && this.core.settings && this.core.settings.selectedBiome) {
            const savedBiome = this.core.settings.selectedBiome;
            // console.log('[BiomeCore] Restoring saved biome:', savedBiome);
            
            // Use fallback biomes for immediate restoration
            const fallbackBiomes = [
                { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50', icon: '🌲' },
                { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548', icon: '⛰️' },
                { id: 'water', name: 'Water', type: 'biome', color: '#2196F3', icon: '💧' },
                { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800', icon: '🏜️' },
                { id: 'buildings', name: 'Buildings', type: 'entities', color: '#9C27B0', icon: '🏢' },
                { id: 'swamp', name: 'Swamp', type: 'biome', color: '#8BC34A', icon: '🌿' },
                { id: 'plain', name: 'Plain', type: 'biome', color: '#CDDC39', icon: '🌾' },
                { id: 'jungle', name: 'Jungle', type: 'biome', color: '#4CAF50', icon: '🌴' },
                { id: 'badlands', name: 'Badlands', type: 'biome', color: '#FF5722', icon: '🏔️' },
                { id: 'snow', name: 'Snow', type: 'biome', color: '#E3F2FD', icon: '❄️' },
                { id: 'ocean', name: 'Ocean', type: 'biome', color: '#1976D2', icon: '🌊' }
            ];
            
            const savedBiomeData = fallbackBiomes.find(cat => cat.name === savedBiome || cat.id === savedBiome);
            
            if (savedBiomeData) {
                // Aktualisiere die visuelle Auswahl
                this.updateBiomeSelection(savedBiomeData);
                // console.log('[BiomeCore] Successfully restored biome selection');
            } else {
                console.warn('[BiomeCore] Saved biome not found in fallback categories:', savedBiome);
            }
        }
    }

    // Biome als Malwerkzeug auswählen
    async selectBiomeForPainting(biome) {
        if (!this.core || !this.core.settings) {
            console.warn('[BiomeCore] Core not available for biome selection');
            return;
        }

        // Prüfe ob das Biome bereits aufgeklappt ist
        const biomeItem = document.querySelector(`[data-category-id="${biome.id || biome.name}"]`);
        if (biomeItem) {
            const isExpanded = biomeItem.classList.contains('expanded');
            
            if (isExpanded) {
                // Klappe zu
                biomeItem.classList.remove('expanded');
                const expandIcon = biomeItem.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.textContent = '▶';
                }
                
                // Verstecke Tile-Container
                const biomeTilesContainer = biomeItem.querySelector('.biome-tiles-container');
                const buildingsTilesContainer = biomeItem.querySelector('.buildings-tiles-container');
                if (biomeTilesContainer) biomeTilesContainer.style.display = 'none';
                if (buildingsTilesContainer) buildingsTilesContainer.style.display = 'none';
                
                // console.log('[BiomeCore] Collapsed biome:', biome.name);
                return;
            } else {
                // Klappe auf
                biomeItem.classList.add('expanded');
                const expandIcon = biomeItem.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.textContent = '▼';
                }
                
                        // Lade Tiles für dieses Biome
        if (this.biomeData) {
            await this.biomeData.loadTilesForBiomeAndDisplay(biome, biomeItem, true);
        }
                
                // Für entities Biomes: Lade auch Buildings Tiles
                if (biome.type === 'entities') {
                    const buildingsTilesContainer = biomeItem.querySelector('.buildings-tiles-container');
                    if (!buildingsTilesContainer || buildingsTilesContainer.children.length === 0) {
                        setTimeout(() => {
                            // console.log('[BiomeCore] Loading Buildings tiles for expanded biome:', biome.name);
                            if (this.biomeData) {
                                this.biomeData.loadBuildingsTilesForDisplay(biome, biomeItem);
                            }
                        }, 100);
                    } else {
                        buildingsTilesContainer.style.display = 'block';
                        buildingsTilesContainer.style.visibility = 'visible';
                    }
                }
            }
        }

        // Setze das ausgewählte Biome über die Core-Methode
        if (this.core.setSelectedBiome) {
            this.core.setSelectedBiome(biome.name);
        }
        
        // Aktualisiere die visuelle Auswahl
        this.updateBiomeSelection(biome);
        
        // Benachrichtige andere Module über die Änderung
        if (this.core.notifyObservers) {
            this.core.notifyObservers('biomeChanged', { biome: biome.name });
        }
        
        // console.log('[BiomeCore] Selected biome for painting:', biome.name);
    }

    // Tile als Malwerkzeug auswählen
    selectTileForPainting(tile) {
        if (!this.core) {
            console.warn('[BiomeCore] Core not available for tile selection');
            return;
        }

        // console.log('[BiomeCore] Selecting tile for painting:', tile.name);
        
        // Setze das ausgewählte Tile
        if (this.core.setSelectedTile) {
            this.core.setSelectedTile(tile);
        }
        
        // Zeige Bestätigung
        ToastManager.showToast(`Tile "${tile.name}" ausgewählt`, 'success');
        
        // console.log('[BiomeCore] Tile selected for painting:', tile.name);
    }

    // Visuelle Auswahl aktualisieren
    updateBiomeSelection(selectedBiome) {
        const categoriesList = document.getElementById('biome-categories-list');
        if (!categoriesList) return;

        // Entferne alle vorherigen Auswahl-Markierungen
        const allItems = categoriesList.querySelectorAll('.biome-category-item');
        allItems.forEach(item => {
            item.classList.remove('selected-biome');
            item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });

        // Markiere das ausgewählte Biome
        const selectedItem = categoriesList.querySelector(`[data-category-id="${selectedBiome.id || selectedBiome.name}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected-biome');
            selectedItem.style.borderColor = '#4CAF50';
            selectedItem.style.backgroundColor = 'rgba(76, 175, 80, 0.15)';
        }
    }

    async refreshBiomeOptions() {
        // console.log('[BiomeCore] Refreshing biome options...');
        
        // Lösche alle gespeicherten Biome-Listen
        localStorage.removeItem('all_biomes');
        
        // Lösche alle gelöschten Biome-Markierungen
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('deleted_biome_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Aktualisiere die Anzeige
        if (this.biomeUI) {
            await this.biomeUI.updateBiomeCategoriesList();
        }
        
        ToastManager.showToast('Biome-Liste wurde aktualisiert!', 'success');
        // console.log('[BiomeCore] Biome options refreshed');
    }

    openAddCategoryModal() {
        // console.log('[BiomeCore] Open add category modal');
        // Implementierung für Hinzufügen
    }

    // Überprüfe und bereinige alle Biome
    validateBiomes() {
        // console.log('[BiomeCore] Validating biomes...');
        
        const allBiomes = BiomeUtils.getAllSavedBiomes();
        const validBiomes = [];
        const invalidBiomes = [];
        
        allBiomes.forEach(biome => {
            if (biome.name && biome.name.trim() !== '' && biome.color) {
                validBiomes.push(biome);
            } else {
                invalidBiomes.push(biome);
                console.warn('[BiomeCore] Invalid biome found:', biome);
            }
        });
        
        // Entferne ungültige Biome
        if (invalidBiomes.length > 0) {
            invalidBiomes.forEach(biome => {
                const biomeKey = `biome_${biome.id || biome.name.toLowerCase()}`;
                localStorage.removeItem(biomeKey);
            });
            
            // Aktualisiere die globale Liste
            localStorage.setItem('all_biomes', JSON.stringify(validBiomes));
            
            // console.log('[BiomeCore] Removed', invalidBiomes.length, 'invalid biomes');
            ToastManager.showToast(`${invalidBiomes.length} ungültige Biome wurden entfernt`, 'warning');
        }
        
        // Aktualisiere die Anzeige
        if (this.biomeUI) {
            this.biomeUI.updateBiomeCategoriesList();
        }
        
        // console.log('[BiomeCore] Biome validation complete. Valid:', validBiomes.length, 'Invalid:', invalidBiomes.length);
        return { valid: validBiomes.length, invalid: invalidBiomes.length };
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.BiomeCore = BiomeCore;
}
