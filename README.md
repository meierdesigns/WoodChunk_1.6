# WoodChunk 1.6

Modulare Spiel-Engine mit klarer Trennung von Core-, Game- und UI-Modulen.

## Architektur

### Module-Struktur
- **`core/`** - Geschäftslogik, Konfiguration, Datenmodelle
- **`game/`** - Spielsysteme, Mechaniken, Hex-Grid-Management
- **`ui/` - React-Komponenten, Rendering, Benutzeroberfläche
- **`shared/`** - Gemeinsame Typen und Interfaces

### Schnittstellen
Alle Module kommunizieren über typsichere Interfaces:
- `CoreAPI` - Core-System-Zugriff
- `GameAPI` - Spielzustand und -logik
- `UIAPI` - Benutzeroberfläche und Rendering

## Features

- **Hex-Grid-System** mit flachen und spitzen Hexagonen
- **Kamera-Steuerung** mit Zoom und Pan
- **Asset-Management** mit Caching
- **Event-System** für modulare Kommunikation
- **Einstellungsverwaltung** mit localStorage-Persistierung
- **Pfadfindung** mit A*-Algorithmus
- **Terrain-Generierung** für verschiedene Landschaftstypen

## Technologie-Stack

- **TypeScript** - Typsicherheit und bessere Entwicklererfahrung
- **React 18** - Moderne UI-Entwicklung
- **Vite** - Schnelle Build-Tools
- **Canvas API** - Effizientes 2D-Rendering

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build
npm run build

# Build-Vorschau
npm run preview
```

## Projektstruktur

```
src/
├── modules/
│   ├── core/           # Core-Systeme
│   │   ├── AssetManager.ts
│   │   ├── Config.ts
│   │   ├── CoreModule.ts
│   │   ├── EventBus.ts
│   │   ├── HexGeometry.ts
│   │   ├── MapTemplate.ts
│   │   ├── NavigationManager.ts
│   │   ├── SettingsManager.ts
│   │   └── TileManager.ts
│   ├── game/           # Spielsysteme
│   │   ├── GameModule.ts
│   │   └── HexGridManager.ts
│   └── ui/             # Benutzeroberfläche
│       ├── CameraController.ts
│       ├── HexRenderer.ts
│       └── UIModule.ts
├── shared/             # Gemeinsame Typen
│   └── types.ts
├── App.tsx             # Haupt-App-Komponente
├── main.tsx            # Einstiegspunkt
└── styles.css          # Basis-Styles
```

## Konfiguration

Die Anwendung kann über verschiedene Konfigurationsdateien angepasst werden:
- `tsconfig.json` - TypeScript-Konfiguration
- `vite.config.ts` - Build-Tool-Konfiguration
- `package.json` - Abhängigkeiten und Skripte

## Lizenz

Proprietär - Alle Rechte vorbehalten.
