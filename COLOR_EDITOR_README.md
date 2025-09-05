# 🎨 Color Editor - WoodChunk 1.5

Der Color Editor ermöglicht es dir, alle Farben des Spiels zentral zu bearbeiten und anzupassen.

## 📁 Dateien

- `colorEditor.html` - Hauptseite des Color Editors
- `assets/config/colors.js` - Zentrale Farbkonfiguration
- `modules/colorEditor/colorEditor.css` - Styling
- `modules/colorEditor/colorEditor.js` - Funktionalität

## 🚀 Verwendung

1. Öffne `colorEditor.html` in deinem Browser
2. Wähle eine Farbkategorie aus der linken Seitenleiste
3. Klicke auf die Farbfelder, um sie zu ändern
4. Nutze die Steuerungselemente für Import/Export

## 🎯 Farbkategorien

### Biomes
- **Forest** - Waldbiome (#4CAF50)
- **Mountains** - Gebirge (#795548)
- **Water** - Gewässer (#2196F3)
- **Desert** - Wüste (#FF9800)
- **Swamp** - Sumpf (#8BC34A)
- **Plain** - Ebene (#CDDC39)
- **Jungle** - Dschungel (#388E3C)
- **Badlands** - Ödland (#8D6E63)
- **Snow** - Schnee (#FFFFFF)
- **Ocean** - Ozean (#1976D2)
- **Coast** - Küste (#03DAC6)
- **Unassigned** - Nicht zugeordnet (#9E9E9E)

### Terrain
- **Grass** - Gras (#4CAF50)
- **Stone** - Stein (#795548)
- **Sand** - Sand (#FFC107)
- **Mud** - Schlamm (#8D6E63)
- **Ice** - Eis (#E3F2FD)
- **Lava** - Lava (#F44336)
- **Crystal** - Kristall (#E1BEE7)
- **Metal** - Metall (#9E9E9E)

### UI (Benutzeroberfläche)
- **Primary** - Primärfarbe (#2196F3)
- **Secondary** - Sekundärfarbe (#FF9800)
- **Success** - Erfolg (#4CAF50)
- **Warning** - Warnung (#FFC107)
- **Error** - Fehler (#F44336)
- **Info** - Information (#00BCD4)
- **Light** - Hell (#FAFAFA)
- **Dark** - Dunkel (#212121)
- **Background** - Hintergrund (#FFFFFF)
- **Surface** - Oberfläche (#F5F5F5)
- **Text** - Text (#212121)
- **TextSecondary** - Sekundärer Text (#757575)

### Status
- **Health** - Gesundheit (#F44336)
- **Mana** - Mana (#2196F3)
- **Stamina** - Ausdauer (#FF9800)
- **Experience** - Erfahrung (#4CAF50)
- **Level** - Level (#9C27B0)

### Seltenheit
- **Common** - Gewöhnlich (#9E9E9E)
- **Uncommon** - Ungewöhnlich (#4CAF50)
- **Rare** - Selten (#2196F3)
- **Epic** - Episch (#9C27B0)
- **Legendary** - Legendär (#FF9800)
- **Mythical** - Mythisch (#F44336)

### Kampf
- **Damage** - Schaden (#F44336)
- **Healing** - Heilung (#4CAF50)
- **Buff** - Verstärkung (#2196F3)
- **Debuff** - Schwächung (#FF9800)
- **Critical** - Kritisch (#E91E63)
- **Miss** - Verfehlt (#9E9E9E)

### Wetter/Zeit
- **Day** - Tag (#FFEB3B)
- **Night** - Nacht (#3F51B5)
- **Rain** - Regen (#607D8B)
- **Storm** - Sturm (#424242)
- **Fog** - Nebel (#E0E0E0)
- **Clear** - Klar (#87CEEB)

### Ressourcen
- **Wood** - Holz (#8D6E63)
- **Stone** - Stein (#795548)
- **Iron** - Eisen (#9E9E9E)
- **Gold** - Gold (#FFD700)
- **Silver** - Silber (#C0C0C0)
- **Copper** - Kupfer (#CD7F32)
- **Crystal** - Kristall (#E1BEE7)
- **Gem** - Edelstein (#E91E63)

## 🔧 Funktionen

### Farben bearbeiten
- Klicke auf ein Farbfeld, um den Farbwähler zu öffnen
- Wähle eine neue Farbe aus
- Die Änderung wird sofort angewendet

### Import/Export
- **Export**: Speichert alle aktuellen Farben als JSON-Datei
- **Import**: Lädt Farben aus einer JSON-Datei
- **Reset**: Setzt alle Farben auf Standardwerte zurück

### Vorschau
- Zeigt alle Farben in einer übersichtlichen Vorschau an
- Hilft bei der Beurteilung der Farbkombinationen

## 📱 Integration

Der Color Editor ist in das bestehende Spiel integriert:

- **Biome Editor**: Verwendet Biome-Farben
- **Tile Editor**: Verwendet Terrain-Farben
- **HexMap Editor**: Verwendet Biome- und Terrain-Farben
- **Asset Manager**: Verwendet UI- und Status-Farben

## 🎨 Farben anpassen

### Einzelne Farben
```javascript
setColor('biomes', 'forest', '#00FF00'); // Wald grün machen
setColor('ui', 'primary', '#FF0000');    // Primärfarbe rot machen
```

### Alle Farben einer Kategorie
```javascript
const biomeColors = getCategoryColors('biomes');
console.log(biomeColors);
```

### Farben exportieren
```javascript
const allColors = exportColors();
console.log(JSON.stringify(allColors, null, 2));
```

## 🔄 Events

Der Color Editor löst Events aus, wenn sich Farben ändern:

```javascript
window.addEventListener('colorChanged', (e) => {
    console.log('Farbe geändert:', e.detail);
    // e.detail.category, e.detail.name, e.detail.color
});

window.addEventListener('colorsImported', () => {
    console.log('Farben importiert');
});

window.addEventListener('colorsReset', () => {
    console.log('Farben zurückgesetzt');
});
```

## 📝 Hinweise

- Alle Farben werden im Browser gespeichert
- Änderungen sind sofort sichtbar
- Export/Import ermöglicht das Sichern und Wiederherstellen von Farbschemata
- Der Color Editor funktioniert unabhängig vom Hauptspiel
- Fallback-Farben werden verwendet, wenn das Farbsystem nicht geladen ist

## 🎯 Nächste Schritte

- Erstelle eigene Farbschemata
- Experimentiere mit verschiedenen Farbkombinationen
- Exportiere deine Lieblingsfarben
- Teile Farbschemata mit anderen Spielern
