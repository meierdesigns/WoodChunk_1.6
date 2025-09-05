// Simple test API for Debug Modal
// This file simulates the server endpoints that the debug modal expects

(function() {
    'use strict';
    
    // Mock server data
    const mockData = {
        categories: [
            { id: 'forest', name: 'Forest', count: 15 },
            { id: 'mountains', name: 'Mountains', count: 12 },
            { id: 'water', name: 'Water', count: 8 },
            { id: 'desert', name: 'Desert', count: 10 },
            { id: 'buildings', name: 'Buildings', count: 25 }
        ],
        tiles: [
            { id: 'forest_1', name: 'Forest Tile 1', category: 'forest' },
            { id: 'forest_2', name: 'Forest Tile 2', category: 'forest' },
            { id: 'mountain_1', name: 'Mountain Tile 1', category: 'mountains' },
            { id: 'water_1', name: 'Water Tile 1', category: 'water' },
            { id: 'building_1', name: 'Building Tile 1', category: 'buildings' }
        ],
        biomes: [
            { id: 'forest', name: 'Forest Biome', tiles: 15 },
            { id: 'mountains', name: 'Mountain Biome', tiles: 12 },
            { id: 'water', name: 'Water Biome', tiles: 8 },
            { id: 'desert', name: 'Desert Biome', tiles: 10 }
        ],
        status: {
            status: 'running',
            connections: 1,
            uptime: Date.now(),
            memory: '128MB'
        }
    };
    
    // Track events
    let trackedEvents = [];
    
    // API endpoints
    const api = {
        // Get categories
        '/api/categories': () => {
            console.log('[TestAPI] Categories requested');
            return mockData.categories;
        },
        
        // Get tiles
        '/api/tiles': () => {
            console.log('[TestAPI] Tiles requested');
            return mockData.tiles;
        },
        
        // Get biomes
        '/api/biomes': () => {
            console.log('[TestAPI] Biomes requested');
            return mockData.biomes;
        },
        
        // Get server status
        '/api/status': () => {
            console.log('[TestAPI] Status requested');
            return mockData.status;
        },
        
        // Track debug events
        '/api/debug/track': (data) => {
            console.log('[TestAPI] Event tracked:', data);
            trackedEvents.push({
                ...data,
                receivedAt: new Date().toISOString()
            });
            return { success: true, eventId: trackedEvents.length };
        },
        
        // Get tracked events
        '/api/debug/events': () => {
            console.log('[TestAPI] Events requested');
            return trackedEvents;
        }
    };
    
    // Mock fetch function
    window.mockFetch = async function(url, options = {}) {
        console.log('[TestAPI] Mock fetch:', url, options);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const endpoint = url.replace(window.location.origin, '');
        
        if (api[endpoint]) {
            try {
                let data = null;
                if (options.method === 'POST' && options.body) {
                    data = JSON.parse(options.body);
                }
                
                const result = api[endpoint](data);
                return {
                    ok: true,
                    json: async () => result,
                    status: 200,
                    statusText: 'OK'
                };
            } catch (error) {
                return {
                    ok: false,
                    json: async () => ({ error: error.message }),
                    status: 500,
                    statusText: 'Internal Server Error'
                };
            }
        } else {
            return {
                ok: false,
                json: async () => ({ error: 'Endpoint not found' }),
                status: 404,
                statusText: 'Not Found'
            };
        }
    };
    
    // Override fetch if in debug modal
    if (window.location.href.includes('debugModal.html')) {
        console.log('[TestAPI] Debug modal detected, overriding fetch');
        window.fetch = window.mockFetch;
    }
    
    // Expose API for testing
    window.testAPI = {
        getData: () => mockData,
        getEvents: () => trackedEvents,
        clearEvents: () => { trackedEvents = []; },
        addEvent: (event) => { trackedEvents.push(event); }
    };
    
    console.log('[TestAPI] Test API loaded');
    
})();
