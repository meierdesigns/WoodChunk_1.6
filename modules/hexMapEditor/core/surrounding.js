// Umgebungsprüfungs-Modul
class SurroundingChecker {
    constructor(core, renderer) {
        this.core = core;
        this.renderer = renderer;
        this.isActive = false;
        this.selectedTile = null;
        this.surroundingTiles = [];
        
        this.setupEventListeners();
    }
    
    // Hilfsfunktion für pixel-perfekte Koordinaten
    snapToPixel(x, y) {
        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    // Hilfsfunktion für pixel-perfekte Hexagon-Punkte
    snapHexPoints(pixelPos, points) {
        // Da pixelPos und points bereits pixel-perfekt sind, verwende sie direkt
        return points.map(point => ({
            x: pixelPos.x + point.x,
            y: pixelPos.y + point.y
        }));
    }
    
    setupEventListeners() {
        // Höre auf Core-Events
        this.core.addObserver(this);
    }
    
    toggle() {
        this.isActive = !this.isActive;
        if (!this.isActive) {
            this.clearSurrounding();
        }
        this.renderer.render();
    }
    
    setSelectedTile(q, r) {
        if (!this.isActive) return;
        
        console.log('[SurroundingChecker] Setting selected tile:', q, r);
        this.selectedTile = new HexPosition(q, r);
        this.calculateSurrounding(q, r);
        console.log('[SurroundingChecker] Surrounding tiles:', this.surroundingTiles.length);
        this.renderer.render();
    }
    
    calculateSurrounding(q, r) {
        this.surroundingTiles = [];
        
        // Die 6 benachbarten Hexagon-Positionen
        const neighbors = [
            new HexPosition(q + 1, r),     // Rechts
            new HexPosition(q + 1, r - 1), // Rechts oben
            new HexPosition(q, r - 1),     // Oben
            new HexPosition(q - 1, r),     // Links
            new HexPosition(q - 1, r + 1), // Links unten
            new HexPosition(q, r + 1)      // Unten
        ];
        
        neighbors.forEach(pos => {
            const tile = this.core.getTileAt(pos.q, pos.r);
            if (tile) {
                this.surroundingTiles.push({
                    position: pos,
                    tile: tile,
                    distance: 1
                });
            }
        });
        
        // Optional: Erweiterte Umgebung (2 Felder entfernt)
        if (this.core.settings.showExtendedSurrounding) {
            this.calculateExtendedSurrounding(q, r);
        }
        
        // Optional: Dritte Ebene (3 Felder entfernt)
        if (this.core.settings.showThirdLevelSurrounding) {
            this.calculateThirdLevelSurrounding(q, r);
        }
    }
    
    calculateExtendedSurrounding(q, r) {
        // Hexagonale Distanzberechnung für Ebene 2
        const extendedNeighbors = [];
        
        // Alle Positionen mit hexagonale Distanz 2 vom Zentrum
        for (let dq = -2; dq <= 2; dq++) {
            for (let dr = -2; dr <= 2; dr++) {
                // Hexagonale Distanz: max(|dq|, |dr|, |dq + dr|)
                const hexDistance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                if (hexDistance === 2) {
                    const pos = new HexPosition(q + dq, r + dr);
                    const tile = this.core.getTileAt(pos.q, pos.r);
                    if (tile) {
                        extendedNeighbors.push({
                            position: pos,
                            tile: tile,
                            distance: 2
                        });
                    }
                }
            }
        }
        
        extendedNeighbors.forEach(item => {
            this.surroundingTiles.push(item);
        });
    }
    
    calculateThirdLevelSurrounding(q, r) {
        // Hexagonale Distanzberechnung für Ebene 3
        const thirdLevelNeighbors = [];
        
        // Alle Positionen mit hexagonale Distanz 3 vom Zentrum
        for (let dq = -3; dq <= 3; dq++) {
            for (let dr = -3; dr <= 3; dr++) {
                // Hexagonale Distanz: max(|dq|, |dr|, |dq + dr|)
                const hexDistance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
                if (hexDistance === 3) {
                    const pos = new HexPosition(q + dq, r + dr);
                    const tile = this.core.getTileAt(pos.q, pos.r);
                    if (tile) {
                        thirdLevelNeighbors.push({
                            position: pos,
                            tile: tile,
                            distance: 3
                        });
                    }
                }
            }
        }
        
        thirdLevelNeighbors.forEach(item => {
            this.surroundingTiles.push(item);
        });
    }
    
    clearSurrounding() {
        this.selectedTile = null;
        this.surroundingTiles = [];
    }
    
    renderSurrounding(ctx, hexSize, horizontalSpacing, verticalSpacing) {
        if (!this.isActive || !this.selectedTile) return;
        
        // Zeichne das ausgewählte Feld hervorgehoben
        this.renderSelectedTile(ctx, hexSize, horizontalSpacing, verticalSpacing);
        
        // Zeichne die umgebenden Felder
        this.surroundingTiles.forEach(surrounding => {
            this.renderSurroundingTile(ctx, surrounding, hexSize, horizontalSpacing, verticalSpacing);
        });
    }
    
    renderSelectedTile(ctx, hexSize, horizontalSpacing, verticalSpacing) {
        const pixelPos = hexToPixel(this.selectedTile, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
        const points = getHexPoints(hexSize, this.core.settings.rotation);
        
        // Zeichne einen hellen Hintergrund für das zentrale Tile mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        ctx.beginPath();
        ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        
        for (let i = 1; i < snappedPoints.length; i++) {
            ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        ctx.closePath();
        
        ctx.fillStyle = '#FFFACD'; // Helles Gold für das gesamte Tile
        ctx.fill();
        
        // Zeichne einen leuchtenden Rand um das ausgewählte Feld mit pixel-perfekten Koordinaten
        ctx.beginPath();
        ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        
        for (let i = 1; i < snappedPoints.length; i++) {
            ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        ctx.closePath();
        
        ctx.strokeStyle = '#FFD700'; // Gold
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Zeichne "0" für das zentrale Feld
        ctx.fillStyle = '#000';
        ctx.font = `${Math.max(12, hexSize / 4)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0', pixelPos.x, pixelPos.y);
    }
    
    renderSurroundingTile(ctx, surrounding, hexSize, horizontalSpacing, verticalSpacing) {
        const pixelPos = hexToPixel(surrounding.position, hexSize, horizontalSpacing, verticalSpacing, this.core.settings.layoutRotation);
        const points = getHexPoints(hexSize, this.core.settings.rotation);
        
        // Zeichne einen farbigen Hintergrund für umgebende Felder mit pixel-perfekten Koordinaten
        const snappedPoints = this.snapHexPoints(pixelPos, points);
        ctx.beginPath();
        ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        
        for (let i = 1; i < snappedPoints.length; i++) {
            ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        ctx.closePath();
        
        // Verschiedene Hintergrundfarben je nach Entfernung
        if (surrounding.distance === 1) {
            ctx.fillStyle = '#90EE90'; // Helles Grün
        } else if (surrounding.distance === 2) {
            ctx.fillStyle = '#FFD580'; // Helles Orange
        } else if (surrounding.distance === 3) {
            ctx.fillStyle = '#FFB6C1'; // Helles Pink
        }
        
        ctx.fill();
        
        // Zeichne einen farbigen Rand um umgebende Felder mit pixel-perfekten Koordinaten
        ctx.beginPath();
        ctx.moveTo(snappedPoints[0].x, snappedPoints[0].y);
        
        for (let i = 1; i < snappedPoints.length; i++) {
            ctx.lineTo(snappedPoints[i].x, snappedPoints[i].y);
        }
        ctx.closePath();
        
        // Verschiedene Randfarben je nach Entfernung
        if (surrounding.distance === 1) {
            ctx.strokeStyle = '#00FF00'; // Grün für direkte Nachbarn
            ctx.lineWidth = 3;
        } else if (surrounding.distance === 2) {
            ctx.strokeStyle = '#FFA500'; // Orange für erweiterte Umgebung
            ctx.lineWidth = 2;
        } else if (surrounding.distance === 3) {
            ctx.strokeStyle = '#FF69B4'; // Pink für dritte Ebene
            ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        
        // Zeichne Ebenen-Nummer
        ctx.fillStyle = '#000';
        ctx.font = `${Math.max(10, hexSize / 5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(surrounding.distance.toString(), pixelPos.x, pixelPos.y);
    }
    
    onEvent(event, data) {
        switch (event) {
            case 'tileChanged':
                // Wenn sich ein Tile ändert, aktualisiere die Umgebung
                if (this.isActive && this.selectedTile) {
                    this.calculateSurrounding(this.selectedTile.q, this.selectedTile.r);
                }
                break;
        }
    }
    
    getSurroundingInfo() {
        if (!this.isActive || !this.selectedTile) return null;
        
        return {
            selected: this.selectedTile,
            surrounding: this.surroundingTiles.map(s => ({
                position: s.position,
                type: s.tile.type,
                distance: s.distance
            }))
        };
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.SurroundingChecker = SurroundingChecker;
}

// Globale Variable für andere Module (Fallback)
window.SurroundingChecker = SurroundingChecker;
