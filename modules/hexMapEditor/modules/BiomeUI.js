"use strict";

// Entferne ES6-Imports und verwende globale Klassen
// import { BiomeUtils } from '../utils/BiomeUtils.js';
// import { StorageUtils } from '../utils/StorageUtils.js';
// import { DOMUtils } from '../utils/DOMUtils.js';
// import { ToastManager } from '../utils/ToastManager.js';

class BiomeUI {
    constructor(core) {
        this.core = core;
        this.biomeData = null;
        this.init();
    }

    init() {
        console.log('[BiomeUI] Initializing BiomeUI module');
        this.debugContainerStructure();
    }

    // Hauptfunktion für Biome-Kategorien-Liste
    updateBiomeCategoriesList() {
        console.log('[BiomeUI] Updating biome categories list...');
        
        const categoriesList = document.getElementById('biome-categories-list');
        const categoriesCount = document.getElementById('biome-categories-count');
        
        if (!categoriesList || !categoriesCount) {
            console.error('[BiomeUI] ERROR: Required DOM elements not found!');
            return;
        }
        
        // Prüfe ob bereits eine stabile Struktur existiert
        const existingStructure = categoriesList.querySelector('.stable-biome-structure');
        if (existingStructure) {
            console.log('[BiomeUI] Stable structure already exists, updating content only');
            this.updateExistingStructureSync(this.core.getCurrentLayer(), existingStructure);
            return;
        }
        
        // Lade Biome-Daten synchron
        if (this.biomeData) {
            this.biomeData.loadBiomeDataFromBuildingsTilesList();
        }
        
        // Use synchronous fallback biomes for immediate display
        let categories = this.getFallbackBiomes();
        const currentLayer = this.core.getCurrentLayer();
        
        // Sortiere nach gespeicherter Reihenfolge
        const savedOrder = StorageUtils.loadBiomeCategoryOrder();
        if (savedOrder && categories.length > 0) {
            categories = this.sortCategoriesBySavedOrder(categories, savedOrder);
        }
        
        // Erstelle stabile Struktur synchron
        this.createStableStructureSync(categories, categoriesList, categoriesCount, currentLayer);
        
        console.log('[BiomeUI] Categories displayed:', categories.length);
        
        // Setup sort buttons
        this.setupSortButtons();
        
        // Load real data asynchronously in background
        this.loadRealBiomeDataAsync();
    }

    // Hilfsfunktionen für Kategorien-Management
    sortCategoriesBySavedOrder(categories, savedOrder) {
        console.log('[BiomeUI] Sorting categories by saved order:', savedOrder);
        console.log('[BiomeUI] Available categories:', categories.map(c => ({id: c.id, name: c.name})));
        
        const orderedCategories = [];
        
        // Füge zuerst die Kategorien in der gespeicherten Reihenfolge hinzu
        savedOrder.forEach(item => {
            // Suche nach ID oder Name (case-insensitive)
            const category = categories.find(cat => 
                cat.id === item.id || 
                cat.name === item.name ||
                cat.id === item.name ||
                cat.name === item.id ||
                cat.name.toLowerCase() === item.name.toLowerCase() ||
                cat.id.toLowerCase() === item.name.toLowerCase()
            );
            if (category) {
                orderedCategories.push(category);
                console.log('[BiomeUI] Found category for saved order:', item.name, '->', category.name);
            } else {
                console.log('[BiomeUI] No category found for saved order item:', item);
            }
        });
        
        // Füge dann die restlichen Kategorien hinzu, die nicht in der gespeicherten Reihenfolge sind
        categories.forEach(category => {
            const alreadyIncluded = savedOrder.find(item => 
                item.id === category.id || 
                item.name === category.name ||
                item.id === category.name ||
                item.name === category.id ||
                item.name.toLowerCase() === category.name.toLowerCase() ||
                item.id.toLowerCase() === category.name.toLowerCase()
            );
            if (!alreadyIncluded) {
                orderedCategories.push(category);
                console.log('[BiomeUI] Added remaining category:', category.name);
            }
        });
        
        console.log('[BiomeUI] Final sorted categories:', orderedCategories.map(c => c.name));
        return orderedCategories;
    }

