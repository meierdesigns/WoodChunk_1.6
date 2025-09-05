/**
 * Abilities Game Module
 * Handles game mechanics, abilities logic, and race assignments
 */
class AbilitiesGame {
    constructor(core) {
        this.core = core;
    }

    initialize() {
        console.log('[AbilitiesGame] Game module initialized');
    }

    // Race management
    normalizeRaceName(raceName) {
        if (!raceName) return 'Unknown';
        
        const raceMap = {
            'humans': 'Humans',
            'elves': 'Elves', 
            'dwarves': 'Dwarves',
            'orcs': 'Orcs',
            'goblins': 'Goblins',
            'Menschen': 'Humans',
            'Elfen': 'Elves',
            'Zwerge': 'Dwarves',
            'Orks': 'Orcs',
            'human': 'Humans',
            'elf': 'Elves',
            'dwarf': 'Dwarves',
            'orc': 'Orcs',
            'goblin': 'Goblins'
        };
        
        const normalized = raceMap[raceName.toLowerCase()] || raceName;
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    getRaceEmoji(race) {
        const raceEmojis = {
            'Menschen': '👤',
            'Humans': '👤',
            'Elfen': '🧝',
            'Elves': '🧝',
            'Zwerge': '🧔',
            'Dwarves': '🧔',
            'Orks': '🧌',
            'Orcs': '🧌',
            'Goblins': '👺',
            'Goblin': '👺',
            'Mensch': '👨',
            'Elf': '🧝',
            'Zwerg': '🧙',
            'Ork': '👹',
            'Halbling': '🧒',
            'Gnom': '👴',
            'Tiefling': '😈',
            'Drachenblut': '🐲',
            'Waldelf': '🌲',
            'Hochelf': '✨',
            'Dunkelelfen': '🌑'
        };
        return raceEmojis[race] || '👤';
    }

    // Ability mechanics
    getAbilityIcon(ability) {
        if (!ability) {
            console.warn('[AbilitiesGame] getAbilityIcon: ability is undefined');
            return '<span class="fallback-icon">📋</span>';
        }
        
        const iconPath = this.generateIconPath(ability);
        const fallbackEmoji = this.getEmojiIcon(ability);
        const abilityName = ability.name || 'Unknown';
        
        return `<img src="${iconPath}" alt="${abilityName}" class="ability-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" /><span class="fallback-icon" style="display: none;">${fallbackEmoji}</span>`;
    }

    generateIconPath(ability) {
        if (!ability || !ability.name) {
            console.warn('[AbilitiesGame] generateIconPath: ability or ability.name is undefined', ability);
            return '../../assets/abilities/default/unknown.png';
        }
        
        // Use existing iconPath if available
        if (ability.iconPath) {
            return ability.iconPath.replace('assets/', '../../assets/');
        }
        
        let filename = ability.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/^_+|_+$/g, '');
        
        // Special cases for better filename mapping
        const specialCases = {
            'feuerball': 'fireball',
            'schwerthieb': 'sword_strike',
            'heilung': 'heal',
            'schmiedekunst': 'smithing',
            'überzeugung': 'persuasion',
            'überreden': 'persuade',
            'regeneration': 'regeneration',
            'adlerauge': 'eagle_eye',
            'magischer_schild': 'magic_shield',
            'eisenhaut': 'iron_skin',
            'zweihandkampf': 'two_handed_combat',
            'przisionsschuss': 'precision_shot',
            'axtwut': 'axe_rage',
            'kampferprobt': 'battle_tested',
            'berserkerwut': 'berserker_rage',
            'bogenprzision': 'bow_precision',
            'gegenangriff': 'counter_attack',
            'dolchsto': 'dagger_stab',
            'schneller_schritt': 'quick_step',
            'schildsto': 'shield_bash',
            'schildwall': 'shield_wall',
            'tarnung': 'camouflage',
            'schwertmeister': 'sword_master',
            'wirbelwind': 'whirlwind'
        };
        
        if (specialCases[filename]) {
            filename = specialCases[filename];
        }
        
        return `../../assets/abilities/${ability.category}/${filename}.png`;
    }

