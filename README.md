# WoodChunk 1.6.1

Eine umfassende modulare Spiel-Engine für Hex-basierte Strategie- und Rollenspiele mit vollständiger Editor-Suite und Asset-Management-System.

## 🎮 Überblick

WoodChunk 1.6.1 ist eine professionelle Spiel-Engine, die speziell für Hex-Grid-basierte Spiele entwickelt wurde. Das System bietet eine vollständige Entwicklungsumgebung mit integrierten Editoren für Charaktere, Items, Biomes, Tiles und mehr.

## 🏗️ Architektur

### Modulare Struktur mit Austauschbarkeit

Die Engine folgt einer strikt modularen Architektur mit drei Hauptmodulen:

#### **Core Module** (`src/modules/core/`)
- **AssetManager.ts** - Zentrales Asset-Management mit Caching
- **Config.ts** - Globale Konfiguration und Einstellungen
- **CoreModule.ts** - Haupt-Core-System und Initialisierung
- **EventBus.ts** - Event-System für modulare Kommunikation
- **HexGeometry.ts** - Hex-Grid-Berechnungen und Geometrie
- **MapTemplate.ts** - Karten-Templates und -Generierung
- **NavigationManager.ts** - Pfadfindung und Navigation
- **SettingsManager.ts** - Einstellungsverwaltung mit Persistierung
- **TileManager.ts** - Tile-Management und -Rendering

#### **Game Module** (`src/modules/game/`)
- **GameModule.ts** - Haupt-Spiel-Logik und Zustandsverwaltung
- **HexGridManager.ts** - Hex-Grid-Management und -Operationen

#### **UI Module** (`src/modules/ui/`)
- **CameraController.ts** - Kamera-Steuerung mit Zoom und Pan
- **HexRenderer.ts** - Canvas-basiertes Hex-Rendering
- **UIModule.ts** - Haupt-UI-System und Komponenten-Management
- **CharacterEditor.tsx** - Charakter-Editor-Komponente
- **ItemEditor.tsx** - Item-Editor-Komponente
- **MapEditor.tsx** - Karten-Editor-Komponente
- **PeopleEditor.tsx** - Völker-Editor-Komponente
- **Settings.tsx** - Einstellungs-Interface
- **MainMenu.tsx** - Hauptmenü-Komponente
- **MainCard.tsx** - Haupt-Karten-Komponente

### Schnittstellen & Entkopplung

Alle Module kommunizieren über typsichere Interfaces:
- `CoreAPI` - Core-System-Zugriff und -Konfiguration
- `GameAPI` - Spielzustand, -logik und -mechaniken
- `UIAPI` - Benutzeroberfläche, Rendering und Interaktion

## 🚀 Features

### Kern-Features
- **Hex-Grid-System** mit flachen und spitzen Hexagonen
- **Erweiterte Kamera-Steuerung** mit Zoom, Pan und Rotation
- **Intelligentes Asset-Management** mit automatischem Caching
- **Event-System** für lose gekoppelte modulare Kommunikation
- **Persistente Einstellungsverwaltung** mit localStorage
- **A*-Pfadfindung** für intelligente Navigation
- **Dynamische Terrain-Generierung** für verschiedene Landschaftstypen

### Editor-Suite
- **Tile Editor** - Vollständiger Tile-Editor mit Biome-Integration
- **Character Editor** - Charakter-Erstellung und -Anpassung
- **Item Editor** - Item-Management mit Kategorisierung
- **People Editor** - Völker- und Rassen-Management
- **Abilities Editor** - Fähigkeiten-System mit Kategorien
- **Color Editor** - Farb-Paletten-Management
- **Hex Map Editor** - Interaktiver Hex-Karten-Editor

### Asset-System
- **Umfassende Asset-Bibliothek** mit über 1000+ Assets
- **Biome-System** mit 10+ verschiedenen Landschaftstypen
- **Item-System** mit Waffen, Rüstungen, Tränken und Materialien
- **Character-System** mit verschiedenen Völkern und Klassen
- **Ability-System** mit Kampf-, Handwerk-, Magie- und Sozial-Fähigkeiten

