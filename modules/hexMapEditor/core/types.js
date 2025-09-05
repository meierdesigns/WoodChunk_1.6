// Typen für den Map Editor
const TileTypes = {
    GRASS: 'grass',
    WATER: 'water',
    MOUNTAIN: 'mountain',
    FOREST: 'forest',
    DESERT: 'desert',
    SNOW: 'snow',
    VOID: 'void'
};

const TileColors = {
    [TileTypes.GRASS]: '#4CAF50',
    [TileTypes.WATER]: '#2196F3',
    [TileTypes.MOUNTAIN]: '#795548',
    [TileTypes.FOREST]: '#388E3C',
    [TileTypes.DESERT]: '#FF9800',
    [TileTypes.SNOW]: '#FFFFFF',
    [TileTypes.VOID]: '#000000'
};

class HexPosition {
    constructor(q, r) {
        this.q = q;
        this.r = r;
    }
}

class HexTile {
    constructor(position, type = TileTypes.GRASS) {
        this.position = position;
        this.type = type;
        this.color = TileColors[type];
    }
}

class MapSettings {
    constructor() {
        this.hexSize = 30;
        this.horizontalSpacing = 0; // Kein Abstand für perfekte Verbindung
        this.verticalSpacing = 0;   // Kein Abstand für perfekte Verbindung
        this.rotation = 0; // 0 Grad = Flat-Top
        this.layoutRotation = 0; // Keine Layout-Rotation für Flat-Top
        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 1;
        this.showOutlines = true;
        this.outlineWidth = 1; // Strichstärke der Ränder
        this.showCoordinates = false;
        this.showExtendedSurrounding = false;
        this.showThirdLevelSurrounding = false;
        this.expansionValue = 0;
        this.brushSize = 0;
        this.toolStrength = 50;
        this.toolRadius = 5;
        this.selectedBrush = 'single';
        this.selectedTerrainTool = null;
        this.selectedSpecialTool = null;
        this.defaultTileType = TileTypes.GRASS;
        this.settingsExpanded = true;
        this.toolsExpanded = true;
        this.layersExpanded = true;
        this.selectedTileType = TileTypes.GRASS;
        this.currentMode = 'paint';
        this.selectedBiome = null;
        this.buildingTransparency = 0.7;
        this.useNativeTransparency = true;
        this.debugMode = false;
        this.buildingScale = 0.8;
        this.maxTextureResolution = false;
        this.textureResolutionLimit = 512;
    }
}

// Hexagon-Geometrie-Funktionen
function hexToPixel(position, hexSize, horizontalSpacing, verticalSpacing, layoutRotation = 0) {
    // Verwende die konsistente Abstandsberechnung
    const { spacingX, spacingY } = calculateHexSpacing(hexSize, horizontalSpacing, verticalSpacing);
    
    // Korrekte hexagonale Positionierung für Flat-Top
    // Horizontale Position: q * spacingX
    // Vertikale Position: r * spacingY + q * (spacingY / 2)
    let x = position.q * spacingX;
    let y = position.r * spacingY + position.q * (spacingY / 2);
    
    // Runde zuerst auf pixel-perfekte Koordinaten
    x = Math.round(x);
    y = Math.round(y);
    
    // Layout-Rotation um den Ursprung (0,0) nach der Rundung
    if (layoutRotation !== 0) {
        const rotationRad = (layoutRotation * Math.PI) / 180;
        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);
        
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        
        x = Math.round(rotatedX);
        y = Math.round(rotatedY);
    }
    
    return { x, y };
}

// Hilfsfunktion für konsistente Abstandsberechnung
function calculateHexSpacing(hexSize, horizontalSpacing, verticalSpacing) {
    // Für Flat-Top-Hexagone: horizontale Distanz = 1.5 * hexSize, vertikale Distanz = hexSize * sqrt(3)
    return {
        spacingX: hexSize * 1.5 + (horizontalSpacing || 0),
        spacingY: hexSize * Math.sqrt(3) + (verticalSpacing || 0)
    };
}

// Hilfsfunktion für pixel-perfekte Rotation
function rotatePoint(x, y, angleDegrees, centerX = 0, centerY = 0) {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // Verschiebe zum Zentrum
    const dx = x - centerX;
    const dy = y - centerY;
    
    // Rotiere
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;
    
    // Verschiebe zurück und runde
    return {
        x: Math.round(rotatedX + centerX),
        y: Math.round(rotatedY + centerY)
    };
}

function pixelToHex(x, y, hexSize, horizontalSpacing, verticalSpacing, layoutRotation = 0) {
    let pixelX = Math.round(x);
    let pixelY = Math.round(y);
    
    // Layout-Rotation rückwärts anwenden (nach der Rundung)
    if (layoutRotation !== 0) {
        const rotationRad = (-layoutRotation * Math.PI) / 180;
        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);
        
        const rotatedX = pixelX * cos - pixelY * sin;
        const rotatedY = pixelX * sin + pixelY * cos;
        
        pixelX = Math.round(rotatedX);
        pixelY = Math.round(rotatedY);
    }
    
    // Verwende die konsistente Abstandsberechnung
    const { spacingX, spacingY } = calculateHexSpacing(hexSize, horizontalSpacing, verticalSpacing);
    
    // Berechne q und r direkt aus den Pixel-Koordinaten
    const q = pixelX / spacingX;
    const r = (pixelY - q * (spacingY / 2)) / spacingY;
    
    return hexRound(q, r);
}

function hexRound(q, r) {
    let s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);
    
    if (qDiff > rDiff && qDiff > sDiff) {
        rq = -rr - rs;
    } else if (rDiff > sDiff) {
        rr = -rq - rs;
    }
    
    return new HexPosition(rq, rr);
}

function getHexPoints(hexSize, rotation = 0) {
    const points = [];
    
    // Konvertiere Grad zu Radiant
    const rotationRad = (rotation * Math.PI) / 180;
    
    // Definiere die 6 Ecken eines Flat-Top-Hexagons mit korrekter Geometrie
    // Flat-Top-Hexagon: Breite = 2 * hexSize, Höhe = hexSize * sqrt(3)
    const width = hexSize * 2;
    const height = hexSize * Math.sqrt(3);
    
    // Berechne die 6 Ecken eines Flat-Top-Hexagons mit trigonometrischen Funktionen
    // Flat-Top-Hexagon: Spitze oben und unten, flache Seiten links und rechts
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 + rotation) * Math.PI / 180; // 60° zwischen den Ecken
        
        // Berechne Position basierend auf dem Radius (hexSize)
        const x = hexSize * Math.cos(angle);
        const y = hexSize * Math.sin(angle);
        
        // Runde auf pixel-perfekte Koordinaten
        const roundedX = Math.round(x);
        const roundedY = Math.round(y);
        
        points.push({ x: roundedX, y: roundedY });
    }
    
    return points;
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.HexTile = HexTile;
    window.HexPosition = HexPosition;
    window.MapSettings = MapSettings;
    window.TileTypes = TileTypes;
    window.TileColors = TileColors;
    window.hexToPixel = hexToPixel;
    window.pixelToHex = pixelToHex;
    window.hexRound = hexRound;
    window.getHexPoints = getHexPoints;
}
