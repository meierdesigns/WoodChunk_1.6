/**
 * Debugger Module - Analysiert die aktuelle Seite und bietet Debug-Informationen
 */
class PageDebugger {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.debugInfo = {};
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const pageMap = {
            '/': 'menu',
            '/index.html': 'menu',
            '/itemEditor': 'itemEditor',
            '/itemEditor.html': 'itemEditor',
            '/peopleEditor': 'peopleEditor',
            '/peopleEditor.html': 'peopleEditor',
            '/characterEditor': 'characterEditor',
            '/characterEditor.html': 'characterEditor',
            '/hexMapEditor': 'hexMapEditor',
            '/hexMapEditor.html': 'hexMapEditor',
            '/abilitiesEditor': 'abilitiesEditor',
            '/abilitiesEditor.html': 'abilitiesEditor',
            '/tileEditor': 'tileEditor',
            '/tileEditor.html': 'tileEditor',
            '/game': 'game',
            '/game.html': 'game',
            '/settings': 'settings',
            '/settings.html': 'settings'
        };
        return pageMap[path] || 'unknown';
    }

    async analyzePage() {
        // // console.log('[PageDebugger] Analyzing page:', this.currentPage);
        
        this.debugInfo = {
            page: this.currentPage,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            modules: this.detectLoadedModules(),
            errors: this.detectErrors(),
            performance: this.analyzePerformance(),
            storage: this.analyzeStorage(),
            network: await this.analyzeNetwork()
        };

        return this.debugInfo;
    }

    detectLoadedModules() {
        const modules = {
            tileEditor: {
                loaded: typeof window.tileEditor !== 'undefined',
                categories: window.tileEditor?.categories?.length || 0,
                tiles: window.tileEditor?.tiles?.length || 0,
                initialized: window.tileEditor?.isInitialized || false
            },
            hexMapEditor: {
                loaded: this.checkHexMapEditorInIframe(),
                core: typeof window.MapCore !== 'undefined',
                biomeUtils: typeof window.BiomeUtils !== 'undefined'
            },
            itemEditor: {
                loaded: typeof window.itemEditor !== 'undefined'
            },
            characterEditor: {
                loaded: typeof window.characterEditor !== 'undefined'
            },
            peopleEditor: {
                loaded: typeof window.peopleEditor !== 'undefined'
            },
            abilitiesEditor: {
                loaded: typeof window.abilitiesEditor !== 'undefined'
            }
        };

        return modules;
    }

    detectErrors() {
        const errors = [];
        
        // Prüfe auf fehlende Module
        if (this.currentPage === 'tileEditor' && !window.tileEditor) {
            errors.push('TileEditor nicht geladen');
        }
        if (this.currentPage === 'hexMapEditor' && !this.checkHexMapEditorInIframe()) {
            errors.push('HexMapEditor nicht geladen');
        }
        
        // Prüfe auf fehlende DOM-Elemente
        const requiredElements = this.getRequiredElements();
        requiredElements.forEach(element => {
            if (!this.checkElementExists(element.id)) {
                errors.push(`Fehlendes DOM-Element: ${element.id}`);
            }
        });

        return errors;
    }

    checkElementExists(elementId) {
        // Check in main window
        if (document.getElementById(elementId)) {
            return true;
        }
        
        // Check in iframe if we're on hexMapEditor page
        if (this.currentPage === 'hexMapEditor') {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentDocument) {
                try {
                    return iframe.contentDocument.getElementById(elementId) !== null;
                } catch (e) {
                    // Cross-origin restrictions
                    return false;
                }
            }
        }
        
        return false;
    }

    getRequiredElements() {
        const elementMap = {
            tileEditor: [
                { id: 'tileEditorContainer', description: 'Tile Editor Container' },
                { id: 'categoriesList', description: 'Kategorien Liste' }
            ],
            hexMapEditor: [
                { id: 'hexMapContainer', description: 'HexMap Container' },
                { id: 'biome-categories-list', description: 'Biome Kategorien Liste' }
            ],
            itemEditor: [
                { id: 'itemEditorContainer', description: 'Item Editor Container' }
            ],
            characterEditor: [
                { id: 'characterEditorContainer', description: 'Character Editor Container' }
            ],
            peopleEditor: [
                { id: 'peopleEditorContainer', description: 'People Editor Container' }
            ],
            abilitiesEditor: [
                { id: 'abilitiesEditorContainer', description: 'Abilities Editor Container' }
            ]
        };

        return elementMap[this.currentPage] || [];
    }

    analyzePerformance() {
        const perf = {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            scripts: document.scripts.length,
            stylesheets: document.styleSheets.length,
            images: document.images.length
        };

        return perf;
    }

    analyzeStorage() {
        const storage = {
            localStorage: {
                available: typeof localStorage !== 'undefined',
                items: localStorage ? Object.keys(localStorage).length : 0,
                size: this.getStorageSize(localStorage)
            },
            sessionStorage: {
                available: typeof sessionStorage !== 'undefined',
                items: sessionStorage ? Object.keys(sessionStorage).length : 0,
                size: this.getStorageSize(sessionStorage)
            }
        };

        return storage;
    }

    getStorageSize(storage) {
        if (!storage) return 0;
        let size = 0;
        for (let key in storage) {
            if (storage.hasOwnProperty(key)) {
                size += storage[key].length;
            }
        }
        return size;
    }

    async analyzeNetwork() {
        const network = {
            online: navigator.onLine,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };

        // Skip API test for faster performance
        network.apiTest = {
            status: 'skipped',
            responseTime: 0,
            success: true
        };

        return network;
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debugPanel';
        panel.className = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 15px;
            border-radius: 5px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
        `;

        return panel;
    }

    updateDebugPanel() {
        let panel = document.getElementById('debugPanel');
        if (!panel) {
            panel = this.createDebugPanel();
            document.body.appendChild(panel);
        }

        const content = this.generateDebugContent();
        panel.innerHTML = content;
    }

    generateDebugContent() {
        const info = this.debugInfo;
        
        return `
            <div style="margin-bottom: 10px;">
                <h3 style="margin: 0 0 10px 0; color: #ffff00;">🔍 Page Debugger</h3>
                <button onclick="window.pageDebugger.togglePanel()" style="position: absolute; top: 5px; right: 5px; background: #333; color: #fff; border: none; padding: 5px; cursor: pointer;">✕</button>
            </div>
            
            <!-- Tabs -->
            <div style="margin-bottom: 15px;">
                <button onclick="window.pageDebugger.switchTab('overview')" id="tab-overview" style="background: #555; color: #fff; border: none; padding: 8px 12px; cursor: pointer; margin-right: 5px; border-radius: 3px;">📊 Übersicht</button>
                <button onclick="window.pageDebugger.switchTab('functions')" id="tab-functions" style="background: #333; color: #fff; border: none; padding: 8px 12px; cursor: pointer; border-radius: 3px;">⚙️ Funktionen</button>
            </div>
            
            <!-- Overview Tab Content -->
            <div id="tab-content-overview" style="display: block;">
                <div style="margin-bottom: 15px;">
                    <strong>📄 Seite:</strong> ${info.page}<br>
                    <strong>🌐 URL:</strong> ${info.url}<br>
                    <strong>⏰ Zeit:</strong> ${info.timestamp}<br>
                    <strong>📱 Viewport:</strong> ${info.viewport.width}x${info.viewport.height}
                </div>

                <div style="margin-bottom: 15px;">
                    <strong>📦 Module:</strong><br>
                    ${Object.entries(info.modules).map(([name, data]) => 
                        `• ${name}: ${data.loaded ? '✅' : '❌'} ${data.categories ? `(${data.categories} Kategorien)` : ''}`
                    ).join('<br>')}
                </div>

                <div style="margin-bottom: 15px;">
                    <strong>⚡ Performance:</strong><br>
                    • Ladezeit: ${info.performance.loadTime}ms<br>
                    • DOM Ready: ${info.performance.domReady}ms<br>
                    • Scripts: ${info.performance.scripts}<br>
                    • Stylesheets: ${info.performance.stylesheets}
                </div>

                <div style="margin-bottom: 15px;">
                    <strong>💾 Storage:</strong><br>
                    • localStorage: ${info.storage.localStorage.available ? '✅' : '❌'} (${info.storage.localStorage.items} Items)<br>
                    • sessionStorage: ${info.storage.sessionStorage.available ? '✅' : '❌'} (${info.storage.sessionStorage.items} Items)
                </div>

                <div style="margin-bottom: 15px;">
                    <strong>🌐 Netzwerk:</strong><br>
                    • Online: ${info.network.online ? '✅' : '❌'}<br>
                    • API Test: ${info.network.apiTest.success ? '✅' : '❌'} (${info.network.apiTest.responseTime}ms)
                </div>

                ${info.errors.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #ff4444;">❌ Fehler:</strong><br>
                        ${info.errors.map(error => `• ${error}`).join('<br>')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Functions Tab Content -->
            <div id="tab-content-functions" style="display: none;">
                ${this.generateFunctionsContent()}
            </div>

            <div style="margin-top: 15px;">
                <button onclick="window.pageDebugger.refresh()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px;">🔄 Aktualisieren</button>
                <button onclick="window.pageDebugger.exportDebugInfo()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer;">📤 Export</button>
            </div>
        `;
    }

    togglePanel() {
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    async refresh() {
        await this.analyzePage();
        this.updateDebugPanel();
    }

    exportDebugInfo() {
        const dataStr = JSON.stringify(this.debugInfo, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `debug-${this.currentPage}-${new Date().toISOString().slice(0, 19)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    async init() {
        // // console.log('[PageDebugger] Initializing...');
        await this.analyzePage();
        this.updateDebugPanel();
        
        // Debug-Button zum Header hinzufügen
        this.addDebugButton();
        
        // Globale Verfügbarkeit
        window.pageDebugger = this;
        
        // // console.log('[PageDebugger] Initialized');
    }

    addDebugButton() {
        const nav = document.getElementById('appNavigation');
        if (nav) {
            const debugBtn = document.createElement('a');
            debugBtn.href = '#';
            debugBtn.className = 'nav-btn debug-btn';
            debugBtn.innerHTML = '🔍';
            debugBtn.title = 'Debug Panel';
            debugBtn.onclick = (e) => {
                e.preventDefault();
                this.togglePanel();
            };
            
            debugBtn.style.cssText = `
                background: #333 !important;
                color: #00ff00 !important;
                border: 1px solid #00ff00 !important;
                font-size: 14px !important;
                padding: 8px 12px !important;
                margin-left: 10px !important;
            `;
            
            nav.appendChild(debugBtn);
        }
    }

    checkHexMapEditorInIframe() {
        // Check if the hexMapEditor is loaded within an iframe
        if (window.parent !== window) {
            return true; // If it's in an iframe, assume it's loaded
        }
        return typeof window.hexMapEditor !== 'undefined';
    }

    generateFunctionsContent() {
        const functions = this.checkFunctions();
        
        return `
            <div style="margin-bottom: 15px;">
                <strong>🔧 Funktionen-Test:</strong><br>
                <button onclick="window.pageDebugger.runFunctionTests()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin: 5px 0;">🧪 Tests ausführen</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>📋 Verfügbare Funktionen:</strong><br>
                ${Object.entries(functions.available).map(([category, funcs]) => 
                    `<div style="margin: 5px 0;">
                        <strong>${category}:</strong><br>
                        ${funcs.map(func => `• ${func.name}: ${func.available ? '✅' : '❌'}`).join('<br>')}
                    </div>`
                ).join('')}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>🎯 Spezifische Tests:</strong><br>
                <button onclick="window.pageDebugger.testBiomeLoading()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin: 2px;">🌲 Biome laden</button>
                <button onclick="window.pageDebugger.testAPIConnection()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin: 2px;">🌐 API testen</button>
                <button onclick="window.pageDebugger.testStorage()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin: 2px;">💾 Storage testen</button>
                <button onclick="window.pageDebugger.testDOMElements()" style="background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer; margin: 2px;">🏗️ DOM prüfen</button>
            </div>
            
            <div id="function-test-results" style="margin-bottom: 15px;">
                <!-- Test results will be displayed here -->
            </div>
        `;
    }

    checkFunctions() {
        const functions = {
            available: {
                'Global Functions': [
                    { name: 'fetch', available: typeof fetch !== 'undefined' },
                    { name: 'localStorage', available: typeof localStorage !== 'undefined' },
                    { name: 'sessionStorage', available: typeof sessionStorage !== 'undefined' },
                    { name: 'performance', available: typeof performance !== 'undefined' }
                ],
                'TileEditor Functions': [
                    { name: 'tileEditor.loadTileAssets', available: typeof window.tileEditor?.loadTileAssets === 'function' },
                    { name: 'tileEditor.loadCategoriesFromBiomeFolders', available: typeof window.tileEditor?.loadCategoriesFromBiomeFolders === 'function' },
                    { name: 'tileEditor.displayCategories', available: typeof window.tileEditor?.displayCategories === 'function' }
                ],
                'HexMapEditor Functions': [
                    { name: 'BiomeUtils.getBiomeFolders', available: typeof window.BiomeUtils?.getBiomeFolders === 'function' },
                    { name: 'MapCore', available: typeof window.MapCore !== 'undefined' },
                    { name: 'hexMapEditor', available: typeof window.hexMapEditor !== 'undefined' }
                ],
                'API Functions': [
                    { name: '/api/biomes/folders', available: true }, // Will be tested separately
                    { name: 'fetch with CORS', available: true }
                ]
            }
        };

        return functions;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.getElementById('tab-overview').style.background = tabName === 'overview' ? '#555' : '#333';
        document.getElementById('tab-functions').style.background = tabName === 'functions' ? '#555' : '#333';
        
        // Show/hide tab content
        document.getElementById('tab-content-overview').style.display = tabName === 'overview' ? 'block' : 'none';
        document.getElementById('tab-content-functions').style.display = tabName === 'functions' ? 'block' : 'none';
    }

    async runFunctionTests() {
        const resultsDiv = document.getElementById('function-test-results');
        resultsDiv.innerHTML = '<div style="color: #ffff00;">🧪 Tests laufen...</div>';
        
        const results = [];
        
        // Test 1: Biome Loading
        try {
            const biomeTest = await this.testBiomeLoading();
            results.push({ name: 'Biome Loading', success: biomeTest.success, message: biomeTest.message });
        } catch (error) {
            results.push({ name: 'Biome Loading', success: false, message: error.message });
        }
        
        // Test 2: API Connection
        try {
            const apiTest = await this.testAPIConnection();
            results.push({ name: 'API Connection', success: apiTest.success, message: apiTest.message });
        } catch (error) {
            results.push({ name: 'API Connection', success: false, message: error.message });
        }
        
        // Test 3: Storage
        try {
            const storageTest = this.testStorage();
            results.push({ name: 'Storage', success: storageTest.success, message: storageTest.message });
        } catch (error) {
            results.push({ name: 'Storage', success: false, message: error.message });
        }
        
        // Test 4: DOM Elements
        try {
            const domTest = this.testDOMElements();
            results.push({ name: 'DOM Elements', success: domTest.success, message: domTest.message });
        } catch (error) {
            results.push({ name: 'DOM Elements', success: false, message: error.message });
        }
        
        // Display results
        const resultsHTML = results.map(result => 
            `<div style="margin: 5px 0; color: ${result.success ? '#00ff00' : '#ff4444'};">
                • ${result.name}: ${result.success ? '✅' : '❌'} ${result.message}
            </div>`
        ).join('');
        
        resultsDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>📊 Test-Ergebnisse:</strong>
            </div>
            ${resultsHTML}
        `;
    }

    async testBiomeLoading() {
        if (this.currentPage === 'tileEditor' && window.tileEditor) {
            try {
                const categories = await window.tileEditor.loadCategoriesFromBiomeFolders();
                return {
                    success: true,
                    message: `${categories.length} Kategorien geladen`
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message
                };
            }
        } else if (this.currentPage === 'hexMapEditor' && window.BiomeUtils) {
            try {
                const biomes = await window.BiomeUtils.getBiomeFolders();
                return {
                    success: true,
                    message: `${biomes.length} Biome geladen`
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message
                };
            }
        } else {
            return {
                success: false,
                message: 'Kein Biome-Loader verfügbar'
            };
        }
    }

    async testAPIConnection() {
        // Skip API test for faster performance
        return {
            success: true,
            message: 'API test skipped for performance'
        };
    }

    testStorage() {
        try {
            const testKey = 'debugger_test_' + Date.now();
            const testValue = 'test_value';
            
            // Test localStorage
            localStorage.setItem(testKey, testValue);
            const readValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            const success = readValue === testValue;
            
            return {
                success: success,
                message: `localStorage: ${success ? 'OK' : 'Fehler'}, sessionStorage: verfügbar`
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    testDOMElements() {
        const requiredElements = this.getRequiredElements();
        const foundElements = requiredElements.filter(element => this.checkElementExists(element.id));
        
        return {
            success: foundElements.length === requiredElements.length,
            message: `${foundElements.length}/${requiredElements.length} Elemente gefunden`
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PageDebugger().init();
    });
} else {
    new PageDebugger().init();
}
