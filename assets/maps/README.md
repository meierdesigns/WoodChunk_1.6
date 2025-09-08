# Maps Directory

This directory contains saved maps from the HexMapEditor.

## File Format

Each map is saved as a JSON file with the following structure:

```json
{
  "id": "unique_map_id",
  "name": "Map Name",
  "timestamp": 1234567890123,
  "data": {
    "tiles": [...],
    "settings": {...}
  },
  "tilesCount": 42,
  "settings": {...},
  "version": "1.0",
  "savedAt": "2024-01-01T12:00:00.000Z",
  "filename": "map_name.json",
  "filepath": "assets/maps/map_name.json"
}
```

## API Endpoints

- `GET /api/maps` - Load all saved maps
- `POST /api/maps/save` - Save a new map

## File Naming

Map names are sanitized for filesystem compatibility:
- Special characters are replaced with underscores
- Files are saved with `.json` extension
- Example: "My Test Map!" becomes "My_Test_Map_.json"
