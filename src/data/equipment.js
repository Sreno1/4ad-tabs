/**
 * Equipment System for Four Against Darkness
 *
 * Equipment categories:
 * - Weapons (melee/ranged with attack bonuses)
 * - Armor (defense bonuses)
 * - Shields (defense + save bonuses)
 * - Consumables (healing, utility)
 * - Magic items (special bonuses)
 * - Scrolls (spells that can be cast from inventory)
 */

import { SCROLLS } from './scrolls.js';

// ========== WEAPON TYPES ==========

export const WEAPON_TYPES = {
  // Melee Weapons
  hand_weapon: {
    key: 'hand_weapon',
    name: 'Hand Weapon',
    category: 'weapon',
    type: 'melee',
    attackMod: 0,
    description: 'Standard sword, axe, or mace',
    cost: 10
  },
  light_weapon: {
    key: 'light_weapon',
    name: 'Light Weapon',
    category: 'weapon',
    type: 'melee',
    attackMod: -1,
    description: 'Dagger or shortsword. -1 attack but easier to use in tight spaces',
    cost: 5
  },
  two_handed: {
    key: 'two_handed',
    name: 'Two-Handed Weapon',
    category: 'weapon',
    type: 'melee',
    attackMod: 1,
    description: 'Greatsword, battleaxe. +1 attack but -1 in narrow corridors',
    cost: 20,
    corridorPenalty: -1
  },
  silver_weapon: {
    key: 'silver_weapon',
    name: 'Silver Weapon',
    category: 'weapon',
    type: 'melee',
    attackMod: 0,
    specialBonus: { vs: 'lycanthrope', bonus: 1 },
    description: 'Silver-plated weapon. +1 vs lycanthropes',
    cost: 50
  },
  masterwork_weapon: {
    key: 'masterwork_weapon',
    name: 'Masterwork Weapon',
    category: 'weapon',
    type: 'melee',
    attackMod: 0,
    explodeThreshold: 5, // Explodes on 5+ instead of 6+
    description: 'Masterwork crafted weapon. Attack rolls explode on 5+ instead of 6+',
    cost: 100
  },

  // Ranged Weapons
  bow: {
    key: 'bow',
    name: 'Bow',
    category: 'weapon',
    type: 'ranged',
    attackMod: 0,
    description: 'Standard bow. Strikes first in initiative',
    cost: 15,
    strikesFirst: true
  },
  crossbow: {
    key: 'crossbow',
    name: 'Crossbow',
    category: 'weapon',
    type: 'ranged',
    attackMod: 1,
    description: 'Heavy crossbow. +1 attack, strikes first',
    cost: 25,
    strikesFirst: true
  },
  sling: {
    key: 'sling',
    name: 'Sling',
    category: 'weapon',
    type: 'ranged',
    attackMod: -1,
    description: 'Simple sling. -1 attack, strikes first',
    cost: 2,
    strikesFirst: true
  },

  // Special weapons
  torch: {
    key: 'torch',
    name: 'Torch (as weapon)',
    category: 'weapon',
    type: 'melee',
    attackMod: -1,
    specialBonus: { vs: 'flammable', bonus: 2 },
    description: 'Improvised weapon. -1 normally, +2 vs flammable creatures',
    cost: 1
  }
};

// ========== ARMOR TYPES ==========

export const ARMOR_TYPES = {
  light_armor: {
    key: 'light_armor',
    name: 'Light Armor',
    category: 'armor',
    defenseMod: 1,
    stealthPenalty: 0,
    description: 'Leather armor. +1 Defense',
    cost: 20
  },
  heavy_armor: {
    key: 'heavy_armor',
    name: 'Heavy Armor',
    category: 'armor',
    defenseMod: 2,
    stealthPenalty: -1,
    description: 'Chainmail or plate. +2 Defense, -1 Stealth',
    cost: 50
  }
};

// ========== SHIELDS ==========

export const SHIELDS = {
  shield: {
    key: 'shield',
    name: 'Shield',
    category: 'shield',
    defenseMod: 1,
    saveMod: 1,
    description: '+1 Defense, +1 to Save rolls',
    cost: 10
  }
};

