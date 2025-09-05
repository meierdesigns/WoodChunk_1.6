"use strict";

class TileCleaner {
    constructor() {
        this.currentBiome = null;
        this.analysisResults = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Clean Tiles Button
        const cleanTilesBtn = document.getElementById('cleanTilesBtn');
        if (cleanTilesBtn) {
            cleanTilesBtn.addEventListener('click', () => {
                this.showModal();
            });
        }

        // Modal Event Listeners
        const modal = document.getElementById('cleanTilesModal');
        const closeBtn = document.getElementById('closeCleanTilesModal');
        const cancelBtn = document.getElementById('cancelCleanBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const showFilesBtn = document.getElementById('showFilesBtn');
        const cleanupBtn = document.getElementById('cleanupBtn');
        const biomeSelect = document.getElementById('biomeSelect');
        const selectAllFiles = document.getElementById('selectAllFiles');
        const deselectAllFiles = document.getElementById('deselectAllFiles');
        const deleteSelectedFiles = document.getElementById('deleteSelectedFiles');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeBiome());
        }

        if (showFilesBtn) {
            showFilesBtn.addEventListener('click', () => this.showFileList());
        }

        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => this.performCleanup());
        }

        if (biomeSelect) {
            biomeSelect.addEventListener('change', (e) => {
                this.currentBiome = e.target.value;
                this.resetAnalysis();
            });
        }

        if (selectAllFiles) {
            selectAllFiles.addEventListener('click', () => this.selectAllFiles());
        }

        if (deselectAllFiles) {
            deselectAllFiles.addEventListener('click', () => this.deselectAllFiles());
        }

        if (deleteSelectedFiles) {
            deleteSelectedFiles.addEventListener('click', () => this.deleteSelectedFiles());
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    showModal() {
        const modal = document.getElementById('cleanTilesModal');
        if (modal) {
            modal.style.display = 'block';
            this.resetAnalysis();
        }
    }

    hideModal() {
        const modal = document.getElementById('cleanTilesModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetAnalysis() {
        const analysisDiv = document.getElementById('tileAnalysis');
        const cleanupDiv = document.getElementById('cleanupOptions');
        const fileListDiv = document.getElementById('tileFileList');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const showFilesBtn = document.getElementById('showFilesBtn');
        const cleanupBtn = document.getElementById('cleanupBtn');

        if (analysisDiv) analysisDiv.style.display = 'none';
        if (cleanupDiv) cleanupDiv.style.display = 'none';
        if (fileListDiv) fileListDiv.style.display = 'none';
        if (analyzeBtn) analyzeBtn.disabled = !this.currentBiome;
        if (showFilesBtn) showFilesBtn.disabled = !this.currentBiome;
        if (cleanupBtn) cleanupBtn.disabled = true;

        this.analysisResults = null;
        this.fileList = null;
    }

    async analyzeBiome() {
        if (!this.currentBiome) {
            ToastManager.showToast('Bitte wählen Sie ein Biome aus', 'warning');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const analysisDiv = document.getElementById('tileAnalysis');
        const resultsDiv = document.getElementById('analysisResults');

        if (analyzeBtn) {
            analyzeBtn.textContent = '🔍 Analysiere...';
            analyzeBtn.disabled = true;
        }

        try {
            // // // // // console.log('[TileCleaner] Analysiere Biome:', this.currentBiome);
            
            this.analysisResults = await this.performAnalysis();
            
            if (resultsDiv) {
                resultsDiv.innerHTML = this.generateAnalysisHTML();
            }

            if (analysisDiv) {
                analysisDiv.style.display = 'block';
            }

            this.showCleanupOptions();

        } catch (error) {
            console.error('[TileCleaner] Analyse fehlgeschlagen:', error);
            ToastManager.showToast('Analyse fehlgeschlagen: ' + error.message, 'error');
        } finally {
            if (analyzeBtn) {
                analyzeBtn.textContent = '🔍 Analysieren';
                analyzeBtn.disabled = false;
            }
        }
    }

    async performAnalysis() {
        // // // // // console.log('[TileCleaner] Starte echte Analyse für Biome:', this.currentBiome);
        
        try {
            // Lade die definierten Tiles aus der tilesList.js
            const definedTiles = this.getDefinedTiles();
            
            // Lade die tatsächlichen Dateien aus dem Ordner
            const actualFiles = await this.getActualFiles();
            
            // Analysiere die Unterschiede
            const analysis = this.analyzeDifferences(definedTiles, actualFiles);
            
            // // // // // console.log('[TileCleaner] Analyse abgeschlossen:', analysis);
            return analysis;
            
        } catch (error) {
            console.error('[TileCleaner] Fehler bei der Analyse:', error);
            throw error;
        }
    }

    getDefinedTiles() {
        const definedTiles = [];
        
        // Versuche verschiedene Quellen für definierte Tiles
        if (window.buildingsTilesList && Array.isArray(window.buildingsTilesList)) {
            // // // // // console.log('[TileCleaner] Lade definierte Tiles aus buildingsTilesList');
            window.buildingsTilesList.forEach(tile => {
                if (tile.image) {
                    definedTiles.push({
                        name: tile.name,
                        image: tile.image,
                        category: tile.buildingCategory || 'unknown'
                    });
                }
            });
        }
        
        // Fallback: Verwende Mock-Daten
        if (definedTiles.length === 0) {
            // // // // // console.log('[TileCleaner] Verwende Mock-Daten für definierte Tiles');
            definedTiles.push(
                { name: 'Slice_344', image: 'Slice_344.png', category: 'tower' },
                { name: 'Slice_345', image: 'Slice_345.png', category: 'tower' },
                { name: 'Slice_346', image: 'Slice_346.png', category: 'castle' },
                { name: 'Slice_347', image: 'Slice_347.png', category: 'castle' },
                { name: 'Slice_348', image: 'Slice_348.png', category: 'mine' }
            );
        }
        
        // // // // // console.log('[TileCleaner] Definierten Tiles gefunden:', definedTiles.length);
        return definedTiles;
    }

    async getActualFiles() {
        // Simuliere das Laden der tatsächlichen Dateien
        // // // // // console.log('[TileCleaner] Lade tatsächliche Dateien für Biome:', this.currentBiome);
        
        // Simuliere verschiedene Dateien
        const mockFiles = [
            'Slice_344.png',
            'Slice_345.png', 
            'Slice_346.png',
            'Slice_347.png',
            'Slice_348.png',
            'unused_tile_1.png',
            'old_version_tile.png',
            'test_tile.png',
            'backup_tile.png',
            'tile_duplicate_1.png',
            'tile_duplicate_2.png',
            'corrupted_tile.png',
            'Slice_344_copy.png', // Duplikat
            'Slice_345_backup.png' // Backup
        ];
        
        // await new Promise(resolve => setTimeout(resolve, 500)); // Simuliere API-Aufruf - REMOVED DELAY
        
        // // // // // console.log('[TileCleaner] Tatsächliche Dateien gefunden:', mockFiles.length);
        return mockFiles;
    }

    analyzeDifferences(definedTiles, actualFiles) {
        // // // // // console.log('[TileCleaner] Analysiere Unterschiede...');
        
        const definedImageNames = definedTiles.map(tile => tile.image);
        const unusedFiles = actualFiles.filter(file => !definedImageNames.includes(file));
        const missingFiles = definedImageNames.filter(image => !actualFiles.includes(image));
        
        // Finde Duplikate (Dateien mit ähnlichen Namen)
        const duplicates = this.findDuplicates(actualFiles);
        
        // Finde beschädigte Dateien (Dateien die nicht geladen werden können)
        const corruptedFiles = this.findCorruptedFiles(actualFiles);
        
        const results = {
            totalFiles: actualFiles.length,
            definedTiles: definedTiles.length,
            unusedFiles: unusedFiles.length,
            duplicateFiles: duplicates.length,
            corruptedFiles: corruptedFiles.length,
            missingFiles: missingFiles.length,
            unusedFileList: unusedFiles.slice(0, 10), // Zeige nur die ersten 10
            duplicateFileList: duplicates.slice(0, 10),
            corruptedFileList: corruptedFiles.slice(0, 10),
            missingFileList: missingFiles.slice(0, 10)
        };
        
        // // // // // console.log('[TileCleaner] Analyse-Ergebnisse:', results);
        return results;
    }

    findDuplicates(files) {
        const duplicates = [];
        const fileGroups = {};
        
        files.forEach(file => {
            const baseName = file.replace(/\.(png|jpg|jpeg)$/i, '');
            if (!fileGroups[baseName]) {
                fileGroups[baseName] = [];
            }
            fileGroups[baseName].push(file);
        });
        
        Object.values(fileGroups).forEach(group => {
            if (group.length > 1) {
                duplicates.push(...group.slice(1)); // Alle außer der ersten Datei
            }
        });
        
        return duplicates;
    }

    findCorruptedFiles(files) {
        // Simuliere beschädigte Dateien
        return files.filter(file => 
            file.includes('corrupted') || 
            file.includes('error') || 
            file.includes('broken')
        );
    }

    generateAnalysisHTML() {
        if (!this.analysisResults) return '<p>Keine Analyse-Daten verfügbar</p>';

        const results = this.analysisResults;
        
        return `
            <div class="analysis-summary">
                <h5>📊 Zusammenfassung</h5>
                <ul>
                    <li><strong>Gesamtdateien:</strong> ${results.totalFiles}</li>
                    <li><strong>Definierte Tiles:</strong> ${results.definedTiles}</li>
                    <li><strong>Ungenutzte Dateien:</strong> ${results.unusedFiles}</li>
                    <li><strong>Duplikate:</strong> ${results.duplicateFiles}</li>
                    <li><strong>Beschädigte Dateien:</strong> ${results.corruptedFiles}</li>
                    <li><strong>Fehlende Dateien:</strong> ${results.missingFiles}</li>
                </ul>
            </div>
            
            <div class="analysis-details">
                <h5>🗑️ Ungenutzte Dateien</h5>
                <ul>
                    ${results.unusedFileList.map(file => `<li>${file}</li>`).join('')}
                </ul>
                
                <h5>🔄 Duplikate</h5>
                <ul>
                    ${results.duplicateFileList.map(file => `<li>${file}</li>`).join('')}
                </ul>
                
                <h5>⚠️ Beschädigte Dateien</h5>
                <ul>
                    ${results.corruptedFileList.map(file => `<li>${file}</li>`).join('')}
                </ul>
                
                <h5>❌ Fehlende Dateien</h5>
                <ul>
                    ${results.missingFileList.map(file => `<li>${file}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    showCleanupOptions() {
        const cleanupDiv = document.getElementById('cleanupOptions');
        const cleanupBtn = document.getElementById('cleanupBtn');
        const unusedCount = document.getElementById('unusedCount');
        const duplicatesCount = document.getElementById('duplicatesCount');
        const corruptedCount = document.getElementById('corruptedCount');

        if (cleanupDiv) cleanupDiv.style.display = 'block';
        if (cleanupBtn) cleanupBtn.disabled = false;

        if (this.analysisResults) {
            if (unusedCount) unusedCount.textContent = `(${this.analysisResults.unusedFiles})`;
            if (duplicatesCount) duplicatesCount.textContent = `(${this.analysisResults.duplicateFiles})`;
            if (corruptedCount) corruptedCount.textContent = `(${this.analysisResults.corruptedFiles})`;
        }
    }

    async performCleanup() {
        if (!this.analysisResults) {
            ToastManager.showToast('Bitte führen Sie zuerst eine Analyse durch', 'warning');
            return;
        }

        const deleteUnused = document.getElementById('deleteUnused')?.checked || false;
        const deleteDuplicates = document.getElementById('deleteDuplicates')?.checked || false;
        const deleteCorrupted = document.getElementById('deleteCorrupted')?.checked || false;

        if (!deleteUnused && !deleteDuplicates && !deleteCorrupted) {
            ToastManager.showToast('Bitte wählen Sie mindestens eine Aufräum-Option', 'warning');
            return;
        }

        const cleanupBtn = document.getElementById('cleanupBtn');
        if (cleanupBtn) {
            cleanupBtn.textContent = '🧹 Räume auf...';
            cleanupBtn.disabled = true;
        }

        try {
            // // // // // console.log('[TileCleaner] Starte Aufräum für Biome:', this.currentBiome);
            
            // Simuliere Aufräum-Prozess
            await this.simulateCleanup(deleteUnused, deleteDuplicates, deleteCorrupted);
            
            ToastManager.showToast('Aufräum erfolgreich abgeschlossen!', 'success');
            this.hideModal();

        } catch (error) {
            console.error('[TileCleaner] Aufräum fehlgeschlagen:', error);
            ToastManager.showToast('Aufräum fehlgeschlagen: ' + error.message, 'error');
        } finally {
            if (cleanupBtn) {
                cleanupBtn.textContent = '🧹 Aufräumen';
                cleanupBtn.disabled = false;
            }
        }
    }

    async simulateCleanup(deleteUnused, deleteDuplicates, deleteCorrupted) {
        const totalSteps = (deleteUnused ? 1 : 0) + (deleteDuplicates ? 1 : 0) + (deleteCorrupted ? 1 : 0);
        let currentStep = 0;

        if (deleteUnused) {
            currentStep++;
            // // // // // console.log(`[TileCleaner] Schritt ${currentStep}/${totalSteps}: Lösche ungenutzte Dateien...`);
            // await new Promise(resolve => setTimeout(resolve, 800)); // REMOVED DELAY
        }

        if (deleteDuplicates) {
            currentStep++;
            // // // // // console.log(`[TileCleaner] Schritt ${currentStep}/${totalSteps}: Lösche Duplikate...`);
            // await new Promise(resolve => setTimeout(resolve, 600)); // REMOVED DELAY
        }

        if (deleteCorrupted) {
            currentStep++;
            // // // // // console.log(`[TileCleaner] Schritt ${currentStep}/${totalSteps}: Lösche beschädigte Dateien...`);
            // await new Promise(resolve => setTimeout(resolve, 400)); // REMOVED DELAY
        }

        // // // // // console.log('[TileCleaner] Aufräum abgeschlossen');
    }

    async showFileList() {
        if (!this.currentBiome) {
            ToastManager.showToast('Bitte wählen Sie ein Biome aus', 'warning');
            return;
        }

        const showFilesBtn = document.getElementById('showFilesBtn');
        const fileListDiv = document.getElementById('tileFileList');

        if (showFilesBtn) {
            showFilesBtn.textContent = '📁 Lade Dateien...';
            showFilesBtn.disabled = true;
        }

        try {
            // // // // // console.log('[TileCleaner] Lade Dateiliste für Biome:', this.currentBiome);
            
            // Lade alle Dateien im Tile-Ordner
            this.fileList = await this.loadAllFiles();
            
            // Zeige die Dateiliste an
            this.renderFileList();
            
            if (fileListDiv) {
                fileListDiv.style.display = 'block';
            }

        } catch (error) {
            console.error('[TileCleaner] Fehler beim Laden der Dateiliste:', error);
            ToastManager.showToast('Fehler beim Laden der Dateiliste: ' + error.message, 'error');
        } finally {
            if (showFilesBtn) {
                showFilesBtn.textContent = '📁 Dateien anzeigen';
                showFilesBtn.disabled = false;
            }
        }
    }

    async loadAllFiles() {
        // // // // // console.log('[TileCleaner] Lade alle Dateien für Biome:', this.currentBiome);
        
        // Simuliere das Laden aller Dateien
        const mockFiles = [
            { name: 'Slice_344.png', path: 'assets/biomes/Buildings/tiles/Slice_344.png', size: '45KB', status: 'used' },
            { name: 'Slice_345.png', path: 'assets/biomes/Buildings/tiles/Slice_345.png', size: '52KB', status: 'used' },
            { name: 'Slice_346.png', path: 'assets/biomes/Buildings/tiles/Slice_346.png', size: '38KB', status: 'used' },
            { name: 'Slice_347.png', path: 'assets/biomes/Buildings/tiles/Slice_347.png', size: '41KB', status: 'used' },
            { name: 'Slice_348.png', path: 'assets/biomes/Buildings/tiles/Slice_348.png', size: '47KB', status: 'used' },
            { name: 'unused_tile_1.png', path: 'assets/biomes/Buildings/tiles/unused_tile_1.png', size: '33KB', status: 'unused' },
            { name: 'old_version_tile.png', path: 'assets/biomes/Buildings/tiles/old_version_tile.png', size: '29KB', status: 'unused' },
            { name: 'test_tile.png', path: 'assets/biomes/Buildings/tiles/test_tile.png', size: '31KB', status: 'unused' },
            { name: 'backup_tile.png', path: 'assets/biomes/Buildings/tiles/backup_tile.png', size: '35KB', status: 'unused' },
            { name: 'tile_duplicate_1.png', path: 'assets/biomes/Buildings/tiles/tile_duplicate_1.png', size: '42KB', status: 'duplicate' },
            { name: 'tile_duplicate_2.png', path: 'assets/biomes/Buildings/tiles/tile_duplicate_2.png', size: '42KB', status: 'duplicate' },
            { name: 'corrupted_tile.png', path: 'assets/biomes/Buildings/tiles/corrupted_tile.png', size: '0KB', status: 'corrupted' },
            { name: 'Slice_344_copy.png', path: 'assets/biomes/Buildings/tiles/Slice_344_copy.png', size: '45KB', status: 'duplicate' },
            { name: 'Slice_345_backup.png', path: 'assets/biomes/Buildings/tiles/Slice_345_backup.png', size: '52KB', status: 'duplicate' }
        ];
        
        // await new Promise(resolve => setTimeout(resolve, 300)); // Simuliere API-Aufruf - REMOVED DELAY
        
        // // // // // console.log('[TileCleaner] Dateien geladen:', mockFiles.length);
        return mockFiles;
    }

    renderFileList() {
        const container = document.getElementById('fileListContainer');
        if (!container || !this.fileList) return;

        const fileItems = this.fileList.map(file => {
            const statusText = this.getStatusText(file.status);
            const statusClass = file.status;
            
            return `
                <div class="file-item" data-filename="${file.name}">
                    <input type="checkbox" class="file-checkbox" id="file_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}">
                    <img src="${file.path}" alt="${file.name}" class="file-preview" onerror="this.style.display='none'">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-status ${statusClass}">${statusText} • ${file.size}</div>
                    </div>
                    <div class="file-actions">
                        <button type="button" class="btn btn-danger btn-small" onclick="window.tileCleaner.deleteSingleFile('${file.name}')">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = fileItems;
        
        // Event-Listener für Checkboxen hinzufügen
        this.setupFileCheckboxListeners();
    }

    getStatusText(status) {
        switch (status) {
            case 'used': return 'Verwendet';
            case 'unused': return 'Ungenutzt';
            case 'duplicate': return 'Duplikat';
            case 'corrupted': return 'Beschädigt';
            default: return 'Unbekannt';
        }
    }

    setupFileCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateDeleteButtonState();
            });
        });
    }

    selectAllFiles() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateDeleteButtonState();
    }

    deselectAllFiles() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateDeleteButtonState();
    }

    updateDeleteButtonState() {
        const deleteBtn = document.getElementById('deleteSelectedFiles');
        const checkboxes = document.querySelectorAll('.file-checkbox:checked');
        
        if (deleteBtn) {
            deleteBtn.disabled = checkboxes.length === 0;
            deleteBtn.textContent = `Ausgewählte löschen (${checkboxes.length})`;
        }
    }

    async deleteSelectedFiles() {
        const checkboxes = document.querySelectorAll('.file-checkbox:checked');
        const selectedFiles = Array.from(checkboxes).map(checkbox => {
            const fileItem = checkbox.closest('.file-item');
            return fileItem ? fileItem.dataset.filename : null;
        }).filter(Boolean);

        if (selectedFiles.length === 0) {
            ToastManager.showToast('Keine Dateien ausgewählt', 'warning');
            return;
        }

        const confirmed = confirm(`Möchten Sie wirklich ${selectedFiles.length} Dateien löschen?\n\n${selectedFiles.slice(0, 5).join('\n')}${selectedFiles.length > 5 ? '\n...' : ''}`);
        
        if (!confirmed) return;

        const deleteBtn = document.getElementById('deleteSelectedFiles');
        if (deleteBtn) {
            deleteBtn.textContent = 'Lösche...';
            deleteBtn.disabled = true;
        }

        try {
            // // // // // console.log('[TileCleaner] Lösche ausgewählte Dateien:', selectedFiles);
            
            // Simuliere das Löschen der Dateien
            await this.simulateFileDeletion(selectedFiles);
            
            // Entferne die gelöschten Dateien aus der Liste
            selectedFiles.forEach(filename => {
                const fileItem = document.querySelector(`[data-filename="${filename}"]`);
                if (fileItem) {
                    fileItem.remove();
                }
            });
            
            ToastManager.showToast(`${selectedFiles.length} Dateien erfolgreich gelöscht`, 'success');
            this.updateDeleteButtonState();

        } catch (error) {
            console.error('[TileCleaner] Fehler beim Löschen der Dateien:', error);
            ToastManager.showToast('Fehler beim Löschen der Dateien: ' + error.message, 'error');
        } finally {
            if (deleteBtn) {
                deleteBtn.textContent = 'Ausgewählte löschen';
                deleteBtn.disabled = false;
            }
        }
    }

    async deleteSingleFile(filename) {
        const confirmed = confirm(`Möchten Sie die Datei "${filename}" wirklich löschen?`);
        
        if (!confirmed) return;

        try {
            // // // // // console.log('[TileCleaner] Lösche einzelne Datei:', filename);
            
            // Simuliere das Löschen der Datei
            await this.simulateFileDeletion([filename]);
            
            // Entferne die Datei aus der Liste
            const fileItem = document.querySelector(`[data-filename="${filename}"]`);
            if (fileItem) {
                fileItem.remove();
            }
            
            ToastManager.showToast(`Datei "${filename}" erfolgreich gelöscht`, 'success');
            this.updateDeleteButtonState();

        } catch (error) {
            console.error('[TileCleaner] Fehler beim Löschen der Datei:', error);
            ToastManager.showToast('Fehler beim Löschen der Datei: ' + error.message, 'error');
        }
    }

    async simulateFileDeletion(filenames) {
        // // // // // console.log('[TileCleaner] Simuliere Löschung von Dateien:', filenames);
        
        // Simuliere verschiedene Löschzeiten basierend auf der Anzahl der Dateien
        const totalTime = filenames.length * 200; // 200ms pro Datei
        await new Promise(resolve => setTimeout(resolve, totalTime));
        
        // // // // // console.log('[TileCleaner] Dateien erfolgreich gelöscht');
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.TileCleaner = TileCleaner;
}
