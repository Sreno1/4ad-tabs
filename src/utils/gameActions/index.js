/**
 * Game Actions - Centralized export for all game action modules
 *
 * This module re-exports all game actions from their domain-specific files.
 * Import from this index to get all actions in one place.
 *
 * Usage:
 *   import { spawnMonster, calculateAttack, rollTreasure } from '../utils/gameActions';
 */

// Monster Actions - Spawning, reactions, XP, morale
export {
  spawnMonster,
  spawnMajorFoe,
  rollWanderingMonster,
  rollMonsterReaction,
  awardXP,
  checkLevelUp,
  processMonsterRoundStart,
  checkMinorFoeMorale,
  checkMajorFoeLevelReduction,
  rollSurprise,
} from './monsterActions.js';

// Combat Actions - Attack, defense, saves, fleeing, withdrawal, initiative
export {
  calculateAttack,
  calculateEnhancedAttack,
  calculateMinorFoeKills,
  attackMinorFoe,
  calculateDefense,
  performSaveRoll,
  useBlessingForSave,
  useLuckForSave,
  attemptFlee,
  attemptPartyFlee,
  attemptWithdraw,
  foeStrikeDuringEscape,
  determineInitiative,
  processMinorFoeAttack,
  processMajorFoeAttack,
} from './combatActions.js';

// Dungeon Actions - Doors, traps, rooms, corridors, puzzles, boss room
export {
  rollDoorType,
  attemptOpenDoor,
  rollTrap,
  attemptDetectTrap,
  attemptDisarmTrap,
  triggerTrap,
  rollSpecialRoom,
  interactShrine,
  interactFountain,
  interactStatue,
  interactAltar,
  interactLibrary,
  interactArmory,
  rollPuzzle,
  attemptPuzzle,
  generateCorridor,
  checkBossRoomAccess,
  enterBossRoom,
} from './dungeonActions.js';

// Treasure Actions - Rolling treasure and searching
export {
  rollTreasure,
  performSearch,
  previewTreasureRoll,
} from './treasureActions.js';

// Spell Actions - Spellcasting and spell slot management
export {
  performCastSpell,
  getRemainingSpells,
} from './spellActions.js';

// Ability Actions - Class-specific abilities and special powers
export {
  useClericHeal,
  useClericBless,
  useBarbarianRage,
  useHalflingLuck,
  useAssassinHide,
  setRangerSwornEnemy,
  useSwashbucklerPanache,
  useMonkFlurry,
  useAcrobatTrick,
  usePaladinPrayer,
  useLightGladiatorParry,
  useBulwarkSacrifice,
  toggleDualWield,
} from './abilityActions.js';