// ========== CONSUMABLES ==========

export const CONSUMABLES = {
  // Healing
  bandage: {
    key: 'bandage',
    name: 'Bandage',
    category: 'consumable',
    effect: 'heal',
    amount: 1,
    description: 'Heals 1 Life. Each PC can use 1 per adventure',
    cost: 5,
    limitPerAdventure: 1
  },
  healing_potion: {
    key: 'healing_potion',
    name: 'Healing Potion',
    category: 'consumable',
    effect: 'heal',
    amount: 'full',
    description: 'Restores all Life',
    cost: 50
  },

  // Combat consumables
  holy_water: {
    key: 'holy_water',
    name: 'Holy Water',
    category: 'consumable',
    effect: 'damage',
    amount: 'd6',
    targetType: 'undead',
    description: 'Deals d6 damage to undead',
    cost: 25
  },
  oil_flask: {
    key: 'oil_flask',
    name: 'Flask of Flammable Oil',
    category: 'consumable',
    effect: 'damage',
    amount: '2d6',
    targetType: 'any',
    description: 'Thrown weapon. 2d6 fire damage',
    cost: 10
  },

  // Light sources
  torch_item: {
    key: 'torch_item',
    name: 'Torch',
    category: 'consumable',
    effect: 'light',
    duration: 6,
    description: 'Provides light for 6 rooms',
    cost: 1
  },


  // Utility
  rope: {
    key: 'rope',
    name: 'Rope',
    category: 'consumable',
    effect: 'utility',
    bonus: { climb: 1 },
    description: '+1 to climbing checks',
    cost: 5
  },
  pole_10ft: {
    key: 'pole_10ft',
    name: "10' Pole",
    category: 'consumable',
    effect: 'utility',
    bonus: { trap: 1 },
    description: '+1 to trap detection/disarm',
    cost: 2
  },
  lantern_hook: {
    key: 'lantern_hook',
    name: 'Lantern Hook',
    category: 'consumable',
    effect: 'utility',
    description: 'Allows using a lantern while wielding a shield',
    cost: 5
  },
  food_rations: {
    key: 'food_rations',
    name: 'Food Rations',
    category: 'consumable',
    effect: 'survival',
    description: 'Required for wilderness survival',
    cost: 5
  }
};

// ========== EQUIPMENT UTILITY (Equipable non-weapon items) ===========
export const EQUIPMENT_UTILITY = {
  lantern: {
    key: 'lantern',
    name: 'Lantern',
    category: 'equipment',
    type: 'utility',
    lightSource: true,
    duration: 12,
    description: 'Provides light for 12 rooms (refillable)',
    cost: 10
  }
};

// ========== MAGIC ITEMS ==========

export const MAGIC_ITEMS = {
  amulet: {
    key: 'amulet',
    name: 'Amulet',
    category: 'magic',
    effect: 'luck',
    amount: 1,
    description: 'Grants 1 Luck point per adventure',
    cost: 100
  },
  talisman: {
    key: 'talisman',
    name: 'Talisman',
    category: 'magic',
    effect: 'save',
    amount: 1,
    description: '+1 to all Save rolls',
    cost: 100
  },
  potion_strength: {
    key: 'potion_strength',
    name: 'Potion of Strength',
    category: 'magic',
    effect: 'attack',
    amount: 2,
    duration: '1 combat',
    description: '+2 to attack for one combat',
    cost: 75
  },
  ring_protection: {
    key: 'ring_protection',
    name: 'Ring of Protection',
    category: 'magic',
    effect: 'defense',
    amount: 1,
    description: '+1 Defense (permanent)',
    cost: 200
  }
};

// ========== COMBINED EQUIPMENT TABLE ==========

