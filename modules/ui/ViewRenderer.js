/**
 * View Renderer Module
 * Rendert alle UI-Views für WoodChunk 1.5
 */
class ViewRenderer {
    constructor() {
        this.views = {
            menu: this.renderMainMenu.bind(this),
            game: this.renderGame.bind(this),
            mapEditor: this.renderMapEditor.bind(this),
            itemEditor: this.renderItemEditor.bind(this),
            peopleEditor: this.renderPeopleEditor.bind(this),
            characterEditor: this.renderCharacterEditor.bind(this),
    
            hexMapEditor: this.renderHexMapEditor.bind(this),
            settings: this.renderSettings.bind(this)
        };
    }

    renderView(viewName) {
        const renderFunction = this.views[viewName];
        if (renderFunction) {
            return renderFunction();
        }
        return `<div class="error">View "${viewName}" nicht gefunden</div>`;
    }

    renderMainMenu() {
        return `
            <div class="main-menu">
                <div class="menu-header">
                    <h1>WoodChunk 1.5</h1>
                    <p>Adventure Awaits</p>
                </div>
                <nav class="menu-navigation">
                    <div class="menu-item" onclick="app.showView('game'); app.updateURL('game'); app.updateNavigation('game')">
                        <span class="icon">🎮</span>
                        <span class="label">Play Game</span>
                    </div>

                    <div class="menu-item" onclick="showSection('hexMapEditor')">
                        <span class="icon">🗺️</span>
                        <span class="label">HexMap Editor</span>
                    </div>
                    <div class="menu-item" onclick="app.showView('characterEditor'); app.updateURL('characterEditor'); app.updateNavigation('characterEditor')">
                        <span class="icon">⚔️</span>
                        <span class="label">Character Editor</span>
                    </div>
                    <div class="menu-item" onclick="app.showView('itemEditor'); app.updateURL('itemEditor'); app.updateNavigation('itemEditor')">
                        <span class="icon">🛡️</span>
                        <span class="label">Item Editor</span>
                    </div>
                    <div class="menu-item" onclick="app.showView('peopleEditor'); app.updateURL('peopleEditor'); app.updateNavigation('peopleEditor')">
                        <span class="icon">👥</span>
                        <span class="label">People Editor</span>
                    </div>
                    <div class="menu-item" onclick="app.showView('settings'); app.updateURL('settings'); app.updateNavigation('settings')">
                        <span class="icon">⚙️</span>
                        <span class="label">Settings</span>
                    </div>
                </nav>
                <div class="menu-footer">
                    <p>Version 1.5.0 - Modular JavaScript</p>
                    <p>Current URL: ${window.location.href}</p>
                </div>
            </div>
        `;
    }

    renderGame() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>WoodChunk 1.5 - Game</h2>
                    <div class="header-controls">
                        <button class="btn btn-primary">New Game</button>
                        <button class="btn btn-secondary">Load Game</button>
                        <button class="btn btn-secondary">Save Game</button>
                    </div>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <h3>Game Interface</h3>
                    <p>Hex grid game will be rendered here</p>
                    <div style="background: #f0f0f0; padding: 2rem; border-radius: 0.5rem; margin: 1rem 0;">
                        <p>Game Canvas Area</p>
                        <p>Grid Size: 20x20</p>
                        <p>Tile Size: 60px</p>
                    </div>
                    <p><strong>Current URL:</strong> ${window.location.href}</p>
                </div>
            </div>
        `;
    }

    renderMapEditor() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>Map Editor</h2>
                    <div class="header-controls">
                        <button class="btn btn-primary">Generate Terrain</button>
                        <button class="btn btn-secondary">Clear Map</button>
                    </div>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <h3>Hex Grid Editor</h3>
                    <div style="background: #f0f0f0; padding: 2rem; border-radius: 0.5rem; margin: 1rem 0;">
                        <p>Canvas Area for Hex Grid</p>
                        <p>Grid Size: 20x20</p>
                        <p>Tile Size: 60px</p>
                    </div>
                    <p><strong>Current URL:</strong> ${window.location.href}</p>
                </div>
            </div>
        `;
    }

    renderItemEditor() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>Item Editor</h2>
                    <div class="header-controls">
                        <span class="loading-indicator">🔄 Lade Module...</span>
                    </div>
                </div>
                <div id="itemEditorContainer" style="padding: 1rem;">
                    <div class="loading">Lade Item Editor Module...</div>
                </div>
            </div>
        `;
    }

    renderPeopleEditor() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>People Editor</h2>
                    <div class="header-controls">
                        <span class="loading-indicator">🔄 Lade Module...</span>
                    </div>
                </div>
                <div id="peopleEditorContainer" style="padding: 1rem;">
                    <div class="loading">Lade People Editor Module...</div>
                </div>
            </div>
        `;
    }

    renderHexMapEditor() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>HexMap Editor</h2>
                    <div class="header-controls">
                        <span class="loading-indicator">🔄 Lade Module...</span>
                    </div>
                </div>
                <div id="hexMapEditorContainer" style="padding: 1rem;">
                    <div class="loading">Lade HexMap Editor Module...</div>
                </div>
            </div>
        `;
    }

    renderCharacterEditor() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>Character Editor</h2>
                    <div class="header-controls">
                        <span class="loading-indicator">🔄 Lade Module...</span>
                    </div>
                </div>
                <div id="characterEditorContainer" style="padding: 1rem;">
                    <div class="loading">Lade Character Editor Module...</div>
                </div>
            </div>
        `;
    }



    renderSettings() {
        return `
            <div class="editor">
                <div class="editor-header">
                    <h2>Settings</h2>
                    <div class="header-controls">
                        <button class="btn btn-primary">Save Changes</button>
                        <button class="btn btn-secondary">Reset to Defaults</button>
                    </div>
                </div>
                <div style="padding: 1rem;">
                    <h3>Audio</h3>
                    <div class="form-group">
                        <label>Music Volume</label>
                        <input type="range" min="0" max="1" step="0.1" value="0.7">
                        <span>70%</span>
                    </div>
                    <div class="form-group">
                        <label>Sound Effects Volume</label>
                        <input type="range" min="0" max="1" step="0.1" value="0.8">
                        <span>80%</span>
                    </div>
                    
                    <h3>Graphics</h3>
                    <div class="form-group">
                        <label>Tile Size</label>
                        <input type="range" min="30" max="100" step="10" value="60">
                        <span>60px</span>
                    </div>
                    <div class="form-group">
                        <label>Grid Size</label>
                        <input type="range" min="10" max="50" step="5" value="20">
                        <span>20x20</span>
                    </div>
                    
                    <h3>Game</h3>
                    <div class="form-group">
                        <label>Auto Save</label>
                        <input type="checkbox" checked>
                    </div>
                    <div class="form-group">
                        <label>Debug Mode</label>
                        <input type="checkbox">
                    </div>
                    
                    <p><strong>Current URL:</strong> ${window.location.href}</p>
                </div>
            </div>
        `;
    }
}

// Globale Verfügbarkeit
window.ViewRenderer = ViewRenderer;
