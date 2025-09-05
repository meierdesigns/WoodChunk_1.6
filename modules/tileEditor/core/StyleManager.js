/**
 * StyleManager - Handles all CSS styles for TileEditor
 */
class StyleManager {
    constructor() {
        this.styleElement = null;
    }

    addGlobalStyles() {
        // Check if styles already exist
        if (document.getElementById('tile-editor-view-styles')) {
            return;
        }
        
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'tile-editor-view-styles';
        this.styleElement.textContent = this.getStyles();
        
        document.head.appendChild(this.styleElement);
    }

    getStyles() {
        return `
            /* TILE TABLE STYLES - DIRECT AND SPECIFIC */
            .tiles-table-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
                display: block;
                box-sizing: border-box;
            }
            
            .tiles-table {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
                display: block;
            }
            
            .tiles-table-content {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: clamp(11px, 2vw, 14px);
                margin: 0;
                padding: 0;
                table-layout: auto;
                display: table;
            }
            
            .tiles-table-content th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: clamp(6px, 1.5vw, 12px) clamp(4px, 1vw, 8px);
                text-align: left;
                font-weight: 600;
                font-size: clamp(11px, 2vw, 14px);
                border: none;
                white-space: nowrap;
                display: table-cell;
            }
            
            .tiles-table-content td {
                padding: clamp(6px, 1.5vw, 12px) clamp(4px, 1vw, 8px);
                border-bottom: 1px solid #e9ecef;
                vertical-align: middle;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: table-cell;
            }
            
            .tile-row:hover {
                background: #f8f9fa;
            }
            
            .tile-image-cell {
                width: clamp(50px, 8vw, 80px);
                text-align: center;
                padding: clamp(4px, 1vw, 8px) clamp(2px, 0.5vw, 4px);
            }
            
            .tile-name-cell {
                font-weight: 600;
                color: #333;
                width: clamp(100px, 15vw, 150px);
            }
            
            .tile-movement-cell {
                color: #4CAF50;
                font-weight: 500;
                width: clamp(60px, 10vw, 100px);
                text-align: center;
            }
            
            .tile-defense-cell {
                color: #2196F3;
                font-weight: 500;
                width: clamp(60px, 10vw, 100px);
                text-align: center;
            }
            
            .tile-type-cell {
                color: #FF9800;
                font-weight: 500;
                width: clamp(80px, 12vw, 120px);
            }
            
            .tile-description-cell {
                color: #757575;
                font-size: clamp(10px, 1.8vw, 13px);
                width: clamp(150px, 25vw, 250px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .tile-actions-cell {
                text-align: center;
                width: clamp(60px, 10vw, 100px);
                padding: clamp(4px, 1vw, 8px) clamp(2px, 0.5vw, 4px);
            }
            
            .tile-thumbnail {
                width: 100%;
                height: 100%;
                border-radius: 6px;
                object-fit: cover;
                border: 2px solid #e9ecef;
            }
            
            .edit-tile-btn,
            .delete-tile-btn {
                padding: clamp(4px, 1vw, 8px) clamp(6px, 1.5vw, 12px);
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: clamp(11px, 2vw, 14px);
                transition: all 0.2s ease;
                min-width: clamp(30px, 5vw, 50px);
                display: inline-block;
            }
            
            .edit-tile-btn {
                background: #007bff;
                color: white;
                margin-right: 4px;
            }
            
            .edit-tile-btn:hover {
                background: #0056b3;
                transform: translateY(-1px);
            }
            
            .delete-tile-btn {
                background: #dc3545;
                color: white;
            }
            
            .delete-tile-btn:hover {
                background: #c82333;
                transform: translateY(-1px);
            }
            
            /* CARDS VIEW STYLES */
            .tiles-cards {
                width: 100%;
                margin: 0;
                padding: 0;
                clear: both;
                float: none;
            }
            
            .tiles-cards .tiles-table-content thead {
                display: none;
            }
            
            .tiles-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(clamp(140px, 20vw, 240px), 1fr));
                gap: clamp(10px, 1.5vw, 20px);
                padding: clamp(10px, 1.5vw, 20px) 0;
                margin: 0;
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            .tile-card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
                transition: all 0.3s ease;
                border: 1px solid #e9ecef;
                margin: 0;
                cursor: pointer;
            }
            
            .tile-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                background: #f8f9fa;
            }
            
            .tile-image-container {
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            
            .tile-image-container img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .tile-card:hover .tile-image-container img {
                transform: scale(1.05);
            }
            
            .tile-details {
                padding: clamp(4px, 0.8vw, 8px);
                text-align: center;
            }
            
            .tile-name {
                display: block;
                font-size: clamp(12px, 1.8vw, 15px);
                font-weight: 600;
                color: #333;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            /* EMBEDDED CATEGORY TILES STYLES */
            .category-tiles {
                margin-top: 12px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .category-tiles .tiles-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
                gap: 8px;
                padding: 0;
                margin: 0;
            }
            
            .category-tiles .tile-card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 4px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .category-tiles .tile-card:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .category-tiles .tile-image-container {
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 4px;
            }
            
            .category-tiles .tile-thumbnail {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            
            .category-tiles .tile-name {
                font-size: 10px;
                color: #fff;
                line-height: 1.2;
                margin: 0;
            }
            
            .more-tiles {
                background: rgba(0, 123, 255, 0.2) !important;
                border-color: rgba(0, 123, 255, 0.4) !important;
            }
            
            .more-indicator {
                font-size: 16px;
                font-weight: bold;
                color: #007bff;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
            
            /* RESPONSIVE CONTAINER STYLES */
            #biomeTilesList {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            /* Consolidated into main CSS file */
            
            .biome-tiles-list {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            /* RESPONSIVE MODAL STYLES */
            .modal-large {
                width: 100vw;
                max-width: 100vw;
                height: 100vh;
                max-height: 100vh;
                margin: 0;
                padding: 0;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 0;
                box-sizing: border-box;
            }
            
            .biome-modal-content {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                padding: clamp(8px, 2vw, 20px);
            }
            
            /* RESPONSIVE BREAKPOINTS */
            @media (max-width: 768px) {
                .tiles-grid {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 8px;
                }
                
                /* Responsive styles handled by main definition */
                
                .tiles-table-content {
                    font-size: 11px;
                }
                
                /* Responsive styles handled by main definition */
            }
            
            @media (max-width: 480px) {
                .tiles-grid {
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 6px;
                }
                
                /* Responsive styles handled by main definition */
                
                .tiles-table-content {
                    font-size: 10px;
                }
                
                /* Responsive styles handled by main definition */
            }
        `;
    }

    forceReapplyStyles() {
        console.log('[StyleManager] Force reapplying styles');
        
        if (this.styleElement) {
            this.styleElement.remove();
        }
        
        this.addGlobalStyles();
        
        // Force browser reflow to ensure styles are applied
        document.body.offsetHeight;
        
        // Additional force reflow for table elements
        const tableElements = document.querySelectorAll('.tiles-table-content, .tiles-cards');
        tableElements.forEach(element => {
            element.style.display = 'none';
            element.offsetHeight; // Force reflow
            element.style.display = '';
        });
        
        console.log('[StyleManager] Layout recalculation completed');
    }

    destroy() {
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleManager;
}
