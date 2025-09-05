/**
 * App Core Module
 * Zentrale Funktionalität für WoodChunk 1.5
 */
class AppCore {
    constructor() {
        this.currentView = 'menu';
        this.validViews = ['menu', 'game', 'mapEditor', 'itemEditor', 'peopleEditor', 'characterEditor', 'hexMapEditor', 'settings'];
    }

    async init() {
        await this.loadCSS();
        await this.loadHeader();
        this.setupNavigation();
        this.loadViewFromURL();
        this.setupPopStateListener();
    }

    async loadCSS() {
        try {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'styles.css';
            document.head.appendChild(link);
        } catch (error) {
            console.error('Failed to load CSS:', error);
        }
    }

    async loadHeader() {
        try {
            const response = await fetch('header.html');
            const headerHtml = await response.text();
            document.getElementById('headerContainer').innerHTML = headerHtml;
        } catch (error) {
            console.error('Failed to load header:', error);
            this.createFallbackHeader();
        }
    }

    createFallbackHeader() {
        document.getElementById('headerContainer').innerHTML = `
            <nav class="app-navigation" id="appNavigation">
                <button class="nav-btn active" data-view="menu">🏠 Menu</button>
                <button class="nav-btn" data-view="game">🎮 Game</button>
                <button class="nav-btn" data-view="mapEditor">🗺️ Map Editor</button>
                <button class="nav-btn" data-view="itemEditor">🛡️ Item Editor</button>
                <button class="nav-btn" data-view="peopleEditor">👥 People Editor</button>
                <button class="nav-btn" data-view="characterEditor">⚔️ Character Editor</button>

                <button class="nav-btn" data-view="settings">⚙️ Settings</button>
            </nav>
        `;
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                if (view) {
                    this.showView(view);
                    this.updateNavigation(view);
                    this.updateURL(view);
                }
            });
        });
    }

    setupPopStateListener() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.showView(event.state.view);
                this.updateNavigation(event.state.view);
            } else {
                this.showView('menu');
                this.updateNavigation('menu');
            }
        });
    }

    loadViewFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view && this.isValidView(view)) {
            this.showView(view);
            this.updateNavigation(view);
        } else {
            this.showView('menu');
            this.updateNavigation('menu');
        }
    }

    isValidView(view) {
        return this.validViews.includes(view);
    }

    updateURL(view) {
        const url = new URL(window.location);
        url.searchParams.set('view', view);
        window.history.pushState({ view: view }, '', url);
    }

    updateNavigation(activeView) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === activeView) {
                btn.classList.add('active');
            }
        });

        const navigation = document.getElementById('appNavigation');
        if (navigation) {
            if (activeView === 'menu') {
                navigation.classList.add('hidden');
            } else {
                navigation.classList.remove('hidden');
            }
        }
    }

    showView(view) {
        this.currentView = view;
        const content = document.getElementById('appContent');
        
        // Special handling for hexMapEditor
        if (view === 'hexMapEditor') {
            showSection('hexMapEditor');
            return;
        }
        
        // Delegate to view renderer
        if (window.viewRenderer) {
            const html = window.viewRenderer.renderView(view);
            content.innerHTML = html;
            
            // Auto-load module if needed
            if (window.moduleLoader && this.shouldAutoLoadModule(view)) {
                setTimeout(() => window.moduleLoader.loadModule(view), 100);
            }
        }
    }

    shouldAutoLoadModule(view) {
        return ['itemEditor', 'peopleEditor', 'characterEditor'].includes(view);
    }
    
    // Correct image path for proper loading
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        let correctedPath = imagePath;
        
        // Ensure path starts with /
        if (!correctedPath.startsWith('/') && !correctedPath.startsWith('http')) {
            correctedPath = '/' + correctedPath;
        }
        
        // Add cache busting for Buildings tiles
        if (correctedPath.includes('Buildings') || correctedPath.includes('slice_') || correctedPath.includes('tile_')) {
            const timestamp = Date.now();
            correctedPath += (correctedPath.includes('?') ? '&' : '?') + '_cb=' + timestamp;
            console.log('[AppCore] Cache busted path for Buildings:', correctedPath);
        }
        
        return correctedPath;
    }
}

// Globale Verfügbarkeit
window.AppCore = AppCore;
