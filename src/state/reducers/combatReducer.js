/**
 * Combat Reducer - Handles monsters, combat state, and abilities
 */
import * as A from '../actions.js';

/**
 * Combat reducer - handles all combat-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function combatReducer(state, action) {
  switch (action.type) {
    // ========== Monster Management ==========
    case A.ADD_MONSTER:
      return { ...state, monsters: [...state.monsters, action.m] };

    case A.UPD_MONSTER:
      return {
        ...state,
        monsters: state.monsters.map((m, i) =>
          i === action.i ? { ...m, ...action.u } : m
        )
      };

    case A.DEL_MONSTER: {
      // Track kill for campaign stats if in campaign mode
      const updatedParty = state.mode === 'campaign'
        ? state.party.map(hero => ({
            ...hero,
            stats: {
              ...hero.stats,
              monstersKilled: (hero.stats?.monstersKilled || 0) + 1
            }
          }))
        : state.party;

      return {
        ...state,
        party: updatedParty,
        monsters: state.monsters.filter((_, i) => i !== action.i)
      };
    }

    case A.CLEAR_MONSTERS:
      return { ...state, monsters: [] };

    // ========== Monster Reactions ==========
    case A.SET_MONSTER_REACTION: {
      return {
        ...state,
        monsters: state.monsters.map((m, i) =>
          i === action.monsterIdx
            ? { ...m, reaction: action.reaction }
            : m
        )
      };
    }

    case A.APPLY_MONSTER_ABILITY: {
      // Handle ability effects like regeneration
      if (action.effect === 'heal') {
        return {
          ...state,
          monsters: state.monsters.map((m, i) =>
            i === action.monsterIdx
              ? { ...m, hp: Math.min(m.maxHp, m.hp + action.value) }
              : m
          )
        };
      }
      return state;
    }

    // ========== Encounter Tracking ==========
    case A.MINOR:
      return { ...state, minorEnc: state.minorEnc + 1 };

    case A.MAJOR:
      return { ...state, majorFoes: state.majorFoes + 1 };

    case A.BOSS:
      return { ...state, finalBoss: true };

    // ========== Class Abilities ==========
    case A.SET_ABILITY: {
      const newAbilities = { ...state.abilities };
      if (!newAbilities[action.heroIdx]) {
        newAbilities[action.heroIdx] = {};
      }
      newAbilities[action.heroIdx][action.ability] = action.value;
      return { ...state, abilities: newAbilities };
    }

    case A.USE_SPELL: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            spellsUsed: (heroAbilities.spellsUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_HEAL: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            healsUsed: (heroAbilities.healsUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_BLESS: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            blessingsUsed: (heroAbilities.blessingsUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_LUCK: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            luckUsed: (heroAbilities.luckUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_RAGE: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            rageActive: action.active
          }
        }
      };
    }

    case A.SET_ABILITY_STATE: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            [action.key]: action.value
          }
        }
      };
    }

    case A.USE_PANACHE: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            panacheUsed: (heroAbilities.panacheUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_TRICK: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            tricksUsed: (heroAbilities.tricksUsed || 0) + 1
          }
        }
      };
    }

    case A.USE_PRAYER: {
      const heroAbilities = state.abilities[action.heroIdx] || {};
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.heroIdx]: {
            ...heroAbilities,
            prayersUsed: (heroAbilities.prayersUsed || 0) + 1
          }
        }
      };
    }

    default:
      return state;
  }
}
