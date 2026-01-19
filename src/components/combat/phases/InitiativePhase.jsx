import React, { memo } from 'react';
import { determineInitiative, rollMonsterReaction } from "../../../utils/gameActions/index.js";
import Tooltip from '../../Tooltip.jsx';
import { DEFAULT_REACTION_TABLE, REACTION_TYPES } from '../../../data/monsters.js';

const PHASE_LABELS = {
  'party_ranged': 'Party Ranged',
  'party_spells': 'Party Spells',
  'party_melee': 'Party Melee',
  'monster_ranged': 'Monster Ranged',
  'monster_melee': 'Monster Melee'
};

const InitiativePhase = memo(function InitiativePhase({
  monsters,
  party,
  combatInitiative,
  setCombatInitiative,
  addToCombatLog,
  dispatch
}) {
  if (monsters.length === 0) return null;

  const handlePartyAttacks = () => {
    const init = determineInitiative({ partyAttacksFirst: true });
    setCombatInitiative(init);
    addToCombatLog(`${init.reason}`);
  };

  const handleByReaction = () => {
    // Prefer a monster that already has a reaction rolled and is hostile.
    let monsterIdx = monsters.findIndex(m => m.reaction && m.reaction.hostile);
    // Otherwise pick the first monster that doesn't have a reaction and roll for it.
    if (monsterIdx === -1) {
      monsterIdx = monsters.findIndex(m => !m.reaction);
    }

    if (monsterIdx === -1) {
      // No monsters or all have non-hostile reactions; just determine initiative normally
      const init = determineInitiative({ hasRanged: party.some(h => h.equipment?.ranged) });
      setCombatInitiative(init);
      addToCombatLog(`${init.reason}`);
      return;
    }

    // Roll reaction for the selected monster via the game action, which dispatches and logs
    const reaction = rollMonsterReaction(dispatch, monsterIdx);

    // Use the reaction details to determine initiative
    const hostileMonster = { reaction };
    const init = determineInitiative({
      reaction: reaction,
      hasRanged: party.some(h => h.equipment?.ranged)
    });
    setCombatInitiative(init);
    addToCombatLog(`${init.reason}`);
  };

  const handleResetInitiative = () => {
    setCombatInitiative(null);
  };

  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="mb-2">
        <div className="text-cyan-400 font-bold text-sm mb-1">Initiative</div>
        {!combatInitiative && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={handlePartyAttacks}
              className="bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-xs"
            >
              Attack
            </button>
            <Tooltip text={(() => {
              // Prefer a focused monster: hostile first, else first monster
              let m = monsters.find(m => m.reaction && m.reaction.hostile) || monsters[0];
              const reactionTable = m?.reactionTable || DEFAULT_REACTION_TABLE;
              const lines = [];
              for (let i = 1; i <= 6; i++) {
                const key = reactionTable[i] || DEFAULT_REACTION_TABLE[i];
                const t = REACTION_TYPES[key];
                lines.push(`${i}: ${t ? t.name : key}`);
              }
              return lines.join('\n');
            })()}>
              <button
                onClick={handleByReaction}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
              >
                Reaction
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {combatInitiative && (
        <div className={`p-2 rounded text-xs ${
          combatInitiative.monsterFirst ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
        }`}>
          <div className="font-bold mb-1">{combatInitiative.reason}</div>
          <div className="text-slate-300">
            Order: {combatInitiative.order.map(phase => PHASE_LABELS[phase] || phase).join(' → ')}
          </div>
          <button
            onClick={handleResetInitiative}
            className="mt-1 bg-slate-600 hover:bg-slate-500 px-2 py-0.5 rounded"
          >
            Reset Initiative
          </button>
        </div>
      )}
    </div>
  );
});

export default InitiativePhase;
