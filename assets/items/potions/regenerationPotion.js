// Regenerationstrank - Individual Item Configuration
export default {
    id: "potion_regeneration_1",
    name: "Trank der Regeneration",
    filename: "regenerationPotion.js",
    category: "potions",
    type: "health",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    healing: 10,
    duration: 30, // 30 Sekunden
    tickRate: 1, // Heilung pro Sekunde
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 125,
    buyPrice: 250,
    
    // Gameplay
    level: 8,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Stellt über 30 Sekunden insgesamt 300 Lebenspunkte wieder her.",
    
    // Special Properties
    effects: ["regeneration"],
    enchantments: [],
    
    // Visual
    color: "#ffa8a8",
    iconFrame: "uncommon"
};
