/**
 * Scroll Data - Magic scroll definitions
 * Scrolls contain spells that can be cast by any PC except barbarians
 */

/**
 * All Scroll Definitions
 * Scrolls are consumable items containing spells
 */
export const SCROLLS = {
  // Wizard Scrolls (Parchment)
  scroll_blessing: { key: 'scroll_blessing', name: 'Scroll of Blessing', category: 'scroll', scrollType: 'wizard', spellKey: 'blessing', description: 'Parchment scroll containing the Blessing spell.', cost: 50, effect: 'spell' },
  scroll_escape: { key: 'scroll_escape', name: 'Scroll of Escape', category: 'scroll', scrollType: 'wizard', spellKey: 'escape', description: 'Parchment scroll containing the Escape spell.', cost: 75, effect: 'spell' },
  scroll_lightning: { key: 'scroll_lightning', name: 'Scroll of Lightning', category: 'scroll', scrollType: 'wizard', spellKey: 'lightning', description: 'Parchment scroll containing the Lightning Bolt spell.', cost: 50, effect: 'spell' },
  scroll_fireball: { key: 'scroll_fireball', name: 'Scroll of Fireball', category: 'scroll', scrollType: 'wizard', spellKey: 'fireball', description: 'Parchment scroll containing the Fireball spell.', cost: 50, effect: 'spell' },
  scroll_protection: { key: 'scroll_protection', name: 'Scroll of Protection', category: 'scroll', scrollType: 'wizard', spellKey: 'protection', description: 'Parchment scroll containing the Protection spell.', cost: 25, effect: 'spell' },
  scroll_sleep: { key: 'scroll_sleep', name: 'Scroll of Sleep', category: 'scroll', scrollType: 'wizard', spellKey: 'sleep', description: 'Parchment scroll containing the Sleep spell.', cost: 75, effect: 'spell' },

  // Druid Scrolls (Bark pieces)
  scroll_disperse_vermin: { key: 'scroll_disperse_vermin', name: 'Bark of Disperse Vermin', category: 'scroll', scrollType: 'druid', spellKey: 'disperse_vermin', description: 'Bark piece containing the Disperse Vermin spell.', cost: 50, effect: 'spell' },
  scroll_summon_beast: { key: 'scroll_summon_beast', name: 'Bark of Summon Beast', category: 'scroll', scrollType: 'druid', spellKey: 'summon_beast', description: 'Bark piece containing the Summon Beast spell.', cost: 75, effect: 'spell' },
  scroll_water_jet: { key: 'scroll_water_jet', name: 'Bark of Water Jet', category: 'scroll', scrollType: 'druid', spellKey: 'water_jet', description: 'Bark piece containing the Water Jet spell.', cost: 50, effect: 'spell' },
  scroll_bear_form: { key: 'scroll_bear_form', name: 'Bark of Bear Form', category: 'scroll', scrollType: 'druid', spellKey: 'bear_form', description: 'Bark piece containing the Bear Form spell.', cost: 75, effect: 'spell' },
  scroll_warp_wood: { key: 'scroll_warp_wood', name: 'Bark of Warp Wood', category: 'scroll', scrollType: 'druid', spellKey: 'warp_wood', description: 'Bark piece containing the Warp Wood spell.', cost: 25, effect: 'spell' },
  scroll_barkskin: { key: 'scroll_barkskin', name: 'Bark of Barkskin', category: 'scroll', scrollType: 'druid', spellKey: 'barkskin', description: 'Bark piece containing the Barkskin spell.', cost: 50, effect: 'spell' },
  scroll_lightning_strike: { key: 'scroll_lightning_strike', name: 'Bark of Lightning Strike', category: 'scroll', scrollType: 'druid', spellKey: 'lightning_strike', description: 'Bark piece containing the Lightning Strike spell.', cost: 50, effect: 'spell' },
  scroll_spiderweb: { key: 'scroll_spiderweb', name: 'Bark of Spiderweb', category: 'scroll', scrollType: 'druid', spellKey: 'spiderweb', description: 'Bark piece containing the Spiderweb spell.', cost: 25, effect: 'spell' },
  scroll_entangle: { key: 'scroll_entangle', name: 'Bark of Entangle', category: 'scroll', scrollType: 'druid', spellKey: 'entangle', description: 'Bark piece containing the Entangle spell.', cost: 25, effect: 'spell' },
  scroll_subdual: { key: 'scroll_subdual', name: 'Bark of Subdual', category: 'scroll', scrollType: 'druid', spellKey: 'subdual', description: 'Bark piece containing the Subdual spell.', cost: 25, effect: 'spell' },
  scroll_forest_pathway: { key: 'scroll_forest_pathway', name: 'Bark of Forest Pathway', category: 'scroll', scrollType: 'druid', spellKey: 'forest_pathway', description: 'Bark piece containing the Forest Pathway spell.', cost: 50, effect: 'spell' },
  scroll_alter_weather: { key: 'scroll_alter_weather', name: 'Bark of Alter Weather', category: 'scroll', scrollType: 'druid', spellKey: 'alter_weather', description: 'Bark piece containing the Alter Weather spell.', cost: 50, effect: 'spell' },

  // Illusionist Scrolls (Prisms)
  scroll_illusionary_armor: { key: 'scroll_illusionary_armor', name: 'Prism of Illusionary Armor', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_armor', description: 'Prism crystal containing the Illusionary Armor spell.', cost: 50, effect: 'spell' },
  scroll_illusionary_mirror_image: { key: 'scroll_illusionary_mirror_image', name: 'Prism of Mirror Image', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_mirror_image', description: 'Prism crystal containing the Mirror Image spell.', cost: 50, effect: 'spell' },
  scroll_illusionary_servant: { key: 'scroll_illusionary_servant', name: 'Prism of Illusionary Servant', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_servant', description: 'Prism crystal containing the Illusionary Servant spell.', cost: 75, effect: 'spell' },
  scroll_disbelief: { key: 'scroll_disbelief', name: 'Prism of Disbelief', category: 'scroll', scrollType: 'prism', spellKey: 'disbelief', description: 'Prism crystal containing the Disbelief spell.', cost: 75, effect: 'spell' },
  scroll_phantasmal_binding: { key: 'scroll_phantasmal_binding', name: 'Prism of Phantasmal Binding', category: 'scroll', scrollType: 'prism', spellKey: 'phantasmal_binding', description: 'Prism crystal containing the Phantasmal Binding spell.', cost: 50, effect: 'spell' },
  scroll_illusionary_fog: { key: 'scroll_illusionary_fog', name: 'Prism of Illusionary Fog', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_fog', description: 'Prism crystal containing the Illusionary Fog spell.', cost: 50, effect: 'spell' },
  scroll_glamour_mask: { key: 'scroll_glamour_mask', name: 'Prism of Glamour Mask', category: 'scroll', scrollType: 'prism', spellKey: 'glamour_mask', description: 'Prism crystal containing the Glamour Mask spell.', cost: 50, effect: 'spell' },
  scroll_shadow_strike: { key: 'scroll_shadow_strike', name: 'Prism of Shadow Strike', category: 'scroll', scrollType: 'prism', spellKey: 'shadow_strike', description: 'Prism crystal containing the Shadow Strike spell.', cost: 50, effect: 'spell' },
  scroll_specter_swarm: { key: 'scroll_specter_swarm', name: 'Prism of Specter Swarm', category: 'scroll', scrollType: 'prism', spellKey: 'specter_swarm', description: 'Prism crystal containing the Specter Swarm spell.', cost: 50, effect: 'spell' },
  scroll_mirage_of_fortune: { key: 'scroll_mirage_of_fortune', name: 'Prism of Mirage of Fortune', category: 'scroll', scrollType: 'prism', spellKey: 'mirage_of_fortune', description: 'Prism crystal containing the Mirage of Fortune spell.', cost: 25, effect: 'spell' },
  scroll_illusionary_banquet: { key: 'scroll_illusionary_banquet', name: 'Prism of Illusionary Banquet', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_banquet', description: 'Prism crystal containing the Illusionary Banquet spell.', cost: 50, effect: 'spell' },
  scroll_illusionary_sword: { key: 'scroll_illusionary_sword', name: 'Prism of Illusionary Sword', category: 'scroll', scrollType: 'prism', spellKey: 'illusionary_sword', description: 'Prism crystal containing the Illusionary Sword spell.', cost: 50, effect: 'spell' }
};

/**
 * Random Scroll Tables
 */
export const WIZARD_SCROLL_TABLE = ['', 'scroll_blessing', 'scroll_escape', 'scroll_lightning', 'scroll_fireball', 'scroll_protection', 'scroll_sleep'];

export const DRUID_SCROLL_TABLE = [
  '', 'scroll_disperse_vermin', 'scroll_summon_beast', 'scroll_water_jet', 'scroll_bear_form', 'scroll_warp_wood', 'scroll_barkskin',
  'scroll_lightning_strike', 'scroll_spiderweb', 'scroll_entangle', 'scroll_subdual', 'scroll_forest_pathway', 'scroll_alter_weather'
];

export const ILLUSIONIST_SCROLL_TABLE = [
  '', 'scroll_illusionary_armor', 'scroll_illusionary_mirror_image', 'scroll_illusionary_servant', 'scroll_disbelief',
  'scroll_phantasmal_binding', 'scroll_illusionary_fog', 'scroll_glamour_mask', 'scroll_shadow_strike',
  'scroll_specter_swarm', 'scroll_mirage_of_fortune', 'scroll_illusionary_banquet', 'scroll_illusionary_sword'
];

/**
 * Helper Functions
 */
export function getScroll(key) {
  return SCROLLS[key] || null;
}

export function getScrollsByType(scrollType) {
  return Object.values(SCROLLS).filter(scroll => scroll.scrollType === scrollType);
}

export function canUseScroll(hero) {
  return hero.key !== 'barbarian';
}

export function getScrollCastingBonus(hero) {
  const spellcasters = ['wizard', 'elf', 'druid', 'illusionist'];
  return spellcasters.includes(hero.key) ? hero.lvl : 1;
}

export default {
  SCROLLS,
  WIZARD_SCROLL_TABLE,
  DRUID_SCROLL_TABLE,
  ILLUSIONIST_SCROLL_TABLE,
  getScroll,
  getScrollsByType,
  canUseScroll,
  getScrollCastingBonus
};
