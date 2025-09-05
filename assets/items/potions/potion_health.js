// Health Potion - Individual Item Configuration
// You can edit all values directly!

export default {
    id: "potion_health",
    name: "Health Potion",
    filename: "potion_health.png",
    category: "potions",
    type: "consumable",
    
    // Potion Effects - Edit these!
    effect: "Restore 75 HP",
    healAmount: 75,
    duration: "Instant", 
    
    // Physical Properties - Edit these!
    weight: 0.5,
    
    // Economic - Edit these!
    sellPrice: 25,
    buyPrice: 50,
    
    // Gameplay - Edit these!
    level: 1,
    rarity: "common",
    stackSize: 10,
    
    // Description - Edit this!
    description: "A crimson red potion that instantly restores health when consumed. The liquid seems to pulse with vital energy.",
    
    // Potion Specific - Edit these!
    consumeTime: 2.0, // seconds
    cooldown: 5.0,    // seconds
    
    // Special Properties - Add/edit these!
    effects: [
        {
            type: "heal",
            value: 75,
            duration: 0,
            description: "Instantly restores 75 HP"
        }
    ],
    
    // Crafting - Edit these!
    ingredients: ["red_herb", "water", "healing_essence"],
    
    // Visual - Edit these!
    color: "#DC143C",
    iconFrame: "common",
    liquidColor: "#FF0000"
};