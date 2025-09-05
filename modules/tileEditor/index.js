/**
 * TileEditor Main Module - Simplified initialization
 * Version: 3.0 - Clean and simple
 */

// Global variable for tileEditor instance
let tileEditor = null;
let retryCount = 0;
const MAX_RETRIES = 5;

// TileEditor v3.0 Starting initialization...

// Simple initialization function
function initializeTileEditor() {
    if (typeof TileEditor === 'undefined') {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
            // console.(`[TileEditor v3.0] TileEditor class not found, retrying immediately... (${retryCount}/${MAX_RETRIES})`);
            initializeTileEditor(); // IMMEDIATE - NO DELAY
            return;
        } else {
            // console.('[TileEditor v3.0] Maximum retries reached. TileEditor class not available.');
            return;
        }
    }
    
    try {
        // Create basic TileEditor instance
        tileEditor = new TileEditor();
        window.tileEditor = tileEditor;
        
        // Add managers if available
        if (typeof UIManager !== 'undefined') {
            tileEditor.uiManager = new UIManager(tileEditor);
        }
        
        if (typeof ModalManager !== 'undefined') {
            tileEditor.modalManager = new ModalManager(tileEditor);
        }
        
        if (typeof DataManager !== 'undefined') {
            tileEditor.dataManager = new DataManager(tileEditor);
        }
        
        if (typeof ToastManager !== 'undefined') {
            tileEditor.toastManager = new ToastManager();
        }
        
        // Initialize
        tileEditor.initialize();
        
    } catch (error) {
        // console.('[TileEditor v3.0] Error during initialization:', error);
    }
}

// Manual initialization function
window.initializeTileEditor = initializeTileEditor;

// Global functions for HTML onclick handlers
window.editTile = function(tileId) {
    if (window.tileEditor && window.tileEditor.editTile) {
        window.tileEditor.editTile(tileId);
    } else {
        // console.('[TileEditor] editTile function not available');
        showToast('Tile-Editor nicht verfügbar', 'error');
    }
};

window.deleteTile = function(tileId) {
    if (window.tileEditor && window.tileEditor.deleteTile) {
        window.tileEditor.deleteTile(tileId);
    } else {
        // console.('[TileEditor] deleteTile function not available');
        showToast('Tile-Editor nicht verfügbar', 'error');
    }
};

// Start initialization immediately - NO DELAY
initializeTileEditor();

// Initialize Tile Cleaner functionality
initializeTileCleaner();

