/**
 * Treasure Data - Treasure generation tables
 * Gold, magic items, scrolls, and treasure mechanics
 */

/**
 * Treasure Table (d6)
 */
export const TREASURE_TABLE = [
  '', // 0 - unused
  'Gold (d6)',
  'Gold (2d6)',
  'Magic Item or Scroll',
  'Potion',
  'Clue',
  'Trap!'
];

/**
 * Equipment Slots
 */
export const EQUIPMENT_SLOTS = {
  weapon: 'Weapon',
  offhand: 'Off-hand',
  armor: 'Armor',
  ring: 'Ring',
  amulet: 'Amulet'
};

/**
 * Magic Items Table
 */
export const MAGIC_ITEMS_TABLE = {
  weapons: [
    { name: 'Sword +1', slot: 'weapon', bonus: 1 },
    { name: 'Flaming Sword', slot: 'weapon', bonus: 1, special: 'fire' },
    { name: 'Holy Mace', slot: 'weapon', bonus: 1, special: 'undead' }
  ],
  armor: [
    { name: 'Shield +1', slot: 'offhand', defBonus: 1 },
    { name: 'Chainmail +1', slot: 'armor', defBonus: 1 }
  ],
  consumables: [
    { name: 'Healing Potion', uses: 1, effect: 'heal', value: 3 },
    { name: 'Potion of Strength', uses: 1, effect: 'atkBonus', value: 2, duration: 'combat' }
  ],
  rings: [
    { name: 'Ring of Protection', slot: 'ring', defBonus: 1 },
    { name: 'Ring of Regeneration', slot: 'ring', special: 'regen' }
  ]
};

/**
 * Potion Effects
 */
export const POTION_EFFECTS = {
  heal: { name: 'Healing', heals: 3 },
  strength: { name: 'Strength', atkBonus: 2, duration: 1 },
  speed: { name: 'Speed', initiative: true, duration: 1 },
  invisibility: { name: 'Invisibility', defBonus: 3, duration: 1 }
};

/**
 * Helper Functions
 */
export function createEquipment(name, slot, stats = {}) {
  return {
    id: `${name}_${Date.now()}`,
    name,
    slot,
    ...stats
  };
}

export default {
  TREASURE_TABLE,
  EQUIPMENT_SLOTS,
  MAGIC_ITEMS_TABLE,
  POTION_EFFECTS,
  createEquipment
};
