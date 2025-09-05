// Frostresistenztrank - Individual Item Configuration
export default {
    id: "potion_frost_resistance_1",
    name: "Trank der Frostresistenz",
    filename: "frostResistancePotion.js",
    category: "potions",
    type: "resistance",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 300, // 5 Minuten
    resistanceValue: 75, // 75% Frostresistenz
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 200,
    buyPrice: 400,
    
    // Gameplay
    level: 12,
    rarity: "rare",
    stackSize: 3,
    
    // Description
    description: "Gewährt 75% Resistenz gegen Frostschaden für 5 Minuten.",
    
    // Special Properties
    effects: ["frost_resistance"],
    enchantments: [],
    
    // Visual
    color: "#74c0fc",
    iconFrame: "rare"
};
