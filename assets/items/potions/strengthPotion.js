// Stärketrank - Individual Item Configuration
export default {
    id: "potion_strength_1",
    name: "Trank der Stärke",
    filename: "strengthPotion.js",
    category: "potions",
    type: "strength",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    strengthBonus: 5,
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
    description: "Erhöht die Stärke um 5 Punkte für 5 Minuten.",
    
    // Special Properties
    effects: ["strength_boost"],
    enchantments: [],
    
    // Visual
    color: "#e03131",
    iconFrame: "uncommon"
};
