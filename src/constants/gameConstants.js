// Combat flow phases
export const COMBAT_PHASES = {
  NONE: 'none',
  REACTION: 'reaction',       // Roll reaction for monsters
  INITIATIVE: 'initiative',   // Determine who goes first
  PARTY_TURN: 'party_turn',   // Party attacks
  MONSTER_TURN: 'monster_turn', // Monsters attack (defend)
  VICTORY: 'victory',         // Combat won - treasure/XP
  FLED: 'fled'                // Party fled
};

// Action pane modes based on tile contents
export const ACTION_MODES = {
  IDLE: 'idle',
  COMBAT: 'combat',
  SPECIAL: 'special',
  TREASURE: 'treasure',
  QUEST: 'quest',
  WEIRD: 'weird',
  EMPTY: 'empty',
  TRAP: 'trap'
};

// Room event types for the progressive action pane
export const EVENT_TYPES = {
  TILE_GENERATED: 'tile_generated',
  TREASURE: 'treasure',
  TRAP: 'trap',
  SPECIAL: 'special',
  SPECIAL_EVENT: 'special_event',
  MONSTER: 'monster',
  BOSS_CHECK: 'boss_check',
  WEIRD: 'weird',
  QUEST: 'quest',
  EMPTY: 'empty',
  SEARCH: 'search',
  REACTION: 'REACTION',
  VICTORY: 'VICTORY'
};

// Tab definitions for mobile navigation
export const MOBILE_TABS = [
  { id: 'party', label: 'Party' },
  { id: 'dungeon', label: 'Dungeon' },
  { id: 'combat', label: 'Combat' },
  { id: 'analytics', label: 'Stats' },
  { id: 'story', label: 'Story' }
];
