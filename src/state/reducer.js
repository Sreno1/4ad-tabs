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
      // ========== Abilities ==========
    case A.SET_ABILITY: {
      const newAbilities = { ...state.abilities };
      if (!newAbilities[action.heroIdx]) {
        newAbilities[action.heroIdx] = {};
      }
      newAbilities[action.heroIdx][action.ability] = action.value;
      return { ...state, abilities: newAbilities };
    }
    
    // ========== Marching Order ==========
    case A.SET_MARCHING_ORDER: {
      const newOrder = [...state.marchingOrder];
      // If this hero was already in another position, clear that position
      const existingPos = newOrder.indexOf(action.heroIdx);
      if (existingPos >= 0) {
        newOrder[existingPos] = null;
      }
      // Set the new position
      newOrder[action.position] = action.heroIdx;
      return { ...state, marchingOrder: newOrder };
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
          log: [...state.log, `🏆 Adventure ${success ? 'completed' : 'ended'}! ${adventureSummary.survivors} survivors.`]
        };
      }
      
      return {
        ...state,
        party: updatedParty,
        log: [...state.log, `Adventure ${success ? 'completed' : 'ended'}! ${adventureSummary.survivors} survivors.`]
      };
    }
      // ========== Campaign Management (Phase 6) ==========
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
        log: [...state.log, `📜 Campaign mode enabled!`]
      };
    
    case A.END_CAMPAIGN:
      return {
        ...state,
        mode: 'adventure',
        log: [...state.log, '📜 Campaign mode disabled.']
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
    
    // ========== Equipment (Phase 7b+) ==========
    case A.EQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        // Add item to equipment array if not already there
        const equipment = h.equipment || [];
        if (equipment.includes(action.itemKey)) return h;
        return {
          ...h,
          equipment: [...equipment, action.itemKey]
        };
      });
      return { ...state, party: newParty };
    }

    case A.UNEQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          equipment: (h.equipment || []).filter(key => key !== action.itemKey)
        };
      });
      return { ...state, party: newParty };
    }

    case A.ADD_TO_INVENTORY: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          inventory: [...(h.inventory || []), action.itemKey]
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
    
    // ========== Phase 3: Door Mechanics ==========
    case A.SET_DOOR_TYPE: {
      // Update a door with its type
      const newDoors = state.doors.map((d, i) => 
        i === action.doorIdx ? { ...d, doorType: action.doorType, opened: false } : d
      );
      return { ...state, doors: newDoors };
    }
    
    case A.OPEN_DOOR: {
      const newDoors = state.doors.map((d, i) => 
        i === action.doorIdx ? { ...d, opened: true } : d
      );
      return { ...state, doors: newDoors };
    }
    
    // ========== Phase 3: Trap Mechanics ==========
    case A.ADD_TRAP: {
      const newTraps = [...(state.traps || []), {
        id: Date.now() + Math.random(),
        x: action.x,
        y: action.y,
        type: action.trapType,
        detected: action.detected || false,
        disarmed: false,
        triggered: false
      }];
      return { ...state, traps: newTraps };
    }
    
    case A.TRIGGER_TRAP: {
      const newTraps = (state.traps || []).map((t, i) => 
        i === action.trapIdx ? { ...t, triggered: true } : t
      );
      return { ...state, traps: newTraps };
    }
    
    case A.DISARM_TRAP: {
      const newTraps = (state.traps || []).map((t, i) => 
        i === action.trapIdx ? { ...t, disarmed: true, detected: true } : t
      );
      return { ...state, traps: newTraps };
    }
    
    case A.CLEAR_TRAPS:
      return { ...state, traps: [] };
    
    // ========== Phase 3: Special Rooms ==========
    case A.SET_SPECIAL_ROOM: {
      const newSpecialRooms = [...(state.specialRooms || []), {
        id: Date.now(),
        x: action.x,
        y: action.y,
        type: action.roomType,
        interacted: false,
        result: null
      }];
      return { ...state, specialRooms: newSpecialRooms };
    }
    
    case A.RESOLVE_SPECIAL: {
      const newSpecialRooms = (state.specialRooms || []).map((r, i) => 
        i === action.roomIdx ? { ...r, interacted: true, result: action.result } : r
      );
      return { ...state, specialRooms: newSpecialRooms };
    }
    
    // ========== Phase 3: Boss Room ==========
    case A.SET_BOSS_ROOM:
      return { 
        ...state, 
        bossRoom: { x: action.x, y: action.y, unlocked: false } 
      };
    
    case A.ENTER_BOSS_ROOM:
      return { 
        ...state, 
        bossRoom: { ...state.bossRoom, unlocked: true, entered: true } 
      };
    
    // ========== Phase 4: Save System ==========
    case A.SET_HERO_STATUS: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          status: {
            ...(h.status || {}),
            [action.statusKey]: action.value
          }
        };
      });
      return { ...state, party: newParty };
    }
    
    // ========== Phase 4: Advanced Combat - XP & Leveling ==========
    case A.ADD_XP: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          xp: (h.xp || 0) + action.amount
        };
      });
      return { ...state, party: newParty };
    }
    
    case A.LEVEL_UP: {
      const hero = state.party[action.heroIdx];
      if (!hero || hero.lvl >= 5) return state;
      
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          lvl: h.lvl + 1,
          maxHp: h.maxHp + 1,
          hp: h.hp + 1 // Gain 1 HP on level up
        };
      });
      
      return { 
        ...state, 
        party: newParty,
        hcl: Math.max(...newParty.map(h => h.lvl))
      };
    }
    
    // ========== Phase 4: Class Abilities ==========
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
    
    // ========== Phase 4: Monster Reactions ==========
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
    
    // ========== Phase 5: Load State (for save/load system) ==========
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

export default reducer;
