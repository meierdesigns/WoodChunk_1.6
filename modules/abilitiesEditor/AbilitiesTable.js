/**
 * Abilities Table Module
 */
class AbilitiesTable {
    constructor(abilitiesEditor) {
        this.abilitiesEditor = abilitiesEditor;
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

    initializeAbilitiesTable() {
        console.log('[AbilitiesTable] Initializing abilities table...');
        console.log('[AbilitiesTable] Available races:', this.abilitiesEditor.getAvailableRaces());
        console.log('[AbilitiesTable] Filtered abilities:', this.abilitiesEditor.getFilteredAbilities().length);
        
        // Set up action button listeners
        this.setupActionButtonListeners();
        
        // Update table with current data
        this.updateAbilitiesTable();
    }

    updateAbilitiesTable() {
        const tableBody = document.getElementById('abilitiesTableBody');
        if (!tableBody) {
            console.error('[AbilitiesTable] Table body not found');
            return;
        }

        console.log('[AbilitiesTable] Updating table with', this.abilitiesEditor.getFilteredAbilities().length, 'abilities');

        // Clear existing rows
        tableBody.innerHTML = '';

        // Add rows for each ability
        this.abilitiesEditor.getFilteredAbilities().forEach(ability => {
            const row = this.createAbilityRow(ability);
            tableBody.appendChild(row);
        });
        
    }

    createAbilityRow(ability) {
        const row = document.createElement('tr');
        row.className = 'ability-row';
        row.dataset.abilityId = ability.id;

        // Icon column
        const iconCell = document.createElement('td');
        iconCell.className = 'col-icon';
        iconCell.innerHTML = this.abilitiesEditor.getAbilityIcon(ability);
        row.appendChild(iconCell);

        // Name column
        const nameCell = document.createElement('td');
        nameCell.className = 'col-name';
        nameCell.innerHTML = `
            <div class="ability-name-cell">
                <span class="ability-type-icon">${this.abilitiesEditor.getTypeIcon(ability)}</span>
                <span class="ability-name clickable" data-ability-id="${ability.id}">${ability.name}</span>
            </div>
        `;
        row.appendChild(nameCell);



        // Description column
        const descriptionCell = document.createElement('td');
        descriptionCell.className = 'col-description';
        const description = ability.description || '';
        descriptionCell.innerHTML = `<div class="description-text">${description}</div>`;
        
        // Add tooltip positioning for description
        const descriptionElement = descriptionCell.querySelector('.description-text');
        if (descriptionElement) {
            descriptionElement.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = description;
                tooltip.style.cssText = `
                    position: fixed;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    white-space: nowrap;
                    z-index: 99999;
                    pointer-events: none;
                    max-width: 300px;
                    word-wrap: break-word;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    left: ${e.clientX + 10}px;
                    top: ${e.clientY - 40}px;
                `;
                document.body.appendChild(tooltip);
                e.target._tooltip = tooltip;
            });
            
            descriptionElement.addEventListener('mouseleave', (e) => {
                if (e.target._tooltip) {
                    e.target._tooltip.remove();
                    e.target._tooltip = null;
                }
            });
        }
        
        row.appendChild(descriptionCell);

        // Cost column
        const costCell = document.createElement('td');
        costCell.className = 'col-cost';
        costCell.innerHTML = `<span class="cost-value">${ability.cost || '0'}</span>`;
        row.appendChild(costCell);



        return row;
    }








    setupActionButtonListeners() {
        // Use event delegation for action buttons and clickable ability names
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-info')) {
                const abilityId = e.target.dataset.abilityId;
                this.abilitiesEditor.getAbilityDetailsModal().showAbilityDetails(abilityId);
            } else if (e.target.classList.contains('btn-secondary')) {
                const abilityId = e.target.dataset.abilityId;
                this.abilitiesEditor.openEditModal(this.abilitiesEditor.getAbilities().find(a => a.id == abilityId));
            } else if (e.target.classList.contains('btn-test')) {
                const abilityId = e.target.dataset.abilityId;
                this.abilitiesEditor.getAbilityDetailsModal().showAbilityDetails(abilityId);
            } else if (e.target.classList.contains('ability-name') && e.target.classList.contains('clickable')) {
                const abilityId = e.target.dataset.abilityId;
                const ability = this.abilitiesEditor.getFilteredAbilities().find(a => a.id == abilityId);
                if (ability) {
                    this.abilitiesEditor.getAbilityDetailsModal().showAbilityDetails(abilityId);
                } else {
                    const abilityInAll = this.abilitiesEditor.getAbilities().find(a => a.id == abilityId);
                    if (abilityInAll) {
                        this.abilitiesEditor.getAbilityDetailsModal().showAbilityDetails(abilityId);
                    }
                }
            }
        });
    }


    saveAbilities() {
        try {
            localStorage.setItem('abilitiesData', JSON.stringify(this.abilitiesEditor.getAbilities()));
        } catch (error) {
            // Silent error handling
        }
    }
}

// Global availability
window.AbilitiesTable = AbilitiesTable;
