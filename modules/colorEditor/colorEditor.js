/**
 * Color Editor Module - Handles color editing functionality
 */
class ColorEditor {
    constructor() {
        this.currentCategory = null;
        
        // Load CSS if not already loaded
        this.loadCSS();
        
        this.init();
    }
    
    // Cache busting utility for Buildings images
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Add cache busting for Buildings tiles
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const separator = imagePath.includes('?') ? '&' : '?';
            return `${imagePath}${separator}_cb=${timestamp}`;
        }
        
        return imagePath;
    }

    loadCSS() {
        // Check if CSS is already loaded
        const existingCSS = document.querySelector('link[href*="colorEditor.css"]');
        if (!existingCSS) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/modules/colorEditor/colorEditor.css';
            cssLink.onload = () => console.log('[ColorEditor] CSS loaded successfully');
            cssLink.onerror = () => console.error('[ColorEditor] Failed to load CSS');
            document.head.appendChild(cssLink);
            console.log('[ColorEditor] CSS loading initiated');
        } else {
            console.log('[ColorEditor] CSS already loaded');
        }
    }

    init() {
        console.log('[ColorEditor] Initializing...');
        this.loadCategories();
        this.bindEvents();
        this.selectCategory('biomes'); // Default to biomes
    }

    bindEvents() {
        // Control buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportColors());
        document.getElementById('importBtn').addEventListener('click', () => this.showImportModal());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetColors());
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());

        // Import modal
        document.getElementById('confirmImport').addEventListener('click', () => this.confirmImport());
        document.getElementById('cancelImport').addEventListener('click', () => this.hideImportModal());

        // Listen for color change events
        window.addEventListener('colorChanged', (e) => this.onColorChanged(e.detail));
    }

    loadCategories() {
        const categoryList = document.getElementById('categoryList');
        const categories = getColorCategories();
        
        categoryList.innerHTML = '';
        
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.dataset.category = category;
            
            const categoryColors = getCategoryColors(category);
            const colorCount = Object.keys(categoryColors).length;
            
            categoryItem.innerHTML = `
                <h3>${this.formatCategoryName(category)}</h3>
                <p>${colorCount} Farben</p>
            `;
            
            categoryItem.addEventListener('click', () => this.selectCategory(category));
            categoryList.appendChild(categoryItem);
        });
    }

    selectCategory(category) {
        // Update active state
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.currentCategory = category;
        this.loadColorPanel(category);
    }

    loadColorPanel(category) {
        const colorPanel = document.getElementById('colorPanel');
        const colors = getCategoryColors(category);
        
        colorPanel.innerHTML = `
            <div class="color-category">
                <h3>${this.formatCategoryName(category)}</h3>
                ${Object.entries(colors).map(([name, color]) => this.createColorItem(name, color)).join('')}
            </div>
        `;
        
        // Bind color picker events
        this.bindColorPickerEvents();
    }

    createColorItem(name, color) {
        return `
            <div class="color-item" data-color="${name}">
                <div class="color-name">${this.formatColorName(name)}</div>
                <input type="color" class="color-picker" value="${color}" data-color="${name}">
                <div class="color-value" contenteditable="true" data-color="${name}">${color}</div>
            </div>
        `;
    }

    bindColorPickerEvents() {
        // Color picker events
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const colorName = e.target.dataset.color;
                const newColor = e.target.value;
                this.onColorChanged({ colorName, newColor });
            });
        });

        // Hex code editing events
        document.querySelectorAll('.color-value').forEach(hexField => {
            hexField.addEventListener('click', (e) => {
                e.target.focus();
                e.target.select();
            });
            
            hexField.addEventListener('input', (e) => {
                const colorName = e.target.dataset.color;
                let newColor = e.target.textContent.trim();
                
                // Validate hex format
                if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                    this.onColorChanged({ colorName, newColor });
                }
            });
            
            hexField.addEventListener('blur', (e) => {
                const colorName = e.target.dataset.color;
                let newColor = e.target.textContent.trim();
                
                // If invalid format, revert to current color
                if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                    const currentColor = getColor(this.currentCategory, colorName);
                    e.target.textContent = currentColor;
                }
            });
            
            hexField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });
    }

    onColorChanged(detail) {
        const { colorName, newColor } = detail;
        
        // Update the color in the configuration
        setColor(this.currentCategory, colorName, newColor);
        
        // Update the color picker value
        const colorPicker = document.querySelector(`[data-color="${colorName}"]`);
        if (colorPicker) {
            colorPicker.value = newColor;
        }
        
        // Update the hex code display
        const hexField = document.querySelector(`.color-value[data-color="${colorName}"]`);
        if (hexField) {
            hexField.textContent = newColor;
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('colorChanged', {
            detail: {
                category: this.currentCategory,
                colorName,
                newColor
            }
        }));
        
        this.showNotification(`Farbe ${this.formatColorName(colorName)} auf ${newColor} geändert`);
    }

    exportColors() {
        const colors = exportColors();
        const dataStr = JSON.stringify(colors, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'woodchunk-colors.json';
        link.click();
        
        console.log('[ColorEditor] Colors exported');
    }

    showImportModal() {
        document.getElementById('importModal').classList.remove('hidden');
        document.getElementById('importTextarea').value = '';
        document.getElementById('importTextarea').focus();
    }

    hideImportModal() {
        document.getElementById('importModal').classList.add('hidden');
    }

    confirmImport() {
        const importText = document.getElementById('importTextarea').value;
        
        try {
            const colors = JSON.parse(importText);
            importColors(colors);
            this.hideImportModal();
            this.loadCategories();
            this.loadColorPanel(this.currentCategory);
            
            // Show success message
            this.showNotification('Farben erfolgreich importiert!', 'success');
        } catch (error) {
            console.error('[ColorEditor] Import error:', error);
            this.showNotification('Fehler beim Importieren der Farben!', 'error');
        }
    }

    resetColors() {
        if (confirm('Möchtest du wirklich alle Farben auf die Standardwerte zurücksetzen?')) {
            resetToDefaults();
            this.loadCategories();
            this.loadColorPanel(this.currentCategory);
            this.showNotification('Farben wurden zurückgesetzt!', 'success');
        }
    }

    togglePreview() {
        const previewPanel = document.getElementById('previewPanel');
        const previewBtn = document.getElementById('previewBtn');
        
        if (previewPanel.classList.contains('hidden')) {
            this.generatePreview();
            previewPanel.classList.remove('hidden');
            previewBtn.textContent = '👁️ Hide Preview';
        } else {
            previewPanel.classList.add('hidden');
            previewBtn.textContent = '👁️ Preview';
        }
    }

    generatePreview() {
        const previewContent = document.getElementById('previewContent');
        const colors = exportColors();
        
        let previewHTML = '';
        
        Object.entries(colors).forEach(([category, categoryColors]) => {
            Object.entries(categoryColors).forEach(([name, color]) => {
                previewHTML += `
                    <div class="preview-item" style="background-color: ${color};">
                        <div>
                            <strong>${this.formatCategoryName(category)}</strong><br>
                            ${this.formatColorName(name)}
                        </div>
                    </div>
                `;
            });
        });
        
        previewContent.innerHTML = previewHTML;
    }

    formatCategoryName(category) {
        const names = {
            'biomes': 'Biome',
            'terrain': 'Terrain',
            'ui': 'Benutzeroberfläche',
            'status': 'Status',
            'rarity': 'Seltenheit',
            'combat': 'Kampf',
            'weather': 'Wetter/Zeit',
            'resources': 'Ressourcen'
        };
        
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    formatColorName(name) {
        return name.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorEditor();
});
