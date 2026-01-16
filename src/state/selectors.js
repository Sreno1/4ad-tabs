/**
 * State Selectors - Centralized state access functions
 *
 * Selectors provide a consistent API for accessing state and derived values.
 * Benefits:
 * - Decouple components from state shape
 * - Centralize common computations
 * - Enable future memoization with reselect if needed
 * - Easier to test and refactor
 */

// ========== Party Selectors ==========

/**
 * Get the full party array
 */
export const selectParty = (state) => state.party || [];

/**
 * Get only heroes with HP > 0
 */
export const selectActiveHeroes = (state) =>
  selectParty(state).filter(h => h.hp > 0);

/**
 * Get only dead heroes (HP <= 0)
 */
export const selectDeadHeroes = (state) =>
  selectParty(state).filter(h => h.hp <= 0);

/**
 * Calculate Highest Character Level (HCL)
 */
export const selectHCL = (state) => {
  const party = selectParty(state);
  return party.length > 0 ? Math.max(...party.map(h => h.lvl)) : 1;
};

/**
 * Get party size
 */
export const selectPartySize = (state) => selectParty(state).length;

/**
 * Check if party is full (4 heroes)
 */
export const selectIsPartyFull = (state) => selectPartySize(state) >= 4;

/**
 * Check if entire party is dead
 */
export const selectIsPartyWiped = (state) =>
  selectParty(state).length > 0 && selectActiveHeroes(state).length === 0;

/**
 * Get a specific hero by index
 */
export const selectHero = (state, index) => selectParty(state)[index];

/**
 * Get hero abilities for a specific hero
 */
export const selectHeroAbilities = (state, heroIdx) =>
  state.abilities?.[heroIdx] || {};

/**
 * Get marching order array
 */
export const selectMarchingOrder = (state) => state.marchingOrder || [null, null, null, null];

// ========== Combat Selectors ==========

/**
 * Get all monsters
 */
export const selectMonsters = (state) => state.monsters || [];

/**
 * Get only active monsters (hp > 0 and count > 0 for swarms)
 */
export const selectActiveMonsters = (state) =>
  selectMonsters(state).filter(m =>
    m.hp > 0 && (m.count === undefined || m.count > 0)
  );

/**
 * Get only dead monsters
 */
export const selectDeadMonsters = (state) =>
  selectMonsters(state).filter(m =>
    m.hp <= 0 || (m.count !== undefined && m.count <= 0)
  );

/**
 * Check if combat is won (monsters exist but none are active)
 */
export const selectIsCombatWon = (state) =>
  selectMonsters(state).length > 0 && selectActiveMonsters(state).length === 0;

/**
 * Check if combat is active (has active monsters)
 */
export const selectIsCombatActive = (state) =>
  selectActiveMonsters(state).length > 0;

/**
 * Get a specific monster by index
 */
export const selectMonster = (state, index) => selectMonsters(state)[index];

/**
 * Get encounter tracking counters
 */
export const selectMinorEncounters = (state) => state.minorEnc || 0;
export const selectMajorFoes = (state) => state.majorFoes || 0;
export const selectFinalBoss = (state) => state.finalBoss || false;

// ========== Dungeon Selectors ==========

/**
 * Get the dungeon grid
 */
export const selectGrid = (state) => state.grid || [];

/**
 * Get all doors
 */
export const selectDoors = (state) => state.doors || [];

/**
 * Get unopened doors
 */
export const selectUnopenedDoors = (state) =>
  selectDoors(state).filter(d => !d.opened);

/**
 * Get opened doors
 */
export const selectOpenedDoors = (state) =>
  selectDoors(state).filter(d => d.opened);

/**
 * Get all traps
 */
export const selectTraps = (state) => state.traps || [];

/**
 * Get undetected traps
 */
export const selectUndetectedTraps = (state) =>
  selectTraps(state).filter(t => !t.detected && !t.triggered);

/**
 * Get special rooms
 */
