// Ultimativer Heiltrank - Individual Item Configuration
export default {
    id: "potion_healing_ultimate",
    name: "Ultimativer Heiltrank",
    filename: "ultimateHealingPotion.js",
    category: "potions",
    type: "health",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    healing: 1000,
    duration: 0, // Sofortiger Effekt
    
    // Physical Properties
    weight: 0.5,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 1000,
    buyPrice: 2000,
    
    // Gameplay
    level: 30,
    rarity: "legendary",
    stackSize: 1,
    
    // Description
    description: "Der mächtigste Heiltrank, der sofort 1000 Lebenspunkte wiederherstellt und alle negativen Statuseffekte aufhebt.",
    
    // Special Properties
    effects: ["instant_heal", "remove_debuffs", "regeneration_boost"],
    enchantments: ["sacred_healing"],
    
    // Visual
    color: "#ff0000",
    iconFrame: "legendary"
};
