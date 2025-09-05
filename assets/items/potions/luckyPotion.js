// Glückstrank - Individual Item Configuration
export default {
    id: "potion_luck_1",
    name: "Glückstrank",
    filename: "luckyPotion.js",
    category: "potions",
    type: "utility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 300, // 5 Minuten
    luckBonus: 50, // 50% mehr Glück
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 400,
    buyPrice: 800,
    
    // Gameplay
    level: 18,
    rarity: "epic",
    stackSize: 1,
    
    // Description
    description: "Erhöht die Chance auf seltene Beute und kritische Treffer für 5 Minuten um 50%.",
    
    // Special Properties
    effects: ["luck_boost", "critical_boost"],
    enchantments: [],
    
    // Visual
    color: "#ffd700",
    iconFrame: "epic"
};
