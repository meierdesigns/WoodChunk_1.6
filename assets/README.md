# WoodChunk 1.4 - Asset System

## 📁 Asset-Struktur

Das Asset-System ist in Kategorien organisiert, die für das Game-System optimal zugänglich sind. Jede Kategorie hat ein **Haupt-Item** als Template, das für verschiedene Werte angewendet wird.

### 🗂️ Ordnerstruktur

```
assets/
├── tiles/                    # Hexagon-Tiles und Terrain
│   ├── hexagons/            # Basis-Hexagon-Formen
│   │   └── hex_main.svg     # Haupt-Hexagon-Template
│   ├── terrain/             # Terrain-Texturen
│   │   ├── Trees/          # Baum-Terrain
│   │   │   └── tree_main.png # Haupt-Baum-Template
│   │   ├── Forests/        # Wald-Terrain
│   │   │   └── forest_main.png # Haupt-Wald-Template
│   │   ├── Mountains/      # Berg-Terrain
│   │   │   └── mountain_main.png # Haupt-Berg-Template
│   │   └── Special Places/ # Spezielle Orte
│   │       └── special_main.png # Haupt-Special-Template
│   └── icons/              # UI-Icons und Symbole
│       └── icon_main.svg   # Haupt-Icon-Template
├── characters/              # Charakter-Assets
│   ├── player/             # Spieler-Charaktere
│   │   └── player_main.png # Haupt-Spieler-Template
│   ├── npc/                # NPC-Charaktere
│   │   └── npc_main.png    # Haupt-NPC-Template
│   └── portraits/          # Charakter-Portraits
│       └── portrait_main.png # Haupt-Portrait-Template
├── items/                   # Item-Assets
│   ├── weapons/            # Waffen
│   │   └── weapon_main.png # Haupt-Waffen-Template
│   ├── armor/              # Rüstung
│   │   └── armor_main.png  # Haupt-Rüstungs-Template
│   ├── potions/            # Tränke
│   │   └── potion_main.png # Haupt-Trank-Template
│   ├── materials/          # Materialien
│   │   └── material_main.png # Haupt-Material-Template
│   └── quest/              # Quest-Items
│       └── quest_main.png  # Haupt-Quest-Template
├── enemies/                 # Gegner-Assets
│   ├── goblins/            # Goblin-Typen
│   │   └── goblin_main.png # Haupt-Goblin-Template
│   ├── orcs/               # Orc-Typen
│   │   └── orc_main.png    # Haupt-Orc-Template
│   ├── dragons/            # Drachen
│   │   └── dragon_main.png # Haupt-Drachen-Template
│   └── bosses/             # Boss-Gegner
│       └── boss_main.png   # Haupt-Boss-Template
├── ui/                      # UI-Assets
│   ├── buttons/            # UI-Buttons
│   │   └── button_main.png # Haupt-Button-Template
│   ├── icons/              # UI-Icons
│   │   └── icon_main.png   # Haupt-Icon-Template
│   ├── backgrounds/        # Hintergründe
│   │   └── bg_main.png     # Haupt-Hintergrund-Template
│   └── fonts/              # Schriftarten
│       └── font_main.ttf   # Haupt-Schriftart
├── audio/                   # Audio-Assets
│   ├── music/              # Hintergrundmusik
│   │   └── music_main.mp3  # Haupt-Musik-Template
│   ├── sfx/                # Soundeffekte
│   │   └── sfx_main.mp3    # Haupt-SFX-Template
│   └── voice/              # Sprachausgabe
│       └── voice_main.mp3  # Haupt-Stimme-Template
└── maps/                    # Karten-Assets
    ├── backgrounds/         # Karten-Hintergründe
    │   └── map_bg_main.png # Haupt-Karten-Hintergrund
    ├── overlays/           # Karten-Overlays
    │   └── overlay_main.png # Haupt-Overlay-Template
    └── templates/          # Karten-Templates
        └── map_main.png    # Haupt-Karten-Template
```

## 🎯 Schlanke Organisationsstruktur

### 📋 Haupt-Item-Prinzip

Jede Kategorie hat ein **Haupt-Item** (`*_main.*`), das als Template für verschiedene Werte dient:

#### **🏗️ Template-System:**
```javascript
// Beispiel: Waffen-Template mit verschiedenen Werten
const weaponTemplate = {
    base: 'assets/items/weapons/weapon_main.png',
    variants: {
        iron: { damage: 15, value: 50, color: '#8B7355' },
        steel: { damage: 25, value: 100, color: '#C0C0C0' },
        mythril: { damage: 40, value: 200, color: '#E6E6FA' }
    }
};
```

#### **🎨 Asset-Variationen:**
```javascript
// Beispiel: Terrain-Template mit verschiedenen Biomen
const terrainTemplate = {
    base: 'assets/tiles/terrain/forest_main.png',
    variants: {
        light_forest: { density: 0.3, color: '#90EE90' },
        dense_forest: { density: 0.8, color: '#228B22' },
        dark_forest: { density: 1.0, color: '#006400' }
    }
};
```