## 🛠️ Technologie-Stack

### Frontend
- **TypeScript** - Typsicherheit und bessere Entwicklererfahrung
- **React 18** - Moderne UI-Entwicklung mit Hooks
- **Vite** - Schnelle Build-Tools und Hot-Reload
- **Canvas API** - Effizientes 2D-Rendering für Hex-Grids

### Backend & Tools
- **Python** - Server-Side-Services und Asset-Processing
- **Node.js** - Entwicklungstools und Build-Skripte

### Asset-Formate
- **PNG** - Optimierte Tile- und Sprite-Grafiken
- **SVG** - Vektorbasierte Icons und UI-Elemente
- **JSON** - Konfigurationsdateien und Datenstrukturen

## 📁 Vollständige Projektstruktur

```
WoodChunk_1.6.1/
├── src/                          # TypeScript-Quellcode
│   ├── modules/
│   │   ├── core/                 # Core-Systeme
│   │   ├── game/                 # Spielsysteme
│   │   ├── ui/                   # React-Komponenten
│   │   ├── characterEditor/     # Charakter-Editor
│   │   └── itemEditor/          # Item-Editor
│   ├── shared/                   # Gemeinsame Typen
│   ├── App.tsx                   # Haupt-App-Komponente
│   └── styles.css               # Basis-Styles
├── modules/                      # Legacy-Module (JavaScript)
│   ├── abilitiesEditor/          # Fähigkeiten-Editor
│   ├── characterEditor/         # Charakter-Editor
│   ├── colorEditor/             # Farb-Editor
│   ├── core/                    # Core-Services
│   ├── hexMapEditor/           # Hex-Karten-Editor
│   ├── itemEditor/             # Item-Editor
│   ├── peopleEditor/           # Völker-Editor
│   ├── tileEditor/             # Tile-Editor
│   └── ui/                     # UI-Komponenten
├── assets/                       # Asset-Bibliothek
│   ├── abilities/               # Fähigkeiten-Assets
│   │   ├── combat/              # Kampf-Fähigkeiten
│   │   ├── craft/               # Handwerk-Fähigkeiten
│   │   ├── magic/               # Magie-Fähigkeiten
│   │   └── social/              # Sozial-Fähigkeiten
│   ├── biomes/                  # Biome-Definitionen
│   │   ├── Badlands/           # Wüsten-Biome
│   │   ├── Buildings/          # Gebäude-Biome
│   │   ├── Coast/              # Küsten-Biome
│   │   ├── Desert/             # Wüsten-Biome
│   │   ├── Forest/             # Wald-Biome
│   │   ├── Jungle/             # Dschungel-Biome
│   │   ├── Mountains/          # Gebirgs-Biome
│   │   ├── Ocean/              # Ozean-Biome
│   │   ├── Plain/              # Ebene-Biome
│   │   ├── Snow/               # Schnee-Biome
│   │   ├── Swamp/              # Sumpf-Biome
│   │   ├── Unassigned/         # Nicht zugeordnete Tiles
│   │   └── Water/              # Wasser-Biome
│   ├── characters/             # Charakter-Assets
│   ├── config/                 # Konfigurationsdateien
│   ├── enemies/                # Gegner-Definitionen
│   ├── items/                  # Item-Assets
│   │   ├── armor/              # Rüstungen
│   │   ├── classes/            # Item-Klassen
│   │   ├── materials/          # Materialien
│   │   ├── potions/            # Tränke
│   │   ├── quest/              # Quest-Items
│   │   └── weapons/            # Waffen
│   ├── peoples/                # Völker-Definitionen
│   ├── ranks/                  # Seltenheits-Ränge
│   ├── rohstoffe/              # Rohstoff-Assets
│   ├── statusicons/            # Status-Icons
│   └── tiles/                  # Tile-Assets
├── debug/                       # Debug-Tools und Tests
├── index.html                   # Haupt-HTML-Datei
├── start.bat                   # Start-Skript
└── README.md                   # Diese Datei
```

