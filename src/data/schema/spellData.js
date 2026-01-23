/**
 * Spell Data - Complete spell definitions using the Spell Schema
 * All spells from Four Against Darkness for all caster classes
 */

import { SpellSchema, SpellTypes, SpellTargeting, SpellSchools } from './spell.js';

/**
 * Complete Spell Database
 * Following SpellSchema structure
 */
export const SPELLS = {
  // ===== WIZARD & ELF SPELLS =====
  blessing: {
    id: 'blessing',
    name: 'Blessing',
    type: SpellTypes.WIZARD,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: 'remove_curse',
    description: 'Removes a curse or an effect such as being turned to stone. Works automatically. Elves cannot use this spell.'
  },

  fireball: {
    id: 'fireball',
    name: 'Fireball',
    type: SpellTypes.WIZARD,
    school: SpellSchools.EVOCATION,
    targeting: SpellTargeting.ALL_FOES,
    requiresRoll: true,
    rollBonus: 'L',
    damage: '1d6',
    effect: 'aoe_damage',
    description: 'Deals 1d6 damage to all enemies'
  },

  lightning: {
    id: 'lightning',
    name: 'Lightning Bolt',
    type: SpellTypes.WIZARD,
    school: SpellSchools.EVOCATION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    damage: '2d6',
    effect: 'single_damage',
    description: 'Deals 2d6 damage to one enemy'
  },

  sleep: {
    id: 'sleep',
    name: 'Sleep',
    type: SpellTypes.WIZARD,
    school: SpellSchools.ENCHANTMENT,
    targeting: SpellTargeting.ALL_FOES,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'sleep',
    maxLevel: 3,
    description: 'Puts enemies up to level 3 to sleep (skip their turn)',
    immunities: ['undead', 'elemental', 'dragon_adult', 'dragon_ancient']
  },

  shield: {
    id: 'shield',
    name: 'Shield',
    type: SpellTypes.WIZARD,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'defense_buff',
    bonus: 2,
    duration: 'encounter',
    description: '+2 to defense rolls for the caster this encounter'
  },

  mirror_image: {
    id: 'mirror_image',
    name: 'Mirror Image',
    type: SpellTypes.WIZARD,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'absorb_hit',
    charges: 1,
    description: 'First attack against caster automatically misses'
  },

  protection: {
    id: 'protection',
    name: 'Protection',
    type: SpellTypes.WIZARD,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: 'defense_buff',
    bonus: 1,
    duration: 'encounter',
    description: 'Creates an invisible barrier around the caster or an ally, giving +1 to Defense rolls until the end of the current encounter.'
  },

  light: {
    id: 'light',
    name: 'Light',
    type: SpellTypes.WIZARD,
    school: SpellSchools.EVOCATION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'search_buff',
    bonus: 1,
    duration: 'adventure',
    description: 'Illuminates dark areas, +1 to search rolls'
  },

  detect_magic: {
    id: 'detect_magic',
    name: 'Detect Magic',
    type: SpellTypes.WIZARD,
    school: SpellSchools.DIVINATION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'detect',
    description: 'Reveals hidden magical traps and items'
  },

  telekinesis: {
    id: 'telekinesis',
    name: 'Telekinesis',
    type: SpellTypes.WIZARD,
    school: SpellSchools.TRANSMUTATION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: false,
    automatic: true,
    effect: 'remote_disarm',
    bonus: 2,
    description: 'Move objects at a distance, disarm traps from afar'
  },

  healing_word: {
    id: 'healing_word',
    name: 'Healing Word',
    type: SpellTypes.ELF,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: 'heal',
    healing: '1d6',
    description: 'Heals one ally for 1d6 HP'
  },

  escape: {
    id: 'escape',
    name: 'Escape',
    type: SpellTypes.WIZARD,
    school: SpellSchools.CONJURATION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'auto_flee',
    description: 'Automatically succeed on one flee attempt'
  },

  // ===== DRUID SPELLS =====
  disperse_vermin: {
    id: 'disperse_vermin',
    name: 'Disperse Vermin',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L*2',
    effect: 'vermin_attack',
    description: 'Works like melee attack vs Vermin, druid adds 2xL to spellcasting roll'
  },

  summon_beast: {
    id: 'summon_beast',
    name: 'Summon Beast',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.NONE,
    requiresRoll: false,
    automatic: true,
    effect: 'summon_companion',
    duration: 'encounter',
    description: 'Summons L3 animal with 5 Life, 1 attack inflicting 1 damage. Lasts until encounter ends'
  },

  water_jet: {
    id: 'water_jet',
    name: 'Water Jet',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'water_attack',
    damage: 2,
    description: 'Shoots water stream. Inflict 2 dmg to fire creatures, disperse 2 Vermin, knock out 1 Minion, or distract Major Foe'
  },

  bear_form: {
    id: 'bear_form',
    name: 'Bear Form',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'bear_transform',
    duration: 'encounter',
    description: 'Transform into bear. Fight as warrior of druid\'s L (min L3) with 8 Life. Half damage transfers back after combat'
  },

  warp_wood: {
    id: 'warp_wood',
    name: 'Warp Wood',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: false,
    automatic: true,
    effect: 'wood_destruction',
    damage: 2,
    description: 'Destroy wooden door, open chest, or inflict 2 damage on wood golem/tree/plant Foes'
  },

  barkskin: {
    id: 'barkskin',
    name: 'Barkskin',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: 'defense_buff',
    bonus: 2,
    duration: 'encounter',
    description: 'Skin turns to bark. +2 Defense rolls, -2 on agility Saves. Vulnerable to fire (-2 vs fire)'
  },

  lightning_strike: {
    id: 'lightning_strike',
    name: 'Lightning Strike',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'single_damage',
    damage: '2d6',
    outdoor_only: true,
    description: 'Like Lightning spell but cannot be used indoors. Lightning from sky strikes target'
  },

  spiderweb: {
    id: 'spiderweb',
    name: 'Spiderweb',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.ALL_FOES,
    requiresRoll: false,
    automatic: true,
    effect: 'entangle',
    debuff: -1,
    duration: 'encounter',
    description: 'Entangle 1 Major Foe or d6 Minor Foes. Targets hindered at -1L for attacking/defending'
  },

  entangle: {
    id: 'entangle',
    name: 'Entangle',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.ALL_FOES,
    requiresRoll: false,
    automatic: true,
    effect: 'entangle',
    debuff: -1,
    duration: 'encounter',
    outdoor_only: true,
    description: 'Like Spiderweb but only outdoors (forest/swamp/jungle). Branches rise and entangle targets'
  },

  subdual: {
    id: 'subdual',
    name: 'Subdual',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.ALL_ALLIES,
    requiresRoll: false,
    automatic: true,
    effect: 'subdual_buff',
    duration: 'encounter',
    description: 'Cast on all allies. Until end of encounter, allies ignore -1 modifier on Subdual attacks'
  },

  forest_pathway: {
    id: 'forest_pathway',
    name: 'Forest Pathway',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'exploration',
    duration: 'timed',
    description: 'Vegetation moves away. Party walks through forest/jungle for 10min x L. Druid must be pos 1 or 2'
  },

  alter_weather: {
    id: 'alter_weather',
    name: 'Alter Weather',
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'weather_control',
    duration: 'timed',
    outdoor_only: true,
    description: 'Summon bad weather for 10min (outdoors only). -1L to ranged attacks, +1 to Lightning Strike, or inflict 2 dmg to fire/air elemental'
  },

  // ===== ILLUSIONIST SPELLS =====
  illusionary_armor: {
    id: 'illusionary_armor',
    name: 'Illusionary Armor',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'defense_buff',
    bonus: 'tier',
    duration: 'encounter',
    description: 'Weave shining armor. +Tier to Defense rolls until end of encounter. No effect on Vermin/Undead/Artificial/Elemental'
  },

  illusionary_mirror_image: {
    id: 'illusionary_mirror_image',
    name: 'Illusionary Mirror Image',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'mirror_images',
    copies: 'tier+1',
    duration: 'encounter',
    description: 'Create Tier+1 copies of illusionist. Each has 1 Life and absorbs 1 attack'
  },

  illusionary_servant: {
    id: 'illusionary_servant',
    name: 'Illusionary Servant',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'summon_companion',
    duration: 'adventure',
    description: 'Summon servant to carry 200gp treasure, 4 weapons, 1 armor, 2 shields, 10 food. Has Life=Tier, +2 Defense'
  },

  disbelief: {
    id: 'disbelief',
    name: 'Disbelief',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'dispel_illusions',
    description: 'Dispel all illusion spells. Invisible Foes become visible, lose invisibility advantage'
  },

  phantasmal_binding: {
    id: 'phantasmal_binding',
    name: 'Phantasmal Binding',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'bind',
    duration: 'tier_turns',
    description: 'Spectral chains bind target for Tier turns if spellcasting roll succeeds. Held Foes attacked at +2'
  },

  illusionary_fog: {
    id: 'illusionary_fog',
    name: 'Illusionary Fog',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'fog',
    bonus: 2,
    duration: 'encounter',
    description: 'Create mist around party. Ranged/gaze attacks suspended, +2 Defense when fleeing'
  },

  glamour_mask: {
    id: 'glamour_mask',
    name: 'Glamour Mask',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: 'disguise',
    duration: 'tier_hours',
    description: 'Change appearance of self or ally. Lasts Tier hours. Reroll Reaction/Wooing Save or impersonate authority'
  },

  shadow_strike: {
    id: 'shadow_strike',
    name: 'Shadow Strike',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'subdual_damage',
    damage: 'tier',
    description: 'Summon shadowy blades. Target takes Tier Subdual damage if spellcasting roll hits'
  },

  specter_swarm: {
    id: 'specter_swarm',
    name: 'Specter Swarm',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.ALL_FOES,
    requiresRoll: false,
    automatic: true,
    effect: 'fear',
    duration: 'encounter',
    description: 'Conjure illusory specters. Foes must roll Morale or be unable to attack illusionist'
  },

  mirage_of_fortune: {
    id: 'mirage_of_fortune',
    name: 'Mirage of Fortune',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: 'L',
    effect: 'bribe',
    description: 'Conjure pile of gold/jewels. If spellcasting roll succeeds, counts as successful Bribe Reaction'
  },

  illusionary_banquet: {
    id: 'illusionary_banquet',
    name: 'Illusionary Banquet',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: 'food',
    amount: 'tier+3',
    description: 'Summon meal equal to Tier+3 Food rations. Sustains for max 7 days, then 1 dmg per ration if no real food eaten'
  },

  illusionary_sword: {
    id: 'illusionary_sword',
    name: 'Illusionary Sword',
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: 'weapon_buff',
    bonus: 'L',
    duration: 'tier+3_turns',
    description: 'Flaming sword appears. Illusionist adds +L to Attack rolls for Tier+3 turns. All damage is Subdual'
  }
};

