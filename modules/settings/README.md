# Settings Module (modules/settings)

## Overview
The Settings Module provides a comprehensive interface for managing application settings and preferences in the WoodChunk application. It handles user preferences, data management, and application configuration.

## Purpose
- **Settings Management**: Manage application settings and user preferences
- **Data Management**: Handle data export, import, and reset functionality
- **User Preferences**: Store and manage user-specific settings
- **Application Configuration**: Configure application behavior and appearance
- **Data Persistence**: Save settings to localStorage

## Architecture
The module follows a simple HTML-based architecture with JavaScript for functionality and localStorage for persistence.

## Key Components

### Settings Interface
- **General Settings**: Language and theme selection
- **Game Settings**: Sound and music preferences
- **Data Management**: Export, import, and reset functionality

## How It Works

1. **Initialization**: Loads saved settings from localStorage
2. **Settings Display**: Shows current settings in form controls
3. **Settings Update**: Saves changes to localStorage when modified
4. **Data Management**: Provides tools for data export, import, and reset

## Settings Structure
```javascript
{
    language: string,        // 'de' or 'en'
    theme: string,          // 'dark' or 'light'
    sound: boolean,         // Sound enabled/disabled
    music: boolean          // Music enabled/disabled
}
```

## Features
- **Language Selection**: Choose between German and English
- **Theme Selection**: Switch between dark and light themes
- **Sound Controls**: Enable/disable sound effects
- **Music Controls**: Enable/disable background music
- **Data Export**: Export all application data
- **Data Import**: Import data from files
- **Data Reset**: Reset all data to default values
- **Auto-save**: Settings are saved automatically when changed

## Settings Categories

### General Settings
- **Language**: Application language (German/English)
- **Theme**: Visual theme (Dark/Light)

### Game Settings
- **Sound**: Sound effects on/off
- **Music**: Background music on/off

### Data Management
- **Export Data**: Export all application data
- **Import Data**: Import data from files
- **Reset Data**: Reset all data to defaults

## Usage
```javascript
// Settings are automatically loaded on page load
// Changes are automatically saved to localStorage

// Access settings programmatically
const settings = JSON.parse(localStorage.getItem('woodchunk_settings'));

// Update settings
settings.language = 'en';
localStorage.setItem('woodchunk_settings', JSON.stringify(settings));
```

## Dependencies
- Requires DOM elements with specific IDs
- Uses CSS for styling (styles.css)
- Depends on HTML structure for form controls
- Uses localStorage for settings persistence
- Requires AppCore.js for navigation

## Data Management
- **Export**: Creates downloadable JSON file with all application data
- **Import**: Loads data from uploaded JSON file
- **Reset**: Clears all localStorage data

## Debugging
All operations include debug logging with `[Settings]` prefix for easy identification and troubleshooting.
