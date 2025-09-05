// Starker Gifttrank - Individual Item Configuration
export default {
    id: "potion_poison_2",
    name: "Starkes Gift",
    filename: "greaterPoisonPotion.js",
    category: "potions",
    type: "poison",
    material: "glass",
    
    // Combat Stats
    damage: 15,
    duration: 30, // 30 Sekunden
    tickRate: 1, // Schaden pro Sekunde
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 150,
    buyPrice: 300,
    
    // Gameplay
    level: 15,
    rarity: "rare",
    stackSize: 3,
    
    // Description
    description: "Ein starkes Gift, das über 30 Sekunden insgesamt 450 Schaden verursacht.",
    
    // Special Properties
    effects: ["poison_damage", "weakness"],
    enchantments: [],
    
    // Visual
    color: "#5c940d",
    iconFrame: "rare"
};
