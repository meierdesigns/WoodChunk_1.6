// Großer Manatrank - Individual Item Configuration
export default {
    id: "potion_mana_2",
    name: "Großer Manatrank",
    filename: "greaterManaPotion.js",
    category: "potions",
    type: "mana",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    manaRestore: 150,
    duration: 0, // Sofortiger Effekt
    
    // Physical Properties
    weight: 0.3,
    durability: 1,
    maxDurability: 1,
    
    // Economic
    sellPrice: 75,
    buyPrice: 150,
    
    // Gameplay
    level: 10,
    rarity: "uncommon",
    stackSize: 5,
    
    // Description
    description: "Ein starker Manatrank, der sofort 150 Manapunkte wiederherstellt.",
    
    // Special Properties
    effects: ["instant_mana", "mana_regeneration"],
    enchantments: [],
    
    // Visual
    color: "#228be6",
    iconFrame: "uncommon"
};
