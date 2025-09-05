# Biome System - WoodChunk 1.5

Dieser Ordner enthält alle Biome-Konfigurationen und zugehörigen Tile-Grafiken für das Spiel.

## Ordnerstruktur

```
assets/biomes/
├── README.md                 # Diese Datei
├── biomeConfig.js           # Hauptkonfigurationsdatei für alle Biome
├── Unassigned/              # Unzugewiesene Tiles
│   └── tiles/              # Alle Tile-Grafiken (noch zu kategorisieren)
├── Forests/                 # Wald-Biome
│   └── tiles/              # Wald-Tile-Grafiken
├── Mountains/               # Gebirgs-Biome
│   └── tiles/              # Gebirgs-Tile-Grafiken
├── Water/                   # Wasser-Biome
│   └── tiles/              # Wasser-Tile-Grafiken
└── Desert/                  # Wüsten-Biome
    └── tiles/              # Wüsten-Tile-Grafiken
```

## Biome-Typen

### 0. Unassigned (Unzugewiesen)
- **Typ**: Special
- **Farbe**: Grau (#9E9E9E)
- **Tiles**: Alle verfügbaren Tile-Grafiken
- **Ressourcen**: Verschiedene (noch zu kategorisieren)
- **Zweck**: Sammelstelle für alle Tiles, die noch keiner Kategorie zugeordnet wurden

### 1. Forests (Wälder)
- **Typ**: Biome
- **Farbe**: Grün (#4CAF50)
- **Tiles**: Eichenwald, Kiefernwald, Mischwald
- **Ressourcen**: Holz, Eicheln, Pilze, Harz, Beeren

### 2. Mountains (Gebirge)
- **Typ**: Terrain
- **Farbe**: Braun (#795548)
- **Tiles**: Felsige Berge (verschiedene Varianten)
- **Ressourcen**: Stein, Erz, Kristalle, Kohle, Edelsteine

### 3. Water (Wasser)
- **Typ**: Terrain
- **Farbe**: Blau (#2196F3)
- **Tiles**: Fluss, See, Ozean, Sumpf
- **Ressourcen**: Fisch, Wasser, Sand, Algen, Salz, Perlen

### 4. Desert (Wüste)
- **Typ**: Biome
- **Farbe**: Orange (#FF9800)
- **Tiles**: Sandwüste, Felswüste, Oase
- **Ressourcen**: Sand, Salz, Wüstenkräuter, Erz, Datteln

## Verwendung

### In JavaScript
```javascript
// Alle Biome laden
const biomes = getAllBiomes();

// Spezifisches Biome abrufen
const forestBiome = getBiomeById('forests');

// Alle Tiles eines Bioms
const forestTiles = getTilesByBiome('forests');

// Spezifisches Tile finden
const oakTile = getTileById('forest_oak_1');

// Nach Tiles suchen
const searchResults = searchTiles('Holz');

// Tiles nach Seltenheit filtern
const rareTiles = getTilesByRarity('rare');
```

### Im Tile Editor
Der Tile Editor kann diese Konfiguration verwenden, um:
- Biome-spezifische Tiles anzuzeigen
- Kategorien automatisch zu befüllen
- Tile-Eigenschaften vorzuladen

### Im HexMap Editor
Der HexMap Editor kann diese Konfiguration verwenden, um:
- Biome-typische Tiles vorzuschlagen
- Konsistente Tile-Platzierung zu gewährleisten
- Ressourcen-Verteilung zu optimieren

## Tile-Eigenschaften

Jedes Tile hat folgende Eigenschaften:
- **id**: Eindeutige Kennung
- **name**: Anzeigename
- **image**: Pfad zur Grafik
- **movementCost**: Bewegungskosten (1-5)
- **defenseBonus**: Verteidigungsbonus (0-3)
- **resources**: Verfügbare Ressourcen (Array)
- **rarity**: Seltenheit (common, uncommon, rare)
- **description**: Beschreibung des Tiles

## Erweiterung

Um neue Biome hinzuzufügen:
1. Neuen Ordner unter `assets/biomes/` erstellen
2. `tiles/` Unterordner mit Grafiken erstellen
3. Konfiguration in `biomeConfig.js` hinzufügen
4. Neue Funktionen bei Bedarf implementieren

## Kompatibilität

- **Browser**: Alle Funktionen sind global verfügbar
- **Node.js**: Module-Export für Server-seitige Verwendung
- **ES6+**: Moderne JavaScript-Features werden unterstützt