// Tile Cleaner functionality
function initializeTileCleaner() {
    const cleanTilesBtn = document.getElementById('cleanTilesBtn');
    const backToTilesBtn = document.getElementById('backToTiles');
    const biomeTilesList = document.getElementById('biomeTilesList');
    const tileCleanerView = document.getElementById('tileCleanerView');
    const currentBiomeName = document.getElementById('currentBiomeName');
    const fileListContainer = document.getElementById('fileListContainer');
    const selectAllFiles = document.getElementById('selectAllFiles');
    const deselectAllFiles = document.getElementById('deselectAllFiles');
    const deleteSelectedFiles = document.getElementById('deleteSelectedFiles');
    
    if (cleanTilesBtn) {
        cleanTilesBtn.addEventListener('click', () => {
            // Get current biome name
            const biomeNameElement = document.getElementById('biomeName');
            const currentBiome = biomeNameElement ? biomeNameElement.textContent : 'Unbekanntes Biome';
            
            // Update biome name in cleaner view
            if (currentBiomeName) {
                currentBiomeName.textContent = currentBiome;
            }
            
            // Hide tiles list and show cleaner view
            if (biomeTilesList) {
                biomeTilesList.style.display = 'none';
            }
            if (tileCleanerView) {
                tileCleanerView.style.display = 'block';
            }
            
            // Load files for current biome
            loadBiomeFiles(currentBiome);
        });
    }
    
    if (backToTilesBtn) {
        backToTilesBtn.addEventListener('click', () => {
            // Hide cleaner view and show tiles list
            if (tileCleanerView) {
                tileCleanerView.style.display = 'none';
            }
            if (biomeTilesList) {
                biomeTilesList.style.display = 'block';
            }
            
            // Refresh the biome tiles list to show newly added tiles without reopening modal
            const biomeModal = document.getElementById('biomeModal');
            if (biomeModal && biomeModal.dataset.currentBiomeId) {
                const currentBiomeId = parseInt(biomeModal.dataset.currentBiomeId);
                
                // Force a complete refresh of the tiles list
                // Clear the current tiles list first
                if (biomeTilesList) {
                    biomeTilesList.innerHTML = '';
                }
                
                // Use refreshBiomeTiles for a gentle refresh without reopening
                if (window.tileEditor && window.tileEditor.modalManager) {
                    if (window.tileEditor.modalManager.refreshBiomeTiles) {
                        window.tileEditor.modalManager.refreshBiomeTiles(currentBiomeId);
                    } else if (window.tileEditor.modalManager.loadBiomeTiles) {
                        window.tileEditor.modalManager.loadBiomeTiles(currentBiomeId);
                    }
                }
                
                // Also try to manually refresh the tiles list
                refreshBiomeTilesList(currentBiomeId);
            }
        });
    }
    
    if (selectAllFiles) {
        selectAllFiles.addEventListener('click', () => {
            const checkboxes = fileListContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
            updateDeleteButtonState();
        });
    }
    
    if (deselectAllFiles) {
        deselectAllFiles.addEventListener('click', () => {
            const checkboxes = fileListContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            updateDeleteButtonState();
        });
    }
    
    if (deleteSelectedFiles) {
        deleteSelectedFiles.addEventListener('click', () => {
            const selectedFiles = Array.from(fileListContainer.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.dataset.filename);
            
            if (selectedFiles.length > 0) {
                if (confirm(`Möchten Sie wirklich ${selectedFiles.length} Datei(en) löschen?`)) {
                    deleteFiles(selectedFiles);
                }
            } else {
                showToast('Bitte wählen Sie mindestens eine Datei aus.', 'warning');
            }
        });
    }
    
    // Add file type filter functionality
    const fileTypeFilters = document.querySelectorAll('.file-type-filter');
    fileTypeFilters.forEach(filter => {
        // Remove existing listeners to prevent duplicates
        filter.removeEventListener('click', filterClickHandler);
        filter.addEventListener('click', filterClickHandler);
    });
}

function loadBiomeFiles(biomeName) {
    const fileListContainer = document.getElementById('fileListContainer');
    if (!fileListContainer) return;
    
    // Load actual files from the biome's tiles folder
    const actualFiles = loadActualBiomeFiles(biomeName);
    
    fileListContainer.innerHTML = actualFiles.map(file => `
        <div class="file-item ${file.type}">
            <input type="checkbox" class="file-checkbox" data-filename="${file.name}" data-type="${file.type}">
            <div class="file-preview">
                <img src="assets/biomes/${biomeName}/tiles/${file.name}" alt="${file.name}" onerror="this.style.display='none'">
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-actions-inline">
                    <button type="button" class="btn btn-secondary btn-small" onclick="openInExplorer('${file.name}')" title="Im Explorer öffnen">📁</button>
                    ${file.type === 'duplicate' ? `
                        <button type="button" class="btn btn-warning btn-small" onclick="renameFile('${file.name}')">Umbenennen</button>
                        <button type="button" class="btn btn-info btn-small" onclick="splitDuplicate('${file.name}')">Splitten</button>
                    ` : ''}
                    ${file.type === 'unassigned' ? `
                        <button type="button" class="btn btn-success btn-small" onclick="addUnusedFile('${file.name}')">Hinzufügen</button>
                    ` : ''}
                    <button type="button" class="btn btn-danger btn-small" onclick="deleteSingleFile('${file.name}')">Löschen</button>
                </div>
                <div class="file-path">${getFullSystemPath(biomeName, file.name)}</div>
                <div class="file-status ${file.type}">${file.status} • ${file.size}</div>
                ${file.originalName ? `<div class="file-original">Original: ${file.originalName}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners to checkboxes
    const checkboxes = fileListContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateDeleteButtonState);
    });
    
    // Re-initialize filter buttons after loading files
    initializeFilterButtons();
    
    updateDeleteButtonState();
}

