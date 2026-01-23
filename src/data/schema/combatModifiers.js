/**
 * Combat Modifiers Schema - Situational bonuses and penalties
 * Based on Four Against Darkness core rules
 */

/**
 * Environmental combat modifiers
 */
export const EnvironmentalModifiers = {
  darkness: {
    condition: (context) => !context.hasLight && !context.hero.darkvision,
    attackMod: -2,
    defenseMod: -2,
    saveMod: -2,
    disables: ["ranged", "search"],
  },

  narrowCorridor: {
    condition: (context) => context.location?.narrow,
    modifyWeapon: true, // Handled in weapon calculation
  },

  fungalGrottoes: {
    condition: (context) => context.environment === "fungalGrottoes",
    fleeingPenalty: {
      defenseMod: -1,
      except: ["ranger", "rogue", "acrobat", "halfling", "mushroomMonk"],
    },
  },

  caverns: {
    condition: (context) => context.environment === "caverns",
    features: ["stalactites", "stalagmites", "boulders", "echo", "waterPools"],
  },
};

/**
 * Combat state modifiers
 */
export const CombatStateModifiers = {
  unarmed: {
    attackMod: -2,
  },

  subdual: {
    attackMod: -1,
    nonLethal: true,
  },

  bound: {
    targetBonus: 2, // +2 to hit bound targets
  },

  mounted: {
    vsFootTarget: { attackMod: 1 },
  },

  surprised: {
    noShieldOnFirstDefense: true,
  },

  withdrawing: {
    defenseMod: 1,
    canUseShield: true,
    wanderingMonsters: "1-in-6",
  },

  fleeing: {
    defenseMod: 0,
    noShield: true,
    eachFoeAttacks: true,
  },

  attackingFleeingFoe: {
    attackMod: 1,
    oneAttackOnly: true,
  },

  sleeping: {
    autoHit: true,
    noDefense: true,
  },

  paralyzed: {
    autoHit: true,
    noDefense: true,
  },

  petrified: {
    autoHit: true,
    noDefense: true,
    cannotLoot: true,
  },

  rage: {
    condition: (context) => context.hero.class === "barbarian" && context.rageActive,
    attackMod: 2,
    tripleRoll: true, // Roll 3 dice, take best
    doubleDamage: true,
  },

  blessed: {
    attackMod: 1,
  },

  cursed: {
    defenseMod: -1,
  },

  charmed: {
    controlledBy: "enemy",
  },

  poisoned: {
    // Usually handled as damage or specific penalties
    varies: true,
  },

  diseased: {
    // Usually handled as ongoing penalties
    varies: true,
  },

  madness: {
    noEquipmentExchange: true,
    threshold: (level, madness) => madness > level, // Goes insane
  },
};

/**
 * Spell-based combat modifiers
 */
export const SpellModifiers = {
  protection: {
    defenseMod: 1,
    duration: "encounter",
  },

  barkskin: {
    defenseMod: 2,
    vsFire: { defenseMod: -2 },
    agilitySaves: -2,
    duration: "encounter",
  },

  illusionaryArmor: {
    defenseMod: "tier",
    notVs: ["vermin", "undead", "artificial", "elemental"],
    duration: "encounter",
  },

  illusionaryFog: {
    rangedAttacks: "suspended",
    gazeAttacks: "suspended",
    fleeing: { defenseMod: 2 },
    search: "disabled",
  },

  spiderweb: {
    targetPenalty: -1, // Enemies at -1L
    fire: "removes",
  },

  entangle: {
    targetPenalty: -1,
    fire: "no effect on entangle",
  },

  sleep: {
    autoHit: true,
    noDefense: true,
    canWake: true,
  },

  evilEye: {
    defenseMod: -1,
    duration: "until caster slain",
  },
};

/**
 * Trait-based modifiers
 */
