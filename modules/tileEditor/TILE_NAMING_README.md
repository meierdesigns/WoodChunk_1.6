# Tile Naming System

## Übersicht

Das TileEditor-System wurde erweitert, um sicherzustellen, dass die Bilddateien in den Tiles-Ordnern den Namen haben, der ihnen im Editor gegeben wurde.

## Funktionalität

### 1. Automatische Namensgebung bei Upload
- **Vorher:** Dateien wurden mit generischen Namen wie `tile_1234567890.png` gespeichert
- **Jetzt:** Dateien werden mit dem bereinigten Tile-Namen gespeichert (z.B. `haus_1.png`)

### 2. Namensänderung bei Tile-Bearbeitung
- Wenn der Name eines Tiles im Editor geändert wird, wird auch die Bilddatei entsprechend umbenannt
- Die Änderung wird sowohl in der Datenbank als auch auf dem Dateisystem durchgeführt

### 3. Dateiname-Bereinigung
- Ungültige Zeichen werden durch Unterstriche ersetzt
- Leerzeichen werden zu Unterstrichen
- Mehrfache Unterstriche werden zu einzelnen Unterstrichen
- Alle Namen werden in Kleinbuchstaben umgewandelt

## Technische Details

### Dateiname-Sanitierung
```javascript
sanitizeFileName(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, '_') // Ungültige Zeichen
        .replace(/\s+/g, '_') // Leerzeichen
        .replace(/_{2,}/g, '_') // Mehrfache Unterstriche
        .replace(/^_+|_+$/g, '') // Führende/abschließende Unterstriche
        .toLowerCase(); // Kleinbuchstaben
}
```

### API-Endpunkte
- `POST /api/rename-tile-file` - Datei umbenennen
- `POST /api/upload-biome-image` - Neue Bilddatei hochladen
- `GET /api/scan-biome-images` - Bilder in Biome-Ordner scannen

### Beispiel-Transformationen
| Original-Name | Bereinigter Dateiname |
|---------------|----------------------|
| "Haus 1" | `haus_1.png` |
| "Tower of Power!" | `tower_of_power.png` |
| "Castle (Main)" | `castle_main.png` |
| "Temple/Shrine" | `temple_shrine.png` |

## Verwendung

### 1. API-Server starten
```bash
# Windows
start_api_server.bat

# Oder manuell
python api_server.py
```

### 2. Tile erstellen/bearbeiten
1. Öffne den TileEditor
2. Erstelle ein neues Tile oder bearbeite ein bestehendes
3. Gib einen Namen ein
4. Speichere das Tile
5. Die Bilddatei wird automatisch entsprechend benannt

### 3. Namensänderung
1. Bearbeite ein bestehendes Tile
2. Ändere den Namen
3. Speichere die Änderungen
4. Die Bilddatei wird automatisch umbenannt

## Fehlerbehandlung

### Fallback-Mechanismus
- Wenn das Umbenennen fehlschlägt, wird die ursprüngliche Datei beibehalten
- Eine Warnung wird in der Konsole ausgegeben
- Das Tile funktioniert weiterhin mit dem ursprünglichen Dateinamen

### Validierung
- Alle Dateinamen werden auf ungültige Zeichen geprüft
- Leere Namen werden abgelehnt
- Duplikate werden erkannt und behandelt

## Sicherheit

### Dateisystem-Operationen
- Alle Pfade werden validiert
- Relative Pfade werden verwendet
- Verzeichnisse werden bei Bedarf erstellt
- Fehler werden abgefangen und protokolliert

### API-Sicherheit
- Eingabedaten werden validiert
- Fehler werden ordnungsgemäß behandelt
- Logging für Debugging-Zwecke

## Kompatibilität

### Bestehende Tiles
- Bestehende Tiles mit generischen Namen funktionieren weiterhin
- Bei der nächsten Bearbeitung werden sie umbenannt
- Keine Datenverluste

### Dateiformate
- Unterstützt alle gängigen Bildformate (PNG, JPG, GIF, etc.)
- Dateiendungen werden beibehalten
- Nur der Name wird geändert

## Troubleshooting

### Häufige Probleme

1. **API-Server nicht erreichbar**
   - Prüfe ob der Server auf Port 8081 läuft
   - Starte `start_api_server.bat` neu

2. **Datei kann nicht umbenannt werden**
   - Prüfe Dateiberechtigungen
   - Stelle sicher, dass die Datei nicht in Verwendung ist

3. **Ungültige Zeichen im Namen**
   - Das System bereinigt automatisch ungültige Zeichen
   - Prüfe die Konsole für Warnungen

### Debugging
- Alle Operationen werden in der Konsole protokolliert
- API-Server zeigt detaillierte Logs
- Browser-Entwicklertools zeigen Netzwerk-Anfragen

## Zukunft

### Geplante Erweiterungen
- Batch-Umbenennung für mehrere Tiles
- Import/Export von Namenskonventionen
- Erweiterte Validierungsregeln
- Backup vor Umbenennung