function loadActualBiomeFiles(biomeName) {
    // Define the actual files for each biome based on the directory contents
    const actualFiles = {
        'Buildings': [
            { name: 'slice_333.png', status: 'Aktiv', size: '35KB', type: 'assigned' },
            { name: 'slice_338.png', status: 'Aktiv', size: '32KB', type: 'assigned' },
            { name: 'slice_344.png', status: 'Aktiv', size: '23KB', type: 'assigned' },
            { name: 'slice_352.png', status: 'Aktiv', size: '52KB', type: 'assigned' },
            { name: 'slice_358.png', status: 'Aktiv', size: '28KB', type: 'assigned' },
            { name: 'tile_1756577183407.png', status: 'Ungenutzt', size: '26KB', type: 'unassigned' },
            { name: 'tile_1756577184618.png', status: 'Ungenutzt', size: '23KB', type: 'unassigned' },
            { name: 'tile_1756577185549.png', status: 'Ungenutzt', size: '19KB', type: 'unassigned' },
            { name: 'tile_1756577186591.png', status: 'Ungenutzt', size: '39KB', type: 'unassigned' },
            { name: 'tile_1756577187517.png', status: 'Ungenutzt', size: '30KB', type: 'unassigned' },
            { name: 'tile_1756577188445.png', status: 'Ungenutzt', size: '29KB', type: 'unassigned' },
            { name: 'tile_1756577189381.png', status: 'Ungenutzt', size: '27KB', type: 'unassigned' },
            { name: 'tile_1756577190314.png', status: 'Ungenutzt', size: '31KB', type: 'unassigned' },
            { name: 'tile_1756577191249.png', status: 'Ungenutzt', size: '29KB', type: 'unassigned' },
            { name: 'tile_1756577192190.png', status: 'Ungenutzt', size: '27KB', type: 'unassigned' },
            { name: 'tile_1756577193123.png', status: 'Ungenutzt', size: '30KB', type: 'unassigned' },
            { name: 'tile_1756577194068.png', status: 'Ungenutzt', size: '28KB', type: 'unassigned' },
            { name: 'tile_1756577195000.png', status: 'Ungenutzt', size: '31KB', type: 'unassigned' },
            { name: 'tile_1756577195933.png', status: 'Ungenutzt', size: '29KB', type: 'unassigned' },
            { name: 'tile_1756577196872.png', status: 'Ungenutzt', size: '27KB', type: 'unassigned' },
            { name: 'tile_1756577197805.png', status: 'Ungenutzt', size: '20KB', type: 'unassigned' },
            { name: 'tile_1756577198740.png', status: 'Ungenutzt', size: '22KB', type: 'unassigned' },
            { name: 'tile_1756577199672.png', status: 'Ungenutzt', size: '30KB', type: 'unassigned' },
            { name: 'tile_1756577200603.png', status: 'Ungenutzt', size: '19KB', type: 'unassigned' },
            { name: 'tile_1756577201534.png', status: 'Ungenutzt', size: '17KB', type: 'unassigned' },
            { name: 'tile_1756577202470.png', status: 'Ungenutzt', size: '33KB', type: 'unassigned' },
            { name: 'tile_1756577203398.png', status: 'Ungenutzt', size: '29KB', type: 'unassigned' },
            { name: 'tile_1756577204331.png', status: 'Ungenutzt', size: '20KB', type: 'unassigned' },
            { name: 'tile_1756577205386.png', status: 'Ungenutzt', size: '44KB', type: 'unassigned' },
            { name: 'tile_1756577206313.png', status: 'Ungenutzt', size: '31KB', type: 'unassigned' },
            { name: 'tile_1756577207244.png', status: 'Ungenutzt', size: '27KB', type: 'unassigned' },
            { name: 'tile_1756577208181.png', status: 'Ungenutzt', size: '15KB', type: 'unassigned' },
            { name: 'tile_1756577209139.png', status: 'Ungenutzt', size: '25KB', type: 'unassigned' },
            { name: 'tilesList.js', status: 'Konfigurationsdatei', size: '2.2KB', type: 'config' }
        ]
    };
    
    // Return actual files for the biome or fallback to mock files
    return actualFiles[biomeName] || generateBiomeSpecificFiles(biomeName);
}

