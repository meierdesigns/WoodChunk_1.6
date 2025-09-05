// Wooden Bow - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "bow_wood",
    name: "Wooden Bow", 
    filename: "bow_wood.png",
    category: "weapons",
    type: "bow",
    material: "wood",
    
    // Combat Stats - Edit these!
    damage: 18,
    criticalChance: 0.25,
    criticalMultiplier: 1.8,
    range: 50,
    
    // Physical Properties - Edit these!
    weight: 1.8,
    durability: 80,
    maxDurability: 80,
    
    // Economic - Edit these!
    sellPrice: 45,
    buyPrice: 90,
    
    // Gameplay - Edit these!
    level: 2,
    rarity: "common",
    stackSize: 1,
    
    // Description - Edit this!
    description: "A simple wooden bow crafted from flexible yew wood. Light and easy to use for novice archers.",
    
    // Special Properties - Add/edit these!
    effects: [],
    enchantments: [],
    ammunition: "arrow",
    
    // Visual - Edit these!
    color: "#8B4513",
    iconFrame: "common"
};