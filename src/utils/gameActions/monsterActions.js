/**
 * Monster Actions - Spawning, reactions, XP, morale, and monster-specific logic
 */
import { d6 } from '../dice.js';
import {
  createMonster,
  WANDERING_TABLE,
  rollReaction,
  applyMonsterAbility,
  canLevelUp
} from '../../data/monsters.js';

/**
 * Spawn a monster and dispatch it to state
 * @param {function} dispatch - Reducer dispatch function
 * @param {string} type - Monster template key
 * @param {number} level - Override level (optional)
 */
export const spawnMonster = (dispatch, type, level = null) => {
  const monster = createMonster(type, level);
  if (!monster) return;

  dispatch({ type: 'ADD_MONSTER', m: monster });

  // Log message - show count for Minor Foes, HP for others
  if (monster.isMinorFoe && monster.count) {
    dispatch({ type: 'LOG', t: `${monster.count} ${monster.name} L${monster.level} appear!` });
  } else {
    dispatch({ type: 'LOG', t: `${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
  }
};

/**
 * Spawn a Major Foe, with boss check already done
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} hcl - Party HCL (Hero Challenge Level)
 * @param {boolean} isBoss - Whether this is THE BOSS (gets +1 Life, +1 Attack, 3x treasure)
 */
export const spawnMajorFoe = (dispatch, hcl, isBoss = false) => {
  const monster = createMonster('major', hcl);
  if (!monster) return;

  if (isBoss) {
    // Boss gets +1 Life, +1 Attack, and fights to the death
    monster.hp += 1;
    monster.maxHp += 1;
    monster.attack = (monster.attack || 0) + 1;
    monster.isBoss = true;
    monster.neverChecksMorale = true; // Bosses fight to the bitter end
    monster.treasureMultiplier = 3; // 3x treasure
    monster.name = `${monster.name} [BOSS]`;
  }

  dispatch({ type: 'ADD_MONSTER', m: monster });

  if (isBoss) {
    dispatch({ type: 'LOG', t: `👑 ${monster.name} L${monster.level} (${monster.hp}HP, +1 ATK) appears! THE BOSS!` });
  } else {
    dispatch({ type: 'LOG', t: `⚔️ ${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
  }
};

/**
 * Roll on wandering monster table and spawn result
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Roll result info
 */
export const rollWanderingMonster = (dispatch) => {
  const roll = d6();
  const monsterType = WANDERING_TABLE[roll];

  if (roll >= 1 && roll <= 5) {
    spawnMonster(dispatch, monsterType, roll);
  }

  const displayNames = ['', 'Goblin (L1)', 'Orc (L2)', 'Troll (L3)', 'Ogre (L4)', 'Dragon (L5)', 'Special'];
  dispatch({ type: 'LOG', t: `Wandering Monster d6=${roll}: ${displayNames[roll]}` });

  return { roll, type: monsterType };
};

/**
 * Roll monster reaction and dispatch result
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} monsterIdx - Monster index in state
 * @returns {object} Reaction result
 */
export const rollMonsterReaction = (dispatch, monsterIdx) => {
  const reaction = rollReaction();

  dispatch({ type: 'SET_MONSTER_REACTION', monsterIdx, reaction: reaction.reaction });
  dispatch({ type: 'LOG', t: `🎲 Reaction d6=${reaction.roll}: ${reaction.description}` });

  if (reaction.initiative === 'monster') {
    dispatch({ type: 'LOG', t: `⚠️ Monster attacks first!` });
  } else if (reaction.initiative === 'party') {
    dispatch({ type: 'LOG', t: `✅ Party acts first!` });
  } else {
    dispatch({ type: 'LOG', t: `⚔️ Roll for initiative!` });
  }

  return reaction;
};

/**
 * Award XP to party for defeating a monster
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} monster - Defeated monster
 * @param {array} party - Party array
 * @returns {object} XP distribution result
 */
export const awardXP = (dispatch, monster, party) => {
  const xp = monster.xp || monster.level;
  const aliveHeroes = party.filter(h => h.hp > 0);

  if (aliveHeroes.length === 0) return { xp: 0 };

  // Split XP among surviving party members
  const xpEach = Math.ceil(xp / aliveHeroes.length);

  party.forEach((hero, idx) => {
    if (hero.hp > 0) {
      dispatch({ type: 'ADD_XP', heroIdx: idx, amount: xpEach });
    }
  });

  dispatch({ type: 'LOG', t: `⭐ Party gains ${xp} XP! (${xpEach} each)` });

  return { xp, xpEach, recipients: aliveHeroes.length };
};

/**
 * Check and perform level up for a hero
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero to check
 * @param {number} heroIdx - Hero's index
 * @returns {object} Level up result
 */
export const checkLevelUp = (dispatch, hero, heroIdx) => {
  if (!canLevelUp(hero)) {
    return { leveledUp: false };
  }

  const oldLevel = hero.lvl;
  dispatch({ type: 'LEVEL_UP', heroIdx });
  dispatch({ type: 'LOG', t: `🎉 ${hero.name} levels up! L${oldLevel} → L${oldLevel + 1}` });

  return { leveledUp: true, oldLevel, newLevel: oldLevel + 1 };
};

/**
 * Process monster round start abilities (like regeneration)
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} monsters - Current monsters
 */
export const processMonsterRoundStart = (dispatch, monsters) => {
  monsters.forEach((monster, idx) => {
    if (monster.hp > 0 && monster.special) {
      const result = applyMonsterAbility(monster, 'round_start', {});
      if (result) {
        dispatch({ type: 'LOG', t: result.message });
        if (result.effect === 'heal') {
          dispatch({ type: 'APPLY_MONSTER_ABILITY', monsterIdx: idx, effect: 'heal', value: result.value });
        }
      }
    }
  });
};

/**
 * Check morale for Minor Foes at 50% casualties
 * @param {object} foe - Minor foe
 * @param {number} initialCount - Starting count
 * @param {number} currentCount - Current count
 * @returns {object} Morale check result
 */
export const checkMinorFoeMorale = (foe, initialCount, currentCount) => {
  // Check if morale should never be checked:
  // 1. Foe has neverChecksMorale property (e.g., boss), OR
  // 2. Foe rolled "Fight to the Death" reaction (checksMorale: false)
  const hasNoMoraleReaction = foe.reaction && foe.reaction.checksMorale === false;
  const neverChecksMorale = foe.neverChecksMorale || hasNoMoraleReaction;

  // Skip if morale never checked or not below 50% remaining
  const halfPoint = Math.ceil(initialCount / 2);

  if (neverChecksMorale || currentCount >= halfPoint) {
    return { checked: false, fled: false };
  }

  const roll = d6();
  const moraleMod = foe.moraleMod || 0;
  const adjustedRoll = roll + moraleMod;

  // 1-3 = flee, 4+ = keep fighting
  const fled = adjustedRoll <= 3;

  const modStr = moraleMod !== 0 ? ` ${moraleMod > 0 ? '+' : ''}${moraleMod}=${adjustedRoll}` : '';

  return {
    checked: true,
    roll,
    moraleMod,
    adjustedRoll,
    fled,
    message: fled
      ? `🏃 Morale check: d6=${roll}${modStr} → ${foe.name} FLEE!`
      : `⚔️ Morale check: d6=${roll}${modStr} → ${foe.name} keep fighting!`
  };
};

/**
 * Check if Major Foe should have level reduced (at half HP)
 * Per 4AD rules: When below 50% Life, reduce Level by 1
 * @param {object} foe - Major foe
 * @returns {object} { shouldReduce, newLevel, message }
 */
export const checkMajorFoeLevelReduction = (foe) => {
  // "More than half Life lost" = remaining HP is half or less (using floor for correct threshold)
  const halfHP = Math.floor(foe.maxHp / 2);
  const shouldReduce = foe.hp <= halfHP && foe.hp > 0 && !foe.levelReduced;

  return {
    shouldReduce,
    newLevel: shouldReduce ? Math.max(1, foe.level - 1) : foe.level,
    message: shouldReduce
      ? `📉 ${foe.name} is wounded! Level reduced to L${Math.max(1, foe.level - 1)}`
      : null
  };
};

/**
 * Roll for surprise
 * @param {object} monster - Monster with surpriseChance property
 * @returns {object} Surprise result
 */
export const rollSurprise = (monster) => {
  const surpriseChance = monster?.surpriseChance || 0; // e.g., 2 for 2-in-6

  if (surpriseChance <= 0) {
    return { surprised: false, roll: null, chance: 0 };
  }

  const roll = d6();
  const surprised = roll <= surpriseChance;

  return {
    surprised,
    roll,
    chance: surpriseChance,
    message: surprised
      ? `😱 Party is surprised! (rolled ${roll}, needed ≤${surpriseChance})`
      : `✅ Party avoids surprise (rolled ${roll}, needed ≤${surpriseChance})`
  };
};
