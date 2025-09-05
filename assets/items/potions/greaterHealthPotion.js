// Großer Heiltrank - Individual Item Configuration
export default {
    id: "potion_health_2",
    name: "Großer Heiltrank",
    filename: "greaterHealthPotion.js",
    category: "potions",
    type: "health",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    healing: 150,
    duration: 0, // Sofortiger Effekt
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 75,
    buyPrice: 150,
    
    // Gameplay
    level: 10,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Ein starker Heiltrank, der sofort 150 Lebenspunkte wiederherstellt.",
    
    // Special Properties
    effects: ["instant_heal", "vitality_boost"],
    enchantments: [],
    
    // Visual
    color: "#fa5252",
    iconFrame: "uncommon"
};