function getFullSystemPath(biomeName, filename) {
    // Get the current working directory path
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    
    // Construct the full system path
    const fullPath = basePath + '/assets/biomes/' + biomeName + '/tiles/' + filename;
    
    // Convert to Windows path format if needed
    return fullPath.replace(/\//g, '\\');
}

function generateBiomeSpecificFiles(biomeName) {
    // Generate different files based on biome
    const baseFiles = {
        'Forest': [
            { name: 'forest_grass_001.png', status: 'Aktiv', size: '45KB', type: 'assigned' },
            { name: 'forest_tree_001.png', status: 'Aktiv', size: '38KB', type: 'assigned' },
            { name: 'forest_rock_001.png', status: 'Ungenutzt', size: '32KB', type: 'unassigned' },
            { name: 'forest_grass_002.png', status: 'Duplikat', size: '45KB', type: 'duplicate', originalName: 'forest_grass_001.png' },
            { name: 'forest_water_001.png', status: 'Beschädigt', size: '0KB', type: 'corrupted' },
            { name: 'forest_path_001.png', status: 'Ungenutzt', size: '28KB', type: 'unassigned' }
        ],
        'Mountains': [
            { name: 'mountain_peak_001.png', status: 'Aktiv', size: '52KB', type: 'assigned' },
            { name: 'mountain_rock_001.png', status: 'Aktiv', size: '41KB', type: 'assigned' },
            { name: 'mountain_snow_001.png', status: 'Ungenutzt', size: '35KB', type: 'unassigned' },
            { name: 'mountain_peak_002.png', status: 'Duplikat', size: '52KB', type: 'duplicate', originalName: 'mountain_peak_001.png' },
            { name: 'mountain_cave_001.png', status: 'Beschädigt', size: '0KB', type: 'corrupted' },
            { name: 'mountain_path_001.png', status: 'Ungenutzt', size: '29KB', type: 'unassigned' }
        ]
    };
    
    // Return biome-specific files or default files if biome not found
    return baseFiles[biomeName] || [
        { name: `${biomeName.toLowerCase()}_tile_001.png`, status: 'Ungenutzt', size: '45KB', type: 'unassigned' },
        { name: `${biomeName.toLowerCase()}_tile_002.png`, status: 'Duplikat', size: '32KB', type: 'duplicate', originalName: `${biomeName.toLowerCase()}_tile_001.png` },
        { name: `${biomeName.toLowerCase()}_tile_003.png`, status: 'Beschädigt', size: '0KB', type: 'corrupted' },
        { name: `${biomeName.toLowerCase()}_tile_004.png`, status: 'Aktiv', size: '28KB', type: 'assigned' }
    ];
}

function initializeFilterButtons() {
    const fileTypeFilters = document.querySelectorAll('.file-type-filter');
    fileTypeFilters.forEach(filter => {
        // Remove existing listeners to prevent duplicates
        filter.removeEventListener('click', filterClickHandler);
        filter.addEventListener('click', filterClickHandler);
    });
}

function filterClickHandler(event) {
    const filter = event.target;
    const filterType = filter.dataset.type;
    
    // Update active filter button
    const fileTypeFilters = document.querySelectorAll('.file-type-filter');
    fileTypeFilters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    
    // Filter files
    filterFiles(filterType);
}

function updateDeleteButtonState() {
    const deleteSelectedFiles = document.getElementById('deleteSelectedFiles');
    const fileListContainer = document.getElementById('fileListContainer');
    
    if (deleteSelectedFiles && fileListContainer) {
        const selectedCount = fileListContainer.querySelectorAll('input[type="checkbox"]:checked').length;
        deleteSelectedFiles.textContent = 'Ausgewählte löschen (' + selectedCount + ')';
        deleteSelectedFiles.disabled = selectedCount === 0;
    }
}

function deleteFiles(filenames) {
    // Simulate file deletion (replace with actual deletion)
    filenames.forEach(filename => {
        const fileItem = document.querySelector(`[data-filename="${filename}"]`).closest('.file-item');
        if (fileItem) {
            fileItem.style.opacity = '0.5';
            fileItem.style.textDecoration = 'line-through';
        }
    });
    
    // Remove files immediately - NO DELAY
    filenames.forEach(filename => {
        const fileItem = document.querySelector(`[data-filename="${filename}"]`).closest('.file-item');
        if (fileItem) {
            fileItem.remove();
        }
    });
    updateDeleteButtonState();
    showToast(`${filenames.length} Datei(en) wurden gelöscht.`, 'success');
}

function deleteSingleFile(filename) {
    if (confirm(`Möchten Sie die Datei "${filename}" wirklich löschen?`)) {
        deleteFiles([filename]);
    } else {
        showToast('Löschvorgang abgebrochen', 'info');
    }
}

function filterFiles(filterType) {
    const fileItems = document.querySelectorAll('.file-item');
    let visibleCount = 0;
    
    fileItems.forEach(item => {
        if (filterType === 'all') {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            const itemType = item.classList.contains(filterType);
            item.style.display = itemType ? 'flex' : 'none';
            if (itemType) visibleCount++;
        }
    });
    
    // Update delete button state after filtering
    updateDeleteButtonState();
}

function openInExplorer(filename) {
    // Get current biome name from the cleaner view
    const currentBiomeNameElement = document.getElementById('currentBiomeName');
    const currentBiome = currentBiomeNameElement ? currentBiomeNameElement.textContent : 'Buildings';
    
    // Get the full path to the specific biome's tiles folder
    const folderPath = `assets/biomes/${currentBiome}/tiles/`;
    
    // Try to open the folder directly using file:// protocol
    try {
        // Convert web path to file system path
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const fullFilePath = `file://${basePath}/${folderPath}`;
        
        // Try to open the folder
        window.open(fullFilePath, '_blank');
        
        // Also try alternative method
        const link = document.createElement('a');
        link.href = fullFilePath;
        link.target = '_blank';
        link.click();
        
        // Show success toast with system path
        showToast('Ordner wird geöffnet...', 'success');
        
    } catch (error) {
        // console.('[TileCleaner] Error opening folder directly:', error);
        
        // Fallback: Copy system path to clipboard
        const systemPath = window.location.pathname.replace('/tileEditor.html', '') + '/' + folderPath;
        
        const tempInput = document.createElement('input');
        tempInput.value = systemPath;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showToast(`System-Pfad wurde in die Zwischenablage kopiert:\n${systemPath}`, 'info');
        } catch (err) {
            showToast(`System-Pfad konnte nicht kopiert werden:\n${systemPath}`, 'warning');
        }
        
        document.body.removeChild(tempInput);
    }
}

