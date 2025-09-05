// Debug Modal Integration Script
// This script provides a simple way to integrate the debug modal into any page

(function() {
    'use strict';
    
    let debugModalLoaded = false;
    let debugModalFrame = null;
    
    // Create debug modal container
    function createDebugModalContainer() {
        if (document.getElementById('debugModalContainer')) {
            return; // Already exists
        }
        
        const container = document.createElement('div');
        container.id = 'debugModalContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: none;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;
        
        // Create iframe for debug modal
        const iframe = document.createElement('iframe');
        iframe.id = 'debugModalFrame';
        iframe.src = '../../debug/debugModal.html';
        iframe.style.cssText = `
            width: 90vw;
            height: 90vh;
            max-width: 1400px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            z-index: 10000;
        `;
        closeBtn.onclick = closeDebugModal;
        
        container.appendChild(iframe);
        container.appendChild(closeBtn);
        document.body.appendChild(container);
        
        debugModalFrame = iframe;
        
        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
            if (event.data.type === 'debugModalClose') {
                closeDebugModal();
            }
        });
    }
    
    // Open debug modal
    function openDebugModal() {
        const debugWindow = window.open('../../debug/debugModal.html', 'debugModal', 
            'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no');
        
        if (debugWindow) {
            console.log('[DebugModal] Modal opened in new window');
            
            // Send initial data to debug window
            setTimeout(() => {
                debugWindow.postMessage({
                    type: 'init',
                    data: {
                        currentPage: window.location.href,
                        tileEditor: window.tileEditor ? 'available' : 'not available',
                        timestamp: new Date().toISOString()
                    }
                }, '*');
            }, 1000);
            
            // Listen for messages from debug window
            window.addEventListener('message', function(event) {
                if (event.source === debugWindow) {
                    console.log('[DebugModal] Received message from debug window:', event.data);
                    
                    // Handle different message types
                    switch (event.data.type) {
                        case 'getTileEditorState':
                            if (window.tileEditor) {
                                debugWindow.postMessage({
                                    type: 'tileEditorState',
                                    data: {
                                        categories: window.tileEditor.categories,
                                        tiles: window.tileEditor.tiles,
                                        selectedCategoryId: window.tileEditor.selectedCategoryId,
                                        selectedTileId: window.tileEditor.selectedTileId,
                                        debugMode: window.tileEditor.debugMode
                                    }
                                }, '*');
                            }
                            break;
                            
                        case 'executeCommand':
                            if (window.tileEditor && window.tileEditor[event.data.command]) {
                                try {
                                    const result = window.tileEditor[event.data.command](event.data.args);
                                    debugWindow.postMessage({
                                        type: 'commandResult',
                                        data: { success: true, result: result }
                                    }, '*');
                                } catch (error) {
                                    debugWindow.postMessage({
                                        type: 'commandResult',
                                        data: { success: false, error: error.message }
                                    }, '*');
                                }
                            }
                            break;
                    }
                }
            });
            
        } else {
            console.error('[DebugModal] Failed to open debug modal - popup blocked?');
            alert('Debug Modal konnte nicht geöffnet werden. Bitte erlauben Sie Popups für diese Seite.');
        }
    }
    
    // Close debug modal
    function closeDebugModal() {
        const container = document.getElementById('debugModalContainer');
        if (container) {
            container.style.display = 'none';
            console.log('[DebugModal] Modal closed');
        }
    }
    
    // Create debug button
    function createDebugButton() {
        if (document.getElementById('debugModalBtn')) {
            return; // Already exists
        }
        
        const btn = document.createElement('button');
        btn.id = 'debugModalBtn';
        btn.innerHTML = '🐛 Debug';
        btn.title = 'Open Debug Modal';
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            z-index: 9998;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        btn.onclick = openDebugModal;
        
        document.body.appendChild(btn);
    }
    
    // Initialize when DOM is ready
    function init() {
        createDebugButton();
        console.log('[DebugModal] Integration script loaded');
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose functions globally
    window.openDebugModal = openDebugModal;
    window.closeDebugModal = closeDebugModal;
    
})();
