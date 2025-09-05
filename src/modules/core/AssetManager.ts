import { AssetManager as IAssetManager, addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

export class AssetManager implements IAssetManager {
  private assets: Map<string, any> = new Map();
  private cache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private templates: Map<string, any> = new Map();
  private variants: Map<string, any> = new Map();
  
  private categories = {
    tiles: 'assets/tiles',
    characters: 'assets/characters',
    items: 'assets/items',
    enemies: 'assets/enemies',
    ui: 'assets/ui',
    audio: 'assets/audio',
    maps: 'assets/maps'
  };
  
  private supportedFormats = {
    images: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
    audio: ['.mp3', '.ogg', '.wav'],
    data: ['.json', '.xml', '.txt']
  };
  
  // Template-Metadaten für verschiedene Kategorien
  private templateMetadata = {
    'items/weapons': {
      baseTemplate: 'weapon_main.png',
      variants: {
        iron: { damage: 15, value: 50, color: '#8B7355', durability: 100 },
        steel: { damage: 25, value: 100, color: '#C0C0C0', durability: 200 },
        mythril: { damage: 40, value: 200, color: '#E6E6FA', durability: 500 }
      }
    },
    'items/armor': {
      baseTemplate: 'armor_main.png',
      variants: {
        leather: { defense: 5, value: 30, color: '#8B4513', weight: 2 },
        chain: { defense: 10, value: 60, color: '#696969', weight: 4 },
        plate: { defense: 20, value: 120, color: '#C0C0C0', weight: 8 }
      }
    },
    'tiles/terrain': {
      baseTemplate: 'forest_main.png',
      variants: {
        light_forest: { density: 0.3, color: '#90EE90', movement: 1 },
        dense_forest: { density: 0.8, color: '#228B22', movement: 2 },
        dark_forest: { density: 1.0, color: '#006400', movement: 3 }
      }
    },
    'enemies/goblins': {
      baseTemplate: 'goblin_main.png',
      variants: {
        warrior: { health: 50, damage: 10, speed: 3, exp: 20 },
        archer: { health: 30, damage: 15, speed: 4, exp: 25 },
        shaman: { health: 40, damage: 20, speed: 2, exp: 30 }
      }
    }
  };

  async load(path: string): Promise<any> {
    // Check cache first
    if (this.cache.has(path)) {
      console.debug(`[core/AssetManager] Asset loaded from cache: ${path}`);
      return this.cache.get(path);
    }

    // Check if already loading
    if (this.loadingPromises.has(path)) {
      console.debug(`[core/AssetManager] Asset already loading: ${path}`);
      return this.loadingPromises.get(path);
    }

    // Start loading
    const loadPromise = this.loadAsset(path);
    this.loadingPromises.set(path, loadPromise);

    try {
      const asset = await loadPromise;
      this.cache.set(path, asset);
      this.loadingPromises.delete(path);
      
      console.debug(`[core/AssetManager] Asset loaded successfully: ${path}`);
      return asset;
    } catch (error) {
      this.loadingPromises.delete(path);
      console.error(`[core/AssetManager] Failed to load asset: ${path}`, error);
      throw error;
    }
  }

  async preload(paths: string[]): Promise<void> {
    console.debug(`[core/AssetManager] Preloading ${paths.length} assets`);
    const promises = paths.map(path => this.load(path));
    await Promise.allSettled(promises);
    console.debug('[core/AssetManager] Preloading complete');
  }

  get(path: string): any {
    return this.cache.get(path);
  }

  unload(path: string): void {
    if (this.cache.has(path)) {
      this.cache.delete(path);
      console.debug(`[core/AssetManager] Asset unloaded: ${path}`);
    }
  }

  /**
   * Asset-Manager initialisieren
   */
  async initialize() {
    console.debug('[core/AssetManager] Initializing...');
    
    try {
      // Basis-Templates laden
      await this.loadBaseTemplates();
      
      // Cache initialisieren
      this.initializeCache();
      
      console.debug('[core/AssetManager] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[core/AssetManager] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Basis-Templates laden
   */
  async loadBaseTemplates() {
    // UI-Templates (kritisch für Start)
    await this.loadTemplate('ui/icons', 'icon');
    await this.loadTemplate('ui/buttons', 'button');
    
    // Terrain-Templates für Map Editor
    await this.loadTemplate('tiles/terrain', 'forest');
    await this.loadTemplate('tiles/hexagons', 'hex');
  }
  
  /**
   * Cache initialisieren
   */
  initializeCache() {
    // Memory-Cache für häufig verwendete Assets
    this.cache.set('frequently_used', new Map());
    
    // Template-Cache
    this.cache.set('templates', new Map());
    
    // Variant-Cache
    this.cache.set('variants', new Map());
    
    // Kategorie-Caches
    Object.keys(this.categories).forEach(category => {
      this.cache.set(category, new Map());
    });
  }
  
  /**
   * Template laden
   * @param {string} category - Asset-Kategorie
   * @param {string} templateName - Template-Name
   * @returns {Promise<Object>} Template-Objekt
   */
  async getTemplate(category: string, templateName: string) {
    const cacheKey = `${category}/${templateName}`;
    
    // Prüfen ob Template bereits geladen ist
    if (this.cache.get('templates')?.has(cacheKey)) {
      return this.cache.get('templates').get(cacheKey);
    }
    
    // Prüfen ob Template bereits geladen wird
    if (this.loadingPromises.has(cacheKey)) {
      return await this.loadingPromises.get(cacheKey);
    }
    
    // Template laden
    const loadPromise = this.loadTemplate(category, templateName);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const template = await loadPromise;
      this.cache.get('templates').set(cacheKey, template);
      this.loadingPromises.delete(cacheKey);
      return template;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }
  
  /**
   * Template laden
   * @param {string} category - Asset-Kategorie
   * @param {string} templateName - Template-Name
   * @returns {Promise<Object>} Template-Objekt
   */
  async loadTemplate(category: string, templateName: string) {
    const metadata = this.templateMetadata[category as keyof typeof this.templateMetadata];
    if (!metadata) {
      throw new Error(`No metadata found for category: ${category}`);
    }
    
    const templatePath = `${this.categories[category.split('/')[0] as keyof typeof this.categories]}/${category.split('/')[1]}/${metadata.baseTemplate}`;
    
    try {
      const templateAsset = await this.loadAsset(templatePath);
      
      return {
        name: templateName,
        category: category,
        asset: templateAsset,
        metadata: metadata,
        variants: metadata.variants
      };
    } catch (error) {
      console.error(`[core/AssetManager] Failed to load template: ${templatePath}`, error);
      throw error;
    }
  }
  
  /**
   * Template-Variante laden
   * @param {string} category - Asset-Kategorie
   * @param {string} templateName - Template-Name
   * @param {string} variant - Varianten-Name
   * @returns {Promise<Object>} Varianten-Objekt
   */
  async getVariant(category: string, templateName: string, variant: string) {
    const cacheKey = `${category}/${templateName}/${variant}`;
    
    // Prüfen ob Variante bereits geladen ist
    if (this.cache.get('variants')?.has(cacheKey)) {
      return this.cache.get('variants').get(cacheKey);
    }
    
    try {
      // Template laden
      const template = await this.getTemplate(category, templateName);
      
      // Varianten-Daten abrufen
      const variantData = template.metadata.variants[variant];
      if (!variantData) {
        throw new Error(`Variant not found: ${variant} for template: ${templateName}`);
      }
      
      // Varianten-Objekt erstellen
      const variantObject = {
        template: template,
        variant: variant,
        data: variantData,
        finalAsset: await this.applyVariant(template.asset, variantData)
      };
      
      // Cache speichern
      this.cache.get('variants').set(cacheKey, variantObject);
      
      return variantObject;
    } catch (error) {
      console.error(`[core/AssetManager] Failed to load variant: ${variant}`, error);
      throw error;
    }
  }
  
  /**
   * Variante auf Asset anwenden
   * @param {Object} asset - Basis-Asset
   * @param {Object} variantData - Varianten-Daten
   * @returns {Promise<Object>} Modifiziertes Asset
   */
  async applyVariant(asset: any, variantData: any) {
    // Hier würde die Logik implementiert, um Varianten-Daten auf das Asset anzuwenden
    // Zum Beispiel: Farben ändern, Werte anpassen, etc.
    
    return {
      ...asset,
      variantData: variantData,
      modified: true
    };
  }
  
  /**
   * Alle Varianten eines Templates abrufen
   * @param {string} category - Asset-Kategorie
   * @param {string} templateName - Template-Name
   * @returns {Promise<Array>} Varianten-Liste
   */
  async getTemplateVariants(category: string, templateName: string) {
    try {
      const template = await this.getTemplate(category, templateName);
      const variants = [];
      
      for (const [variantName, variantData] of Object.entries(template.metadata.variants)) {
        const variant = await this.getVariant(category, templateName, variantName);
        variants.push(variant);
      }
      
      return variants;
    } catch (error) {
      console.error(`[core/AssetManager] Failed to load template variants: ${templateName}`, error);
      return [];
    }
  }
  
  /**
   * Templates in Kategorie suchen
   * @param {string} category - Asset-Kategorie
   * @returns {Promise<Array>} Template-Liste
   */
  async searchTemplates(category: string) {
    const templates = [];
    
    // Hier würde die Logik implementiert, um alle Templates in einer Kategorie zu finden
    // Basierend auf den verfügbaren Template-Metadaten
    
    if (this.templateMetadata[category as keyof typeof this.templateMetadata]) {
      const templateNames = Object.keys(this.templateMetadata[category as keyof typeof this.templateMetadata].variants || {});
      for (const templateName of templateNames) {
        try {
          const template = await this.getTemplate(category, templateName);
          templates.push(template);
        } catch (error) {
          console.warn(`[core/AssetManager] Failed to load template: ${templateName}`, error);
        }
      }
    }
    
    return templates;
  }
  
  /**
   * Asset aus Kategorie laden (Legacy-Support)
   * @param {string} category - Asset-Kategorie
   * @param {string} assetName - Asset-Name
   * @returns {Promise<Object>} Asset-Objekt
   */
  async getAsset(category: string, assetName: string) {
    const cacheKey = `${category}/${assetName}`;
    
    // Prüfen ob Asset bereits geladen ist
    if (this.cache.has(category) && this.cache.get(category).has(assetName)) {
      return this.cache.get(category).get(assetName);
    }
    
    // Prüfen ob Asset bereits geladen wird
    if (this.loadingPromises.has(cacheKey)) {
      return await this.loadingPromises.get(cacheKey);
    }
    
    // Asset laden
    const loadPromise = this.loadAsset(`${this.categories[category.split('/')[0] as keyof typeof this.categories]}/${category.split('/')[1]}/${assetName}`);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const asset = await loadPromise;
      this.cache.get(category).set(assetName, asset);
      this.loadingPromises.delete(cacheKey);
      return asset;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  private async loadAsset(path: string): Promise<any> {
    // Asset-Typ bestimmen
    const assetType = this.getAssetType(path);
    
    switch (assetType) {
      case 'image':
        return await this.loadImage(path);
      case 'audio':
        return await this.loadAudio(path);
      case 'data':
        return await this.loadJSON(path);
      default:
        throw new Error(`Unsupported asset type: ${assetType}`);
    }
  }

  private getAssetType(assetName: string): string {
    const extension = assetName.toLowerCase().split('.').pop();
    
    if (this.supportedFormats.images.includes(`.${extension}`)) {
      return 'image';
    } else if (this.supportedFormats.audio.includes(`.${extension}`)) {
      return 'audio';
    } else if (this.supportedFormats.data.includes(`.${extension}`)) {
      return 'data';
    }
    
    return 'unknown';
  }

  private loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  }

  private loadAudio(path: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
      audio.src = path;
    });
  }

  private async loadJSON(path: string): Promise<any> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${path}`);
    }
    return response.json();
  }

  /**
   * Kategorie von Assets laden (Legacy-Support)
   * @param {string} category - Asset-Kategorie
   * @returns {Promise<Array>} Asset-Liste
   */
  async loadCategory(category: string) {
    console.debug(`[core/AssetManager] Loading category: ${category}`);
    
    try {
      // Hier würde normalerweise ein Server-Request gemacht werden
      // um die verfügbaren Assets in der Kategorie zu erhalten
      const assetList = await this.getAssetList(category);
      
      const loadedAssets = [];
      for (const assetName of assetList) {
        try {
          const asset = await this.getAsset(category, assetName);
          loadedAssets.push({
            name: assetName,
            asset: asset,
            category: category
          });
        } catch (error) {
          console.warn(`[core/AssetManager] Failed to load asset: ${assetName}`, error);
        }
      }
      
      console.debug(`[core/AssetManager] Loaded ${loadedAssets.length} assets from category: ${category}`);
      return loadedAssets;
    } catch (error) {
      console.error(`[core/AssetManager] Failed to load category: ${category}`, error);
      return [];
    }
  }
  
  /**
   * Asset-Liste für Kategorie abrufen (Legacy-Support)
   * @param {string} category - Asset-Kategorie
   * @returns {Promise<Array>} Asset-Namen-Liste
   */
  async getAssetList(category: string) {
    // Mock-Implementation - würde normalerweise vom Server kommen
    const mockAssets: Record<string, string[]> = {
      'tiles/terrain': ['tree_1.png', 'tree_2.png', 'mountain_1.png', 'forest_1.png'],
      'tiles/hexagons': ['hex_flat.png', 'hex_pointy.png'],
      'items/weapons': ['sword_iron.png', 'sword_steel.png', 'bow_wood.png'],
      'items/armor': ['armor_leather.png', 'armor_chain.png', 'armor_plate.png'],
      'enemies/goblins': ['goblin_warrior.png', 'goblin_archer.png', 'goblin_shaman.png'],
      'ui/icons': ['icon_sword.png', 'icon_shield.png', 'icon_potion.png'],
      'ui/buttons': ['button_primary.png', 'button_secondary.png', 'button_danger.png']
    };
    
    return mockAssets[category] || [];
  }

  /**
   * Asset-Ordner scannen und Items finden
   * @param {string} category - Asset-Kategorie
   * @returns {Promise<Array>} Gefundene Items
   */
  async scanAssetFolder(category: string) {
    console.debug(`[core/AssetManager] Scanning asset folder: ${category}`);
    
    try {
      // Hier würde normalerweise ein Server-Request gemacht werden
      // um die Dateien im Asset-Ordner zu scannen
      const folderItems = await this.getFolderItems(category);
      
      console.debug(`[core/AssetManager] Found ${folderItems.length} items in ${category}`);
      return folderItems;
    } catch (error) {
      console.error(`[core/AssetManager] Failed to scan folder: ${category}`, error);
      return [];
    }
  }
  
  /**
   * Ordner-Inhalte abrufen
   * @param {string} category - Asset-Kategorie
   * @returns {Promise<Array>} Ordner-Inhalte
   */
  async getFolderItems(category: string) {
    console.debug(`[core/AssetManager] Getting folder items for category: ${category}`);
    
    try {
      // Make server request to scan the folder
      const response = await fetch(`/api/scan-assets?category=${category}`);
      
      if (!response.ok) {
        console.warn(`[core/AssetManager] Failed to scan assets for ${category}: ${response.status}`);
        return [];
      }
      
      const items = await response.json();
      console.debug(`[core/AssetManager] Found ${items.length} items in ${category}`);
      return items;
      
    } catch (error) {
      console.error(`[core/AssetManager] Error getting folder items for ${category}:`, error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.initializeCache();
    console.debug('[core/AssetManager] Cache cleared');
  }

  /**
   * Asset-Manager-Status abrufen
   * @returns {Object} Status-Informationen
   */
  getStatus() {
    const status = {
      totalAssets: 0,
      cachedAssets: 0,
      loadingAssets: this.loadingPromises.size,
      templates: this.cache.get('templates')?.size || 0,
      variants: this.cache.get('variants')?.size || 0,
      categories: {} as Record<string, number>
    };
    
    // Statistiken sammeln
    for (const [category, cache] of this.cache) {
      if (category !== 'templates' && category !== 'variants') {
        status.categories[category] = cache.size;
        status.cachedAssets += cache.size;
      }
    }
    
    return status;
  }
}
