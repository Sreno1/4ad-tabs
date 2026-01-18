/**
 * Monster Actions - Spawning, reactions, XP, morale, and monster-specific logic
 */
import { d6 } from '../dice.js';
import { formatRollPrefix } from '../rollLog.js';
import {
  createMonster,
  createMonsterFromTable,
  MONSTER_TABLE,
  rollReaction,
  applyMonsterAbility,
  canLevelUp
} from '../../data/monsters.js';
import { ENVIRONMENT_LABELS, ENVIRONMENT_MONSTER_CATEGORIES, normalizeEnvironment } from '../../constants/environmentConstants.js';

/**
 * Spawn a monster and dispatch it to state
 * @param {function} dispatch - Reducer dispatch function
 * @param {string} type - Monster template key
 * @param {number} level - Override level (optional)
 */
export const spawnMonster = (dispatch, type, level = null, opts = {}) => {
  const monster = createMonster(type, level);
  if (!monster) return;

  // Allow callers to mark spawned monsters as part of an ambush (target rear)
  if (opts.ambush) {
    monster.ambush = true;
  }

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

const getRandomMonsterKeyByCategory = (category) => {
  const candidates = Object.entries(MONSTER_TABLE)
    .filter(([, t]) => t.category === category)
    .map(([k]) => k);
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

/**
 * Roll on wandering monster table and spawn result
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Roll result info
 */
export const rollWanderingMonster = (dispatch, opts = {}) => {
  const roll = d6();
  const envKey = normalizeEnvironment(opts.environment || opts.state?.currentEnvironment);
  const categories = ENVIRONMENT_MONSTER_CATEGORIES[envKey] || ENVIRONMENT_MONSTER_CATEGORIES.dungeon;

  let monsterKey = null;
  if (roll <= 3) monsterKey = getRandomMonsterKeyByCategory(categories.vermin);
  else if (roll === 4) monsterKey = getRandomMonsterKeyByCategory(categories.minions);
  else if (roll === 5) monsterKey = getRandomMonsterKeyByCategory(categories.weird);
  else monsterKey = getRandomMonsterKeyByCategory(categories.boss);

  let spawnedMonster = null;
  if (monsterKey) {
    const hcl = opts.state?.hcl || 1;
    spawnedMonster = createMonsterFromTable(monsterKey, hcl);
    if (spawnedMonster) {
      if (spawnedMonster.count !== undefined) spawnedMonster.isMinorFoe = true;
      if (opts.ambush) spawnedMonster.ambush = true;
      dispatch({ type: 'ADD_MONSTER', m: spawnedMonster });
      if (spawnedMonster.isMinorFoe && spawnedMonster.count) {
        dispatch({ type: 'LOG', t: `${spawnedMonster.count} ${spawnedMonster.name} L${spawnedMonster.level} appear!` });
      } else {
        dispatch({ type: 'LOG', t: `${spawnedMonster.name} L${spawnedMonster.level} (${spawnedMonster.hp}HP) appears!` });
      }
    }
  }

  // If caller requested wandering-encounter meta, dispatch it for the UI/reducer
  if (opts && (typeof opts.ambush !== 'undefined' || typeof opts.shieldsDisabledFirst !== 'undefined')) {
    try {
      dispatch({ type: 'SET_WANDERING_ENCOUNTER', ambush: !!opts.ambush, location: opts.location || null, shieldsDisabledFirst: !!opts.shieldsDisabledFirst });
    } catch (e) {
      // ignore dispatch errors
    }
  }
  // If this was an ambush, trigger immediate initial strikes using combatActions helper
  if (opts && opts.ambush) {
    try {
      // Lazy-import to avoid circular requires at top-level
      const combatActions = require('./combatActions.js');
      // We need to pass the current state - caller can supply state in opts.state; fallback: skip if not provided
      if (opts.state) {
        combatActions.initialWanderingStrikes(dispatch, opts.state);
      } else {
        // If state not provided, log a warning (non-fatal)
        dispatch({ type: 'LOG', t: '⚠️ Wandering ambush occurred but state was not provided for immediate strikes.' });
      }
    } catch (e) {
      // ignore
    }
  }

  const envLabel = ENVIRONMENT_LABELS[envKey] || 'Dungeon';
  const monsterName = spawnedMonster ? spawnedMonster.name : 'Unknown';
  dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}Wandering Monster (${envLabel}): ${monsterName}` });

  return { roll, type: monsterKey };
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
  dispatch({ type: 'LOG', t: `${formatRollPrefix(reaction.roll)}🎲 Reaction: ${reaction.description}` });

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
 * Award XP to party for defeating a monster (with d6 rolls)
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} monster - Defeated monster
 * @param {array} party - Party array
 * @returns {object} XP distribution result with individual rolls
 */
export const awardXP = (dispatch, monster, party) => {
  const baseXP = monster.xp || monster.level;
  const aliveHeroes = party.filter(h => h.hp > 0);

  if (aliveHeroes.length === 0) return { xp: 0, rolls: [] };

  const rolls = [];

  // Each surviving hero rolls d6 for their XP
  party.forEach((hero, idx) => {
    if (hero.hp > 0) {
      const roll = d6();
      // XP = (Monster XP × roll) / 6, rounded down
      const earnedXP = Math.floor((baseXP * roll) / 6);

      dispatch({ type: 'ADD_XP', heroIdx: idx, amount: earnedXP });

      rolls.push({
        heroIdx: idx,
        heroName: hero.name,
        roll,
        earnedXP
      });

      dispatch({
        type: 'LOG',
        t: `${formatRollPrefix(roll)}🎲 ${hero.name} rolls ${roll} for XP: ${earnedXP} XP earned!`
      });
    }
  });

  const totalXP = rolls.reduce((sum, r) => sum + r.earnedXP, 0);
  dispatch({ type: 'LOG', t: `⭐ Party earned ${totalXP} total XP from ${monster.name}!` });

  return { baseXP, totalXP, rolls, recipients: aliveHeroes.length };
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
    // Handle per-round monster abilities (regen, etc.)
    if (monster.hp > 0 && monster.special) {
      const result = applyMonsterAbility(monster, 'round_start', {});
      if (result) {
        dispatch({ type: 'LOG', t: result.message });
        if (result.effect === 'heal') {
          dispatch({ type: 'APPLY_MONSTER_ABILITY', monsterIdx: idx, effect: 'heal', value: result.value });
        }
      }
    }

    // Decrement and expire temporary status effects applied by spells
    try {
      // Entangle
      if (monster.entangled && typeof monster.entangleTurns === 'number') {
        const newTurns = monster.entangleTurns - 1;
        if (newTurns <= 0) {
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { entangled: false, entangleTurns: 0 } });
          dispatch({ type: 'LOG', t: `🕸️ ${monster.name} is no longer entangled.` });
        } else {
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { entangleTurns: newTurns } });
        }
      }

      // Bound
      if (monster.bound && typeof monster.boundTurns === 'number') {
        const newTurns = monster.boundTurns - 1;
        if (newTurns <= 0) {
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { bound: false, boundTurns: 0 } });
          dispatch({ type: 'LOG', t: `🔗 ${monster.name} is no longer bound.` });
        } else {
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { boundTurns: newTurns } });
        }
      }

      // Asleep
      if (monster.status && monster.status.asleep && typeof monster.asleepTurns === 'number') {
        const newTurns = monster.asleepTurns - 1;
        if (newTurns <= 0) {
          const newStatus = { ...(monster.status || {}) };
          delete newStatus.asleep;
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { status: newStatus, asleepTurns: 0 } });
          dispatch({ type: 'LOG', t: `😴 ${monster.name} wakes up.` });
        } else {
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { asleepTurns: newTurns } });
        }
      }
    } catch (e) {
      // Ignore per-turn status errors
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
      ? `${formatRollPrefix(roll)}🏃 Morale check: d6=${roll}${modStr} → ${foe.name} FLEE!`
      : `${formatRollPrefix(roll)}⚔️ Morale check: d6=${roll}${modStr} → ${foe.name} keep fighting!`
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
 * @param {number} [surpriseChanceOverride] - Optional X for X-in-6 surprise override
 * @returns {object} Surprise result
 */
export const rollSurprise = (monster, surpriseChanceOverride = null) => {
  // Allow caller (UI or encounter generator) to provide an X-in-6 override.
  const surpriseChance = (typeof surpriseChanceOverride === 'number')
    ? surpriseChanceOverride
    : (monster?.surpriseChance || 0); // e.g., 2 for 2-in-6

  if (!surpriseChance || surpriseChance <= 0) {
    return { surprised: false, roll: null, chance: 0 };
  }

  const roll = d6();
  const surprised = roll <= surpriseChance;

  return {
    surprised,
    roll,
    chance: surpriseChance,
    message: surprised
      ? `${formatRollPrefix(roll)}😱 Party is surprised! (rolled ${roll}, needed ≤${surpriseChance})`
      : `${formatRollPrefix(roll)}✅ Party avoids surprise (rolled ${roll}, needed ≤${surpriseChance})`
  };
};
