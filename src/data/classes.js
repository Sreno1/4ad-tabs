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
  },
  paladin: {
    name: 'Paladin',
    atk: '+L',
    def: '0',
    life: 6,
    sp: 'L+1 prayer pts, mount',
    abilities: ['prayer', 'mount'],
    restrictions: 'Lx10gp tithe, never flee'
  },
  ranger: {
    name: 'Ranger',
    atk: '+L, dual wield ½L',
    def: '0',
    life: 6,
    sp: 'Sworn enemy, survival',
    abilities: ['dualWield', 'swornEnemy']
  },
  druid: {
    name: 'Druid',
    atk: '+½L',
    def: '0',
    life: 3,
    sp: 'L+2 druid spells, companion',
    abilities: ['druidSpells', 'animalCompanion']
  },
  acrobat: {
    name: 'Acrobat',
    atk: '+½L',
    def: '+L',
    life: 3,
    sp: 'L+3 tricks',
    abilities: ['tricks']
  },
  assassin: {
    name: 'Assassin',
    atk: '+L',
    def: '0',
    life: 3,
    sp: 'Hide in shadows, 3x dmg',
    abilities: ['hideInShadows']
  },
  illusionist: {
    name: 'Illusionist',
    atk: '+L spells',
    def: '0',
    life: 2,
    sp: 'L+3 illusion spells',
    abilities: ['illusionSpells', 'distractingLights']
  },
  swashbuckler: {
    name: 'Swashbuckler',
    atk: '+½L, dual wield',
    def: '+½L',
    life: 4,
    sp: 'Panache points',
    abilities: ['panache', 'dualWield']
  },
  bulwark: {
    name: 'Bulwark',
    atk: '+½L melee, +Tier ranged',
    def: '+½L',
    life: 7,
    sp: 'Sacrifice, limited heal',
    abilities: ['sacrifice'],
    restrictions: 'Rare, heal last'
  },
  gnome: {
    name: 'Gnome',
    atk: '+½L',
    def: '+½L',
    life: 5,
    sp: 'L+6 gadgets, 1 illusion',
    abilities: ['gadgets', 'oneIllusion']
  },
  kukla: {
    name: 'Kukla',
    atk: '+1 light blade',
    def: '+½L',
    life: 5,
    sp: 'Artificial, compartment',
    abilities: ['artificial', 'secretCompartment'],
    restrictions: 'Rare, unhealing'
  },
  lightGladiator: {
    name: 'Light Gladiator',
    atk: '+½L light only',
    def: '+½L',
    life: 5,
    sp: 'Dual wield, parry',
    abilities: ['dualWield', 'parry']
  },
  mushroomMonk: {
    name: 'Mushroom Monk',
    atk: '+L martial, +½L other',
    def: '+½L',
    life: 3,
    sp: 'Flurry, Tier spores',
    abilities: ['flurry', 'spores'],
    restrictions: 'Rare'
  }
};

/**
 * Get the number of spell slots for a class at a given level
 * @param {string} classKey - The class key (wizard, elf, druid, illusionist, gnome)
 * @param {number} level - Character level
 * @returns {number} Number of spell slots
 */
export const getSpellSlots = (classKey, level) => {
  if (classKey === 'wizard') return level + 2;
  if (classKey === 'druid') return level + 2;
  if (classKey === 'illusionist') return level + 3;
  if (classKey === 'elf') return level;
  if (classKey === 'gnome') return level; // 1 spell from illusion list
  return 0;
};

/**
 * Get luck points for Halfling at a given level
 * @param {number} level - Character level
 * @returns {number} Number of luck points
 */
export const getLuckPoints = (level) => level + 1;

/**
 * Get prayer points for Paladin at a given level
 * @param {number} level - Character level
 * @returns {number} Number of prayer points
 */
export const getPrayerPoints = (level) => level + 1;

/**
 * Get trick points for Acrobat at a given level
 * @param {number} level - Character level
 * @returns {number} Number of trick points
 */
export const getTrickPoints = (level) => level + 3;

/**
 * Get gadget points for Gnome at a given level
 * @param {number} level - Character level
 * @returns {number} Number of gadget points
 */
export const getGadgetPoints = (level) => level + 6;

/**
 * Get panache points for Swashbuckler (max capacity)
 * @param {number} level - Character level
 * @returns {number} Maximum panache points
 */
export const getMaxPanache = (level) => level;

/**
 * Get flurry attacks for Mushroom Monk based on tier
 * @param {number} level - Character level
 * @returns {number} Number of attacks in flurry
 */
export const getFlurryAttacks = (level) => {
  if (level >= 9) return 3; // Master (L9-12)
  if (level >= 5) return 2; // Expert (L5-8)
  return 1; // Novice/Heroic (L1-4)
};

/**
 * Get tier from level
 * @param {number} level - Character level
 * @returns {number} Tier (1-4)
 */
export const getTier = (level) => {
  if (level >= 9) return 3; // Master
  if (level >= 5) return 2; // Expert
  if (level >= 3) return 1; // Heroic
  return 0; // Novice
};

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
