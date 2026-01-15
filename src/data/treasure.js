/**
 * Treasure and equipment tables for Four Against Darkness
 */

// Treasure Table (d6)
export const TREASURE_TABLE = [
  '', // 0 - unused
  'Gold (d6)',
  'Gold (2d6)',
  'Magic Item',
  'Potion',
  'Clue',
  'Trap!'
];

// Equipment slots for characters (Phase 3+)
export const EQUIPMENT_SLOTS = {
  weapon: 'Weapon',
  offhand: 'Off-hand',
  armor: 'Armor',
  ring: 'Ring',
  amulet: 'Amulet'
};

// Basic equipment for starting characters
export const STARTING_EQUIPMENT = {
  warrior: { weapon: 'Sword', armor: 'Light Armor' },
  cleric: { weapon: 'Mace', armor: 'Light Armor' },
  rogue: { weapon: 'Dagger', offhand: 'Dagger' },
  wizard: { weapon: 'Staff' },
  barbarian: { weapon: 'Two-handed Axe' },
  halfling: { weapon: 'Sling', offhand: 'Short Sword' },
  dwarf: { weapon: 'Hammer', armor: 'Heavy Armor' },
  elf: { weapon: 'Bow', offhand: 'Sword' }
};

// Magic items table (Phase 4+)
export const MAGIC_ITEMS = {
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

// Potion effects
export const POTION_EFFECTS = {
  heal: { name: 'Healing', heals: 3 },
  strength: { name: 'Strength', atkBonus: 2, duration: 1 },
  speed: { name: 'Speed', initiative: true, duration: 1 },
  invisibility: { name: 'Invisibility', defBonus: 3, duration: 1 }
};

/**
 * Create an equipment item
 * @param {string} name - Item name
 * @param {string} slot - Equipment slot
 * @param {object} stats - Item stats
 * @returns {object} Equipment item
 */
export const createEquipment = (name, slot, stats = {}) => ({
  id: Date.now() + Math.random(),
  name,
  slot,
  ...stats
});
