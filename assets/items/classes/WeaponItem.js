/**
 * WeaponItem Class - Handles weapon-specific logic and data
 */
export class WeaponItem {
    constructor(data) {
        // Core properties from JS file
        this.id = data.id;
        this.name = data.name;
        this.filename = data.filename;
        this.category = data.category || 'weapons';
        this.type = data.type;
        this.material = data.material;
        
        // Combat stats
        this.damage = data.damage || 10;
        this.criticalChance = data.criticalChance || 0.05;
        this.criticalMultiplier = data.criticalMultiplier || 2.0;
        this.range = data.range || 1; // for bows
        this.attackSpeed = data.attackSpeed || 1.0;
        
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
        this.description = data.description || 'A weapon.';
        
        // Special properties
        this.effects = data.effects || [];
        this.enchantments = data.enchantments || [];
        this.ammunition = data.ammunition; // for bows
        
        // Visual
        this.color = data.color || '#FFFFFF';
        this.iconFrame = data.iconFrame || 'common';
        this.glowEffect = data.glowEffect || false;
        
        // Computed properties
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    // Weapon-specific methods
    calculateDamage(baseDamage = null) {
        const damage = baseDamage || this.damage;
        
        // Apply material multiplier
        const materialMultipliers = {
            'wood': 0.8,
            'iron': 1.0,
            'steel': 1.3,
            'mythril': 1.8,
            'dragon': 2.5
        };
        
        const multiplier = materialMultipliers[this.material] || 1.0;
        return Math.round(damage * multiplier);
    }
    
    calculateCriticalDamage() {
        return Math.round(this.damage * this.criticalMultiplier);
    }
    
    isCriticalHit() {
        return Math.random() < this.criticalChance;
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
    
    getTooltipText() {
        let tooltip = `${this.name}\n`;
        tooltip += `Type: ${this.type}\n`;
        tooltip += `Damage: ${this.damage}\n`;
        tooltip += `Critical: ${(this.criticalChance * 100).toFixed(1)}%\n`;
        tooltip += `Weight: ${this.weight}kg\n`;
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
            damage: this.damage,
            criticalChance: this.criticalChance,
            criticalMultiplier: this.criticalMultiplier,
            range: this.range,
            attackSpeed: this.attackSpeed,
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
            ammunition: this.ammunition,
            color: this.color,
            iconFrame: this.iconFrame,
            glowEffect: this.glowEffect
        };
    }
}