import React from 'react';

export default function ActiveMonsters({ activeMonsters, state, dispatch, corridor }) {
  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="text-sm font-bold text-red-400 mb-2">
  Active Foes {corridor && <span className="text-yellow-400 text-xs ml-1">(Corridor)</span>}
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
                    <span className="text-blue-400">👥</span>
                  ) : (
                    <span className="text-red-400"></span>
                  )}
                  <span className="font-bold text-amber-400">{monster.name}</span>
                  <span className="text-slate-400">L{monster.level}</span>
                </div>
                {isMinor ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: Math.max(0, (monster.count || 1) - 1) } })}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >-</button>
                    <span className="text-blue-300 font-bold min-w-[3rem] text-center">
                      {monster.count}/{monster.initialCount || monster.count}
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: (monster.count || 0) + 1 } })}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: Math.max(0, monster.hp - 1) } })}
                      className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                    >-</button>
                    <span className="text-red-300 font-bold min-w-[3rem] text-center">
                      ❤️ {monster.hp}/{monster.maxHp}
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: Math.min(monster.maxHp, monster.hp + 1) } })}
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
}
