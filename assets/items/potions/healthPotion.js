// Heiltrank - Individual Item Configuration
export default {
    id: "potion_health_1",
    name: "Kleiner Heiltrank",
    filename: "healthPotion.js",
    category: "potions",
    type: "health",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    healing: 50,
    duration: 0, // Sofortiger Effekt
    
    // Physical Properties
    weight: 0.2,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 25,
    buyPrice: 50,
    
    // Gameplay
    level: 1,
    rarity: "common",
    stackSize: 10,
    
    // Description
    description: "Ein einfacher Heiltrank, der sofort 50 Lebenspunkte wiederherstellt.",
    
    // Special Properties
    effects: ["instant_heal"],
    enchantments: [],
    
    // Visual
    color: "#ff6b6b",
    iconFrame: "common"
};
