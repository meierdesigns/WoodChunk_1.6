import React, { useEffect, useState } from 'react';
import { CoreModule } from './modules/core';
import { GameModule } from './modules/game';
import { UIModule } from './modules/ui';
import { MainMenu, MainCard, MapEditor, ItemEditor, PeopleEditor, CharacterEditor, Settings } from './modules/ui';
import { addCacheBusting } from './shared/types';
import './styles.css';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'mapEditor' | 'itemEditor' | 'peopleEditor' | 'characterEditor' | 'settings'>('menu');
  
  const [coreModule, setCoreModule] = useState<CoreModule | null>(null);
  const [gameModule, setGameModule] = useState<GameModule | null>(null);
  const [uiModule, setUiModule] = useState<UIModule | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.debug('[App] Initializing application...');
        
        // Initialize core module
        const core = new CoreModule();
        await core.initialize();
        setCoreModule(core);
        console.debug('[App] Core module initialized');

        // Initialize game module
        const game = new GameModule();
        await game.initialize();
        setGameModule(game);
        console.debug('[App] Game module initialized');

        // Initialize UI module
        const ui = new UIModule();
        await ui.initialize();
        setUiModule(ui);
        console.debug('[App] UI module initialized');

        setIsLoading(false);
        console.debug('[App] Application initialization complete');
      } catch (err) {
        console.error('[App] Failed to initialize application:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'menu':
        return <MainMenu />;
      case 'game':
        return <MainCard />;
      case 'mapEditor':
        return <MapEditor />;
      case 'itemEditor':
        return <ItemEditor />;
      case 'peopleEditor':
        return <PeopleEditor />;
      case 'characterEditor':
        return <CharacterEditor />;
      case 'settings':
        return <Settings />;

      default:
        return <MainMenu />;
    }
  };

  const navigateTo = (view: typeof currentView) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing WoodChunk 1.5...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="app-navigation">
        <button 
          className={`nav-btn ${currentView === 'menu' ? 'active' : ''}`}
          onClick={() => navigateTo('menu')}
        >
          🏠 Menu
        </button>
        <button 
          className={`nav-btn ${currentView === 'game' ? 'active' : ''}`}
          onClick={() => navigateTo('game')}
        >
          🎮 Game
        </button>
        <button 
          className={`nav-btn ${currentView === 'mapEditor' ? 'active' : ''}`}
          onClick={() => navigateTo('mapEditor')}
        >
          🗺️ Map Editor
        </button>
        <button 
          className={`nav-btn ${currentView === 'itemEditor' ? 'active' : ''}`}
          onClick={() => navigateTo('itemEditor')}
        >
          🛡️ Item Editor
        </button>
        <button 
          className={`nav-btn ${currentView === 'peopleEditor' ? 'active' : ''}`}
          onClick={() => navigateTo('peopleEditor')}
        >
          👥 People Editor
        </button>
        <button 
          className={`nav-btn ${currentView === 'characterEditor' ? 'active' : ''}`}
          onClick={() => navigateTo('characterEditor')}
        >
          ⚔️ Character Editor
        </button>

        <button 
          className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => navigateTo('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>
      
      <main className="app-content">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;
