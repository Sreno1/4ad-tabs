/**
 * Magic System definitions for Four Against Darkness (Phase 4)
 * Spells for Wizards and Elves
 */

// Spell definitions
export const SPELLS = {
  // Divine/Utility Spells
  blessing: {
    name: 'Blessing',
    type: 'utility',
    description: 'Removes a curse or an effect such as being turned to stone. Works automatically. Elves cannot use this spell.',
    effect: 'remove_curse',
    target: 'single_ally'
  },

  // Combat Spells
  fireball: {
    name: 'Fireball',
    type: 'attack',
    description: 'Deals 1d6 damage to all enemies',
    effect: 'aoe_damage',
    damage: '1d6',
    target: 'all_enemies'
  },
  lightning: {
    name: 'Lightning Bolt',
    type: 'attack', 
    description: 'Deals 2d6 damage to one enemy',
    effect: 'single_damage',
    damage: '2d6',
    target: 'single'
  },
  sleep: {
    name: 'Sleep',
    type: 'control',
    description: 'Puts enemies up to level 3 to sleep (skip their turn)',
    effect: 'sleep',
    maxLevel: 3,
    target: 'all_enemies'
  },
  
  // Defensive Spells
  shield: {
    name: 'Shield',
    type: 'defense',
    description: '+2 to defense rolls for the caster this encounter',
    effect: 'defense_buff',
    bonus: 2,
    duration: 'encounter',
    target: 'self'
  },
  mirror_image: {
    name: 'Mirror Image',
    type: 'defense',
    description: 'First attack against caster automatically misses',
    effect: 'absorb_hit',
    charges: 1,
    target: 'self'
  },
  protection: {
    name: 'Protection',
    type: 'defense',
    description: 'Creates an invisible barrier around the caster or an ally, giving +1 to Defense rolls until the end of the current encounter. No spellcasting roll required.',
    effect: 'defense_buff',
    bonus: 1,
    duration: 'encounter',
    target: 'single_ally'
  },
  
  // Utility Spells
  light: {
    name: 'Light',
    type: 'utility',
    description: 'Illuminates dark areas, +1 to search rolls',
    effect: 'search_buff',
    bonus: 1,
    duration: 'adventure',
    target: 'party'
  },
  detect_magic: {
    name: 'Detect Magic',
    type: 'utility',
    description: 'Reveals hidden magical traps and items',
    effect: 'detect',
    target: 'room'
  },
  telekinesis: {
    name: 'Telekinesis',
    type: 'utility',
    description: 'Move objects at a distance, disarm traps from afar',
    effect: 'remote_disarm',
    bonus: 2,
    target: 'single'
  },
  
  // Healing/Support (Elf-themed)
  healing_word: {
    name: 'Healing Word',
    type: 'healing',
    description: 'Heals one ally for 1d6 HP',
    effect: 'heal',
    healing: '1d6',
    target: 'single_ally'
  },
  escape: {
    name: 'Escape',
    type: 'utility',
    description: 'Automatically succeed on one flee attempt',
    effect: 'auto_flee',
    target: 'party'
  },

  // Druid Spells
  disperse_vermin: {
    name: 'Disperse Vermin',
    type: 'attack',
    description: 'Works like melee attack vs Vermin, druid adds 2xL to spellcasting roll',
    effect: 'vermin_attack',
    bonus: 'L*2',
    target: 'vermin'
  },
  summon_beast: {
    name: 'Summon Beast',
    type: 'summon',
    description: 'Summons L3 animal with 5 Life, 1 attack inflicting 1 damage. Lasts until encounter ends',
    effect: 'summon_companion',
    duration: 'encounter',
    target: 'self'
  },
  water_jet: {
    name: 'Water Jet',
    type: 'attack',
    description: 'Shoots water stream. Inflict 2 dmg to fire creatures, disperse 2 Vermin, knock out 1 Minion, or distract Major Foe',
    effect: 'water_attack',
    damage: 2,
    target: 'single'
  },
  bear_form: {
    name: 'Bear Form',
    type: 'transform',
    description: 'Transform into bear. Fight as warrior of druid\'s L (min L3) with 8 Life. Half damage transfers back after combat',
    effect: 'bear_transform',
    duration: 'encounter',
    target: 'self'
  },
  warp_wood: {
    name: 'Warp Wood',
    type: 'utility',
    description: 'Destroy wooden door, open chest, or inflict 2 damage on wood golem/tree/plant Foes',
    effect: 'wood_destruction',
    damage: 2,
    target: 'single'
  },
  barkskin: {
    name: 'Barkskin',
    type: 'defense',
    description: 'Skin turns to bark. +2 Defense rolls, -2 on agility Saves. Vulnerable to fire (-2 vs fire)',
    effect: 'defense_buff',
    bonus: 2,
    duration: 'encounter',
    target: 'single_ally'
  },
  lightning_strike: {
    name: 'Lightning Strike',
    type: 'attack',
    description: 'Like Lightning spell but cannot be used indoors. Lightning from sky strikes target',
    effect: 'single_damage',
    damage: '2d6',
    target: 'single',
    outdoor_only: true
  },
  spiderweb: {
    name: 'Spiderweb',
    type: 'control',
    description: 'Entangle 1 Major Foe or d6 Minor Foes. Targets hindered at -1L for attacking/defending',
    effect: 'entangle',
    debuff: -1,
    duration: 'encounter',
    target: 'enemies'
  },
  entangle: {
    name: 'Entangle',
    type: 'control',
    description: 'Like Spiderweb but only outdoors (forest/swamp/jungle). Branches rise and entangle targets',
    effect: 'entangle',
    debuff: -1,
    duration: 'encounter',
    target: 'enemies',
    outdoor_only: true
  },
  subdual: {
    name: 'Subdual',
    type: 'support',
    description: 'Cast on all allies. Until end of encounter, allies ignore -1 modifier on Subdual attacks',
    effect: 'subdual_buff',
    duration: 'encounter',
    target: 'party'
  },
  forest_pathway: {
    name: 'Forest Pathway',
    type: 'utility',
    description: 'Vegetation moves away. Party walks through forest/jungle for 10min x L. Druid must be pos 1 or 2',
    effect: 'exploration',
    duration: 'timed',
    target: 'party'
  },
  alter_weather: {
    name: 'Alter Weather',
    type: 'utility',
    description: 'Summon bad weather for 10min (outdoors only). -1L to ranged attacks, +1 to Lightning Strike, or inflict 2 dmg to fire/air elemental',
    effect: 'weather_control',
    duration: 'timed',
    target: 'environment',
    outdoor_only: true
  },

  // Illusionist Spells
  illusionary_armor: {
    name: 'Illusionary Armor',
    type: 'defense',
    description: 'Weave shining armor. +Tier to Defense rolls until end of encounter. No effect on Vermin/Undead/Artificial/Elemental',
    effect: 'defense_buff',
    bonus: 'tier',
    duration: 'encounter',
    target: 'self'
  },
  illusionary_mirror_image: {
    name: 'Illusionary Mirror Image',
    type: 'defense',
    description: 'Create Tier+1 copies of illusionist. Each has 1 Life and absorbs 1 attack',
    effect: 'mirror_images',
    copies: 'tier+1',
    duration: 'encounter',
    target: 'self'
  },
  illusionary_servant: {
    name: 'Illusionary Servant',
    type: 'summon',
    description: 'Summon servant to carry 200gp treasure, 4 weapons, 1 armor, 2 shields, 10 food. Has Life=Tier, +2 Defense',
    effect: 'summon_companion',
    duration: 'adventure',
    target: 'self'
  },
  disbelief: {
    name: 'Disbelief',
    type: 'utility',
    description: 'Dispel all illusion spells. Invisible Foes become visible, lose invisibility advantage',
    effect: 'dispel_illusions',
    target: 'all'
  },
  phantasmal_binding: {
    name: 'Phantasmal Binding',
    type: 'control',
    description: 'Spectral chains bind target for Tier turns if spellcasting roll succeeds. Held Foes attacked at +2',
    effect: 'bind',
    duration: 'tier_turns',
    target: 'single'
  },
  illusionary_fog: {
    name: 'Illusionary Fog',
    type: 'defense',
    description: 'Create mist around party. Ranged/gaze attacks suspended, +2 Defense when fleeing',
    effect: 'fog',
    bonus: 2,
    duration: 'encounter',
    target: 'party'
  },
  glamour_mask: {
    name: 'Glamour Mask',
    type: 'utility',
    description: 'Change appearance of self or ally. Lasts Tier hours. Reroll Reaction/Wooing Save or impersonate authority',
    effect: 'disguise',
    duration: 'tier_hours',
    target: 'single_ally'
  },
  shadow_strike: {
    name: 'Shadow Strike',
    type: 'attack',
    description: 'Summon shadowy blades. Target takes Tier Subdual damage if spellcasting roll hits',
    effect: 'subdual_damage',
    damage: 'tier',
    target: 'single'
  },
  specter_swarm: {
    name: 'Specter Swarm',
    type: 'control',
    description: 'Conjure illusory specters. Foes must roll Morale or be unable to attack illusionist',
    effect: 'fear',
    duration: 'encounter',
    target: 'enemies'
  },
  mirage_of_fortune: {
    name: 'Mirage of Fortune',
    type: 'control',
    description: 'Conjure pile of gold/jewels. If spellcasting roll succeeds, counts as successful Bribe Reaction',
    effect: 'bribe',
    target: 'single'
  },
  illusionary_banquet: {
    name: 'Illusionary Banquet',
    type: 'utility',
    description: 'Summon meal equal to Tier+3 Food rations. Sustains for max 7 days, then 1 dmg per ration if no real food eaten',
    effect: 'food',
    amount: 'tier+3',
    target: 'party'
  },
  illusionary_sword: {
    name: 'Illusionary Sword',
    type: 'attack',
    description: 'Flaming sword appears. Illusionist adds +L to Attack rolls for Tier+3 turns. All damage is Subdual',
    effect: 'weapon_buff',
    bonus: 'L',
    duration: 'tier+3_turns',
    target: 'self'
  }
};