## 🚀 Entwicklung

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Python 3.8+ (für Server-Services)

### Installation & Start

```bash
# Repository klonen
git clone https://github.com/meierdesigns/WoodChunk_1.6.1.git
cd WoodChunk_1.6.1

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Oder mit dem bereitgestellten Start-Skript
start.bat
```

### Build & Deployment

```bash
# Produktions-Build erstellen
npm run build

# Build-Vorschau
npm run preview

# TypeScript-Kompilierung prüfen
npm run type-check
```

### Debug & Testing

```bash
# Debug-Modus aktivieren
npm run dev -- --debug

# Spezifische Module testen
# Öffne debug/test-modules.html im Browser
```

## ⚙️ Konfiguration

### Hauptkonfigurationsdateien
- `tsconfig.json` - TypeScript-Konfiguration
- `vite.config.ts` - Build-Tool-Konfiguration  
- `package.json` - Abhängigkeiten und Skripte
- `src/modules/core/Config.ts` - Anwendungs-Konfiguration

### Asset-Konfiguration
- `assets/biomes/biomeConfig.js` - Biome-Konfiguration
- `assets/config/colors.js` - Farb-Paletten
- `assets/peoples/peoples.json` - Völker-Definitionen

## 🎯 Verwendung

### Editor-Suite verwenden
1. **Tile Editor**: `modules/tileEditor/tileEditor.html`
2. **Character Editor**: `modules/characterEditor/characterEditor.html`
3. **Item Editor**: `modules/itemEditor/itemEditor.html`
4. **Hex Map Editor**: `modules/hexMapEditor/index.html`

### API verwenden
```typescript
import { CoreModule, GameModule, UIModule } from './src/modules';

// Core-System initialisieren
const core = new CoreModule();
await core.initialize();

// Game-System starten
const game = new GameModule(core);
game.start();

// UI-System rendern
const ui = new UIModule(core, game);
ui.render();
```

## 🔧 Erweiterte Features

### Modulare Architektur
- **Austauschbare Module**: Jedes Modul kann durch eine Variante ersetzt werden
- **Plugin-System**: Erweiterte Funktionalität durch Plugins
- **Event-basierte Kommunikation**: Lose gekoppelte Module

### Performance-Optimierungen
- **Asset-Caching**: Intelligentes Caching für bessere Performance
- **Lazy Loading**: Module werden nur bei Bedarf geladen
- **Canvas-Optimierung**: Effizientes Rendering für große Hex-Grids

### Debugging & Entwicklung
- **Umfassende Debug-Tools**: Debug-Modi für alle Module
- **Hot-Reload**: Automatisches Neuladen bei Änderungen
- **TypeScript-Unterstützung**: Vollständige Typsicherheit

## 📋 Roadmap

### Version 1.7 (Geplant)
- [ ] Erweiterte AI-Systeme
- [ ] Multiplayer-Unterstützung
- [ ] Erweiterte Asset-Pipeline
- [ ] Performance-Optimierungen

### Version 2.0 (Zukunft)
- [ ] 3D-Rendering-Unterstützung
- [ ] Erweiterte Physik-Engine
- [ ] Mod-Support
- [ ] Cloud-Synchronisation

## 🤝 Beitragen

### Entwicklungsumgebung einrichten
1. Repository forken
2. Feature-Branch erstellen
3. Änderungen implementieren
4. Tests schreiben
5. Pull Request erstellen

### Code-Standards
- TypeScript für alle neuen Module
- Strikte Modul-Trennung einhalten
- Umfassende Dokumentation
- Unit-Tests für Core-Funktionalität

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten.

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues verwenden
- Dokumentation in den jeweiligen Modulen konsultieren
- Debug-Tools für Fehleranalyse nutzen

---

**WoodChunk 1.6.1** - Professionelle Hex-Grid-Spiel-Engine mit vollständiger Editor-Suite
