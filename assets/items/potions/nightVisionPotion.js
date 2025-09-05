// Nachtsichttrank - Individual Item Configuration
export default {
    id: "potion_night_vision_1",
    name: "Trank der Nachtsicht",
    filename: "nightVisionPotion.js",
    category: "potions",
    type: "utility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 600, // 10 Minuten
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 150,
    buyPrice: 300,
    
    // Gameplay
    level: 8,
    rarity: "uncommon",
    stackSize: 3,
    
    // Description
    description: "Ermöglicht es dem Anwender für 10 Minuten im Dunkeln zu sehen.",
    
    // Special Properties
    effects: ["night_vision"],
    enchantments: [],
    
    // Visual
    color: "#ffd43b",
    iconFrame: "uncommon"
};
