// Chain Armor - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "armor_chain",
    name: "Chain Armor",
    filename: "armor_chain.png",
    category: "armor",
    type: "chest",
    material: "steel",
    
    // Defense Stats - Edit these!
    defense: 138,
    magicResistance: 5,
    fireResistance: 10,
    
    // Physical Properties - Edit these!
    weight: 12.0,
    durability: 140,
    maxDurability: 140,
    
    // Economic - Edit these!
    sellPrice: 120,
    buyPrice: 240,
    
    // Gameplay - Edit these!
    level: 7,
    rarity: "uncommon",
    stackSize: 1,
    
    // Description - Edit this!
    description: "Flexible chain mail armor crafted from interlocking steel rings. Provides excellent protection while maintaining mobility.",
    
    // Special Properties - Add/edit these!
    effects: [
        {
            type: "movement_bonus",
            value: 0.05,
            description: "5% movement speed bonus"
        }
    ],
    enchantments: [],
    
    // Armor Specific - Edit these!
    slot: "chest",
    armorClass: "medium",
    
    // Visual - Edit these!
    color: "#C0C0C0",
    iconFrame: "uncommon"
};