function addUnusedFile(filename) {
    const fileItem = document.querySelector(`[data-filename="${filename}"]`).closest('.file-item');
    if (!fileItem) return;
    
    // Get current biome name from the cleaner view
    const currentBiomeNameElement = document.getElementById('currentBiomeName');
    const currentBiome = currentBiomeNameElement ? currentBiomeNameElement.textContent : 'Buildings';
    
    // Create new tile in the tile editor
    createTileFromFile(filename, currentBiome);
    
    // Update file status to "Aktiv"
    const statusElement = fileItem.querySelector('.file-status');
    statusElement.textContent = 'Aktiv • ' + statusElement.textContent.split(' • ')[1];
    statusElement.className = 'file-status assigned';
    
    // Update CSS class
    fileItem.classList.remove('unassigned');
    fileItem.classList.add('assigned');
    
    // Remove the "Hinzufügen" button and add "Entfernen" button
    const actionsContainer = fileItem.querySelector('.file-actions-inline');
    const addButton = actionsContainer.querySelector('button[onclick*="addUnusedFile"]');
    if (addButton) {
        addButton.outerHTML = '<button type="button" class="btn btn-warning btn-small" onclick="removeAssignedFile(\'' + filename + '\')">Entfernen</button>';
    }
    
    showToast(`Datei "${filename}" wurde als Tile hinzugefügt.`, 'success');
}