/**
 * Spell Lists by Class
 */
export const WIZARD_SPELLS = [
  'blessing', 'fireball', 'lightning', 'sleep', 'shield', 'mirror_image',
  'light', 'detect_magic', 'telekinesis', 'protection'
];

export const ELF_SPELLS = [
  'lightning', 'sleep', 'shield', 'light', 'detect_magic',
  'healing_word', 'escape', 'protection'
];

export const DRUID_SPELLS = [
  'disperse_vermin', 'summon_beast', 'water_jet', 'bear_form',
  'warp_wood', 'barkskin', 'lightning_strike', 'spiderweb',
  'entangle', 'subdual', 'forest_pathway', 'alter_weather'
];

export const ILLUSIONIST_SPELLS = [
  'illusionary_armor', 'illusionary_mirror_image', 'illusionary_servant', 'disbelief',
  'phantasmal_binding', 'illusionary_fog', 'glamour_mask', 'shadow_strike',
  'specter_swarm', 'mirage_of_fortune', 'illusionary_banquet', 'illusionary_sword'
];

/**
 * Helper Functions
 */
export function getSpell(spellId) {
  return SPELLS[spellId] || null;
}

export function getAvailableSpells(classKey) {
  if (classKey === 'wizard') return WIZARD_SPELLS;
  if (classKey === 'elf') return ELF_SPELLS;
  if (classKey === 'druid') return DRUID_SPELLS;
  if (classKey === 'illusionist') return ILLUSIONIST_SPELLS;
  return [];
}

export function getSpellSlots(classKey, level) {
  if (classKey === 'wizard') return level + 2;
  if (classKey === 'druid') return level + 2;
  if (classKey === 'illusionist') return level + 3;
  if (classKey === 'elf') return level;
  return 0;
}

export default {
  SPELLS,
  WIZARD_SPELLS,
  ELF_SPELLS,
  DRUID_SPELLS,
  ILLUSIONIST_SPELLS,
  getSpell,
  getAvailableSpells,
  getSpellSlots,
  SpellSchema,
  SpellTypes,
  SpellTargeting,
  SpellSchools
};
