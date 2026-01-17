import { useState } from "react";
import { COMBAT_PHASES } from "../constants/gameConstants.js";
import { rollMonsterReaction } from "../data/monsters.js";
import { awardXP, checkLevelUp } from "../utils/gameActions/index.js";
import { logMessage } from "../state/actionCreators.js";

export function useCombatFlow(state, dispatch) {
  const [combatPhase, setCombatPhase] = useState(COMBAT_PHASES.NONE);
  const [monsterReaction, setMonsterReaction] = useState(null);
  const [partyGoesFirst, setPartyGoesFirst] = useState(true);

  // Helper: Get active monsters
  const getActiveMonsters = () => {
    return (
      state.monsters?.filter(
        (m) => m.hp > 0 && (m.count === undefined || m.count > 0),
      ) || []
    );
  };

  // Helper: Check if combat is won
  const isCombatWon = () => {
    return state.monsters?.length > 0 && getActiveMonsters().length === 0;
  };

  // Roll reaction for current monster
  const handleRollReaction = () => {
    if (!state.monsters || state.monsters.length === 0) return null;

    const monster = state.monsters[0];
    const result = rollMonsterReaction(monster);

    // Update monster with reaction
    dispatch({ type: "UPD_MONSTER", i: 0, u: { reaction: result } });
    setMonsterReaction(result);

    // Log the result
    dispatch(logMessage(`🎲 ${monster.name} Reaction (${result.roll}): ${result.name} - ${result.description}`, 'combat'));

    // Determine initiative based on reaction
    if (result.hostile === true) {
      setPartyGoesFirst(false);
      setCombatPhase(COMBAT_PHASES.MONSTER_TURN);
      dispatch(logMessage(`${monster.name} attacks first!`, 'combat'));
    } else if (result.hostile === false) {
      setPartyGoesFirst(true);
      setCombatPhase(COMBAT_PHASES.PARTY_TURN);
      dispatch(logMessage(`Party has initiative!`, 'combat'));
    } else {
      setPartyGoesFirst(true);
      setCombatPhase(COMBAT_PHASES.INITIATIVE);
    }

    return result;
  };

  // Party chooses to attack first
  const handlePartyAttacks = () => {
    setPartyGoesFirst(true);
    setCombatPhase(COMBAT_PHASES.PARTY_TURN);
    dispatch(logMessage(`Party attacks!`, 'combat'));
  };

  // End party turn, monster turn begins
  const handleEndPartyTurn = () => {
    if (getActiveMonsters().length > 0) {
      setCombatPhase(COMBAT_PHASES.MONSTER_TURN);
      dispatch(logMessage(`Monsters' turn to attack!`, 'combat'));
    } else {
      handleCombatVictory();
    }
  };

  // End monster turn, party turn begins
  const handleEndMonsterTurn = () => {
    setCombatPhase(COMBAT_PHASES.PARTY_TURN);
    dispatch(logMessage(`Party's turn!`, 'combat'));
  };

  // Handle combat victory
  const handleCombatVictory = () => {
    setCombatPhase(COMBAT_PHASES.VICTORY);
    dispatch(logMessage(`🎉 Combat Victory!`, 'combat'));
    try {
      dispatch({ type: 'SHOW_MODAL', message: '🎉 Combat Victory! Roll for treasure.', msgType: 'success', autoClose: 3500 });
    } catch (e) {}

    // Award XP for all defeated monsters
    state.monsters?.forEach((monster) => {
      if (monster.hp <= 0 || monster.count === 0) {
        awardXP(dispatch, monster, state.party);
      }
    });

    // Check for level ups
    state.party.forEach((hero, idx) => {
      if (hero.hp > 0) {
        checkLevelUp(dispatch, hero, idx);
      }
    });
  };

  // End combat encounter completely
  const handleEndCombat = () => {
    dispatch({ type: "CLEAR_MONSTERS" });
    setCombatPhase(COMBAT_PHASES.NONE);
    setMonsterReaction(null);
    // Clear protected status
    state.party.forEach((hero, idx) => {
      if (hero.status?.protected) {
        dispatch({
          type: "SET_HERO_STATUS",
          heroIdx: idx,
          statusKey: "protected",
          value: false,
        });
      }
    });
  };

  // Reset combat state
  const resetCombat = () => {
    setCombatPhase(COMBAT_PHASES.NONE);
    setMonsterReaction(null);
    setPartyGoesFirst(true);
  };

  return {
    combatPhase,
    setCombatPhase,
    monsterReaction,
    setMonsterReaction,
    partyGoesFirst,
    setPartyGoesFirst,
    getActiveMonsters,
    isCombatWon,
    handleRollReaction,
    handlePartyAttacks,
    handleEndPartyTurn,
    handleEndMonsterTurn,
    handleCombatVictory,
    handleEndCombat,
    resetCombat,
  };
}
