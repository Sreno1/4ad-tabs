/**
 * Magic Scroll System for Four Against Darkness
 * Scrolls contain spells that can be cast by any PC except barbarians
 * Wizards can copy scrolls into their spellbook for permanent learning
 */

import { SPELLS } from './spells.js';
import { getDefaultContext } from '../game/context.js';
import { roll } from '../utils/dice.js';

// ========== SCROLL DEFINITIONS ==========

export const SCROLLS = {
  // Wizard Spells (Parchment scrolls)
  scroll_blessing: {
    key: 'scroll_blessing',
    name: 'Scroll of Blessing',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'blessing',
    description: 'Parchment scroll containing the Blessing spell. Remove curse or stone effect. Works automatically.',
    cost: 50,
    effect: 'spell'
  },
  scroll_escape: {
    key: 'scroll_escape',
    name: 'Scroll of Escape',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'escape',
    description: 'Parchment scroll containing the Escape spell. Teleport to entrance of current dungeon.',
    cost: 75,
    effect: 'spell'
  },
  scroll_lightning: {
    key: 'scroll_lightning',
    name: 'Scroll of Lightning',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'lightning',
    description: 'Parchment scroll containing the Lightning Bolt spell. Strike a target with lightning for 2d6 damage.',
    cost: 50,
    effect: 'spell'
  },
  scroll_fireball: {
    key: 'scroll_fireball',
    name: 'Scroll of Fireball',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'fireball',
    description: 'Parchment scroll containing the Fireball spell. Consume a group of Minor Foes or damage Major Foe.',
    cost: 50,
    effect: 'spell'
  },
  scroll_protection: {
    key: 'scroll_protection',
    name: 'Scroll of Protection',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'protection',
    description: 'Parchment scroll containing the Protection spell. Grant +1 Defense to self or ally until end of encounter.',
    cost: 25,
    effect: 'spell'
  },
  scroll_sleep: {
    key: 'scroll_sleep',
    name: 'Scroll of Sleep',
    category: 'scroll',
    scrollType: 'wizard',
    spellKey: 'sleep',
    description: 'Parchment scroll containing the Sleep spell. Put d6+L Minor Foes to sleep (requires spellcasting roll).',
    cost: 75,
    effect: 'spell'
  },

  // Druid Spells (Bark pieces)
  scroll_disperse_vermin: {
    key: 'scroll_disperse_vermin',
    name: 'Bark of Disperse Vermin',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'disperse_vermin',
    description: 'Bark piece containing the Disperse Vermin spell. Attack Vermin Foes with 2xL bonus.',
    cost: 50,
    effect: 'spell'
  },
  scroll_summon_beast: {
    key: 'scroll_summon_beast',
    name: 'Bark of Summon Beast',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'summon_beast',
    description: 'Bark piece containing the Summon Beast spell. Call a L3 animal to fight for the party.',
    cost: 75,
    effect: 'spell'
  },
  scroll_water_jet: {
    key: 'scroll_water_jet',
    name: 'Bark of Water Jet',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'water_jet',
    description: 'Bark piece containing the Water Jet spell. Shoot water at target for various effects.',
    cost: 50,
    effect: 'spell'
  },
  scroll_bear_form: {
    key: 'scroll_bear_form',
    name: 'Bark of Bear Form',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'bear_form',
    description: 'Bark piece containing the Bear Form spell. Transform into a bear for the encounter.',
    cost: 75,
    effect: 'spell'
  },
  scroll_warp_wood: {
    key: 'scroll_warp_wood',
    name: 'Bark of Warp Wood',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'warp_wood',
    description: 'Bark piece containing the Warp Wood spell. Destroy wooden doors or damage wooden Foes.',
    cost: 25,
    effect: 'spell'
  },
  scroll_barkskin: {
    key: 'scroll_barkskin',
    name: 'Bark of Barkskin',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'barkskin',
    description: 'Bark piece containing the Barkskin spell. Grant +2 Defense but -2 agility penalties.',
    cost: 50,
    effect: 'spell'
  },
  scroll_lightning_strike: {
    key: 'scroll_lightning_strike',
    name: 'Bark of Lightning Strike',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'lightning_strike',
    description: 'Bark piece containing the Lightning Strike spell. Call lightning from sky (outdoor only).',
    cost: 50,
    effect: 'spell'
  },
  scroll_spiderweb: {
    key: 'scroll_spiderweb',
    name: 'Bark of Spiderweb',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'spiderweb',
    description: 'Bark piece containing the Spiderweb spell. Entangle Foes at -1L penalty.',
    cost: 25,
    effect: 'spell'
  },
  scroll_entangle: {
    key: 'scroll_entangle',
    name: 'Bark of Entangle',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'entangle',
    description: 'Bark piece containing the Entangle spell. Entangle with branches and brambles (outdoor only).',
    cost: 25,
    effect: 'spell'
  },
  scroll_subdual: {
    key: 'scroll_subdual',
    name: 'Bark of Subdual',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'subdual',
    description: 'Bark piece containing the Subdual spell. Grant all allies subdual bonus.',
    cost: 25,
    effect: 'spell'
  },
  scroll_forest_pathway: {
    key: 'scroll_forest_pathway',
    name: 'Bark of Forest Pathway',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'forest_pathway',
    description: 'Bark piece containing the Forest Pathway spell. Clear vegetation for party (outdoor only).',
    cost: 50,
    effect: 'spell'
  },
  scroll_alter_weather: {
    key: 'scroll_alter_weather',
    name: 'Bark of Alter Weather',
    category: 'scroll',
    scrollType: 'druid',
    spellKey: 'alter_weather',
    description: 'Bark piece containing the Alter Weather spell. Summon bad weather or douse fires (outdoor only).',
    cost: 50,
    effect: 'spell'
  },

  // Illusionist Spells (Prisms)
  scroll_illusionary_armor: {
    key: 'scroll_illusionary_armor',
    name: 'Prism of Illusionary Armor',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_armor',
    description: 'Prism crystal containing the Illusionary Armor spell. Weave shining armor for +Tier Defense.',
    cost: 50,
    effect: 'spell'
  },
  scroll_illusionary_mirror_image: {
    key: 'scroll_illusionary_mirror_image',
    name: 'Prism of Mirror Image',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_mirror_image',
    description: 'Prism crystal containing the Mirror Image spell. Create copies that absorb attacks.',
    cost: 50,
    effect: 'spell'
  },
  scroll_illusionary_servant: {
    key: 'scroll_illusionary_servant',
    name: 'Prism of Illusionary Servant',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_servant',
    description: 'Prism crystal containing the Illusionary Servant spell. Summon magical helper to carry treasure.',
    cost: 75,
    effect: 'spell'
  },
  scroll_disbelief: {
    key: 'scroll_disbelief',
    name: 'Prism of Disbelief',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'disbelief',
    description: 'Prism crystal containing the Disbelief spell. Dispel all illusions and reveal invisible Foes.',
    cost: 75,
    effect: 'spell'
  },
  scroll_phantasmal_binding: {
    key: 'scroll_phantasmal_binding',
    name: 'Prism of Phantasmal Binding',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'phantasmal_binding',
    description: 'Prism crystal containing the Phantasmal Binding spell. Bind target with spectral chains.',
    cost: 50,
    effect: 'spell'
  },
  scroll_illusionary_fog: {
    key: 'scroll_illusionary_fog',
    name: 'Prism of Illusionary Fog',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_fog',
    description: 'Prism crystal containing the Illusionary Fog spell. Create mist to block ranged attacks.',
    cost: 50,
    effect: 'spell'
  },
  scroll_glamour_mask: {
    key: 'scroll_glamour_mask',
    name: 'Prism of Glamour Mask',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'glamour_mask',
    description: 'Prism crystal containing the Glamour Mask spell. Change appearance or impersonate others.',
    cost: 50,
    effect: 'spell'
  },
  scroll_shadow_strike: {
    key: 'scroll_shadow_strike',
    name: 'Prism of Shadow Strike',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'shadow_strike',
    description: 'Prism crystal containing the Shadow Strike spell. Summon shadowy blades for Tier subdual damage.',
    cost: 50,
    effect: 'spell'
  },
  scroll_specter_swarm: {
    key: 'scroll_specter_swarm',
    name: 'Prism of Specter Swarm',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'specter_swarm',
    description: 'Prism crystal containing the Specter Swarm spell. Protect self with phantom specters.',
    cost: 50,
    effect: 'spell'
  },
  scroll_mirage_of_fortune: {
    key: 'scroll_mirage_of_fortune',
    name: 'Prism of Mirage of Fortune',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'mirage_of_fortune',
    description: 'Prism crystal containing the Mirage of Fortune spell. Create illusion of treasure to distract Foes.',
    cost: 25,
    effect: 'spell'
  },
  scroll_illusionary_banquet: {
    key: 'scroll_illusionary_banquet',
    name: 'Prism of Illusionary Banquet',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_banquet',
    description: 'Prism crystal containing the Illusionary Banquet spell. Summon illusory food to sustain party.',
    cost: 50,
    effect: 'spell'
  },
  scroll_illusionary_sword: {
    key: 'scroll_illusionary_sword',
    name: 'Prism of Illusionary Sword',
    category: 'scroll',
    scrollType: 'prism',
    spellKey: 'illusionary_sword',
    description: 'Prism crystal containing the Illusionary Sword spell. Conjure a flaming sword for Tier+3 turns.',
    cost: 50,
    effect: 'spell'
  }
};