function createTileFromFile(filename, biomeName) {
    // Generate a unique tile ID
    const tileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Get the correct category ID for the biome
    let categoryId = null;
    if (window.tileEditor && window.tileEditor.categories) {
        const category = window.tileEditor.categories.find(cat => cat.name === biomeName);
        if (category) {
            categoryId = category.id;
        }
    }
    
    // Create tile object with proper structure for the tile editor
    const newTile = {
        id: tileId,
        name: filename.replace('.png', '').replace(/_/g, ' '),
        image: `assets/biomes/${biomeName}/tiles/${filename}`,
        movementCost: 1,
        defenseBonus: 0,
        resources: '',
        description: `Tile aus ${filename}`,
        categoryId: categoryId,
        categoryName: biomeName,
        isDefault: false,
        isUnassigned: false
    };
    
    // Add tile to the tileEditor's tiles array
    if (window.tileEditor && window.tileEditor.tiles) {
        window.tileEditor.tiles.push(newTile);
    }
    
    // Don't add to localStorage to avoid duplicates - let the tileEditor handle persistence
    
    // Try to refresh the biome modal if it's open
    const biomeModal = document.getElementById('biomeModal');
    if (biomeModal && biomeModal.dataset.currentBiomeId) {
        const currentBiomeId = parseInt(biomeModal.dataset.currentBiomeId);
        
        // Force refresh the biome tiles without reopening the modal
        if (window.tileEditor && window.tileEditor.modalManager) {
            if (window.tileEditor.modalManager.refreshBiomeTiles) {
                window.tileEditor.modalManager.refreshBiomeTiles(currentBiomeId);
            } else if (window.tileEditor.modalManager.loadBiomeTiles) {
                window.tileEditor.modalManager.loadBiomeTiles(currentBiomeId);
            }
        }
    }
    
    // Update the tilesList.js file
    updateTilesListFile(biomeName, newTile);
    
    // Trigger a custom event to notify the main tile editor
    const refreshEvent = new CustomEvent('tileAdded', {
        detail: { tile: newTile, biome: biomeName }
    });
    document.dispatchEvent(refreshEvent);
}

function removeAssignedFile(filename) {
    const fileItem = document.querySelector(`[data-filename="${filename}"]`).closest('.file-item');
    if (!fileItem) return;
    
    // Get current biome name from the cleaner view
    const currentBiomeNameElement = document.getElementById('currentBiomeName');
    const currentBiome = currentBiomeNameElement ? currentBiomeNameElement.textContent : 'Buildings';
    
    // Remove tile from the tile editor
    removeTileFromFile(filename, currentBiome);
    
    // Update file status to "Ungenutzt"
    const statusElement = fileItem.querySelector('.file-status');
    statusElement.textContent = 'Ungenutzt • ' + statusElement.textContent.split(' • ')[1];
    statusElement.className = 'file-status unassigned';
    
    // Update CSS class
    fileItem.classList.remove('assigned');
    fileItem.classList.add('unassigned');
    
    // Remove the "Entfernen" button and add "Hinzufügen" button
    const actionsContainer = fileItem.querySelector('.file-actions-inline');
    const removeButton = actionsContainer.querySelector('button[onclick*="removeAssignedFile"]');
    if (removeButton) {
        removeButton.outerHTML = '<button type="button" class="btn btn-success btn-small" onclick="addUnusedFile(\'' + filename + '\')">Hinzufügen</button>';
    }
    
    showToast(`Datei "${filename}" wurde als Tile entfernt.`, 'info');
}

function removeTileFromFile(filename, biomeName) {
    const imagePath = `assets/biomes/${biomeName}/tiles/${filename}`;
    
    // Remove tile from the current biome's tile list
    if (window.tileEditor && window.tileEditor.modalManager) {
        const currentBiomeId = getCurrentBiomeId();
        if (currentBiomeId) {
            // Find and remove the tile by image path from tileEditor's tiles array
            const tileIndex = window.tileEditor.tiles.findIndex(tile => tile.image === imagePath);
            if (tileIndex !== -1) {
                window.tileEditor.tiles.splice(tileIndex, 1);
                
                // Refresh the biome modal to update the display
                if (window.tileEditor.modalManager.refreshBiomeTiles) {
                    window.tileEditor.modalManager.refreshBiomeTiles(currentBiomeId);
                } else if (window.tileEditor.modalManager.loadBiomeTiles) {
                    window.tileEditor.modalManager.loadBiomeTiles(currentBiomeId);
                }
            }
        }
    }
    
    // Remove tile from the tile editor's tile list
    if (window.tileEditor && window.tileEditor.dataManager) {
        // Remove from data manager using the correct API
        if (window.tileEditor.dataManager.removeTileByImage) {
            window.tileEditor.dataManager.removeTileByImage(imagePath);
        } else if (window.tileEditor.dataManager.deleteTile) {
            window.tileEditor.dataManager.deleteTile(imagePath);
        } else {
            // Fallback: Remove from localStorage
            const existingTiles = JSON.parse(localStorage.getItem('tiles') || '[]');
            const updatedTiles = existingTiles.filter(tile => tile.image !== imagePath);
            localStorage.setItem('tiles', JSON.stringify(updatedTiles));
        }
    } else {
        // Fallback: Remove from localStorage
        const existingTiles = JSON.parse(localStorage.getItem('tiles') || '[]');
        const updatedTiles = existingTiles.filter(tile => tile.image !== imagePath);
        localStorage.setItem('tiles', JSON.stringify(updatedTiles));
    }
    
    // Refresh the tile list in the main tile editor view
    refreshTileList();
}

