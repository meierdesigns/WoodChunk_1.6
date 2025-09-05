import { HexGeometry as IHexGeometry, Position, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class HexGeometry implements IHexGeometry {
  private size: number = 60;
  private orientation: 'flat' | 'pointy' = 'flat';

  constructor(size: number = 60, orientation: 'flat' | 'pointy' = 'flat') {
    this.size = size;
    this.orientation = orientation;
    console.debug(`[core/HexGeometry] Initialized with size ${size}, orientation ${orientation}`);
  }

  pixelToHex(x: number, y: number): Position {
    if (this.orientation === 'flat') {
      return this.pixelToHexFlat(x, y);
    } else {
      return this.pixelToHexPointy(x, y);
    }
  }

  hexToPixel(hex: Position): { x: number; y: number } {
    if (this.orientation === 'flat') {
      return this.hexToPixelFlat(hex);
    } else {
      return this.hexToPixelPointy(hex);
    }
  }

  getHexCorners(center: Position, size: number = this.size): Position[] {
    const corners: Position[] = [];
    const angleStep = Math.PI / 3;
    
    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep;
      const x = center.x + size * Math.cos(angle);
      const y = center.y + size * Math.sin(angle);
      corners.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    return corners;
  }

  private pixelToHexFlat(x: number, y: number): Position {
    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / this.size;
    const r = (2 / 3 * y) / this.size;
    return this.roundHex(q, r);
  }

  private pixelToHexPointy(x: number, y: number): Position {
    const q = (2 / 3 * x) / this.size;
    const r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / this.size;
    return this.roundHex(q, r);
  }

  private hexToPixelFlat(hex: Position): { x: number; y: number } {
    const x = this.size * (Math.sqrt(3) * hex.x + Math.sqrt(3) / 2 * hex.y);
    const y = this.size * (3 / 2 * hex.y);
    return { x: Math.round(x), y: Math.round(y) };
  }

  private hexToPixelPointy(hex: Position): { x: number; y: number } {
    const x = this.size * (3 / 2 * hex.x);
    const y = this.size * (Math.sqrt(3) / 2 * hex.x + Math.sqrt(3) * hex.y);
    return { x: Math.round(x), y: Math.round(y) };
  }

  private roundHex(q: number, r: number): Position {
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
    
    return { x: rq, y: rr };
  }

  getNeighborOffsets(): Position[] {
    if (this.orientation === 'flat') {
      return [
        { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 },
        { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }
      ];
    } else {
      return [
        { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }
      ];
    }
  }

  getDistance(pos1: Position, pos2: Position): number {
    return (Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.x + pos1.y - pos2.x - pos2.y)) / 2;
  }

  setSize(size: number): void {
    this.size = size;
    console.debug(`[core/HexGeometry] Size updated to ${size}`);
  }

  setOrientation(orientation: 'flat' | 'pointy'): void {
    this.orientation = orientation;
    console.debug(`[core/HexGeometry] Orientation updated to ${orientation}`);
  }
}
