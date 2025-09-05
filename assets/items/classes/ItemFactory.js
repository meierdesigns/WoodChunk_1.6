/**
 * ItemFactory - Creates appropriate item class instances from JS file data
 */
import { WeaponItem } from './WeaponItem.js';
import { ArmorItem } from './ArmorItem.js';
import { PotionItem } from './PotionItem.js';
import { MaterialItem } from './MaterialItem.js';
import { QuestItem } from './QuestItem.js';

export class ItemFactory {
    static createItem(data) {
        if (!data || !data.category) {
            console.error('[ItemFactory] Invalid item data:', data);
            return null;
        }
        
        try {
            switch (data.category.toLowerCase()) {
                case 'weapons':
                    return new WeaponItem(data);
                    
                case 'armor':
                    return new ArmorItem(data);
                    
                case 'potions':
                    return new PotionItem(data);
                    
                case 'materials':
                    return new MaterialItem(data);
                    
                case 'quest':
                    return new QuestItem(data);
                    
                default:
                    console.warn(`[ItemFactory] Unknown category: ${data.category}, creating generic item`);
                    return new GenericItem(data);
            }
        } catch (error) {
            console.error('[ItemFactory] Error creating item:', error);
            return null;
        }
    }
    
    static async loadItemFromFile(category, filename) {
        try {
            console.log(`[ItemFactory] Loading item FRESH: ${category}/${filename}`);
            
            // Cache busting to ensure fresh load of JS files
            const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`;
            const module = await import(`../${category}/${filename}${cacheBuster}`);
            const itemData = module.default;
            
            if (!itemData) {
                console.error(`[ItemFactory] No default export in ${filename}`);
                return null;
            }
            
            console.log(`[ItemFactory] Loaded fresh data for ${filename}:`, itemData);
            return this.createItem(itemData);
            
        } catch (error) {
            console.error(`[ItemFactory] Error loading item file ${filename}:`, error);
            return null;
        }
    }
    
    static async loadCategoryItems(category) {
        try {
            console.log(`[ItemFactory] Loading all items for category: ${category}`);
            
            // Get list of JS files from server
            const response = await fetch(`http://localhost:3000/api/scan-items?category=${category}`);
            let itemFiles = [];
            
            if (response.ok) {
                itemFiles = await response.json();
            } else {
                console.warn(`[ItemFactory] Could not get file list for ${category}, using fallback`);
                return [];
            }
            
            const items = [];
            
            for (const filename of itemFiles) {
                const item = await this.loadItemFromFile(category, filename);
                if (item) {
                    items.push(item);
                }
            }
            
            console.log(`[ItemFactory] Loaded ${items.length} items for category: ${category}`);
            return items;
            
        } catch (error) {
            console.error(`[ItemFactory] Error loading category ${category}:`, error);
            return [];
        }
    }
    
    static getAllItemCategories() {
        return ['weapons', 'armor', 'potions', 'materials', 'quest'];
    }
    
    static async loadAllItems() {
        console.log('[ItemFactory] Loading all items from all categories...');
        
        const allItems = {
            weapons: [],
            armor: [],
            potions: [],
            materials: [],
            quest: []
        };
        
        for (const category of this.getAllItemCategories()) {
            allItems[category] = await this.loadCategoryItems(category);
        }
        
        const totalItems = Object.values(allItems).reduce((sum, items) => sum + items.length, 0);
        console.log(`[ItemFactory] Loaded total of ${totalItems} items across all categories`);
        
        return allItems;
    }
    
    static getItemStats(item) {
        const stats = {
            category: item.category,
            type: item.type,
            rarity: item.rarity,
            level: item.level,
            weight: item.weight,
            sellPrice: item.sellPrice
        };
        
        // Add category-specific stats
        switch (item.category) {
            case 'weapons':
                stats.damage = item.damage;
                stats.criticalChance = item.criticalChance;
                stats.material = item.material;
                break;
                
            case 'armor':
                stats.defense = item.defense;
                stats.armorClass = item.armorClass;
                stats.slot = item.slot;
                break;
                
            case 'potions':
                stats.effect = item.effect;
                stats.duration = item.duration;
                stats.stackSize = item.stackSize;
                break;
                
            case 'materials':
                stats.materialType = item.materialType;
                stats.grade = item.grade;
                stats.craftingValue = item.getCraftingValue();
                break;
                
            case 'quest':
                stats.questName = item.questName;
                stats.isKeyItem = item.isKeyItem;
                break;
        }
        
        return stats;
    }
    
    static compareItems(item1, item2, sortBy = 'name') {
        switch (sortBy) {
            case 'name':
                return item1.name.localeCompare(item2.name);
            case 'level':
                return item1.level - item2.level;
            case 'rarity':
                const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'];
                return rarityOrder.indexOf(item1.rarity) - rarityOrder.indexOf(item2.rarity);
            case 'value':
                return item1.sellPrice - item2.sellPrice;
            case 'weight':
                return item1.weight - item2.weight;
            default:
                return 0;
        }
    }
}

// Generic item class for unknown categories
class GenericItem {
    constructor(data) {
        Object.assign(this, data);
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    getTooltipText() {
        return `${this.name}\nCategory: ${this.category}\nLevel: ${this.level || 1}\n\n${this.description || 'No description available.'}`;
    }
    
    toJSON() {
        return { ...this };
    }
}