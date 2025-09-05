// Gegengift - Individual Item Configuration
export default {
    id: "potion_antidote_1",
    name: "Gegengift",
    filename: "antidotePotion.js",
    category: "potions",
    type: "antidote",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 0, // Sofortiger Effekt
    
    // Physical Properties
    weight: 0.2,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 75,
    buyPrice: 150,
    
    // Gameplay
    level: 5,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Hebt die Wirkung von Giften auf und gewährt kurzzeitige Immunität.",
    
    // Special Properties
    effects: ["cure_poison", "poison_resistance"],
    enchantments: [],
    
    // Visual
    color: "#94d82d",
    iconFrame: "uncommon"
};
