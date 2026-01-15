/**
 * Character Traits System
 * Optional traits for various character classes
 */

// Warrior Traits
export const WARRIOR_TRAITS = [
  {
    key: 'goodShot',
    name: 'Good Shot',
    description: 'Gain +1 to Attack rolls with ranged weapons',
    benefit: '+1 ranged attack'
  },
  {
    key: 'shieldExpert',
    name: 'Shield Expert',
    description: 'Once per adventure, if you carry a shield, reduce damage from one attack by 1. This may bring damage to zero.',
    benefit: '1x per adventure: -1 damage (with shield)'
  },
  {
    key: 'powerStrike',
    name: 'Power Strike',
    description: 'Once per adventure, one of your attacks inflicts +1 damage. Use this Trait after performing the Attack roll.',
    benefit: '1x per adventure: +1 damage'
  },
  {
    key: 'intuitiveTeamTactics',
    name: 'Intuitive Team Tactics',
    description: "Once per combat, give a +1 to a single Defense or Attack roll performed by an ally. You can't use this Trait if the party was surprised.",
    benefit: '1x per combat: +1 to ally roll'
  },
  {
    key: 'tightGuard',
    name: 'Tight Guard',
    description: 'Gain +1 to Defense rolls vs. the first attack targeting you in every combat.',
    benefit: '+1 Defense vs first attack'
  },
  {
    key: 'swordMaceTraining',
    name: 'Sword/Mace Training',
    description: 'Choose mace or sword (blunt or slashing hand weapon). Add +Tier to Attack rolls with that weapon.',
    benefit: '+Tier to chosen weapon',
    requiresChoice: true,
    choices: ['sword', 'mace']
  }
];

// Acrobat Traits
export const ACROBAT_TRAITS = [
  {
    key: 'gracefulDodge',
    name: 'Graceful Dodge',
    description: 'Once per combat, reduce damage from a physical attack by 1. This may bring damage to zero.',
    benefit: '1x per combat: -1 damage'
  },
  {
    key: 'quickClimber',
    name: 'Quick Climber',
    description: 'You add +Tier on Climbing Saves.',
    benefit: '+Tier climbing saves'
  },
  {
    key: 'masterOfEvasion',
    name: 'Master of Evasion',
    description: 'You may use your Evade ability without spending any Trick points.',
    benefit: 'Free Evade trick'
  },
  {
    key: 'distractingFeint',
    name: 'Distracting Feint',
    description: "Once per combat, prevent a Foe from performing their next attack. Foes with more than 1 attack will skip a single attack, not their complete turn. You must be in melee contact to use this ability. You cannot use this ability in a corridor if you are in the rearguard.",
    benefit: '1x per combat: skip foe attack'
  },
  {
    key: 'distract',
    name: 'Distract',
    description: "Once per combat and for a single turn, reduce a Foe's L by 1. You must be in melee with the Foe to use this ability. You cannot use this ability in a corridor if you are in the rearguard.",
    benefit: '1x per combat: -1 to Foe L'
  },
  {
    key: 'quickDrawTalent',
    name: 'Quick Draw Talent',
    description: 'You may draw a weapon or exchange weapons in no time, for example putting away a sling and drawing a dagger in the same turn, and attacking. You may still perform a single Attack roll per turn.',
    benefit: 'Instant weapon swap'
  }
];

