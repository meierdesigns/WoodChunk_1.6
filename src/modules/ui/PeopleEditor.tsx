import React, { useState } from 'react';
import { addCacheBusting } from '../../shared/types';

// Cache busting utility for Buildings images
const correctImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Add cache busting for Buildings tiles
    if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
        return addCacheBusting(imagePath);
    }
    
    return imagePath;
};
import { PeopleEditorAPI } from '../../shared/types';

export class PeopleEditorImpl implements PeopleEditorAPI {
  private element: HTMLElement | null = null;

  render(): void {
    if (this.element) {
      // React component will handle rendering
    }
  }

  update(): void {
    // React component will handle updates
  }

  getElement(): HTMLElement | null {
    return this.element;
  }

  setElement(element: HTMLElement): void {
    this.element = element;
  }
}

export const PeopleEditor: React.FC = () => {
  const [selectedRace, setSelectedRace] = useState('humans');
  const [people, setPeople] = useState([
    { id: 1, name: 'John Smith', race: 'humans', class: 'knight', level: 5, location: 'Forest' },
    { id: 2, name: 'Elara', race: 'elves', class: 'mage', level: 8, location: 'Mountain' },
    { id: 3, name: 'Thorin', race: 'dwarves', class: 'blacksmith', level: 3, location: 'City' },
    { id: 4, name: 'Grok', race: 'orcs', class: 'warrior', level: 6, location: 'Desert' }
  ]);

  const races = ['humans', 'elves', 'dwarves', 'orcs', 'goblins'];
  const classes = ['knight', 'mage', 'warrior', 'archer', 'blacksmith', 'merchant'];

  const addPerson = () => {
    const newPerson = {
      id: Date.now(),
      name: 'New Person',
      race: selectedRace,
      class: 'knight',
      level: 1,
      location: 'Forest'
    };
    setPeople([...people, newPerson]);
  };

  const deletePerson = (id: number) => {
    setPeople(people.filter(person => person.id !== id));
  };

  return (
    <div className="people-editor">
      <div className="editor-header">
        <h2>People Editor</h2>
        <div className="header-controls">
          <select
            value={selectedRace}
            onChange={(e) => setSelectedRace(e.target.value)}
          >
            {races.map(race => (
              <option key={race} value={race}>
                {race.charAt(0).toUpperCase() + race.slice(1)}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={addPerson}>
            Add Person
          </button>
        </div>
      </div>
      
      <div className="people-list">
        {people
          .filter(person => person.race === selectedRace)
          .map(person => (
            <div key={person.id} className="person-card">
              <div className="person-header">
                <h3>{person.name}</h3>
                <span className="race">{person.race}</span>
              </div>
              <div className="person-details">
                <span>Class: {person.class}</span>
                <span>Level: {person.level}</span>
                <span>Location: {person.location}</span>
              </div>
              <div className="person-actions">
                <button className="btn btn-small">Edit</button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => deletePerson(person.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
