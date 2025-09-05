// Hastetrank - Individual Item Configuration
export default {
    id: "potion_haste_1",
    name: "Hastetrank",
    filename: "hastePotion.js",
    category: "potions",
    type: "utility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 120, // 2 Minuten
    speedBonus: 50, // 50% mehr Geschwindigkeit
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 250,
    buyPrice: 500,
    
    // Gameplay
    level: 14,
    rarity: "rare",
    stackSize: 3,
    
    // Description
    description: "Erhöht die Bewegungs- und Angriffsgeschwindigkeit für 2 Minuten um 50%.",
    
    // Special Properties
    effects: ["movement_speed", "attack_speed"],
    enchantments: [],
    
    // Visual
    color: "#ffd43b",
    iconFrame: "rare"
};
