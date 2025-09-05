// Steel Sword - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "sword_steel",
    name: "Steel Sword",
    filename: "sword_steel.png",
    category: "weapons",
    type: "sword", 
    material: "steel",
    
    // Combat Stats - Edit these!
    damage: 45,
    criticalChance: 0.25,
    criticalMultiplier: 2.2,
    
    // Physical Properties - Edit these!
    weight: 2.8,
    durability: 150,
    maxDurability: 150,
    
    // Economic - Edit these!
    sellPrice: 180,
    buyPrice: 360,
    
    // Gameplay - Edit these!
    level: 10,
    rarity: "rare",
    stackSize: 1,
    
    // Description - Edit this!
    description: "A superior steel sword with excellent balance and sharpness. Forged by master smiths.",
    
    // Special Properties - Add/edit these!
    effects: [
        {
            type: "sharpness",
            value: 1,
            description: "Enhanced cutting ability"
        }
    ],
    enchantments: [],
    
    // Visual - Edit these!
    color: "#C0C0C0",
    iconFrame: "rare"
};