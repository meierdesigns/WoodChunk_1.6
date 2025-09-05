// FPS-Überwachungs-Modul
class FPSViewer {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsElement = null;
        this.isVisible = true;
        this.checkbox = null;
        
        this.init();
    }
    
    init() {
        // FPS-Element im Header erstellen
        this.createFPSElement();
        
        // Checkbox in der Sidebar erstellen
        this.createCheckbox();
        
        // FPS-Update starten
        this.updateFPS();
    }
    
    createFPSElement() {
        // Suche nach dem Header
        const header = document.querySelector('.toolbar');
        if (!header) return;
        
        // FPS-Element erstellen
        this.fpsElement = document.createElement('div');
        this.fpsElement.id = 'fps-display';
        this.fpsElement.style.cssText = `
            margin-left: auto;
            background: rgba(0, 0, 0, 0.7);
            color: #00FF00;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid #666;
        `;
        
        header.appendChild(this.fpsElement);
    }
    
    createCheckbox() {
        // Suche nach dem Settings-Modul
        const settingsContent = document.getElementById('settings-content');
        if (!settingsContent) return;
        
        // Checkbox-Container erstellen
        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin: 8px 0;
        `;
        
        // Label erstellen
        const label = document.createElement('label');
        label.textContent = 'FPS anzeigen';
        label.style.cssText = `
            color: white;
            margin-right: 8px;
            font-size: 12px;
        `;
        
        // Checkbox erstellen
        this.checkbox = document.createElement('input');
        this.checkbox.type = 'checkbox';
        this.checkbox.checked = this.isVisible;
        this.checkbox.style.cssText = `
            margin: 0;
        `;
        
        // Event Listener für Checkbox
        this.checkbox.addEventListener('change', (e) => {
            this.isVisible = e.target.checked;
            this.toggleVisibility();
        });
        
        // Elemente zusammenfügen
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(this.checkbox);
        settingsContent.appendChild(checkboxContainer);
    }
    
    toggleVisibility() {
        if (this.fpsElement) {
            this.fpsElement.style.display = this.isVisible ? 'block' : 'none';
        }
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        // FPS alle 100ms aktualisieren
        if (currentTime - this.lastTime >= 100) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // FPS anzeigen
            if (this.fpsElement) {
                this.fpsElement.textContent = `FPS: ${this.fps}`;
                
                // Farbe basierend auf FPS
                if (this.fps >= 50) {
                    this.fpsElement.style.color = '#00FF00'; // Grün
                } else if (this.fps >= 30) {
                    this.fpsElement.style.color = '#FFFF00'; // Gelb
                } else {
                    this.fpsElement.style.color = '#FF0000'; // Rot
                }
            }
        }
        
        // Nächsten Frame anfordern
        requestAnimationFrame(() => this.updateFPS());
    }
    
    getFPS() {
        return this.fps;
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.FPSViewer = FPSViewer;
}

// Globale Variable für andere Module (Fallback)
window.FPSViewer = FPSViewer;
