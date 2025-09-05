// Manatrank - Individual Item Configuration
export default {
    id: "potion_mana_1",
    name: "Kleiner Manatrank",
    filename: "manaPotion.js",
    category: "potions",
    type: "mana",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    manaRestore: 50,
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
    description: "Ein einfacher Manatrank, der sofort 50 Manapunkte wiederherstellt.",
    
    // Special Properties
    effects: ["instant_mana"],
    enchantments: [],
    
    // Visual
    color: "#4dabf7",
    iconFrame: "common"
};
