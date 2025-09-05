/**
 * CacheManager Debug Test Script
 * Run this in the browser console to test the CacheManager
 */

// Test function to debug CacheManager
window.testCacheManager = function() {
    // console.log('=== CACHE MANAGER DEBUG TEST START ===');
    
    // Check if CacheManager exists
    if (typeof CacheManager === 'undefined') {
        console.error('CacheManager class not found!');
        return;
    }
    
    // console.log('CacheManager class found:', CacheManager);
    
    // Create a test instance
    const testCacheManager = new CacheManager();
    // console.log('Test CacheManager instance created:', testCacheManager);
    
    // Test basic operations
    // console.log('=== Testing Basic Operations ===');
    
    // Test 1: Check initial state
    // console.log('Test 1 - Initial state:');
    // console.log('- Cache size:', testCacheManager.getCacheSize());
    // console.log('- Cache keys:', testCacheManager.getAllCacheKeys());
    // console.log('- Force refresh:', testCacheManager.forceRefresh);
    
    // Test 2: Set some test data
    // console.log('Test 2 - Setting test data:');
    const testData = [
        { name: 'test1', id: 1, image: 'test1.png', source: 'test' },
        { name: 'test2', id: 2, image: 'test2.png', source: 'test' }
    ];
    
    testCacheManager.setCachedData('test_biome_all', testData);
    // console.log('- After setting data, cache size:', testCacheManager.getCacheSize());
    // console.log('- Cache keys:', testCacheManager.getAllCacheKeys());
    
    // Test 3: Get cached data
    // console.log('Test 3 - Getting cached data:');
    const retrievedData = testCacheManager.getCachedData('test_biome_all');
    // console.log('- Retrieved data:', retrievedData);
    // console.log('- Data length:', retrievedData ? retrievedData.length : 'null');
    
    // Test 4: Check cache usage
    // console.log('Test 4 - Cache usage check:');
    // console.log('- Should use cache (normal):', testCacheManager.shouldUseCache('test_biome_all'));
    
    // Test 5: Set force refresh
    // console.log('Test 5 - Force refresh:');
    testCacheManager.setForceRefresh(true);
    // console.log('- Should use cache (force refresh):', testCacheManager.shouldUseCache('test_biome_all'));
    
    // Test 6: Reset force refresh
    // console.log('Test 6 - Reset force refresh:');
    testCacheManager.resetForceRefresh();
    // console.log('- Should use cache (after reset):', testCacheManager.shouldUseCache('test_biome_all'));
    
    // Test 7: Clear specific biome cache
    // console.log('Test 7 - Clear specific biome cache:');
    testCacheManager.clearAllCachesForBiome('test_biome');
    // console.log('- After clearing, cache size:', testCacheManager.getCacheSize());
    // console.log('- Cache keys:', testCacheManager.getAllCacheKeys());
    
    // Test 8: Test with null/undefined data
    // console.log('Test 8 - Test with null data:');
    testCacheManager.setCachedData('null_test', null);
    testCacheManager.setCachedData('undefined_test', undefined);
    // console.log('- Cache size after null/undefined:', testCacheManager.getCacheSize());
    
    // Test 9: Clear entire cache
    // console.log('Test 9 - Clear entire cache:');
    testCacheManager.clearAllCaches();
    // console.log('- After clearing all, cache size:', testCacheManager.getCacheSize());
    
    // console.log('=== CACHE MANAGER DEBUG TEST END ===');
};

// Test function to check if ModalManager is using CacheManager correctly
window.testModalManagerCacheIntegration = function() {
    // console.log('=== MODAL MANAGER CACHE INTEGRATION TEST ===');
    
    if (!window.tileEditor || !window.tileEditor.modalManager) {
        console.error('tileEditor or modalManager not found!');
        return;
    }
    
    const modalManager = window.tileEditor.modalManager;
    // console.log('ModalManager found:', modalManager);
    
    // Check if ModalManager has cacheManager
    if (!modalManager.cacheManager) {
        console.error('ModalManager does not have cacheManager!');
        return;
    }
    
    // console.log('CacheManager in ModalManager:', modalManager.cacheManager);
    // console.log('CacheManager type:', typeof modalManager.cacheManager);
    // console.log('CacheManager instanceof CacheManager:', modalManager.cacheManager instanceof CacheManager);
    
    // Test cache operations through ModalManager
    // console.log('=== Testing Cache Operations through ModalManager ===');
    
    const cacheManager = modalManager.cacheManager;
    // console.log('Cache size:', cacheManager.getCacheSize());
    // console.log('Cache keys:', cacheManager.getAllCacheKeys());
    
    // Test setting data through ModalManager
    const testData = [
        { name: 'modal_test1', id: 101, image: 'modal_test1.png', source: 'modal_test' },
        { name: 'modal_test2', id: 102, image: 'modal_test2.png', source: 'modal_test' }
    ];
    
    cacheManager.setCachedData('modal_test_biome_all', testData);
    // console.log('After setting data through ModalManager:');
    // console.log('- Cache size:', cacheManager.getCacheSize());
    // console.log('- Cache keys:', cacheManager.getAllCacheKeys());
    
    // console.log('=== MODAL MANAGER CACHE INTEGRATION TEST END ===');
};

// Auto-run tests when script is loaded
// console.log('CacheManager debug tests loaded. Run testCacheManager() or testModalManagerCacheIntegration() to test.');