    // Synchronous fallback biomes for immediate display
    getFallbackBiomes() {
        return [
            { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50', description: 'Waldlandschaft', icon: '🌲' },
            { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548', description: 'Berglandschaft', icon: '⛰️' },
            { id: 'water', name: 'Water', type: 'biome', color: '#2196F3', description: 'Wasserlandschaft', icon: '💧' },
            { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800', description: 'Wüstenlandschaft', icon: '🏜️' },
            { id: 'buildings', name: 'Buildings', type: 'entities', color: '#9C27B0', description: 'Gebäude und Siedlungen', icon: '🏢' },
            { id: 'swamp', name: 'Swamp', type: 'biome', color: '#8BC34A', description: 'Sumpflandschaft', icon: '🌿' },
            { id: 'plain', name: 'Plain', type: 'biome', color: '#CDDC39', description: 'Ebenenlandschaft', icon: '🌾' },
            { id: 'jungle', name: 'Jungle', type: 'biome', color: '#4CAF50', description: 'Dschungellandschaft', icon: '🌴' },
            { id: 'badlands', name: 'Badlands', type: 'biome', color: '#FF5722', description: 'Ödland', icon: '🏔️' },
            { id: 'snow', name: 'Snow', type: 'biome', color: '#E3F2FD', description: 'Schneelandschaft', icon: '❄️' },
            { id: 'ocean', name: 'Ocean', type: 'biome', color: '#1976D2', description: 'Meereslandschaft', icon: '🌊' }
        ];
    }

    // Synchronous structure creation
    createStableStructureSync(categories, categoriesList, categoriesCount, currentLayer) {
        console.log('[BiomeUI] Creating stable structure for layer:', currentLayer);
        
        // Erstelle Container für stabile Struktur
        const stableContainer = document.createElement('div');
        stableContainer.className = 'stable-biome-structure';
        stableContainer.style.cssText = `
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;
        `;
        
        // Aktualisiere UI
        categoriesCount.textContent = `${categories.length} Kategorien`;
        categoriesList.innerHTML = '';
        categoriesList.appendChild(stableContainer);
        
        if (categories.length === 0) {
            this.displayFallbackBiomesSync(currentLayer, stableContainer, categoriesCount);
            return;
        }
        
        this.displayCategoriesSync(categories, stableContainer);
    }

    // Synchronous category display
    displayCategoriesSync(categories, categoriesList) {
        for (const category of categories) {
            const categoryItem = this.createCategoryItem(category, false);
            
            // Füge Unterkategorien für Buildings hinzu
            if (category.name === 'Buildings' || category.type === 'entities') {
                const subCategoriesContainer = this.createSubCategoriesContainer();
                const subCategories = this.getBuildingSubCategories();
                
                // Lade alle Subkategorien ohne Tiles sofort
                for (const subCat of subCategories) {
                    const subCatItem = this.createSubCategoryItem(subCat);
                    subCategoriesContainer.appendChild(subCatItem);
                    
                    // Lazy load tiles for sub-category
                    this.loadTilesForSubCategoryLazy(subCat, subCatItem);
                }
                
                categoryItem.appendChild(subCategoriesContainer);
            }
            
            categoriesList.appendChild(categoryItem);
        }
    }

    // Synchronous fallback display
    displayFallbackBiomesSync(currentLayer, categoriesList, categoriesCount) {
        console.log('[BiomeUI] No categories found, showing fallback biomes...');
        
        let fallbackBiomes = [];
        if (currentLayer === 'streets') {
            // Für Straßen und Siedlungen: Nur Buildings
            fallbackBiomes = [
                { id: 'buildings', name: 'Buildings', type: 'entities', color: '#00fc02', icon: '🏗️' }
            ];
        } else {
            // Für Terrain: Echte Biome (nicht Buildings)
            fallbackBiomes = [
                { id: 'void', name: 'Void', type: 'biome', color: '#000000', icon: '⬛' },
                { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50', icon: '🌲' },
                { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548', icon: '⛰️' },
                { id: 'water', name: 'Water', type: 'biome', color: '#2196F3', icon: '💧' },
                { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800', icon: '🏜️' },
                { id: 'swamp', name: 'Swamp', type: 'biome', color: '#8BC34A', icon: '🌿' },
                { id: 'snow', name: 'Snow', type: 'biome', color: '#FFFFFF', icon: '❄️' },
                { id: 'jungle', name: 'Jungle', type: 'biome', color: '#4CAF50', icon: '🌴' },
                { id: 'badlands', name: 'Badlands', type: 'biome', color: '#795548', icon: '🏔️' }
            ];
        }
        
        categoriesCount.textContent = `${fallbackBiomes.length} Kategorien`;
        for (const biome of fallbackBiomes) {
            const categoryItem = this.createCategoryItem(biome, true);
            
            // Für Buildings-Fallback: Füge Unterkategorien hinzu
            if (currentLayer === 'streets' && biome.name === 'Buildings') {
                const subCategoriesContainer = this.createSubCategoriesContainer();
                const subCategories = this.getBuildingSubCategories();
                
                // Lade alle Subkategorien ohne Tiles sofort
                for (const subCat of subCategories) {
                    const subCatItem = this.createSubCategoryItem(subCat);
                    subCategoriesContainer.appendChild(subCatItem);
                    
                    // Lazy load tiles for sub-category
                    this.loadTilesForSubCategoryLazy(subCat, subCatItem);
                }
                
                categoryItem.appendChild(subCategoriesContainer);
            }
            
            categoriesList.appendChild(categoryItem);
        }
    }

    // Synchronous structure update
    updateExistingStructureSync(currentLayer, existingStructure) {
        console.log('[BiomeUI] Updating existing structure for layer:', currentLayer);
        
        // Aktualisiere nur den Inhalt, nicht die Struktur
        const categoryItems = existingStructure.querySelectorAll('.biome-category-item');
        
        for (const item of categoryItems) {
            const categoryName = item.getAttribute('data-category-name');
            const categoryType = item.getAttribute('data-category-type');
            
            // Prüfe ob das Item für den aktuellen Layer sichtbar sein soll
            const shouldBeVisible = this.shouldCategoryBeVisible(categoryName, categoryType, currentLayer);
            item.style.display = shouldBeVisible ? 'flex' : 'none';
        }
    }

    // Load real data asynchronously in background
    async loadRealBiomeDataAsync() {
        // Use requestIdleCallback for better performance
        if (window.requestIdleCallback) {
            requestIdleCallback(async () => {
                try {
                    const realCategories = await BiomeUtils.getBiomeFolders();
                    console.log('[BiomeUI] Loaded real biome data:', realCategories.length, 'categories');
                    // Could update UI here if needed
                } catch (error) {
                    console.warn('[BiomeUI] Failed to load real biome data:', error);
                }
            }, { timeout: 2000 });
        } else {
            // Fallback to setTimeout
            setTimeout(async () => {
                try {
                    const realCategories = await BiomeUtils.getBiomeFolders();
                    console.log('[BiomeUI] Loaded real biome data:', realCategories.length, 'categories');
                } catch (error) {
                    console.warn('[BiomeUI] Failed to load real biome data:', error);
                }
            }, 100);
        }
    }

    setupCategoriesListStyles(categoriesList) {
        categoriesList.style.cssText = `
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;
        `;
        
        // Stelle sicher, dass der Container die volle verfügbare Breite nutzt
        const parentContainer = categoriesList.parentElement;
        if (parentContainer) {
            parentContainer.style.cssText = `
                width: 100%;
                min-width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                overflow: visible;
            `;
        }
    }

    async displayFallbackBiomes(currentLayer, categoriesList, categoriesCount) {
        console.log('[BiomeUI] No categories found, showing fallback biomes...');
        
        let fallbackBiomes = [];
        if (currentLayer === 'streets') {
            // Für Straßen und Siedlungen: Nur Buildings
            fallbackBiomes = [
                { id: 'buildings', name: 'Buildings', type: 'entities', color: '#00fc02', icon: '🏗️' }
            ];
            console.log('[BiomeUI] Using buildings fallback for streets layer');
        } else {
            // Für Terrain: Echte Biome (nicht Buildings)
            fallbackBiomes = [
                { id: 'void', name: 'Void', type: 'biome', color: '#000000', icon: '⬛' },
                { id: 'forest', name: 'Forest', type: 'biome', color: '#4CAF50', icon: '🌲' },
                { id: 'mountains', name: 'Mountains', type: 'biome', color: '#795548', icon: '⛰️' },
                { id: 'water', name: 'Water', type: 'biome', color: '#2196F3', icon: '💧' },
                { id: 'desert', name: 'Desert', type: 'biome', color: '#FF9800', icon: '🏜️' },
                { id: 'swamp', name: 'Swamp', type: 'biome', color: '#8BC34A', icon: '🌿' },
                { id: 'snow', name: 'Snow', type: 'biome', color: '#FFFFFF', icon: '❄️' },
                { id: 'jungle', name: 'Jungle', type: 'biome', color: '#4CAF50', icon: '🌴' },
                { id: 'badlands', name: 'Badlands', type: 'biome', color: '#795548', icon: '🏔️' }
            ];
            console.log('[BiomeUI] Using terrain biomes fallback for terrain layer');
        }
        
        categoriesCount.textContent = `${fallbackBiomes.length} Kategorien`;
        for (const biome of fallbackBiomes) {
            const categoryItem = this.createCategoryItem(biome, true);
            
            // Für Buildings-Fallback: Füge Unterkategorien hinzu
            if (currentLayer === 'streets' && biome.name === 'Buildings') {
                const subCategoriesContainer = this.createSubCategoriesContainer();
                const subCategories = this.getBuildingSubCategories();
                
                // Lade alle Subkategorien ohne Tiles sofort
                for (const subCat of subCategories) {
                    const subCatItem = this.createSubCategoryItem(subCat);
                    subCategoriesContainer.appendChild(subCatItem);
                    
                    // Lazy load tiles for sub-category
                    this.loadTilesForSubCategoryLazy(subCat, subCatItem);
                }
                
                categoryItem.appendChild(subCategoriesContainer);
            }
            
            categoriesList.appendChild(categoryItem);
        }
        
        console.log('[BiomeUI] Fallback biomes displayed');
    }

    async displayCategories(categories, categoriesList) {
        for (const category of categories) {
            const categoryItem = this.createCategoryItem(category, false);
            
            // Füge Unterkategorien für Buildings hinzu
            if (category.name === 'Buildings' || category.type === 'entities') {
                const subCategoriesContainer = this.createSubCategoriesContainer();
                const subCategories = this.getBuildingSubCategories();
                
                // Lade alle Subkategorien ohne Tiles sofort
                for (const subCat of subCategories) {
                    const subCatItem = this.createSubCategoryItem(subCat);
                    subCategoriesContainer.appendChild(subCatItem);
                    
                    // Lazy load tiles for sub-category
                    this.loadTilesForSubCategoryLazy(subCat, subCatItem);
                }
                
                categoryItem.appendChild(subCategoriesContainer);
            }
            
            categoriesList.appendChild(categoryItem);
        }
    }

    // Container-Erstellung
    createCategoryItem(category, isFallback = false) {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'biome-category-item';
        categoryItem.setAttribute('data-category-id', category.id || category.name);
        categoryItem.setAttribute('data-category-name', category.name);
        categoryItem.setAttribute('data-category-type', category.type);
        categoryItem.style.cssText = `
            margin: 2px 0;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        `;
        
        const categoryTitle = this.createCategoryTitle(category, isFallback);
        categoryItem.appendChild(categoryTitle);
        
        return categoryItem;
    }

    createCategoryTitle(category, isFallback) {
        const categoryTitle = document.createElement('div');
        categoryTitle.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-weight: bold;
            width: 100%;
            box-sizing: border-box;
            ${isFallback ? 'cursor: pointer;' : ''}
        `;
        
        categoryTitle.innerHTML = `
            <span style="font-size: 16px;">${category.icon || '🌍'}</span>
            <span style="color: ${category.color || '#fff'}; font-size: 12px;">${category.name}</span>
        `;
        
        if (isFallback) {
            categoryTitle.addEventListener('click', () => {
                console.log('[BiomeUI] Fallback biome clicked:', category.name);
                this.selectBiomeForPainting(category);
            });
        }
        
        return categoryTitle;
    }

    createSubCategoriesContainer() {
        const subCategoriesContainer = document.createElement('div');
        subCategoriesContainer.className = 'biome-subcategories';
        subCategoriesContainer.style.cssText = `
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            gap: 2px;
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: visible;
        `;
        
        return subCategoriesContainer;
    }

    createSubCategoryItem(subCat) {
        const subCatItem = document.createElement('div');
        subCatItem.style.cssText = `
            display: flex;
            flex-direction: column;
            padding: 6px 10px;
            margin: 2px 0;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            overflow: hidden;
        `;
        
        subCatItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                <span style="font-size: 16px;">${subCat.icon}</span>
                <span style="color: ${subCat.color}; font-size: 12px; font-weight: bold;">${subCat.name}</span>
                <span style="color: #999; font-size: 10px; margin-left: auto;">(${subCat.category})</span>
                </div>
            `;
        
        this.addSubCategoryEventListeners(subCatItem, subCat);
        
        return subCatItem;
    }

    addSubCategoryEventListeners(subCatItem, subCat) {
        subCatItem.addEventListener('mouseenter', () => {
            subCatItem.style.background = 'rgba(255, 255, 255, 0.15)';
            subCatItem.style.borderColor = subCat.color;
        });
        
        subCatItem.addEventListener('mouseleave', () => {
            subCatItem.style.background = 'rgba(255, 255, 255, 0.05)';
            subCatItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        subCatItem.addEventListener('click', async () => {
            console.log('[BiomeUI] Sub-category clicked:', subCat.name);
            this.selectBiomeForPainting({ subCategory: subCat.name });
            await this.loadTilesForSubCategory(subCat, subCatItem);
        });
    }

    getBuildingSubCategories() {
        return [
            { name: 'Haus', icon: '🏢', color: '#4CAF50', category: 'building' },
            { name: 'Turm', icon: '🗼', color: '#FF9800', category: 'tower' },
            { name: 'Burg', icon: '🏰', color: '#9C27B0', category: 'castle' },
            { name: 'Tempel', icon: '⛪', color: '#2196F3', category: 'temple' },
            { name: 'Mine', icon: '⛏️', color: '#795548', category: 'mining_site' },
            { name: 'Dorf', icon: '🏘️', color: '#8BC34A', category: 'village' },
            { name: 'Siedlung', icon: '🏘️', color: '#607D8B', category: 'settlement' },
            { name: 'Ritualstätte', icon: '🔮', color: '#E91E63', category: 'ritual_site' }
        ];
    }

    // Tiles-Management
    async loadTilesForSubCategory(subCategory, subCategoryElement) {
        console.log('[BiomeUI] Loading tiles for sub-category:', subCategory.name);
        
        // Entferne vorhandene Tiles
        const existingTiles = subCategoryElement.querySelector('.subcategory-tiles');
        if (existingTiles) {
            existingTiles.remove();
        }
        
        // Erstelle Container für Tiles
        const tilesContainer = this.createTilesContainer();
        
        // Lade Tiles
        let tiles = [];
        if (this.biomeData && this.biomeData.loadTilesForCategory) {
            try {
                tiles = await this.biomeData.loadTilesForCategory(subCategory.category);
            } catch (error) {
                console.warn('[BiomeUI] Failed to load real tiles from BiomeData:', error);
            }
        } else {
            // Versuche direkt auf buildingsTilesList zuzugreifen
            if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
                tiles = window.buildingsTilesList.filter(tile => 
                    tile.buildingCategory === subCategory.category || 
                    subCategory.category === 'building'
                );
            }
        }
        
        // Fallback zu Mock-Tiles
        if (!tiles || tiles.length === 0) {
            tiles = this.getMockTilesForSubCategory(subCategory.category);
        }
        
        // Erstelle Tile-Elemente
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const tileElement = this.createTileElement(tile);
            tilesContainer.appendChild(tileElement);
        }
        
        // Füge Tiles direkt nach dem SubCategory-Element hinzu
        subCategoryElement.appendChild(tilesContainer);
        console.log('[BiomeUI] Loaded', tiles.length, 'tiles for sub-category:', subCategory.name);
    }

    // Lazy loading for sub-category tiles
    loadTilesForSubCategoryLazy(subCategory, subCategoryElement) {
        console.log('[BiomeUI] Setting up lazy loading for sub-category:', subCategory.name);
        
        // Create a placeholder container
        const placeholderContainer = this.createTilesContainer();
        placeholderContainer.innerHTML = '<div style="padding: 8px; color: #888; font-style: italic;">Loading tiles...</div>';
        subCategoryElement.appendChild(placeholderContainer);
        
        // Use requestIdleCallback for better performance
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.loadTilesForSubCategory(subCategory, subCategoryElement);
            }, { timeout: 1000 });
        } else {
            // Fallback to setTimeout
            setTimeout(() => {
                this.loadTilesForSubCategory(subCategory, subCategoryElement);
            }, 100);
        }
    }

    createTilesContainer() {
        const tilesContainer = document.createElement('div');
        tilesContainer.className = 'subcategory-tiles';
        tilesContainer.style.cssText = `
            margin-top: 8px;
            padding: 8px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
                display: flex;
            flex-wrap: wrap;
                gap: 4px;
            max-height: 200px;
            overflow-y: auto;
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
            justify-content: flex-start;
            align-items: flex-start;
            position: relative;
            word-wrap: break-word;
            word-break: break-word;
        `;
        
        return tilesContainer;
    }

        createTileElement(tile) {
                const tileElement = document.createElement('div');
        tileElement.className = 'tile-element';
                tileElement.style.cssText = `
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
            flex-shrink: 0;
            margin: 0;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
        `;
        
        console.log('[BiomeUI] Creating tile element for:', tile.name, 'with image:', tile.image);
        
        // Prüfe ob echte Tiles mit Bildern vorhanden sind
        if (tile.image && tile.image !== '' && tile.image !== 'undefined' && !tile.image.includes('emoji')) {
            // Korrigiere den Bildpfad
            let correctedImagePath = tile.image;
            if (tile.image.startsWith('assets/')) {
                correctedImagePath = '/' + tile.image;
            } else if (!tile.image.startsWith('/') && !tile.image.startsWith('http')) {
                correctedImagePath = '/assets/biomes/Buildings/tiles/' + tile.image;
            }
            
            console.log('[BiomeUI] Using real image for tile:', tile.name, 'original:', tile.image, 'corrected:', correctedImagePath);
            
            // Add cache-busting parameter
            const timestamp = Date.now();
            const cacheBustedImagePath = correctedImagePath + (correctedImagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            
            // Debug: Teste ob das Bild existiert
            const testImg = new Image();
            testImg.onload = () => console.log('[BiomeUI] ✅ Image exists:', cacheBustedImagePath);
            testImg.onerror = () => console.log('[BiomeUI] ❌ Image not found:', cacheBustedImagePath);
            testImg.src = cacheBustedImagePath;
            
                        tileElement.innerHTML = `
                <img src="${cacheBustedImagePath}" alt="${tile.name}" class="tile-image" />
                <div class="tile-fallback" style="display: none; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.1); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #ccc;">${tile.icon || '🏢'}</div>
            `;
        } else {
            console.log('[BiomeUI] No real image available, using icon for tile:', tile.name, 'icon:', tile.icon);
                tileElement.innerHTML = `
                <div style="width: 100%; height: 100%; background: rgba(255, 255, 255, 0.1); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #ccc;">${tile.icon || '🏢'}</div>
            `;
        }
        
        tileElement.title = tile.name;
        
        this.addTileEventListeners(tileElement, tile);
        
        return tileElement;
    }

    addTileEventListeners(tileElement, tile) {
                tileElement.addEventListener('mouseenter', () => {
            tileElement.style.background = 'rgba(255, 255, 255, 0.2)';
            tileElement.style.transform = 'scale(1.1)';
                });
                
                tileElement.addEventListener('mouseleave', () => {
            tileElement.style.background = 'rgba(255, 255, 255, 0.1)';
                    tileElement.style.transform = 'scale(1)';
                });
                
        tileElement.addEventListener('click', () => {
            console.log('[BiomeUI] Tile clicked:', tile.name);
            this.selectTileForPainting(tile);
        });
    }

    // Mock-Tiles für Unterkategorien (Fallback)
    getMockTilesForSubCategory(category) {
        console.log('[BiomeUI] Getting mock tiles for sub-category:', category);
        
        // Verwende BiomeData für Mock-Tiles
        if (this.biomeData && this.biomeData.getMockTilesForCategory) {
            const tiles = this.biomeData.getMockTilesForCategory(category);
            console.log('[BiomeUI] BiomeData returned mock tiles:', tiles.length);
            return tiles;
        }
        
        // Fallback falls BiomeData nicht verfügbar
        console.log('[BiomeUI] Using hardcoded fallback tiles for category:', category);
        const fallbackTiles = {
            'building': [
                { name: 'Haus', image: 'slice_333.png', icon: '🏠', buildingCategory: 'building' },
                { name: 'Turm', image: 'slice_344.png', icon: '🗼', buildingCategory: 'tower' },
                { name: 'Burg', image: 'slice_352.png', icon: '🏰', buildingCategory: 'castle' },
                { name: 'Mine', image: 'slice_358.png', icon: '⛏️', buildingCategory: 'mining_site' }
            ],
            'tower': [
                { name: 'Wachturm', image: 'slice_344.png', icon: '🗼', buildingCategory: 'tower' }
            ],
            'castle': [
                { name: 'Burg', image: 'slice_352.png', icon: '🏰', buildingCategory: 'castle' }
            ],
            'temple': [
                { name: 'Tempel', image: 'slice_344.png', icon: '⛪', buildingCategory: 'tower' }
            ],
            'mining_site': [
                { name: 'Mine', image: 'slice_358.png', icon: '⛏️', buildingCategory: 'mining_site' }
            ]
        };
        
        const tiles = fallbackTiles[category] || fallbackTiles['building'] || [{ name: 'Unbekannt', icon: '❓' }];
        console.log('[BiomeUI] Returning fallback tiles:', tiles.length);
        return tiles;
    }

    // Auswahl-Funktionen
    selectTileForPainting(tile) {
        if (!this.core) {
            console.warn('[BiomeUI] Core not available for tile selection');
            return;
        }

        console.log('[BiomeUI] Selecting tile for painting:', tile.name);
        
        if (this.core.setSelectedTile) {
            this.core.setSelectedTile(tile);
        }
        
        ToastManager.showToast(`Tile "${tile.name}" ausgewählt`, 'success');
        console.log('[BiomeUI] Tile selected for painting:', tile.name);
    }

    selectBiomeForPainting(biome) {
        if (!this.core || !this.core.settings) {
            console.warn('[BiomeUI] Core not available for biome selection');
            return;
        }

        // Prüfe ob das Biome bereits aufgeklappt ist
        const biomeItem = document.querySelector(`[data-category-id="${biome.id || biome.name}"]`);
        if (biomeItem) {
            const isExpanded = biomeItem.classList.contains('expanded');
            
            if (isExpanded) {
                this.collapseBiome(biomeItem, biome);
                return;
            } else {
                this.expandBiome(biomeItem, biome);
            }
        }

        // Setze das ausgewählte Biome
        if (this.core.setSelectedBiome) {
            this.core.setSelectedBiome(biome.name);
        }
        
        this.updateBiomeSelection(biome);
        
        if (this.core.notifyObservers) {
            this.core.notifyObservers('biomeChanged', { biome: biome.name });
        }
        
        console.log('[BiomeUI] Selected biome for painting:', biome.name);
    }

    collapseBiome(biomeItem, biome) {
                biomeItem.classList.remove('expanded');
                const expandIcon = biomeItem.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.textContent = '▶';
                }
                
                const biomeTilesContainer = biomeItem.querySelector('.biome-tiles-container');
                const buildingsTilesContainer = biomeItem.querySelector('.buildings-tiles-container');
                if (biomeTilesContainer) biomeTilesContainer.style.display = 'none';
                if (buildingsTilesContainer) buildingsTilesContainer.style.display = 'none';
                
                console.log('[BiomeUI] Collapsed biome:', biome.name);
    }

    async expandBiome(biomeItem, biome) {
                biomeItem.classList.add('expanded');
                const expandIcon = biomeItem.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.textContent = '▼';
                }
                
    if (this.biomeData) {
        await this.biomeData.loadTilesForBiomeAndDisplay(biome, biomeItem, true);
    }
                
                if (biome.type === 'entities') {
                    const buildingsTilesContainer = biomeItem.querySelector('.buildings-tiles-container');
                    if (!buildingsTilesContainer || buildingsTilesContainer.children.length === 0) {
                        setTimeout(() => {
                            console.log('[BiomeUI] Loading Buildings tiles for expanded biome:', biome.name);
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

    // Kategorie-Management
    editCategory(category) {
        console.log('[BiomeUI] Edit category:', category.name);
        // Implementierung für Bearbeitung
    }

    deleteCategory(category) {
        if (confirm(`Möchtest du die Kategorie "${category.name}" wirklich löschen?`)) {
            console.log('[BiomeUI] Delete category:', category.name);
            this.updateBiomeCategoriesList();
            ToastManager.showToast(`Kategorie "${category.name}" wurde gelöscht!`, 'success');
        }
    }

    // Debug-Funktionen
    async debugBiomeDisplay() {
        console.log('[BiomeUI] === DEBUG BIOME DISPLAY ===');
        
        const testCategories = await BiomeUtils.getBiomeFolders();
        console.log('[BiomeUI] DEBUG: BiomeUtils returned:', testCategories.length, 'categories');
        
        const entitiesTest = testCategories.filter(cat => cat.type === 'entities');
        console.log('[BiomeUI] DEBUG: Entities biomes found:', entitiesTest.length);
        console.log('[BiomeUI] DEBUG: Entities biomes:', entitiesTest.map(c => ({name: c.name, type: c.type})));
        
        const currentLayer = this.core.getCurrentLayer();
        console.log('[BiomeUI] DEBUG: Current layer is:', currentLayer);
        
        const categoriesList = document.getElementById('biome-categories-list');
        const categoriesCount = document.getElementById('biome-categories-count');
        console.log('[BiomeUI] DEBUG: categoriesList exists:', !!categoriesList);
        console.log('[BiomeUI] DEBUG: categoriesCount exists:', !!categoriesCount);
        
        if (categoriesList) {
            console.log('[BiomeUI] DEBUG: categoriesList children:', categoriesList.children.length);
            console.log('[BiomeUI] DEBUG: categoriesList innerHTML length:', categoriesList.innerHTML.length);
            
            const biomeItems = categoriesList.querySelectorAll('.biome-category-item');
            console.log('[BiomeUI] DEBUG: Found biome items:', biomeItems.length);
            
            biomeItems.forEach((item, index) => {
                console.log(`[BiomeUI] DEBUG: Biome item ${index}:`, {
                    hasTitle: !!item.querySelector('div:first-child'),
                    hasSubCategories: !!item.querySelector('.biome-subcategories'),
                    subCategoriesCount: item.querySelectorAll('.biome-subcategories > div').length,
                    titleText: item.querySelector('div:first-child')?.textContent?.trim()
                });
            });
            
            const subCategoriesContainers = categoriesList.querySelectorAll('.biome-subcategories');
            console.log('[BiomeUI] DEBUG: Subcategories containers found:', subCategoriesContainers.length);
            
            subCategoriesContainers.forEach((container, index) => {
                console.log(`[BiomeUI] DEBUG: Subcategories container ${index}:`, {
                    children: container.children.length,
                    display: window.getComputedStyle(container).display,
                    flexDirection: window.getComputedStyle(container).flexDirection,
                    gap: window.getComputedStyle(container).gap
                });
            });
        }
        
        if (currentLayer === 'streets' && entitiesTest.length > 0) {
            console.log('[BiomeUI] DEBUG: Forcing display of entities biomes...');
            this.forceDisplayEntitiesBiomes(entitiesTest);
        }
        
        console.log('[BiomeUI] === END DEBUG BIOME DISPLAY ===');
    }

    debugContainerStructure() {
        console.log('[BiomeUI] === DEBUG CONTAINER STRUCTURE ===');
        
        const categoriesList = document.getElementById('biome-categories-list');
        if (!categoriesList) {
            console.error('[BiomeUI] DEBUG: categoriesList not found');
            return;
        }
        
        console.log('[BiomeUI] DEBUG: categoriesList styles:', {
            width: window.getComputedStyle(categoriesList).width,
            minWidth: window.getComputedStyle(categoriesList).minWidth,
            maxWidth: window.getComputedStyle(categoriesList).maxWidth,
            display: window.getComputedStyle(categoriesList).display,
            flexDirection: window.getComputedStyle(categoriesList).flexDirection,
            padding: window.getComputedStyle(categoriesList).padding,
            boxSizing: window.getComputedStyle(categoriesList).boxSizing
        });
        
        const biomeItems = categoriesList.querySelectorAll('.biome-category-item');
        console.log('[BiomeUI] DEBUG: Found biome items:', biomeItems.length);
        
        biomeItems.forEach((item, index) => {
            console.log(`[BiomeUI] DEBUG: Biome item ${index} styles:`, {
                width: window.getComputedStyle(item).width,
                minWidth: window.getComputedStyle(item).minWidth,
                maxWidth: window.getComputedStyle(item).maxWidth,
                display: window.getComputedStyle(item).display,
                flexDirection: window.getComputedStyle(item).flexDirection
            });
            
            const subCategoriesContainer = item.querySelector('.biome-subcategories');
            if (subCategoriesContainer) {
                console.log(`[BiomeUI] DEBUG: Subcategories container ${index} styles:`, {
                    width: window.getComputedStyle(subCategoriesContainer).width,
                    minWidth: window.getComputedStyle(subCategoriesContainer).minWidth,
                    maxWidth: window.getComputedStyle(subCategoriesContainer).maxWidth,
                    display: window.getComputedStyle(subCategoriesContainer).display,
                    flexDirection: window.getComputedStyle(subCategoriesContainer).flexDirection,
                    gap: window.getComputedStyle(subCategoriesContainer).gap
                });
                
                const subCategoryItems = subCategoriesContainer.querySelectorAll('div');
                console.log(`[BiomeUI] DEBUG: Subcategory items in container ${index}:`, subCategoryItems.length);
                
                subCategoryItems.forEach((subItem, subIndex) => {
                    console.log(`[BiomeUI] DEBUG: Subcategory item ${subIndex} styles:`, {
                        width: window.getComputedStyle(subItem).width,
                        minWidth: window.getComputedStyle(subItem).minWidth,
                        maxWidth: window.getComputedStyle(subItem).maxWidth,
                        display: window.getComputedStyle(subItem).display
                    });
                });
            }
        });
        
        console.log('[BiomeUI] === END DEBUG CONTAINER STRUCTURE ===');
    }
    
    // Spezielle Debug-Funktion für Tile-Anzeige
    debugTileDisplay() {
        console.log('[BiomeUI] === DEBUG TILE DISPLAY ===');
        
        // Prüfe globale Tiles-Listen
        console.log('[BiomeUI] Global tiles lists:');
        console.log('[BiomeUI] - window.buildingsTilesList:', !!window.buildingsTilesList, 'count:', window.buildingsTilesList?.length || 0);
        console.log('[BiomeUI] - window.plainTilesList:', !!window.plainTilesList, 'count:', window.plainTilesList?.length || 0);
        
        if (window.buildingsTilesList && window.buildingsTilesList.length > 0) {
            console.log('[BiomeUI] Sample buildings tile:', window.buildingsTilesList[0]);
            console.log('[BiomeUI] Buildings tile has image:', !!window.buildingsTilesList[0].image, 'image:', window.buildingsTilesList[0].image);
        }
        
        // Prüfe BiomeData Verfügbarkeit
        console.log('[BiomeUI] BiomeData availability:');
        console.log('[BiomeUI] - this.biomeData:', !!this.biomeData);
        console.log('[BiomeUI] - this.biomeData.loadTilesForCategory:', !!(this.biomeData && this.biomeData.loadTilesForCategory));
        
        // Prüfe DOM-Elemente
        const subcategoryItems = document.querySelectorAll('.subcategory-item');
        console.log('[BiomeUI] Subcategory items found:', subcategoryItems.length);
        
        subcategoryItems.forEach((item, index) => {
            const name = item.querySelector('.subcategory-name')?.textContent;
            const category = item.querySelector('.subcategory-name')?.getAttribute('data-category');
            const tilesContainer = item.querySelector('.subcategory-tiles');
            const tiles = tilesContainer?.querySelectorAll('.tile-element');
            const images = tilesContainer?.querySelectorAll('.tile-element img');
            
            console.log(`[BiomeUI] Subcategory ${index + 1}:`, {
                name: name,
                category: category,
                tilesContainer: !!tilesContainer,
                tilesCount: tiles?.length || 0,
                imagesCount: images?.length || 0
            });
            
            if (images && images.length > 0) {
                images.forEach((img, imgIndex) => {
                    console.log(`[BiomeUI]   Image ${imgIndex + 1}:`, {
                        src: img.src,
                        alt: img.alt,
                        complete: img.complete,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight
                    });
                });
            }
        });
        
        console.log('[BiomeUI] === END DEBUG TILE DISPLAY ===');
    }

    forceDisplayEntitiesBiomes(entitiesBiomes) {
        const categoriesList = document.getElementById('biome-categories-list');
        if (!categoriesList) {
            console.error('[BiomeUI] DEBUG: categoriesList not found for force display');
            return;
        }
        
        const buildingsBiomes = entitiesBiomes.filter(biome => 
            biome.name.toLowerCase() === 'buildings' || 
            biome.id === 'buildings' ||
            biome.type === 'entities'
        );
        
        console.log('[BiomeUI] DEBUG: Force displaying', buildingsBiomes.length, 'buildings biomes');
        
        categoriesList.innerHTML = '';
        
        buildingsBiomes.forEach(biome => {
            console.log('[BiomeUI] DEBUG: Creating element for biome:', biome.name);
            
            const biomeElement = document.createElement('div');
            biomeElement.className = 'biome-category-item';
            biomeElement.setAttribute('data-category-id', biome.id || biome.name);
            biomeElement.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                padding: 8px;
                margin-bottom: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            biomeElement.innerHTML = `
                <span style="font-size: 16px;">${biome.icon || '🏗️'}</span>
                <span style="color: #fff; font-weight: bold;">${biome.name}</span>
                <span style="color: #999; font-size: 12px;">(${biome.type})</span>
            `;
            
            biomeElement.addEventListener('click', () => {
                console.log('[BiomeUI] DEBUG: Clicked on forced biome:', biome.name);
                this.selectBiomeForPainting(biome);
            });
            
            categoriesList.appendChild(biomeElement);
            console.log('[BiomeUI] DEBUG: Added biome element:', biome.name);
        });
        
        const categoriesCount = document.getElementById('biome-categories-count');
        if (categoriesCount) {
            categoriesCount.textContent = `${buildingsBiomes.length} Kategorien`;
        }
        
        console.log('[BiomeUI] DEBUG: Force display complete');
    }

    // Stabile Struktur-Methoden
    async createStableStructure(categories, categoriesList, categoriesCount, currentLayer) {
        console.log('[BiomeUI] Creating stable structure for layer:', currentLayer);
        
        // Erstelle Container für stabile Struktur
        const stableContainer = document.createElement('div');
        stableContainer.className = 'stable-biome-structure';
        stableContainer.style.cssText = `
            width: 100%;
            min-width: 100%;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;
        `;
        
        // Aktualisiere UI
        categoriesCount.textContent = `${categories.length} Kategorien`;
        categoriesList.innerHTML = '';
        categoriesList.appendChild(stableContainer);
        
        if (categories.length === 0) {
            await this.displayFallbackBiomes(currentLayer, stableContainer, categoriesCount);
            return;
        }
        
        await this.displayCategories(categories, stableContainer);
    }
    
    async updateExistingStructure(currentLayer, existingStructure) {
        console.log('[BiomeUI] Updating existing structure for layer:', currentLayer);
        
        // Aktualisiere nur den Inhalt, nicht die Struktur
        const categoryItems = existingStructure.querySelectorAll('.biome-category-item');
        
        for (const item of categoryItems) {
            const categoryName = item.getAttribute('data-category-name');
            const categoryType = item.getAttribute('data-category-type');
            
            // Prüfe ob das Item für den aktuellen Layer sichtbar sein soll
            const shouldBeVisible = this.shouldCategoryBeVisible(categoryName, categoryType, currentLayer);
            item.style.display = shouldBeVisible ? 'flex' : 'none';
            
            if (shouldBeVisible) {
                // Aktualisiere Tiles für sichtbare Kategorien
                const tilesContainer = item.querySelector('.biome-tiles-container');
                if (tilesContainer) {
                    await this.refreshTilesForCategory(categoryName, tilesContainer);
                }
            }
        }
    }
    
    shouldCategoryBeVisible(categoryName, categoryType, currentLayer) {
        if (currentLayer === 'streets') {
            return categoryType === 'entities' || categoryName === 'Buildings';
        } else if (currentLayer === 'terrain') {
            return categoryType === 'biome' && categoryName !== 'Buildings';
        }
        return true;
    }
    
    async refreshTilesForCategory(categoryName, tilesContainer) {
        console.log('[BiomeUI] Refreshing tiles for category:', categoryName);
        
        // Lade aktuelle Tiles
        let tiles = [];
        if (this.biomeData) {
            tiles = await this.biomeData.loadTilesForCategory(categoryName);
        }
        
        // Aktualisiere nur die Tiles, nicht die Container-Struktur
        const tileElements = tilesContainer.querySelectorAll('.tile-element');
        tileElements.forEach((element, index) => {
            if (tiles[index]) {
                const tile = tiles[index];
                element.title = tile.name;
                
                // Aktualisiere Bild falls vorhanden
                const img = element.querySelector('img');
                if (img && tile.image) {
                    img.src = this.correctImagePath(tile.image);
                }
            }
        });
    }
    
    correctImagePath(imagePath) {
        // Korrigiere den Bildpfad
        if (imagePath.startsWith('assets/')) {
            return '/' + imagePath;
        } else if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
            // Spezielle Behandlung für Buildings tiles
            if (imagePath.includes('slice_') || imagePath.includes('tile_')) {
                return '/assets/biomes/Buildings/tiles/' + imagePath;
            }
            // Für andere Tiles, verwende den Standard-Pfad basierend auf dem Tile-Typ
            if (imagePath.includes('forest') || imagePath.includes('Forest')) {
                return '/assets/biomes/Forest/tiles/' + imagePath;
            } else if (imagePath.includes('mountain') || imagePath.includes('Mountain')) {
                return '/assets/biomes/Mountains/tiles/' + imagePath;
            } else if (imagePath.includes('desert')) {
                return '/assets/biomes/Desert/tiles/' + imagePath;
            } else if (imagePath.includes('water')) {
                return '/assets/biomes/Water/tiles/' + imagePath;
            } else if (imagePath.includes('Slice ')) {
                return '/assets/biomes/Unassigned/tiles/' + imagePath;
            }
            // Standard: Buildings für unbekannte Tiles
            return '/assets/biomes/Buildings/tiles/' + imagePath;
        }
        return imagePath;
    }
    
    // Fehlende displayTileEditorTiles Funktion
    displayBuildingsTiles(tiles, container) {
        console.log('[BiomeUI] Displaying buildings tiles:', tiles.length, 'tiles');
        
        if (!container) {
            console.warn('[BiomeUI] Container not provided for tile editor tiles');
            return;
        }
        
        // Lösche vorhandene Tiles
        container.innerHTML = '';
        
        tiles.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile-editor-tile-item';
            tileElement.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                min-height: 32px;
            `;
            
            // Korrigiere den Bildpfad
            const correctedImagePath = this.correctImagePath(tile.image);
            
            tileElement.innerHTML = `
                <img src="${correctedImagePath}" alt="${tile.name}" style="width: 24px; height: 24px; object-fit: contain;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; console.log('[BiomeUI] Image failed to load:', '${correctedImagePath}');"
                     onload="this.style.display='block'; this.nextElementSibling.style.display='none'; console.log('[BiomeUI] Image loaded successfully:', '${correctedImagePath}');">
                <div class="tile-fallback" style="display: none; width: 24px; height: 24px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #ccc;">🏢</div>
                <div style="font-size: 10px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tile.name}</div>
            `;
            
            tileElement.addEventListener('click', () => {
                this.selectTileForPainting(tile);
            });
            
            tileElement.addEventListener('mouseenter', () => {
                tileElement.style.background = 'rgba(255, 255, 255, 0.2)';
                tileElement.style.transform = 'scale(1.02)';
            });
            
            tileElement.addEventListener('mouseleave', () => {
                tileElement.style.background = 'rgba(255, 255, 255, 0.1)';
                tileElement.style.transform = 'scale(1)';
            });
            
            container.appendChild(tileElement);
        });
        
        console.log('[BiomeUI] Tile editor tiles displayed');
    }

    // Module-Referenz setzen
    setBiomeData(biomeData) {
        this.biomeData = biomeData;
    }
    
    // Sortierungsfunktionen
    setupSortButtons() {
        console.log('[BiomeUI] Setting up sort buttons...');
        
        const sortByNameBtn = document.getElementById('sortBiomesByName');
        const sortByTypeBtn = document.getElementById('sortBiomesByType');
        const sortByColorBtn = document.getElementById('sortBiomesByColor');
        
        if (sortByNameBtn) {
            sortByNameBtn.addEventListener('click', () => {
                console.log('[BiomeUI] Sort by name clicked');
                this.sortBiomes('name');
            });
        }
        
        if (sortByTypeBtn) {
            sortByTypeBtn.addEventListener('click', () => {
                console.log('[BiomeUI] Sort by type clicked');
                this.sortBiomes('type');
            });
        }
        
        if (sortByColorBtn) {
            sortByColorBtn.addEventListener('click', () => {
                console.log('[BiomeUI] Sort by color clicked');
                this.sortBiomes('color');
            });
        }
        
        console.log('[BiomeUI] Sort buttons setup complete:', {
            name: !!sortByNameBtn,
            type: !!sortByTypeBtn,
            color: !!sortByColorBtn
        });
    }
    
    sortBiomes(sortBy) {
        console.log('[BiomeUI] Sorting biomes by:', sortBy);
        
        // Aktualisiere aktiven Button
        this.updateActiveSortButton(sortBy);
        
        // Hole aktuelle Kategorien
        const categoriesList = document.getElementById('biome-categories-list');
        if (!categoriesList) {
            console.error('[BiomeUI] Categories list not found');
            return;
        }
        
        const categoryElements = categoriesList.querySelectorAll('.biome-category-item');
        if (categoryElements.length === 0) {
            console.error('[BiomeUI] No category elements found');
            return;
        }
        
        const categories = Array.from(categoryElements).map(element => {
            // Verwende die data-Attribute für die Sortierung
            const name = element.getAttribute('data-category-name') || '';
            const type = element.getAttribute('data-category-type') || '';
            
            // Für Farbe verwende die Farbe aus dem span-Element
            const colorSpan = element.querySelector('span[style*="color"]');
            const color = colorSpan ? colorSpan.style.color || '' : '';
            
            return {
                element: element,
                name: name,
                type: type,
                color: color
            };
        });
        
        console.log('[BiomeUI] Found categories for sorting:', categories.map(c => ({name: c.name, type: c.type, color: c.color})));
        
        // Sortiere Kategorien
        categories.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'color':
                    return a.color.localeCompare(b.color);
                default:
                    return 0;
            }
        });
        
        // Entferne alle Elemente
        categoryElements.forEach(element => element.remove());
        
        // Füge sortierte Elemente wieder hinzu
        categories.forEach(category => {
            categoriesList.appendChild(category.element);
        });
        
        console.log('[BiomeUI] Biomes sorted by:', sortBy);
    }
    
    updateActiveSortButton(sortBy) {
        // Entferne aktive Klasse von allen Sortierungsbuttons
        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(btn => btn.classList.remove('active'));
        
        // Füge aktive Klasse zum ausgewählten Button hinzu
        let activeButton = null;
        switch (sortBy) {
            case 'name':
                activeButton = document.getElementById('sortBiomesByName');
                break;
            case 'type':
                activeButton = document.getElementById('sortBiomesByType');
                break;
            case 'color':
                activeButton = document.getElementById('sortBiomesByColor');
                break;
        }
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    // Performance-Analyse System
    static performanceAnalysis = {
        enabled: false,
        timings: {},
        functionCalls: [],
        startTime: null
    };
    
    static startPerformanceAnalysis() {
        console.log('[Performance] Starting performance analysis for next refresh...');
        BiomeUI.performanceAnalysis.enabled = true;
        BiomeUI.performanceAnalysis.timings = {};
        BiomeUI.performanceAnalysis.functionCalls = [];
        BiomeUI.performanceAnalysis.startTime = performance.now();
        
        // Überschreibe console.log für Performance-Tracking
        const originalConsoleLog = console.log;
        console.log = function(...args) {
            const message = args.join(' ');
            if (message.includes('[BiomeUI]') && BiomeUI.performanceAnalysis.enabled) {
                BiomeUI.performanceAnalysis.functionCalls.push({
                    timestamp: performance.now(),
                    message: message,
                    function: BiomeUI.getCurrentFunctionName()
                });
            }
            originalConsoleLog.apply(console, args);
        };
        
        // Überschreibe wichtige Funktionen für Timing
        BiomeUI.wrapFunctionWithTiming('updateBiomeCategoriesList');
        BiomeUI.wrapFunctionWithTiming('createStableStructureSync');
        BiomeUI.wrapFunctionWithTiming('displayCategoriesSync');
        BiomeUI.wrapFunctionWithTiming('loadRealBiomeDataAsync');
        BiomeUI.wrapFunctionWithTiming('setupSortButtons');
        
        console.log('[Performance] Performance analysis enabled. Click refresh button to trigger analysis.');
    }
    
    static wrapFunctionWithTiming(functionName) {
        if (BiomeUI.prototype[functionName]) {
            const originalFunction = BiomeUI.prototype[functionName];
            BiomeUI.prototype[functionName] = function(...args) {
                const startTime = performance.now();
                const result = originalFunction.apply(this, args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (BiomeUI.performanceAnalysis.enabled) {
                    BiomeUI.performanceAnalysis.timings[functionName] = {
                        duration: duration,
                        startTime: startTime,
                        endTime: endTime,
                        timestamp: new Date().toISOString()
                    };
                    console.log(`[Performance] ${functionName} took ${duration.toFixed(2)}ms`);
                }
                
                return result;
            };
        }
    }
    
    static getCurrentFunctionName() {
        const stack = new Error().stack;
        const callerLine = stack.split('\n')[3];
        const match = callerLine.match(/at\s+(\w+)/);
        return match ? match[1] : 'unknown';
    }
    
    static getPerformanceReport() {
        if (!BiomeUI.performanceAnalysis.enabled) {
            return 'Performance analysis not enabled. Click the Performance button first.';
        }
        
        const totalTime = performance.now() - BiomeUI.performanceAnalysis.startTime;
        let report = `\n=== PERFORMANCE ANALYSIS REPORT ===\n`;
        report += `Total analysis time: ${totalTime.toFixed(2)}ms\n\n`;
        
        report += `=== FUNCTION TIMINGS ===\n`;
        Object.entries(BiomeUI.performanceAnalysis.timings).forEach(([functionName, timing]) => {
            report += `${functionName}: ${timing.duration.toFixed(2)}ms (${new Date(timing.timestamp).toLocaleTimeString()})\n`;
        });
        
        report += `\n=== FUNCTION CALLS ===\n`;
        BiomeUI.performanceAnalysis.functionCalls.forEach((call, index) => {
            const relativeTime = call.timestamp - BiomeUI.performanceAnalysis.startTime;
            report += `${index + 1}. [${relativeTime.toFixed(2)}ms] ${call.message}\n`;
        });
        
        report += `\n=== SUMMARY ===\n`;
        const totalFunctionTime = Object.values(BiomeUI.performanceAnalysis.timings)
            .reduce((sum, timing) => sum + timing.duration, 0);
        report += `Total function execution time: ${totalFunctionTime.toFixed(2)}ms\n`;
        report += `Number of function calls tracked: ${BiomeUI.performanceAnalysis.functionCalls.length}\n`;
        report += `Average function time: ${(totalFunctionTime / Object.keys(BiomeUI.performanceAnalysis.timings).length).toFixed(2)}ms\n`;
        
        return report;
    }
}

    // Globale Verfügbarkeit
    if (typeof window !== 'undefined') {
        window.BiomeUI = BiomeUI;
        
        // Performance-Analyse globale Funktion
        window.startPerformanceAnalysis = () => {
            BiomeUI.startPerformanceAnalysis();
        };
        
        window.getPerformanceReport = () => {
            const report = BiomeUI.getPerformanceReport();
            console.log(report);
            return report;
        };
        
        // Globale Debug-Funktionen
        window.debugBiomeTileDisplay = () => {
            console.log('[DEBUG] === GLOBALE BIOME TILE DISPLAY DEBUG ===');
            
            if (window.BiomeUI && window.BiomeUI.prototype) {
                // Finde eine bestehende BiomeUI-Instanz
                const biomeUIInstance = window.biomeUI || window.BiomeUIInstance;
                if (biomeUIInstance && biomeUIInstance.debugTileDisplay) {
                    return biomeUIInstance.debugTileDisplay();
                } else {
                    console.log('[DEBUG] BiomeUI instance not found, creating test instance...');
                    const testInstance = new window.BiomeUI({});
                    return testInstance.debugTileDisplay();
                }
            } else {
                console.error('[DEBUG] BiomeUI nicht verfügbar');
                return null;
            }
        };
    
    window.testTileLoading = async (category = 'building') => {
        console.log('[DEBUG] === TEST TILE LOADING ===');
        console.log('[DEBUG] Testing tile loading for category:', category);
        
        if (window.BiomeData && window.BiomeData.prototype) {
            const testInstance = new window.BiomeData({});
            
            console.log('[DEBUG] Testing loadTilesForCategory...');
            const categoryTiles = await testInstance.loadTilesForCategory(category);
            console.log('[DEBUG] Category tiles result:', categoryTiles?.length || 0);
            
            if (categoryTiles && categoryTiles.length > 0) {
                console.log('[DEBUG] Sample tile:', categoryTiles[0]);
                console.log('[DEBUG] Tile has image:', !!categoryTiles[0].image, 'image:', categoryTiles[0].image);
            }
            
            return { categoryTiles };
        } else {
            console.error('[DEBUG] BiomeData nicht verfügbar');
            return null;
        }
    };
    
    // Globale Funktion zum Aktualisieren der Biome-Liste
    window.updateBiomeListForLayer = (layerName) => {
        console.log('[BiomeUI] Global updateBiomeListForLayer called for layer:', layerName);
        if (window.biomeUI) {
            window.biomeUI.updateBiomeCategoriesList();
        } else {
            console.warn('[BiomeUI] Global biomeUI instance not available');
        }
    };
}
