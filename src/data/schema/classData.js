/**
 * Class Data - Full character class definitions using the Class Schema
 * All 19 official Four Against Darkness classes with complete stats
 */

import { ClassSchema, ClassCombatBonuses, calculateClassAttackBonus, calculateClassDefenseBonus } from './class.js';

/**
 * Complete class definitions following ClassSchema
 * Each class includes: id, name, baseHp, lifeFormula, attackFormula, defenseFormula,
 * allowedArmor, allowedWeapons, magicUse, stealth, savesAs, and optional fields
 */
export const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    baseHp: 6,
    lifeFormula: 'L+6',
    attackFormula: 'L',
    defenseFormula: 'none',
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand', 'twoHanded', 'ranged', 'any'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'warrior',
    startingWealth: '3d6',
    startingEquipment: ['hand_weapon', 'shield', 'light_armor', 'lantern'],
    description: 'Master of weapons and armor. Full attack bonus with all weapons.'
  },

  cleric: {
    id: 'cleric',
    name: 'Cleric',
    baseHp: 4,
    lifeFormula: 'L+4',
    attackFormula: 'halfL',
    attackConditions: [
      { vs: ['undead'], bonus: 'L', description: 'Full L bonus vs undead' }
    ],
    defenseFormula: 'none',
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand', 'twoHanded'],
    magicUse: 'cleric',
    stealth: 'none',
    savesAs: 'cleric',
    specialAbilities: [
      { key: 'healing', name: 'Healing', uses: 3, effect: 'heal d6+L Life' },
      { key: 'bless', name: 'Blessing', uses: 3, effect: 'remove curse or petrification' }
    ],
    startingWealth: '3d6',
    startingEquipment: ['hand_weapon', 'shield', 'light_armor', 'lantern'],
    description: 'Divine warrior with healing and blessing prayers.'
  },

  rogue: {
    id: 'rogue',
    name: 'Rogue',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'none',
    attackConditions: [
      { type: 'outnumberMinorFoe', bonus: 'L', description: 'L bonus when party outnumbers minor foes' }
    ],
    defenseFormula: 'L',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'ranged'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'rogue',
    specialAbilities: [
      { key: 'lockpicking', bonus: 'L' },
      { key: 'disarmTraps', bonus: 'L' }
    ],
    startingWealth: '2d6',
    startingEquipment: ['light_weapon', 'light_armor', 'lantern'],
    description: 'Master of locks, traps, and evasion. Defensive specialist.'
  },

  wizard: {
    id: 'wizard',
    name: 'Wizard',
    baseHp: 2,
    lifeFormula: 'L+2',
    attackFormula: 'none',
    attackConditions: [
      { weapon: 'light', penalty: -1, description: '-1 with light weapons' }
    ],
    defenseFormula: 'none',
    allowedArmor: 'none',
    allowedWeapons: ['light'],
    magicUse: 'wizard',
    stealth: 'none',
    savesAs: 'wizard',
    specialAbilities: [
      { key: 'spellcasting', slots: 'L+2', bonus: 'L', spellList: 'wizard' }
    ],
    startingWealth: '2d6',
    startingEquipment: ['light_weapon', 'lantern'],
    description: 'Master of arcane magic. L+2 spell slots.'
  },

  barbarian: {
    id: 'barbarian',
    name: 'Barbarian',
    baseHp: 7,
    lifeFormula: 'L+7',
    attackFormula: 'L',
    defenseFormula: 'none',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'twoHanded', 'ranged'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'barbarian',
    specialAbilities: [
      {
        key: 'rage',
        uses: '1+floor(L/2)',
        effect: '+2 attack, triple roll, double damage',
        description: 'Enter a rage for devastating power'
      }
    ],
    startingWealth: '3d6',
    startingEquipment: ['two_handed_weapon', 'torch_12'],
    description: 'Savage warrior with rage ability. Cannot use magic.'
  },

  halfling: {
    id: 'halfling',
    name: 'Halfling',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'none',
    attackConditions: [
      { weapon: 'sling', bonus: 'L', description: 'Full L bonus with sling' }
    ],
    defenseFormula: 'none',
    defenseConditions: [
      { vs: ['giant', 'troll', 'ogre', 'half-giant'], bonus: 'L', description: 'L bonus vs large creatures' }
    ],
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'sling'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'halfling',
    specialAbilities: [
      { key: 'luck', uses: 'L+3', effect: 'reroll any die' }
    ],
    startingWealth: '2d6',
    startingEquipment: ['sling', 'light_weapon', 'light_armor', 'lantern'],
    description: 'Lucky adventurer with reroll abilities and sling mastery.'
  },

  dwarf: {
    id: 'dwarf',
    name: 'Dwarf',
    baseHp: 5,
    lifeFormula: 'L+5',
    attackFormula: 'L',
    attackConditions: [
      { weaponType: 'melee', bonus: 'L' },
      { vs: ['goblin'], bonus: 1, description: '+1 vs goblins' }
    ],
    defenseFormula: 'none',
    defenseConditions: [
      { vs: ['giant', 'troll', 'ogre'], bonus: 1, description: '+1 vs large creatures' }
    ],
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand', 'twoHanded'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'dwarf',
    darkvision: true,
    specialAbilities: [
      { key: 'goldSense', effect: 'Detect treasure' }
    ],
    startingWealth: '4d6',
    startingEquipment: ['hand_weapon', 'shield', 'heavy_armor', 'lantern'],
    description: 'Sturdy warrior with darkvision and gold sense.'
  },

  elf: {
    id: 'elf',
    name: 'Elf',
    baseHp: 4,
    lifeFormula: 'L+4',
    attackFormula: 'L',
    attackConditions: [
      { weaponCategory: 'twoHandedMelee', penalty: 'noBonus', description: 'No bonus with two-handed melee' },
      { vs: ['orc'], bonus: 1, description: '+1 vs orcs' }
    ],
    defenseFormula: 'none',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'bow'],
    magicUse: 'elf',
    stealth: 'none',
    savesAs: 'wizard',
    darkvision: true,
    specialAbilities: [
      { key: 'spellcasting', slots: 'L', bonus: 'L', spellList: 'wizard' }
    ],
    startingWealth: '3d6',
    startingEquipment: ['bow', 'hand_weapon', 'light_armor', 'lantern'],
    description: 'Graceful spellsword with darkvision. L spell slots.'
  },

  paladin: {
    id: 'paladin',
    name: 'Paladin',
    baseHp: 6,
    lifeFormula: 'L+6',
    attackFormula: 'L',
    defenseFormula: 'none',
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand', 'twoHanded', 'ranged'],
    magicUse: 'cleric',
    stealth: 'none',
    savesAs: 'warrior',
    specialAbilities: [
      { key: 'prayer', uses: 'L+1', effect: 'Divine prayers' },
      { key: 'mount', effect: 'Warhorse companion' }
    ],
    startingWealth: '5d6',
    startingEquipment: ['hand_weapon', 'shield', 'heavy_armor', 'lantern'],
    restrictions: 'Lx10gp tithe required, never flee from combat',
    description: 'Holy warrior with prayers and mount. Cannot flee.'
  },

  ranger: {
    id: 'ranger',
    name: 'Ranger',
    baseHp: 6,
    lifeFormula: 'L+6',
    attackFormula: 'L',
    attackConditions: [
      { dualWielding: true, bonus: 'halfL', description: 'halfL bonus when dual wielding' },
      { swornEnemy: true, bonus: 2, description: '+2 vs sworn enemy' }
    ],
    defenseFormula: 'none',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'twoHanded', 'ranged'],
    magicUse: 'none',
    stealth: 'halfL',
    savesAs: 'warrior',
    specialAbilities: [
      { key: 'dualWield', bonus: 'halfL' },
      { key: 'swornEnemy', effect: 'Choose enemy type for +2 attack' },
      { key: 'survival', effect: 'Expertise in chosen terrain' }
    ],
    startingWealth: '4d6',
    startingEquipment: ['hand_weapon', 'hand_weapon', 'bow', 'light_armor', 'lantern'],
    description: 'Wilderness expert with dual wielding and sworn enemy.'
  },

  druid: {
    id: 'druid',
    name: 'Druid',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'halfL',
    defenseFormula: 'none',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand'],
    magicUse: 'druid',
    stealth: 'none',
    savesAs: 'cleric',
    specialAbilities: [
      { key: 'spellcasting', slots: 'L+2', bonus: 'L', spellList: 'druid' },
      { key: 'animalCompanion', count: 1 }
    ],
    startingWealth: '2d6',
    startingEquipment: ['hand_weapon', 'light_armor', 'lantern'],
    description: 'Nature magic user with druid spells and animal companion.'
  },

  acrobat: {
    id: 'acrobat',
    name: 'Acrobat',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'halfL',
    defenseFormula: 'halfL',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'rogue',
    specialAbilities: [
      { key: 'tricks', uses: 'L+3', recharge: 'tier per rest' }
    ],
    startingWealth: '2d6',
    startingEquipment: ['light_weapon', 'light_armor', 'lantern'],
    description: 'Agile performer with tricks and evasion abilities.'
  },

  assassin: {
    id: 'assassin',
    name: 'Assassin',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'L',
    defenseFormula: 'none',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand', 'ranged'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'rogue',
    specialAbilities: [
      {
        key: 'hideInShadows',
        effect: '3x damage on marked target',
        save: 'stealth vs foe.level'
      }
    ],
    startingWealth: '3d6',
    startingEquipment: ['light_weapon', 'light_weapon', 'light_armor', 'lantern'],
    description: 'Deadly striker with stealth and assassination abilities.'
  },

  illusionist: {
    id: 'illusionist',
    name: 'Illusionist',
    baseHp: 2,
    lifeFormula: 'L+2',
    attackFormula: 'none',
    attackConditions: [
      { spellcasting: true, bonus: 'L' }
    ],
    defenseFormula: 'none',
    allowedArmor: 'none',
    allowedWeapons: ['light'],
    magicUse: 'illusionist',
    stealth: 'none',
    savesAs: 'wizard',
    specialAbilities: [
      { key: 'spellcasting', slots: 'L+3', bonus: 'L', spellList: 'illusionist' },
      { key: 'distractingLights', effect: 'Create distracting illusions' }
    ],
    startingWealth: '2d6',
    startingEquipment: ['light_weapon', 'lantern'],
    description: 'Master of illusions. L+3 spell slots for illusion magic.'
  },

  swashbuckler: {
    id: 'swashbuckler',
    name: 'Swashbuckler',
    baseHp: 4,
    lifeFormula: 'L+4',
    attackFormula: 'halfL',
    attackConditions: [
      { dualWielding: true, bonus: 'halfL' }
    ],
    defenseFormula: 'halfL',
    allowedArmor: 'light',
    allowedWeapons: ['light', 'hand'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'warrior',
    specialAbilities: [
      { key: 'panache', uses: 'L+3', effect: '+1 attack or +1 defense per point' },
      { key: 'dualWield', bonus: 'halfL' }
    ],
    startingWealth: '4d6',
    startingEquipment: ['hand_weapon', 'hand_weapon', 'light_armor', 'lantern'],
    description: 'Daring dual-wielder with panache points for flair.'
  },

  bulwark: {
    id: 'bulwark',
    name: 'Bulwark',
    baseHp: 7,
    lifeFormula: 'L+7',
    attackFormula: 'halfL',
    attackConditions: [
      { weaponType: 'ranged', bonus: 'tier' }
    ],
    defenseFormula: 'halfL',
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand', 'twoHanded', 'ranged'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'warrior',
    specialAbilities: [
      { key: 'sacrifice', effect: 'Take damage for allies' },
      { key: 'limitedHeal', restriction: 'Heal last' }
    ],
    startingWealth: '5d6',
    startingEquipment: ['hand_weapon', 'shield', 'heavy_armor', 'crossbow', 'lantern'],
    restrictions: 'Rare class, always heals last',
    description: 'Defensive tank who protects allies. High HP, moderate attack/defense.'
  },

  gnome: {
    id: 'gnome',
    name: 'Gnome',
    baseHp: 5,
    lifeFormula: 'L+5',
    attackFormula: 'halfL',
    defenseFormula: 'halfL',
    allowedArmor: 'any',
    allowedWeapons: ['light', 'hand'],
    magicUse: 'illusionist',
    stealth: 'none',
    savesAs: 'dwarf',
    specialAbilities: [
      { key: 'spellcasting', slots: 'L', single: true, bonus: 'L', spellList: 'illusionist' },
      { key: 'gadgeteer', uses: 'L+6' }
    ],
    startingWealth: '3d6',
    startingEquipment: ['hand_weapon', 'light_armor', 'lantern'],
    description: 'Inventive tinkerer with gadgets and one illusion spell.'
  },

  kukla: {
    id: 'kukla',
    name: 'Kukla',
    baseHp: 5,
    lifeFormula: 'L+5',
    attackFormula: 'none',
    attackConditions: [
      { weapon: 'lightBlade', bonus: 1 }
    ],
    defenseFormula: 'halfL',
    allowedArmor: 'light',
    allowedWeapons: ['light'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'rogue',
    specialAbilities: [
      { key: 'artificial', effect: 'Artificial construct, unique healing' },
      { key: 'secretCompartment', effect: 'Hidden storage' }
    ],
    startingWealth: 'd6',
    startingEquipment: ['light_weapon', 'light_armor'],
    restrictions: 'Rare, artificial construct, cannot heal normally',
    description: 'Artificial being with secret compartment. Cannot heal normally.'
  },

  lightGladiator: {
    id: 'lightGladiator',
    name: 'Light Gladiator',
    baseHp: 5,
    lifeFormula: 'L+5',
    attackFormula: 'none',
    attackConditions: [
      { weaponType: 'light', bonus: 'halfL' }
    ],
    defenseFormula: 'halfL',
    allowedArmor: 'light',
    allowedWeapons: ['light'],
    magicUse: 'none',
    stealth: 'none',
    savesAs: 'warrior',
    specialAbilities: [
      { key: 'parry', bonus: 2, target: 'defense' },
      { key: 'dualWield', bonus: 'halfL' }
    ],
    startingWealth: '4d6',
    startingEquipment: ['light_weapon', 'light_weapon', 'light_armor', 'lantern'],
    description: 'Arena fighter specializing in light weapons and parrying.'
  },

  mushroomMonk: {
    id: 'mushroomMonk',
    name: 'Mushroom Monk',
    baseHp: 3,
    lifeFormula: 'L+3',
    attackFormula: 'none',
    attackConditions: [
      {
        weapons: ['nunchaku', 'bo', 'sai', 'throwingStars'],
        bonus: 'L',
        description: 'Full L with martial arts weapons'
      },
      { default: 'halfL', description: 'halfL with other weapons' }
    ],
    defenseFormula: 'halfL',
    allowedArmor: 'none',
    allowedWeapons: ['light', 'hand'],
    magicUse: 'none',
    stealth: 'L',
    savesAs: 'rogue',
    specialAbilities: [
      { key: 'flurry', attacks: 'tier-based', description: 'Multiple attacks per round' },
      { key: 'spores', uses: 'tier', effect: 'Release damaging spores' }
    ],
    startingWealth: 'd6',
    startingEquipment: ['nunchaku', 'throwing_stars'],
    restrictions: 'Rare, fungal being',
    description: 'Fungal martial artist with flurry attacks and spore abilities.'
  }
};

/**
 * Helper function to get class data
 */
export function getClass(classId) {
  return CLASSES[classId] || null;
}

/**
 * Helper function to get all classes
 */
export function getAllClasses() {
  return Object.values(CLASSES);
}

/**
 * Helper function to get class keys
 */
export function getClassKeys() {
  return Object.keys(CLASSES);
}

/**
 * Calculate max HP for a class at a given level
 */
export function getMaxHP(classId, level) {
  const classData = CLASSES[classId];
  if (!classData) return level;
  return classData.baseHp + level;
}

/**
 * Get spell slots for a spellcasting class
 */
export function getSpellSlots(classId, level) {
  const classData = CLASSES[classId];
  if (!classData || classData.magicUse === 'none') return 0;

  const spellAbility = classData.specialAbilities?.find(a => a.key === 'spellcasting');
  if (!spellAbility) return 0;

  const slots = spellAbility.slots;
  if (slots === 'L') return level;
  if (slots === 'L+2') return level + 2;
  if (slots === 'L+3') return level + 3;

  return 0;
}

/**
 * Check if class has darkvision
 */
export function hasDarkvision(classId) {
  const classData = CLASSES[classId];
  return classData?.darkvision === true;
}

export default {
  CLASSES,
  ClassSchema,
  ClassCombatBonuses,
  calculateClassAttackBonus,
  calculateClassDefenseBonus,
  getClass,
  getAllClasses,
  getClassKeys,
  getMaxHP,
  getSpellSlots,
  hasDarkvision
};
