/**
 * TileEditor UI Manager - Handles all UI operations
 */
class UIManager {
    constructor(tileEditor) {
        this.tileEditor = tileEditor;
    }

    updateCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            // console.('[UIManager] Categories list not found');
            return;
        }

        // Clear existing list
        categoriesList.innerHTML = '';

        // Add categories to list
        this.tileEditor.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.dataset.categoryId = category.id;
            
            if (this.tileEditor.selectedCategoryId === category.id) {
                categoryItem.classList.add('selected');
            }

            categoryItem.innerHTML = `
                <h4>${category.name}</h4>
                <span class="type ${category.type}">${this.tileEditor.getTypeName(category.type)}</span>
                <div style="color: ${category.color}; font-size: 0.8rem;">● ${category.color}</div>
            `;

            // Add click handler for category selection
            categoryItem.addEventListener('click', () => {
                this.tileEditor.selectCategory(category.id);
            });

            categoriesList.appendChild(categoryItem);
        });
    }

    updateTilesList(filteredTiles = null) {
        const tilesList = document.getElementById('tilesList');
        if (!tilesList) {
            // console.('[UIManager] Tiles list element not found');
            return;
        }

        // Clear existing list
        tilesList.innerHTML = '';

        // Use provided filtered tiles or filter by selected category
        let tilesToShow = filteredTiles;
        if (tilesToShow === null) {
            tilesToShow = this.tileEditor.selectedCategoryId 
                ? this.tileEditor.tiles.filter(t => t.categoryId === this.tileEditor.selectedCategoryId)
                : this.tileEditor.tiles;
        }

        // Add tiles to list
        tilesToShow.forEach(tile => {
            const tileItem = document.createElement('div');
            tileItem.className = 'tile-item';
            tileItem.dataset.tileId = tile.id;
            
            if (this.tileEditor.selectedTileId === tile.id) {
                tileItem.classList.add('selected');
            }

            const category = this.tileEditor.categories.find(c => c.id === tile.categoryId);
            const categoryName = category ? category.name : 'Unbekannt';

            tileItem.innerHTML = `
                <h4>${tile.name}</h4>
                <span class="category">${categoryName}</span>
                <div class="stats">
                    Bewegung: ${tile.movementCost} | Verteidigung: +${tile.defenseBonus}
                </div>
            `;

            // Add click handler for tile selection
            tileItem.addEventListener('click', () => {
                this.tileEditor.selectTile(tile.id);
            });

            tilesList.appendChild(tileItem);
        });
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Clear existing options
        categoryFilter.innerHTML = '<option value="">Alle Kategorien</option>';

        // Add category options
        this.tileEditor.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });

        // Set selected value
        categoryFilter.value = this.tileEditor.selectedCategoryId || '';
    }

    updateCategoryPreview(categoryId) {
        const category = this.tileEditor.categories.find(c => c.id === categoryId);
        if (!category) return;

        const previewContainer = document.getElementById('tilePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="tile-preview-content">
                    <h4>${category.name}</h4>
                    <div class="tile-preview-stats">
                        <div class="stat-row">
                            <span class="stat-label">Typ:</span>
                            <span class="stat-value">${this.tileEditor.getTypeName(category.type)}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Farbe:</span>
                            <span class="stat-value" style="color: ${category.color};">${category.color}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Beschreibung:</span>
                            <span class="stat-value">${category.description}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn btn-primary" onclick="window.tileEditor.openCategoryModal(${category.id})">Bearbeiten</button>
                        <button type="button" class="btn btn-danger" onclick="window.tileEditor.deleteCategory(${category.id})">Löschen</button>
                    </div>
                </div>
            `;
        }
    }

    updateTilePreview(tileId) {
        const tile = this.tileEditor.tiles.find(t => t.id === tileId);
        if (!tile) return;

        const category = this.tileEditor.categories.find(c => c.id === tile.categoryId);
        const categoryName = category ? category.name : 'Unbekannt';

        const previewContainer = document.getElementById('tilePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="tile-preview-content">
                    <h4>${tile.name}</h4>
                    <div class="tile-preview-image">
                        <img src="${tile.image}" alt="${tile.name}" onerror="this.style.display='none'">
                    </div>
                    <div class="tile-preview-stats">
                        <div class="stat-row">
                            <span class="stat-label">Kategorie:</span>
                            <span class="stat-value">${categoryName}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Bewegungskosten:</span>
                            <span class="stat-value">${tile.movementCost}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Verteidigungsbonus:</span>
                            <span class="stat-value">+${tile.defenseBonus}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Ressourcen:</span>
                            <span class="stat-value">${tile.resources || 'Keine'}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Beschreibung:</span>
                            <span class="stat-value">${tile.description}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="btn btn-primary" onclick="window.tileEditor.openTileModal(${tile.id})">Bearbeiten</button>
                        <button type="button" class="btn btn-danger" onclick="window.tileEditor.deleteTile(${tile.id})">Löschen</button>
                    </div>
                </div>
            `;
        }
    }

    displayCategories(categories) {
        // console.log('[UIManager] displayCategories called with:', categories);
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            // console.('[UIManager] Categories list element not found');
            return;
        }
        
        // console.log('[UIManager] Categories list element found, clearing...');
        categoriesList.innerHTML = '';
        
        if (!categories || categories.length === 0) {
            // console.log('[UIManager] No categories to display');
            categoriesList.innerHTML = '<div class="no-categories">Keine Biome gefunden</div>';
            return;
        }
        
        // Store all categories for infinite scroll
        this.allCategories = categories;
        this.currentDisplayCount = 0;
        
        // Add progress indicator above the list
        this.addProgressIndicator();
        
        // Lazy loading: Show only first 3 categories initially
        const categoriesToShow = categories.slice(0, 3);
        // console.log('[UIManager] Displaying first 3 categories:', categoriesToShow.map(c => c.name));
        
        categoriesToShow.forEach(category => {
            this.displayCategory(category);
        });
        
        this.currentDisplayCount = 3;
        
        // Update progress indicator
        this.updateProgressIndicator();

        // Setup infinite scroll
        this.setupInfiniteScroll();
    }
    
    addProgressIndicator() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        // Don't show progress indicator if biome modal is open
        const biomeModal = document.getElementById('biomeModal');
        if (biomeModal && biomeModal.classList.contains('show')) {
            // console.log('[UIManager] Biome modal is open, skipping progress indicator');
            return;
        }
        
        // Remove existing progress indicator if it exists
        const existingIndicator = document.getElementById('biome-progress-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.id = 'biome-progress-indicator';
        progressContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 15px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            margin-bottom: 15px;
            width: 100%;
        `;
        
        progressContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 16px;">📊 Biome Fortschritt:</span>
                <span id="biome-progress-text" style="font-size: 16px; font-weight: bold;">3 / ${this.allCategories.length}</span>
                <button id="manual-load-categories" style="
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    border: none;
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                    transition: all 0.3s ease;
                ">🔄 Lade mehr</button>
            </div>
            <div style="margin-top: 8px;">
                <div style="
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                ">
                    <div id="biome-progress-bar" style="
                        height: 100%;
                        background: linear-gradient(90deg, #2196F3, #1976D2);
                        border-radius: 4px;
                        transition: width 0.4s ease, background 0.4s ease;
                        width: ${(3 / this.allCategories.length) * 100}%;
                        box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
                    "></div>
                </div>
            </div>
        `;
        
        // Insert progress indicator into the categories card
        const categoriesCard = document.querySelector('.categories-card');
        if (categoriesCard) {
            // Insert at the top of the card, before the categories list
            categoriesCard.insertBefore(progressContainer, categoriesCard.firstChild);
        } else {
            // Fallback: Insert into body
            document.body.appendChild(progressContainer);
        }
        
        // Add click handler to the manual load button
        const manualButton = document.getElementById('manual-load-categories');
        if (manualButton) {
            manualButton.onmouseover = () => {
                manualButton.style.transform = 'scale(1.05)';
                manualButton.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
            };
            manualButton.onmouseout = () => {
                manualButton.style.transform = 'scale(1)';
                manualButton.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
            };
            manualButton.onclick = () => {
                // console.log('[UIManager] 🖱️ Manual load button clicked');
                this.loadMoreCategoriesOnScroll();
            };
        }
    }
    
    updateProgressIndicator() {
        const progressText = document.getElementById('biome-progress-text');
        const progressBar = document.getElementById('biome-progress-bar');
        const progressContainer = document.getElementById('biome-progress-indicator');
        
        if (!progressText || !progressBar) return;
        
        const percentage = (this.currentDisplayCount / this.allCategories.length) * 100;
        
        progressText.textContent = `${this.currentDisplayCount} / ${this.allCategories.length}`;
        progressBar.style.width = `${percentage}%`;
        
        // Change color based on progress
        if (percentage >= 100) {
            progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
            
            // Fade out the progress indicator when loading is complete
            if (progressContainer) {
                progressContainer.style.transition = 'all 0.4s ease';
                progressContainer.style.transform = 'translateX(-50%) translateY(-100px)';
                progressContainer.style.opacity = '0';
                
                // Remove the element after fade out
                setTimeout(() => {
                    if (progressContainer && progressContainer.parentNode) {
                        progressContainer.parentNode.removeChild(progressContainer);
                    }
                }, 400);
            }
        } else if (percentage >= 50) {
            progressBar.style.background = 'linear-gradient(90deg, #FF9800, #F57C00)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #2196F3, #1976D2)';
        }
    }

    setupInfiniteScroll() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        // Remove existing scroll listener
        if (this.scrollHandler) {
            categoriesList.removeEventListener('scroll', this.scrollHandler);
        }

        // Debug: Log container dimensions
        // console.log('[UIManager] 🔍 Debug: Container dimensions:', {
            scrollHeight: categoriesList.scrollHeight,
            clientHeight: categoriesList.clientHeight,
            offsetHeight: categoriesList.offsetHeight,
            isScrollable: categoriesList.scrollHeight > categoriesList.clientHeight,
            style: {
                maxHeight: getComputedStyle(categoriesList).maxHeight,
                height: getComputedStyle(categoriesList).height,
                overflow: getComputedStyle(categoriesList).overflow,
                overflowY: getComputedStyle(categoriesList).overflowY
            }
        });

        // Create new scroll handler with throttling
        let scrollTimeout;
        this.scrollHandler = () => {
            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // Throttle scroll events
            scrollTimeout = setTimeout(() => {
                if (this.isLoading || this.currentDisplayCount >= this.allCategories.length) {
                    // console.log('[UIManager] 📜 Scroll blocked - isLoading:', this.isLoading, 'currentDisplayCount:', this.currentDisplayCount, 'total:', this.allCategories.length);
                    return;
                }

                const scrollTop = categoriesList.scrollTop;
                const scrollHeight = categoriesList.scrollHeight;
                const clientHeight = categoriesList.clientHeight;
                
                // console.log('[UIManager] 📜 Scroll event:', {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                    threshold: scrollTop + clientHeight,
                    shouldLoad: scrollTop + clientHeight >= scrollHeight - 200,
                    currentDisplayCount: this.currentDisplayCount,
                    total: this.allCategories.length,
                    canLoad: this.currentDisplayCount < this.allCategories.length,
                    remaining: this.allCategories.length - this.currentDisplayCount
                });
                
                // Load more when user is near bottom of container (100px threshold for better reliability)
                if (scrollTop + clientHeight >= scrollHeight - 100) {
                    // console.log('[UIManager] 🚀 Scroll threshold reached, loading more...');
                    this.loadMoreCategoriesOnScroll();
                }
            }, 25); // Reduced throttle to 25ms for better responsiveness
        };

        // Add scroll listener to the categoriesList container
        categoriesList.addEventListener('scroll', this.scrollHandler);
        // console.log('[UIManager] ✅ Infinite scroll setup complete on categoriesList container');
        
        // Test scroll functionality immediately
        this.scrollHandler();
        
        // Set up periodic check for loading more categories
        this.setupPeriodicLoadCheck();
    }
    
    setupPeriodicLoadCheck() {
        // Clear existing interval if it exists
        if (this.periodicLoadInterval) {
            clearInterval(this.periodicLoadInterval);
        }
        
        // Check every 500ms if we can load more categories
        this.periodicLoadInterval = setInterval(() => {
            if (this.currentDisplayCount < this.allCategories.length && !this.isLoading) {
                // console.log('[UIManager] 🔄 Periodic check: Loading more categories...');
                this.loadMoreCategoriesOnScroll();
            }
        }, 500);
        
        // console.log('[UIManager] ✅ Periodic load check setup complete');
    }

    loadMoreCategoriesOnScroll() {
        if (this.isLoading || this.currentDisplayCount >= this.allCategories.length) {
            // console.log('[UIManager] Skipping load - isLoading:', this.isLoading, 'currentDisplayCount:', this.currentDisplayCount, 'total:', this.allCategories.length);
            return;
        }

        this.isLoading = true;
        // console.log('[UIManager] Loading more categories on scroll');

        // LOAD TWO AT A TIME: Load next 2 categories for better user experience
        const remaining = this.allCategories.length - this.currentDisplayCount;
        const nextBatch = Math.min(2, remaining); // Changed from 5 to 2
        const nextCategories = this.allCategories.slice(this.currentDisplayCount, this.currentDisplayCount + nextBatch);
        
        // console.log('[UIManager] Loading next batch of categories:', nextCategories.map(c => c.name), 'Remaining:', remaining);

        // Display all categories in the batch immediately without staggered animation
        nextCategories.forEach((category, index) => {
            this.displayCategory(category);
            this.currentDisplayCount++;
            // console.log('[UIManager] Loaded category:', category.name, 'Count:', this.currentDisplayCount, '/', this.allCategories.length);
        });

        // Update progress indicator once after all categories are loaded
        this.updateProgressIndicator();

        // Check if all categories are loaded
        if (this.currentDisplayCount >= this.allCategories.length) {
            // console.log('[UIManager] All categories loaded');
        }

        // Reset loading flag immediately
        this.isLoading = false;
        // console.log('[UIManager] Loading flag reset, can load more if needed');
    }

    // Remove old load more button methods - replaced by infinite scroll

    displayCategory(category) {
        // console.log('[UIManager] Processing category:', category);
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.dataset.categoryId = category.id;
        categoryItem.style.borderLeftColor = category.color;
        
        // Get tiles for this category (exclude the main biome image)
        const categoryTiles = this.tileEditor.tiles.filter(tile => 
            tile.categoryId === category.id && 
            !tile.image.includes(`assets/biomes/${category.name}/${category.name}.png`)
        );
        // console.log('[UIManager] Found', categoryTiles.length, 'tiles for category', category.name);
        
        const tilesHTML = categoryTiles.map(tile => `
            <div class="tile-preview">
                <img src="${encodeURI(tile.image)}" alt="${tile.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.innerHTML='❌ Bild nicht gefunden'; this.nextElementSibling.style.color='#ff6b6b';"
                     onload="this.classList.add('loaded'); this.nextElementSibling.innerHTML='${tile.name}'; this.nextElementSibling.style.color='#fff';">
                <div style="color: #999; font-size: 11px;">Lade Bild...</div>
                <div class="stats">
                    <span>🚶 ${tile.movementCost}</span>
                    <span>🛡️ ${tile.defenseBonus}</span>
                </div>
            </div>
        `).join('');
        
        categoryItem.innerHTML = `
            <div class="category-header">
                <div class="category-main-image">
                    <img src="/assets/biomes/${category.name}/${category.name}.png" 
                         alt="${category.name}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.nextElementSibling.innerHTML='${category.icon || '🏗️'}';"
                         onload="this.classList.add('loaded'); this.nextElementSibling.style.display='none';">
                    <div class="category-icon" style="display: block; font-size: 2rem; text-align: center; padding: 1rem;">${category.icon || '🏗️'}</div>
                </div>
                <div class="category-info">
                    <div class="category-title-row">
                        <div class="title-section">
                            <h4>${category.name}</h4>
                            <div class="category-description">${category.description || `Tiles aus ${category.name}`}</div>
                        </div>
                        <div class="stats-section">
                            <div class="stat-item">
                                <span class="stat-icon">🎨</span>
                                <span class="stat-value" style="color: ${category.color};">${category.color}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">🏷️</span>
                                <span class="stat-value">${this.tileEditor.getTypeName(category.type)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">🧩</span>
                                <span class="stat-value">${categoryTiles.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="category-content">
                <div class="tiles-preview">
                    ${tilesHTML}
                </div>
            </div>
        `;
        
        // Click handler for opening biome modal
        categoryItem.addEventListener('click', async (e) => {
            // Don't trigger when clicking drag handle or action buttons
            if (!e.target.classList.contains('category-drag-handle') && 
                !e.target.classList.contains('btn')) {
                await this.tileEditor.openBiomeModal(category.id);
            }
        });

        // Double-click handler for selection (optional)
        categoryItem.addEventListener('dblclick', (e) => {
            // Don't trigger selection when clicking drag handle
            if (!e.target.classList.contains('category-drag-handle')) {
                this.tileEditor.selectCategory(category.id);
            }
        });
        
        // Add to DOM with smooth animation
        categoriesList.appendChild(categoryItem);
        
        // Trigger reflow to ensure animation plays
        categoryItem.offsetHeight;
        
        // console.log('[UIManager] Added category item for:', category.name);
    }

    // REMOVED: Duplicate displayTiles function - now handled by TileEditor.js displayTilesAsTable/Cards

    // Drag & Drop functionality removed

    updateHeaderBiomeFilter() {
        const headerFilter = document.getElementById('headerBiomeFilter');
        if (!headerFilter) return;

        // Clear existing options
        headerFilter.innerHTML = '<option value="">Alle Biome</option>';
        
        // Add biome options
        this.tileEditor.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.biomeKey || category.name.toLowerCase();
            option.textContent = category.name;
            headerFilter.appendChild(option);
        });
    }

    updateTileCategoryOptions() {
        const tileCategorySelect = document.getElementById('tileCategory');
        if (!tileCategorySelect) return;

        // Clear existing options
        tileCategorySelect.innerHTML = '';

        // Add category options
        this.tileEditor.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            tileCategorySelect.appendChild(option);
        });
    }

    clearPreview() {
        const previewContainer = document.getElementById('tilePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <p>Wähle eine Kategorie aus um Details zu sehen</p>
                </div>
            `;
        }
    }

    selectCategory(categoryId) {
        // console.log('[UIManager] selectCategory called with:', categoryId);
        if (this.tileEditor && this.tileEditor.selectCategory) {
            this.tileEditor.selectCategory(categoryId);
        }
    }

    refreshBiomeTilesDisplay() {
        // console.log('[UIManager] Refreshing biome tiles display');
        
        // Clean up existing scroll listener
        this.cleanupInfiniteScroll();
        
        // Refresh the main categories display
        if (this.tileEditor && this.tileEditor.categories) {
            this.displayCategories(this.tileEditor.categories);
        }
        
        // Clear any cached data that might be causing display issues
        if (this.tileEditor && this.tileEditor.dataManager && this.tileEditor.dataManager.clearCache) {
            this.tileEditor.dataManager.clearCache();
        }
        
        // console.log('[UIManager] Biome tiles display refreshed');
    }

    cleanupInfiniteScroll() {
        const categoriesList = document.getElementById('categoriesList');
        if (this.scrollHandler && categoriesList) {
            categoriesList.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
        
        // Clear periodic load interval
        if (this.periodicLoadInterval) {
            clearInterval(this.periodicLoadInterval);
            this.periodicLoadInterval = null;
        }
        
        this.isLoading = false;
        this.currentDisplayCount = 0;
        this.allCategories = null;
        // console.log('[UIManager] Infinite scroll cleaned up');
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
