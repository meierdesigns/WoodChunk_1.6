// Schwebetrank - Individual Item Configuration
export default {
    id: "potion_levitation_1",
    name: "Schwebetrank",
    filename: "levitationPotion.js",
    category: "potions",
    type: "utility",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    duration: 60, // 1 Minute
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 350,
    buyPrice: 700,
    
    // Gameplay
    level: 16,
    rarity: "epic",
    stackSize: 1,
    
    // Description
    description: "Lässt den Anwender für 1 Minute schweben und ermöglicht das Überwinden von Hindernissen.",
    
    // Special Properties
    effects: ["levitation", "fall_damage_immunity"],
    enchantments: [],
    
    // Visual
    color: "#e599f7",
    iconFrame: "epic"
};
