/**
 * Magic System definitions for Four Against Darkness (Phase 4)
 * Spells for Wizards and Elves
 */

// Spell definitions
export const SPELLS = {
  // Combat Spells
  fireball: {
    name: 'Fireball',
    type: 'attack',
    description: 'Deals 1d6 damage to all enemies',
    effect: 'aoe_damage',
    damage: '1d6',
    target: 'all_enemies'
  },
  lightning: {
    name: 'Lightning Bolt',
    type: 'attack', 
    description: 'Deals 2d6 damage to one enemy',
    effect: 'single_damage',
    damage: '2d6',
    target: 'single'
  },
  sleep: {
    name: 'Sleep',
    type: 'control',
    description: 'Puts enemies up to level 3 to sleep (skip their turn)',
    effect: 'sleep',
    maxLevel: 3,
    target: 'all_enemies'
  },
  
  // Defensive Spells
  shield: {
    name: 'Shield',
    type: 'defense',
    description: '+2 to defense rolls for the caster this encounter',
    effect: 'defense_buff',
    bonus: 2,
    duration: 'encounter',
    target: 'self'
  },
  mirror_image: {
    name: 'Mirror Image',
    type: 'defense',
    description: 'First attack against caster automatically misses',
    effect: 'absorb_hit',
    charges: 1,
    target: 'self'
  },
  
  // Utility Spells
  light: {
    name: 'Light',
    type: 'utility',
    description: 'Illuminates dark areas, +1 to search rolls',
    effect: 'search_buff',
    bonus: 1,
    duration: 'adventure',
    target: 'party'
  },
  detect_magic: {
    name: 'Detect Magic',
    type: 'utility',
    description: 'Reveals hidden magical traps and items',
    effect: 'detect',
    target: 'room'
  },
  telekinesis: {
    name: 'Telekinesis',
    type: 'utility',
    description: 'Move objects at a distance, disarm traps from afar',
    effect: 'remote_disarm',
    bonus: 2,
    target: 'single'
  },
  
  // Healing/Support (Elf-themed)
  healing_word: {
    name: 'Healing Word',
    type: 'healing',
    description: 'Heals one ally for 1d6 HP',
    effect: 'heal',
    healing: '1d6',
    target: 'single_ally'
  },
  escape: {
    name: 'Escape',
    type: 'utility',
    description: 'Automatically succeed on one flee attempt',
    effect: 'auto_flee',
    target: 'party'
  }
};

// Spells available to Wizards
export const WIZARD_SPELLS = [
  'fireball', 'lightning', 'sleep', 'shield', 'mirror_image', 
  'light', 'detect_magic', 'telekinesis'
];

// Spells available to Elves (more nature/support focused)
export const ELF_SPELLS = [
  'lightning', 'sleep', 'shield', 'light', 'detect_magic', 
  'healing_word', 'escape'
];

/**
 * Get available spells for a class
 * @param {string} classKey - Hero class key
 * @returns {string[]} Array of spell keys
 */
export const getAvailableSpells = (classKey) => {
  if (classKey === 'wizard') return WIZARD_SPELLS;
  if (classKey === 'elf') return ELF_SPELLS;
  return [];
};

/**
 * Get spell slots for a character
 * @param {string} classKey - Hero class key
 * @param {number} level - Character level
 * @returns {number} Number of spell slots
 */
export const getSpellSlots = (classKey, level) => {
  if (classKey === 'wizard') return level + 2;
  if (classKey === 'elf') return level;
  return 0;
};

/**
 * Cast a spell
 * @param {string} spellKey - Spell to cast
 * @param {object} caster - Hero casting
 * @param {array} targets - Target(s) of the spell
 * @returns {object} Spell result
 */
export const castSpell = (spellKey, caster, targets = []) => {
  const spell = SPELLS[spellKey];
  if (!spell) return { success: false, message: 'Unknown spell' };
  
  const result = {
    spell: spellKey,
    spellName: spell.name,
    caster: caster.name,
    type: spell.type,
    effect: spell.effect,
    success: true,
    targets: [],
    message: `${caster.name} casts ${spell.name}!`
  };
  
  // Calculate damage/healing based on effect
  if (spell.damage) {
    const [dice, sides] = spell.damage.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    result.value = total;
    result.message += ` Deals ${total} damage!`;
  }
  
  if (spell.healing) {
    const [dice, sides] = spell.healing.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    result.value = total;
    result.message += ` Heals ${total} HP!`;
  }
  
  if (spell.bonus) {
    result.bonus = spell.bonus;
    result.message += ` +${spell.bonus} bonus applied!`;
  }
  
  return result;
};

export default {
  SPELLS,
  WIZARD_SPELLS,
  ELF_SPELLS,
  getAvailableSpells,
  getSpellSlots,
  castSpell
};
