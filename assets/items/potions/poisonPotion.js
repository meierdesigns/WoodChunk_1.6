// Gifttrank - Individual Item Configuration
export default {
    id: "potion_poison_1",
    name: "Schwaches Gift",
    filename: "poisonPotion.js",
    category: "potions",
    type: "poison",
    material: "glass",
    
    // Combat Stats
    damage: 5,
    duration: 30, // 30 Sekunden
    tickRate: 1, // Schaden pro Sekunde
    
    // Physical Properties
    weight: 0.2,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 50,
    buyPrice: 100,
    
    // Gameplay
    level: 3,
    rarity: "common",
    stackSize: 5,
    
    // Description
    description: "Ein schwaches Gift, das über 30 Sekunden insgesamt 150 Schaden verursacht.",
    
    // Special Properties
    effects: ["poison_damage"],
    enchantments: [],
    
    // Visual
    color: "#82c91e",
    iconFrame: "common"
};
