/**
 * Module Loader Module
 * Lädt alle Module für WoodChunk 1.5
 */
class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.moduleConfigs = {
            itemEditor: {
                css: '/modules/itemEditor/itemEditor.css',
                html: '/modules/itemEditor/itemEditor.html',
                js: '/modules/itemEditor/itemEditor.js',
                container: 'itemEditorContainer'
            },
            peopleEditor: {
                css: '/modules/peopleEditor/peopleEditor.css',
                html: '/modules/peopleEditor/peopleEditor.html',
                js: '/modules/peopleEditor/peopleEditor.js',
                container: 'peopleEditorContainer'
            },
            characterEditor: {
                css: '/modules/characterEditor/characterEditor.css',
                html: '/modules/characterEditor/characterEditor.html',
                js: '/modules/characterEditor/characterEditor.js',
                container: 'characterEditorContainer'
            },
            hexMapEditor: {
                        css: '/modules/hexMapEditor/index.html',
        html: '/modules/hexMapEditor/index.html',
        js: '/modules/hexMapEditor/index.html',
                container: 'hexMapEditorContainer'
            }
        };
    }

    async loadModule(moduleName) {
        const config = this.moduleConfigs[moduleName];
        if (!config) {
            console.error(`[ModuleLoader] Unbekanntes Modul: ${moduleName}`);
            return;
        }

        if (this.loadedModules.has(moduleName)) {
            // console.log(`[ModuleLoader] Modul ${moduleName} bereits geladen`);
            return;
        }

        try {
            // console.log(`[ModuleLoader] Lade Modul: ${moduleName}`);
            
            // CSS laden
            await this.loadModuleCSS(config.css);
            
            // HTML laden
            const response = await fetch(config.html);
            if (response.ok) {
                const html = await response.text();
                const container = document.getElementById(config.container);
                if (container) {
                    container.innerHTML = html;
                    
                    // JavaScript laden
                    await this.loadModuleScript(config.js);
                    
                    this.loadedModules.add(moduleName);
                    // console.log(`[ModuleLoader] Modul ${moduleName} erfolgreich geladen`);
                } else {
                    throw new Error(`Container ${config.container} nicht gefunden`);
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`[ModuleLoader] Fehler beim Laden von Modul ${moduleName}:`, error);
            this.showModuleError(moduleName, error, config.container);
        }
    }

    async loadModuleCSS(cssPath) {
        try {
            // Prüfen ob CSS bereits geladen
            if (document.querySelector(`link[href="${cssPath}"]`)) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.type = 'text/css';
            
            document.head.appendChild(link);
            
            // Warten bis CSS geladen ist
            return new Promise((resolve) => {
                link.onload = resolve;
                link.onerror = resolve; // Weiter auch wenn CSS fehlschlägt
            });
        } catch (error) {
            console.warn('[ModuleLoader] CSS konnte nicht geladen werden:', error);
        }
    }

    async loadModuleScript(scriptPath) {
        try {
            // Prüfen ob Script bereits geladen
            if (document.querySelector(`script[src="${scriptPath}"]`)) {
                return;
            }

            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'module';
            
            document.head.appendChild(script);
            
            // Warten bis Script geladen ist
            return new Promise((resolve) => {
                script.onload = resolve;
                script.onerror = resolve; // Weiter auch wenn Script fehlschlägt
            });
        } catch (error) {
            console.warn('[ModuleLoader] Script konnte nicht geladen werden:', error);
        }
    }

    showModuleError(moduleName, error, containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Fehler beim Laden des ${this.getModuleDisplayName(moduleName)}</h3>
                    <p>${error.message || error}</p>
                    <button onclick="window.moduleLoader.loadModule('${moduleName}')" class="btn btn-primary">Erneut versuchen</button>
                </div>
            `;
        }
    }

    getModuleDisplayName(moduleName) {
        const names = {
            itemEditor: 'Item Editors',
            peopleEditor: 'People Editors',
            characterEditor: 'Character Editors',
            hexMapEditor: 'HexMap Editors'
        };
        return names[moduleName] || moduleName;
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
            console.log('[ModuleLoader] Cache busted path for Buildings:', correctedPath);
        }
        
        return correctedPath;
    }

    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            this.loadedModules.delete(moduleName);
            // console.log(`[ModuleLoader] Modul ${moduleName} erfolgreich entladen`);
        }
    }

    reloadModule(moduleName) {
        this.unloadModule(moduleName);
        return this.loadModule(moduleName);
    }

    getLoadedModules() {
        return Array.from(this.loadedModules);
    }

    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
}

// Globale Verfügbarkeit
window.ModuleLoader = ModuleLoader;
