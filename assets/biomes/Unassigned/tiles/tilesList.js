// Unassigned tiles list
const unassignedTilesList = [
    {
        name: "Unassigned",
        image: "assets/biomes/Unassigned/Unassigned.png",
        movementCost: 1,
        defenseBonus: 0,
        resources: "",
        description: "Nicht zugeordnete Tiles"
    }
];

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = unassignedTilesList;
}
