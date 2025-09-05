// Geschicklichkeitstrank - Individual Item Configuration
export default {
    id: "potion_agility_1",
    name: "Trank der Geschicklichkeit",
    filename: "agilityPotion.js",
    category: "potions",
    type: "agility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    agilityBonus: 5,
    duration: 300, // 5 Minuten
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 100,
    buyPrice: 200,
    
    // Gameplay
    level: 5,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Erhöht die Geschicklichkeit um 5 Punkte für 5 Minuten.",
    
    // Special Properties
    effects: ["agility_boost"],
    enchantments: [],
    
    // Visual
    color: "#37b24d",
    iconFrame: "uncommon"
};