// Spells available to Wizards
export const WIZARD_SPELLS = [
  'blessing', 'fireball', 'lightning', 'sleep', 'shield', 'mirror_image',
  'light', 'detect_magic', 'telekinesis', 'protection'
];

// Spells available to Elves (more nature/support focused)
export const ELF_SPELLS = [
  'lightning', 'sleep', 'shield', 'light', 'detect_magic',
  'healing_word', 'escape', 'protection'
];

// Spells available to Druids (nature and transformation magic)
export const DRUID_SPELLS = [
  'disperse_vermin', 'summon_beast', 'water_jet', 'bear_form',
  'warp_wood', 'barkskin', 'lightning_strike', 'spiderweb',
  'entangle', 'subdual', 'forest_pathway', 'alter_weather'
];

// Spells available to Illusionists (illusion and trickery magic)
export const ILLUSIONIST_SPELLS = [
  'illusionary_armor', 'illusionary_mirror_image', 'illusionary_servant', 'disbelief',
  'phantasmal_binding', 'illusionary_fog', 'glamour_mask', 'shadow_strike',
  'specter_swarm', 'mirage_of_fortune', 'illusionary_banquet', 'illusionary_sword'
];

/**
 * Get available spells for a class
 * @param {string} classKey - Hero class key
 * @returns {string[]} Array of spell keys
 */