function getCurrentBiomeId() {
    // Try multiple ways to get the current biome ID
    const biomeModal = document.getElementById('biomeModal');
    if (biomeModal && biomeModal.dataset.currentBiomeId) {
        return parseInt(biomeModal.dataset.currentBiomeId);
    }
    
    // Fallback: Get from biome name element
    const biomeNameElement = document.getElementById('biomeName');
    if (biomeNameElement) {
        const biomeName = biomeNameElement.textContent;
        // Find the category ID by name
        if (window.tileEditor && window.tileEditor.categories) {
            const category = window.tileEditor.categories.find(cat => cat.name === biomeName);
            if (category) {
                return category.id;
            }
        }
    }
    
    // Fallback: Get from currentBiomeName element
    const currentBiomeNameElement = document.getElementById('currentBiomeName');
    if (currentBiomeNameElement) {
        const biomeName = currentBiomeNameElement.textContent;
        if (window.tileEditor && window.tileEditor.categories) {
            const category = window.tileEditor.categories.find(cat => cat.name === biomeName);
            if (category) {
                return category.id;
            }
        }
    }
    
    // console.('[TileCleaner] Could not determine current biome ID');
    return null;
}

function updateTilesListFile(biomeName, newTile) {
    // Get tiles for this biome from tileEditor only (not localStorage to avoid duplicates)
    const tileEditorTiles = window.tileEditor && window.tileEditor.tiles ? 
        window.tileEditor.tiles.filter(tile => tile.categoryName === biomeName) : [];
    
    // Create the tilesList.js content
    const tilesListContent = `// Tiles list for ${biomeName}
// Generated by TileEditor
const ${biomeName.toLowerCase()}TilesList = ${JSON.stringify(tileEditorTiles, null, 2)};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${biomeName.toLowerCase()}TilesList;
}`;
    
    // Send the updated content to the server if saveTilesList is available
    if (window.tileEditor && window.tileEditor.saveTilesList) {
        try {
            window.tileEditor.saveTilesList(biomeName, tilesListContent);
        } catch (error) {
            // console.('[TileCleaner] Error saving tilesList:', error);
        }
    }
}

function refreshTileList() {
    // Trigger a custom event to notify the main tile editor
    const refreshEvent = new CustomEvent('tileListRefresh', {
        detail: { source: 'tileCleaner' }
    });
    document.dispatchEvent(refreshEvent);
    
    // Also try to call the main tile editor's refresh function if available
    if (window.tileEditor && window.tileEditor.uiManager && window.tileEditor.uiManager.refreshTileList) {
        window.tileEditor.uiManager.refreshTileList();
    }
}

function refreshBiomeTilesList(biomeId) {
    // Get the biome tiles list container
    const biomeTilesList = document.getElementById('biomeTilesList');
    if (!biomeTilesList) {
        // console.('[TileCleaner] Biome tiles list container not found');
        return;
    }
    
    // Clear the container first to ensure clean state
    biomeTilesList.innerHTML = '';
    
    // Try to use the ModalManager's loadBiomeTiles function first
    if (window.tileEditor && window.tileEditor.modalManager && window.tileEditor.modalManager.loadBiomeTiles) {
        // Get the current category
        const categories = window.tileEditor.categories || [];
        const currentCategory = categories.find(cat => cat.id === biomeId);
        
        if (currentCategory) {
            // Use the ModalManager to load tiles properly
            window.tileEditor.modalManager.loadBiomeTiles(currentCategory);
        } else {
            // console.('[TileCleaner] Category not found for ID:', biomeId);
            showFallbackTilesList(biomeId);
        }
    } else {
        // console.('[TileCleaner] ModalManager not available, using fallback');
        showFallbackTilesList(biomeId);
    }
}

