import { UIAPI, MainCard, MainMenu, MapEditor, ItemEditor, PeopleEditor, CharacterEditor, Settings, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class UIModule implements UIAPI {
  private mainCard: MainCard;
  private mainMenu: MainMenu;
  private mapEditor: MapEditor;
  private itemEditor: ItemEditor;
  private peopleEditor: PeopleEditor;
  private characterEditor: CharacterEditor;
  private settings: Settings;


  constructor() {
    console.debug('[ui/UIModule] Initializing UIModule');
  }

  render(): void {
    console.debug('[ui/UIModule] Rendering UI');
    // UI rendering logic will be implemented
  }

  update(): void {
    // UI update logic will be implemented
  }

  getMainCard(): MainCard {
    return this.mainCard;
  }

  getMainMenu(): MainMenu {
    return this.mainMenu;
  }

  getMapEditor(): MapEditor {
    return this.mapEditor;
  }

  getItemEditor(): ItemEditor {
    return this.itemEditor;
  }

  getPeopleEditor(): PeopleEditor {
    return this.peopleEditor;
  }

  getCharacterEditor(): CharacterEditor {
    return this.characterEditor;
  }

  getSettings(): Settings {
    return this.settings;
  }



  initialize(): void {
    console.debug('[ui/UIModule] Initializing UI components');
    
    // Initialize all UI components
    this.mainCard = new MainCardImpl();
    this.mainMenu = new MainMenuImpl();
    this.mapEditor = new MapEditorImpl();
    this.itemEditor = new ItemEditorImpl();
    this.peopleEditor = new PeopleEditorImpl();
    this.characterEditor = new CharacterEditorImpl();
    this.settings = new SettingsImpl();

    
    console.debug('[ui/UIModule] All UI components initialized');
  }
}

// Placeholder implementations for UI components
export class MainCardImpl implements MainCard {
  // Implementation will be added
}

export class MainMenuImpl implements MainMenu {
  // Implementation will be added
}

export class MapEditorImpl implements MapEditor {
  // Implementation will be added
}

export class ItemEditorImpl implements ItemEditor {
  // Implementation will be added
}

export class PeopleEditorImpl implements PeopleEditor {
  // Implementation will be added
}

export class CharacterEditorImpl implements CharacterEditor {
  // Implementation will be added
}

export class SettingsImpl implements Settings {
  // Implementation will be added
}


