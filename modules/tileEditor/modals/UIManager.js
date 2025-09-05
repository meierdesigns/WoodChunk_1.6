/**
 * UIManager - Handles UI operations and rendering for the tile editor
 * Separated from ModalManager for better debugging and maintainability
 */

class UIManager {
    constructor() {
        this.currentViewMode = 'card'; // 'card' or 'table'
        this.biomeCache = new Map(); // Cache for biome data
        this.imageCache = new Map(); // Cache for preloaded images
        this.lastBiomeHash = null; // Hash of last loaded biome data
        this.debugMode = false;
        this.loadDebugMode();
        
        // ANTI-FLICKER: Enhanced debouncing mechanism to prevent rapid updates
        this.displayTimeout = null;
        this.lastDisplayData = null;
        this.isDisplaying = false; // Prevent concurrent displays
        this.displayQueue = []; // Queue for pending displays
    }

    // Debug utility functions
    loadDebugMode() {
        this.debugMode = true; // Force debug mode on for performance tracking
    }

    debug(...args) {
        if (this.debugMode) {
            console.log(`[UIManager ${Date.now()}]`, ...args);
        }
    }

    debugError(...args) {
        if (this.debugMode) {
            console.error(`[UIManager ${Date.now()}]`, ...args);
        }
    }

    // ULTRA-FAST: Load empty cards with names immediately with enhanced anti-flicker
    displayCategories(categories) {
        this.debug('🚀 displayCategories called with', categories?.length, 'categories');
        
        // ANTI-FLICKER: Prevent concurrent displays
        if (this.isDisplaying) {
            this.debug('⏸️ Display in progress, queuing request');
            this.displayQueue.push(categories);
            return;
        }
        
        // Clear any pending display update
        if (this.displayTimeout) {
            this.debug('⏰ Clearing existing timeout');
            clearTimeout(this.displayTimeout);
        }
        
        // Check if data is the same to prevent unnecessary updates
        const dataHash = JSON.stringify(categories);
        if (this.lastDisplayData === dataHash) {
            this.debug('🔄 Skipping update - data unchanged');
            return; // Skip update if data hasn't changed
        }
        
        this.debug('⚡ Starting 2er-loading display');
        this.isDisplaying = true;
        
        // Store categories and start with first 2
        this.allCategories = categories || [];
        this.currentDisplayCount = 0;
        
        // Initialize progress counter
        const progressCounter = document.getElementById('biomeProgressCounter');
        if (progressCounter && this.allCategories.length > 0) {
            this.debug('🔢 Initializing progress counter:', this.allCategories.length, 'categories');
            progressCounter.style.display = 'inline-block';
            progressCounter.textContent = `0/${this.allCategories.length}`;
            progressCounter.classList.remove('complete');
            this.debug('✅ Progress counter initialized:', progressCounter.textContent);
        } else {
            this.debugError('❌ Progress counter element not found or no categories');
        }
        
        // Display first 2 categories immediately
        this._displayFirstTwoCategories();
        
        this.lastDisplayData = dataHash;
        this.isDisplaying = false;
        
        // Process queued requests immediately
        if (this.displayQueue.length > 0) {
            this.debug('📋 Processing', this.displayQueue.length, 'queued requests');
            const nextRequest = this.displayQueue.shift();
            this.displayCategories(nextRequest);
        }
    }
    
    // Display first two categories immediately
    _displayFirstTwoCategories() {
        this.debug('🚀 _displayFirstTwoCategories called');
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            this.debugError('❌ Categories list element not found');
            return;
        }
        
        // Clear the list
        categoriesList.innerHTML = '';
        
        if (!this.allCategories || this.allCategories.length === 0) {
            this.debug('📭 No categories to display');
            categoriesList.innerHTML = '<div class="no-categories">Keine Biome gefunden</div>';
            return;
        }
        
        // Load first 2 categories
        this.loadMoreCategories();
        
        // Add progress indicator if there are more categories
        if (this.allCategories.length > 2) {
            this.addProgressIndicator();
        }
        
