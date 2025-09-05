// Leather Armor - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "armor_leather",
    name: "Leather Armor",
    filename: "armor_leather.png",
    category: "armor",
    type: "chest",
    material: "leather",
    
    // Defense Stats - Edit these!
    defense: 8,
    magicResistance: 2,
    fireResistance: 0,
    
    // Physical Properties - Edit these!
    weight: 4.5,
    durability: 80,
    maxDurability: 80,
    
    // Economic - Edit these!
    sellPrice: 50,
    buyPrice: 100,
    
    // Gameplay - Edit these!
    level: 3,
    rarity: "common",
    stackSize: 1,
    
    // Description - Edit this!
    description: "Basic leather armor crafted from tanned hide. Light and comfortable, perfect for beginners.",
    
    // Special Properties - Add/edit these!
    effects: [
        {
            type: "stealth_bonus",
            value: 0.10,
            description: "10% stealth bonus"
        }
    ],
    enchantments: [],
    
    // Armor Specific - Edit these!
    slot: "chest",
    armorClass: "light",
    
    // Visual - Edit these!
    color: "#8B4513",
    iconFrame: "common"
};