/**
 * Central Color Configuration for WoodChunk 1.5
 * This file defines all colors used throughout the game
 * Colors can be modified here to change the game's visual appearance
 */

const COLOR_CONFIG = {
    // Biome Colors
    biomes: {
        forest: '#4CAF50',
        mountains: '#795548',
        water: '#2196F3',
        desert: '#FF9800',
        swamp: '#8BC34A',
        plain: '#CDDC39',
        jungle: '#388E3C',
        badlands: '#8D6E63',
        snow: '#FFFFFF',
        ocean: '#1976D2',
        coast: '#03DAC6',
        unassigned: '#9E9E9E'
    },

    // Terrain Colors
    terrain: {
        grass: '#4CAF50',
        stone: '#795548',
        sand: '#FFC107',
        mud: '#8D6E63',
        ice: '#E3F2FD',
        lava: '#F44336',
        crystal: '#E1BEE7',
        metal: '#9E9E9E'
    },

    // UI Colors
    ui: {
        primary: '#2196F3',
        secondary: '#FF9800',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#00BCD4',
        light: '#FAFAFA',
        dark: '#212121',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#212121',
        textSecondary: '#757575'
    },

    // Character Status Colors
    status: {
        health: '#F44336',
        mana: '#2196F3',
        stamina: '#FF9800',
        experience: '#4CAF50',
        level: '#9C27B0'
    },

    // Item Rarity Colors
    rarity: {
        common: '#9E9E9E',
        uncommon: '#4CAF50',
        rare: '#2196F3',
        epic: '#9C27B0',
        legendary: '#FF9800',
        mythical: '#F44336'
    },

    // Combat Colors
    combat: {
        damage: '#F44336',
        healing: '#4CAF50',
        buff: '#2196F3',
        debuff: '#FF9800',
        critical: '#E91E63',
        miss: '#9E9E9E'
    },

    // Weather/Time Colors
    weather: {
        day: '#FFEB3B',
        night: '#3F51B5',
        rain: '#607D8B',
        storm: '#424242',
        fog: '#E0E0E0',
        clear: '#87CEEB'
    },

    // Resource Colors
    resources: {
        wood: '#8D6E63',
        stone: '#795548',
        iron: '#9E9E9E',
        gold: '#FFD700',
        silver: '#C0C0C0',
        copper: '#CD7F32',
        crystal: '#E1BEE7',
        gem: '#E91E63'
    }
};

/**
 * Get color by category and name
 * @param {string} category - Color category (biomes, terrain, ui, etc.)
 * @param {string} name - Color name within the category
 * @returns {string} Hex color value
 */
function getColor(category, name) {
    if (COLOR_CONFIG[category] && COLOR_CONFIG[category][name]) {
        return COLOR_CONFIG[category][name];
    }
    console.warn(`[Colors] Color not found: ${category}.${name}`);
    return '#9E9E9E'; // Default fallback color
}

/**
 * Set color by category and name
 * @param {string} category - Color category
 * @param {string} name - Color name within the category
 * @param {string} color - New hex color value
 */
function setColor(category, name, color) {
    if (COLOR_CONFIG[category] && COLOR_CONFIG[category][name]) {
        COLOR_CONFIG[category][name] = color;
        console.log(`[Colors] Updated ${category}.${name} to ${color}`);
        
        // Trigger color change event for UI updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('colorChanged', {
                detail: { category, name, color }
            }));
        }
    } else {
        console.error(`[Colors] Cannot set color: ${category}.${name} not found`);
    }
}

/**
 * Get all colors from a category
 * @param {string} category - Color category
 * @returns {Object} All colors in the category
 */
function getCategoryColors(category) {
    return COLOR_CONFIG[category] || {};
}

/**
 * Get all color categories
 * @returns {Array} Array of category names
 */
function getColorCategories() {
    return Object.keys(COLOR_CONFIG);
}

/**
 * Export current color configuration
 * @returns {Object} Complete color configuration
 */
function exportColors() {
    return JSON.parse(JSON.stringify(COLOR_CONFIG));
}

/**
 * Import color configuration
 * @param {Object} colors - Color configuration to import
 */
function importColors(colors) {
    if (typeof colors === 'object' && colors !== null) {
        Object.assign(COLOR_CONFIG, colors);
        console.log('[Colors] Imported color configuration');
        
        // Trigger refresh event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('colorsImported'));
        }
    }
}

/**
 * Reset colors to default values
 */
function resetToDefaults() {
    // Default color values (you can modify these)
    const defaultColors = {
        biomes: {
            forest: '#4CAF50',
            mountains: '#795548',
            water: '#2196F3',
            desert: '#FF9800',
            swamp: '#8BC34A',
            plain: '#CDDC39',
            jungle: '#388E3C',
            badlands: '#8D6E63',
            snow: '#FFFFFF',
            ocean: '#1976D2',
            coast: '#03DAC6',
            unassigned: '#9E9E9E'
        },
        terrain: {
            grass: '#4CAF50',
            stone: '#795548',
            sand: '#FFC107',
            mud: '#8D6E63',
            ice: '#E3F2FD',
            lava: '#F44336',
            crystal: '#E1BEE7',
            metal: '#9E9E9E'
        },
        ui: {
            primary: '#2196F3',
            secondary: '#FF9800',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#F44336',
            info: '#00BCD4',
            light: '#FAFAFA',
            dark: '#212121',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#212121',
            textSecondary: '#757575'
        }
    };
    
    Object.assign(COLOR_CONFIG, defaultColors);
    console.log('[Colors] Reset to default colors');
    
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('colorsReset'));
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COLOR_CONFIG,
        getColor,
        setColor,
        getCategoryColors,
        getColorCategories,
        exportColors,
        importColors,
        resetToDefaults
    };
} else {
    // Browser environment
    window.COLOR_CONFIG = COLOR_CONFIG;
    window.getColor = getColor;
    window.setColor = setColor;
    window.getCategoryColors = getCategoryColors;
    window.getColorCategories = getColorCategories;
    window.exportColors = exportColors;
    window.importColors = importColors;
    window.resetToDefaults = resetToDefaults;
}