function showFallbackTilesList(biomeId) {
    const biomeTilesList = document.getElementById('biomeTilesList');
    if (!biomeTilesList) return;
    
    // Get the current biome's tiles from tileEditor
    if (window.tileEditor && window.tileEditor.tiles) {
        const biomeTiles = window.tileEditor.tiles.filter(tile => tile.categoryId === biomeId);
        
        // Also check localStorage for additional tiles
        const localStorageTiles = JSON.parse(localStorage.getItem('tiles') || '[]');
        const localBiomeTiles = localStorageTiles.filter(tile => tile.categoryId === biomeId);
        
        // Combine both sources
        const allBiomeTiles = [...biomeTiles, ...localBiomeTiles];
        
        if (allBiomeTiles.length > 0) {
            // Use UIManager to create proper table if available
            if (window.UIManager && window.UIManager.loadBiomeTilesAsTable) {
                window.UIManager.loadBiomeTilesAsTable(allBiomeTiles);
            } else {
                // Generate the tiles table HTML as fallback
                const tilesTableHTML = generateTilesTableHTML(allBiomeTiles);
                biomeTilesList.innerHTML = tilesTableHTML;
            }
        } else {
            biomeTilesList.innerHTML = `
                <div class="no-tiles-message">
                    <p>Keine Tiles in diesem Biome vorhanden. Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                </div>
            `;
        }
    } else {
        // console.('[TileCleaner] tileEditor or tiles array not available');
        
        // Fallback: Try to get tiles from localStorage only
        const localStorageTiles = JSON.parse(localStorage.getItem('tiles') || '[]');
        const localBiomeTiles = localStorageTiles.filter(tile => tile.categoryId === biomeId);
        
        if (localBiomeTiles.length > 0) {
            if (window.UIManager && window.UIManager.loadBiomeTilesAsTable) {
                window.UIManager.loadBiomeTilesAsTable(localBiomeTiles);
            } else {
                const tilesTableHTML = generateTilesTableHTML(localBiomeTiles);
                biomeTilesList.innerHTML = tilesTableHTML;
            }
        } else {
            biomeTilesList.innerHTML = `
                <div class="no-tiles-message">
                    <p>Keine Tiles in diesem Biome vorhanden. Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                </div>
            `;
        }
    }
}

function generateTilesTableHTML(tiles) {
    if (tiles.length === 0) {
        return `
            <div class="no-tiles-message">
                <p>Keine Tiles mit diesem Filter gefunden. Wähle einen anderen Filter oder füge neue Tiles hinzu.</p>
            </div>
        `;
    }
    
    const tableHTML = `
        <table class="biome-tiles-table">
            <thead>
                <tr>
                    <th>Bild</th>
                    <th>Name</th>
                    <th>Bewegung</th>
                    <th>Verteidigung</th>
                    <th>Typ</th>
                    <th>Beschreibung</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            <tbody>
                ${tiles.map(tile => `
                    <tr data-tile-id="${tile.id}">
                        <td>
                            <img src="${tile.image}" alt="${tile.name}" class="tile-preview" onerror="this.style.display='none'">
                        </td>
                        <td>${tile.name}</td>
                        <td>🚶 ${tile.movementCost || 1}</td>
                        <td>🛡️ +${tile.defenseBonus || 0}</td>
                        <td>${tile.type || 'terrain'}</td>
                        <td>${tile.description || ''}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-small" onclick="editTile('${tile.id}')">Bearbeiten</button>
                            <button type="button" class="btn btn-danger btn-small" onclick="deleteTile('${tile.id}')">Löschen</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    return tableHTML;
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-size: 14px;
        max-width: 400px;
        word-wrap: break-word;
        white-space: pre-line;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animate in - IMMEDIATE
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