export const getAvailableSpells = (classKey) => {
  if (classKey === 'wizard') return WIZARD_SPELLS;
  if (classKey === 'elf') return ELF_SPELLS;
  if (classKey === 'druid') return DRUID_SPELLS;
  if (classKey === 'illusionist') return ILLUSIONIST_SPELLS;
  return [];
};

/**
 * Get spell slots for a character
 * @param {string} classKey - Hero class key
 * @param {number} level - Character level
 * @returns {number} Number of spell slots
 */
export const getSpellSlots = (classKey, level) => {
  if (classKey === 'wizard') return level + 2;
  if (classKey === 'druid') return level + 2;
  if (classKey === 'illusionist') return level + 3;
  if (classKey === 'elf') return level;
  return 0;
};

/**
 * Cast a spell
 * @param {string} spellKey - Spell to cast
 * @param {object} caster - Hero casting
 * @param {array} targets - Target(s) of the spell
 * @returns {object} Spell result
 */
export const castSpell = (spellKey, caster, targets = []) => {
  const spell = SPELLS[spellKey];
  if (!spell) return { success: false, message: 'Unknown spell' };
  
  const result = {
    spell: spellKey,
    spellName: spell.name,
    caster: caster.name,
    type: spell.type,
    effect: spell.effect,
    success: true,
    targets: [],
    message: `${caster.name} casts ${spell.name}!`
  };
  
  // Calculate damage/healing based on effect
  if (spell.damage) {
    const [dice, sides] = spell.damage.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    result.value = total;
    result.message += ` Deals ${total} damage!`;
  }
  
  if (spell.healing) {
    const [dice, sides] = spell.healing.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    result.value = total;
    result.message += ` Heals ${total} HP!`;
  }
  
  if (spell.bonus) {
    result.bonus = spell.bonus;
    result.message += ` +${spell.bonus} bonus applied!`;
  }
  
  return result;
};

export default {
  SPELLS,
  WIZARD_SPELLS,
  ELF_SPELLS,
  DRUID_SPELLS,
  ILLUSIONIST_SPELLS,
  getAvailableSpells,
  getSpellSlots,
  castSpell
};