export const ALL_EQUIPMENT = {
  ...WEAPON_TYPES,
  ...ARMOR_TYPES,
  ...SHIELDS,
  ...CONSUMABLES,
  ...EQUIPMENT_UTILITY,
  ...MAGIC_ITEMS,
  ...SCROLLS
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get equipment by key
 * @param {string} key - Equipment key
 * @returns {object} Equipment item
 */
export const getEquipment = (key) => {
  return ALL_EQUIPMENT[key] || null;
};

/**
 * Get all equipment in a category
 * @param {string} category - Category name
 * @returns {array} Array of equipment items
 */
export const getEquipmentByCategory = (category) => {
  return Object.values(ALL_EQUIPMENT).filter(item => item.category === category);
};

/**
 * Calculate total equipment bonuses for a hero
 * @param {object} hero - Hero with equipment array
 * @returns {object} { attackMod, defenseMod, saveMod, stealthMod }
 */
export const calculateEquipmentBonuses = (hero) => {
  const bonuses = {
    attackMod: 0,
    defenseMod: 0,
    saveMod: 0,
    stealthMod: 0
  };

  if (!hero.equipment) {
    return bonuses;
  }

  // Handle old object format (migration support)
  if (!Array.isArray(hero.equipment)) {
    // Old format: {weapon: 'key', offhand: 'key', ...}
    // Just return no bonuses for now - user needs to reset or migrate
    return bonuses;
  }

  // Handle new array format
  if (hero.equipment.length === 0) {
    return bonuses;
  }

  hero.equipment.forEach(itemKey => {
    const item = getEquipment(itemKey);
    if (!item) return;

    // Add bonuses
    if (item.attackMod) bonuses.attackMod += item.attackMod;
    if (item.defenseMod) bonuses.defenseMod += item.defenseMod;
    if (item.saveMod) bonuses.saveMod += item.saveMod;
    if (item.stealthPenalty) bonuses.stealthMod += item.stealthPenalty;
  });

  return bonuses;
};

/**
 * Check if hero has a specific type of equipment
 * @param {object} hero - Hero object
 * @param {string} type - Equipment type or key
 * @returns {boolean}
 */
export const hasEquipment = (hero, type) => {
  if (!hero.equipment) return false;

  return hero.equipment.some(itemKey => {
    const item = getEquipment(itemKey);
    return item && (item.key === type || item.type === type || item.category === type);
  });
};

/**
 * Check if hero can equip an item (encumbrance, class restrictions)
 * @param {object} hero - Hero object
 * @param {string} itemKey - Equipment key
 * @returns {object} { canEquip, reason }
 */
export const canEquipItem = (hero, itemKey) => {
  const item = getEquipment(itemKey);
  if (!item) return { canEquip: false, reason: 'Item not found' };

  const equipped = hero.equipment || [];

  // Check weapon limits (3 weapons max)
  if (item.category === 'weapon') {
    const weaponCount = equipped.filter(key => {
      const eq = getEquipment(key);
      return eq && eq.category === 'weapon';
    }).length;

    if (weaponCount >= 3) {
      return { canEquip: false, reason: 'Maximum 3 weapons' };
    }
  }

  // Check shield limits (2 shields max)
  if (item.category === 'shield') {
    const shieldCount = equipped.filter(key => {
      const eq = getEquipment(key);
      return eq && eq.category === 'shield';
    }).length;

    if (shieldCount >= 2) {
      return { canEquip: false, reason: 'Maximum 2 shields' };
    }
  }

  // Check armor (1 armor max)
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
};

/**
 * Use a consumable item
 * @param {string} itemKey - Consumable key
 * @param {object} target - Target (hero, monster, etc.)
 * @returns {object} Usage result
 */
export const useConsumable = (itemKey, target) => {
  const item = getEquipment(itemKey);
  if (!item || item.category !== 'consumable') {
    return { success: false, message: 'Not a consumable item' };
  }

  switch (item.effect) {
    case 'heal':
      if (item.amount === 'full') {
        return {
          success: true,
          effect: 'heal',
          amount: target.maxHp - target.hp,
          message: `${target.name} fully healed by ${item.name}!`
        };
      } else {
        return {
          success: true,
          effect: 'heal',
          amount: item.amount,
          message: `${target.name} healed ${item.amount} Life from ${item.name}`
        };
      }

    case 'damage':
      return {
        success: true,
        effect: 'damage',
        amount: item.amount,
        targetType: item.targetType,
        message: `${item.name} deals ${item.amount} damage!`
      };

    case 'light':
      return {
        success: true,
        effect: 'light',
        duration: item.duration,
        message: `${item.name} lit! Lasts ${item.duration} rooms`
      };

    default:
      return {
        success: true,
        message: `${item.name} used`
      };
  }
};

/**
 * Get starting equipment for a character class
 * @param {string} classKey - Class key
 * @returns {array} Array of equipment keys
 */
export const getStartingEquipment = (classKey) => {
  const startingGear = {
    warrior: ['hand_weapon', 'shield', 'light_armor'],
    cleric: ['hand_weapon', 'shield', 'light_armor'],
    rogue: ['light_weapon', 'light_armor'],
    wizard: ['light_weapon'],
    elf: ['bow', 'hand_weapon', 'light_armor'],
    dwarf: ['hand_weapon', 'shield', 'heavy_armor'],
    halfling: ['light_weapon', 'sling'],
    barbarian: ['two_handed', 'light_armor']
  };

  return startingGear[classKey] || ['hand_weapon'];
};

/**
 * Get the active/equipped weapon for a hero
 * @param {object} hero - Hero object
 * @returns {object|null} Active weapon item or null
 */
export const getActiveWeapon = (hero) => {
  if (!hero.equipment || !Array.isArray(hero.equipment) || hero.equipment.length === 0) {
    return null;
  }

  // If hero has activeWeaponIdx, use that
  if (typeof hero.activeWeaponIdx === 'number') {
    const weaponKey = hero.equipment[hero.activeWeaponIdx];
    const weapon = getEquipment(weaponKey);
    if (weapon && weapon.category === 'weapon') {
      return weapon;
    }
  }

  // Otherwise, return first weapon in equipment
  for (const itemKey of hero.equipment) {
    const item = getEquipment(itemKey);
    if (item && item.category === 'weapon') {
      return item;
    }
  }

  return null;
};

/**
 * Check if hero is unarmed (has no weapon equipped)
 * Per 4AD rules (combat.txt p.66): Unarmed PCs have -2 on Attack rolls
 * @param {object} hero - Hero object
 * @returns {boolean} True if hero has no weapon
 */
export const isHeroUnarmed = (hero) => {
  const activeWeapon = getActiveWeapon(hero);
  return activeWeapon === null;
};

/**
 * Get all weapons carried by a hero
 * @param {object} hero - Hero object
 * @returns {array} Array of weapon items with their equipment indices
 */
export const getAllWeapons = (hero) => {
  if (!hero.equipment || !Array.isArray(hero.equipment)) {
    return [];
  }

  const weapons = [];
  hero.equipment.forEach((itemKey, idx) => {
    const item = getEquipment(itemKey);
    if (item && item.category === 'weapon') {
      weapons.push({ item, equipmentIdx: idx, itemKey });
    }
  });

  return weapons;
};

/**
 * Check if switching to a weapon requires a turn cost
 * @param {object} currentWeapon - Currently active weapon
 * @param {object} newWeapon - Weapon to switch to
 * @returns {boolean} True if switching costs a turn
 */
export const weaponSwitchCostsTurn = (currentWeapon, newWeapon) => {
  // No cost if no current weapon (first equip)
  if (!currentWeapon) return false;

  // No cost if both are same weapon
  if (currentWeapon.key === newWeapon.key) return false;

  // Switching between melee weapons: costs a turn
  if (currentWeapon.type === 'melee' && newWeapon.type === 'melee') {
    return true;
  }

  // Switching between ranged and melee: costs a turn
  if (currentWeapon.type !== newWeapon.type) {
    return true;
  }

  // Switching between different ranged weapons: costs a turn
  if (currentWeapon.type === 'ranged' && newWeapon.type === 'ranged') {
    return true;
  }

  return false;
};
