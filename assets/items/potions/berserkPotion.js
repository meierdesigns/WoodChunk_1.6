// Berserkertrank - Individual Item Configuration
export default {
    id: "potion_berserk_1",
    name: "Berserkertrank",
    filename: "berserkPotion.js",
    category: "potions",
    type: "combat",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 30, // 30 Sekunden
    damageBonus: 100, // 100% mehr Schaden
    defenseReduction: 50, // 50% weniger Verteidigung
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 300,
    buyPrice: 600,
    
    // Gameplay
    level: 15,
    rarity: "epic",
    stackSize: 1,
    
    // Description
    description: "Verdoppelt verursachten Schaden für 30 Sekunden, reduziert aber die Verteidigung um die Hälfte.",
    
    // Special Properties
    effects: ["berserk_rage", "defense_reduction"],
    enchantments: [],
    
    // Visual
    color: "#c92a2a",
    iconFrame: "epic"
};
