/**
 * Debug Fly-in Card - JavaScript Version
 * Can be loaded as a script to add debug functionality to any page
 */

(function() {
    'use strict';

    // Global variables
    let debugFlyinOpen = false;
    let performanceMonitoring = false;
    let serverMonitoring = false;
    let autoRefresh = false;
    let delayedLoadingEnabled = false;
    let originalDisplayCategories = null;
    let autoRefreshInterval = null;
    let fpsInterval = null;
    let memoryInterval = null;
    let serverInterval = null;

    // Load saved state from localStorage
    function loadDebugState() {
        const savedState = localStorage.getItem('debugFlyinCardState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                debugFlyinOpen = state.isOpen || false;
                performanceMonitoring = state.performanceMonitoring || false;
                serverMonitoring = state.serverMonitoring || false;
                autoRefresh = state.autoRefresh || false;
                delayedLoadingEnabled = state.delayedLoadingEnabled || false;
            } catch (e) {
                console.warn('[DebugFlyinCard] Failed to load saved state:', e);
            }
        }
    }

    // Save current state to localStorage
    function saveDebugState() {
        const state = {
            isOpen: debugFlyinOpen,
            performanceMonitoring: performanceMonitoring,
            serverMonitoring: serverMonitoring,
            autoRefresh: autoRefresh,
            delayedLoadingEnabled: delayedLoadingEnabled
        };
        localStorage.setItem('debugFlyinCardState', JSON.stringify(state));
    }

    // Create and inject the debug fly-in card
    function createDebugFlyinCard() {
        const existingCard = document.getElementById('debugFlyinCard');
        if (existingCard) {
            return; // Already exists
        }

        // Load saved state first
        loadDebugState();

        // Create trigger button
        const triggerBtn = document.createElement('button');
        triggerBtn.className = 'debug-flyin-trigger';
        triggerBtn.onclick = toggleDebugFlyin;
        triggerBtn.title = 'Debug Panel';
        triggerBtn.innerHTML = '🐛';
        triggerBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            z-index: 9998;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        `;

        // Create fly-in container
        const container = document.createElement('div');
        container.id = 'debugFlyinCard';
        container.className = 'debug-flyin-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: -400px;
            width: 380px;
            height: calc(100vh - 40px);
            background: #1a1a1a;
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 9999;
            transition: right 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            border: 2px solid #4CAF50;
        `;

        // Create header
        const header = document.createElement('div');
        header.className = 'debug-flyin-header';
        header.style.cssText = `
            background: #2a2a2a;
            padding: 15px;
            border-bottom: 1px solid #444;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('div');
        title.className = 'debug-flyin-title';
        title.innerHTML = '🐛 Debug Panel';
        title.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            color: #4CAF50;
        `;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'debug-flyin-toggle';
        toggleBtn.innerHTML = '✕';
        toggleBtn.onclick = toggleDebugFlyin;
        toggleBtn.style.cssText = `
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;

        header.appendChild(title);
        header.appendChild(toggleBtn);

        // Create content
        const content = document.createElement('div');
        content.className = 'debug-flyin-content';
        content.style.cssText = `
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            font-size: 12px;
        `;

        // Add sections
        content.innerHTML = `
            <!-- System Status -->
            <div class="debug-section" style="background: #333; border: 1px solid #555; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;"><span style="display: inline-block; width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; margin-right: 5px;"></span>System Status</h3>
                <button onclick="checkSystemStatus()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Check Status</button>
                <button onclick="checkTileEditor()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Check TileEditor</button>
                <button onclick="checkBiomeData()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Check BiomeData</button>
                <div id="system-status-log" class="debug-log" style="background: #222; padding: 8px; border-radius: 3px; margin-top: 8px; font-family: monospace; font-size: 10px; max-height: 100px; overflow-y: auto;"></div>
            </div>

            <!-- Performance -->
            <div class="debug-section" style="background: #333; border: 1px solid #555; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;"><span style="display: inline-block; width: 8px; height: 8px; background: #2196F3; border-radius: 50%; margin-right: 5px;"></span>Performance</h3>
                <button onclick="startPerformanceMonitoring()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Start Monitor</button>
                <button onclick="stopPerformanceMonitoring()" style="background: #f44336; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Stop Monitor</button>
                <div class="debug-metrics" style="display: flex; gap: 10px; margin: 8px 0;">
                    <div class="metric-item" style="text-align: center;">
                        <div class="metric-value" id="fps-value" style="font-size: 18px; font-weight: bold; color: #4CAF50;">--</div>
                        <div class="metric-label" style="font-size: 10px; color: #999;">FPS</div>
                    </div>
                    <div class="metric-item" style="text-align: center;">
                        <div class="metric-value" id="memory-value" style="font-size: 18px; font-weight: bold; color: #4CAF50;">--</div>
                        <div class="metric-label" style="font-size: 10px; color: #999;">Memory</div>
                    </div>
                </div>
                <div id="performance-log" class="debug-log" style="background: #222; padding: 8px; border-radius: 3px; margin-top: 8px; font-family: monospace; font-size: 10px; max-height: 100px; overflow-y: auto;"></div>
            </div>

                         <!-- Biome Cards -->
             <div class="debug-section" style="background: #333; border: 1px solid #555; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                 <h3 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;"><span style="display: inline-block; width: 8px; height: 8px; background: #FF9800; border-radius: 50%; margin-right: 5px;"></span>Biome Cards</h3>
                 <button onclick="analyzeBiomeCards()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Analyze Cards</button>
                 <button onclick="testBiomeLoading()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Test Loading</button>
                 <button onclick="optimizeBiomeCards()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Optimize</button>
                 <button onclick="startDelayedBiomeLoading()" style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">🚀 Start Analysis</button>
                 <div style="margin-top: 8px; font-size: 11px; color: #999;">
                     <label style="display: flex; align-items: center; gap: 5px;">
                         <input type="checkbox" id="delayed-loading-checkbox" style="margin: 0;" onchange="updateDelayedLoadingState(this.checked)">
                         🚀 Enable Delayed Loading Analysis
                     </label>
                 </div>
                 <div id="biome-cards-log" class="debug-log" style="background: #222; padding: 8px; border-radius: 3px; margin-top: 8px; font-family: monospace; font-size: 10px; max-height: 150px; overflow-y: auto;"></div>
             </div>

            <!-- Auto Refresh -->
            <div class="debug-section" style="background: #333; border: 1px solid #555; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;"><span style="display: inline-block; width: 8px; height: 8px; background: #9C27B0; border-radius: 50%; margin-right: 5px;"></span>Auto Refresh</h3>
                <button onclick="toggleAutoRefresh()" id="auto-refresh-btn" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">Start Auto Refresh</button>
                <div style="margin-top: 8px; font-size: 11px; color: #999;">
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="checkbox" id="auto-refresh-checkbox" style="margin: 0;">
                        Keep debug panel open
                    </label>
                </div>
            </div>

            <!-- Code Analysis -->
            <div class="debug-section" style="background: #333; border: 1px solid #555; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #4CAF50; font-size: 14px;"><span style="display: inline-block; width: 8px; height: 8px; background: #E91E63; border-radius: 50%; margin-right: 5px;"></span>Code Analysis</h3>
                <button onclick="analyzeRedundancies()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">🔍 Find Redundancies</button>
                <button onclick="listFunctionNames()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">📋 List Functions</button>
                <button onclick="analyzeCodeStructure()" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">🏗️ Code Structure</button>
                <button onclick="findDuplicateCode()" style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; margin: 2px; font-size: 11px;">🔄 Find Duplicates</button>
                <div id="code-analysis-log" class="debug-log" style="background: #222; padding: 8px; border-radius: 3px; margin-top: 8px; font-family: monospace; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
            </div>
        `;

        container.appendChild(header);
        container.appendChild(content);

        // Add to page
        document.body.appendChild(triggerBtn);
        document.body.appendChild(container);
        
        // Apply saved state
        if (debugFlyinOpen) {
            container.style.right = '20px';
            runInitialChecks();
        }
        
        // Apply saved settings after DOM is ready
        setTimeout(() => {
            // Apply performance monitoring state
            if (performanceMonitoring) {
                startPerformanceMonitoring();
            }
            
            // Apply auto refresh state
            if (autoRefresh) {
                const btn = document.getElementById('auto-refresh-btn');
                if (btn) {
                    btn.textContent = 'Stop Auto Refresh';
                    btn.style.background = '#f44336';
                    autoRefreshInterval = setInterval(() => {
                        if (window.tileEditor && window.tileEditor.uiManager) {
                            // Use loadMoreCategories instead of loadMoreCategoriesOnScroll
                            if (window.tileEditor.uiManager.loadMoreCategories) {
                                window.tileEditor.uiManager.loadMoreCategories();
                            } else {
                                console.log('loadMoreCategories function not available');
                            }
                        }
                    }, 1000);
                }
            }
            
            // Apply delayed loading checkbox state
            if (delayedLoadingEnabled) {
                const checkbox = document.getElementById('delayed-loading-checkbox');
                if (checkbox) {
                    checkbox.checked = true;
                    // Apply the delayed loading logic immediately
                    updateDelayedLoadingState(true);
                }
            }
        }, 100);
    }

    // Toggle fly-in card
    function toggleDebugFlyin() {
        const container = document.getElementById('debugFlyinCard');
        debugFlyinOpen = !debugFlyinOpen;
        
        if (debugFlyinOpen) {
            container.style.right = '20px';
            logToSection('system-status-log', 'Debug panel opened', 'success');
            runInitialChecks();
        } else {
            container.style.right = '-400px';
            logToSection('system-status-log', 'Debug panel closed', 'info');
        }
        
        saveDebugState(); // Save state when toggled
    }

    // Log to specific section
    function logToSection(sectionId, message, type = 'info') {
        const logElement = document.getElementById(sectionId);
        if (logElement) {
            const timestamp = new Date().toLocaleTimeString();
            const color = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
            
            logElement.innerHTML += `<div style="color: ${color}; margin: 2px 0;">[${timestamp}] ${message}</div>`;
            logElement.scrollTop = logElement.scrollHeight;
        }
    }

    // Initial system checks
    function runInitialChecks() {
        logToSection('system-status-log', 'Running initial system checks...', 'info');
        
        // Check TileEditor
        if (typeof window.tileEditor !== 'undefined') {
            logToSection('system-status-log', '✅ TileEditor loaded', 'success');
        } else {
            logToSection('system-status-log', '❌ TileEditor not found', 'error');
        }
        
        // Check BiomeData
        if (typeof window.biomeData !== 'undefined') {
            logToSection('system-status-log', '✅ BiomeData available', 'success');
        } else {
            logToSection('system-status-log', '⚠️ BiomeData not found', 'info');
        }
        
        // Check DOM elements
        const categoriesList = document.getElementById('categoriesList');
        if (categoriesList) {
            logToSection('system-status-log', '✅ Categories list found', 'success');
        } else {
            logToSection('system-status-log', '❌ Categories list not found', 'error');
        }
    }

    // System status check
    window.checkSystemStatus = function() {
        logToSection('system-status-log', 'Checking system status...', 'info');
        
        const status = {
            tileEditor: typeof window.tileEditor !== 'undefined',
            biomeData: typeof window.biomeData !== 'undefined',
            categoriesList: !!document.getElementById('categoriesList'),
            tilesList: !!document.getElementById('tilesList'),
            debugMode: document.getElementById('debugMode')?.checked || false
        };
        
        Object.entries(status).forEach(([key, value]) => {
            logToSection('system-status-log', `${value ? '✅' : '❌'} ${key}: ${value}`, value ? 'success' : 'error');
        });
    };

    // TileEditor check
    window.checkTileEditor = function() {
        logToSection('system-status-log', 'Checking TileEditor...', 'info');
        
        if (typeof window.tileEditor !== 'undefined') {
            const tileEditor = window.tileEditor;
            logToSection('system-status-log', `✅ TileEditor initialized: ${tileEditor.isInitialized || false}`, 'success');
            logToSection('system-status-log', `📊 Categories: ${tileEditor.categories?.length || 0}`, 'info');
            logToSection('system-status-log', `📊 Tiles: ${tileEditor.tiles?.length || 0}`, 'info');
        } else {
            logToSection('system-status-log', '❌ TileEditor not available', 'error');
        }
    };

    // BiomeData check
    window.checkBiomeData = function() {
        logToSection('system-status-log', 'Checking BiomeData...', 'info');
        
        if (typeof window.biomeData !== 'undefined') {
            logToSection('system-status-log', '✅ BiomeData available', 'success');
        } else {
            logToSection('system-status-log', '⚠️ BiomeData not available', 'info');
        }
    };

    // Performance monitoring
    window.startPerformanceMonitoring = function() {
        if (performanceMonitoring) {
            logToSection('performance-log', 'Performance monitoring already running', 'info');
            return;
        }
        
        performanceMonitoring = true;
        logToSection('performance-log', 'Performance monitoring started', 'success');
        saveDebugState(); // Save state when started
        
        // FPS monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        fpsInterval = setInterval(() => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const fpsElement = document.getElementById('fps-value');
                if (fpsElement) {
                    fpsElement.textContent = fps;
                }
                frameCount = 0;
                lastTime = currentTime;
            }
        }, 16); // ~60fps
        
        // Memory monitoring
        memoryInterval = setInterval(() => {
            if (performance.memory) {
                const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
                const memoryElement = document.getElementById('memory-value');
                if (memoryElement) {
                    memoryElement.textContent = `${used}MB`;
                }
            }
        }, 1000);
    };

    window.stopPerformanceMonitoring = function() {
        if (!performanceMonitoring) {
            logToSection('performance-log', 'Performance monitoring not running', 'info');
            return;
        }
        
        performanceMonitoring = false;
        saveDebugState(); // Save state when stopped
        
        if (fpsInterval) {
            clearInterval(fpsInterval);
            fpsInterval = null;
        }
        
        if (memoryInterval) {
            clearInterval(memoryInterval);
            memoryInterval = null;
        }
        
        const fpsElement = document.getElementById('fps-value');
        const memoryElement = document.getElementById('memory-value');
        
        if (fpsElement) {
            fpsElement.textContent = '--';
        }
        if (memoryElement) {
            memoryElement.textContent = '--';
        }
        
        logToSection('performance-log', 'Performance monitoring stopped', 'info');
    };

    // Biome cards analysis
    window.analyzeBiomeCards = function() {
        logToSection('biome-cards-log', 'Analyzing biome cards...', 'info');
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            logToSection('biome-cards-log', '❌ Categories list not found', 'error');
            return;
        }
        
        const categoryItems = categoriesList.querySelectorAll('.category-item');
        logToSection('biome-cards-log', `📊 Found ${categoryItems.length} category items`, 'info');
        
        categoryItems.forEach((item, index) => {
            const categoryName = item.querySelector('h4')?.textContent || 'Unknown';
            const tilePreviews = item.querySelectorAll('.tile-preview');
            logToSection('biome-cards-log', `📋 ${categoryName}: ${tilePreviews.length} tile previews`, 'info');
        });
    };

    window.testBiomeLoading = function() {
        logToSection('biome-cards-log', 'Testing biome loading...', 'info');
        
        if (typeof window.tileEditor !== 'undefined' && window.tileEditor.loadCategoriesFromBiomeFolders) {
            window.tileEditor.loadCategoriesFromBiomeFolders()
                .then(categories => {
                    logToSection('biome-cards-log', `✅ Loaded ${categories.length} categories`, 'success');
                })
                .catch(error => {
                    logToSection('biome-cards-log', `❌ Error loading categories: ${error.message}`, 'error');
                });
        } else {
            logToSection('biome-cards-log', '❌ TileEditor not available for testing', 'error');
        }
    };

    window.optimizeBiomeCards = function() {
        logToSection('biome-cards-log', 'Optimizing biome cards...', 'info');
        
        // Remove unnecessary delays
        const categoriesList = document.getElementById('categoriesList');
        if (categoriesList) {
            // Force immediate loading
            if (window.tileEditor && window.tileEditor.uiManager) {
                window.tileEditor.uiManager.currentDisplayCount = 0;
                // Use loadMoreCategories instead of loadMoreCategoriesOnScroll
                if (window.tileEditor.uiManager.loadMoreCategories) {
                    window.tileEditor.uiManager.loadMoreCategories();
                } else {
                    logToSection('biome-cards-log', '❌ loadMoreCategories function not available', 'error');
                }
                logToSection('biome-cards-log', '✅ Forced immediate category loading', 'success');
            }
        }
    };

    // Delayed biome loading with performance analysis
    window.startDelayedBiomeLoading = function() {
        const checkbox = document.getElementById('delayed-loading-checkbox');
        if (!checkbox || !checkbox.checked) {
            logToSection('biome-cards-log', '❌ Delayed loading analysis not enabled. Please check the checkbox first.', 'error');
            return;
        }
        
        // Update the global state
        delayedLoadingEnabled = true;
        saveDebugState();
        
        logToSection('biome-cards-log', '🚀 Starting delayed biome loading with performance analysis...', 'info');
        
        const startTime = performance.now();
        let stepTimes = [];
        
        // Step 1: Check if TileEditor is available
        const step1Start = performance.now();
        if (typeof window.tileEditor === 'undefined') {
            logToSection('biome-cards-log', '❌ TileEditor not available', 'error');
            return;
        }
        stepTimes.push({ step: 'TileEditor Check', time: performance.now() - step1Start });
        logToSection('biome-cards-log', `✅ TileEditor available (${(performance.now() - step1Start).toFixed(2)}ms)`, 'success');
        
        // Step 2: Check if UIManager is available
        const step2Start = performance.now();
        if (!window.tileEditor.uiManager) {
            logToSection('biome-cards-log', '❌ UIManager not available', 'error');
            return;
        }
        stepTimes.push({ step: 'UIManager Check', time: performance.now() - step2Start });
        logToSection('biome-cards-log', `✅ UIManager available (${(performance.now() - step2Start).toFixed(2)}ms)`, 'success');
        
        // Step 3: Check categories list element
        const step3Start = performance.now();
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            logToSection('biome-cards-log', '❌ Categories list element not found', 'error');
            return;
        }
        stepTimes.push({ step: 'DOM Element Check', time: performance.now() - step3Start });
        logToSection('biome-cards-log', `✅ Categories list found (${(performance.now() - step3Start).toFixed(2)}ms)`, 'success');
        
        // Step 4: Check if we have stored categories
        const step4Start = performance.now();
        if (!window.tileEditor.uiManager.allCategories || window.tileEditor.uiManager.allCategories.length === 0) {
            logToSection('biome-cards-log', '❌ No categories available for loading', 'error');
            return;
        }
        stepTimes.push({ step: 'Categories Check', time: performance.now() - step4Start });
        logToSection('biome-cards-log', `✅ Categories available: ${window.tileEditor.uiManager.allCategories.length}`, 'success');
        
        // Step 5: Restore original method and start loading
        const step5Start = performance.now();
        logToSection('biome-cards-log', '🔄 Restoring original loading method...', 'info');
        
        if (originalDisplayCategories) {
            window.tileEditor.uiManager.displayCategories = originalDisplayCategories;
            originalDisplayCategories = null;
        }
        
        // Restore initializeCategories method
        if (window.tileEditor && window.tileEditor._originalInitializeCategories) {
            window.tileEditor.initializeCategories = window.tileEditor._originalInitializeCategories;
            delete window.tileEditor._originalInitializeCategories;
        }
        
        // Clear the waiting message
        categoriesList.innerHTML = '';
        
        // Call the original display method with stored categories
        const storedCategories = window.tileEditor.uiManager.allCategories;
        window.tileEditor.uiManager.displayCategories(storedCategories);
        
        stepTimes.push({ step: 'Method Restoration', time: performance.now() - step5Start });
        logToSection('biome-cards-log', `✅ Original method restored and loading started (${(performance.now() - step5Start).toFixed(2)}ms)`, 'success');
        
        // Step 6: Monitor loading progress with performance analysis
        const step6Start = performance.now();
        logToSection('biome-cards-log', '📊 Starting performance monitoring...', 'info');
        
        // Override the loadMoreCategories method temporarily for analysis
        const originalLoadMethod = window.tileEditor.uiManager.loadMoreCategories;
        let loadStepTimes = [];
        
        window.tileEditor.uiManager.loadMoreCategories = function() {
            const loadStart = performance.now();
            
            // Call original method
            const result = originalLoadMethod.call(this);
            
            const loadEnd = performance.now();
            loadStepTimes.push({ step: 'Category Load', time: loadEnd - loadStart });
            
            logToSection('biome-cards-log', `📊 Loaded batch in ${(loadEnd - loadStart).toFixed(2)}ms`, 'info');
            
            return result;
        };
        
        stepTimes.push({ step: 'Monitoring Setup', time: performance.now() - step6Start });
        
        // Step 7: Monitor loading progress
        const monitorInterval = setInterval(() => {
            const currentCount = window.tileEditor.uiManager.currentDisplayCount || 0;
            const totalCount = window.tileEditor.uiManager.allCategories?.length || 0;
            
            if (currentCount >= totalCount || currentCount === 0) {
                clearInterval(monitorInterval);
                
                        // Restore original method
        window.tileEditor.uiManager.loadMoreCategories = originalLoadMethod;
                
                const totalTime = performance.now() - startTime;
                
                // Log final analysis
                logToSection('biome-cards-log', `🎯 Loading completed in ${totalTime.toFixed(2)}ms`, 'success');
                logToSection('biome-cards-log', `📊 Total categories: ${totalCount}`, 'info');
                logToSection('biome-cards-log', `📊 Loaded categories: ${currentCount}`, 'info');
                
                // Log step-by-step breakdown
                logToSection('biome-cards-log', '📋 Performance breakdown:', 'info');
                stepTimes.forEach(step => {
                    logToSection('biome-cards-log', `  • ${step.step}: ${step.time.toFixed(2)}ms`, 'info');
                });
                
                if (loadStepTimes.length > 0) {
                    const avgLoadTime = loadStepTimes.reduce((sum, step) => sum + step.time, 0) / loadStepTimes.length;
                    logToSection('biome-cards-log', `  • Average load time: ${avgLoadTime.toFixed(2)}ms`, 'info');
                }
                
                // Disable delayed loading after completion
                delayedLoadingEnabled = false;
                saveDebugState();
                logToSection('biome-cards-log', '🔄 Delayed loading analysis completed and disabled', 'info');
            } else {
                logToSection('biome-cards-log', `🔄 Loading progress: ${currentCount}/${totalCount}`, 'info');
            }
        }, 100);
    };

    // Update delayed loading state
    window.updateDelayedLoadingState = function(checked) {
        delayedLoadingEnabled = checked;
        saveDebugState();
        
        if (checked) {
            // Store original method and override it
            if (window.tileEditor && window.tileEditor.uiManager && !originalDisplayCategories) {
                originalDisplayCategories = window.tileEditor.uiManager.displayCategories;
                
                window.tileEditor.uiManager.displayCategories = function(categories) {
                    logToSection('biome-cards-log', '🚀 Delayed loading enabled - biome cards loading blocked', 'info');
                    logToSection('biome-cards-log', `📊 Categories ready: ${categories.length}`, 'info');
                    
                    // Store categories but don't display them
                    this.allCategories = categories;
                    this.currentDisplayCount = 0;
                    
                    // Clear the list and show waiting message
                    const categoriesList = document.getElementById('categoriesList');
                    if (categoriesList) {
                        categoriesList.innerHTML = `
                            <div style="
                                background: rgba(255, 152, 0, 0.1);
                                border: 2px solid #FF9800;
                                border-radius: 8px;
                                padding: 20px;
                                text-align: center;
                                color: #FF9800;
                                font-weight: bold;
                                font-size: 16px;
                            ">
                                🚀 Delayed Loading Analysis Enabled<br>
                                <span style="font-size: 14px; color: #999; margin-top: 10px; display: block;">
                                    Click "🚀 Start Analysis" to begin loading
                                </span>
                            </div>
                        `;
                    }
                };
                
                logToSection('biome-cards-log', '✅ Biome cards loading intercepted - waiting for analysis button', 'success');
            }
            
            // Also intercept the initializeCategories method
            if (window.tileEditor && !window.tileEditor._originalInitializeCategories) {
                window.tileEditor._originalInitializeCategories = window.tileEditor.initializeCategories;
                window.tileEditor.initializeCategories = function() {
                    logToSection('biome-cards-log', '🚀 initializeCategories blocked by delayed loading', 'info');
                    // Don't call the original method
                };
                logToSection('biome-cards-log', '✅ initializeCategories method intercepted', 'success');
            }
        } else {
            // Restore original method
            if (originalDisplayCategories && window.tileEditor && window.tileEditor.uiManager) {
                window.tileEditor.uiManager.displayCategories = originalDisplayCategories;
                originalDisplayCategories = null;
                logToSection('biome-cards-log', '🔄 Original biome loading restored', 'info');
            }
            
            // Restore initializeCategories method
            if (window.tileEditor && window.tileEditor._originalInitializeCategories) {
                window.tileEditor.initializeCategories = window.tileEditor._originalInitializeCategories;
                delete window.tileEditor._originalInitializeCategories;
                logToSection('biome-cards-log', '🔄 Original initializeCategories restored', 'info');
            }
        }
        
        logToSection('biome-cards-log', `🚀 Delayed loading analysis ${checked ? 'enabled' : 'disabled'}`, 'info');
    };

    // Auto refresh functionality
    window.toggleAutoRefresh = function() {
        autoRefresh = !autoRefresh;
        const btn = document.getElementById('auto-refresh-btn');
        
        if (autoRefresh) {
            btn.textContent = 'Stop Auto Refresh';
            btn.style.background = '#f44336';
            autoRefreshInterval = setInterval(() => {
                if (window.tileEditor && window.tileEditor.uiManager) {
                    // Use loadMoreCategories instead of loadMoreCategoriesOnScroll
                    if (window.tileEditor.uiManager.loadMoreCategories) {
                        window.tileEditor.uiManager.loadMoreCategories();
                    } else {
                        console.log('loadMoreCategories function not available');
                    }
                }
            }, 1000);
            logToSection('system-status-log', 'Auto refresh started', 'success');
        } else {
            btn.textContent = 'Start Auto Refresh';
            btn.style.background = '#4CAF50';
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
            logToSection('system-status-log', 'Auto refresh stopped', 'info');
        }
        
        saveDebugState(); // Save state when toggled
    };

    // Code Analysis Functions
    window.analyzeRedundancies = function() {
        logToSection('code-analysis-log', '🔍 Starting detailed redundancy analysis...', 'info');
        
        const redundancies = {
            duplicateFunctions: [],
            similarFunctions: [],
            duplicateProperties: [],
            similarProperties: [],
            duplicateValues: [],
            unusedFunctions: [],
            redundantCode: []
        };
        
        // Collect all function names and their sources
        const functionRegistry = new Map();
        const propertyRegistry = new Map();
        
        // Analyze window.tileEditor
        if (window.tileEditor) {
            Object.getOwnPropertyNames(window.tileEditor).forEach(name => {
                const value = window.tileEditor[name];
                const type = typeof value;
                const source = 'tileEditor';
                
                if (type === 'function') {
                    const key = `${source}.${name}`;
                    if (functionRegistry.has(name)) {
                        functionRegistry.get(name).push(key);
                    } else {
                        functionRegistry.set(name, [key]);
                    }
                } else {
                    const key = `${source}.${name}`;
                    if (propertyRegistry.has(name)) {
                        propertyRegistry.get(name).push(key);
                    } else {
                        propertyRegistry.set(name, [key]);
                    }
                }
            });
        }
        
        // Analyze window.tileEditor.uiManager
        if (window.tileEditor && window.tileEditor.uiManager) {
            Object.getOwnPropertyNames(window.tileEditor.uiManager).forEach(name => {
                const value = window.tileEditor.uiManager[name];
                const type = typeof value;
                const source = 'uiManager';
                
                if (type === 'function') {
                    const key = `${source}.${name}`;
                    if (functionRegistry.has(name)) {
                        functionRegistry.get(name).push(key);
                    } else {
                        functionRegistry.set(name, [key]);
                    }
                } else {
                    const key = `${source}.${name}`;
                    if (propertyRegistry.has(name)) {
                        propertyRegistry.get(name).push(key);
                    } else {
                        propertyRegistry.set(name, [key]);
                    }
                }
            });
        }
        
        // Analyze global window functions (our debug functions)
        Object.getOwnPropertyNames(window).forEach(name => {
            if (typeof window[name] === 'function' && 
                (name.startsWith('check') ||
                 name.startsWith('analyze') ||
                 name.startsWith('test') ||
                 name.startsWith('optimize') ||
                 name.startsWith('start') ||
                 name.startsWith('stop') ||
                 name.startsWith('toggle') ||
                 name.startsWith('update') ||
                 name.startsWith('list') ||
                 name.startsWith('find'))) {
                const key = `window.${name}`;
                if (functionRegistry.has(name)) {
                    functionRegistry.get(name).push(key);
                } else {
                    functionRegistry.set(name, [key]);
                }
            }
        });
        
        // Find duplicates
        functionRegistry.forEach((sources, name) => {
            if (sources.length > 1) {
                redundancies.duplicateFunctions.push({ name, sources });
            }
        });
        
        propertyRegistry.forEach((sources, name) => {
            if (sources.length > 1) {
                redundancies.duplicateProperties.push({ name, sources });
            }
        });
        
        // Find similar function names with detailed analysis
        const functionNames = Array.from(functionRegistry.keys());
        for (let i = 0; i < functionNames.length; i++) {
            for (let j = i + 1; j < functionNames.length; j++) {
                const name1 = functionNames[i];
                const name2 = functionNames[j];
                const similarity = calculateSimilarity(name1, name2);
                
                if (similarity > 0.7 && similarity < 1.0) {
                    const analysis = {
                        name1, name2, similarity,
                        sources1: functionRegistry.get(name1),
                        sources2: functionRegistry.get(name2),
                        analysis: analyzeFunctionSimilarity(name1, name2)
                    };
                    redundancies.similarFunctions.push(analysis);
                }
            }
        }
        
        // Find potential unused functions
        if (window.tileEditor && window.tileEditor.uiManager) {
            const uiManagerFunctions = Object.getOwnPropertyNames(window.tileEditor.uiManager)
                .filter(name => typeof window.tileEditor.uiManager[name] === 'function');
            
            uiManagerFunctions.forEach(funcName => {
                const func = window.tileEditor.uiManager[funcName];
                if (func && func.toString().includes('this.debug') && !func.toString().includes('console.log')) {
                    // Check if this function is actually called anywhere
                    const codeString = document.documentElement.outerHTML;
                    const functionCallPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
                    const matches = codeString.match(functionCallPattern);
                    
                    if (!matches || matches.length <= 1) { // Only self-reference
                        redundancies.unusedFunctions.push({
                            name: `uiManager.${funcName}`,
                            reason: 'Potentially unused debug function'
                        });
                    }
                }
            });
        }
        
        // Find redundant code patterns
        redundancies.redundantCode = findRedundantCodePatterns();
        
        // Detailed reporting
        logToSection('code-analysis-log', '📊 Detailed Redundancy Analysis Results:', 'info');
        
        if (redundancies.duplicateFunctions.length > 0) {
            logToSection('code-analysis-log', `❌ Found ${redundancies.duplicateFunctions.length} duplicate functions:`, 'error');
            redundancies.duplicateFunctions.forEach(dup => {
                logToSection('code-analysis-log', `  🔄 ${dup.name}:`, 'error');
                dup.sources.forEach(source => {
                    logToSection('code-analysis-log', `    • ${source}`, 'error');
                });
            });
        } else {
            logToSection('code-analysis-log', '✅ No duplicate functions found', 'success');
        }
        
        if (redundancies.duplicateProperties.length > 0) {
            logToSection('code-analysis-log', `⚠️ Found ${redundancies.duplicateProperties.length} duplicate properties:`, 'info');
            redundancies.duplicateProperties.forEach(dup => {
                logToSection('code-analysis-log', `  🔄 ${dup.name}:`, 'info');
                dup.sources.forEach(source => {
                    logToSection('code-analysis-log', `    • ${source}`, 'info');
                });
            });
        }
        
        if (redundancies.similarFunctions.length > 0) {
            logToSection('code-analysis-log', `⚠️ Found ${redundancies.similarFunctions.length} similar function names:`, 'info');
            redundancies.similarFunctions.forEach(sim => {
                logToSection('code-analysis-log', `  🔍 ${sim.name1} ↔ ${sim.name2} (${(sim.similarity * 100).toFixed(1)}% similar):`, 'info');
                logToSection('code-analysis-log', `    📍 Sources: ${sim.sources1.join(', ')} ↔ ${sim.sources2.join(', ')}`, 'info');
                if (sim.analysis) {
                    logToSection('code-analysis-log', `    🔬 Analysis: ${sim.analysis}`, 'info');
                }
            });
        }
        
        if (redundancies.unusedFunctions.length > 0) {
            logToSection('code-analysis-log', `⚠️ Found ${redundancies.unusedFunctions.length} potentially unused functions:`, 'info');
            redundancies.unusedFunctions.forEach(unused => {
                logToSection('code-analysis-log', `  🗑️ ${unused.name}: ${unused.reason}`, 'info');
            });
        }
        
        if (redundancies.redundantCode.length > 0) {
            logToSection('code-analysis-log', `🔄 Found ${redundancies.redundantCode.length} redundant code patterns:`, 'info');
            redundancies.redundantCode.forEach(pattern => {
                logToSection('code-analysis-log', `  📝 ${pattern.type}: ${pattern.description}`, 'info');
                if (pattern.examples) {
                    pattern.examples.forEach(example => {
                        logToSection('code-analysis-log', `    • ${example}`, 'info');
                    });
                }
            });
        }
        
        // Summary statistics
        const totalFunctions = functionRegistry.size;
        const totalProperties = propertyRegistry.size;
        const totalDuplicates = redundancies.duplicateFunctions.length + redundancies.duplicateProperties.length;
        const totalSimilar = redundancies.similarFunctions.length;
        
        logToSection('code-analysis-log', '📈 Summary Statistics:', 'info');
        logToSection('code-analysis-log', `  📊 Total functions: ${totalFunctions}`, 'info');
        logToSection('code-analysis-log', `  📊 Total properties: ${totalProperties}`, 'info');
        logToSection('code-analysis-log', `  🔄 Total duplicates: ${totalDuplicates}`, 'info');
        logToSection('code-analysis-log', `  🔍 Total similar: ${totalSimilar}`, 'info');
        logToSection('code-analysis-log', `  🗑️ Potentially unused: ${redundancies.unusedFunctions.length}`, 'info');
        
        // Copy detailed results to clipboard
        const detailedResults = {
            timestamp: new Date().toISOString(),
            summary: { totalFunctions, totalProperties, totalDuplicates, totalSimilar },
            details: redundancies
        };
        
        navigator.clipboard.writeText(JSON.stringify(detailedResults, null, 2)).then(() => {
            logToSection('code-analysis-log', '📋 Detailed results copied to clipboard!', 'success');
        }).catch(() => {
            logToSection('code-analysis-log', '📋 Detailed results ready for manual copy', 'info');
        });
    };
    
    window.listFunctionNames = function() {
        logToSection('code-analysis-log', '📋 Listing application functions...', 'info');
        
        const functions = [];
        
        // Get TileEditor functions
        if (window.tileEditor) {
            Object.getOwnPropertyNames(window.tileEditor).forEach(name => {
                if (typeof window.tileEditor[name] === 'function') {
                    functions.push(`tileEditor.${name}`);
                }
            });
        }
        
        // Get UIManager functions
        if (window.tileEditor && window.tileEditor.uiManager) {
            Object.getOwnPropertyNames(window.tileEditor.uiManager).forEach(name => {
                if (typeof window.tileEditor.uiManager[name] === 'function') {
                    functions.push(`uiManager.${name}`);
                }
            });
        }
        
        // Get debug functions (our own functions)
        Object.getOwnPropertyNames(window).forEach(name => {
            if (typeof window[name] === 'function' && 
                (name.startsWith('check') ||
                 name.startsWith('analyze') ||
                 name.startsWith('test') ||
                 name.startsWith('optimize') ||
                 name.startsWith('start') ||
                 name.startsWith('stop') ||
                 name.startsWith('toggle') ||
                 name.startsWith('update') ||
                 name.startsWith('list') ||
                 name.startsWith('find'))) {
                functions.push(`window.${name}`);
            }
        });
        
        // Sort and display
        functions.sort();
        
        logToSection('code-analysis-log', `📋 Found ${functions.length} application functions:`, 'info');
        functions.forEach((func, index) => {
            const color = index % 2 === 0 ? '#4CAF50' : '#2196F3';
            logToSection('code-analysis-log', `  ${index + 1}. ${func}`, 'info');
        });
        
        // Copy to clipboard
        const functionList = functions.join('\n');
        navigator.clipboard.writeText(functionList).then(() => {
            logToSection('code-analysis-log', '📋 Function list copied to clipboard!', 'success');
        }).catch(() => {
            logToSection('code-analysis-log', '📋 Function list ready for manual copy', 'info');
        });
    };
    
    window.analyzeCodeStructure = function() {
        logToSection('code-analysis-log', '🏗️ Analyzing code structure...', 'info');
        
        const structure = {
            tileEditor: {},
            uiManager: {},
            global: {}
        };
        
        // Analyze TileEditor structure
        if (window.tileEditor) {
            Object.getOwnPropertyNames(window.tileEditor).forEach(name => {
                const value = window.tileEditor[name];
                const type = typeof value;
                structure.tileEditor[name] = type;
            });
        }
        
        // Analyze UIManager structure
        if (window.tileEditor && window.tileEditor.uiManager) {
            Object.getOwnPropertyNames(window.tileEditor.uiManager).forEach(name => {
                const value = window.tileEditor.uiManager[name];
                const type = typeof value;
                structure.uiManager[name] = type;
            });
        }
        
        // Display structure
        logToSection('code-analysis-log', '📊 TileEditor structure:', 'info');
        Object.entries(structure.tileEditor).forEach(([name, type]) => {
            const icon = type === 'function' ? '⚙️' : type === 'object' ? '📦' : '📄';
            logToSection('code-analysis-log', `  ${icon} ${name}: ${type}`, 'info');
        });
        
        logToSection('code-analysis-log', '📊 UIManager structure:', 'info');
        Object.entries(structure.uiManager).forEach(([name, type]) => {
            const icon = type === 'function' ? '⚙️' : type === 'object' ? '📦' : '📄';
            logToSection('code-analysis-log', `  ${icon} ${name}: ${type}`, 'info');
        });
    };
    
    window.findDuplicateCode = function() {
        logToSection('code-analysis-log', '🔄 Searching for duplicate code patterns...', 'info');
        
        const patterns = [];
        
        // Check for common patterns in function names
        const functionNames = [];
        if (window.tileEditor) {
            Object.getOwnPropertyNames(window.tileEditor).forEach(name => {
                if (typeof window.tileEditor[name] === 'function') {
                    functionNames.push(name);
                }
            });
        }
        
        if (window.tileEditor && window.tileEditor.uiManager) {
            Object.getOwnPropertyNames(window.tileEditor.uiManager).forEach(name => {
                if (typeof window.tileEditor.uiManager[name] === 'function') {
                    functionNames.push(name);
                }
            });
        }
        
        // Find patterns
        const patternsFound = {};
        functionNames.forEach(name => {
            // Check for common prefixes
            const prefix = name.split(/(?=[A-Z])/)[0];
            if (prefix && prefix.length > 2) {
                if (!patternsFound[prefix]) {
                    patternsFound[prefix] = [];
                }
                patternsFound[prefix].push(name);
            }
            
            // Check for common suffixes
            const suffix = name.split(/(?=[A-Z])/).pop();
            if (suffix && suffix.length > 2) {
                const suffixKey = `suffix_${suffix}`;
                if (!patternsFound[suffixKey]) {
                    patternsFound[suffixKey] = [];
                }
                patternsFound[suffixKey].push(name);
            }
        });
        
        // Report patterns
        Object.entries(patternsFound).forEach(([pattern, functions]) => {
            if (functions.length > 1) {
                const patternType = pattern.startsWith('suffix_') ? 'Suffix' : 'Prefix';
                const patternName = pattern.startsWith('suffix_') ? pattern.replace('suffix_', '') : pattern;
                logToSection('code-analysis-log', `🔄 ${patternType} pattern "${patternName}":`, 'info');
                functions.forEach(func => {
                    logToSection('code-analysis-log', `  • ${func}`, 'info');
                });
            }
        });
        
        if (Object.keys(patternsFound).filter(p => patternsFound[p].length > 1).length === 0) {
            logToSection('code-analysis-log', '✅ No significant code patterns found', 'success');
        }
    };
    
    // Helper function to calculate string similarity
    function calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // Analyze function similarity in detail
    function analyzeFunctionSimilarity(name1, name2) {
        const analysis = [];
        
        // Check for common prefixes
        const prefix1 = name1.split(/(?=[A-Z])/)[0];
        const prefix2 = name2.split(/(?=[A-Z])/)[0];
        if (prefix1 === prefix2 && prefix1.length > 2) {
            analysis.push(`Common prefix: "${prefix1}"`);
        }
        
        // Check for common suffixes
        const suffix1 = name1.split(/(?=[A-Z])/).pop();
        const suffix2 = name2.split(/(?=[A-Z])/).pop();
        if (suffix1 === suffix2 && suffix1.length > 2) {
            analysis.push(`Common suffix: "${suffix1}"`);
        }
        
        // Check for transposed characters
        if (name1.length === name2.length) {
            let transposed = 0;
            for (let i = 0; i < name1.length - 1; i++) {
                if (name1[i] === name2[i + 1] && name1[i + 1] === name2[i]) {
                    transposed++;
                }
            }
            if (transposed > 0) {
                analysis.push(`Possible transposition: ${transposed} character pairs`);
            }
        }
        
        // Check for missing/extra characters
        const diff = Math.abs(name1.length - name2.length);
        if (diff === 1) {
            analysis.push(`Length difference: ${diff} character`);
        } else if (diff > 1) {
            analysis.push(`Length difference: ${diff} characters`);
        }
        
        return analysis.length > 0 ? analysis.join(', ') : 'Similar naming pattern';
    }
    
    // Find redundant code patterns
    function findRedundantCodePatterns() {
        const patterns = [];
        
        // Check for repeated debug patterns
        if (window.tileEditor && window.tileEditor.uiManager) {
            const debugPatterns = [];
            const functions = Object.getOwnPropertyNames(window.tileEditor.uiManager)
                .filter(name => typeof window.tileEditor.uiManager[name] === 'function');
            
            functions.forEach(funcName => {
                const func = window.tileEditor.uiManager[funcName];
                if (func && func.toString().includes('this.debug')) {
                    const debugCalls = func.toString().match(/this\.debug\(/g);
                    if (debugCalls && debugCalls.length > 3) {
                        debugPatterns.push(`${funcName}: ${debugCalls.length} debug calls`);
                    }
                }
            });
            
            if (debugPatterns.length > 0) {
                patterns.push({
                    type: 'Debug Pattern Redundancy',
                    description: 'Functions with excessive debug calls',
                    examples: debugPatterns
                });
            }
        }
        
        // Check for repeated DOM queries
        const domQueries = [];
        if (window.tileEditor && window.tileEditor.uiManager) {
            const functions = Object.getOwnPropertyNames(window.tileEditor.uiManager)
                .filter(name => typeof window.tileEditor.uiManager[name] === 'function');
            
            functions.forEach(funcName => {
                const func = window.tileEditor.uiManager[funcName];
                if (func) {
                    const getElementCalls = func.toString().match(/getElementById\(/g);
                    const querySelectorCalls = func.toString().match(/querySelector\(/g);
                    const totalQueries = (getElementCalls ? getElementCalls.length : 0) + 
                                       (querySelectorCalls ? querySelectorCalls.length : 0);
                    
                    if (totalQueries > 5) {
                        domQueries.push(`${funcName}: ${totalQueries} DOM queries`);
                    }
                }
            });
            
            if (domQueries.length > 0) {
                patterns.push({
                    type: 'DOM Query Redundancy',
                    description: 'Functions with excessive DOM queries',
                    examples: domQueries
                });
            }
        }
        
        // Check for repeated string literals
        const stringPatterns = [];
        const commonStrings = [
            'categoriesList', 'tilesList', 'biomeProgressCounter',
            'display', 'load', 'update', 'check', 'analyze'
        ];
        
        if (window.tileEditor && window.tileEditor.uiManager) {
            const functions = Object.getOwnPropertyNames(window.tileEditor.uiManager)
                .filter(name => typeof window.tileEditor.uiManager[name] === 'function');
            
            functions.forEach(funcName => {
                const func = window.tileEditor.uiManager[funcName];
                if (func) {
                    const funcStr = func.toString();
                    commonStrings.forEach(str => {
                        const matches = funcStr.match(new RegExp(str, 'g'));
                        if (matches && matches.length > 3) {
                            stringPatterns.push(`${funcName}: "${str}" used ${matches.length} times`);
                        }
                    });
                }
            });
            
            if (stringPatterns.length > 0) {
                patterns.push({
                    type: 'String Literal Redundancy',
                    description: 'Repeated string literals that could be constants',
                    examples: stringPatterns
                });
            }
        }
        
        return patterns;
    }
    
    // Levenshtein distance calculation
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDebugFlyinCard);
    } else {
        createDebugFlyinCard();
    }

    // Make functions globally available
    window.debugFlyinCard = {
        toggle: toggleDebugFlyin,
        log: logToSection,
        checkSystem: window.checkSystemStatus,
        checkTileEditor: window.checkTileEditor,
        checkBiomeData: window.checkBiomeData,
        startPerformance: window.startPerformanceMonitoring,
        stopPerformance: window.stopPerformanceMonitoring,
        analyzeBiomeCards: window.analyzeBiomeCards,
        testBiomeLoading: window.testBiomeLoading,
        optimizeBiomeCards: window.optimizeBiomeCards,
        startDelayedBiomeLoading: window.startDelayedBiomeLoading,
        updateDelayedLoadingState: window.updateDelayedLoadingState,
        toggleAutoRefresh: window.toggleAutoRefresh,
        analyzeRedundancies: window.analyzeRedundancies,
        listFunctionNames: window.listFunctionNames,
        analyzeCodeStructure: window.analyzeCodeStructure,
        findDuplicateCode: window.findDuplicateCode
    };

})();
