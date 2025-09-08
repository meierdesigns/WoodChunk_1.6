// Clear all localStorage and cache to force reload of updated tiles
console.log('[CacheClear] Clearing localStorage and forcing refresh...');

// Clear all localStorage
localStorage.clear();

// Clear any cached tile lists
if (window.forestTilesList) delete window.forestTilesList;
if (window.mountainsTilesList) delete window.mountainsTilesList;
if (window.waterTilesList) delete window.waterTilesList;
if (window.desertTilesList) delete window.desertTilesList;
if (window.swampTilesList) delete window.swampTilesList;
if (window.plainTilesList) delete window.plainTilesList;
if (window.jungleTilesList) delete window.jungleTilesList;
if (window.badlandsTilesList) delete window.badlandsTilesList;
if (window.snowTilesList) delete window.snowTilesList;
if (window.oceanTilesList) delete window.oceanTilesList;
if (window.buildingsTilesList) delete window.buildingsTilesList;
if (window.unassignedTilesList) delete window.unassignedTilesList;

console.log('[CacheClear] All tile lists cleared. Please refresh the page manually with Ctrl+F5 or Ctrl+Shift+R');

// Force reload
setTimeout(() => {
    location.reload(true);
}, 1000);
