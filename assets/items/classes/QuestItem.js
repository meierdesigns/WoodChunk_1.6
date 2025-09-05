/**
 * QuestItem Class - Handles quest-specific items and story elements
 */
export class QuestItem {
    constructor(data) {
        // Core properties from JS file
        this.id = data.id;
        this.name = data.name;
        this.filename = data.filename;
        this.category = data.category || 'quest';
        this.type = data.type || 'quest_item';
        
        // Quest properties
        this.questId = data.questId || null;
        this.questName = data.questName || 'Unknown Quest';
        this.questStage = data.questStage || 1;
        this.isKeyItem = data.isKeyItem || true;
        
        // Physical properties (usually very light or no weight)
        this.weight = data.weight || 0;
        
        // Economic (usually cannot be sold)
        this.sellPrice = data.sellPrice || 0;
        this.buyPrice = data.buyPrice || 0;
        this.canSell = data.canSell || false;
        this.canDrop = data.canDrop || false;
        
        // Gameplay
        this.level = data.level || 1;
        this.rarity = data.rarity || 'unique';
        this.stackSize = data.stackSize || 1;
        
        // Description
        this.description = data.description || 'An important quest item.';
        this.lore = data.lore || '';
        
        // Quest specific
        this.usageText = data.usageText || 'Use this item at the right location.';
        this.targetLocation = data.targetLocation || null;
        this.targetNPC = data.targetNPC || null;
        this.activatesEvent = data.activatesEvent || null;
        
        // Special properties
        this.effects = data.effects || [];
        this.triggers = data.triggers || [];
        
        // Visual
        this.color = data.color || '#FFD700'; // Gold color for quest items
        this.iconFrame = data.iconFrame || 'unique';
        this.hasAura = data.hasAura || true;
        
        // State
        this.isActive = false;
        this.isUsed = false;
        this.discoveredAt = null;
        
        // Computed properties
        this.imagePath = `assets/items/${this.category}/${this.filename}`;
    }
    
    // Quest item specific methods
    canUse(player, location = null, npc = null) {
        // Check if player has the associated quest
        if (this.questId && !player.hasQuest(this.questId)) {
            return { canUse: false, reason: 'Quest not active' };
        }
        
        // Check quest stage
        if (this.questId && player.getQuestStage(this.questId) < this.questStage) {
            return { canUse: false, reason: 'Not ready to use this item yet' };
        }
        
        // Check location requirement
        if (this.targetLocation && location !== this.targetLocation) {
            return { canUse: false, reason: `Must be used at ${this.targetLocation}` };
        }
        
        // Check NPC requirement  
        if (this.targetNPC && npc !== this.targetNPC) {
            return { canUse: false, reason: `Must be used with ${this.targetNPC}` };
        }
        
        // Check if already used (for single-use items)
        if (this.isUsed && this.stackSize === 1) {
            return { canUse: false, reason: 'Item already used' };
        }
        
        return { canUse: true };
    }
    
    use(player, context = {}) {
        const canUseResult = this.canUse(player, context.location, context.npc);
        if (!canUseResult.canUse) {
            return { success: false, message: canUseResult.reason };
        }
        
        const results = [];
        
        // Trigger quest progression
        if (this.questId) {
            player.advanceQuest(this.questId, this.questStage + 1);
            results.push(`Quest "${this.questName}" advanced`);
        }
        
        // Activate event
        if (this.activatesEvent) {
            player.triggerEvent(this.activatesEvent);
            results.push(`Event "${this.activatesEvent}" triggered`);
        }
        
        // Apply effects
        this.effects.forEach(effect => {
            this.applyEffect(player, effect);
            results.push(effect.description);
        });
        
        // Process triggers
        this.triggers.forEach(trigger => {
            this.processTrigger(player, trigger, context);
        });
        
        // Mark as used
        this.isUsed = true;
        
        return {
            success: true,
            message: results.join(', '),
            nextAction: this.getNextAction()
        };
    }
    
    applyEffect(player, effect) {
        switch(effect.type) {
            case 'unlock_area':
                player.unlockArea(effect.areaId);
                break;
            case 'learn_spell':
                player.learnSpell(effect.spellId);
                break;
            case 'gain_title':
                player.addTitle(effect.titleId);
                break;
            case 'reputation':
                player.addReputation(effect.faction, effect.amount);
                break;
            case 'transform':
                return this.transformItem(effect.newItemId);
            default:
                console.log(`Unknown quest effect: ${effect.type}`);
        }
    }
    
    processTrigger(player, trigger, context) {
        switch(trigger.type) {
            case 'dialogue':
                if (context.npc === trigger.npcId) {
                    player.startDialogue(trigger.dialogueId);
                }
                break;
            case 'cutscene':
                player.playCutscene(trigger.cutsceneId);
                break;
            case 'teleport':
                player.teleportTo(trigger.location);
                break;
            case 'spawn_enemy':
                player.spawnEnemy(trigger.enemyId, trigger.location);
                break;
            default:
                console.log(`Unknown trigger: ${trigger.type}`);
        }
    }
    
    transformItem(newItemId) {
        // Transform this quest item into another item
        return {
            type: 'transform',
            oldItem: this.id,
            newItem: newItemId,
            message: `${this.name} has transformed!`
        };
    }
    
    getNextAction() {
        if (this.targetLocation) {
            return `Go to ${this.targetLocation}`;
        }
        if (this.targetNPC) {
            return `Speak with ${this.targetNPC}`;
        }
        return 'Continue your quest';
    }
    
    isRelevantToQuest(questId) {
        return this.questId === questId;
    }
    
    getQuestHint() {
        if (!this.isActive) return null;
        
        let hint = this.usageText;
        if (this.targetLocation) {
            hint += ` Location: ${this.targetLocation}`;
        }
        if (this.targetNPC) {
            hint += ` NPC: ${this.targetNPC}`;
        }
        return hint;
    }
    
    getTooltipText() {
        let tooltip = `${this.name}\n`;
        tooltip += `Quest: ${this.questName}\n`;
        tooltip += `Type: Quest Item\n`;
        tooltip += `Rarity: ${this.rarity}\n`;
        
        if (this.isKeyItem) tooltip += `Key Item - Cannot be discarded\n`;
        if (!this.canSell) tooltip += `Cannot be sold\n`;
        
        tooltip += `\n${this.description}`;
        
        if (this.lore) {
            tooltip += `\n\n"${this.lore}"`;
        }
        
        if (this.usageText && this.isActive) {
            tooltip += `\n\nHint: ${this.usageText}`;
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
            questId: this.questId,
            questName: this.questName,
            questStage: this.questStage,
            isKeyItem: this.isKeyItem,
            weight: this.weight,
            sellPrice: this.sellPrice,
            buyPrice: this.buyPrice,
            canSell: this.canSell,
            canDrop: this.canDrop,
            level: this.level,
            rarity: this.rarity,
            stackSize: this.stackSize,
            description: this.description,
            lore: this.lore,
            usageText: this.usageText,
            targetLocation: this.targetLocation,
            targetNPC: this.targetNPC,
            activatesEvent: this.activatesEvent,
            effects: this.effects,
            triggers: this.triggers,
            color: this.color,
            iconFrame: this.iconFrame,
            hasAura: this.hasAura,
            isActive: this.isActive,
            isUsed: this.isUsed,
            discoveredAt: this.discoveredAt
        };
    }
}