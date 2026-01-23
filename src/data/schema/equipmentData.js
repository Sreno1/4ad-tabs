/**
 * Equipment Data - Complete equipment definitions using Equipment Schema
 * Weapons, armor, shields, consumables, magic items, and scrolls
 */

import { WeaponCategories, ArmorTypes } from './equipment.js';

/**
 * Weapon Definitions
 */
export const WEAPONS = {
  hand_weapon: {
    id: 'hand_weapon',
    key: 'hand_weapon',
    name: 'Hand Weapon',
    category: 'weapon',
    type: 'weapon',
    attackMod: 0,
    description: 'Standard sword, axe, or mace',
    cost: 10
  },
  light_weapon: {
    id: 'light_weapon',
    key: 'light_weapon',
    name: 'Light Weapon',
    category: 'weapon',
    type: 'weapon',
    attackMod: -1,
    description: 'Dagger or shortsword. -1 attack but easier to use in tight spaces',
    cost: 5
  },
  two_handed: {
    id: 'two_handed',
    key: 'two_handed',
    name: 'Two-Handed Weapon',
    category: 'weapon',
    type: 'weapon',
    attackMod: 1,
    description: 'Greatsword, battleaxe. +1 attack but -1 in narrow corridors',
    cost: 20,
    corridorPenalty: -1
  },
  silver_weapon: {
    id: 'silver_weapon',
    key: 'silver_weapon',
    name: 'Silver Weapon',
    category: 'weapon',
    type: 'weapon',
    attackMod: 0,
    specialBonus: { vs: 'lycanthrope', bonus: 1 },
    description: 'Silver-plated weapon. +1 vs lycanthropes',
    cost: 50
  },
  bow: {
    id: 'bow',
    key: 'bow',
    name: 'Bow',
    category: 'weapon',
    type: 'weapon',
    attackMod: 0,
    description: 'Standard bow. Strikes first in initiative',
    cost: 15,
    strikesFirst: true
  },
  crossbow: {
    id: 'crossbow',
    key: 'crossbow',
    name: 'Crossbow',
    category: 'weapon',
    type: 'weapon',
    attackMod: 1,
    description: 'Heavy crossbow. +1 attack, strikes first',
    cost: 25,
    strikesFirst: true
  },
  sling: {
    id: 'sling',
    key: 'sling',
    name: 'Sling',
    category: 'weapon',
    type: 'weapon',
    attackMod: -1,
    description: 'Simple sling. -1 attack, strikes first',
    cost: 2,
    strikesFirst: true
  },
  torch: {
    id: 'torch',
    key: 'torch',
    name: 'Torch (as weapon)',
    category: 'weapon',
    type: 'weapon',
    attackMod: -1,
    specialBonus: { vs: 'flammable', bonus: 2 },
    description: 'Improvised weapon. -1 normally, +2 vs flammable creatures',
    cost: 1
  },
  mace: {
    id: 'mace',
    key: 'mace',
    name: 'Mace',
    category: 'weapon',
    type: 'weapon',
    attackMod: 0,
    damageType: 'crushing',
    description: 'Blunt weapon. +1 vs skeletons',
    cost: 12
  },
  club: {
    id: 'club',
    key: 'club',
    name: 'Club',
    category: 'weapon',
    type: 'weapon',
    attackMod: -1,
    damageType: 'crushing',
    description: 'Improvised blunt weapon. +1 vs skeletons',
    cost: 1
  }
};

/**
 * Armor Definitions
 */
export const ARMOR = {
  light_armor: {
    id: 'light_armor',
    key: 'light_armor',
    name: 'Light Armor',
    category: 'armor',
    type: 'armor',
    defenseMod: 1,
    stealthPenalty: 0,
    description: 'Leather armor. +1 Defense',
    cost: 20
  },
  heavy_armor: {
    id: 'heavy_armor',
    key: 'heavy_armor',
    name: 'Heavy Armor',
    category: 'armor',
    type: 'armor',
    defenseMod: 2,
    stealthPenalty: -1,
    description: 'Chainmail or plate. +2 Defense, -1 Stealth',
    cost: 50
  }
};

/**
 * Shield Definitions
 */
