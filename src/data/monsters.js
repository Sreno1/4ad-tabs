/**
 * Monster definitions and tables for Four Against Darkness
 */

// Monster Templates with base stats
export const MONSTER_TEMPLATES = {
  // Vermin - weakest enemies
  vermin: { name: 'Vermin', level: 1, baseHP: 1, special: null },
  
  // Minions - standard enemies
  minion: { name: 'Minion', level: 2, baseHP: 2, special: null },
  
  // Major Foes - level set by HCL
  major: { name: 'Major Foe', level: 0, baseHP: 6, special: null },
  
  // Boss - level set by HCL+1
  boss: { name: 'Boss', level: 0, baseHP: 10, special: 'boss' },
  
  // Wandering monsters by level
  goblin: { name: 'Goblin', level: 1, baseHP: 2, special: null },
  orc: { name: 'Orc', level: 2, baseHP: 4, special: null },
  troll: { name: 'Troll', level: 3, baseHP: 6, special: 'regenerate' },
  ogre: { name: 'Ogre', level: 4, baseHP: 8, special: null },
  dragon: { name: 'Dragon', level: 5, baseHP: 12, special: 'breath' }
};

// Wandering Monster Table (d6)
export const WANDERING_TABLE = [
  '', // 0 - unused
  'goblin',
  'orc', 
  'troll',
  'ogre',
  'dragon',
  'special' // 6 - roll on special table
];

// Map wandering roll to monster type
export const WANDERING_TABLE_DISPLAY = [
  '',
  'Goblin (L1)',
  'Orc (L2)',
  'Troll (L3)',
  'Ogre (L4)',
  'Dragon (L5)',
  'Special'
];

/**
 * Calculate monster HP based on template and level
 * @param {string} type - Monster template key
 * @param {number} level - Monster level (overrides template if provided)
 * @returns {number} Monster HP
 */
export const calculateMonsterHP = (type, level = null) => {
  const template = MONSTER_TEMPLATES[type];
  if (!template) return 1;
  
  const effectiveLevel = level || template.level;
  return template.baseHP + (effectiveLevel > 1 ? (effectiveLevel - 1) * 2 : 0);
};

/**
 * Create a monster instance
 * @param {string} type - Monster template key
 * @param {number} level - Override level (optional)
 * @returns {object} Monster object
 */
export const createMonster = (type, level = null) => {
  const template = MONSTER_TEMPLATES[type];
  if (!template) return null;
  
  const effectiveLevel = level || template.level;
  const hp = calculateMonsterHP(type, effectiveLevel);
  
  return {
    id: Date.now() + Math.random(),
    name: template.name,
    level: effectiveLevel,
    hp,
    maxHp: hp,
    type,
    special: template.special
  };
};
