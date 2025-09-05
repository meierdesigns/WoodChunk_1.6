export * from './AssetManager';
export * from './Config';
export * from './CoreModule';
export * from './EventBus';
export * from './HexGeometry';
export * from './MapTemplate';
export * from './NavigationManager';
export * from './SettingsManager';
export * from './TileManager';

// Cache busting utility for Buildings images
import { addCacheBusting } from '../../shared/types';

export const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};
