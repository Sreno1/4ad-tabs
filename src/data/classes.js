/**
 * Character class definitions for Four Against Darkness
 */

export const CLASSES = {
  warrior: { 
    name: 'Warrior', 
    atk: '+L', 
    def: '0', 
    life: 6, 
    sp: 'All weapons/armor',
    abilities: []
  },
  cleric: { 
    name: 'Cleric', 
    atk: '+½L (+L undead)', 
    def: '0', 
    life: 4, 
    sp: 'Heal×3, Bless×3',
    abilities: ['heal', 'bless']
  },
  rogue: { 
    name: 'Rogue', 
    atk: '+L outnumbered', 
    def: '+L', 
    life: 3, 
    sp: 'Traps+L',
    abilities: []
  },
  wizard: { 
    name: 'Wizard', 
    atk: '+L spells', 
    def: '0', 
    life: 2, 
    sp: 'L+2 slots',
    abilities: ['spells']
  },
  barbarian: { 
    name: 'Barbarian', 
    atk: '+L', 
    def: '0', 
    life: 7, 
    sp: 'Rage, no magic',
    abilities: ['rage']
  },
  halfling: { 
    name: 'Halfling', 
    atk: '+L sling', 
    def: '+L large', 
    life: 3, 
    sp: 'L+1 Luck',
    abilities: ['luck']
  },
  dwarf: { 
    name: 'Dwarf', 
    atk: '+L melee', 
    def: '+1 large', 
    life: 5, 
    sp: 'Gold sense',
    abilities: []
  },
  elf: { 
    name: 'Elf', 
    atk: '+L (not 2H)', 
    def: '0', 
    life: 4, 
    sp: 'L spells',
    abilities: ['spells']
  }
};

/**
 * Get the number of spell slots for a class at a given level
 * @param {string} classKey - The class key (wizard, elf)
 * @param {number} level - Character level
 * @returns {number} Number of spell slots
 */
export const getSpellSlots = (classKey, level) => {
  if (classKey === 'wizard') return level + 2;
  if (classKey === 'elf') return level;
  return 0;
};

/**
 * Get luck points for Halfling at a given level
 * @param {number} level - Character level
 * @returns {number} Number of luck points
 */
export const getLuckPoints = (level) => level + 1;

/**
 * Calculate max HP for a class at a given level
 * @param {string} classKey - The class key
 * @param {number} level - Character level
 * @returns {number} Maximum HP
 */
export const getMaxHP = (classKey, level) => {
  const classData = CLASSES[classKey];
  return classData ? classData.life + level : level;
};
