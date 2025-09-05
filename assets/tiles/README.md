# Tile Graphics - Assets

Dieser Ordner enthält alle Grafiken für die Hexagon-Tiles und Terrain-Elemente.

## 📁 Ordnerstruktur

```
assets/tiles/
├── hexagons/           # Hexagon-Grundformen und -Outlines
├── terrain/            # Terrain-Texturen (organisiert in Unterordner)
│   ├── Trees/         # Baum-Texturen (Slice 57-91)
│   ├── Forests/       # Wald-Texturen (Slice 1-21, 40-42)
│   ├── Mountains/     # Berg-Texturen (Slice 36-38)
│   └── Special Places/ # Spezielle Orte (Slice 22-35, 43-56)
├── icons/              # Icons und Symbole für Tiles
└── README.md           # Diese Dokumentation
```

## 🎨 Verwendung

### Hexagon-Grafiken (`hexagons/`)
- **Grundformen**: Basis-Hexagon-Shapes in verschiedenen Größen
- **Outlines**: Umrandungen für verschiedene Hexagon-Typen
- **Formate**: SVG (vektorisiert) oder PNG (rasterisiert)

### Terrain-Texturen (`terrain/`)
- **Trees**: Einzelne Bäume und Baum-Variationen
- **Forests**: Dichte Waldgebiete und Wald-Variationen  
- **Mountains**: Berg- und Fels-Texturen
- **Special Places**: Besondere Orte, Gebäude, Ruinen

### Icons (`icons/`)
- **Ressourcen**: Icons für verschiedene Ressourcen
- **Gebäude**: Icons für Gebäude und Strukturen
- **Einheiten**: Icons für Spieler-Einheiten
- **Status**: Status-Icons (ausgewählt, hover, etc.)

## 📋 Namenskonventionen

### Dateinamen
```
{typ}_{variante}_{groesse}.{format}
```

**Beispiele:**
- `hex_flat_60px.svg` - Flaches Hexagon, 60px
- `trees_Slice 57.png` - Baum-Textur aus Trees-Ordner
- `forests_Slice 1.png` - Wald-Textur aus Forests-Ordner
- `icon_resource_wood.svg` - Holz-Ressourcen-Icon

### Terrain-Kategorien
- **trees**: Einzelne Bäume (35 Varianten)
- **forests**: Waldgebiete (24 Varianten)
- **mountains**: Berge (3 Varianten)
- **special_places**: Besondere Orte (28 Varianten)

### Größen
- **60px**: Standard-Hexagon-Größe
- **30px**: Kleine Hexagone
- **90px**: Große Hexagone

### Formate
- **SVG**: Für skalierbare Vektorgrafiken
- **PNG**: Für Rastergrafiken mit Transparenz
- **WebP**: Für optimierte Web-Grafiken

## 🔧 Integration

Die Grafiken werden über das `TileManager`-Modul geladen und verwaltet:

```javascript
import { TileManager } from '../modules/core/TileManager.js';

const tileManager = new TileManager();
await tileManager.initialize();

// Spezifische Terrain-Textur holen
const treeTexture = tileManager.getTerrainTextureByCategory('trees', 'Slice 57');

// Alle Texturen einer Kategorie holen
const forestTextures = tileManager.getTerrainTexturesByCategory('forests');

// Zufällige Textur einer Kategorie
const randomMountain = tileManager.getRandomTerrainTexture('mountains');
```

## 📝 Hinweise

- Alle Grafiken sollten transparente Hintergründe haben
- SVG-Dateien bevorzugen für skalierbare Grafiken
- PNG-Dateien für komplexe Texturen verwenden
- WebP für optimierte Web-Performance
- Terrain-Texturen sind in Kategorien organisiert für bessere Verwaltung 