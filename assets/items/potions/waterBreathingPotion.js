// Wasseratmungstrank - Individual Item Configuration
export default {
    id: "potion_water_breathing_1",
    name: "Trank der Wasseratmung",
    filename: "waterBreathingPotion.js",
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
    sellPrice: 200,
    buyPrice: 400,
    
    // Gameplay
    level: 10,
    rarity: "rare",
    stackSize: 3,
    
    // Description
    description: "Ermöglicht es dem Anwender für 10 Minuten unter Wasser zu atmen.",
    
    // Special Properties
    effects: ["water_breathing", "swim_speed_boost"],
    enchantments: [],
    
    // Visual
    color: "#339af0",
    iconFrame: "rare"
};
