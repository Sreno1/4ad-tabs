import React, { memo, useCallback } from 'react';
import Tooltip from '../Tooltip.jsx';
import { updateMonster } from '../../state/actionCreators.js';
import { attemptPartyFlee, attemptWithdraw } from '../../utils/gameActions/index.js';
import sfx from '../../utils/sfx.js';

const ActiveMonsters = memo(function ActiveMonsters({ activeMonsters, state, dispatch, corridor }) {
  const handleFlee = useCallback(() => {
    const highestLevel = Math.max(...state.monsters.map(m => m.level), 1);
    const result = attemptPartyFlee(dispatch, state.party, state.monsters, highestLevel);
    try {
      const failedCount = result?.failedCount || 0;
      if (failedCount > 0) sfx.play('select3', { volume: 0.8 });
      else sfx.play('jump5', { volume: 0.8 });
    } catch (e) {}
  }, [state.monsters, state.party, dispatch]);

  const handleWithdraw = useCallback(() => {
  const result = attemptWithdraw(dispatch, state.party, state.monsters, state.doors);
  try {
    if (result?.success === false) sfx.play('select3', { volume: 0.8 });
    else sfx.play('jump4', { volume: 0.8 });
  } catch (e) {}
  }, [state.monsters, state.party, state.doors, dispatch]);

  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-bold text-red-400">Active Foes</div>
          <div className="flex items-center gap-2">
          {/* Location tag: shows Corridor or Room and tooltip on hover describing effects */}
          <Tooltip text={corridor ? (
              `Corridor — Melee is limited to the front two party positions (positions 1 and 2).\n\n` +
              `Note: the -1 penalty to two-handed weapons and the no-penalty for light weapons apply ONLY in NARROW corridors. ` +
              `No current tile shapes are marked NARROW; the combat architecture already supports narrow corridors for future tiles.`
          ) : (
            `Room — All party members may attempt melee attacks.`
          )}>
            <div
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${corridor ? 'bg-amber-700 text-black' : 'bg-emerald-700 text-white'}`}
            >
              {corridor ? 'Corridor' : 'Room'}
            </div>
          </Tooltip>
        </div>
        {state.monsters && state.monsters.length > 0 && (
          <div className="flex gap-1">
            <button
              onClick={handleWithdraw}
              className="bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-xs"
              title="Withdraw through a door. Foes strike once (+1 Defense). Monsters remain in tile."
              disabled={!state.doors || state.doors.length === 0}
            >
              Withdraw
            </button>
            <button
              onClick={handleFlee}
              className="bg-yellow-600 hover:bg-yellow-500 px-2 py-0.5 rounded text-xs"
              title="Flee combat. Each hero rolls to escape. Foes strike once if escape fails."
            >
              Flee
            </button>
          </div>
        )}
      </div>
      <div className="space-y-1">
        {activeMonsters.map((monster) => {
          const isMinor = monster.count !== undefined || monster.isMinorFoe;
          const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
          return (
            <div key={monster.id} className="bg-slate-700 rounded p-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isMinor ? (
                    <span className="text-blue-400"></span>
                  ) : (
                    <span className="text-red-400"></span>
                  )}
                  <span className="font-bold text-amber-400">{monster.name}</span>
                </div>
                {isMinor ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch(updateMonster(originalIdx, { count: Math.max(0, (monster.count || 1) - 1) }))}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >-</button>
                    <span className="text-blue-300 font-bold min-w-[3rem] text-center">
                      {monster.count}/{monster.initialCount || monster.count}
                    </span>
                    <button
                      onClick={() => dispatch(updateMonster(originalIdx, { count: (monster.count || 0) + 1 }))}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch(updateMonster(originalIdx, { hp: Math.max(0, monster.hp - 1) }))}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >-</button>
                    <span className="text-red-300 font-bold min-w-[3rem] text-center">
                      ️ {monster.hp}/{monster.maxHp}
                    </span>
                    <button
                      onClick={() => dispatch(updateMonster(originalIdx, { hp: Math.min(monster.maxHp, monster.hp + 1) }))}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                )}
              </div>
              {/* Show reaction if rolled */}
              {monster.reaction && (
                <div className={`mt-1 px-2 py-0.5 rounded text-xs ${
                  monster.reaction.hostile === true ? 'bg-red-900/50 text-red-300' :
                  monster.reaction.hostile === false ? 'bg-green-900/50 text-green-300' :
                  'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {monster.reaction.name}: {monster.reaction.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ActiveMonsters;
