import React, { memo, useState } from 'react';
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
  setTargetMonsterIdx,
  environment = 'dungeon'
}) {
  const [xpResults, setXpResults] = useState([]);
  const [xpAwarded, setXpAwarded] = useState(false);

  const handleTreasure = () => {
    // Check if any defeated monsters have treasure multipliers (Boss, secret doors, etc.)
    const defeatedMonsters = monsters.filter(m => m.hp <= 0 || m.count === 0);
    const maxMultiplier = Math.max(
      1,
      ...defeatedMonsters.map(m => m.treasureMultiplier || 1)
    );

    // Per 4AD rules: Boss treasure is tripled or 100gp minimum
    const isBoss = defeatedMonsters.some(m => m.isBoss);
    const minGold = isBoss ? 100 : 0;

    rollTreasure(dispatch, {
      multiplier: maxMultiplier,
      minGold,
      environment
    });
  };

  const handleAwardXP = () => {
    const results = [];

    // Award XP for all defeated monsters
    monsters.forEach(monster => {
      if (monster.hp <= 0 || monster.count === 0) {
        const result = awardXP(dispatch, monster, party);
        if (result.rolls && result.rolls.length > 0) {
          results.push({
            monsterName: monster.name,
            baseXP: result.baseXP,
            rolls: result.rolls
          });
        }
      }
    });

    setXpResults(results);
    setXpAwarded(true);
  };

  const handleEndCombat = () => {
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
    setXpResults([]);
    setXpAwarded(false);
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
                {m.name} defeated (Base XP: {m.xp || 0})
              </div>
            ))}
          </div>

          {/* XP Roll Button */}
          {allMonstersDefeated && !xpAwarded && (
            <button
              onClick={handleAwardXP}
              className="w-full bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm mb-2"
            >
              Roll for XP (d6)
            </button>
          )}

          {/* XP Roll Results */}
          {xpAwarded && xpResults.length > 0 && (
            <div className="mb-2 space-y-2">
              {xpResults.map((result, idx) => (
                <div key={idx} className="border border-purple-600 rounded p-2">
                  <div className="text-purple-400 font-bold text-xs mb-1">
                    {result.monsterName} (Base XP: {result.baseXP})
                  </div>
                  {result.rolls.map((roll, rollIdx) => (
                    <div key={rollIdx} className="text-xs text-slate-300 flex justify-between">
                      <span>{roll.heroName}</span>
                      <span>
                        🎲 {roll.roll} → <span className="text-green-400 font-bold">{roll.earnedXP} XP</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* End Combat Button */}
          {allMonstersDefeated && xpAwarded && (
            <button
              onClick={handleEndCombat}
              className="w-full bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
            >
              End Combat
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default VictoryPhase;