export const SHIELDS = {
  shield: {
    id: 'shield',
    key: 'shield',
    name: 'Shield',
    category: 'shield',
    type: 'shield',
    defenseMod: 1,
    saveMod: 1,
    description: '+1 Defense, +1 to Save rolls',
    cost: 10
  }
};

/**
 * Consumable Definitions
 */
export const CONSUMABLES = {
  bandage: {
    id: 'bandage',
    key: 'bandage',
    name: 'Bandage',
    category: 'consumable',
    type: 'consumable',
    effect: 'heal',
    amount: 1,
    description: 'Heals 1 Life. Each PC can use 1 per adventure',
    cost: 5,
    limitPerAdventure: 1
  },
  healing_potion: {
    id: 'healing_potion',
    key: 'healing_potion',
    name: 'Healing Potion',
    category: 'consumable',
    type: 'consumable',
    effect: 'heal',
    amount: 'full',
    description: 'Restores all Life',
    cost: 50
  },
  holy_water: {
    id: 'holy_water',
    key: 'holy_water',
    name: 'Holy Water',
    category: 'consumable',
    type: 'consumable',
    effect: 'damage',
    amount: 'd6',
    targetType: 'undead',
    description: 'Deals d6 damage to undead',
    cost: 25
  },
  oil_flask: {
    id: 'oil_flask',
    key: 'oil_flask',
    name: 'Flask of Flammable Oil',
    category: 'consumable',
    type: 'consumable',
    effect: 'damage',
    amount: '2d6',
    targetType: 'any',
    description: 'Thrown weapon. 2d6 fire damage',
    cost: 10
  },
  torch_item: {
    id: 'torch_item',
    key: 'torch_item',
    name: 'Torch',
    category: 'consumable',
    type: 'consumable',
    effect: 'light',
    duration: 6,
    description: 'Provides light for 6 rooms',
    cost: 1
  },
  rope: {
    id: 'rope',
    key: 'rope',
    name: 'Rope',
    category: 'consumable',
    type: 'consumable',
    effect: 'utility',
    bonus: { climb: 1 },
    description: '+1 to climbing checks',
    cost: 5
  },
  pole_10ft: {
    id: 'pole_10ft',
    key: 'pole_10ft',
    name: "10' Pole",
    category: 'consumable',
    type: 'consumable',
    effect: 'utility',
    bonus: { trap: 1 },
    description: '+1 to trap detection/disarm',
    cost: 2
  },
  lantern_hook: {
    id: 'lantern_hook',
    key: 'lantern_hook',
    name: 'Lantern Hook',
    category: 'consumable',
    type: 'consumable',
    effect: 'utility',
    description: 'Allows using a lantern while wielding a shield',
    cost: 5
  },
  food_rations: {
    id: 'food_rations',
    key: 'food_rations',
    name: 'Food Rations',
    category: 'consumable',
    type: 'consumable',
    effect: 'survival',
    description: 'Required for wilderness survival',
    cost: 5
  }
};

/**
 * Utility Equipment
 */
export const EQUIPMENT_UTILITY = {
  lantern: {
    id: 'lantern',
    key: 'lantern',
    name: 'Lantern',
    category: 'equipment',
    type: 'item',
    lightSource: true,
    duration: 12,
    description: 'Provides light for 12 rooms (refillable)',
    cost: 10
  }
};

/**
 * Magic Item Definitions
 */
export const MAGIC_ITEMS = {
  amulet: {
    id: 'amulet',
    key: 'amulet',
    name: 'Amulet',
    category: 'magic',
    type: 'magic',
    effect: 'luck',
    amount: 1,
    description: 'Grants 1 Luck point per adventure',
    cost: 100
  },
  talisman: {
    id: 'talisman',
    key: 'talisman',
    name: 'Talisman',
    category: 'magic',
    type: 'magic',
    effect: 'save',
    amount: 1,
    description: '+1 to all Save rolls',
    cost: 100
  },
  potion_strength: {
    id: 'potion_strength',
    key: 'potion_strength',
    name: 'Potion of Strength',
    category: 'magic',
    type: 'magic',
    effect: 'attack',
    amount: 2,
    duration: '1 combat',
    description: '+2 to attack for one combat',
    cost: 75
  },
  ring_protection: {
    id: 'ring_protection',
    key: 'ring_protection',
    name: 'Ring of Protection',
    category: 'magic',
    type: 'magic',
    effect: 'defense',
    amount: 1,
    description: '+1 Defense (permanent)',
    cost: 200
  }
};

