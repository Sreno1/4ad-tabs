/**
 * Main reducer for Four Against Darkness game state
 */
import { initialState, createAdventureState, createCampaignState } from './initialState.js';
import * as A from './actions.js';

/**
 * Calculate HCL from party
 * @param {Array} party - Array of hero objects
 * @returns {number} Highest character level
 */
const calculateHCL = (party) => {
  if (!party || party.length === 0) return 1;
  return Math.max(...party.map(h => h.lvl));
};

/**
 * Main game reducer
 */
export function reducer(state, action) {
  switch (action.type) {
    // ========== Party Management ==========
    case A.ADD_HERO: {
      if (state.party.length >= 4) return state;
      const newParty = [...state.party, action.h];
      return { 
        ...state, 
        party: newParty, 
        hcl: calculateHCL(newParty) 
      };
    }
    
    case A.DEL_HERO: {
      const newParty = state.party.filter((_, i) => i !== action.i);
      // Clean up abilities for removed hero
      const newAbilities = { ...state.abilities };
      delete newAbilities[action.i];
      return { 
        ...state, 
        party: newParty, 
        abilities: newAbilities,
        hcl: calculateHCL(newParty)
      };
    }
    
    case A.UPD_HERO: {
      const newParty = state.party.map((h, i) => 
        i === action.i ? { ...h, ...action.u } : h
      );
      return { 
        ...state, 
        party: newParty,
        hcl: calculateHCL(newParty)
      };
    }
    
    // ========== Resources ==========
    case A.GOLD:
      return { ...state, gold: Math.max(0, state.gold + action.n) };
    
    case A.CLUE:
      return { ...state, clues: Math.max(0, state.clues + action.n) };
    
    // ========== Encounter Tracking ==========
    case A.MINOR:
      return { ...state, minorEnc: state.minorEnc + 1 };
    
    case A.MAJOR:
      return { ...state, majorFoes: state.majorFoes + 1 };
    
    case A.BOSS:
      return { ...state, finalBoss: true };
    
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
    
    case A.DEL_MONSTER:
      return { 
        ...state, 
        monsters: state.monsters.filter((_, i) => i !== action.i) 
      };
    
    case A.CLEAR_MONSTERS:
      return { ...state, monsters: [] };
    
    // ========== Abilities ==========
    case A.SET_ABILITY: {
      const newAbilities = { ...state.abilities };
      if (!newAbilities[action.heroIdx]) {
        newAbilities[action.heroIdx] = {};
      }
      newAbilities[action.heroIdx][action.ability] = action.value;
      return { ...state, abilities: newAbilities };
    }
    
    // ========== Dungeon Grid ==========
    case A.TOGGLE_CELL: {
      const newGrid = state.grid.map((row, y) => 
        row.map((cell, x) => 
          (x === action.x && y === action.y) ? (cell + 1) % 3 : cell
        )
      );
      return { ...state, grid: newGrid };
    }
    
    case A.TOGGLE_DOOR: {
      const exists = state.doors.findIndex(
        d => d.x === action.x && d.y === action.y && d.edge === action.edge
      );
      const newDoors = exists >= 0 
        ? state.doors.filter((_, i) => i !== exists)
        : [...state.doors, { x: action.x, y: action.y, edge: action.edge }];
      return { ...state, doors: newDoors };
    }
    
    case A.CLEAR_GRID:
      return { 
        ...state, 
        grid: Array(28).fill(null).map(() => Array(20).fill(0)), 
        doors: [] 
      };
      // ========== Logging ==========
    case A.LOG:
      return { 
        ...state, 
        log: [action.t, ...state.log].slice(0, 80) 
      };
    
    case A.CLEAR_LOG:
      return { ...state, log: [] };
    
    case A.ARCHIVE_LOG: {
      // Archive current log and clear it (preserves history until campaign reset)
      if (state.log.length === 0) return state;
      
      const archiveEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        adventureName: state.adventure?.adventureName || 'Adventure',
        entries: [...state.log]
      };
      
      return {
        ...state,
        log: [],
        logArchive: [...(state.logArchive || []), archiveEntry]
      };
    }
    
    // ========== Game State ==========
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
      case A.LOAD_STATE:
      return { ...initialState, ...action.state };
    
    // ========== Adventure Management (Phase 5+) ==========
    case A.NEW_ADVENTURE: {
      // Start a new dungeon - archive log, reset dungeon/monsters, keep party/gold/clues
      const archiveEntry = state.log.length > 0 ? {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        adventureName: state.adventure?.adventureName || 'Previous Adventure',
        entries: [...state.log]
      } : null;
      
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
        // Archive old log and start fresh
        log: [`=== Started new dungeon: ${action.name || 'New Dungeon'} ===`],
        logArchive: archiveEntry 
          ? [...(state.logArchive || []), archiveEntry]
          : (state.logArchive || [])
      };
    }
    
    case A.START_ADVENTURE: {
      // Start a new adventure, preserving campaign/party data
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
        log: [`Started new adventure: ${action.name || 'Unnamed Dungeon'}`]
      };
    }
    
    case A.END_ADVENTURE: {
      // End adventure - sync results to campaign if in campaign mode
      const adventureSummary = {
        id: state.adventure?.adventureId || Date.now(),
        name: state.adventure?.adventureName || 'Adventure',
        completedAt: new Date().toISOString(),
        gold: state.gold,
        clues: state.clues,
        minorDefeated: state.minorEnc,
        majorDefeated: state.majorFoes,
        bossDefeated: state.finalBoss,
        survivors: state.party.filter(h => h.hp > 0).length
      };
      
      if (state.mode === 'campaign') {
        return {
          ...state,
          campaign: {
            ...state.campaign,
            adventuresCompleted: state.campaign.adventuresCompleted + 1,
            totalMinorDefeated: state.campaign.totalMinorDefeated + state.minorEnc,
            totalMajorDefeated: state.campaign.totalMajorDefeated + state.majorFoes,
            totalBossesDefeated: state.campaign.totalBossesDefeated + (state.finalBoss ? 1 : 0),
            completedAdventures: [...state.campaign.completedAdventures, adventureSummary],
            // Sync party, gold, clues to campaign
            party: state.party,
            gold: state.gold,
            clues: state.clues,
            hcl: state.hcl
          },
          log: [...state.log, `Adventure completed! ${adventureSummary.survivors} survivors.`]
        };
      }
      
      return {
        ...state,
        log: [...state.log, `Adventure completed! ${adventureSummary.survivors} survivors.`]
      };
    }
    
    // ========== Campaign Management (Phase 6) ==========
    case A.START_CAMPAIGN:
      return {
        ...state,
        mode: 'campaign',
        campaign: {
          ...createCampaignState(),
          campaignName: action.name || 'New Campaign'
        },
        party: [],
        gold: 0,
        clues: 0,
        log: [`Started campaign: ${action.name || 'New Campaign'}`]
      };
    
    case A.END_CAMPAIGN:
      return {
        ...state,
        mode: 'adventure',
        campaign: createCampaignState(),
        log: [...state.log, 'Campaign ended.']
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
    
    // ========== Equipment (Phase 3+) ==========
    case A.EQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          equipment: {
            ...h.equipment,
            [action.slot]: action.item
          }
        };
      });
      return { ...state, party: newParty };
    }
    
    case A.UNEQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          equipment: {
            ...h.equipment,
            [action.slot]: null
          }
        };
      });
      return { ...state, party: newParty };
    }
    
    case A.ADD_TO_INVENTORY: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          inventory: [...(h.inventory || []), action.item]
        };
      });
      return { ...state, party: newParty };
    }
    
    case A.REMOVE_FROM_INVENTORY: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          inventory: (h.inventory || []).filter((_, idx) => idx !== action.itemIdx)
        };
      });
      return { ...state, party: newParty };
    }
    
    default:
      return state;
  }
}

export default reducer;