### 🔧 Asset-Manager Integration

#### **📦 Template-basierte Asset-Verwaltung:**
```javascript
// Asset-Manager mit Template-Support
class AssetManager {
    async getTemplate(category, templateName) {
        const templatePath = `${this.categories[category]}/${templateName}_main.png`;
        return await this.loadAsset(templatePath);
    }
    
    async getVariant(category, templateName, variant) {
        const template = await this.getTemplate(category, templateName);
        const variantData = this.getVariantData(category, templateName, variant);
        
        return {
            template: template,
            variant: variantData,
            finalAsset: this.applyVariant(template, variantData)
        };
    }
}
```

#### **🎯 Beispiel-Implementierung:**
```javascript
// Waffen mit verschiedenen Materialien
const ironSword = await assetManager.getVariant('items/weapons', 'weapon', 'iron');
const steelSword = await assetManager.getVariant('items/weapons', 'weapon', 'steel');

// Terrain mit verschiedenen Biomen
const lightForest = await assetManager.getVariant('tiles/terrain', 'forest', 'light');
const denseForest = await assetManager.getVariant('tiles/terrain', 'forest', 'dense');
```

## 🎮 Game-System Integration

### 📋 Asset-Manager

Das Game-System verwendet einen zentralen Asset-Manager mit Template-Support:

```javascript
// Beispiel: Asset-Manager Integration
import { AssetManager } from './modules/core/AssetManager.js';

const assetManager = new AssetManager();
await assetManager.initialize();

// Template-basierte Assets laden
const weaponTemplate = await assetManager.getTemplate('items/weapons', 'weapon');
const ironSword = await assetManager.getVariant('items/weapons', 'weapon', 'iron');
const enemyTemplate = await assetManager.getTemplate('enemies/goblins', 'goblin');
```

### 🔧 Asset-Kategorien

#### 1. **Tiles** (`assets/tiles/`)
- **Haupt-Template**: `hex_main.svg` (Hexagon-Basis)
- **Variationen**: Flat/Pointy, Größen, Farben
- **Terrain-Templates**: `tree_main.png`, `forest_main.png`, etc.
- **Verwendung**: Hexagon-Map-System

#### 2. **Characters** (`assets/characters/`)
- **Haupt-Template**: `player_main.png` (Spieler-Basis)
- **Variationen**: Klassen, Rassen, Ausrüstung
- **NPC-Template**: `npc_main.png` (NPC-Basis)
- **Verwendung**: Charakter-Editor und Spiel

#### 3. **Items** (`assets/items/`)
- **Haupt-Template**: `weapon_main.png` (Waffen-Basis)
- **Variationen**: Materialien, Verzauberungen, Qualität
- **Armor-Template**: `armor_main.png` (Rüstungs-Basis)
- **Verwendung**: Item-Editor und Inventar

#### 4. **Enemies** (`assets/enemies/`)
- **Haupt-Template**: `goblin_main.png` (Goblin-Basis)
- **Variationen**: Typen, Level, Ausrüstung
- **Boss-Template**: `boss_main.png` (Boss-Basis)
- **Verwendung**: Enemy-Editor und Kampfsystem

#### 5. **UI** (`assets/ui/`)
- **Haupt-Template**: `button_main.png` (Button-Basis)
- **Variationen**: Themes, States, Größen
- **Icon-Template**: `icon_main.png` (Icon-Basis)
- **Verwendung**: Benutzeroberfläche

#### 6. **Audio** (`assets/audio/`)
- **Haupt-Template**: `music_main.mp3` (Musik-Basis)
- **Variationen**: Tempo, Tonart, Instrumente
- **SFX-Template**: `sfx_main.mp3` (SFX-Basis)
- **Verwendung**: Sound und Musik

#### 7. **Maps** (`assets/maps/`)
- **Haupt-Template**: `map_main.png` (Karten-Basis)
- **Variationen**: Biome, Klima, Größe
- **Overlay-Template**: `overlay_main.png` (Overlay-Basis)
- **Verwendung**: Karten-System

## 🛠️ Asset-Management Features

### 📊 Template-basierte Kategorisierung
- Haupt-Templates in jeder Kategorie
- Automatische Varianten-Generierung
- Werte-basierte Asset-Anwendung

### 🔍 Template-Suche
```javascript
// Beispiel: Template-Suche
const weaponTemplates = await assetManager.searchTemplates('items/weapons');
const ironVariants = await assetManager.searchVariants('items/weapons', 'weapon', 'iron');
const rareItems = await assetManager.searchByRarity('items', 'rare');
```

### 📦 Template-Bundling
- Haupt-Templates werden beim Start geladen
- Varianten werden bei Bedarf generiert
- Caching für Template-Kombinationen

