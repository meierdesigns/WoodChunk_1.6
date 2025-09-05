// Intelligenztrank - Individual Item Configuration
export default {
    id: "potion_intelligence_1",
    name: "Trank der Intelligenz",
    filename: "intelligencePotion.js",
    category: "potions",
    type: "intelligence",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    intelligenceBonus: 5,
    duration: 300, // 5 Minuten
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 100,
    buyPrice: 200,
    
    // Gameplay
    level: 5,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Erhöht die Intelligenz um 5 Punkte für 5 Minuten.",
    
    // Special Properties
    effects: ["intelligence_boost"],
    enchantments: [],
    
    // Visual
    color: "#1c7ed6",
    iconFrame: "uncommon"
};