// ========== RANDOM SPELL TABLES ==========

/**
 * Wizard Basic Spells - d6 Table (from magic.txt)
 */
export const WIZARD_SCROLL_TABLE = [
  '', // 0 - unused
  'scroll_blessing',
  'scroll_escape',
  'scroll_lightning',
  'scroll_fireball',
  'scroll_protection',
  'scroll_sleep'
];

/**
 * Druid Spells - d12 Table (from magic.txt)
 */
export const DRUID_SCROLL_TABLE = [
  '', // 0 - unused
  'scroll_disperse_vermin',
  'scroll_summon_beast',
  'scroll_water_jet',
  'scroll_bear_form',
  'scroll_warp_wood',
  'scroll_barkskin',
  'scroll_lightning_strike',
  'scroll_spiderweb',
  'scroll_entangle',
  'scroll_subdual',
  'scroll_forest_pathway',
  'scroll_alter_weather'
];

/**
 * Illusionist Spells - d12 Table (from magic.txt)
 */
export const ILLUSIONIST_SCROLL_TABLE = [
  '', // 0 - unused
  'scroll_illusionary_armor',
  'scroll_illusionary_mirror_image',
  'scroll_illusionary_servant',
  'scroll_disbelief',
  'scroll_phantasmal_binding',
  'scroll_illusionary_fog',
  'scroll_glamour_mask',
  'scroll_shadow_strike',
  'scroll_specter_swarm',
  'scroll_mirage_of_fortune',
  'scroll_illusionary_banquet',
  'scroll_illusionary_sword'
];

