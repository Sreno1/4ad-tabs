import React from 'react';
import { COMBAT_PHASES } from '../../constants/gameConstants.js';

export default function CombatInitiative({
  combatPhase,
  monsterReaction,
  handleRollReaction,
  handlePartyAttacks,
  setShowDungeonFeatures,
  dispatch
}) {
  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="text-sm font-bold text-cyan-400 mb-2">⚡ Initiative</div>

      {/* Phase: Need to roll reaction */}
      {combatPhase === COMBAT_PHASES.NONE && !monsterReaction && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Roll reaction to determine monster behavior:</div>
          <div className="flex gap-2">
            <button
              onClick={handleRollReaction}
              className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm font-bold"
            >
              🎲 Roll Reaction
            </button>
            <button
              onClick={handlePartyAttacks}
              className="flex-1 bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded text-sm font-bold"
            >
              ⚔️ Attack First!
            </button>
          </div>
        </div>
      )}

      {/* Phase: Choose initiative (conditional reaction) */}
      {combatPhase === COMBAT_PHASES.INITIATIVE && (
        <div className="space-y-2">
          <div className="text-xs text-yellow-400">
            Foe reaction is conditional. Choose your approach:
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePartyAttacks}
              className="flex-1 bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded text-sm"
            >
              ⚔️ Attack
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'LOG', t: `Party chooses to negotiate...` });
                setShowDungeonFeatures(true);
              }}
              className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
            >
              🤝 Negotiate
            </button>
          </div>
        </div>
      )}

      {/* Phase: Party's turn */}
      {combatPhase === COMBAT_PHASES.PARTY_TURN && (
        <div className="bg-green-900/30 rounded p-2">
          <div className="text-green-400 font-bold text-sm mb-2">⚔️ Party's Turn - ATTACK!</div>
        </div>
      )}

      {/* Phase: Monster's turn */}
      {combatPhase === COMBAT_PHASES.MONSTER_TURN && (
        <div className="bg-red-900/30 rounded p-2">
          <div className="text-red-400 font-bold text-sm mb-2">👹 Monster's Turn - DEFEND!</div>
          <div className="text-xs text-slate-300">
            Roll defense for each hero being attacked.
          </div>
        </div>
      )}
    </div>
  );
}
