import { Position, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class CameraController {
  private x: number = 0;
  private y: number = 0;
  private zoom: number = 1;
  private minZoom: number = 0.1;
  private maxZoom: number = 5;
  private isDragging: boolean = false;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
    console.debug('[ui/CameraController] Camera controller initialized');
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left click
      this.isDragging = true;
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.canvas.style.cursor = 'grabbing';
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMousePos.x;
      const deltaY = event.clientY - this.lastMousePos.y;
      
      this.x -= deltaX / this.zoom;
      this.y -= deltaY / this.zoom;
      
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.emitCameraChange();
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    }
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));
    
    if (newZoom !== this.zoom) {
      // Zoom towards mouse position
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const worldX = (mouseX - this.canvas.width / 2) / this.zoom + this.x;
      const worldY = (mouseY - this.canvas.height / 2) / this.zoom + this.y;
      
      this.zoom = newZoom;
      
      this.x = worldX - (mouseX - this.canvas.width / 2) / this.zoom;
      this.y = worldY - (mouseY - this.canvas.height / 2) / this.zoom;
      
      this.emitCameraChange();
    }
  }

  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.isDragging = true;
      const touch = event.touches[0];
      this.lastMousePos = { x: touch.clientX, y: touch.clientY };
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (this.isDragging && event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.lastMousePos.x;
      const deltaY = touch.clientY - this.lastMousePos.y;
      
      this.x -= deltaX / this.zoom;
      this.y -= deltaY / this.zoom;
      
      this.lastMousePos = { x: touch.clientX, y: touch.clientY };
      this.emitCameraChange();
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    this.isDragging = false;
  }

  private emitCameraChange(): void {
    // Dispatch custom event for camera changes
    this.canvas.dispatchEvent(new CustomEvent('cameraChange', {
      detail: { x: this.x, y: this.y, zoom: this.zoom }
    }));
  }

  // Public methods
  getPosition(): { x: number; y: number; zoom: number } {
    return { x: this.x, y: this.y, zoom: this.zoom };
  }

  setPosition(x: number, y: number, zoom?: number): void {
    this.x = x;
    this.y = y;
    if (zoom !== undefined) {
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }
    this.emitCameraChange();
    console.debug(`[ui/CameraController] Camera position set to ${x}, ${y}, ${this.zoom}`);
  }

  moveTo(position: Position): void {
    this.x = position.x;
    this.y = position.y;
    this.emitCameraChange();
    console.debug(`[ui/CameraController] Camera moved to ${position.x}, ${position.y}`);
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.emitCameraChange();
    console.debug(`[ui/CameraController] Zoom set to ${this.zoom}`);
  }

  zoomIn(factor: number = 1.2): void {
    this.setZoom(this.zoom * factor);
  }

  zoomOut(factor: number = 1.2): void {
    this.setZoom(this.zoom / factor);
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.emitCameraChange();
    console.debug('[ui/CameraController] Camera reset to origin');
  }

  fitToBounds(width: number, height: number, padding: number = 50): void {
    const scaleX = (this.canvas.width - padding * 2) / width;
    const scaleY = (this.canvas.height - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY);
    
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
    this.x = width / 2;
    this.y = height / 2;
    
    this.emitCameraChange();
    console.debug(`[ui/CameraController] Camera fitted to bounds ${width}x${height}`);
  }

  screenToWorld(screenX: number, screenY: number): Position {
    const worldX = (screenX - this.canvas.width / 2) / this.zoom + this.x;
    const worldY = (screenY - this.canvas.height / 2) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const screenX = (worldX - this.x) * this.zoom + this.canvas.width / 2;
    const screenY = (worldY - this.y) * this.zoom + this.canvas.height / 2;
    return { x: screenX, y: screenY };
  }

  getMinZoom(): number {
    return this.minZoom;
  }

  getMaxZoom(): number {
    return this.maxZoom;
  }

  setZoomLimits(min: number, max: number): void {
    this.minZoom = Math.max(0.01, min);
    this.maxZoom = Math.max(this.minZoom, max);
    console.debug(`[ui/CameraController] Zoom limits set to ${this.minZoom} - ${this.maxZoom}`);
  }
}
