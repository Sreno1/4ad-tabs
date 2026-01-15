/**
 * Initial state schema for Four Against Darkness
 * Designed to support Phases 1-6 including Campaign Mode
 */

// Default state for a new adventure
export const createAdventureState = () => ({
  // Adventure metadata
  adventureId: Date.now(),
  adventureName: 'New Adventure',
  startedAt: new Date().toISOString(),
  completedAt: null,
  
  // Dungeon grid state (20x28)
  grid: Array(28).fill(null).map(() => Array(20).fill(0)), // 0=empty, 1=room, 2=corridor
  doors: [], // {x, y, edge: 'N'|'S'|'E'|'W', type: 'normal'|'stuck'|'locked'|'trapped'}
  
  // Room tracking
  roomsExplored: 0,
  currentRoom: null, // {x, y, type, contents}
  
  // Active monsters in current encounter
  monsters: [], // {id, name, level, hp, maxHp, type, special}
  
  // Adventure progress flags
  bossDefeated: false,
  finalBossRoom: null, // {x, y} location
  
  // Adventure-specific counters (reset each adventure)
  minorEncounters: 0,
  majorFoesDefeated: 0,
  
  // Treasure found this adventure
  adventureGold: 0,
  adventureTreasures: [],
  
  // Adventure log
  log: []
});

// Default hero template
export const createHero = (classKey, classData, name = null) => ({
  id: Date.now() + Math.random(),
  name: name || classData.name,
  key: classKey,
  lvl: 1,
  xp: 0, // Experience points
  hp: classData.life + 1,
  maxHp: classData.life + 1,
  
  // Equipment (Phase 3+)
  equipment: {
    weapon: null,
    offhand: null,
    armor: null,
    ring: null,
    amulet: null
  },
  inventory: [], // Consumables, treasures
  
  // Class-specific ability uses (reset per adventure)
  abilities: {
    healsUsed: 0,     // Cleric: 3 max
    blessingsUsed: 0, // Cleric: 3 max
    spellsUsed: 0,    // Wizard: L+2 max, Elf: L max
    luckUsed: 0,      // Halfling: L+1 max
    rageActive: false // Barbarian
  },
  
  // Status effects
  status: {
    poisoned: false,
    blessed: false,
    cursed: false
  },
  
  // Campaign stats (persist between adventures)
  stats: {
    monstersKilled: 0,
    dungeonsSurvived: 0,
    totalGoldEarned: 0
  }
});

// Campaign state (persists across adventures)
export const createCampaignState = () => ({
  campaignId: Date.now(),
  campaignName: 'New Campaign',
  createdAt: new Date().toISOString(),
  
  // Party persists across adventures
  party: [],
  
  // Campaign-wide resources (carry over between dungeons)
  gold: 0,
  clues: 0, // Accumulated clues
  
  // Shared inventory (magic items, special treasures)
  sharedInventory: [],
  
  // Campaign progress
  adventuresCompleted: 0,
  totalMinorDefeated: 0,
  totalMajorDefeated: 0,
  totalBossesDefeated: 0,
  
  // Adventure history
  completedAdventures: [], // Array of completed adventure summaries
  
  // HCL tracking
  hcl: 1
});

// Full initial state
export const initialState = {
  // Always in campaign mode (simplified)
  mode: 'campaign',
  
  // Campaign data (always active)
  campaign: createCampaignState(),
  
  // Current adventure data
  adventure: createAdventureState(),
  
  // Party (in adventure mode, used directly; in campaign mode, synced from campaign)
  party: [],
  
  // Global resources
  gold: 0,
  clues: 0,
  
  // HCL calculation
  hcl: 1,
  
  // Legacy counters (for backward compatibility)
  minorEnc: 0,
  majorFoes: 0,
  finalBoss: false,
  
  // Global log (current adventure)
  log: [],
  
  // Archived logs (persist until campaign reset)
  logArchive: [],
    // Monsters (current encounter)
  monsters: [],
    // Hero abilities tracking (keyed by hero index for backward compat)
  abilities: {},
  
  // Marching order: array of hero indices [position1, position2, position3, position4]
  // Positions: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left (clockwise)
  marchingOrder: [null, null, null, null],
  
  // Grid state (keeping at top level for backward compat)
  grid: Array(28).fill(null).map(() => Array(20).fill(0)),
  doors: [], // {x, y, edge, doorType, opened}
  
  // Phase 3: Traps
  traps: [], // {id, x, y, type, detected, disarmed, triggered}
  
  // Phase 3: Special rooms
  specialRooms: [], // {id, x, y, type, interacted, result}
  
  // Phase 3: Boss room location
  bossRoom: null, // {x, y, unlocked, entered}
  
  // Phase 3: Current exploration state
  currentRoom: null, // {type, subtype, resolved}
  currentTrap: null, // {type, detected}
  currentDoor: null, // {type, opened}
  
  // UI state
  activeTab: 'party'
};

export default initialState;
