// Ausdauertrank - Individual Item Configuration
export default {
    id: "potion_stamina_1",
    name: "Kleiner Ausdauertrank",
    filename: "staminaPotion.js",
    category: "potions",
    type: "stamina",
    material: "glass",
    
    // Combat Stats
    damage: 0,
    staminaRestore: 50,
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
    description: "Ein einfacher Ausdauertrank, der sofort 50 Ausdauerpunkte wiederherstellt.",
    
    // Special Properties
    effects: ["instant_stamina"],
    enchantments: [],
    
    // Visual
    color: "#51cf66",
    iconFrame: "common"
};
