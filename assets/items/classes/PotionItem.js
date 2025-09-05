/**
 * PotionItem Class - Handles potion-specific logic and data
 */
export class PotionItem {
    constructor(data) {
        // Core properties from JS file
        this.id = data.id;
        this.name = data.name;
        this.filename = data.filename;
        this.category = data.category || 'potions';
        this.type = data.type || 'consumable';
        
        // Potion effects
        this.effect = data.effect || 'Unknown Effect';
        this.healAmount = data.healAmount || 0;
        this.manaAmount = data.manaAmount || 0;
        this.duration = data.duration || 'Instant';
        this.potency = data.potency || 1.0;
        
        // Physical properties
        this.weight = data.weight || 0.5;
        
        // Economic
        this.sellPrice = data.sellPrice || 5;
        this.buyPrice = data.buyPrice || (this.sellPrice * 2);
        
        // Gameplay
        this.level = data.level || 1;
        this.rarity = data.rarity || 'common';
        this.stackSize = data.stackSize || 10;
        
        // Description
        this.description = data.description || 'A magical potion.';
        
        // Potion specific
        this.consumeTime = data.consumeTime || 2.0; // seconds
        this.cooldown = data.cooldown || 0; // seconds
        
        // Special properties
        this.effects = data.effects || [];
        this.ingredients = data.ingredients || [];
        
        // Visual
        this.color = data.color || '#FFFFFF';
        this.iconFrame = data.iconFrame || 'common';
        this.liquidColor = data.liquidColor || this.color;
        
        // State
        this.currentStack = 1;
        this.lastUsed = 0;
        
        // Computed properties
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    // Potion-specific methods
    canUse(player) {
        // Check level requirement
        if (player.level < this.level) {
            return { canUse: false, reason: `Requires level ${this.level}` };
        }
        
        // Check cooldown
        const now = Date.now();
        if (now - this.lastUsed < this.cooldown * 1000) {
            const remaining = Math.ceil((this.cooldown * 1000 - (now - this.lastUsed)) / 1000);
            return { canUse: false, reason: `Cooldown: ${remaining}s` };
        }
        
        // Check if effect is needed
        if (this.healAmount > 0 && player.health >= player.maxHealth) {
            return { canUse: false, reason: 'Health already full' };
        }
        
        if (this.manaAmount > 0 && player.mana >= player.maxMana) {
            return { canUse: false, reason: 'Mana already full' };
        }
        
        return { canUse: true };
    }
    
    use(player) {
        const canUseResult = this.canUse(player);
        if (!canUseResult.canUse) {
            return { success: false, message: canUseResult.reason };
        }
        
        const results = [];
        
        // Apply healing
        if (this.healAmount > 0) {
            const actualHeal = Math.min(this.healAmount * this.potency, player.maxHealth - player.health);
            player.health += actualHeal;
            results.push(`Restored ${actualHeal} HP`);
        }
        
        // Apply mana restoration
        if (this.manaAmount > 0) {
            const actualMana = Math.min(this.manaAmount * this.potency, player.maxMana - player.mana);
            player.mana += actualMana;
            results.push(`Restored ${actualMana} MP`);
        }
        
        // Apply special effects
        this.effects.forEach(effect => {
            this.applyEffect(player, effect);
            results.push(effect.description);
        });
        
        // Update usage time
        this.lastUsed = Date.now();
        
        // Reduce stack
        this.currentStack = Math.max(0, this.currentStack - 1);
        
        return {
            success: true,
            message: results.join(', '),
            effects: this.effects
        };
    }
    
    applyEffect(player, effect) {
        switch(effect.type) {
            case 'heal':
                player.health = Math.min(player.maxHealth, player.health + effect.value);
                break;
            case 'mana':
                player.mana = Math.min(player.maxMana, player.mana + effect.value);
                break;
            case 'buff':
                player.addBuff(effect.buffType, effect.value, effect.duration);
                break;
            case 'cure':
                player.removeDebuff(effect.debuffType);
                break;
            default:
                console.log(`Unknown effect type: ${effect.type}`);
        }
    }
    
    getCraftingCost() {
        const baseCost = this.ingredients.length * 10;
        const rarityMultiplier = {
            'common': 1.0,
            'uncommon': 1.5,
            'rare': 2.0,
            'epic': 3.0,
            'legendary': 5.0
        };
        return Math.round(baseCost * (rarityMultiplier[this.rarity] || 1.0));
    }
    
    canCraft(playerIngredients) {
        return this.ingredients.every(ingredient => {
            return playerIngredients[ingredient] >= 1;
        });
    }
    
    getEffectDuration() {
        if (this.duration === 'Instant') return 0;
        
        // Parse duration string (e.g., "5 minutes", "30 seconds")
        const match = this.duration.match(/(\d+)\s*(second|minute|hour)s?/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            switch(unit) {
                case 'second': return value;
                case 'minute': return value * 60;
                case 'hour': return value * 3600;
                default: return 0;
            }
        }
        
        return 0;
    }
    
    isEmpty() {
        return this.currentStack <= 0;
    }
    
    getTooltipText() {
        let tooltip = `${this.name}\n`;
        tooltip += `Effect: ${this.effect}\n`;
        tooltip += `Duration: ${this.duration}\n`;
        
        if (this.healAmount > 0) tooltip += `Healing: ${this.healAmount} HP\n`;
        if (this.manaAmount > 0) tooltip += `Mana: ${this.manaAmount} MP\n`;
        
        tooltip += `Level: ${this.level}\n`;
        tooltip += `Rarity: ${this.rarity}\n`;
        tooltip += `Stack: ${this.currentStack}/${this.stackSize}\n`;
        
        if (this.cooldown > 0) tooltip += `Cooldown: ${this.cooldown}s\n`;
        
        tooltip += `\n${this.description}`;
        
        if (this.ingredients.length > 0) {
            tooltip += '\n\nIngredients:';
            this.ingredients.forEach(ingredient => {
                tooltip += `\n• ${ingredient}`;
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
            effect: this.effect,
            healAmount: this.healAmount,
            manaAmount: this.manaAmount,
            duration: this.duration,
            potency: this.potency,
            weight: this.weight,
            sellPrice: this.sellPrice,
            buyPrice: this.buyPrice,
            level: this.level,
            rarity: this.rarity,
            stackSize: this.stackSize,
            description: this.description,
            consumeTime: this.consumeTime,
            cooldown: this.cooldown,
            effects: this.effects,
            ingredients: this.ingredients,
            color: this.color,
            iconFrame: this.iconFrame,
            liquidColor: this.liquidColor,
            currentStack: this.currentStack
        };
    }
}