    getEmojiIcon(ability) {
        if (!ability) {
            console.warn('[AbilitiesGame] getEmojiIcon: ability is undefined');
            return '📋';
        }
        
        const emojiMap = {
            combat: {
                angriff: '⚔️',
                verteidigung: '🛡️',
                hieb: '💥',
                schlag: '👊',
                schnitt: '🗡️',
                stich: '🏹',
                default: '⚔️'
            },
            magic: {
                feuer: '🔥',
                wasser: '💧',
                erde: '🌍',
                luft: '💨',
                licht: '✨',
                schatten: '🌑',
                heilung: '💚',
                zauber: '🔮',
                default: '🔮'
            },
            craft: {
                schmieden: '🔨',
                handwerk: '⚒️',
                bauen: '🏗️',
                reparieren: '🔧',
                kochen: '👩‍🍳',
                brauen: '⚗️',
                default: '⚒️'
            },
            social: {
                überzeugung: '💬',
                verhandlung: '🤝',
                diplomatie: '🕊️',
                handel: '💰',
                führung: '👑',
                default: '💬'
            },
            passive: {
                resistenz: '🛡️',
                immunität: '💎',
                regeneration: '💚',
                verstärkung: '💪',
                default: '🛡️'
            }
        };
        
        const categoryMap = emojiMap[ability.category] || {};
        const typeKey = ability.type ? ability.type.toLowerCase() : '';
        const nameKey = ability.name ? ability.name.toLowerCase() : '';
        
        for (const [keyword, emoji] of Object.entries(categoryMap)) {
            if (typeKey.includes(keyword) || nameKey.includes(keyword)) {
                return emoji;
            }
        }
        
        return categoryMap.default || '📋';
    }

    getTypeIcon(ability) {
        if (!ability || !ability.type) {
            console.warn('[AbilitiesGame] getTypeIcon: ability or ability.type is undefined', ability);
            return '📋';
        }
        
        const typeIconMap = {
            'angriff': '⚔️',
            'hieb': '💥',
            'schlag': '👊',
            'schnitt': '🗡️',
            'stich': '🏹',
            'schuss': '🏹',
            'wurf': '🪃',
            'finesse': '⚡',
            'kraft': '💪',
            'feuer': '🔥',
            'wasser': '💧',
            'erde': '🌍',
            'luft': '💨',
            'licht': '✨',
            'schatten': '🌑',
            'heilung': '💚',
            'zauber': '🔮',
            'beschwörung': '👻',
            'verwandlung': '🔄',
            'illusion': '👁️',
            'nekromantie': '💀',
            'schmieden': '🔨',
            'handwerk': '⚒️',
            'bauen': '🏗️',
            'reparieren': '🔧',
            'kochen': '👩‍🍳',
            'brauen': '⚗️',
            'verzaubern': '✨',
            'alchemie': '⚗️',
            'überzeugung': '💬',
            'verhandlung': '🤝',
            'diplomatie': '🕊️',
            'handel': '💰',
            'führung': '👑',
            'einschüchterung': '😠',
            'charisma': '😊',
            'resistenz': '🛡️',
            'immunität': '💎',
            'regeneration': '💚',
            'verstärkung': '💪',
            'bewegung': '👟',
            'sinne': '👁️',
            'willenskraft': '🧠'
        };
        
        const typeKey = ability.type.toLowerCase();
        
        if (typeIconMap[typeKey]) {
            return typeIconMap[typeKey];
        }
        
        for (const [keyword, icon] of Object.entries(typeIconMap)) {
            if (typeKey.includes(keyword)) {
                return icon;
            }
        }
        
        const categoryFallbacks = {
            'combat': '⚔️',
            'magic': '🔮',
            'craft': '⚒️',
            'social': '💬'
        };
        
        return categoryFallbacks[ability.category] || '📋';
    }

    getElementDisplay(ability) {
        if (!ability || !ability.element) {
            return '<span class="no-element">-</span>';
        }
        
        const elementIcons = {
            'physical': '⚔️',
            'fire': '🔥',
            'water': '💧',
            'earth': '🏔️',
            'air': '💨',
            'lightning': '⚡',
            'ice': '❄️',
            'nature': '🌿',
            'shadow': '🌑',
            'light': '✨',
            'holy': '✨',
            'dark': '🌑',
            'poison': '☠️',
            'acid': '🧪',
            'psychic': '🧠'
        };
        
        const icon = elementIcons[ability.element] || '❓';
        return `<span class="element-display" title="${ability.element}">${icon}</span>`;
    }

    getEvolutionsDisplay(ability) {
        if (!ability || !ability.characterData) {
            return '<span class="no-evolutions">-</span>';
        }
        
        const evolvedFrom = ability.characterData.evolvedFrom;
        const evolvesTo = ability.characterData.evolvesTo;
        
        let display = '';
        
        if (evolvedFrom) {
            display += `<div class="evolution-info">
                <span class="evolution-label">Von:</span>
                <span class="base-ability">${evolvedFrom}</span>
            </div>`;
        }
        
        if (evolvesTo && evolvesTo.length > 0) {
            display += `<div class="evolution-info">
                <span class="evolution-label">Zu:</span>
                <span class="evolved-abilities">${evolvesTo.join(', ')}</span>
            </div>`;
        }
        
        if (!evolvedFrom && (!evolvesTo || evolvesTo.length === 0)) {
            display = '<span class="no-evolutions">Keine Verknüpfungen</span>';
        }
        
        return display;
    }

    getDefaultElementForCategory(category) {
        const defaultElements = {
            'combat': 'physical',
            'magic': 'magic',
            'craft': null,
            'social': null,
            'passive': null
        };
        return defaultElements[category] || null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AbilitiesGame;
}