### 🎨 Template-Variationen
```javascript
// Beispiel: Template-Variationen
const swordVariants = await assetManager.getTemplateVariants('items/weapons', 'weapon', {
    materials: ['iron', 'steel', 'mythril'],
    enchantments: ['fire', 'ice', 'lightning'],
    quality: ['common', 'rare', 'epic']
});
```

## 📋 Template-Naming Conventions

### 📝 Template-Dateinamen-Regeln
```
[category]_main.[extension]
```

**Beispiele:**
- `weapon_main.png` (Haupt-Waffen-Template)
- `goblin_main.png` (Haupt-Goblin-Template)
- `forest_main.png` (Haupt-Wald-Template)
- `button_main.png` (Haupt-Button-Template)

### 🏷️ Template-Metadaten-Struktur
```json
{
  "template": "weapon_main.png",
  "category": "items/weapons",
  "baseType": "weapon",
  "variants": {
    "iron": {
      "damage": 15,
      "value": 50,
      "color": "#8B7355",
      "durability": 100
    },
    "steel": {
      "damage": 25,
      "value": 100,
      "color": "#C0C0C0",
      "durability": 200
    },
    "mythril": {
      "damage": 40,
      "value": 200,
      "color": "#E6E6FA",
      "durability": 500
    }
  },
  "animations": ["idle", "attack", "block"],
  "sounds": ["swing", "hit", "break"]
}
```

## 🔧 Integration mit Modulen

### 🗺️ Map Editor
```javascript
// Terrain-Templates laden
const terrainTemplates = await assetManager.getTemplates('tiles/terrain');
const forestVariants = await assetManager.getTemplateVariants('tiles/terrain', 'forest');
```

### ⚔️ Item Editor
```javascript
// Item-Templates laden
const weaponTemplates = await assetManager.getTemplates('items/weapons');
const armorTemplates = await assetManager.getTemplates('items/armor');
```

### 👹 Enemy Editor
```javascript
// Enemy-Templates laden
const enemyTemplates = await assetManager.getTemplates('enemies');
const bossTemplates = await assetManager.getTemplates('enemies/bosses');
```

### 👤 Character Editor
```javascript
// Character-Templates laden
const playerTemplates = await assetManager.getTemplates('characters/player');
const npcTemplates = await assetManager.getTemplates('characters/npc');
```

## 🚀 Performance-Optimierung

### 📦 Template-Preloading
- Haupt-Templates werden beim Start geladen
- Varianten werden bei Bedarf generiert
- Template-Cache für häufige Kombinationen

### 🎯 Template-Lazy Loading
```javascript
// Beispiel: Template-Lazy Loading
const loadWeaponVariants = async (material) => {
    return await assetManager.getTemplateVariants('items/weapons', 'weapon', { material });
};
```

### 💾 Template-Caching-Strategien
- Template-Cache für Basis-Assets
- Variant-Cache für Kombinationen
- Metadata-Cache für Template-Informationen

## 🔄 Template-Updates

### 📤 Template-Import
```javascript
// Beispiel: Template-Import
await assetManager.importTemplate('path/to/new/template', {
    category: 'items/weapons',
    templateName: 'weapon',
    generateVariants: true
});
```

### 📥 Template-Export
```javascript
// Beispiel: Template-Export
await assetManager.exportTemplate('items/weapons', 'weapon', {
    includeVariants: true,
    includeMetadata: true
});
```

## 🎯 Best Practices

1. **📁 Template-Struktur einhalten**: Haupt-Templates in jeder Kategorie
2. **📝 Konsistente Template-Namensgebung**: `*_main.*` Format
3. **🎨 Template-Variationen**: Werte-basierte Asset-Anwendung
4. **📊 Template-Metadaten**: JSON-Dateien für Template-Informationen
5. **🔄 Template-Versionierung**: Template-Versionen verwalten
6. **📦 Template-Bundling**: Ähnliche Templates zusammenfassen
7. **🎯 Template-Performance**: Templates für Web optimieren

## 🔧 Entwicklung

### 🛠️ Template-Tools
- **Template-Generator**: Automatische Template-Erstellung
- **Variant-Generator**: Automatische Varianten-Generierung
- **Template-Optimizer**: Template-Größe und Qualität optimieren
- **Template-Converter**: Template-Format-Konvertierung

### 📋 Template-Pipeline
1. **Haupt-Template** → Kategorie-Ordner
2. **Varianten-Generierung** → Werte-basierte Variationen
3. **Template-Metadaten** → JSON-Dateien
4. **Template-Bundling** → Kategorisierte Sammlungen
5. **Template-Integration** → Game-System

Diese schlanke Template-Struktur ermöglicht eine effiziente und skalierbare Asset-Verwaltung für das WoodChunk 1.4 Game-System. 