        // Setup infinite scroll for remaining categories
        this.setupInfiniteScroll();
    }
    
    // IMMEDIATE: Show empty cards with just names
    _displayEmptyCardsImmediately(categories) {
        this.debug('📋 _displayEmptyCardsImmediately called');
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            this.debugError('❌ Categories list element not found');
            return;
        }
        
        this.debug('🧹 Clearing categories list');
        
        // Clear and show empty cards immediately
        categoriesList.innerHTML = '';
        
        if (!categories || categories.length === 0) {
            this.debug('📭 No categories to display');
            categoriesList.innerHTML = '<div class="no-categories">Keine Biome gefunden</div>';
            return;
        }
        
        this.debug('🏗️ Creating', categories.length, 'empty cards');
        
        // Create empty cards with just names - INSTANT
        const fragment = document.createDocumentFragment();
        categories.forEach((category, index) => {
            this.debug(`📄 Creating empty card ${index + 1}/${categories.length}: ${category.name}`);
            const emptyCard = this.createEmptyBiomeCard(category);
            fragment.appendChild(emptyCard);
        });
        
        this.debug('📤 Appending fragment to DOM');
        categoriesList.appendChild(fragment);
        
        this.debug('✅ Empty cards displayed successfully');
    }
    
    // Create empty biome card with just the name
    createEmptyBiomeCard(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item empty-card';
        categoryElement.dataset.categoryId = category.id;
        categoryElement.dataset.categoryName = category.name;
        
        // Minimal HTML with just the name - ULTRA FAST
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category.name}</h3>
                <div class="loading-indicator">⏳</div>
            </div>
            <div class="category-info">
                <span class="type">Laden...</span>
                <div class="color-indicator" style="background-color: #666;"></div>
            </div>
            <div class="category-description">Lade Daten...</div>
            <div class="category-actions">
                <button class="btn btn-primary btn-sm view-biome-btn" data-category-id="${category.id}" disabled>
                    <i class="fas fa-eye"></i> Anzeigen
                </button>
                <button class="btn btn-secondary btn-sm edit-category-btn" data-category-id="${category.id}" disabled>
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
        `;
        
        return categoryElement;
    }
    
    // Internal method for actual display - updates existing empty cards
    _displayCategoriesInternal(categories) {
        // Quick validation
        if (!categories || categories.length === 0) {
            const categoriesList = document.getElementById('categoriesList');
            if (categoriesList) {
                categoriesList.innerHTML = '<div class="no-categories">Keine Biome gefunden</div>';
            }
            return;
        }
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            this.debugError('Categories list element not found');
            return;
        }
        
        // Update existing empty cards instead of replacing them
        const existingCards = categoriesList.querySelectorAll('.category-item');
        
        if (existingCards.length === 0) {
            // No existing cards, create them normally
            this._createFullCards(categories);
        } else {
            // Update existing empty cards with full data
            this._updateExistingCards(categories, existingCards);
        }
        
        // Load images for visible cards immediately
        this.loadBiomeImagesLazily();
    }
    
    // Update existing empty cards with full data
    _updateExistingCards(categories, existingCards) {
        categories.forEach((category, index) => {
            const existingCard = existingCards[index];
            if (existingCard) {
                // Update the card content
                existingCard.className = 'category-item'; // Remove empty-card class
                existingCard.innerHTML = this.createTextOnlyBiomeCard(category).innerHTML;
                
                // Re-enable buttons
                const buttons = existingCard.querySelectorAll('button');
                buttons.forEach(btn => btn.disabled = false);
                
                // Add event listeners
                const viewBtn = existingCard.querySelector('.view-biome-btn');
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => {
                        this.openBiomeModalWithDeferredTileLoading(category.id);
                    });
                }
            }
        });
    }
    
    // Create full cards from scratch
    _createFullCards(categories) {
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        categories.forEach(category => {
            const element = this.createTextOnlyBiomeCard(category);
            fragment.appendChild(element);
        });
        
        categoriesList.appendChild(fragment);
    }
    
    // Create biome card with TEXT ONLY - NO IMAGES
    createTextOnlyBiomeCard(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item text-only-item';
        categoryElement.dataset.categoryId = category.id;
        categoryElement.dataset.categoryName = category.name;
        
        // Use placeholder tile count initially - NO BLOCKING CALLS
        const tileCount = category.tileCount || '?';
        
        // Use template literal for faster string concatenation - NO IMAGES
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category.name}</h3>
                <span class="tile-count">${tileCount} Tiles</span>
            </div>
            <div class="category-info">
                <span class="type ${category.type}">${this.getTypeName(category.type)}</span>
                <div class="color-indicator" style="background-color: ${category.color}"></div>
            </div>
            <div class="category-description">${category.description || 'Keine Beschreibung verfügbar'}</div>
            <div class="category-actions">
                <button class="btn btn-primary btn-sm view-biome-btn" data-category-id="${category.id}">
                    <i class="fas fa-eye"></i> Anzeigen
                </button>
                <button class="btn btn-secondary btn-sm edit-category-btn" data-category-id="${category.id}">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
        `;
        
        // Attach event listeners efficiently
        const viewBtn = categoryElement.querySelector('.view-biome-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.openBiomeModalWithDeferredTileLoading(category.id);
            });
        }
        
        return categoryElement;
    }
    
    // Load biome images lazily for visible cards
    loadBiomeImagesLazily() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        // Use Intersection Observer for lazy loading
        if (!this.biomeImageObserver) {
            this.biomeImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const categoryItem = entry.target;
                        const categoryId = categoryItem.dataset.categoryId;
                        
                        // Add biome image placeholder if needed
                        if (!categoryItem.querySelector('.category-image')) {
                            this.addBiomeImageToCard(categoryItem, categoryId);
                        }
                    }
                });
            }, {
                rootMargin: '100px', // Start loading 100px before visible
                threshold: 0.1 // Trigger when 10% visible
            });
        }
        
        // Observe all category items
        categoryItems.forEach(item => {
            this.biomeImageObserver.observe(item);
        });
    }
    
    // Add biome image to card when it becomes visible
    addBiomeImageToCard(categoryItem, categoryId) {
        // Find the category data
        const category = this.allCategories?.find(c => c.id === categoryId);
        if (!category) return;
        
        // Add image placeholder to header
        const header = categoryItem.querySelector('.category-header');
        if (header && !header.querySelector('.category-image')) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'category-image';
            imageDiv.innerHTML = `
                <div class="image-placeholder">🌍</div>
                <img data-src="${category.image || category.defaultTileImage}" 
                     alt="${category.name}"
                     style="display: none;"
                     onload="this.style.display='block'; this.previousElementSibling.style.display='none';"
                     onerror="this.style.display='none'; this.previousElementSibling.textContent='📁';">
            `;
            header.prepend(imageDiv);
            
            // Load the image
            const img = imageDiv.querySelector('img[data-src]');
            if (img && img.dataset.src) {
                img.src = img.dataset.src;
            }
        }
    }
    loadRemainingCategoriesProgressive() {
        if (!this.allCategories || this.currentDisplayCount >= this.allCategories.length) {
            return;
        }
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        // LOAD TWO AT A TIME: Load next 2 categories for better user experience
        const nextBatch = this.allCategories.slice(this.currentDisplayCount, this.currentDisplayCount + 2);
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        nextBatch.forEach(category => {
            const element = this.createPreloadedBiomeCard(category);
            fragment.appendChild(element);
        });
        
        categoriesList.appendChild(fragment);
        this.currentDisplayCount += nextBatch.length;
        
        // Update progress indicator
        this.updateProgressIndicator();

        // Remove progress indicator if all categories are loaded
        if (this.currentDisplayCount >= this.allCategories.length) {
            const progressIndicator = document.getElementById('biome-progress-indicator');
            if (progressIndicator) {
                progressIndicator.remove();
            }
        } else {
            // Continue loading next batch in background - IMMEDIATE
            this.loadRemainingCategoriesProgressive();
        }
    }
    // Create preloaded biome card with deferred tile loading - ULTRA-FAST
    createPreloadedBiomeCard(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item preloaded-item';
        categoryElement.dataset.categoryId = category.id;
        categoryElement.dataset.categoryName = category.name;
        
        // Use placeholder tile count initially - NO BLOCKING CALLS
        const tileCount = category.tileCount || '?';
        
        // Use template literal for faster string concatenation - NO IMAGES
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category.name}</h3>
                <span class="tile-count">${tileCount} Tiles</span>
            </div>
            <div class="category-info">
                <span class="type ${category.type}">${this.getTypeName(category.type)}</span>
                <div class="color-indicator" style="background-color: ${category.color}"></div>
            </div>
            <div class="category-description">${category.description || 'Keine Beschreibung verfügbar'}</div>
            <div class="category-actions">
                <button class="btn btn-primary btn-sm view-biome-btn" data-category-id="${category.id}">
                    <i class="fas fa-eye"></i> Anzeigen
                </button>
                <button class="btn btn-secondary btn-sm edit-category-btn" data-category-id="${category.id}">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
            </div>
        `;
        
        // Add subtle fade-in effect - FAST SUBTLE TRANSITION
        categoryElement.style.opacity = '0';
        categoryElement.style.transform = 'translateY(5px)'; /* REDUCED FROM 10px TO 5px */
        categoryElement.style.transition = 'opacity 0.15s ease, transform 0.15s ease'; /* REDUCED FROM 0.3s TO 0.15s */
        
        // Trigger animation after a micro-task - FAST SUBTLE TRANSITION
        requestAnimationFrame(() => {
            categoryElement.style.opacity = '1';
            categoryElement.style.transform = 'translateY(0)';
        });
        
        // Add event listeners for buttons
        const viewBtn = categoryElement.querySelector('.view-biome-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.openBiomeModalWithDeferredTileLoading(category.id);
            });
        }
        
        const editBtn = categoryElement.querySelector('.edit-category-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (window.tileEditor && window.tileEditor.editCategory) {
                    window.tileEditor.editCategory(category.id);
                }
            });
        }
        
        return categoryElement;
    }
    
    // Preload tile data in background for instant access - ULTRA-FAST NON-BLOCKING
    preloadTileDataInBackground(categories) {
        // Store preloaded data in cache immediately
        this.preloadedTileData = new Map();
        categories.forEach(category => {
            this.preloadedTileData.set(category.id, {
                tileCount: category.tileCount || 0,
                preloadedTiles: category.preloadedTiles || [],
                timestamp: Date.now()
            });
        });
        
        // Start preloading tile data for all categories in background - NO BLOCKING
        categories.forEach((category, index) => {
            // Use requestIdleCallback to avoid blocking - ULTRA-FAST
            requestIdleCallback(() => {
                this.preloadCategoryDataNonBlocking(category);
            }, { timeout: 1000 + (index * 100) }); // Stagger by 100ms to avoid blocking
        });
    }
    
    // Preload data for a single category - ULTRA-FAST NON-BLOCKING
    preloadCategoryDataNonBlocking(category) {
        // Skip preloading - just use placeholder data for now
        // This eliminates the blocking calls that were causing slow loading
        category.tileCount = category.tileCount || 0;
        
        // Update the displayed tile count - NON-BLOCKING
        const tileCountElement = document.querySelector(`[data-category-id="${category.id}"] .tile-count`);
        if (tileCountElement) {
            tileCountElement.textContent = `${category.tileCount} Tiles`;
        }
        
        // Update cache
        if (this.preloadedTileData && this.preloadedTileData.has(category.id)) {
            const cached = this.preloadedTileData.get(category.id);
            cached.tileCount = category.tileCount;
        }
    }
    
    // Preload tile images in background
    preloadTileImagesInBackground(tiles) {
        if (!tiles || tiles.length === 0) return;
        
        // Preload images in chunks to avoid blocking
        const chunkSize = 5;
        let currentChunk = 0;
        
        const preloadChunk = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, tiles.length);
            
            for (let i = start; i < end; i++) {
                const tile = tiles[i];
                if (tile && tile.image && !this.imageCache.has(tile.image)) {
                    const img = new Image();
                    img.onload = () => {
                        this.imageCache.set(tile.image, img);
                    };
                    img.onerror = () => {
                        // Silently handle errors
                    };
                    img.src = tile.image;
                }
            }
            
            currentChunk++;
            
            if (currentChunk * chunkSize < tiles.length) {
                preloadChunk(); // IMMEDIATE - NO DELAY
            }
        };
        
        // Start preloading
        if (tiles.length > 0) {
            preloadChunk();
        }
    }
    
    // Open biome modal with deferred tile loading
    openBiomeModalWithDeferredTileLoading(categoryId) {
        // First, open the modal with preloaded content
        if (window.tileEditor && window.tileEditor.openBiomeModal) {
            window.tileEditor.openBiomeModal(categoryId);
        }
        
        // Show preloaded tiles immediately if available
        this.showPreloadedTiles(categoryId);
        
        // Then load remaining tiles in background
        this.loadRemainingTilesInBackground(categoryId);
    }
    
    // Show preloaded tiles immediately
    showPreloadedTiles(categoryId) {
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) return;
        
        // Check if we have preloaded tiles
        const preloadedData = this.preloadedTileData ? this.preloadedTileData.get(categoryId) : null;
        
        if (preloadedData && preloadedData.preloadedTiles && preloadedData.preloadedTiles.length > 0) {
            // Show preloaded tiles immediately
            this.loadBiomeTilesAsCards(preloadedData.preloadedTiles);
            
            // Add loading indicator for remaining tiles
            if (preloadedData.tileCount > preloadedData.preloadedTiles.length) {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'loading-remaining-tiles';
                loadingIndicator.innerHTML = `
                    <div style="text-align: center; padding: 1rem; color: #ccc;">
                        <div>⏳ Lade weitere ${preloadedData.tileCount - preloadedData.preloadedTiles.length} Tiles...</div>
                    </div>
                `;
                biomeTilesList.appendChild(loadingIndicator);
            }
        } else {
            // No preloaded tiles, show loading placeholder
            biomeTilesList.innerHTML = `
                <div class="tiles-loading-placeholder" style="
                    text-align: center;
                    padding: 2rem;
                    color: #ccc;
                    font-size: 16px;
                ">
                    <div style="margin-bottom: 1rem;">⏳ Tiles werden geladen...</div>
                </div>
            `;
        }
    }
    
    // Load remaining tiles in background
    loadRemainingTilesInBackground(categoryId) {
        // Get all tiles for this category - use simple filter instead of non-existent function
        const allTiles = window.tileEditor && window.tileEditor.tiles ? 
            window.tileEditor.tiles.filter(tile => tile.categoryId === categoryId || tile.categoryName === categoryId) : [];
        
        if (!allTiles || allTiles.length === 0) {
            const biomeTilesList = document.getElementById('biomeTilesList');
            if (biomeTilesList) {
                biomeTilesList.innerHTML = `
                    <div style="text-align: center; color: #ccc; padding: 2rem;">
                        <p>Keine Tiles in diesem Biome vorhanden.</p>
                        <p>Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                    </div>
                `;
            }
            return;
        }
        
        // Check if we have preloaded tiles
        const preloadedData = this.preloadedTileData ? this.preloadedTileData.get(categoryId) : null;
        const preloadedCount = preloadedData ? preloadedData.preloadedTiles.length : 0;
        
        if (preloadedCount >= allTiles.length) {
            // All tiles already loaded
            return;
        }
        
        // Load remaining tiles in background
        const remainingTiles = allTiles.slice(preloadedCount);
        
        // Use virtual scrolling for remaining tiles - IMMEDIATE
        this.loadBiomeTilesAsCards(allTiles);
    }
    
    // Setup tile loading only when scrolled to tiles area
    setupTileLoadingOnScroll(categoryId) {
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) return;
        
        // Show loading placeholder first
        biomeTilesList.innerHTML = `
            <div class="tiles-loading-placeholder" style="
                text-align: center;
                padding: 2rem;
                color: #ccc;
                font-size: 16px;
            ">
                <div style="margin-bottom: 1rem;">⏳ Tiles werden geladen...</div>
                <div style="font-size: 14px;">Scrollen Sie nach unten um Tiles zu laden</div>
            </div>
        `;
        
        // Create intersection observer for tiles area
        const tilesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Tiles area is visible, load tiles
                    this.loadTilesForCategory(categoryId);
                    tilesObserver.disconnect();
                }
            });
        }, {
            threshold: 0.3, // Trigger when 30% of tiles area is visible
            rootMargin: '100px' // Start loading 100px before reaching tiles area
        });
        
        tilesObserver.observe(biomeTilesList);
        
        // Also listen for scroll events as fallback
        const modalContent = biomeModal.querySelector('.modal-content');
        if (modalContent) {
            let scrollTimeout;
            modalContent.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                
                scrollTimeout = setTimeout(() => {
                    const { scrollTop, scrollHeight, clientHeight } = modalContent;
                    const tilesAreaTop = biomeTilesList.offsetTop;
                    
                    // If scrolled near tiles area, load tiles
                    if (scrollTop + clientHeight >= tilesAreaTop - 200) {
                        this.loadTilesForCategory(categoryId);
                        modalContent.removeEventListener('scroll', arguments.callee);
                    }
                    
                    scrollTimeout = null;
                }, 16);
            });
        }
    }
    
    // Load tiles for specific category with virtual scrolling
    loadTilesForCategory(categoryId) {
        // Check if we have preloaded tiles first
        const preloadedData = this.preloadedTileData ? this.preloadedTileData.get(categoryId) : null;
        
        if (preloadedData && preloadedData.preloadedTiles && preloadedData.preloadedTiles.length > 0) {
            // Use preloaded tiles for instant display
            this.loadBiomeTilesAsCards(preloadedData.preloadedTiles);
            return;
        }
        
        // Fallback: Get tiles for this category - use simple filter instead of non-existent function
        const tiles = window.tileEditor && window.tileEditor.tiles ? 
            window.tileEditor.tiles.filter(tile => tile.categoryId === categoryId || tile.categoryName === categoryId) : [];
        
        if (!tiles || tiles.length === 0) {
            const biomeTilesList = document.getElementById('biomeTilesList');
            if (biomeTilesList) {
                biomeTilesList.innerHTML = `
                    <div style="text-align: center; color: #ccc; padding: 2rem;">
                        <p>Keine Tiles in diesem Biome vorhanden.</p>
                        <p>Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                    </div>
                `;
            }
            return;
        }
        
        // Use virtual scrolling for maximum performance
        this.loadBiomeTilesAsCards(tiles);
    }
    
    // Generate a hash for biome data to detect changes - ULTRA-FAST
    generateBiomeHash(categories) {
        if (!categories || categories.length === 0) return 'empty';
        
        // Use a more efficient hash that only includes essential data - NO BLOCKING CALLS
        const hashData = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            // Only include tile count if it's already cached, otherwise skip
            tileCount: cat.tileCount || 0,
            // Use a simple timestamp for quick comparison
            modified: cat.lastModified || 0
        }));
        
        // Sort by ID for consistent hash generation
        hashData.sort((a, b) => a.id - b.id);
        
        // Use a faster hash algorithm
        const hashString = JSON.stringify(hashData);
        let hash = 0;
        const len = hashString.length;
        for (let i = 0; i < len; i++) {
            hash = ((hash << 5) - hash + hashString.charCodeAt(i)) >>> 0;
        }
        
        return hash.toString(36); // Use base36 for shorter hashes
    }
    
    // Cache biome data with better consistency and efficiency - NON-BLOCKING
    cacheBiomeData(hash, htmlContent) {
        // Use requestIdleCallback to avoid blocking - NON-BLOCKING
        requestIdleCallback(() => {
        // Pre-calculate tile counts for all categories to avoid repeated calls
        const categoriesWithCounts = this.allCategories.map(cat => ({
            ...cat,
                tileCount: cat.tileCount || 0,
            lastModified: Date.now()
        }));
        
        const cacheEntry = {
            html: htmlContent,
            timestamp: Date.now(),
            displayCount: this.currentDisplayCount,
            categories: categoriesWithCounts,
            hash: hash
        };
        
        this.biomeCache.set(hash, cacheEntry);
        
        // Clean old cache entries more aggressively (keep only last 3)
        this.cleanOldCacheEntries(3);
        });
    }
    
    // Clean old cache entries to prevent memory leaks - more aggressive
    cleanOldCacheEntries(maxEntries = 3) {
        if (this.biomeCache.size > maxEntries) {
            const entries = Array.from(this.biomeCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            
            // Remove oldest entries
            const toRemove = entries.slice(maxEntries);
            toRemove.forEach(([hash]) => {
                this.biomeCache.delete(hash);
            });
        }
    }
    
    // Display cached categories with better consistency
    displayCachedCategories(hash) {
        const cachedData = this.biomeCache.get(hash);
        if (!cachedData) {
            return false;
        }
        
        // Verify cache consistency
        if (!this.verifyCacheConsistency(cachedData)) {
            return false;
        }
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return false;
        
        // Restore cached HTML
        categoriesList.innerHTML = cachedData.html;
        this.currentDisplayCount = cachedData.displayCount;
        this.allCategories = cachedData.categories || [];
        
        // Re-setup infinite scroll for remaining categories
        this.setupInfiniteScroll();
        
        // Update progress indicator if needed
        if (this.currentDisplayCount < this.allCategories.length) {
            this.addProgressIndicator();
            this.updateProgressIndicator();
        }
        
        return true;
    }
    
    // Verify cache consistency - optimized version
    verifyCacheConsistency(cachedData) {
        if (!cachedData.categories || !Array.isArray(cachedData.categories)) {
            return false;
        }
        
        // Quick check: compare hash directly
        const currentHash = this.generateBiomeHash(cachedData.categories);
        if (currentHash !== cachedData.hash) {
            return false;
        }
        
        // Only check tile counts if they're significantly different (performance optimization)
        const significantChanges = cachedData.categories.some(cat => {
            // Use simple filter instead of non-existent function
            const currentCount = window.tileEditor && window.tileEditor.tiles ? 
                window.tileEditor.tiles.filter(tile => tile.categoryId === cat.id || tile.categoryName === cat.id).length : 0;
            const cachedCount = cat.tileCount || 0;
            // Only consider it a significant change if difference is > 1
            return Math.abs(currentCount - cachedCount) > 1;
        });
        
        if (significantChanges) {
            return false;
        }
        
        return true;
    }
    
    addProgressIndicator() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        // Don't show progress indicator if biome modal is open
        const biomeModal = document.getElementById('biomeModal');
        if (biomeModal && biomeModal.classList.contains('show')) {
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
                ">Alle laden</button>
            </div>
            <div style="
                background: rgba(255, 255, 255, 0.2);
                height: 4px;
                border-radius: 2px;
                overflow: hidden;
            ">
                <div id="biome-progress-bar" style="
                    background: linear-gradient(90deg, #007bff, #00d4ff);
                    height: 100%;
                    width: ${(3 / this.allCategories.length) * 100}%;
                    transition: width 0.3s ease;
                "></div>
            </div>
        `;
        
        // Insert at the beginning of the list
        categoriesList.insertBefore(progressContainer, categoriesList.firstChild);
        
        // Add click handler for manual load button
        const manualLoadBtn = document.getElementById('manual-load-categories');
        if (manualLoadBtn) {
            manualLoadBtn.addEventListener('click', () => {
                this.loadAllCategories();
            });
        }
    }
    
    updateProgressIndicator() {
        const progressText = document.getElementById('biome-progress-text');
        const progressBar = document.getElementById('biome-progress-bar');
        const progressCounter = document.getElementById('biomeProgressCounter');
        
        if (progressText && progressBar) {
            const percentage = (this.currentDisplayCount / this.allCategories.length) * 100;
            progressText.textContent = `${this.currentDisplayCount} / ${this.allCategories.length}`;
            progressBar.style.width = `${percentage}%`;
        }
        
        // Update the title counter
        if (progressCounter) {
            if (this.currentDisplayCount > 0) {
                progressCounter.style.display = 'inline-block';
                progressCounter.textContent = `${this.currentDisplayCount}/${this.allCategories.length}`;
                
                // Add complete class when all categories are loaded
                if (this.currentDisplayCount >= this.allCategories.length) {
                    progressCounter.classList.add('complete');
                    // Hide counter after 2 seconds when complete
                    setTimeout(() => {
                        progressCounter.style.display = 'none';
                    }, 2000);
                } else {
                    progressCounter.classList.remove('complete');
                }
            } else {
                progressCounter.style.display = 'none';
            }
        }
    }
    
    loadAllCategories() {
        // Show all remaining categories
        const remainingCategories = this.allCategories.slice(this.currentDisplayCount);
        remainingCategories.forEach(category => {
            this.displayCategory(category);
        });
        
        this.currentDisplayCount = this.allCategories.length;
        this.updateProgressIndicator();
        
        // Remove progress indicator
        const progressIndicator = document.getElementById('biome-progress-indicator');
        if (progressIndicator) {
            progressIndicator.remove();
        }
    }
    
    setupInfiniteScroll() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        let isLoading = false;
        
        const handleScroll = () => {
            if (isLoading) return;
            
            const scrollTop = categoriesList.scrollTop;
            const scrollHeight = categoriesList.scrollHeight;
            const clientHeight = categoriesList.clientHeight;
            
            // Load more when user is near bottom (within 50px for faster response)
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                this.loadMoreCategories();
            }
        };
        
        // Use throttled scroll handler for better performance
        let scrollTimeout;
        const throttledScroll = () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 16); // ~60fps
        };
        
        categoriesList.addEventListener('scroll', throttledScroll);
    }
    
    loadMoreCategories() {
        if (this.currentDisplayCount >= this.allCategories.length) {
            return;
        }
        
        // LOAD TWO AT A TIME: Load next 2 categories for better user experience
        const nextCategories = this.allCategories.slice(this.currentDisplayCount, this.currentDisplayCount + 2);
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        nextCategories.forEach(category => {
            const element = this.createTextOnlyBiomeCard(category);
            fragment.appendChild(element);
        });
        
        const categoriesList = document.getElementById('categoriesList');
        if (categoriesList) {
            categoriesList.appendChild(fragment);
        }
        
        this.currentDisplayCount += 2;
        this.updateProgressIndicator();
        
        // Remove progress indicator if all categories are loaded
        if (this.currentDisplayCount >= this.allCategories.length) {
            const progressIndicator = document.getElementById('biome-progress-indicator');
            if (progressIndicator) {
                progressIndicator.remove();
            }
        }
        
        this.debug(`📦 Loaded ${nextCategories.length} categories (${this.currentDisplayCount}/${this.allCategories.length})`);
    }
    
    displayCategory(category) {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        const categoryElement = this.createTextOnlyBiomeCard(category);
        
        // Use appendChild for better performance
        categoriesList.appendChild(categoryElement);
        
        // Trigger a micro-task to ensure smooth rendering - FAST SUBTLE TRANSITION
        requestAnimationFrame(() => {
            categoryElement.style.opacity = '1';
        });
    }
    
    getTypeName(type) {
        const typeNames = {
            'biome': 'Biome',
            'terrain': 'Terrain',
            'special': 'Spezial',
            'entities': 'Entities'
        };
        return typeNames[type] || type;
    }

    // Load tiles as table view - ULTRA-SIMPLE INSTANT LOADING
    loadBiomeTilesAsTable(allTiles) {
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            this.debugError('biomeTilesList element not found');
            return;
        }
        
        if (!allTiles || allTiles.length === 0) {
            biomeTilesList.innerHTML = `
                <div style="text-align: center; color: #ccc; padding: 2rem;">
                    <p>Keine Tiles in diesem Biome vorhanden.</p>
                    <p>Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                </div>
            `;
            return;
        }
        
        // Clear existing content
        biomeTilesList.innerHTML = '';
        
        // ULTRA-SIMPLE: Load all table rows immediately with placeholder images
        const fragment = document.createDocumentFragment();
        
        allTiles.forEach((tile, index) => {
            const tableRow = document.createElement('tr');
            tableRow.className = 'biome-tile-row';
            tableRow.dataset.tileId = tile.id || tile.tempId || index;
            
            // SUPER SIMPLE HTML - NO COMPLEX VIRTUAL SCROLLING
            tableRow.innerHTML = `
                <td class="tile-image-cell">
                    <div class="tile-image-container">
                        <div class="tile-loading">📄</div>
                        <img data-src="${tile.image}" alt="${tile.name}" 
                             style="display: none;"
                             onerror="this.style.display='none'; this.previousElementSibling.textContent='❌';"
                             onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                    </div>
                </td>
                <td class="tile-name-cell">
                    <span class="tile-name">${tile.name}</span>
                </td>
                <td class="tile-movement-cell">
                    <span class="movement-cost">🚶 ${tile.movementCost || 1}</span>
                </td>
                <td class="tile-defense-cell">
                    <span class="defense-bonus">🛡️ +${tile.defenseBonus || 0}</span>
                </td>
                <td class="tile-type-cell">
                    <span class="tile-type">${tile.type || 'terrain'}</span>
                </td>
                <td class="tile-description-cell">
                    <span class="tile-description">${tile.description || ''}</span>
                </td>
                <td class="tile-actions-cell">
                    <div class="tile-actions">
                        <button type="button" class="tile-action-btn" title="Tile bearbeiten">✏️</button>
                        <button type="button" class="tile-action-btn" title="Entfernen">❌</button>
                    </div>
                </td>
            `;
            
            fragment.appendChild(tableRow);
        });
        
        biomeTilesList.appendChild(fragment);
        
        // Load images lazily after table rows are displayed - IMMEDIATE
        this.loadImagesLazily(biomeTilesList);
    }

    // Load tiles as card view - ULTRA-SIMPLE INSTANT LOADING
    loadBiomeTilesAsCards(allTiles) {
        console.log('[UIManager] loadBiomeTilesAsCards called with', allTiles.length, 'tiles');
        console.log('[UIManager] Sample tile data:', allTiles.slice(0, 3));
        
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            this.debugError('biomeTilesList element not found');
            return;
        }
        
        if (!allTiles || allTiles.length === 0) {
            biomeTilesList.innerHTML = `
                <div style="text-align: center; color: #ccc; padding: 2rem;">
                    <p>Keine Tiles in diesem Biome vorhanden.</p>
                    <p>Klicke auf "+ Tile hinzufügen" um Tiles zu erstellen.</p>
                </div>
            `;
            return;
        }
        
        // Clear existing content
        biomeTilesList.innerHTML = '';
        
        // ULTRA-SIMPLE: Load all cards immediately with placeholder images
        const fragment = document.createDocumentFragment();
        
        allTiles.forEach((tile, index) => {
            const tileItem = document.createElement('div');
            tileItem.className = 'biome-tile-item';
            tileItem.dataset.tileId = tile.id || tile.tempId || index;
            
            // Ensure tile has required properties
            const tileName = tile.name || `Tile ${index + 1}`;
            const tileImage = tile.image || '';
            const movementCost = tile.movementCost || 1;
            const defenseBonus = tile.defenseBonus || 0;
            const tileType = tile.type || 'Standard';
            const tileDescription = tile.description || '';
            
            // SUPER SIMPLE HTML - NO COMPLEX VIRTUAL SCROLLING
            tileItem.innerHTML = `
                <div class="tile-actions">
                    <button type="button" class="tile-action-btn edit-tile-btn" title="Tile bearbeiten">✏️</button>
                    <button type="button" class="tile-action-btn remove-tile-btn" title="Entfernen">❌</button>
                </div>
                <div class="tile-image-container">
                    ${tileImage ? 
                        `<img src="${tileImage}" alt="${tileName}" 
                             onerror="console.log('[UIManager] Image error:', this.src); this.style.display='none'; this.nextElementSibling.style.display='block';"
                             onload="console.log('[UIManager] Image loaded:', this.src); this.nextElementSibling.style.display='none';">` : 
                        ''
                    }
                    <div class="tile-placeholder" style="display: ${tileImage ? 'none' : 'block'}; font-size: 24px; text-align: center; background: #333; color: white; padding: 8px; border-radius: 4px;">${tileName.charAt(0)}</div>
                </div>
                <div class="tile-info">
                    <div class="tile-name">${tileName}</div>
                    <div class="tile-stats">
                        <span class="movement-cost" style="color: #4CAF50;">🚶 ${movementCost}</span>
                        <span class="defense-bonus" style="color: #2196F3;">🛡️ +${defenseBonus}</span>
                        <span class="tile-type" style="color: #FF9800;">${tileType}</span>
                        ${tileDescription ? `<span class="tile-description" style="color: #757575; font-size: 12px;">${tileDescription}</span>` : ''}
                    </div>
                </div>
            `;
            
            // Add event listeners efficiently
            const tileId = tile.id || tile.tempId || index;
            this.addTileCardEventListeners(tileItem, tileId);
            
            fragment.appendChild(tileItem);
        });
        
        biomeTilesList.appendChild(fragment);
        
        console.log('[UIManager] Cards loaded successfully');
    }
    
    // Load images lazily after cards are displayed
    loadImagesLazily(container) {
        const images = container.querySelectorAll('img[data-src]');
        console.log('[UIManager] loadImagesLazily called with', images.length, 'images');
        
        // Load all images immediately instead of lazy loading
        images.forEach(img => {
            console.log('[UIManager] Loading image immediately:', img.dataset.src);
            if (img.dataset.src && !img.src) {
                // Fix the image path - remove /modules/tileEditor prefix if present
                let imagePath = img.dataset.src;
                if (imagePath.startsWith('/modules/tileEditor/')) {
                    imagePath = imagePath.replace('/modules/tileEditor', '');
                }
                // Also handle relative paths
                if (imagePath.startsWith('assets/')) {
                    imagePath = '/' + imagePath;
                }
                
                // Add cache busting for Buildings tiles
                if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
                    const timestamp = Date.now();
                    imagePath = imagePath + (imagePath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
                    console.log('[UIManager] Cache busted path for Buildings:', imagePath);
                }
                
                img.src = imagePath;
            }
        });
    }

    // Preload images in background using Web Worker
    preloadImagesInBackground(tiles) {
        // Create a simple image preloader without Web Worker for now
        // (Web Workers require additional setup)
        const imageUrls = tiles.map(tile => tile.image).filter(Boolean);
        
        // Preload in chunks to avoid blocking
        const chunkSize = 10;
        let currentChunk = 0;
        
        const preloadChunk = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, imageUrls.length);
            
            for (let i = start; i < end; i++) {
                const img = new Image();
                img.src = imageUrls[i];
                img.onload = () => {
                    this.imageCache.set(imageUrls[i], img);
                };
            }
            
            currentChunk++;
            
            if (currentChunk * chunkSize < imageUrls.length) {
                preloadChunk(); // IMMEDIATE - NO DELAY
            }
        };
        
        // Start preloading
        if (imageUrls.length > 0) {
            preloadChunk();
        }
    }

    // Create a table row for a tile
    createTileTableRow(tile, index) {
        // Use the correct ID: either tile.id for assigned tiles or tile.tempId for unassigned tiles
        const tileId = tile.id || tile.tempId || index;
        
        // Get biome emoji as fallback
        const biomeEmoji = this.getBiomeEmoji(tile.categoryName || 'unknown');
        
        const tableRow = document.createElement('tr');
        tableRow.className = 'biome-tile-row';
        tableRow.dataset.tileId = tileId;
        
        if (tile.isUnassigned) {
            tableRow.classList.add('unassigned-tile');
            tableRow.dataset.isUnassigned = 'true';
        }
        if (tile.isDefault) {
            tableRow.classList.add('default-tile');
            tableRow.dataset.isDefault = 'true';
        }
        
        tableRow.innerHTML = `
            <td class="tile-image-cell">
                <div class="tile-image-container">
                    <div class="tile-loading">Laden...</div>
                    <img src="${encodeURI(tile.image)}" alt="${tile.name}" 
                         onerror="this.style.display='none';"
                         onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                </div>
            </td>
            <td class="tile-name-cell">
                <span class="tile-name" data-tile-id="${tileId}" contenteditable="true">${tile.name}</span>
                ${tile.isUnassigned ? '<span class="unassigned-badge">(Unassigned)</span>' : ''}
            </td>
            <td class="tile-movement-cell">
                <span class="movement-cost">🚶 ${tile.movementCost || 1}</span>
            </td>
            <td class="tile-defense-cell">
                <span class="defense-bonus">🛡️ +${tile.defenseBonus || 0}</span>
            </td>
            <td class="tile-category-cell">
                <select class="category-dropdown" data-tile-id="${tileId}">
                    <option value="">Keine Kategorie</option>
                    <option value="mining_site" ${tile.buildingCategory === 'mining_site' ? 'selected' : ''}>⛏️ Mining Site</option>
                    <option value="tower" ${tile.buildingCategory === 'tower' ? 'selected' : ''}>🗼 Tower</option>
                    <option value="building" ${tile.buildingCategory === 'building' ? 'selected' : ''}>🏢 Building</option>
                    <option value="settlement" ${tile.buildingCategory === 'settlement' ? 'selected' : ''}>🏘️ Settlement</option>
                    <option value="castle" ${tile.buildingCategory === 'castle' ? 'selected' : ''}>🏰 Castle</option>
                    <option value="village" ${tile.buildingCategory === 'village' ? 'selected' : ''}>🏡 Village</option>
                    <option value="temple" ${tile.buildingCategory === 'temple' ? 'selected' : ''}>⛪ Temple</option>
                    <option value="ritual_site" ${tile.buildingCategory === 'ritual_site' ? 'selected' : ''}>🔮 Ritual Site</option>
                </select>
            </td>
            <td class="tile-default-cell">
                ${tile.isDefault ? '<span class="default-badge">⭐ Standard</span>' : '<span class="not-default">-</span>'}
            </td>
            <td class="tile-actions-cell">
                <div class="tile-actions">
                    <button type="button" class="tile-action-btn edit-tile-btn" title="Tile bearbeiten">✏️</button>
                    <button type="button" class="tile-action-btn remove-tile-btn" title="Entfernen">❌</button>
                </div>
            </td>
        `;
        
        // Add click handler for row selection
        tableRow.addEventListener('click', (e) => {
            // Don't trigger selection when clicking action buttons or name
            if (!e.target.classList.contains('tile-action-btn') && !e.target.classList.contains('tile-name')) {
                this.selectBiomeTile(tileId);
            }
        });

        // Add double-click handler to open tile modal
        tableRow.addEventListener('dblclick', (e) => {
            // Don't trigger when clicking action buttons
            if (!e.target.classList.contains('tile-action-btn')) {
                this.openTileModalFromBiome(tileId);
            }
        });

        // Add event listeners for action buttons
        const editBtn = tableRow.querySelector('.edit-tile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                console.log('[UIManager] Table edit button clicked for tileId:', tileId);
                e.stopPropagation();
                this.openTileModalFromBiome(tileId);
            });
        }

        const removeBtn = tableRow.querySelector('.remove-tile-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTileFromBiome(tileId);
            });
        }

        return tableRow;
    }

    // Create a card for a tile - Optimized version with LAZY IMAGE LOADING
    createTileCard(tile, index) {
        const tileId = tile.id || tile.tempId || index;
        
        const tileItem = document.createElement('div');
        tileItem.className = 'biome-tile-item';
        tileItem.dataset.tileId = tileId;
        
        if (tile.isUnassigned) {
            tileItem.classList.add('unassigned-tile');
            tileItem.dataset.isUnassigned = 'true';
        }
        if (tile.isDefault) {
            tileItem.classList.add('default-tile');
            tileItem.dataset.isDefault = 'true';
        }
        
        // Pre-calculate values for better performance
        const buildingIcon = this.getBuildingCategoryIcon(tile.buildingCategory || '');
        const unassignedBadge = tile.isUnassigned ? '<div class="unassigned-badge">(Unassigned)</div>' : '';
        const defaultBadge = tile.isDefault ? '<div class="default-badge">⭐ Standard</div>' : '';
        
        tileItem.innerHTML = `
            <div class="tile-actions">
                <button type="button" class="tile-action-btn edit-tile-btn" title="Tile bearbeiten">✏️</button>
                <button type="button" class="tile-action-btn remove-tile-btn" title="Entfernen">❌</button>
            </div>
            <div class="tile-image-container">
                <div class="tile-loading">📄</div>
                <img data-src="${encodeURI(tile.image)}" alt="${tile.name}" 
                     style="display: none;"
                     onerror="this.style.display='none'; this.previousElementSibling.textContent='❌';"
                     onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                <div class="tile-type-icon">${buildingIcon}</div>
            </div>
            <div class="tile-info">
                <div class="tile-name" data-tile-id="${tileId}" contenteditable="true">${tile.name}</div>
                ${unassignedBadge}
                <div class="tile-stats">
                    <span class="movement-cost">🚶 ${tile.movementCost || 1}</span>
                    <span class="defense-bonus">🛡️ +${tile.defenseBonus || 0}</span>
                </div>
                ${defaultBadge}
            </div>
        `;
        
        // Add event listeners efficiently
        this.addTileCardEventListeners(tileItem, tileId);
        
        return tileItem;
    }

    // Preload ALL tile images for instant loading
    preloadAllTileImages(tiles) {
        if (!tiles || tiles.length === 0) return;
        
        // Create a promise-based preloader for better performance
        const preloadPromises = [];
        
        tiles.forEach(tile => {
            if (tile.image && !this.imageCache.has(tile.image)) {
                const preloadPromise = new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        this.imageCache.set(tile.image, img);
                        resolve();
                    };
                    img.onerror = () => {
                        // Silently handle errors but still resolve
                        resolve();
                    };
                    img.src = tile.image;
                });
                preloadPromises.push(preloadPromise);
            }
        });
        
        // Start preloading in background without blocking
        Promise.all(preloadPromises).catch(() => {
            // Ignore errors, continue with loading
        });
    }
    
    // Create tile elements in batch for MAXIMUM SPEED - LAZY IMAGE LOADING
    createTileElementsBatchUltraFast(tiles) {
        const elements = [];
        
        // Pre-calculate ALL values for maximum speed - use static maps
        const buildingIcons = new Map([
            ['mining_site', '⛏️'],
            ['tower', '🗼'],
            ['building', '🏢'],
            ['settlement', '🏘️'],
            ['castle', '🏰'],
            ['village', '🏡'],
            ['temple', '⛪'],
            ['ritual_site', '🔮'],
            ['', '🏠']
        ]);
        
        const unassignedBadges = new Map([
            [true, '<div class="unassigned-badge">(Unassigned)</div>'],
            [false, '']
        ]);
        
        const defaultBadges = new Map([
            [true, '<div class="default-badge">⭐ Standard</div>'],
            [false, '']
        ]);
        
        // Pre-calculate movement and defense values
        const movementCosts = new Map();
        const defenseBonuses = new Map();
        
        tiles.forEach((tile, index) => {
            const tileId = tile.id || tile.tempId || index;
            
            // Cache movement and defense values
            const movementCost = tile.movementCost || 1;
            const defenseBonus = tile.defenseBonus || 0;
            
            if (!movementCosts.has(movementCost)) {
                movementCosts.set(movementCost, `🚶 ${movementCost}`);
            }
            
            if (!defenseBonuses.has(defenseBonus)) {
                defenseBonuses.set(defenseBonus, `🛡️ +${defenseBonus}`);
            }
            
            const tileItem = document.createElement('div');
            tileItem.className = 'biome-tile-item';
            tileItem.dataset.tileId = tileId;
            
            if (tile.isUnassigned) {
                tileItem.classList.add('unassigned-tile');
                tileItem.dataset.isUnassigned = 'true';
            }
            if (tile.isDefault) {
                tileItem.classList.add('default-tile');
                tileItem.dataset.isDefault = 'true';
            }
            
            // Use cached values for maximum speed
            const buildingIcon = buildingIcons.get(tile.buildingCategory) || '🏠';
            const unassignedBadge = unassignedBadges.get(tile.isUnassigned);
            const defaultBadge = defaultBadges.get(tile.isDefault);
            const movementText = movementCosts.get(movementCost);
            const defenseText = defenseBonuses.get(defenseBonus);
            
            tileItem.innerHTML = `
                <div class="tile-actions">
                    <button type="button" class="tile-action-btn edit-tile-btn" title="Tile bearbeiten">✏️</button>
                    <button type="button" class="tile-action-btn remove-tile-btn" title="Entfernen">❌</button>
                </div>
                <div class="tile-image-container">
                    <div class="tile-loading">📄</div>
                    <img data-src="${encodeURI(tile.image)}" alt="${tile.name}" 
                         style="display: none;"
                         onerror="this.style.display='none'; this.previousElementSibling.textContent='❌';"
                         onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                    <div class="tile-type-icon">${buildingIcon}</div>
                </div>
                <div class="tile-info">
                    <div class="tile-name" data-tile-id="${tileId}" contenteditable="true">${tile.name}</div>
                    ${unassignedBadge}
                    <div class="tile-stats">
                        <span class="movement-cost">${movementText}</span>
                        <span class="defense-bonus">${defenseText}</span>
                    </div>
                    ${defaultBadge}
                </div>
            `;
            
            // Add event listeners efficiently
            this.addTileCardEventListeners(tileItem, tileId);
            
            elements.push(tileItem);
        });
        
        return elements;
    }
    
    // Load images for a batch of tiles instantly - LAZY IMAGE LOADING
    loadImagesForBatchInstant(container, tiles) {
        const images = container.querySelectorAll('img[data-src]');
        
        // Use Intersection Observer for lazy loading - ONLY WHEN VISIBLE
        if (!this.batchImageObserver) {
            this.batchImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src && !img.src) {
                            // Only load image when it becomes visible
                            img.src = img.dataset.src;
                        }
                    }
                });
            }, {
                rootMargin: '100px', // Start loading 100px before item becomes visible
                threshold: 0.1 // Trigger when 10% of image is visible
            });
        }
        
        // Observe all images for lazy loading
        images.forEach(img => {
            this.batchImageObserver.observe(img);
        });
    }
    
    // Maximum speed lazy loading with massive batches
    setupMaximumSpeedLazyLoading(container, allTiles, batchSize = 100) {
        let loadedCount = batchSize;
        let isLoading = false;
        
        const loadMoreTiles = () => {
            if (isLoading || loadedCount >= allTiles.length) return;
            
            isLoading = true;
            
            // Load massive batches for maximum performance
            const nextBatchSize = Math.min(100, allTiles.length - loadedCount);
            const nextBatch = allTiles.slice(loadedCount, loadedCount + nextBatchSize);
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Pre-calculate all HTML strings for maximum speed
            const tileElements = this.createTileElementsBatchUltraFast(nextBatch);
            tileElements.forEach(element => fragment.appendChild(element));
            
            container.appendChild(fragment);
            
            // Load images immediately for the new batch
            this.loadImagesForBatchInstant(container, nextBatch);
            
            loadedCount += nextBatchSize;
            isLoading = false;
        };
        
        // Intersection Observer for infinite scroll with massive margin
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('load-more-trigger')) {
                    loadMoreTiles();
                }
            });
        }, {
            rootMargin: '500px' // Load 500px before reaching the end for ultra-smooth experience
        });
        
        // Add trigger element
        const trigger = document.createElement('div');
        trigger.className = 'load-more-trigger';
        trigger.style.height = '20px';
        trigger.style.width = '100%';
        container.appendChild(trigger);
        observer.observe(trigger);
        
        // Also listen to scroll events as fallback with ultra-throttling
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                const { scrollTop, scrollHeight, clientHeight } = container;
                if (scrollTop + clientHeight >= scrollHeight - 500 && !isLoading) {
                    loadMoreTiles();
                }
                scrollTimeout = null;
            }, 8); // ~120fps for ultra-smooth scrolling
        });
    }
    
    // Load images for a batch of tiles immediately - Optimized with LAZY LOADING
    loadImagesForBatch(container, tiles) {
        const images = container.querySelectorAll('img[data-src]');
        
        // Use Intersection Observer for lazy loading - ONLY WHEN VISIBLE
        if (!this.batchImageObserver) {
            this.batchImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src && !img.src) {
                            // Only load image when it becomes visible
                            img.src = img.dataset.src;
                        }
                    }
                });
            }, {
                rootMargin: '100px', // Start loading 100px before item becomes visible
                threshold: 0.1 // Trigger when 10% of image is visible
            });
        }
        
        // Observe all images for lazy loading
        images.forEach(img => {
            this.batchImageObserver.observe(img);
        });
    }
    
    // Add event listeners efficiently to tile cards
    addTileCardEventListeners(tileItem, tileId) {
        console.log('[UIManager] Adding event listeners for tileId:', tileId);
        
        // Add click handlers
        tileItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tile-action-btn')) {
                this.selectBiomeTile(tileId);
            }
        });
        
        tileItem.addEventListener('dblclick', (e) => {
            if (!e.target.classList.contains('tile-action-btn')) {
                this.openTileModalFromBiome(tileId);
            }
        });
        
        // Add event listeners for action buttons
        const editBtn = tileItem.querySelector('.edit-tile-btn');
        console.log('[UIManager] Looking for edit button in tileItem:', tileItem);
        console.log('[UIManager] Edit button found:', !!editBtn);
        if (editBtn) {
            console.log('[UIManager] Adding click listener to edit button for tileId:', tileId);
            editBtn.addEventListener('click', (e) => {
                console.log('[UIManager] Edit button clicked for tileId:', tileId);
                e.stopPropagation();
                this.openTileModalFromBiome(tileId);
            });
        } else {
            console.error('[UIManager] Edit button not found for tileId:', tileId);
            console.error('[UIManager] Available elements:', tileItem.querySelectorAll('*'));
        }
        
        const removeBtn = tileItem.querySelector('.remove-tile-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTileFromBiome(tileId);
            });
        }
    }

    // Add tile directly to table
    addTileToTableDirectly(tileData, category) {
        const biomeTilesList = document.getElementById('biomeTilesList');
        if (!biomeTilesList) {
            this.debugError('biomeTilesList not found');
            return;
        }
        
        // Check if we're in table view
        const tableViewBtn = document.getElementById('toggleTableView');
        const isTableView = tableViewBtn && tableViewBtn.classList.contains('active');
        
        if (!isTableView) {
            return;
        }
        
        // Find the table body
        const tableBody = biomeTilesList.querySelector('tbody');
        if (!tableBody) {
            // Create new table if it doesn't exist
            biomeTilesList.innerHTML = `
                <table class="biome-tiles-table">
                    <thead>
                        <tr>
                            <th>Bild</th>
                            <th>Name</th>
                            <th>Bewegung</th>
                            <th>Verteidigung</th>
                            <th>Kategorie</th>
                            <th>Standard</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody id="biomeTilesTableBody">
                    </tbody>
                </table>
            `;
        }
        
        // Get the table body (either existing or newly created)
        const tableBodyElement = biomeTilesList.querySelector('tbody') || document.getElementById('biomeTilesTableBody');
        if (!tableBodyElement) {
            this.debugError('Could not find or create table body');
            return;
        }
        
        // Create new table row
        const newRow = document.createElement('tr');
        newRow.dataset.tileId = tileData.id || tileData.tempId;
        newRow.className = 'biome-tile-row';
        
        newRow.innerHTML = `
            <td class="tile-image-cell">
                <div class="tile-image-container">
                    <div class="tile-loading">Laden...</div>
                    <img src="${encodeURI(tileData.image)}" alt="${tileData.name}" 
                         onerror="this.style.display='none';"
                         onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                </div>
            </td>
            <td class="tile-name-cell">
                <span class="tile-name">${tileData.name}</span>
            </td>
            <td class="tile-movement-cell">
                <span class="movement-cost">${tileData.movementCost || 1}</span>
            </td>
            <td class="tile-defense-cell">
                <span class="defense-bonus">${tileData.defenseBonus || 0}</span>
            </td>
            <td class="tile-category-cell">
                <span class="building-category">${tileData.buildingCategory || 'Keine Kategorie'}</span>
            </td>
            <td class="tile-default-cell">
                <span class="not-default">Nein</span>
            </td>
            <td class="tile-actions-cell">
                <div class="tile-actions">
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.openTileModalFromBiome(${tileData.id || tileData.tempId})" title="Tile bearbeiten">✏️</button>
                    <button type="button" class="tile-action-btn" onclick="window.tileEditor.removeTileFromBiome(${tileData.id || tileData.tempId})" title="Entfernen">❌</button>
                </div>
            </td>
        `;
        
        // Add click handlers
        newRow.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tile-action-btn')) {
                this.selectBiomeTile(tileData.id || tileData.tempId);
            }
        });
        
        newRow.addEventListener('dblclick', (e) => {
            if (!e.target.classList.contains('tile-action-btn')) {
                this.openTileModalFromBiome(tileData.id);
            }
        });
        
        // Add to the beginning of the table
        tableBodyElement.insertBefore(newRow, tableBodyElement.firstChild);
        
        // Update tile count
        this.updateBiomeTileCount(category);
    }

    // Helper methods (these would need to be implemented or moved from ModalManager)
    getBiomeEmoji(biomeName) {
        // Implementation needed
        return '🌍';
    }

    getBuildingCategoryIcon(category) {
        // Implementation needed
        return '🏠';
    }

    selectBiomeTile(tileId) {
        // Implementation needed
    }

    openTileModalFromBiome(tileId) {
        console.log('[UIManager] openTileModalFromBiome called with tileId:', tileId);
        // Call the main tileEditor's openTileModalFromBiome function
        if (window.tileEditor && window.tileEditor.openTileModalFromBiome) {
            console.log('[UIManager] Calling tileEditor.openTileModalFromBiome');
            window.tileEditor.openTileModalFromBiome(tileId);
        } else {
            console.error('[UIManager] tileEditor.openTileModalFromBiome not available');
            this.debugError('tileEditor.openTileModalFromBiome not available');
            // Fallback: try to open tile modal directly
            if (window.tileEditor && window.tileEditor.openTileModal) {
                console.log('[UIManager] Trying fallback to tileEditor.openTileModal');
                window.tileEditor.openTileModal(tileId);
            } else {
                console.error('[UIManager] tileEditor.openTileModal not available');
                this.debugError('tileEditor.openTileModal not available');
                alert('Tile-Editor nicht verfügbar');
            }
        }
    }

    removeTileFromBiome(tileId) {
        // Call the main tileEditor's removeTileFromBiome function
        if (window.tileEditor && window.tileEditor.removeTileFromBiome) {
            window.tileEditor.removeTileFromBiome(tileId);
        } else {
            this.debugError('tileEditor.removeTileFromBiome not available');
            alert('Tile-Editor nicht verfügbar');
        }
    }

    updateBiomeTileCount(category) {
        // Implementation needed
    }

    loadImageWithRetry(img, retryCount = 0) {
        if (retryCount >= 3) {
            this.debugError('Failed to load image after 3 retries:', img.dataset.src);
            return;
        }
        
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.onerror = () => {
                this.loadImageWithRetry(img, retryCount + 1); // IMMEDIATE RETRY - NO DELAY
            };
        }
    }
    
    // Invalidate cache for specific biome or all with better consistency
    invalidateCache(biomeId = null) {
        if (biomeId) {
            // Invalidate specific biome by removing its hash
            this.lastBiomeHash = null; // Force refresh
            
            // Update the specific biome in allCategories if it exists
            if (this.allCategories) {
                const biomeIndex = this.allCategories.findIndex(cat => cat.id === biomeId);
                if (biomeIndex !== -1) {
                    // Update tile count - use simple filter instead of non-existent function
                    const currentCount = window.tileEditor && window.tileEditor.tiles ? 
                        window.tileEditor.tiles.filter(tile => tile.categoryId === biomeId || tile.categoryName === biomeId).length : 0;
                    this.allCategories[biomeIndex].tileCount = currentCount;
                    this.allCategories[biomeIndex].lastModified = Date.now();
                }
            }
        } else {
            // Clear entire cache
            this.biomeCache.clear();
            this.lastBiomeHash = null;
        }
    }
    
    // Update cache when biome data changes with better consistency
    updateBiomeInCache(biomeId, newData) {
        this.invalidateCache(biomeId);
        
        // If we have current categories, regenerate hash
        if (this.allCategories) {
            const updatedCategories = this.allCategories.map(cat => 
                cat.id === biomeId ? { ...cat, ...newData, lastModified: Date.now() } : cat
            );
            this.lastBiomeHash = this.generateBiomeHash(updatedCategories);
        }
    }
    
    // Create table rows in batch for maximum speed
    createTableRowsBatch(tiles) {
        const rows = [];
        
        // Pre-calculate all values for maximum speed
        const biomeEmojis = new Map();
        const unassignedBadges = new Map();
        const defaultBadges = new Map();
        
        tiles.forEach((tile, index) => {
            const tileId = tile.id || tile.tempId || index;
            
            // Cache biome emoji
            if (!biomeEmojis.has(tile.categoryName)) {
                biomeEmojis.set(tile.categoryName, this.getBiomeEmoji(tile.categoryName || 'unknown'));
            }
            
            // Cache badges
            if (!unassignedBadges.has(tile.isUnassigned)) {
                unassignedBadges.set(tile.isUnassigned, tile.isUnassigned ? '<span class="unassigned-badge">(Unassigned)</span>' : '');
            }
            
            if (!defaultBadges.has(tile.isDefault)) {
                defaultBadges.set(tile.isDefault, tile.isDefault ? '<span class="default-badge">⭐ Standard</span>' : '<span class="not-default">-</span>');
            }
            
            const tableRow = document.createElement('tr');
            tableRow.className = 'biome-tile-row';
            tableRow.dataset.tileId = tileId;
            
            if (tile.isUnassigned) {
                tableRow.classList.add('unassigned-tile');
                tableRow.dataset.isUnassigned = 'true';
            }
            if (tile.isDefault) {
                tableRow.classList.add('default-tile');
                tableRow.dataset.isDefault = 'true';
            }
            
            // Use cached values for maximum speed
            const biomeEmoji = biomeEmojis.get(tile.categoryName);
            const unassignedBadge = unassignedBadges.get(tile.isUnassigned);
            const defaultBadge = defaultBadges.get(tile.isDefault);
            
            tableRow.innerHTML = `
                <td class="tile-image-cell">
                    <div class="tile-image-container">
                        <div class="tile-loading">Laden...</div>
                        <img src="${encodeURI(tile.image)}" alt="${tile.name}" 
                             onerror="this.style.display='none';"
                             onload="this.style.display='block'; this.previousElementSibling.style.display='none';">
                    </div>
                </td>
                <td class="tile-name-cell">
                    <span class="tile-name" data-tile-id="${tileId}" contenteditable="true">${tile.name}</span>
                    ${unassignedBadge}
                </td>
                <td class="tile-movement-cell">
                    <span class="movement-cost">🚶 ${tile.movementCost || 1}</span>
                </td>
                <td class="tile-defense-cell">
                    <span class="defense-bonus">🛡️ +${tile.defenseBonus || 0}</span>
                </td>
                <td class="tile-category-cell">
                    <select class="category-dropdown" data-tile-id="${tileId}">
                        <option value="">Keine Kategorie</option>
                        <option value="mining_site" ${tile.buildingCategory === 'mining_site' ? 'selected' : ''}>⛏️ Mining Site</option>
                        <option value="tower" ${tile.buildingCategory === 'tower' ? 'selected' : ''}>🗼 Tower</option>
                        <option value="building" ${tile.buildingCategory === 'building' ? 'selected' : ''}>🏢 Building</option>
                        <option value="settlement" ${tile.buildingCategory === 'settlement' ? 'selected' : ''}>🏘️ Settlement</option>
                        <option value="castle" ${tile.buildingCategory === 'castle' ? 'selected' : ''}>🏰 Castle</option>
                        <option value="village" ${tile.buildingCategory === 'village' ? 'selected' : ''}>🏡 Village</option>
                        <option value="temple" ${tile.buildingCategory === 'temple' ? 'selected' : ''}>⛪ Temple</option>
                        <option value="ritual_site" ${tile.buildingCategory === 'ritual_site' ? 'selected' : ''}>🔮 Ritual Site</option>
                    </select>
                </td>
                <td class="tile-default-cell">
                    ${defaultBadge}
                </td>
                <td class="tile-actions-cell">
                    <div class="tile-actions">
                        <button type="button" class="tile-action-btn edit-tile-btn" title="Tile bearbeiten">✏️</button>
                        <button type="button" class="tile-action-btn remove-tile-btn" title="Entfernen">❌</button>
                    </div>
                </td>
            `;
            
            // Add click handler for row selection
            tableRow.addEventListener('click', (e) => {
                // Don't trigger selection when clicking action buttons or name
                if (!e.target.classList.contains('tile-action-btn') && !e.target.classList.contains('tile-name')) {
                    this.selectBiomeTile(tileId);
                }
            });

            // Add double-click handler to open tile modal
            tableRow.addEventListener('dblclick', (e) => {
                // Don't trigger when clicking action buttons
                if (!e.target.classList.contains('tile-action-btn')) {
                    this.openTileModalFromBiome(tileId);
                }
            });

            // Add event listeners for action buttons
            const editBtn = tableRow.querySelector('.edit-tile-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openTileModalFromBiome(tileId);
                });
            }

            const removeBtn = tableRow.querySelector('.remove-tile-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeTileFromBiome(tileId);
                });
            }

            rows.push(tableRow);
        });
        
        return rows;
    }
    
    // Ultra-fast table lazy loading with larger batches
    setupUltraFastTableLazyLoading(tableBody, allTiles, batchSize = 50) {
        let loadedCount = batchSize;
        let isLoading = false;
        
        const loadMoreRows = () => {
            if (isLoading || loadedCount >= allTiles.length) return;
            
            isLoading = true;
            
            // Load larger batches for better performance
            const nextBatchSize = Math.min(50, allTiles.length - loadedCount);
            const nextBatch = allTiles.slice(loadedCount, loadedCount + nextBatchSize);
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Pre-calculate all table rows for maximum speed
            const tableRows = this.createTableRowsBatch(nextBatch);
            tableRows.forEach(row => fragment.appendChild(row));
            
            tableBody.appendChild(fragment);
            
            // Load images immediately for the new batch
            this.loadImagesForBatchInstant(tableBody, nextBatch);
            
            loadedCount += nextBatchSize;
            isLoading = false;
        };
        
        // Intersection Observer for infinite scroll with larger margin
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('load-more-trigger')) {
                    loadMoreRows();
                }
            });
        }, {
            rootMargin: '200px'
        });
        
        // Add trigger element
        const trigger = document.createElement('tr');
        trigger.className = 'load-more-trigger';
        trigger.innerHTML = '<td colspan="7" style="height: 20px;"></td>';
        tableBody.appendChild(trigger);
        observer.observe(trigger);
    }
    
    // Force cache refresh for all biomes
    forceCacheRefresh() {
        this.biomeCache.clear();
        this.lastBiomeHash = null;
        
        // Update all tile counts - use simple filter instead of non-existent function
        if (this.allCategories) {
            this.allCategories.forEach(cat => {
                cat.tileCount = window.tileEditor && window.tileEditor.tiles ? 
                    window.tileEditor.tiles.filter(tile => tile.categoryId === cat.id || tile.categoryName === cat.id).length : 0;
                cat.lastModified = Date.now();
            });
        }
    }

    // Test function to manually show progress counter
    testProgressCounter() {
        this.debug('🧪 Testing progress counter...');
        const progressCounter = document.getElementById('biomeProgressCounter');
        if (progressCounter) {
            progressCounter.style.display = 'inline-block';
            progressCounter.textContent = '5/10';
            progressCounter.classList.remove('complete');
            this.debug('✅ Test counter shown:', progressCounter.textContent);
        } else {
            this.debugError('❌ Test counter element not found!');
        }
    }
}

// Make globally available
window.UIManager = UIManager;
