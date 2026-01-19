import React, { useState } from "react";
import { Skull, Info, MapPin } from "lucide-react";
import { d6 } from "../utils/dice.js";
import { formatRollPrefix } from '../utils/rollLog.js';
import { checkForBoss, isGridNearlyFull, countExploredTiles } from "../data/rooms.js";
import { spawnMajorFoe } from "../utils/gameActions/index.js";

export default function BossMechanics({ state, dispatch }) {
  const [bossCheckResult, setBossCheckResult] = useState(null);

  const isLastTile = isGridNearlyFull(state.grid);
  const exploredTiles = countExploredTiles(state.grid);
  const totalTiles = state.grid.length * state.grid[0].length;
  const percentExplored = ((exploredTiles / totalTiles) * 100).toFixed(1);

  const handleBossCheck = () => {
    const roll = d6();
    const result = checkForBoss(state.majorFoes || 0, roll, { isLastTile });
    setBossCheckResult(result);
  dispatch({ type: "LOG", t: `${formatRollPrefix(roll)} Boss Check: ${result.message}` });

    if (result.isBoss) {
      // Spawn the boss
      spawnMajorFoe(dispatch, state.hcl, true);
      dispatch({ type: "BOSS" });
    } else {
      // Spawn regular major foe
      spawnMajorFoe(dispatch, state.hcl, false);
      dispatch({ type: "MAJOR" });
    }
  };

  return (
    <div className="bg-slate-800 rounded p-3 border border-red-800">
      <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
        <Skull size={16} /> Boss Mechanics
      </div>

      <div className="text-xs text-slate-300 mb-2">
        <div className="flex items-start gap-1">
          <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <span>
            When you encounter a{" "}
            <span className="text-amber-400">Major Foe</span> (2d6=11 on
            contents), roll d6 + major foes faced. On{" "}
            <span className="text-red-400 font-bold">6+</span>, it's the BOSS!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-slate-700 p-2 rounded">
          <div className="text-slate-400">Major Foes Faced:</div>
          <div className="text-amber-400 font-bold text-lg">
            {state.majorFoes || 0}
          </div>
        </div>
        <div className="bg-slate-700 p-2 rounded">
          <div className="text-slate-400">Boss Defeated:</div>
          <div
            className={`font-bold text-lg ${state.finalBoss ? "text-green-400" : "text-red-400"}`}
          >
            {state.finalBoss ? "Yes!" : "No"}
          </div>
        </div>
      </div>

      {/* Grid Fullness Warning */}
      {isLastTile && !state.finalBoss && (
        <div className="mb-3 p-2 rounded bg-red-900/30 border border-red-600">
          <div className="flex items-center gap-1 text-red-400 font-bold text-xs mb-1">
            <MapPin size={12} />
            <span>Grid Nearly Full!</span>
          </div>
          <div className="text-xs text-red-300">
            {exploredTiles} / {totalTiles} tiles explored ({percentExplored}%)
          </div>
          <div className="text-xs text-red-200 mt-1">
            Next Major Foe is <span className="font-bold">AUTOMATICALLY the BOSS!</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBossCheck}
        disabled={state.finalBoss}
        className={`w-full px-3 py-2 rounded text-sm font-bold ${
          state.finalBoss
            ? "bg-slate-600 cursor-not-allowed text-slate-400"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {state.finalBoss
          ? "Boss Already Faced"
          : "Major Foe Encounter (Boss Check)"}
      </button>

      {bossCheckResult && (
        <div
          className={`mt-2 p-2 rounded text-xs ${
            bossCheckResult.isBoss
              ? "bg-red-900/50 border border-red-600"
              : "bg-slate-700"
          }`}
        >
          <div
            className={`font-bold ${bossCheckResult.isBoss ? "text-red-400" : "text-amber-400"}`}
          >
            {bossCheckResult.message}
          </div>
          {bossCheckResult.isBoss && (
            <div className="text-red-300 mt-1">
               BOSS: +1 Life, +1 Attack, 3× Treasure!
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-slate-500 mt-2 border-t border-slate-700 pt-2">
        <div className="font-bold text-slate-400 mb-1">Boss Formula:</div>
        <div>Roll d6 + {state.majorFoes || 0} = needs ≥6 for Boss</div>
        <div className="text-slate-600 mt-1">
          (Currently need to roll {Math.max(1, 6 - (state.majorFoes || 0))}+ on
          d6)
        </div>
      </div>
    </div>
  );
}
