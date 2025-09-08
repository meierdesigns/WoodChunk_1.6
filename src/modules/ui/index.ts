export * from './UIModule';
export * from './HexRenderer';
export * from './CameraController';
export * from './MainCard';
export * from './MainMenu';
export * from './MapEditor';
export * from './ItemEditor';
export * from './PeopleEditor';
export * from './CharacterEditor';
export * from './Settings';
export * from './TileInspector';

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

