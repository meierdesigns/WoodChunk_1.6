import { EventBus as IEventBus, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class EventBus implements IEventBus {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    console.debug(`[core/EventBus] Registered listener for event: ${event}`);
  }

  off(event: string, callback: Function): void {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      console.debug(`[core/EventBus] Removed listener for event: ${event}`);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.events.has(event)) return;
    
    const callbacks = this.events.get(event)!;
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[core/EventBus] Error in event handler for ${event}:`, error);
      }
    });
    console.debug(`[core/EventBus] Emitted event: ${event}`, data);
  }

  clear(): void {
    this.events.clear();
    console.debug('[core/EventBus] Cleared all event listeners');
  }
}