// Wizard Traits
export const WIZARD_TRAITS = [
  {
    key: 'arcaneMemory',
    name: 'Arcane Memory',
    description: 'You have 1 additional spell slot.',
    benefit: '+1 spell slot'
  },
  {
    key: 'keenObserver',
    name: 'Keen Observer',
    description: 'You have +1 on Search rolls.',
    benefit: '+1 Search'
  },
  {
    key: 'spellEfficiency',
    name: 'Spell Efficiency',
    description: 'Once per adventure, you may cast a spell without removing it from your spell slot.',
    benefit: '1x per adventure: free spell'
  },
  {
    key: 'sygilist',
    name: 'Sygilist',
    description: 'Add +Tier to your spellcasting rolls when casting spells from a scroll or from an inscription.',
    benefit: '+Tier to scroll casting'
  },
  {
    key: 'scrapper',
    name: 'Scrapper',
    description: 'Gain +1 to Defense rolls. Ignore the -1 on Attack rolls when using a light weapon of your choice (stick or dagger).',
    benefit: '+1 Defense, ignore light weapon penalty',
    requiresChoice: true,
    choices: ['stick', 'dagger']
  },
  {
    key: 'specialist',
    name: 'Specialist',
    description: 'Choose Lightning, Sleep or Fireball. Add +Tier to your spellcasting roll when casting that spell.',
    benefit: '+Tier to chosen spell',
    requiresChoice: true,
    choices: ['lightning', 'sleep', 'fireball']
  }
];

// Kukla Traits
export const KUKLA_TRAITS = [
  {
    key: 'hairMastery',
    name: 'Hair Mastery',
    description: 'Once per adventure, you may use your hair to disarm a Trap or open a lock without using your hands with a +L bonus instead of your usual +1/2 L.',
    benefit: '1x per adventure: +L to trap/lock'
  },
  {
    key: 'hiddenBlade',
    name: 'Hidden Blade',
    description: 'Once per encounter, you may draw a knife from your secret compartment as a free action and immediately make a surprise Attack.',
    benefit: '1x per encounter: surprise attack'
  },
  {
    key: 'reinforcedBody',
    name: 'Reinforced Body',
    description: 'Gain +1 Life.',
    benefit: '+1 Life'
  },
  {
    key: 'spiritLimbs',
    name: 'Spirit Limbs',
    description: 'Once per adventure, reattach a severed limb or repair your body.',
    benefit: '1x per adventure: repair limb'
  },
  {
    key: 'hairTangle',
    name: 'Hair Tangle',
    description: 'Once per combat, entangle a Foe to restrain them. Damage inflicted on a restrained Foe is Subdual. If you flee the combat, you automatically release any bound Foe.',
    benefit: '1x per combat: restrain foe'
  },
  {
    key: 'clockworkReflexes',
    name: 'Clockwork Reflexes',
    description: 'Your uncanny agility allows you to reroll all failed Saves vs. Traps (to avoid their effect, not to disarm them) and all Defense rolls vs. ranged attacks.',
    benefit: 'Reroll trap saves & ranged defense'
  }
];

// Trait mapping by class
export const CLASS_TRAITS = {
  warrior: WARRIOR_TRAITS,
  acrobat: ACROBAT_TRAITS,
  wizard: WIZARD_TRAITS,
  kukla: KUKLA_TRAITS
};

/**
 * Get traits available for a character class
 * @param {string} classKey - Character class key
 * @returns {Array} Array of trait objects
 */
export function getTraitsForClass(classKey) {
  return CLASS_TRAITS[classKey] || [];
}

/**
 * Check if a class has traits available
 * @param {string} classKey - Character class key
 * @returns {boolean}
 */
export function hasTraits(classKey) {
  return classKey in CLASS_TRAITS && CLASS_TRAITS[classKey].length > 0;
}

/**
 * Get trait by key for a specific class
 * @param {string} classKey - Character class key
 * @param {string} traitKey - Trait key
 * @returns {Object|null}
 */
export function getTrait(classKey, traitKey) {
  const traits = getTraitsForClass(classKey);
  return traits.find(t => t.key === traitKey) || null;
}

/**
 * Random roll for trait (d6)
 * @param {string} classKey - Character class key
 * @returns {Object|null}
 */
export function rollRandomTrait(classKey) {
  const traits = getTraitsForClass(classKey);
  if (traits.length === 0) return null;

  const roll = Math.floor(Math.random() * 6); // 0-5, maps to traits[0-5]
  return traits[roll] || traits[0];
}
