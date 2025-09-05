/**
 * Ability Details Modal Module
 */
class AbilityDetailsModal {
    constructor(abilitiesEditor) {
        this.abilitiesEditor = abilitiesEditor;
        this.currentModal = null;
    }
    
    // Cache busting utility for Buildings images
    correctImagePath(imagePath) {
        if (!imagePath) return '';
        
        // Add cache busting for Buildings tiles
        if (imagePath.includes('Buildings') || imagePath.includes('slice_') || imagePath.includes('tile_')) {
            const timestamp = Date.now();
            const separator = imagePath.includes('?') ? '&' : '?';
            return `${imagePath}${separator}_cb=${timestamp}`;
        }
        
        return imagePath;
    }

    showAbilityDetails(abilityId) {
        // Versuche zuerst in filteredAbilities zu finden (wie die Tabelle)
        let ability = this.abilitiesEditor.getFilteredAbilities().find(a => a.id == abilityId);
        if (!ability) {
            // Fallback: Suche in abilities
            ability = this.abilitiesEditor.getAbilities().find(a => a.id == abilityId);
        }
        
        if (!ability) {
            console.error('[AbilityDetailsModal] Ability not found:', abilityId);
            return;
        }

        // Close any existing modal
        this.closeModal();

        // Create modal HTML
        const modalHTML = `
            <div class="ability-details-modal" id="abilityDetailsModal" data-ability-id="${ability.id}">
                <div class="modal-backdrop"></div>
                <div class="ability-modal-content">
                    <div class="modal-header">
                        <h3>${ability.name}</h3>
                        <div class="modal-header-actions">
                            <button class="btn btn-primary save-btn">
                                💾 Speichern
                            </button>
                            <button class="btn btn-secondary cancel-btn">
                                ❌ Abbrechen
                            </button>
                        </div>
                    </div>
                    
                    <div class="modal-body">
                         <div class="modal-layout">
                        <div class="ability-info">
                            <div class="info-row">
                                     <span class="label">Name:</span>
                                     <input type="text" class="edit-input" value="${ability.name}" data-field="name">
                            </div>
                            <div class="info-row">
                                      <span class="label">Kategorie:</span>
                                      <select class="edit-select" data-field="category">
                                          <option value="combat" ${ability.category === 'combat' ? 'selected' : ''}>⚔️ Kampf</option>
                                          <option value="magic" ${ability.category === 'magic' ? 'selected' : ''}>🔮 Magie</option>
                                          <option value="craft" ${ability.category === 'craft' ? 'selected' : ''}>⚒️ Handwerk</option>
                                          <option value="social" ${ability.category === 'social' ? 'selected' : ''}>💬 Sozial</option>
                                      </select>
                            </div>
                            <div class="info-row">
                                <span class="label">Beschreibung:</span>
                                      <input type="text" class="edit-input description-input" value="${ability.description || ''}" data-field="description" placeholder="Beschreibung der Fähigkeit...">
                            </div>
                            <div class="info-row">
                                <span class="label">Kosten:</span>
                                      <input type="number" class="edit-input" value="${ability.cost || '0'}" data-field="cost" min="0">
                                  </div>
                                                                     <div class="info-row damage-healing-row">
                                       <div class="damage-healing-group">
                                           <span class="label">Schaden:</span>
                                           <input type="number" class="edit-input" value="${ability.damage || '0'}" data-field="damage" min="0" placeholder="Schadenswert...">
                                       </div>
                                       <div class="damage-healing-group">
                                           <span class="label">Heilung:</span>
                                           <input type="number" class="edit-input" value="${ability.healing || '0'}" data-field="healing" min="0" placeholder="Heilungswert...">
                                       </div>
                                   </div>
                                                                    <div class="combat-fields" style="display: ${ability.category === 'combat' || ability.category === 'magic' ? 'block' : 'none'};">
                                      
                                                                             <div class="info-row effects-side-by-side-container">
                                           <div class="effects-column">
                                               <h4>Statuseffekte</h4>
                                               <div class="status-effects-container">
                                                   <div class="status-item">
                                                       <input type="checkbox" id="status_poisoned_${ability.id}" class="status-checkbox" 
                                                              data-field="status_poisoned" ${ability.status_poisoned ? 'checked' : ''}>
                                                       <label for="status_poisoned_${ability.id}" class="status-label">
                                                           <span class="status-icon">☠️</span>
                                                           <span>Vergiftet</span>
                                                       </label>
                                                   </div>
                                                   <div class="status-item">
                                                       <input type="checkbox" id="status_paralyzed_${ability.id}" class="status-checkbox" 
                                                              data-field="status_paralyzed" ${ability.status_paralyzed ? 'checked' : ''}>
                                                       <label for="status_paralyzed_${ability.id}" class="status-label">
                                                           <span class="status-icon">⚡</span>
                                                           <span>Gelähmt</span>
                                                       </label>
                                                   </div>
                                                   <div class="status-item">
                                                       <input type="checkbox" id="status_blinded_${ability.id}" class="status-checkbox" 
                                                              data-field="status_blinded" ${ability.status_blinded ? 'checked' : ''}>
                                                       <label for="status_blinded_${ability.id}" class="status-label">
                                                           <span class="status-icon">👁️</span>
                                                           <span>Geblendet</span>
                                                       </label>
                                                   </div>
                                                   <div class="status-item">
                                                       <input type="checkbox" id="status_sleeping_${ability.id}" class="status-checkbox" 
                                                              data-field="status_sleeping" ${ability.status_sleeping ? 'checked' : ''}>
                                                       <label for="status_sleeping_${ability.id}" class="status-label">
                                                           <span class="status-icon">😴</span>
                                                           <span>Schlafend</span>
                                                       </label>
                                                   </div>
                                               </div>
                                           </div>
                                           
                                           <div class="effects-column">
                                               <h4>Element</h4>
                                               <div class="element-radio-container">
                                                   <div class="element-item">
                                                       <input type="radio" id="element_none_${ability.id}" name="element_${ability.id}" 
                                                              value="" data-field="element" ${!ability.element ? 'checked' : ''}>
                                                       <label for="element_none_${ability.id}" class="element-label">
                                                           <span class="element-icon">⚪</span>
                                                           <span>Kein Element</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_physical_${ability.id}" name="element_${ability.id}" 
                                                              value="physical" data-field="element" ${ability.element === 'physical' ? 'checked' : ''}>
                                                       <label for="element_physical_${ability.id}" class="element-label">
                                                           <span class="element-icon">⚔️</span>
                                                           <span>Physical</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_fire_${ability.id}" name="element_${ability.id}" 
                                                              value="fire" data-field="element" ${ability.element === 'fire' ? 'checked' : ''}>
                                                       <label for="element_fire_${ability.id}" class="element-label">
                                                           <span class="element-icon">🔥</span>
                                                           <span>Fire</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_ice_${ability.id}" name="element_${ability.id}" 
                                                              value="ice" data-field="element" ${ability.element === 'ice' ? 'checked' : ''}>
                                                       <label for="element_ice_${ability.id}" class="element-label">
                                                           <span class="element-icon">❄️</span>
                                                           <span>Ice</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_lightning_${ability.id}" name="element_${ability.id}" 
                                                              value="lightning" data-field="element" ${ability.element === 'lightning' ? 'checked' : ''}>
                                                       <label for="element_lightning_${ability.id}" class="element-label">
                                                           <span class="element-icon">⚡</span>
                                                           <span>Lightning</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_earth_${ability.id}" name="element_${ability.id}" 
                                                              value="earth" data-field="element" ${ability.element === 'earth' ? 'checked' : ''}>
                                                       <label for="element_earth_${ability.id}" class="element-label">
                                                           <span class="element-icon">🏔️</span>
                                                           <span>Earth</span>
                                                       </label>
                                                   </div>
                                                   <div class="element-item">
                                                       <input type="radio" id="element_water_${ability.id}" name="element_${ability.id}" 
                                                              value="water" data-field="element" ${ability.element === 'water' ? 'checked' : ''}>
                                                       <label for="element_water_${ability.id}" class="element-label">
                                                           <span class="element-icon">💧</span>
                                                           <span>Water</span>
                                                       </label>
                                                       </div>
                                                   </div>
                                               </div>
                                           
                                           <div class="effects-column">
                                                <h4>Buff/Debuff</h4>
                                                <div class="buff-debuff-container">
                                                    <div class="buff-debuff-item">
                                                        <div class="buff-debuff-label">
                                                            <span class="buff-debuff-icon" title="Stärke">💪</span>
                                                        </div>
                                                        <div class="buff-debuff-slider-container">
                                                             <span class="slider-value">${ability.strength_value || 0}</span>
                                                             <input type="range" class="buff-debuff-slider" 
                                                                    data-field="strength_value" 
                                                                    min="-100" max="100" value="${ability.strength_value || 0}"
                                                                    oninput="window.abilityDetailsModalInstance.updateSliderValue(this)">
                                                         </div>
                                                    </div>
                                                    <div class="buff-debuff-item">
                                                        <div class="buff-debuff-label">
                                                            <span class="buff-debuff-icon" title="Verteidigung">🛡️</span>
                                                        </div>
                                                        <div class="buff-debuff-slider-container">
                                                             <span class="slider-value">${ability.defense_value || 0}</span>
                                                             <input type="range" class="buff-debuff-slider" 
                                                                    data-field="defense_value" 
                                                                    min="-100" max="100" value="${ability.defense_value || 0}"
                                                                    oninput="window.abilityDetailsModalInstance.updateSliderValue(this)">
                                                         </div>
                                                    </div>
                                                    <div class="buff-debuff-item">
                                                        <div class="buff-debuff-label">
                                                            <span class="buff-debuff-icon" title="Geschwindigkeit">⚡</span>
                                                        </div>
                                                        <div class="buff-debuff-slider-container">
                                                             <span class="slider-value">${ability.speed_value || 0}</span>
                                                             <input type="range" class="buff-debuff-slider" 
                                                                    data-field="speed_value" 
                                                                    min="-100" max="100" value="${ability.speed_value || 0}"
                                                                    oninput="window.abilityDetailsModalInstance.updateSliderValue(this)">
                                                         </div>
                                                    </div>
                                                    <div class="buff-debuff-item">
                                                        <div class="buff-debuff-label">
                                                            <span class="buff-debuff-icon" title="Magie">🔮</span>
                                                        </div>
                                                        <div class="buff-debuff-slider-container">
                                                             <span class="slider-value">${ability.magic_value || 0}</span>
                                                             <input type="range" class="buff-debuff-slider" 
                                                                    data-field="magic_value" 
                                                                    min="-100" max="100" value="${ability.magic_value || 0}"
                                                                    oninput="window.abilityDetailsModalInstance.updateSliderValue(this)">
                                                         </div>
                                                    </div>
                                                    <div class="buff-debuff-item">
                                                        <div class="buff-debuff-label">
                                                            <span class="buff-debuff-icon" title="Gesundheit">❤️</span>
                                                        </div>
                                                        <div class="buff-debuff-slider-container">
                                                             <span class="slider-value">${ability.health_value || 0}</span>
                                                             <input type="range" class="buff-debuff-slider" 
                                                                    data-field="health_value" 
                                                                    min="-100" max="100" value="${ability.health_value || 0}"
                                                                    oninput="window.abilityDetailsModalInstance.updateSliderValue(this)">
                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="info-row races-row">
                                            <h4>Verfügbare Völker</h4>
                                            <div class="races-columns-container">
                                                <div class="race-column">
                                                    <div class="race-header">
                                                        <img src="../../assets/peoples/dwarves/dwarves.png" alt="Zwerge" class="race-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                                        <span class="race-emoji-fallback" style="display: none;">⛏️</span>
                                                        <h5>Zwerge</h5>
                                                    </div>
                                                    <div class="race-classes">
                                                        <div class="race-item all-race-item">
                                                            <input type="checkbox" id="all_dwarves" class="all-race-checkbox" 
                                                                   data-race="dwarves" onchange="window.abilityDetailsModalInstance.handleAllRaceChange(this)">
                                                            <label for="all_dwarves" class="race-label all-race-label">Alle</label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Zwerg Schmied" class="race-checkbox" 
                                                                   data-race="Zwerg Schmied" ${this.isRaceSelected(ability, "Zwerg Schmied") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Zwerg Schmied" class="race-label">
                                                                <span class="class-icon">🔨</span>
                                                                <span>Zwerg Schmied</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Zwerg Bergarbeiter" class="race-checkbox" 
                                                                   data-race="Zwerg Bergarbeiter" ${this.isRaceSelected(ability, "Zwerg Bergarbeiter") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Zwerg Bergarbeiter" class="race-label">
                                                                <span class="class-icon">⛏️</span>
                                                                <span>Zwerg Bergarbeiter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Zwerg Krieger" class="race-checkbox" 
                                                                   data-race="Zwerg Krieger" ${this.isRaceSelected(ability, "Zwerg Krieger") ? 'checked' : ''}>
                                                            <label for="race_Zwerg Krieger" class="race-label">
                                                                <span class="class-icon">🧔</span>
                                                                <span>Zwerg Krieger</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="race-column">
                                                    <div class="race-header">
                                                        <img src="../../assets/peoples/elves/elves.png" alt="Elfen" class="race-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                                        <span class="race-emoji-fallback" style="display: none;">🧝</span>
                                                        <h5>Elfen</h5>
                                                    </div>
                                                    <div class="race-classes">
                                                        <div class="race-item all-race-item">
                                                            <input type="checkbox" id="all_elves" class="all-race-checkbox" 
                                                                   data-race="elves" onchange="window.abilityDetailsModalInstance.handleAllRaceChange(this)">
                                                            <label for="all_elves" class="race-label all-race-label">Alle</label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Elfen Bogenschütze" class="race-checkbox" 
                                                                   data-race="Elfen Bogenschütze" ${this.isRaceSelected(ability, "Elfen Bogenschütze") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Elfen Bogenschütze" class="race-label">
                                                                <span class="class-icon">🏹</span>
                                                                <span>Elfen Bogenschütze</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Elfen Magier" class="race-checkbox" 
                                                                   data-race="Elfen Magier" ${this.isRaceSelected(ability, "Elfen Magier") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Elfen Magier" class="race-label">
                                                                <span class="class-icon">🧙‍♀️</span>
                                                                <span>Elfen Magier</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Elfen Waldläufer" class="race-checkbox" 
                                                                   data-race="Elfen Waldläufer" ${this.isRaceSelected(ability, "Elfen Waldläufer") ? 'checked' : ''}>
                                                            <label for="race_Elfen Waldläufer" class="race-label">
                                                                <span class="class-icon">🌿</span>
                                                                <span>Elfen Waldläufer</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="race-column">
                                                    <div class="race-header">
                                                        <img src="../../assets/peoples/goblins/goblins.png" alt="Goblins" class="race-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                                        <span class="race-emoji-fallback" style="display: none;">👺</span>
                                                        <h5>Goblins</h5>
                                                    </div>
                                                    <div class="race-classes">
                                                        <div class="race-item all-race-item">
                                                            <input type="checkbox" id="all_goblins" class="all-race-checkbox" 
                                                                   data-race="goblins" onchange="window.abilityDetailsModalInstance.handleAllRaceChange(this)">
                                                            <label for="all_goblins" class="race-label all-race-label">Alle</label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Goblin Kundschafter" class="race-checkbox" 
                                                                   data-race="Goblin Kundschafter" ${this.isRaceSelected(ability, "Goblin Kundschafter") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Goblin Kundschafter" class="race-label">
                                                                <span class="class-icon">🏹</span>
                                                                <span>Goblin Kundschafter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Goblin Schamane" class="race-checkbox" 
                                                                   data-race="Goblin Schamane" ${this.isRaceSelected(ability, "Goblin Schamane") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Goblin Schamane" class="race-label">
                                                                <span class="class-icon">🧙</span>
                                                                <span>Goblin Schamane</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Goblin Krieger" class="race-checkbox" 
                                                                   data-race="Goblin Krieger" ${this.isRaceSelected(ability, "Goblin Krieger") ? 'checked' : ''}>
                                                            <label for="race_Goblin Krieger" class="race-label">
                                                                <span class="class-icon">👺</span>
                                                                <span>Goblin Krieger</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="race-column">
                                                    <div class="race-header">
                                                        <img src="../../assets/peoples/humans/humans.png" alt="Menschen" class="race-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                                        <span class="race-emoji-fallback" style="display: none;">👥</span>
                                                        <h5>Menschen</h5>
                                                    </div>
                                                    <div class="race-classes">
                                                        <div class="race-item all-race-item">
                                                            <input type="checkbox" id="all_humans" class="all-race-checkbox" 
                                                                   data-race="humans" onchange="window.abilityDetailsModalInstance.handleAllRaceChange(this)">
                                                            <label for="all_humans" class="race-label all-race-label">Alle</label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Menschlicher Ritter" class="race-checkbox" 
                                                                   data-race="Menschlicher Ritter" ${this.isRaceSelected(ability, "Menschlicher Ritter") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Menschlicher Ritter" class="race-label">
                                                                <span class="class-icon">👤</span>
                                                                <span>Menschlicher Ritter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Menschlicher Magier" class="race-checkbox" 
                                                                   data-race="Menschlicher Magier" ${this.isRaceSelected(ability, "Menschlicher Magier") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Menschlicher Magier" class="race-label">
                                                                <span class="class-icon">🔮</span>
                                                                <span>Menschlicher Magier</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Menschlicher Händler" class="race-checkbox" 
                                                                   data-race="Menschlicher Händler" ${this.isRaceSelected(ability, "Menschlicher Händler") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Menschlicher Händler" class="race-label">
                                                                <span class="class-icon">💰</span>
                                                                <span>Menschlicher Händler</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="race-column">
                                                    <div class="race-header">
                                                        <img src="../../assets/peoples/orcs/orcs.png" alt="Orks" class="race-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                                                        <span class="race-emoji-fallback" style="display: none;">👹</span>
                                                        <h5>Orks</h5>
                                                    </div>
                                                    <div class="race-classes">
                                                        <div class="race-item all-race-item">
                                                            <input type="checkbox" id="all_orcs" class="all-race-checkbox" 
                                                                   data-race="orcs" onchange="window.abilityDetailsModalInstance.handleAllRaceChange(this)">
                                                            <label for="all_orcs" class="race-label all-race-label">Alle</label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Ork Berserker" class="race-checkbox" 
                                                                   data-race="Ork Berserker" ${this.isRaceSelected(ability, "Ork Berserker") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Ork Berserker" class="race-label">
                                                                <span class="class-icon">🧌</span>
                                                                <span>Ork Berserker</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Ork Häuptling" class="race-checkbox" 
                                                                   data-race="Ork Häuptling" ${this.isRaceSelected(ability, "Ork Häuptling") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Ork Häuptling" class="race-label">
                                                                <span class="class-icon">👑</span>
                                                                <span>Ork Häuptling</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Ork Schamane" class="race-checkbox" 
                                                                   data-race="Ork Schamane" ${this.isRaceSelected(ability, "Ork Schamane") ? 'checked' : ''}
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Ork Schamane" class="race-label">
                                                                <span class="class-icon">🧿</span>
                                                                <span>Ork Schamane</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
                 // Store reference to current modal
         this.currentModal = document.getElementById('abilityDetailsModal');
         
         // Make instance globally available for oninput calls
         window.abilityDetailsModalInstance = this;
         
        
        // Set up event listeners
        this.setupModalEventListeners(ability);
        
        // Update all checkbox state
        this.updateAllCheckboxStateInDetails();
        
        // Add backdrop click listener to close modal
        this.setupBackdropClickListener();
        
        // Add save button listener
        this.setupSaveButtonListener(ability);
        this.setupCancelButtonListener();
        
        // Initialize all checkbox states
        this.initializeAllCheckboxStates();
    }

    setupModalEventListeners(ability) {
        const modal = this.currentModal;
        if (!modal) return;

        // Set up race checkbox listeners
        const raceCheckboxes = modal.querySelectorAll('.race-checkbox');
        raceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const race = e.target.dataset.race;
                if (race === 'all') {
                    this.handleAllRacesChange(ability, e.target.checked);
                } else {
                    this.handleIndividualRaceChange(ability, race, e.target.checked);
                }
                this.updateAllCheckboxStateInDetails();
            });
        });

        // Set up category change listener
        const categorySelect = modal.querySelector('[data-field="category"]');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.handleCategoryChange(ability, e.target.value);
            });
        }
        }
    
    

    getRaceImagePath(race) {
        const raceMapping = {
            'Zwerg Schmied': '../../assets/peoples/dwarves/dwarves.png',
            'Zwerg Bergarbeiter': '../../assets/peoples/dwarves/dwarves.png',
            'Zwerg Krieger': '../../assets/peoples/dwarves/dwarves.png',
            'Elfen Bogenschütze': '../../assets/peoples/elves/elves.png',
            'Elfen Magier': '../../assets/peoples/elves/elves.png',
            'Elfen Waldläufer': '../../assets/peoples/elves/elves.png',
            'Goblin Kundschafter': '../../assets/peoples/goblins/goblins.png',
            'Goblin Schamane': '../../assets/peoples/goblins/goblins.png',
            'Goblin Krieger': '../../assets/peoples/goblins/goblins.png',
            'Menschlicher Ritter': '../../assets/peoples/humans/humans.png',
            'Menschlicher Magier': '../../assets/peoples/humans/humans.png',
            'Menschlicher Händler': '../../assets/peoples/humans/humans.png',
            'Ork Berserker': '../../assets/peoples/orcs/orcs.png',
            'Ork Häuptling': '../../assets/peoples/orcs/orcs.png',
            'Ork Schamane': '../../assets/peoples/orcs/orcs.png',
            // Fallback für alte Namen
            'Humans': '../../assets/peoples/humans/humans.png',
            'Elves': '../../assets/peoples/elves/elves.png',
            'Dwarves': '../../assets/peoples/dwarves/dwarves.png',
            'Orcs': '../../assets/peoples/orcs/orcs.png',
            'Goblins': '../../assets/peoples/goblins/goblins.png'
        };
        return raceMapping[race] || '../../assets/peoples/humans/humans.png';
    }

    getRaceEmoji(race) {
        const raceEmojis = {
            'Humans': '👥',
            'Elves': '🧝',
            'Dwarves': '⛏️',
            'Orcs': '👹',
            'Goblins': '👺',
            'Zwerg Schmied': '⛏️',
            'Zwerg Bergarbeiter': '⛏️',
            'Zwerg Krieger': '⛏️',
            'Elfen Bogenschütze': '🧝',
            'Elfen Magier': '🧝',
            'Elfen Waldläufer': '🧝',
            'Goblin Kundschafter': '👺',
            'Goblin Schamane': '👺',
            'Goblin Krieger': '👺',
            'Menschlicher Ritter': '👥',
            'Menschlicher Magier': '👥',
            'Menschlicher Händler': '👥',
            'Ork Berserker': '👹',
            'Ork Häuptling': '👹',
            'Ork Schamane': '👹'
        };
        return raceEmojis[race] || '👤';
    }
    
    
    // Globale Checkbox-Funktionalität für "Alle" und individuelle Checkboxes
    handleAllRaceChange(allCheckbox) {
        const raceColumn = allCheckbox.closest('.race-column');
        const individualCheckboxes = raceColumn.querySelectorAll('.race-checkbox');
        
        if (allCheckbox.checked) {
            // Alle individuellen Checkboxes aktivieren
            individualCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        } else {
            // Alle individuellen Checkboxes deaktivieren
            individualCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        // Update "Alle" Status basierend auf individuellen Checkboxes
        this.updateAllCheckboxState(raceColumn);
    }
    
    handleRaceChange(checkbox) {
        const raceColumn = checkbox.closest('.race-column');
        
        // Update "Alle" Status basierend auf individuellen Checkboxes
        this.updateAllCheckboxState(raceColumn);
    }
    
    updateAllCheckboxState(raceColumn) {
        const allCheckbox = raceColumn.querySelector('.all-race-checkbox');
        const individualCheckboxes = raceColumn.querySelectorAll('.race-checkbox');
        
        if (!allCheckbox || !individualCheckboxes.length) return;
        
        // Count checked individual checkboxes
        const checkedCount = Array.from(individualCheckboxes).filter(cb => cb.checked).length;
        const totalCount = individualCheckboxes.length;
        
        if (checkedCount === 0) {
            // None checked - "Alle" inaktiv
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            // All checked - "Alle" aktiv (checked)
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
        } else {
            // Some checked - "Alle" semi (indeterminate)
            allCheckbox.checked = false;
            allCheckbox.indeterminate = true;
        }
    }
    
    initializeAllCheckboxStates() {
        if (!this.currentModal) return;
        
        // Initialize all race columns
        const raceColumns = this.currentModal.querySelectorAll('.race-column');
        raceColumns.forEach(raceColumn => {
            this.updateAllCheckboxState(raceColumn);
        });
    }

    handleCategoryChange(ability, newCategory) {
        const modal = this.currentModal;
        if (!modal) return;

        const combatFields = modal.querySelector('.combat-fields');
        if (!combatFields) return;

        if (newCategory === 'combat' || newCategory === 'magic') {
            // Show combat fields
            combatFields.style.display = 'block';
        } else {
            // Hide combat fields
            combatFields.style.display = 'none';
            
            // Clear combat-related values
            const statusCheckboxes = modal.querySelectorAll('.status-checkbox');
            const elementRadios = modal.querySelectorAll('[data-field="element"]');
            const buffDebuffTypeRadios = modal.querySelectorAll('[data-field="buff_debuff_type"]');
            const directionRadios = modal.querySelectorAll('[data-field="direction"]');

            statusCheckboxes.forEach(cb => cb.checked = false);
            elementRadios.forEach(radio => radio.checked = false);
            buffDebuffTypeRadios.forEach(radio => radio.checked = false);
            directionRadios.forEach(radio => radio.checked = false);
            
            // Clear any old buff/debuff values from ability data
            if (ability.buff_debuff_type) {
                ability.buff_debuff_type = null;
            }
            if (ability.direction) {
                ability.direction = null;
            }
        }
    }
    
    handleBuffDebuffTypeChange(ability, newType) {
        const modal = this.currentModal;
        if (!modal) return;
        
        const directionSection = modal.querySelector('.buff-debuff-direction');
        if (!directionSection) return;
        
        if (newType && newType !== '') {
            // Show direction section when a buff/debuff type is selected
            directionSection.style.display = 'block';
        } else {
            // Hide direction section when no type is selected
            directionSection.style.display = 'none';
            
            // Clear direction selection
            const directionRadios = modal.querySelectorAll('[data-field="direction"]');
            directionRadios.forEach(radio => radio.checked = false);
            ability.direction = null;
        }
    }

    handleAllRacesChange(ability, isChecked) {
        if (isChecked) {
            this.abilitiesEditor.getAvailableRaces().forEach(race => {
                this.updateAbilityRace(ability.id, race, true);
            });
        } else {
            this.abilitiesEditor.getAvailableRaces().forEach(race => {
                this.updateAbilityRace(ability.id, race, false);
            });
        }
    }

    handleIndividualRaceChange(ability, race, isChecked) {
        this.updateAbilityRace(ability.id, race, isChecked);
    }

    updateAbilityRace(abilityId, race, isSelected) {
        const ability = this.abilitiesEditor.getAbilities().find(a => a.id === abilityId);
        if (!ability) return;

        if (!ability.races) {
            ability.races = [];
        }

        if (isSelected && !ability.races.includes(race)) {
            ability.races.push(race);
        } else if (!isSelected && ability.races.includes(race)) {
            ability.races = ability.races.filter(r => r !== race);
        }

        // Update in filtered abilities as well
        const abilityInFiltered = this.abilitiesEditor.getFilteredAbilities().find(a => a.id === abilityId);
        if (abilityInFiltered) {
            if (!abilityInFiltered.races) {
                abilityInFiltered.races = [];
            }
            if (isSelected && !abilityInFiltered.races.includes(race)) {
                abilityInFiltered.races.push(race);
            } else if (!isSelected && abilityInFiltered.races.includes(race)) {
                abilityInFiltered.races = abilityInFiltered.races.filter(r => r !== race);
            }
        }

        // Save to localStorage
        this.saveRacesFromDetails(abilityId);
    }

    saveRacesFromDetails(abilityId) {
        try {
            const ability = this.abilitiesEditor.getAbilities().find(a => a.id === abilityId);
            if (!ability) return;

            // Save to localStorage
            localStorage.setItem('abilitiesData', JSON.stringify(this.abilitiesEditor.getAbilities()));
        } catch (error) {
            console.error('[AbilityDetailsModal] Error saving races:', error);
        }
    }

    areAllRacesSelected(ability) {
        if (!ability.races || ability.races.length === 0) return false;
        return this.abilitiesEditor.getAvailableRaces().every(race => 
            ability.races.includes(race)
        );
    }

    isRaceSelected(ability, race) {
        return ability.races && ability.races.includes(race);
    }

    updateAllCheckboxStateInDetails() {
        const modal = this.currentModal;
        if (!modal) return;

        const allCheckbox = modal.querySelector('#allRaces');
        if (!allCheckbox) return;

        const raceCheckboxes = modal.querySelectorAll('.race-checkbox:not(#allRaces)');
        const checkedCount = Array.from(raceCheckboxes).filter(cb => cb.checked).length;
        const totalCount = raceCheckboxes.length;

        if (checkedCount === 0) {
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
        } else {
            allCheckbox.checked = false;
            allCheckbox.indeterminate = true;
        }
    }

    getCategoryName(category) {
        const categoryNames = {
            'combat': '⚔️ Kampf',
            'magic': '🔮 Magie',
            'craft': '⚒️ Handwerk',
            'social': '💬 Sozial'
        };
        return categoryNames[category] || category;
    }

    getElementDisplay(ability) {
        if (!ability.element) return '-';
        
        const elementIcons = {
            'physical': '⚔️',
            'fire': '🔥',
            'ice': '❄️',
            'lightning': '⚡',
            'earth': '🏔️',
            'water': '💧'
        };
        
        const icon = elementIcons[ability.element] || '⚔️';
        return `<span class="element-display">${icon} ${ability.element}</span>`;
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }
    
    setupBackdropClickListener() {
        if (!this.currentModal) return;
        
        const backdrop = this.currentModal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }
    
    setupSaveButtonListener(ability) {
        if (!this.currentModal) return;
        
        const saveBtn = this.currentModal.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                await this.saveAbilityChanges(ability);
            });
        }
    }
    
    setupCancelButtonListener() {
        if (!this.currentModal) return;
        
        const cancelBtn = this.currentModal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }
    
    async saveAbilityChanges(ability) {
        // Get all editable fields
        const nameInput = this.currentModal.querySelector('[data-field="name"]');
        const categorySelect = this.currentModal.querySelector('[data-field="category"]');
        const elementRadio = this.currentModal.querySelector('[data-field="element"]:checked');
        const descriptionTextarea = this.currentModal.querySelector('[data-field="description"]');
                 const costInput = this.currentModal.querySelector('[data-field="cost"]');
         const damageInput = this.currentModal.querySelector('[data-field="damage"]');
         const healingInput = this.currentModal.querySelector('[data-field="healing"]');
         
         
         if (nameInput) ability.name = nameInput.value.trim();
         if (categorySelect) ability.category = categorySelect.value;
         if (elementRadio) ability.element = elementRadio.value || null;
         if (descriptionTextarea) ability.description = descriptionTextarea.value.trim();
         if (costInput) ability.cost = parseInt(costInput.value) || 0;
         if (damageInput) ability.damage = parseInt(damageInput.value) || 0;
         if (healingInput) ability.healing = parseInt(healingInput.value) || 0;
        
        
         
         // Handle buff/debuff values
         const strengthValueInput = this.currentModal.querySelector('[data-field="strength_value"]');
         const defenseValueInput = this.currentModal.querySelector('[data-field="defense_value"]');
         const speedValueInput = this.currentModal.querySelector('[data-field="speed_value"]');
         const magicValueInput = this.currentModal.querySelector('[data-field="magic_value"]');
         const healthValueInput = this.currentModal.querySelector('[data-field="health_value"]');
         
         if (strengthValueInput) ability.strength_value = parseInt(strengthValueInput.value) || 0;
         if (defenseValueInput) ability.defense_value = parseInt(defenseValueInput.value) || 0;
         if (speedValueInput) ability.speed_value = parseInt(speedValueInput.value) || 0;
         if (magicValueInput) ability.magic_value = parseInt(magicValueInput.value) || 0;
         if (healthValueInput) ability.health_value = parseInt(healthValueInput.value) || 0;
        
        // Get status effect checkboxes
        const statusPoisoned = this.currentModal.querySelector('[data-field="status_poisoned"]');
        const statusParalyzed = this.currentModal.querySelector('[data-field="status_paralyzed"]');
        const statusBlinded = this.currentModal.querySelector('[data-field="status_blinded"]');
        const statusSleeping = this.currentModal.querySelector('[data-field="status_sleeping"]');
        
        if (statusPoisoned) ability.status_poisoned = statusPoisoned.checked;
        if (statusParalyzed) ability.status_paralyzed = statusParalyzed.checked;
        if (statusBlinded) ability.status_blinded = statusBlinded.checked;
        if (statusSleeping) ability.status_sleeping = statusSleeping.checked;
        
        // Update in both arrays
        const abilityInFiltered = this.abilitiesEditor.getFilteredAbilities().find(a => a.id === ability.id);
                 if (abilityInFiltered) {
             abilityInFiltered.name = ability.name;
             abilityInFiltered.category = ability.category;
             abilityInFiltered.element = ability.element;
             abilityInFiltered.description = ability.description;
             abilityInFiltered.cost = ability.cost;
             abilityInFiltered.damage = ability.damage;
             abilityInFiltered.healing = ability.healing;

             abilityInFiltered.strength_value = ability.strength_value;
             abilityInFiltered.defense_value = ability.defense_value;
             abilityInFiltered.speed_value = ability.speed_value;
             abilityInFiltered.magic_value = ability.magic_value;
             abilityInFiltered.health_value = ability.health_value;
             abilityInFiltered.status_poisoned = ability.status_poisoned;
             abilityInFiltered.status_paralyzed = ability.status_paralyzed;
             abilityInFiltered.status_blinded = ability.status_blinded;
             abilityInFiltered.status_sleeping = ability.status_sleeping;
         }
        
        // Save to localStorage
        try {
            localStorage.setItem('abilitiesData', JSON.stringify(this.abilitiesEditor.getAbilities()));
        } catch (error) {
            console.error('[AbilityDetailsModal] Error saving ability changes:', error);
        }
        
        // Save to JSON file via core
        try {
            await this.abilitiesEditor.core.saveAbilities();
        } catch (error) {
            console.error('[AbilityDetailsModal] Error saving to JSON file:', error);
        }
        
        // Close modal
        this.closeModal();
        
        // Refresh the table to show changes
        if (this.abilitiesEditor.ui && this.abilitiesEditor.ui.getAbilitiesTable()) {
            this.abilitiesEditor.ui.getAbilitiesTable().updateAbilitiesTable();
        }
         }
     
     updateSliderValue(slider) {
         const value = parseInt(slider.value);
         const snapRange = 10; // Snap-Bereich um 0
         
         // Snap to 0 if within range
         if (Math.abs(value) <= snapRange) {
             slider.value = 0;
             slider.previousElementSibling.textContent = '0';
         } else {
             slider.previousElementSibling.textContent = value;
        }
    }
}

// Global availability
window.AbilityDetailsModal = AbilityDetailsModal;
