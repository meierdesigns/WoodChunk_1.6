/**
 * MaterialItem Class - Handles material/crafting component logic and data
 */
export class MaterialItem {
    constructor(data) {
        // Core properties from JS file
        this.id = data.id;
        this.name = data.name;
        this.filename = data.filename;
        this.category = data.category || 'materials';
        this.type = data.type || 'material';
        
        // Material properties
        this.materialType = data.materialType || 'common'; // ore, herb, gem, essence, etc.
        this.grade = data.grade || 'basic'; // basic, fine, superior, masterwork
        this.purity = data.purity || 100; // percentage
        
        // Physical properties
        this.weight = data.weight || 0.1;
        
        // Economic
        this.sellPrice = data.sellPrice || 1;
        this.buyPrice = data.buyPrice || (this.sellPrice * 2);
        
        // Gameplay
        this.level = data.level || 1;
        this.rarity = data.rarity || 'common';
        this.stackSize = data.stackSize || 50;
        
        // Description
        this.description = data.description || 'A crafting material.';
        
        // Crafting properties
        this.usedIn = data.usedIn || []; // Array of item types this can craft
        this.craftingValue = data.craftingValue || 1;
        this.processingTime = data.processingTime || 5; // seconds
        
        // Special properties
        this.effects = data.effects || [];
        this.enchantmentPower = data.enchantmentPower || 0;
        
        // Visual
        this.color = data.color || '#FFFFFF';
        this.iconFrame = data.iconFrame || 'common';
        
        // State
        this.currentStack = 1;
        
        // Computed properties
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    // Material-specific methods
    getProcessingResult(processType) {
        const results = {
            'smelt': this.getSmeltingResult(),
            'refine': this.getRefiningResult(),
            'enchant': this.getEnchantingResult()
        };
        
        return results[processType] || null;
    }
    
    getSmeltingResult() {
        if (this.materialType === 'ore') {
            return {
                id: this.id.replace('_ore', '_ingot'),
                name: this.name.replace('Ore', 'Ingot'),
                type: 'ingot',
                value: this.craftingValue * 2
            };
        }
        return null;
    }
    
    getRefiningResult() {
        const gradeUpgrades = {
            'basic': 'fine',
            'fine': 'superior',
            'superior': 'masterwork'
        };
        
        const nextGrade = gradeUpgrades[this.grade];
        if (nextGrade) {
            return {
                id: this.id.replace(this.grade, nextGrade),
                name: this.name.replace(this.grade, nextGrade),
                grade: nextGrade,
                value: this.craftingValue * 1.5
            };
        }
        return null;
    }
    
    getEnchantingResult() {
        if (this.enchantmentPower > 0) {
            return {
                type: 'enchantment_essence',
                power: this.enchantmentPower,
                element: this.getElementalType()
            };
        }
        return null;
    }
    
    getElementalType() {
        const name = this.name.toLowerCase();
        if (name.includes('fire') || name.includes('flame')) return 'fire';
        if (name.includes('ice') || name.includes('frost')) return 'ice';
        if (name.includes('lightning') || name.includes('storm')) return 'lightning';
        if (name.includes('earth') || name.includes('stone')) return 'earth';
        if (name.includes('wind') || name.includes('air')) return 'wind';
        if (name.includes('water') || name.includes('sea')) return 'water';
        return 'neutral';
    }
    
    getCraftingValue() {
        const gradeMultipliers = {
            'basic': 1.0,
            'fine': 1.5,
            'superior': 2.0,
            'masterwork': 3.0
        };
        
        const purityMultiplier = this.purity / 100;
        const gradeMultiplier = gradeMultipliers[this.grade] || 1.0;
        
        return Math.round(this.craftingValue * gradeMultiplier * purityMultiplier);
    }
    
    canCombineWith(otherMaterial) {
        return this.id === otherMaterial.id && 
               this.grade === otherMaterial.grade &&
               this.purity === otherMaterial.purity;
    }
    
    combineStacks(otherMaterial) {
        if (!this.canCombineWith(otherMaterial)) return false;
        
        const totalStack = this.currentStack + otherMaterial.currentStack;
        this.currentStack = Math.min(this.stackSize, totalStack);
        
        return totalStack > this.stackSize ? totalStack - this.stackSize : 0;
    }
    
    getTooltipText() {
        let tooltip = `${this.name}\n`;
        tooltip += `Type: ${this.materialType}\n`;
        tooltip += `Grade: ${this.grade}\n`;
        tooltip += `Purity: ${this.purity}%\n`;
        tooltip += `Crafting Value: ${this.getCraftingValue()}\n`;
        tooltip += `Level: ${this.level}\n`;
        tooltip += `Rarity: ${this.rarity}\n`;
        tooltip += `Stack: ${this.currentStack}/${this.stackSize}\n`;
        tooltip += `\n${this.description}`;
        
        if (this.usedIn.length > 0) {
            tooltip += '\n\nUsed in crafting:';
            this.usedIn.forEach(itemType => {
                tooltip += `\n• ${itemType}`;
            });
        }
        
        if (this.enchantmentPower > 0) {
            tooltip += `\n\nEnchantment Power: ${this.enchantmentPower}`;
            tooltip += `\nElement: ${this.getElementalType()}`;
        }
        
        return tooltip;
    }
    
    // Export for saving
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            filename: this.filename,
            category: this.category,
            type: this.type,
            materialType: this.materialType,
            grade: this.grade,
            purity: this.purity,
            weight: this.weight,
            sellPrice: this.sellPrice,
            buyPrice: this.buyPrice,
            level: this.level,
            rarity: this.rarity,
            stackSize: this.stackSize,
            description: this.description,
            usedIn: this.usedIn,
            craftingValue: this.craftingValue,
            processingTime: this.processingTime,
            effects: this.effects,
            enchantmentPower: this.enchantmentPower,
            color: this.color,
            iconFrame: this.iconFrame,
            currentStack: this.currentStack
        };
    }
}