export const selectSpecialRooms = (state) => state.specialRooms || [];

/**
 * Get boss room info
 */
export const selectBossRoom = (state) => state.bossRoom || null;

/**
 * Check if boss room is unlocked
 */
export const selectIsBossRoomUnlocked = (state) =>
  state.bossRoom?.unlocked || false;

// ========== Inventory Selectors ==========

/**
 * Get current gold
 */
export const selectGold = (state) => state.gold || 0;

/**
 * Get current clues
 */
export const selectClues = (state) => state.clues || 0;

/**
 * Check if party can afford a cost
 */
export const selectCanAfford = (state, cost) => selectGold(state) >= cost;

// ========== Log Selectors ==========

/**
 * Get the game log
 */
export const selectLog = (state) => state.log || [];

/**
 * Get the most recent log entry
 */
export const selectLatestLogEntry = (state) => {
  const log = selectLog(state);
  return log.length > 0 ? log[0] : null;
};

/**
 * Get log archive
 */
export const selectLogArchive = (state) => state.logArchive || [];

// ========== Campaign & Adventure Selectors ==========

/**
 * Get game mode (campaign or adventure)
 */
export const selectMode = (state) => state.mode || 'adventure';

/**
 * Check if in campaign mode
 */
export const selectIsCampaignMode = (state) => selectMode(state) === 'campaign';

/**
 * Get campaign data
 */
export const selectCampaign = (state) => state.campaign || null;

/**
 * Get campaign name
 */
export const selectCampaignName = (state) =>
  state.campaign?.campaignName || 'Adventure';

/**
 * Get adventure data
 */
export const selectAdventure = (state) => state.adventure || null;

/**
 * Get adventure name
 */
export const selectAdventureName = (state) =>
  state.adventure?.adventureName || 'Unnamed Dungeon';

/**
 * Get completed adventures count
 */
export const selectCompletedAdventuresCount = (state) =>
  state.campaign?.adventuresCompleted || 0;

/**
 * Get total monsters killed across campaign
 */
export const selectTotalMonstersKilled = (state) => {
  const party = selectParty(state);
  return party.reduce((total, hero) =>
    total + (hero.stats?.monstersKilled || 0), 0
  );
};

/**
 * Get campaign statistics
 */
export const selectCampaignStats = (state) => ({
  adventuresCompleted: state.campaign?.adventuresCompleted || 0,
  totalMinorDefeated: state.campaign?.totalMinorDefeated || 0,
  totalMajorDefeated: state.campaign?.totalMajorDefeated || 0,
  totalBossesDefeated: state.campaign?.totalBossesDefeated || 0,
  totalGold: selectGold(state),
  totalClues: selectClues(state)
});

// ========== Derived/Computed Selectors ==========

/**
 * Get party summary for display
 */
export const selectPartySummary = (state) => {
  const party = selectParty(state);
  const activeHeroes = selectActiveHeroes(state);

  return {
    total: party.length,
    alive: activeHeroes.length,
    dead: party.length - activeHeroes.length,
    hcl: selectHCL(state)
  };
};

/**
 * Get combat summary for display
 */
export const selectCombatSummary = (state) => {
  const monsters = selectMonsters(state);
  const activeMonsters = selectActiveMonsters(state);

  return {
    total: monsters.length,
    alive: activeMonsters.length,
    dead: monsters.length - activeMonsters.length,
    isWon: selectIsCombatWon(state),
    isActive: selectIsCombatActive(state)
  };
};

/**
 * Get dungeon progress summary
 */
export const selectDungeonProgress = (state) => ({
  minorEncounters: selectMinorEncounters(state),
  majorFoes: selectMajorFoes(state),
  bossDefeated: selectFinalBoss(state),
  doorsOpened: selectOpenedDoors(state).length,
  totalDoors: selectDoors(state).length
});

/**
 * Check if game is in a "game over" state
 */
export const selectIsGameOver = (state) =>
  selectIsPartyWiped(state) || selectFinalBoss(state);
