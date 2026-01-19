/**
 * Campaign Reducer - Handles campaign and adventure state management
 */
import * as A from '../actions.js';
import { initialState, createAdventureState, createCampaignState } from '../initialState.js';

/**
 * Campaign reducer - handles all campaign and adventure-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function campaignReducer(state, action) {
  switch (action.type) {
    // ========== Campaign Management ==========
    case A.START_CAMPAIGN:
      return {
        ...state,
        mode: 'campaign',
        campaign: {
          ...createCampaignState(),
          campaignName: action.name || 'New Campaign',
          // Initialize with current party, gold, and clues if any
          party: state.party,
          gold: state.gold,
          clues: state.clues,
          hcl: state.hcl
        },
        log: [...state.log, {
          message: ` Campaign mode enabled!`,
          type: 'system',
          timestamp: new Date().toISOString()
        }]
      };

    case A.END_CAMPAIGN:
      return {
        ...state,
        mode: 'adventure',
        log: [...state.log, {
          message: ' Campaign mode disabled.',
          type: 'system',
          timestamp: new Date().toISOString()
        }]
      };

    case A.SYNC_TO_CAMPAIGN: {
      // Sync current state to campaign (called before entering new dungeon)
      if (state.mode !== 'campaign') return state;

      return {
        ...state,
        campaign: {
          ...state.campaign,
          party: state.party,
          gold: state.gold,
          clues: state.clues,
          hcl: state.hcl
        }
      };
    }

    // ========== Adventure Management ==========
    case A.NEW_ADVENTURE: {
      // Start a new dungeon - archive log, reset dungeon/monsters, keep party/gold/clues
      const archiveEntry = state.log.length > 0 ? {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        adventureName: state.adventure?.adventureName || 'Previous Adventure',
        entries: [...state.log]
      } : null;

      // Reset per-adventure fields on each hero (bandages, carried treasure, clues, abilities)
      const resetParty = (state.party || []).map(h => ({
        ...h,
        clues: 0,
        carriedTreasureWeight: 0,
        // reset per-adventure ability usages
        abilities: {}
      }));

      return {
        ...state,
        adventure: {
          ...createAdventureState(),
          adventureName: action.name || 'New Dungeon'
        },
        grid: Array(28).fill(null).map(() => Array(20).fill(0)),
        doors: [],
        monsters: [],
        minorEnc: 0,
        majorFoes: 0,
        finalBoss: false,
  // Reset per-adventure ability uses
  abilities: {},
  // Reset party per-adventure fields
  party: resetParty,
        // Archive old log and start fresh
        log: [{
          message: `=== Started new dungeon: ${action.name || 'New Dungeon'} ===`,
          type: 'system',
          timestamp: new Date().toISOString()
        }],
        logArchive: archiveEntry
          ? [...(state.logArchive || []), archiveEntry]
          : (state.logArchive || [])
      };
    }

    // ========== Story Beats ==========
    case A.ADD_STORY_BEAT: {
      const beat = {
        id: Date.now(),
        timestamp: action.timestamp || new Date().toISOString(),
        source: action.source || 'player',
        text: action.text
      };

      return {
        ...state,
        storyBeats: [...(state.storyBeats || []), beat]
      };
    }

    case A.DEL_STORY_BEAT: {
      return {
        ...state,
        storyBeats: (state.storyBeats || []).filter(b => b.id !== action.id)
      };
    }

    case A.UPD_STORY_BEAT: {
      return {
        ...state,
        storyBeats: (state.storyBeats || []).map(b => b.id === action.id ? { ...b, text: action.text, timestamp: new Date().toISOString() } : b)
      };
    }

    case A.START_ADVENTURE: {
      // Start a new adventure, preserving campaign/party data
      const resetStartParty = (state.party || []).map(h => ({
        ...h,
        clues: 0,
        carriedTreasureWeight: 0,
        abilities: {}
      }));

      return {
        ...state,
        adventure: createAdventureState(),
        grid: Array(28).fill(null).map(() => Array(20).fill(0)),
        doors: [],
        monsters: [],
        minorEnc: 0,
        majorFoes: 0,
        finalBoss: false,
        // Reset per-adventure ability uses
        abilities: {},
        party: resetStartParty,
        log: [`Started new adventure: ${action.name || 'Unnamed Dungeon'}`]
      };
    }

    case A.END_ADVENTURE: {
      // End adventure - sync results to campaign if in campaign mode
      const { success = true, bossDefeated = false, goldEarned = 0, minorDefeated = 0, majorDefeated = 0 } = action.payload || {};

      const adventureSummary = {
        adventureId: state.adventure?.adventureId || Date.now(),
        name: state.adventure?.adventureName || 'Adventure',
        completedAt: new Date().toISOString(),
        success,
        goldEarned,
        minorDefeated,
        majorDefeated,
        bossDefeated,
        survivors: state.party.filter(h => h.hp > 0).length
      };

      // Update hero stats
      const updatedParty = state.party.map(hero => ({
        ...hero,
        stats: {
          ...hero.stats,
          dungeonsSurvived: (hero.stats?.dungeonsSurvived || 0) + (success ? 1 : 0),
          totalGoldEarned: (hero.stats?.totalGoldEarned || 0) + (goldEarned / state.party.length)
        }
      }));

      if (state.mode === 'campaign') {
        return {
          ...state,
          party: updatedParty,
          campaign: {
            ...state.campaign,
            adventuresCompleted: (state.campaign?.adventuresCompleted || 0) + (success ? 1 : 0),
            totalMinorDefeated: (state.campaign?.totalMinorDefeated || 0) + minorDefeated,
            totalMajorDefeated: (state.campaign?.totalMajorDefeated || 0) + majorDefeated,
            totalBossesDefeated: (state.campaign?.totalBossesDefeated || 0) + (bossDefeated ? 1 : 0),
            completedAdventures: [...(state.campaign?.completedAdventures || []), adventureSummary],
            // Sync party, gold, clues to campaign
            party: updatedParty,
            gold: state.gold,
            clues: state.clues,
            hcl: state.hcl
          },
          log: [...state.log, {
            message: ` Adventure ${success ? 'completed' : 'ended'}! ${adventureSummary.survivors} survivors.`,
            type: 'system',
            timestamp: new Date().toISOString()
          }]
        };
      }

      return {
        ...state,
        party: updatedParty,
        log: [...state.log, {
          message: `Adventure ${success ? 'completed' : 'ended'}! ${adventureSummary.survivors} survivors.`,
          type: 'system',
          timestamp: new Date().toISOString()
        }]
      };
    }

    // ========== Game State Management ==========
    case A.RESET:
      return initialState;

    case A.RESET_CAMPAIGN: {
      // Full reset - clears everything including archive
      return {
        ...initialState,
        // Generate fresh IDs
        campaign: createCampaignState(),
        adventure: createAdventureState()
      };
    }

    case A.LOAD_STATE: {
      // Merge loaded state with initialState to ensure all fields exist
      return {
        ...initialState,
        ...action.state,
        // Ensure nested objects are properly merged
        campaign: { ...initialState.campaign, ...(action.state.campaign || {}) },
        adventure: { ...initialState.adventure, ...(action.state.adventure || {}) }
      };
    }

    default:
      return state;
  }
}