export const TraitModifiers = {
  // Barbarian
  beastSlayer: {
    condition: (context) => context.target?.category === "weirdMonster",
    attackMod: 1,
  },

  // Dwarf
  axeMastery: {
    condition: (context) => context.weapon?.type === "axe",
    attackMod: 1,
  },

  // Halfling
  slingSkill: {
    condition: (context) => context.weapon?.id === "sling",
    attackMod: "tier",
  },

  nimbleDodge: {
    defenseMod: 1,
  },

  // Illusionist
  illusionaryKnifeThrow: {
    attackMod: "tier",
  },

  hazyVeil: {
    defenseMod: "tier",
  },

  // Kukla
  hiddenBlade: {
    attackMod: "tier",
    oncePerEncounter: true,
  },

  // Paladin
  mountedFighter: {
    condition: (context) => context.mounted,
    attackMod: "tier + 1", // +Tier for trait, +1 for mounted
  },

  sacredDefense: {
    condition: (context) => ["demon", "undead"].includes(context.target?.type),
    defenseMod: 1,
  },

  divineProtection: {
    defenseMod: 1,
  },

  // Ranger
  deadeye: {
    condition: (context) => ["bow", "crossbow"].includes(context.weapon?.category),
    attackMod: 1,
  },

  swornEnemy: {
    condition: (context) => context.target?.race === context.hero.swornEnemy,
    attackMod: 2,
    useHigherTierDie: true,
  },

  survival: {
    condition: (context) => context.terrain === context.hero.survivalTerrain,
    useHigherTierDie: true,
  },

  // Rogue
  knifeFighter: {
    condition: (context) => context.weapon?.id === "dagger" || context.weapon?.id === "knife",
    attackMod: "tier",
  },

  backstabbing: {
    condition: (context) => context.target?.isMajorFoe,
    applyOutnumberBonus: true,
  },

  // Warrior
  goodShot: {
    condition: (context) => context.weapon?.ranged,
    attackMod: 1,
  },

  swordTraining: {
    condition: (context) => context.weapon?.type === "sword",
    attackMod: "tier",
  },

  maceTraining: {
    condition: (context) => context.weapon?.type === "mace",
    attackMod: "tier",
  },

  tightGuard: {
    condition: (context) => context.isFirstAttackOfEncounter,
    defenseMod: 1,
  },

  // Wizard
  scrapper: {
    lightWeapon: { attackMod: 0 }, // Ignore -1 penalty
    defenseMod: 1,
  },

  // Druid
  wildform: {
    defenseMod: 1,
  },

  leafsteelFamiliarity: {
    condition: (context) => context.armor?.type === "leafsteelArmor",
    defenseMod: 1,
  },

  // Gnome
  clockworkArmorSpecialist: {
    condition: (context) => context.armor?.type === "clockworkArmor" && context.isFirstAttackReceived,
    defenseMod: 1,
  },

  // Mushroom Monk
  thoughCap: {
    defenseMod: 1,
  },

  leapAway: {
    defenseMod: "L",
  },

  // Swashbuckler
  bladeDance: {
    defenseMod: "X", // X panache points spent
  },

  // Bulwark/Paladin
  shieldwall: {
    condition: (context) => context.adjacentAllyHasShield,
    defenseMod: 1,
  },

  // Acrobat
  vaultingStrike: {
    failed: { defenseMod: -2, duration: 1 }, // Full turn penalty if failed
  },

  // Light Gladiator
  watchTheEnemy: {
    vsMelee: { defenseMod: 1 },
  },
};

/**
 * Special enemy modifiers
 */
export const EnemyModifiers = {
  minotaurCharge: {
    firstDefense: -1,
  },

  caveOrcCharge: {
    firstDefense: -1,
  },

  morlockVsLight: {
    condition: (context) => context.hero.hasLight,
    heroDefenseMod: 2,
  },

  flailAttack: {
    ignoreShield: true,
  },

  gazeAttack: {
    beforeCombat: true,
    save: "vs L",
    effect: "varies", // Petrification, charm, etc.
  },

  dragonBreath: {
    targetAll: true,
    save: "vs L",
    damage: "varies",
  },

  poisonAttack: {
    onHit: "save vs poison or additional damage",
  },

  diseaseAttack: {
    onHit: "save vs disease or ongoing effect",
  },

  levelDrain: {
    onHit: "save or lose 1 level",
  },
};

/**
 * Calculate all combat modifiers for an attack
 * @param {object} attacker - Hero making the attack
 * @param {object} target - Foe being attacked
 * @param {object} context - Combat context
 * @returns {object} Combined modifiers
 */
export function calculateCombatModifiers(attacker, target, context = {}) {
  const modifiers = {
    attack: 0,
    defense: 0,
    damage: 1,
    special: [],
  };

  // Environmental
  if (EnvironmentalModifiers.darkness.condition(context)) {
    modifiers.attack += EnvironmentalModifiers.darkness.attackMod;
  }

  // Combat state
  if (context.rageActive && attacker.class === "barbarian") {
    modifiers.attack += CombatStateModifiers.rage.attackMod;
    modifiers.damage *= 2;
    modifiers.special.push("tripleRoll");
  }

  if (context.blessed) {
    modifiers.attack += CombatStateModifiers.blessed.attackMod;
  }

  if (context.unarmed) {
    modifiers.attack += CombatStateModifiers.unarmed.attackMod;
  }

  if (context.subdual) {
    modifiers.attack += CombatStateModifiers.subdual.attackMod;
  }

  if (target.bound) {
    modifiers.attack += CombatStateModifiers.bound.targetBonus;
  }

  // Spell effects
  if (context.protectionActive) {
    modifiers.defense += SpellModifiers.protection.defenseMod;
  }

  if (context.barkskinActive) {
    modifiers.defense += SpellModifiers.barkskin.defenseMod;
    if (target.type === "fire") {
      modifiers.defense += SpellModifiers.barkskin.vsFire.defenseMod;
    }
  }

  return modifiers;
}

/**
 * Get trait modifier
 * @param {string} traitKey - Trait identifier
 * @param {object} context - Context
 * @returns {number|null} Modifier value or null
 */
export function getTraitModifier(traitKey, context) {
  const trait = TraitModifiers[traitKey];
  if (!trait) return null;

  if (trait.condition && !trait.condition(context)) {
    return null;
  }

  return trait.attackMod || trait.defenseMod || null;
}

/**
 * Check if a condition applies
 * @param {object} modifier - Modifier definition
 * @param {object} context - Combat context
 * @returns {boolean}
 */
export function conditionApplies(modifier, context) {
  if (!modifier.condition) return true;
  return modifier.condition(context);
}
