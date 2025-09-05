# Modularer Map Editor - Browser-Version

Ein platzsparender, modularer Map Editor basierend auf JavaScript mit Canvas-Rendering. **Keine Node.js-Abhängigkeiten erforderlich!**

## Features

- **Modulare Architektur**: Klare Trennung zwischen Core, Renderer und UI
- **Hexagon-Grid**: Vollständig anpassbare Hexagon-Karten
- **Echtzeit-Bearbeitung**: Klicken und Zeichnen auf der Karte
- **Verschiedene Terrain-Typen**: Gras, Wasser, Berge, Wald, Wüste, Schnee
- **Anpassbare Einstellungen**: Größe, Abstände, Rotation, Zoom
- **Speichern/Laden**: Lokale Speicherung der Karten
- **Export**: PNG-Export der erstellten Karten

## Modulstruktur

```
src/
├── core.js          # Geschäftslogik und Datenverwaltung
├── renderer.js      # Canvas-Rendering und Interaktion
├── ui.js           # Benutzeroberfläche und Steuerelemente
├── types.js        # Datentypen und Konstanten
├── utils.js        # Hilfsfunktionen für Hexagon-Berechnungen
└── main.js         # Hauptanwendung und Modul-Integration
```

## Installation

**Keine Installation erforderlich!**

1. Lade alle Dateien herunter
2. Öffne `index.html` direkt in deinem Browser
3. Fertig!

## Verwendung

- **Zeichnen**: Wählen Sie einen Terrain-Typ und klicken Sie auf Hexagone
- **Bewegen**: Ziehen Sie mit der Maus, um die Karte zu verschieben
- **Zoomen**: Verwenden Sie das Mausrad zum Zoomen
- **Einstellungen**: Passen Sie Hexagon-Größe, Abstände und andere Parameter an
- **Speichern**: Klicken Sie auf "Speichern" um Ihre Arbeit zu sichern

## Technische Details

- **Canvas-basiert**: Schnelle Rendering-Performance
- **Reines JavaScript**: Keine Build-Tools oder Module-Bundler erforderlich
- **Observer-Pattern**: Lose Kopplung zwischen Modulen
- **Responsive Design**: Passt sich verschiedenen Bildschirmgrößen an
- **Lokale Speicherung**: Verwendet localStorage für Karten-Daten

## Browser-Kompatibilität

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Vorteile der Browser-Version

✅ **Keine Installation** - Funktioniert sofort  
✅ **Keine Abhängigkeiten** - Läuft überall  
✅ **Portabel** - Kann auf USB-Stick mitgenommen werden  
✅ **Einfach zu verteilen** - Nur Dateien kopieren  
✅ **Schneller Start** - Kein Build-Prozess  
✅ **Offline-fähig** - Funktioniert ohne Internet
