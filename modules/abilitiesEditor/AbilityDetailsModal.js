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
        console.log(`[AbilityDetailsModal] showAbilityDetails called for ability ID: ${abilityId}`);
        
        // Versuche zuerst in filteredAbilities zu finden (wie die Tabelle)
        let ability = this.abilitiesEditor.getFilteredAbilities().find(a => a.id == abilityId);
        console.log(`[AbilityDetailsModal] Ability from filteredAbilities:`, ability);
        
        if (!ability) {
            // Fallback: Suche in abilities
            ability = this.abilitiesEditor.getAbilities().find(a => a.id == abilityId);
            console.log(`[AbilityDetailsModal] Ability from abilities (fallback):`, ability);
        }
        
        // ALWAYS use the original ability from the main abilities array to ensure correct data
        const originalAbility = this.abilitiesEditor.getAbilities().find(a => a.id == abilityId);
        if (originalAbility) {
            ability = originalAbility;
            console.log(`[AbilityDetailsModal] Using original ability data:`, ability);
        }
        
        if (!ability) {
            console.error('[AbilityDetailsModal] Ability not found:', abilityId);
            return;
        }
        
        console.log(`[AbilityDetailsModal] Found ability: ${ability.name} (ID: ${ability.id})`);
        console.log(`[AbilityDetailsModal] Ability data:`, ability);
        console.log(`[AbilityDetailsModal] Ability races:`, ability.races);
        console.log(`[AbilityDetailsModal] Ability characterData:`, ability.characterData);
        console.log(`[AbilityDetailsModal] Ability characterData.availableFor:`, ability.characterData?.availableFor);
        console.log(`[AbilityDetailsModal] Ability availableFor:`, ability.availableFor);

        // Close any existing modal
        this.closeModal();

        // Create modal HTML
        console.log(`[AbilityDetailsModal] Creating modal HTML for ability: ${ability.name}`);
        console.log(`[AbilityDetailsModal] Ability data for HTML generation:`, ability);
        
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
                                           <div class="range-input-group">
                                               <input type="number" class="edit-input range-min" value="${ability.damage_min || ability.damage || '0'}" data-field="damage_min" min="0" placeholder="Min...">
                                               <span class="range-separator">-</span>
                                               <input type="number" class="edit-input range-max" value="${ability.damage_max || ability.damage || '0'}" data-field="damage_max" min="0" placeholder="Max...">
                                           </div>
                                       </div>
                                       <div class="damage-healing-group">
                                           <span class="label">Heilung:</span>
                                           <div class="range-input-group">
                                               <input type="number" class="edit-input range-min" value="${ability.healing_min || ability.healing || '0'}" data-field="healing_min" min="0" placeholder="Min...">
                                               <span class="range-separator">-</span>
                                               <input type="number" class="edit-input range-max" value="${ability.healing_max || ability.healing || '0'}" data-field="healing_max" min="0" placeholder="Max...">
                                           </div>
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
                                                                   data-race="Zwerg Schmied"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Zwerg Schmied" class="race-label">
                                                                <span class="class-icon">🔨</span>
                                                                <span>Zwerg Schmied</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Zwerg Bergarbeiter" class="race-checkbox" 
                                                                   data-race="Zwerg Bergarbeiter"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Zwerg Bergarbeiter" class="race-label">
                                                                <span class="class-icon">⛏️</span>
                                                                <span>Zwerg Bergarbeiter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Zwerg Krieger" class="race-checkbox" 
                                                                   data-race="Zwerg Krieger">
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
                                                                   data-race="Elfen Bogenschütze"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Elfen Bogenschütze" class="race-label">
                                                                <span class="class-icon">🏹</span>
                                                                <span>Elfen Bogenschütze</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Elfen Magier" class="race-checkbox" 
                                                                   data-race="Elfen Magier"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Elfen Magier" class="race-label">
                                                                <span class="class-icon">🧙‍♀️</span>
                                                                <span>Elfen Magier</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Elfen Waldläufer" class="race-checkbox" 
                                                                   data-race="Elfen Waldläufer">
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
                                                                   data-race="Goblin Kundschafter"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Goblin Kundschafter" class="race-label">
                                                                <span class="class-icon">🏹</span>
                                                                <span>Goblin Kundschafter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Goblin Schamane" class="race-checkbox" 
                                                                   data-race="Goblin Schamane"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Goblin Schamane" class="race-label">
                                                                <span class="class-icon">🧙</span>
                                                                <span>Goblin Schamane</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Goblin Krieger" class="race-checkbox" 
                                                                   data-race="Goblin Krieger">
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
                                                                   data-race="Menschlicher Ritter"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Menschlicher Ritter" class="race-label">
                                                                <span class="class-icon">👤</span>
                                                                <span>Menschlicher Ritter</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Menschlicher Magier" class="race-checkbox" 
                                                                   data-race="Menschlicher Magier"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Menschlicher Magier" class="race-label">
                                                                <span class="class-icon">🔮</span>
                                                                <span>Menschlicher Magier</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Menschlicher Händler" class="race-checkbox" 
                                                                   data-race="Menschlicher Händler"
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
                                                                   data-race="Ork Berserker"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Ork Berserker" class="race-label">
                                                                <span class="class-icon">🧌</span>
                                                                <span>Ork Berserker</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Ork Häuptling" class="race-checkbox" 
                                                                   data-race="Ork Häuptling"
                                                                   onchange="window.abilityDetailsModalInstance.handleRaceChange(this)">
                                                            <label for="race_Ork Häuptling" class="race-label">
                                                                <span class="class-icon">👑</span>
                                                                <span>Ork Häuptling</span>
                                                            </label>
                                                        </div>
                                                        <div class="race-item">
                                                            <input type="checkbox" id="race_Ork Schamane" class="race-checkbox" 
                                                                   data-race="Ork Schamane"
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
        console.log(`[AbilityDetailsModal] Instance set globally:`, window.abilityDetailsModalInstance);
         
        
        // Set up event listeners
        this.setupModalEventListeners(ability);
        
        // Add backdrop click listener to close modal
        this.setupBackdropClickListener();
        
        // Add save button listener
        console.log(`[AbilityDetailsModal] Setting up event listeners...`);
        this.setupSaveButtonListener(ability);
        this.setupCancelButtonListener();
        
        // Set race checkboxes based on saved races FIRST
        console.log(`[AbilityDetailsModal] Setting race checkboxes from ability data...`);
        // Add a small delay to ensure DOM is fully rendered
        setTimeout(() => {
            this.setRaceCheckboxesFromAbility(ability);
            // THEN initialize all checkbox states (this will set "Alle" buttons correctly)
            this.initializeAllCheckboxStates();
        }, 100);
        
        console.log(`[AbilityDetailsModal] Modal setup completed successfully`);
        
        // Setup range validation
        this.setupRangeValidation();
        
        // Apply range validation to loaded values
        this.applyRangeValidation();
    }
    
    applyRangeValidation() {
        const modal = this.currentModal;
        if (!modal) return;
        
        // Apply damage range validation
        const damageMin = modal.querySelector('[data-field="damage_min"]');
        const damageMax = modal.querySelector('[data-field="damage_max"]');
        
        if (damageMin && damageMax) {
            const minValue = parseInt(damageMin.value) || 0;
            const maxValue = parseInt(damageMax.value) || 0;
            
            if (maxValue < minValue) {
                damageMax.value = minValue;
                damageMax.dispatchEvent(new Event('change'));
            }
        }
        
        // Apply healing range validation
        const healingMin = modal.querySelector('[data-field="healing_min"]');
        const healingMax = modal.querySelector('[data-field="healing_max"]');
        
        if (healingMin && healingMax) {
            const minValue = parseInt(healingMin.value) || 0;
            const maxValue = parseInt(healingMax.value) || 0;
            
            if (maxValue < minValue) {
                healingMax.value = minValue;
                healingMax.dispatchEvent(new Event('change'));
            }
        }
    }
    
    setupRangeValidation() {
        const modal = this.currentModal;
        if (!modal) return;
        
        // Damage range validation
        const damageMin = modal.querySelector('[data-field="damage_min"]');
        const damageMax = modal.querySelector('[data-field="damage_max"]');
        
        if (damageMin && damageMax) {
            damageMin.addEventListener('input', () => {
                const minValue = parseInt(damageMin.value) || 0;
                damageMax.min = minValue;
                if (parseInt(damageMax.value) < minValue) {
                    damageMax.value = minValue;
                }
                // Trigger change event to update the ability data
                damageMax.dispatchEvent(new Event('change'));
            });
            
            damageMax.addEventListener('input', () => {
                const maxValue = parseInt(damageMax.value) || 0;
                damageMin.max = maxValue;
                if (parseInt(damageMin.value) > maxValue) {
                    damageMin.value = maxValue;
                }
                // Trigger change event to update the ability data
                damageMin.dispatchEvent(new Event('change'));
            });
        }
        
        // Healing range validation
        const healingMin = modal.querySelector('[data-field="healing_min"]');
        const healingMax = modal.querySelector('[data-field="healing_max"]');
        
        if (healingMin && healingMax) {
            healingMin.addEventListener('input', () => {
                const minValue = parseInt(healingMin.value) || 0;
                healingMax.min = minValue;
                if (parseInt(healingMax.value) < minValue) {
                    healingMax.value = minValue;
                }
                // Trigger change event to update the ability data
                healingMax.dispatchEvent(new Event('change'));
            });
            
            healingMax.addEventListener('input', () => {
                const maxValue = parseInt(healingMax.value) || 0;
                healingMin.max = maxValue;
                if (parseInt(healingMin.value) > maxValue) {
                    healingMin.value = maxValue;
                }
                // Trigger change event to update the ability data
                healingMin.dispatchEvent(new Event('change'));
            });
        }
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
        const raceHeader = raceColumn.querySelector('.race-header h5');
        const raceType = raceHeader ? raceHeader.textContent.trim() : 'Unknown';
        const individualCheckboxes = raceColumn.querySelectorAll('.race-checkbox');
        const isChecked = allCheckbox.checked;
        
        console.log(`[AbilityDetailsModal] "Alle" checkbox changed for ${raceType} - ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
        console.log(`[AbilityDetailsModal] ${raceType} - Affecting ${individualCheckboxes.length} individual checkboxes`);
        
        // Only act if the checkbox was explicitly clicked (not programmatically set)
        if (allCheckbox.checked && !allCheckbox.indeterminate) {
            // Alle individuellen Checkboxes aktivieren
            individualCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
                console.log(`[AbilityDetailsModal] Checked: ${checkbox.getAttribute('data-race')}`);
            });
        } else if (!allCheckbox.checked && !allCheckbox.indeterminate) {
            // Alle individuellen Checkboxes deaktivieren
            individualCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                console.log(`[AbilityDetailsModal] Unchecked: ${checkbox.getAttribute('data-race')}`);
            });
        } else {
            // Indeterminate state - don't change individual checkboxes
            console.log(`[AbilityDetailsModal] ${raceType} - Indeterminate state, individual checkboxes remain unchanged`);
        }
        
        console.log(`[AbilityDetailsModal] ${raceType} - All ${individualCheckboxes.length} checkboxes ${isChecked ? 'checked' : 'unchecked'}`);
        
        // Update "Alle" Status basierend auf individuellen Checkboxes
        this.updateAllCheckboxState(raceColumn);
    }
    
    handleRaceChange(checkbox) {
        const raceName = checkbox.getAttribute('data-race');
        const isChecked = checkbox.checked;
        const raceColumn = checkbox.closest('.race-column');
        const raceHeader = raceColumn.querySelector('.race-header h5');
        const raceType = raceHeader ? raceHeader.textContent.trim() : 'Unknown';
        
        console.log(`[AbilityDetailsModal] Race checkbox changed: ${raceName} (${raceType}) - ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
        
        // Update "Alle" Status basierend auf individuellen Checkboxes
        this.updateAllCheckboxState(raceColumn);
        
        // Log current state of all checkboxes in this race
        const individualCheckboxes = raceColumn.querySelectorAll('.race-checkbox');
        const checkedBoxes = Array.from(individualCheckboxes).filter(cb => cb.checked);
        console.log(`[AbilityDetailsModal] ${raceType} - Checked: ${checkedBoxes.length}/${individualCheckboxes.length}`, 
                   checkedBoxes.map(cb => cb.getAttribute('data-race')));
    }
    
    updateAllCheckboxState(raceColumn) {
        const allCheckbox = raceColumn.querySelector('.all-race-checkbox');
        const individualCheckboxes = raceColumn.querySelectorAll('.race-checkbox');
        const raceHeader = raceColumn.querySelector('.race-header h5');
        const raceType = raceHeader ? raceHeader.textContent.trim() : 'Unknown';
        
        if (!allCheckbox || !individualCheckboxes.length) return;
        
        // Count checked individual checkboxes
        const checkedCount = Array.from(individualCheckboxes).filter(cb => cb.checked).length;
        const totalCount = individualCheckboxes.length;
        
        console.log(`[AbilityDetailsModal] Updating "Alle" state for ${raceType}: ${checkedCount}/${totalCount} checked`);
        
        if (checkedCount === 0) {
            // None checked - "Alle" inaktiv
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
            console.log(`[AbilityDetailsModal] ${raceType} - "Alle" set to unchecked (none selected)`);
        } else if (checkedCount === totalCount) {
            // All checked - "Alle" aktiv (checked)
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
            console.log(`[AbilityDetailsModal] ${raceType} - "Alle" set to checked (all selected)`);
        } else {
            // Some checked - "Alle" semi (indeterminate) - BUT DON'T AFFECT INDIVIDUAL CHECKBOXES
            allCheckbox.checked = false;
            allCheckbox.indeterminate = true;
            console.log(`[AbilityDetailsModal] ${raceType} - "Alle" set to indeterminate (${checkedCount}/${totalCount} selected) - individual checkboxes remain unchanged`);
        }
    }
    
    setRaceCheckboxesFromAbility(ability) {
        console.log(`[AbilityDetailsModal] ===== SETTING RACE CHECKBOXES =====`);
        console.log(`[AbilityDetailsModal] ===== DEBUG: ABILITY DATA =====`);
        console.log(`[AbilityDetailsModal] Ability ID: ${ability.id}`);
        console.log(`[AbilityDetailsModal] Ability Name: ${ability.name}`);
        console.log(`[AbilityDetailsModal] Ability Races:`, ability.races);
        console.log(`[AbilityDetailsModal] Ability CharacterData:`, ability.characterData);
        console.log(`[AbilityDetailsModal] Ability CharacterData.availableFor:`, ability.characterData?.availableFor);
        console.log(`[AbilityDetailsModal] Ability availableFor:`, ability.availableFor);
        console.log(`[AbilityDetailsModal] Ability assignedClasses:`, ability.assignedClasses);
        console.log(`[AbilityDetailsModal] ===== END DEBUG =====`);
        
        if (!this.currentModal || !ability) {
            console.log(`[AbilityDetailsModal] ✗ Modal or ability not available!`);
            return;
        }
        
        // Debug: Check if modal is properly attached to DOM
        console.log(`[AbilityDetailsModal] Modal in DOM:`, document.contains(this.currentModal));
        console.log(`[AbilityDetailsModal] Modal HTML:`, this.currentModal.outerHTML.substring(0, 200) + '...');
        
        // First, uncheck all race checkboxes
        const allRaceCheckboxes = this.currentModal.querySelectorAll('.race-checkbox');
        console.log(`[AbilityDetailsModal] Found ${allRaceCheckboxes.length} race checkboxes`);
        
        // Debug: List all found checkboxes
        allRaceCheckboxes.forEach((checkbox, index) => {
            console.log(`[AbilityDetailsModal] Checkbox ${index}:`, {
                id: checkbox.id,
                checked: checkbox.checked,
                class: checkbox.className
            });
        });
        
        allRaceCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Determine which races should be checked - IMPROVED LOGIC
        let racesToCheck = [];
        
        console.log(`[AbilityDetailsModal] Checking ability data sources:`);
        console.log(`[AbilityDetailsModal] - ability.races:`, ability.races);
        console.log(`[AbilityDetailsModal] - ability.characterData:`, ability.characterData);
        console.log(`[AbilityDetailsModal] - ability.characterData?.availableFor:`, ability.characterData?.availableFor);
        
        // Priority 1: Use assignedClasses if available (individual class assignments)
        if (ability.assignedClasses && Array.isArray(ability.assignedClasses) && ability.assignedClasses.length > 0) {
            // Use assignedClasses directly - don't convert to races
            racesToCheck = ability.assignedClasses.map(cls => cls.name);
            console.log(`[AbilityDetailsModal] ✓ Using ability.assignedClasses (individual classes):`, racesToCheck);
        }
        // Priority 2: Use ability.races if available and not empty (from peoples.json)
        else if (ability.races && Array.isArray(ability.races) && ability.races.length > 0) {
            racesToCheck = [...ability.races];
            console.log(`[AbilityDetailsModal] ✓ Using ability.races (from peoples.json):`, racesToCheck);
        }
        // Priority 3: Use assignedClasses to derive races (fallback)
        else if (ability.assignedClasses && Array.isArray(ability.assignedClasses) && ability.assignedClasses.length > 0) {
            racesToCheck = [...new Set(ability.assignedClasses.map(cls => {
                const raceMap = {
                    'dwarves': 'Dwarves',
                    'elves': 'Elves',
                    'humans': 'Humans',
                    'orcs': 'Orcs',
                    'goblins': 'Goblins'
                };
                return raceMap[cls.race] || cls.race.charAt(0).toUpperCase() + cls.race.slice(1);
            }))];
            console.log(`[AbilityDetailsModal] ✓ Using assignedClasses:`, ability.assignedClasses);
            console.log(`[AbilityDetailsModal] ✓ Converted to races:`, racesToCheck);
        }
        // Priority 3: Use characterData.availableFor (legacy)
        else if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor) && ability.characterData.availableFor.length > 0) {
            racesToCheck = ability.characterData.availableFor.map(race => 
                race.charAt(0).toUpperCase() + race.slice(1)
            );
            console.log(`[AbilityDetailsModal] ✓ Using characterData.availableFor (legacy):`, racesToCheck);
        }
        // Priority 4: Use direct availableFor field (legacy)
        else if (ability.availableFor && Array.isArray(ability.availableFor) && ability.availableFor.length > 0) {
            racesToCheck = ability.availableFor.map(race => 
                race.charAt(0).toUpperCase() + race.slice(1)
            );
            console.log(`[AbilityDetailsModal] ✓ Using availableFor (legacy):`, racesToCheck);
        }
        else {
            console.log(`[AbilityDetailsModal] ✗ No race data found in ability!`);
            console.log(`[AbilityDetailsModal] ===== NO RACES TO CHECK =====`);
            return;
        }
        
        console.log(`[AbilityDetailsModal] Races to check:`, racesToCheck);
        
        // Then check the ones that match the ability's races/classes
        racesToCheck.forEach(raceOrClass => {
            console.log(`[AbilityDetailsModal] Processing race/class: ${raceOrClass}`);
            
            // Check if this is a specific class name (from assignedClasses)
            const checkboxId = `race_${raceOrClass}`;
            console.log(`[AbilityDetailsModal] Looking for checkbox ID: ${checkboxId}`);
            
            // Fix: Use attribute selector for IDs with spaces
            const checkbox = this.currentModal.querySelector(`[id="${checkboxId}"]`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`[AbilityDetailsModal] ✓ Checked checkbox: ${checkboxId}`);
            } else {
                console.log(`[AbilityDetailsModal] ✗ Checkbox not found: ${checkboxId}`);
                // Debug: Try to find it with different selectors
                const alternativeSelectors = [
                    `#${checkboxId}`,
                    `[id="${checkboxId}"]`,
                    `input[id="${checkboxId}"]`,
                    `.race-checkbox[id="${checkboxId}"]`
                ];
                alternativeSelectors.forEach(selector => {
                    const found = this.currentModal.querySelector(selector);
                    console.log(`[AbilityDetailsModal] Alternative selector "${selector}":`, found ? 'FOUND' : 'NOT FOUND');
                });
            }
        });
        
        console.log(`[AbilityDetailsModal] ===== RACE CHECKBOXES SET COMPLETE =====`);
        
        // Note: initializeAllCheckboxStates() will be called after this method completes
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
            localStorage.setItem('abilitiesEditor_abilities', JSON.stringify({
                abilities: this.abilitiesEditor.getAbilities()
            }));
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

    isRaceSelected(ability, characterClass) {
        console.log(`[AbilityDetailsModal] isRaceSelected called for: ${characterClass}`);
        console.log(`[AbilityDetailsModal] Ability races:`, ability.races);
        console.log(`[AbilityDetailsModal] Ability characterData.availableFor:`, ability.characterData?.availableFor);
        
        // IMPROVED LOGIC: Check multiple data sources
        let availableRaces = [];
        
        // Priority 1: Use ability.races if available and not empty
        if (ability.races && Array.isArray(ability.races) && ability.races.length > 0) {
            availableRaces = [...ability.races];
            console.log(`[AbilityDetailsModal] ✓ Using ability.races:`, availableRaces);
        }
        // Priority 2: Use characterData.availableFor
        else if (ability.characterData && ability.characterData.availableFor && Array.isArray(ability.characterData.availableFor) && ability.characterData.availableFor.length > 0) {
            availableRaces = ability.characterData.availableFor.map(race => 
                race.charAt(0).toUpperCase() + race.slice(1)
            );
            console.log(`[AbilityDetailsModal] ✓ Using characterData.availableFor:`, availableRaces);
        }
        // Priority 3: Use direct availableFor field
        else if (ability.availableFor && Array.isArray(ability.availableFor) && ability.availableFor.length > 0) {
            availableRaces = ability.availableFor.map(race => 
                race.charAt(0).toUpperCase() + race.slice(1)
            );
            console.log(`[AbilityDetailsModal] ✓ Using availableFor:`, availableRaces);
        }
        else {
            console.log(`[AbilityDetailsModal] ✗ No race data found in ability!`);
            return false;
        }
        
        // Map character class to race
        const classToRace = {
            'Zwerg Schmied': 'Dwarves',
            'Zwerg Bergarbeiter': 'Dwarves',
            'Zwerg Krieger': 'Dwarves',
            'Elfen Bogenschütze': 'Elves',
            'Elfen Magier': 'Elves',
            'Elfen Waldläufer': 'Elves',
            'Goblin Kundschafter': 'Goblins',
            'Goblin Schamane': 'Goblins',
            'Goblin Krieger': 'Goblins',
            'Menschlicher Ritter': 'Humans',
            'Menschlicher Magier': 'Humans',
            'Menschlicher Händler': 'Humans',
            'Ork Berserker': 'Orcs',
            'Ork Häuptling': 'Orcs',
            'Ork Schamane': 'Orcs'
        };
        
        const characterRace = classToRace[characterClass];
        const isSelected = availableRaces.includes(characterRace);
        
        console.log(`[AbilityDetailsModal] ${characterClass} -> ${characterRace}, available: ${availableRaces}, selected: ${isSelected}`);
        
        return isSelected;
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
        console.log(`[AbilityDetailsModal] Setting up save button listener for ability: ${ability.name}`);
        
        if (!this.currentModal) {
            console.log(`[AbilityDetailsModal] No current modal found!`);
            return;
        }
        
        const saveBtn = this.currentModal.querySelector('.save-btn');
        console.log(`[AbilityDetailsModal] Save button found:`, saveBtn ? 'Yes' : 'No');
        
        if (saveBtn) {
            // Remove any existing listeners
            saveBtn.removeEventListener('click', this.handleSaveClick);
            
            // Add new listener
            this.handleSaveClick = async () => {
                console.log(`[AbilityDetailsModal] Save button clicked!`);
                await this.saveAbilityChanges(ability);
            };
            
            saveBtn.addEventListener('click', this.handleSaveClick);
            console.log(`[AbilityDetailsModal] Save button listener attached successfully`);
        } else {
            console.log(`[AbilityDetailsModal] Save button not found! Available buttons:`, this.currentModal.querySelectorAll('button'));
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
        console.log(`[AbilityDetailsModal] Starting save process for ability: ${ability.name} (ID: ${ability.id})`);
        console.log(`[AbilityDetailsModal] Original ability data:`, ability);
        
        // Get all editable fields
        const nameInput = this.currentModal.querySelector('[data-field="name"]');
        const categorySelect = this.currentModal.querySelector('[data-field="category"]');
        const elementRadio = this.currentModal.querySelector('[data-field="element"]:checked');
        const descriptionTextarea = this.currentModal.querySelector('[data-field="description"]');
        const costInput = this.currentModal.querySelector('[data-field="cost"]');
        const damageMinInput = this.currentModal.querySelector('[data-field="damage_min"]');
        const damageMaxInput = this.currentModal.querySelector('[data-field="damage_max"]');
        const healingMinInput = this.currentModal.querySelector('[data-field="healing_min"]');
        const healingMaxInput = this.currentModal.querySelector('[data-field="healing_max"]');
         
         
         if (nameInput) ability.name = nameInput.value.trim();
         if (categorySelect) ability.category = categorySelect.value;
         if (elementRadio) ability.element = elementRadio.value || null;
         if (descriptionTextarea) ability.description = descriptionTextarea.value.trim();
         if (costInput) ability.cost = parseInt(costInput.value) || 0;
         if (damageMinInput) ability.damage_min = parseInt(damageMinInput.value) || 0;
         if (damageMaxInput) ability.damage_max = parseInt(damageMaxInput.value) || 0;
         if (healingMinInput) ability.healing_min = parseInt(healingMinInput.value) || 0;
         if (healingMaxInput) ability.healing_max = parseInt(healingMaxInput.value) || 0;
        
        console.log(`[AbilityDetailsModal] Updated basic fields:`, {
            name: ability.name,
            category: ability.category,
            element: ability.element,
            description: ability.description,
            cost: ability.cost,
            damage_min: ability.damage_min,
            damage_max: ability.damage_max,
            healing_min: ability.healing_min,
            healing_max: ability.healing_max
        });
        
        
         
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
        
        console.log(`[AbilityDetailsModal] Updated buff/debuff values:`, {
            strength_value: ability.strength_value,
            defense_value: ability.defense_value,
            speed_value: ability.speed_value,
            magic_value: ability.magic_value,
            health_value: ability.health_value
        });
        
        // Get status effect checkboxes
        const statusPoisoned = this.currentModal.querySelector('[data-field="status_poisoned"]');
        const statusParalyzed = this.currentModal.querySelector('[data-field="status_paralyzed"]');
        const statusBlinded = this.currentModal.querySelector('[data-field="status_blinded"]');
        const statusSleeping = this.currentModal.querySelector('[data-field="status_sleeping"]');
        
        if (statusPoisoned) ability.status_poisoned = statusPoisoned.checked;
        if (statusParalyzed) ability.status_paralyzed = statusParalyzed.checked;
        if (statusBlinded) ability.status_blinded = statusBlinded.checked;
        if (statusSleeping) ability.status_sleeping = statusSleeping.checked;
        
        console.log(`[AbilityDetailsModal] Updated status effects:`, {
            status_poisoned: ability.status_poisoned,
            status_paralyzed: ability.status_paralyzed,
            status_blinded: ability.status_blinded,
            status_sleeping: ability.status_sleeping
        });
        
        // Get race assignments - IMPROVED APPROACH
        console.log(`[AbilityDetailsModal] Processing race assignments...`);
        
        // Get all race checkboxes (individual character classes)
        const raceCheckboxes = this.currentModal.querySelectorAll('.race-checkbox');
        console.log(`[AbilityDetailsModal] Found ${raceCheckboxes.length} race checkboxes`);
        
        // Collect all checked races AND assigned classes
        const selectedRaces = [];
        const assignedClasses = [];
        const raceMapping = {
            'Zwerg Schmied': 'Dwarves',
            'Zwerg Bergarbeiter': 'Dwarves', 
            'Zwerg Krieger': 'Dwarves',
            'Elfen Bogenschütze': 'Elves',
            'Elfen Magier': 'Elves',
            'Elfen Waldläufer': 'Elves',
            'Goblin Kundschafter': 'Goblins',
            'Goblin Schamane': 'Goblins',
            'Goblin Krieger': 'Goblins',
            'Menschlicher Ritter': 'Humans',
            'Menschlicher Magier': 'Humans',
            'Menschlicher Händler': 'Humans',
            'Ork Berserker': 'Orcs',
            'Ork Häuptling': 'Orcs',
            'Ork Schamane': 'Orcs'
        };
        
        raceCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const raceName = checkbox.getAttribute('data-race');
                console.log(`[AbilityDetailsModal] Checked race: ${raceName}`);
                
                // Add to assigned classes
                assignedClasses.push({
                    name: raceName,
                    race: raceMapping[raceName] ? raceMapping[raceName].toLowerCase() : 'unknown'
                });
                
                if (raceName && raceMapping[raceName]) {
                    const mappedRace = raceMapping[raceName];
                    if (!selectedRaces.includes(mappedRace)) {
                        selectedRaces.push(mappedRace);
                        console.log(`[AbilityDetailsModal] Added race: ${mappedRace}`);
                    }
                }
            }
        });
        
        console.log(`[AbilityDetailsModal] Final selected races:`, selectedRaces);
        console.log(`[AbilityDetailsModal] Final assigned classes:`, assignedClasses);
        
        // Set races array AND assigned classes
        ability.races = selectedRaces;
        ability.assignedClasses = assignedClasses;
        
        console.log(`[AbilityDetailsModal] Updated ability object:`, ability);
        console.log(`[AbilityDetailsModal] Ability.assignedClasses:`, ability.assignedClasses);
        
        // Also update characterData.availableFor for consistency
        if (ability.characterData) {
            ability.characterData.availableFor = selectedRaces.map(race => race.toLowerCase());
            console.log(`[AbilityDetailsModal] Updated characterData.availableFor:`, ability.characterData.availableFor);
        } else {
            ability.characterData = {
                availableFor: selectedRaces.map(race => race.toLowerCase())
            };
            console.log(`[AbilityDetailsModal] Created new characterData with availableFor:`, ability.characterData.availableFor);
        }
        
        // Update in both arrays
        const abilityInFiltered = this.abilitiesEditor.getFilteredAbilities().find(a => a.id === ability.id);
        console.log(`[AbilityDetailsModal] Found ability in filtered array:`, abilityInFiltered ? 'Yes' : 'No');
        
        if (abilityInFiltered) {
            console.log(`[AbilityDetailsModal] Updating filtered ability with new data...`);
            abilityInFiltered.name = ability.name;
            abilityInFiltered.category = ability.category;
            abilityInFiltered.element = ability.element;
            abilityInFiltered.description = ability.description;
            abilityInFiltered.cost = ability.cost;
            abilityInFiltered.damage_min = ability.damage_min;
            abilityInFiltered.damage_max = ability.damage_max;
            abilityInFiltered.healing_min = ability.healing_min;
            abilityInFiltered.healing_max = ability.healing_max;

            abilityInFiltered.strength_value = ability.strength_value;
            abilityInFiltered.defense_value = ability.defense_value;
            abilityInFiltered.speed_value = ability.speed_value;
            abilityInFiltered.magic_value = ability.magic_value;
            abilityInFiltered.health_value = ability.health_value;
            abilityInFiltered.status_poisoned = ability.status_poisoned;
            abilityInFiltered.status_paralyzed = ability.status_paralyzed;
            abilityInFiltered.status_blinded = ability.status_blinded;
            abilityInFiltered.status_sleeping = ability.status_sleeping;
            abilityInFiltered.races = ability.races;
            abilityInFiltered.assignedClasses = ability.assignedClasses;
            
            console.log(`[AbilityDetailsModal] Updated filtered ability assignedClasses:`, abilityInFiltered.assignedClasses);
            
            // Also update characterData.availableFor in filtered array
            if (abilityInFiltered.characterData) {
                abilityInFiltered.characterData.availableFor = ability.characterData.availableFor;
                console.log(`[AbilityDetailsModal] Updated filtered ability characterData.availableFor:`, abilityInFiltered.characterData.availableFor);
            } else {
                abilityInFiltered.characterData = ability.characterData;
                console.log(`[AbilityDetailsModal] Set filtered ability characterData:`, abilityInFiltered.characterData);
            }
        }
        
        // Save to localStorage
        try {
            console.log(`[AbilityDetailsModal] Saving to localStorage...`);
            const abilitiesData = {
                abilities: this.abilitiesEditor.getAbilities()
            };
            console.log(`[AbilityDetailsModal] localStorage data:`, abilitiesData);
            localStorage.setItem('abilitiesEditor_abilities', JSON.stringify(abilitiesData));
            console.log(`[AbilityDetailsModal] Successfully saved to localStorage`);
        } catch (error) {
            console.error('[AbilityDetailsModal] Error saving ability changes to localStorage:', error);
        }
        
        // Save to JSON file via core
        try {
            console.log(`[AbilityDetailsModal] Saving to JSON file via core...`);
            console.log(`[AbilityDetailsModal] Calling this.abilitiesEditor.core.saveAbilities()...`);
            await this.abilitiesEditor.core.saveAbilities();
            console.log(`[AbilityDetailsModal] Successfully saved to JSON file and server`);
            
            // Show success toast
            this.showToast('Fähigkeit erfolgreich gespeichert!', 'success');
        } catch (error) {
            console.error('[AbilityDetailsModal] Error saving to JSON file:', error);
            this.showToast('Fehler beim Speichern der Fähigkeit!', 'error');
        }
        
        // Close modal
        this.closeModal();
        
        // Refresh the table to show changes
        if (this.abilitiesEditor.ui && this.abilitiesEditor.ui.getAbilitiesTable()) {
            this.abilitiesEditor.ui.getAbilitiesTable().updateAbilitiesTable();
        }
     }
     
     showToast(message, type = 'info') {
         // Create toast element
         const toast = document.createElement('div');
         toast.className = `toast toast-${type}`;
         toast.textContent = message;
         
         // Add styles
         Object.assign(toast.style, {
             position: 'fixed',
             top: '20px',
             right: '20px',
             padding: '12px 20px',
             borderRadius: '6px',
             color: 'white',
             fontWeight: '500',
             zIndex: '10000',
             opacity: '0',
             transform: 'translateX(100%)',
             transition: 'all 0.3s ease',
             maxWidth: '300px',
             wordWrap: 'break-word'
         });
         
         // Set background color based on type
         switch (type) {
             case 'success':
                 toast.style.backgroundColor = '#10b981';
                 break;
             case 'error':
                 toast.style.backgroundColor = '#ef4444';
                 break;
             case 'warning':
                 toast.style.backgroundColor = '#f59e0b';
                 break;
             default:
                 toast.style.backgroundColor = '#3b82f6';
         }
         
         // Add to DOM
         document.body.appendChild(toast);
         
         // Animate in
         setTimeout(() => {
             toast.style.opacity = '1';
             toast.style.transform = 'translateX(0)';
         }, 100);
         
         // Remove after 3 seconds
         setTimeout(() => {
             toast.style.opacity = '0';
             toast.style.transform = 'translateX(100%)';
             setTimeout(() => {
                 if (toast.parentNode) {
                     toast.parentNode.removeChild(toast);
                 }
             }, 300);
         }, 3000);
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