// ========== HELPER FUNCTIONS ==========

/**
 * Roll a random number from 1 to max (inclusive)
 * @param {number} max - Maximum value
 * @returns {number} Random value 1 to max
 */
const rollDice = (max, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  return roll(1, max, 0, rng, rollLog);
};

/**
 * Generate a random scroll based on type
 * @param {string} type - 'wizard', 'druid', or 'illusionist'
 * @returns {string} Scroll key
 */
export const generateRandomScroll = (type, ctx) => {
  let table;
  let maxRoll;

  if (type === 'wizard') {
    table = WIZARD_SCROLL_TABLE;
    maxRoll = 6;
  } else if (type === 'druid') {
    table = DRUID_SCROLL_TABLE;
    maxRoll = 12;
  } else if (type === 'illusionist' || type === 'prism') {
    table = ILLUSIONIST_SCROLL_TABLE;
    maxRoll = 12;
  } else {
    return null;
  }

  const roll = rollDice(maxRoll, ctx);
  return table[roll] || null;
};

/**
 * Generate a random treasure scroll (any type)
 * Distribution: 33% wizard, 33% druid, 33% illusionist
 * @returns {string} Scroll key
 */
export const generateTreasureScroll = (ctx) => {
  const typeRoll = rollDice(6, ctx);

  if (typeRoll <= 2) return generateRandomScroll('wizard', ctx);
  if (typeRoll <= 4) return generateRandomScroll('druid', ctx);
  return generateRandomScroll('illusionist', ctx);
};

/**
 * Get the spell details from a scroll
 * @param {string} scrollKey - Scroll key (e.g., 'scroll_fireball')
 * @returns {object} Spell object from SPELLS
 */
export const getScrollSpell = (scrollKey) => {
  const scroll = SCROLLS[scrollKey];
  if (!scroll) return null;
  return SPELLS[scroll.spellKey] || null;
};

/**
 * Check if a hero can use a scroll
 * Barbarians cannot read scrolls
 * @param {object} hero - Hero object
 * @returns {boolean} True if hero can use scrolls
 */
export const canUseScroll = (hero) => {
  return hero.key !== 'barbarian';
};

/**
 * Get the casting bonus for a scroll spell
 * Rules from magic.txt:
 * - Non-spellcasters: +1
 * - Spellcasters: +L
 * - Clerics casting Blessing: +L (important for Magic Resistance)
 * @param {object} hero - Hero casting the scroll
 * @param {object} spell - Spell from SPELLS
 * @returns {number} Bonus to add to d6 roll
 */
export const getScrollCastingBonus = (hero, spell) => {
  // Spellcaster classes: wizard, elf, druid, illusionist
  const spellcasters = ['wizard', 'elf', 'druid', 'illusionist'];

  if (spellcasters.includes(hero.key)) {
    // Spellcasters add +L
    return hero.lvl;
  } else {
    // Non-spellcasters add +1
    return 1;
  }
};

/**
 * Get all scrolls of a specific type
 * @param {string} scrollType - 'wizard', 'druid', or 'prism'
 * @returns {array} Array of scroll keys
 */
export const getScrollsByType = (scrollType) => {
  return Object.values(SCROLLS)
    .filter(scroll => scroll.scrollType === scrollType)
    .map(scroll => scroll.key);
};

/**
 * Get scroll by key
 * @param {string} key - Scroll key
 * @returns {object} Scroll object
 */
export const getScroll = (key) => {
  return SCROLLS[key] || null;
};

export default {
  SCROLLS,
  WIZARD_SCROLL_TABLE,
  DRUID_SCROLL_TABLE,
  ILLUSIONIST_SCROLL_TABLE,
  generateRandomScroll,
  generateTreasureScroll,
  getScrollSpell,
  canUseScroll,
  getScrollCastingBonus,
  getScrollsByType,
  getScroll
};
