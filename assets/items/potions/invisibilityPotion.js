// Unsichtbarkeitstrank - Individual Item Configuration
export default {
    id: "potion_invisibility_1",
    name: "Trank der Unsichtbarkeit",
    filename: "invisibilityPotion.js",
    category: "potions",
    type: "utility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 60, // 60 Sekunden
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 500,
    buyPrice: 1000,
    
    // Gameplay
    level: 20,
    rarity: "epic",
    stackSize: 1,
    
    // Description
    description: "Macht den Anwender für 60 Sekunden unsichtbar. Der Effekt endet bei Kampfhandlungen.",
    
    // Special Properties
    effects: ["invisibility", "stealth_boost"],
    enchantments: [],
    
    // Visual
    color: "#dee2e6",
    iconFrame: "epic"
};
