/**
 * Magic System definitions for Four Against Darkness (Phase 4)
 * Spells for Wizards and Elves
 */
import { d6, roll } from '../utils/dice.js';
import { getDefaultContext } from '../game/context.js';

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
export const castSpell = (spellKey, caster, context = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const spell = SPELLS[spellKey];
  if (!spell) return { success: false, message: 'Unknown spell' };

  const targets = context.targets || [];
  const castingBonus = (typeof context.castingBonus === 'number') ? context.castingBonus : (targets[0]?.castingBonus || 0);

  const result = {
    spell: spellKey,
    spellName: spell.name,
    caster: caster?.name || 'Unknown',
    type: spell.type,
    effect: spell.effect,
    success: true,
    targets: targets,
    details: {},
    message: `${caster?.name || 'Someone'} casts ${spell.name}!`
  };

  // Helper: roll XdY string or number
  const rollExpr = (expr) => {
    if (!expr) return 0;
    if (typeof expr === 'number') return expr;
    if (typeof expr === 'string' && expr.includes('d')) {
      const [dice, sides] = expr.split('d').map(Number);
      return roll(dice, sides, 0, rng, rollLog);
    }
    const n = Number(expr);
    return isNaN(n) ? 0 : n;
  };

  // Helper: resolve simple duration expressions (numbers, 'tier', 'encounter')
  const resolveDuration = (val) => {
    if (!val) return null;
    if (typeof val === 'number') return val;
    if (val === 'encounter' || val === 'adventure' || val === 'timed') return null;
    const tierVal = (caster && (caster.tier || caster.lvl)) || 1;
    try {
      let s = String(val).replace(/tier/g, String(tierVal)).replace(/_?turns?/g, '');
      const n = Number(s);
      return isNaN(n) ? null : n;
    } catch (e) {
      return null;
    }
  };

  // Helper: perform MR check. Returns {passed: bool, message}
  const checkMR = (target) => {
    const hasMR = target && ( (Array.isArray(target.special) && target.special.includes('magic_resist')) || target.special === 'magic_resist');
    const mr = hasMR ? (target.mr || 5) : (target.mr || 0);
    if (!mr) return { passed: true };
    // caster performs spellcasting roll: d6 + caster.lvl (+ trait/specialist/scroll bonus) vs MR
    const r = d6(rng, rollLog);
    const bonus = castingBonus || 0;
    const total = r + (caster?.lvl || 0) + bonus;
    return { passed: total >= mr, roll: r, total, mr, bonus };
  };

  // Helper: perform spellcasting roll vs target Level. Returns {hit: bool, roll, total}
  const spellcastRollVsLevel = (targetLevel) => {
    const r = d6(rng, rollLog);
    const bonus = castingBonus || 0;
    const total = r + (caster?.lvl || 0) + bonus;
    return { hit: total >= (targetLevel || 1), roll: r, total, bonus };
  };

  // Single-target damage
  if (spell.effect === 'single_damage') {
    const target = targets && targets[0];
    // Check MR first
    if (target) {
      const hasMR = (Array.isArray(target.special) && target.special.includes('magic_resist')) || target.special === 'magic_resist';
      if (hasMR) {
        const mrRes = checkMR(target);
        result.details.mr = mrRes;
        if (!mrRes.passed) {
          result.success = false;
          result.message = `${caster.name} fails to penetrate Magic Resistance (MR${mrRes.mr}). Spell wasted.`;
          return result;
        }
      }
      // Now perform spellcasting roll vs target level for spells that require a hit
      const castRes = spellcastRollVsLevel(target.level || 1);
      result.details.cast = castRes;
      result.hit = castRes.hit;
      result.roll = castRes.roll;
      result.total = castRes.total;
      if (!result.hit) {
        result.message += ` The spell fails to affect the target (roll ${result.roll}+${caster?.lvl||0}+${castingBonus} vs L${target.level||1}).`;
        return result;
      }
    }
    const dmg = rollExpr(spell.damage);
    result.value = dmg;
    result.message += ` Deals ${dmg} damage to target.`;
  }

  // AoE damage (applies to groups or all monsters)
  if (spell.effect === 'aoe_damage') {
    // For AoE spells, some foes (minor vs major) behave differently (e.g., Fireball)
    const dmg = rollExpr(spell.damage);
    result.value = dmg;
    result.message += ` Deals ${dmg} damage to enemies.`;
  }

  // Fireball exact rules vs Major Foes: inflicts 1 damage on Major Foe (not d6)
  if (spellKey === 'fireball' && targets && targets[0] && targets[0].count === undefined) {
    // single major target
    result.effect = 'single_damage';
    result.value = 1;
    result.message = `${caster.name} hurls a Fireball dealing 1 damage to the Major Foe.`;
    return result;
  }

  // Apply trait-based and other casting modifiers into result.details if caller passes 'castingBonus' in targets[0]
  // Note: performCastSpell will set result.details.castingBonus from scrolls/traits
  if (!result.details) result.details = {};

  // Sleep: number of minor foes or single major
  if (spell.effect === 'sleep') {
    // d6 + caster L. Does not work on Unliving, elementals, most dragons or L11+
    const d6v = d6(rng, rollLog);
    const number = d6v + (caster?.lvl || 0);
    result.value = number;
    result.duration = resolveDuration(1);
    result.message += ` Attempts to put ${number} Minor Foes to sleep or one Major Foe.`;
  }

  // Protection/defense buffs
  if (spell.effect === 'defense_buff') {
  result.bonus = spell.bonus || 0;
  result.duration = resolveDuration(spell.duration || 'encounter');
  result.message += ` Grants +${result.bonus} to Defense until ${result.duration || 'end of encounter'}.`;
  }

  // Summon companion
  if (spell.effect === 'summon_companion') {
    result.summon = {
      name: spell.name === 'Summon Beast' ? 'Summoned Beast' : spell.name,
      life: spell.life || 5,
      attack: spell.attack || 1,
      damage: spell.damageAmount || 1,
  duration: resolveDuration(spell.duration || 'encounter')
    };
    result.message += ` Summons ${result.summon.name}.`;
  }

  // Entangle / webbing: number or single
  if (spell.effect === 'entangle') {
    result.debuff = spell.debuff || -1;
    result.duration = resolveDuration(spell.duration || 'encounter');
    result.message += ` Targets suffer ${result.debuff} to L for ${result.duration || 'the encounter'}.`;
  }

  // Bind (phantasmal binding)
  if (spell.effect === 'bind') {
    result.duration = resolveDuration(spell.duration || (caster?.tier || caster?.lvl || 1));
    result.message += ` Attempts to bind target for ${result.duration || 'the encounter'} turns.`;
  }

  // Fog
  if (spell.effect === 'fog') {
    result.bonus = spell.bonus || 0;
    result.duration = resolveDuration(spell.duration || 'encounter');
    result.message += ` Creates fog: ranged/gaze suspended, +${result.bonus} when fleeing.`;
  }

  // Dispel illusions
  if (spell.effect === 'dispel_illusions') {
    result.message += ` Dispels illusions and reveals invisible foes.`;
  }

  // Subdual buff
  if (spell.effect === 'subdual_buff') {
    result.duration = resolveDuration(spell.duration || 'encounter');
    result.message += ` Allies ignore -1 Subdual penalty this encounter.`;
  }

  // Food / banquet
  if (spell.effect === 'food') {
    result.amount = spell.amount || ((caster?.tier || caster?.lvl || 1) + 3);
    result.message += ` Creates ${result.amount} illusionary rations (7 days safe).`;
  }

  // Shadow strike / subdual damage
  if (spell.effect === 'subdual_damage') {
    // damage is in 'damage' field as numeric or 'tier' placeholder
    const base = spell.damage === 'tier' ? (caster?.tier || caster?.lvl || 1) : rollExpr(spell.damage);
    result.value = base;
    result.message += ` Deals ${base} subdual damage on hit.`;
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
