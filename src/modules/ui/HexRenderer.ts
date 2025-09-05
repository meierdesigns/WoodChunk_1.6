import { HexTile, Position, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class HexRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 60;
  private orientation: 'flat' | 'pointy' = 'flat';
  private camera: { x: number; y: number; zoom: number } = { x: 0, y: 0, zoom: 1 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    console.debug('[ui/HexRenderer] Hex renderer initialized');
  }

  setTileSize(size: number): void {
    this.tileSize = size;
    console.debug(`[ui/HexRenderer] Tile size set to ${size}`);
  }

  setOrientation(orientation: 'flat' | 'pointy'): void {
    this.orientation = orientation;
    console.debug(`[ui/HexRenderer] Orientation set to ${orientation}`);
  }

  setCamera(x: number, y: number, zoom: number): void {
    this.camera = { x, y, zoom };
    console.debug(`[ui/HexRenderer] Camera updated: ${x}, ${y}, ${zoom}`);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderHexGrid(tiles: HexTile[]): void {
    this.clear();
    
    for (const tile of tiles) {
      this.renderHex(tile);
    }
    
    console.debug(`[ui/HexRenderer] Rendered ${tiles.length} hex tiles`);
  }

  private renderHex(tile: HexTile): void {
    const pixelPos = this.hexToPixel(tile.position);
    const corners = this.getHexCorners(pixelPos);
    
    // Apply camera transform
    const transformedCorners = corners.map(corner => ({
      x: (corner.x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
      y: (corner.y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
    }));
    
    // Draw hex
    this.ctx.beginPath();
    this.ctx.moveTo(transformedCorners[0].x, transformedCorners[0].y);
    
    for (let i = 1; i < transformedCorners.length; i++) {
      this.ctx.lineTo(transformedCorners[i].x, transformedCorners[i].y);
    }
    
    this.ctx.closePath();
    
    // Set fill color based on tile type
    this.ctx.fillStyle = this.getTileColor(tile.type);
    this.ctx.fill();
    
    // Draw border
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Draw tile info
    this.drawTileInfo(tile, transformedCorners[0]);
  }

  private hexToPixel(hex: Position): { x: number; y: number } {
    if (this.orientation === 'flat') {
      const x = this.tileSize * (Math.sqrt(3) * hex.x + Math.sqrt(3) / 2 * hex.y);
      const y = this.tileSize * (3 / 2 * hex.y);
      return { x: Math.round(x), y: Math.round(y) };
    } else {
      const x = this.tileSize * (3 / 2 * hex.x);
      const y = this.tileSize * (Math.sqrt(3) / 2 * hex.x + Math.sqrt(3) * hex.y);
      return { x: Math.round(x), y: Math.round(y) };
    }
  }

  private getHexCorners(center: { x: number; y: number }): { x: number; y: number }[] {
    const corners: { x: number; y: number }[] = [];
    const angleStep = Math.PI / 3;
    
    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep;
      const x = center.x + this.tileSize * Math.cos(angle);
      const y = center.y + this.tileSize * Math.sin(angle);
      corners.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    return corners;
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'forest': return '#2d5a27';
      case 'mountain': return '#8b7355';
      case 'water': return '#4a90e2';
      case 'desert': return '#f4d03f';
      case 'city': return '#95a5a6';
      default: return '#7f8c8d';
    }
  }

  private drawTileInfo(tile: HexTile, position: { x: number; y: number }): void {
    if (this.camera.zoom < 0.5) return; // Don't draw text when zoomed out
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    const text = `${tile.position.x},${tile.position.y}`;
    this.ctx.fillText(text, position.x, position.y + 4);
  }

  renderSelection(position: Position): void {
    const pixelPos = this.hexToPixel(position);
    const corners = this.getHexCorners(pixelPos);
    
    // Apply camera transform
    const transformedCorners = corners.map(corner => ({
      x: (corner.x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
      y: (corner.y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
    }));
    
    // Draw selection highlight
    this.ctx.beginPath();
    this.ctx.moveTo(transformedCorners[0].x, transformedCorners[0].y);
    
    for (let i = 1; i < transformedCorners.length; i++) {
      this.ctx.lineTo(transformedCorners[i].x, transformedCorners[i].y);
    }
    
    this.ctx.closePath();
    
    this.ctx.strokeStyle = '#ff0';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  renderPath(path: Position[]): void {
    if (path.length < 2) return;
    
    this.ctx.strokeStyle = '#0f0';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    for (let i = 0; i < path.length - 1; i++) {
      const start = this.hexToPixel(path[i]);
      const end = this.hexToPixel(path[i + 1]);
      
      const startTransformed = {
        x: (start.x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
        y: (start.y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
      };
      
      const endTransformed = {
        x: (end.x - this.camera.x) * this.camera.zoom + this.canvas.width / 2,
        y: (end.y - this.camera.y) * this.camera.zoom + this.canvas.height / 2
      };
      
      this.ctx.moveTo(startTransformed.x, startTransformed.y);
      this.ctx.lineTo(endTransformed.x, endTransformed.y);
    }
    
    this.ctx.stroke();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    console.debug(`[ui/HexRenderer] Canvas resized to ${width}x${height}`);
  }
}
