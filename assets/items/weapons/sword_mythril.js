// Mythril Sword - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "sword_mythril",
    name: "Mythril Sword",
    filename: "sword_mythril.png", 
    category: "weapons",
    type: "sword",
    material: "mythril",
    
    // Combat Stats - Edit these!
    damage: 65,
    criticalChance: 0.30,
    criticalMultiplier: 2.5,
    
    // Physical Properties - Edit these!
    weight: 2.1,
    durability: 200,
    maxDurability: 200,
    
    // Economic - Edit these!
    sellPrice: 350,
    buyPrice: 700,
    
    // Gameplay - Edit these!
    level: 15,
    rarity: "legendary", 
    stackSize: 1,
    
    // Description - Edit this!
    description: "A legendary blade forged from pure mythril. Its ethereal glow hints at magical properties beyond mortal understanding.",
    
    // Special Properties - Add/edit these!
    effects: [
        {
            type: "light",
            radius: 10,
            description: "Emits a soft blue glow"
        },
        {
            type: "magic_damage",
            value: 15,
            description: "Deals additional magic damage"
        }
    ],
    enchantments: ["sharpness_III", "durability_II"],
    
    // Visual - Edit these!
    color: "#C0C0C0",
    iconFrame: "legendary",
    glowEffect: true
};