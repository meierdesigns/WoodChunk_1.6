"use strict";

// Entferne ES6-Imports und verwende globale Klassen
// import { BiomeCore } from './BiomeCore.js';
// import { BiomeUI } from './BiomeUI.js';
// import { BiomeData } from './BiomeData.js';

class BiomeModule {
    constructor(core) {
        this.core = core;
        
        // Erstelle die Sub-Module
        this.biomeCore = new BiomeCore(core);
        this.biomeUI = new BiomeUI(core);
        this.biomeData = new BiomeData(core);
        
        // Verknüpfe die Module untereinander
        this.biomeCore.biomeUI = this.biomeUI;
        this.biomeCore.biomeData = this.biomeData;
        this.biomeUI.biomeData = this.biomeData;
        this.biomeData.biomeUI = this.biomeUI;
        
        // Registriere das BiomeModule im Core
        this.core.biomeModule = this;
        
        // Mache BiomeUI global verfügbar
        window.biomeUI = this.biomeUI;
        window.biomeData = this.biomeData;
        window.biomeCore = this.biomeCore;
    }

    setupBiomeModule() {
        // console.log('[BiomeModule] Setting up Biome module...');
        
        // Prüfe ob das neue BiomeTileSelector bereits existiert
        if (window.biomeTileSelector) {
            // console.log('[BiomeModule] BiomeTileSelector already exists, skipping old biome setup');
            return;
        }
        
        this.biomeCore.setupBiomeModule();
    }

    // Delegate methods to appropriate modules
    updateBiomeCategoriesList() {
        return this.biomeUI.updateBiomeCategoriesList();
    }

    displayBuildingsTiles(tiles, container) {
        return this.biomeUI.displayBuildingsTiles(tiles, container);
    }

    loadBiomeDataFromBuildingsTilesList() {
        return this.biomeData.loadBiomeDataFromBuildingsTilesList();
    }

    async loadBiomeOptionsForHexTiles(select) {
        return await this.biomeData.loadBiomeOptionsForHexTiles(select);
    }

    async loadTilesForBiomeAndDisplay(biome, biomeItem, shouldExpand = false) {
        return await this.biomeData.loadTilesForBiomeAndDisplay(biome, biomeItem, shouldExpand);
    }

    loadBuildingsTilesForDisplay(category, categoryItem) {
        return this.biomeData.loadBuildingsTilesForDisplay(category, categoryItem);
    }

    selectBiomeForPainting(biome) {
        return this.biomeCore.selectBiomeForPainting(biome);
    }

    selectTileForPainting(tile) {
        return this.biomeCore.selectTileForPainting(tile);
    }

    updateBiomeSelection(selectedBiome) {
        return this.biomeCore.updateBiomeSelection(selectedBiome);
    }

    async refreshBiomeOptions() {
        return await this.biomeCore.refreshBiomeOptions();
    }

    validateBiomes() {
        return this.biomeCore.validateBiomes();
    }

    getMockTilesForBiome(biomeName) {
        return this.biomeUI.getMockTilesForBiome(biomeName);
    }

    getCategoryEmoji(category) {
        return this.biomeUI.getCategoryEmoji(category);
    }

    getCategoryDisplayName(category) {
        return this.biomeUI.getCategoryDisplayName(category);
    }

    getTileTypeEmoji(tile) {
        return this.biomeUI.getTileTypeEmoji(tile);
    }

    editCategory(category) {
        return this.biomeUI.editCategory(category);
    }

    deleteCategory(category) {
        return this.biomeUI.deleteCategory(category);
    }

    openAddCategoryModal() {
        return this.biomeCore.openAddCategoryModal();
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.BiomeModule = BiomeModule;
}
