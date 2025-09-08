// Maps Manager Debug Script
// Führe dieses Script in der Browser-Konsole aus um den Maps Manager zu prüfen

console.log('=== MAPS MANAGER DEBUG ===');

// 1. Prüfe ob alle Module geladen sind
console.log('1. Module Check:');
console.log('- MapsModule:', typeof MapsModule);
console.log('- UIManager:', typeof UIManager);
console.log('- MapCore:', typeof MapCore);

// 2. Prüfe globale Instanzen
console.log('\n2. Global Instances:');
console.log('- window.mapsModule:', !!window.mapsModule);
console.log('- window.settingsModule:', !!window.settingsModule);
console.log('- window.hexMapEditor:', !!window.hexMapEditor);

// 3. Prüfe HTML-Elemente
console.log('\n3. HTML Elements:');
const elements = [
    'maps-modal',
    'map-name-input', 
    'save-map-btn',
    'export-maps-btn',
    'import-maps-btn',
    'open-maps-btn'
];

elements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`- ${id}:`, !!element);
    if (element) {
        console.log(`  Details:`, {
            visible: element.style.display !== 'none',
            disabled: element.disabled,
            className: element.className
        });
    }
});

// 4. Prüfe Core-Status
console.log('\n4. Core Status:');
if (window.hexMapEditor && window.hexMapEditor.core) {
    const core = window.hexMapEditor.core;
    console.log('- Core available:', !!core);
    console.log('- getMapData method:', typeof core.getMapData);
    console.log('- tiles:', !!core.tiles);
    console.log('- tiles count:', core.tiles ? core.tiles.size : 0);
    
    // Test getMapData
    try {
        const mapData = core.getMapData();
        console.log('- getMapData result:', mapData);
    } catch (error) {
        console.error('- getMapData error:', error);
    }
} else {
    console.log('- Core not available');
}

// 5. Prüfe Server-Verbindung
console.log('\n5. Server Connection:');
fetch('/api/status')
    .then(response => response.json())
    .then(data => {
        console.log('- Server status:', data);
    })
    .catch(error => {
        console.error('- Server error:', error);
    });

// 6. Test Maps API
console.log('\n6. Maps API Test:');
fetch('/api/maps')
    .then(response => response.json())
    .then(data => {
        console.log('- Maps API response:', data);
    })
    .catch(error => {
        console.error('- Maps API error:', error);
    });

// 7. Prüfe Event-Listener
console.log('\n7. Event Listeners:');
const saveBtn = document.getElementById('save-map-btn');
if (saveBtn) {
    console.log('- Save button found');
    console.log('- onclick handler:', !!saveBtn.onclick);
    
    // Test click simulation
    console.log('- Testing click simulation...');
    if (window.mapsModule) {
        try {
            window.mapsModule.debugSaveButton();
        } catch (error) {
            console.error('- Debug function error:', error);
        }
    }
} else {
    console.log('- Save button not found');
}

// 8. Prüfe MapsModule-Status
console.log('\n8. MapsModule Status:');
if (window.mapsModule) {
    const mapsModule = window.mapsModule;
    console.log('- MapsModule available:', !!mapsModule);
    console.log('- Core reference:', !!mapsModule.core);
    console.log('- Current map name:', mapsModule.currentMapName);
    console.log('- Saved maps count:', mapsModule.savedMaps ? mapsModule.savedMaps.length : 0);
} else {
    console.log('- MapsModule not available');
}

console.log('\n=== END MAPS MANAGER DEBUG ===');

// 9. Öffne Maps Manager Modal
console.log('\n9. Opening Maps Manager...');
if (window.mapsModule) {
    try {
        window.mapsModule.showMapsModal();
        console.log('- Maps Manager opened');
    } catch (error) {
        console.error('- Error opening Maps Manager:', error);
    }
} else {
    console.log('- Cannot open Maps Manager - MapsModule not available');
}