/**
 * All Equipment Combined
 */
export const ALL_EQUIPMENT = {
  ...WEAPONS,
  ...ARMOR,
  ...SHIELDS,
  ...CONSUMABLES,
  ...EQUIPMENT_UTILITY,
  ...MAGIC_ITEMS
};

/**
 * Starting Equipment by Class
 */
export const STARTING_EQUIPMENT = {
  warrior: ['hand_weapon', 'shield', 'light_armor'],
  cleric: ['hand_weapon', 'shield', 'light_armor'],
  rogue: ['light_weapon', 'light_armor'],
  wizard: ['light_weapon'],
  elf: ['bow', 'hand_weapon', 'light_armor'],
  dwarf: ['hand_weapon', 'shield', 'heavy_armor'],
  halfling: ['light_weapon', 'sling'],
  barbarian: ['two_handed', 'light_armor']
};

/**
 * Helper Functions
 */
export function getEquipment(key) {
  return ALL_EQUIPMENT[key] || null;
}

export function getEquipmentByCategory(category) {
  return Object.values(ALL_EQUIPMENT).filter(item => item.category === category);
}

export function getStartingEquipment(classKey) {
  return STARTING_EQUIPMENT[classKey] || ['hand_weapon'];
}

export function calculateEquipmentBonuses(hero) {
  const bonuses = {
    attackMod: 0,
    defenseMod: 0,
    saveMod: 0,
    stealthMod: 0
  };

  if (!hero.equipment || !Array.isArray(hero.equipment)) {
    return bonuses;
  }

  hero.equipment.forEach(itemKey => {
    const item = getEquipment(itemKey);
    if (!item) return;

    if (item.attackMod) bonuses.attackMod += item.attackMod;
    if (item.defenseMod) bonuses.defenseMod += item.defenseMod;
    if (item.saveMod) bonuses.saveMod += item.saveMod;
    if (item.stealthPenalty) bonuses.stealthMod += item.stealthPenalty;
  });

  return bonuses;
}

export function hasEquipment(hero, type) {
  if (!hero.equipment) return false;

  return hero.equipment.some(itemKey => {
    const item = getEquipment(itemKey);
    return item && (item.key === type || item.type === type || item.category === type);
  });
}

export function canEquipItem(hero, itemKey) {
  const item = getEquipment(itemKey);
  if (!item) return { canEquip: false, reason: 'Item not found' };

  const equipped = hero.equipment || [];

  if (item.category === 'weapon') {
    const weaponCount = equipped.filter(key => {
      const eq = getEquipment(key);
      return eq && eq.category === 'weapon';
    }).length;

    if (weaponCount >= 3) {
      return { canEquip: false, reason: 'Maximum 3 weapons' };
    }
  }

  if (item.category === 'shield') {
    const shieldCount = equipped.filter(key => {
      const eq = getEquipment(key);
      return eq && eq.category === 'shield';
    }).length;

    if (shieldCount >= 2) {
      return { canEquip: false, reason: 'Maximum 2 shields' };
    }
  }

  if (item.category === 'armor') {
    const hasArmor = equipped.some(key => {
      const eq = getEquipment(key);
      return eq && eq.category === 'armor';
    });

    if (hasArmor) {
      return { canEquip: false, reason: 'Already wearing armor' };
    }
  }

  return { canEquip: true };
}

export default {
  WEAPONS,
  ARMOR,
  SHIELDS,
  CONSUMABLES,
  EQUIPMENT_UTILITY,
  MAGIC_ITEMS,
  ALL_EQUIPMENT,
  STARTING_EQUIPMENT,
  getEquipment,
  getEquipmentByCategory,
  getStartingEquipment,
  calculateEquipmentBonuses,
  hasEquipment,
  canEquipItem
};
