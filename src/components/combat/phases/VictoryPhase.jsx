import React, { memo } from 'react';
import {
  rollTreasure,
  awardXP,
  checkLevelUp
} from "../../../utils/gameActions/index.js";

const VictoryPhase = memo(function VictoryPhase({
  monsters,
  party,
  dispatch,
  clearCombatLog,
  setCombatInitiative,
  setTargetMonsterIdx
}) {
  const handleTreasure = () => {
    rollTreasure(dispatch);
  };

  const handleEndCombat = () => {
    // Award XP for all defeated monsters before clearing
    monsters.forEach(monster => {
      if (monster.hp <= 0 || monster.count === 0) {
        awardXP(dispatch, monster, party);
      }
    });

    // Check for level ups
    party.forEach((hero, idx) => {
      if (hero.hp > 0) {
        checkLevelUp(dispatch, hero, idx);
      }
    });

    dispatch({ type: 'CLEAR_MONSTERS' });
    clearCombatLog();
    setCombatInitiative(null);
    setTargetMonsterIdx(null);
    dispatch({ type: 'LOG', t: '--- Encounter ended ---' });
  };

  const hasDefeatedMonsters = monsters.some(m => m.hp <= 0 || m.count === 0);
  const allMonstersDefeated = monsters.length > 0 &&
    monsters.every(m => m.hp <= 0 || (m.count !== undefined && m.count === 0));

  return (
    <div className="space-y-2">
      {/* Treasure */}
      <div className="bg-slate-800 rounded p-2">
        <div className="text-amber-400 font-bold text-sm mb-2">Treasure</div>
        <button
          onClick={handleTreasure}
          className="w-full bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
        >
          Roll Treasure (d6)
        </button>
      </div>

      {/* Victory Summary (shown when monsters defeated) */}
      {hasDefeatedMonsters && (
        <div className="bg-slate-800 rounded p-2">
          <div className="text-green-400 font-bold text-sm mb-2">Victory!</div>
          <div className="text-xs text-slate-300 mb-2">
            {monsters.filter(m => m.hp <= 0 || m.count === 0).map(m => (
              <div key={m.id}>
                {m.name} defeated ({m.xp || 0} XP)
              </div>
            ))}
          </div>
          {allMonstersDefeated && (
            <button
              onClick={handleEndCombat}
              className="w-full bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
            >
              End Combat & Award XP
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default VictoryPhase;
