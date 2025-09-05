/**
 * ArmorItem Class - Handles armor-specific logic and data
 */
export class ArmorItem {
    constructor(data) {
        // Core properties from JS file
        this.id = data.id;
        this.name = data.name;
        this.filename = data.filename;
        this.category = data.category || 'armor';
        this.type = data.type;
        this.material = data.material;
        
        // Defense stats
        this.defense = data.defense || 5;
        this.magicResistance = data.magicResistance || 0;
        this.fireResistance = data.fireResistance || 0;
        this.iceResistance = data.iceResistance || 0;
        this.lightningResistance = data.lightningResistance || 0;
        this.poisonResistance = data.poisonResistance || 0;
        
        // Physical properties
        this.weight = data.weight || 1.0;
        this.durability = data.durability || 100;
        this.maxDurability = data.maxDurability || 100;
        
        // Economic
        this.sellPrice = data.sellPrice || 10;
        this.buyPrice = data.buyPrice || (this.sellPrice * 2);
        
        // Gameplay
        this.level = data.level || 1;
        this.rarity = data.rarity || 'common';
        this.stackSize = data.stackSize || 1;
        
        // Description
        this.description = data.description || 'A piece of armor.';
        
        // Special properties
        this.effects = data.effects || [];
        this.enchantments = data.enchantments || [];
        
        // Armor specific
        this.slot = data.slot || this.type; // helmet, chest, legs, boots, shield
        this.armorClass = data.armorClass || 'medium'; // light, medium, heavy
        
        // Visual
        this.color = data.color || '#FFFFFF';
        this.iconFrame = data.iconFrame || 'common';
        
        // Computed properties
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    // Armor-specific methods
    calculateDefense(baseDamage) {
        let totalDefense = this.defense;
        
        // Apply material multiplier
        const materialMultipliers = {
            'cloth': 0.5,
            'leather': 0.8,
            'iron': 1.0,
            'steel': 1.4,
            'mythril': 1.8,
            'dragon': 2.5
        };
        
        const multiplier = materialMultipliers[this.material] || 1.0;
        totalDefense *= multiplier;
        
        // Calculate damage reduction
        const damageReduction = Math.min(baseDamage * 0.8, totalDefense);
        return Math.max(1, baseDamage - damageReduction); // Always take at least 1 damage
    }
    
    getResistance(damageType) {
        switch(damageType.toLowerCase()) {
            case 'magic': return this.magicResistance;
            case 'fire': return this.fireResistance;
            case 'ice': return this.iceResistance;
            case 'lightning': return this.lightningResistance;
            case 'poison': return this.poisonResistance;
            default: return 0;
        }
    }
    
    calculateElementalDefense(damage, damageType) {
        const resistance = this.getResistance(damageType);
        const reduction = (resistance / 100) * damage;
        return Math.max(1, damage - reduction);
    }
    
    canEquip(playerLevel) {
        return playerLevel >= this.level;
    }
    
    getDurabilityPercentage() {
        return (this.durability / this.maxDurability) * 100;
    }
    
    isDamaged() {
        return this.durability < this.maxDurability;
    }
    
    isBroken() {
        return this.durability <= 0;
    }
    
    repair(amount = null) {
        if (amount === null) {
            this.durability = this.maxDurability; // Full repair
        } else {
            this.durability = Math.min(this.maxDurability, this.durability + amount);
        }
    }
    
    takeDamage(amount = 1) {
        this.durability = Math.max(0, this.durability - amount);
    }
    
    getArmorClassBonus() {
        const bonuses = {
            'light': { mobility: 0.2, stealth: 0.15 },
            'medium': { mobility: 0.1, balance: 0.1 },
            'heavy': { defense: 0.25, stability: 0.2 }
        };
        return bonuses[this.armorClass] || {};
    }
    
    getTooltipText() {
        let tooltip = `${this.name}\n`;
        tooltip += `Type: ${this.type}\n`;
        tooltip += `Defense: ${this.defense}\n`;
        tooltip += `Slot: ${this.slot}\n`;
        tooltip += `Class: ${this.armorClass}\n`;
        
        // Show resistances if any
        const resistances = [];
        if (this.magicResistance > 0) resistances.push(`Magic: ${this.magicResistance}%`);
        if (this.fireResistance > 0) resistances.push(`Fire: ${this.fireResistance}%`);
        if (this.iceResistance > 0) resistances.push(`Ice: ${this.iceResistance}%`);
        if (this.lightningResistance > 0) resistances.push(`Lightning: ${this.lightningResistance}%`);
        if (this.poisonResistance > 0) resistances.push(`Poison: ${this.poisonResistance}%`);
        
        if (resistances.length > 0) {
            tooltip += `\nResistances: ${resistances.join(', ')}`;
        }
        
        tooltip += `\nWeight: ${this.weight}kg\n`;
        tooltip += `Level: ${this.level}\n`;
        tooltip += `Rarity: ${this.rarity}\n`;
        tooltip += `\n${this.description}`;
        
        if (this.effects.length > 0) {
            tooltip += '\n\nSpecial Effects:';
            this.effects.forEach(effect => {
                tooltip += `\n• ${effect.description}`;
            });
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
            material: this.material,
            defense: this.defense,
            magicResistance: this.magicResistance,
            fireResistance: this.fireResistance,
            iceResistance: this.iceResistance,
            lightningResistance: this.lightningResistance,
            poisonResistance: this.poisonResistance,
            weight: this.weight,
            durability: this.durability,
            maxDurability: this.maxDurability,
            sellPrice: this.sellPrice,
            buyPrice: this.buyPrice,
            level: this.level,
            rarity: this.rarity,
            stackSize: this.stackSize,
            description: this.description,
            effects: this.effects,
            enchantments: this.enchantments,
            slot: this.slot,
            armorClass: this.armorClass,
            color: this.color,
            iconFrame: this.iconFrame
        };
    }
}