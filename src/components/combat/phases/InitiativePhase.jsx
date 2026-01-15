import React from 'react';
import { determineInitiative, rollSurprise } from '../../../utils/gameActions.js';

const PHASE_LABELS = {
  'party_ranged': '🏹Party Ranged',
  'party_spells': 'Party Spells',
  'party_melee': 'Party Melee',
  'monster_ranged': '🎯Monster Ranged',
  'monster_melee': 'Monster Melee'
};

export default function InitiativePhase({
  monsters,
  party,
  combatInitiative,
  setCombatInitiative,
  addToCombatLog
}) {
  if (monsters.length === 0) return null;

  const handlePartyAttacks = () => {
    const init = determineInitiative({ partyAttacksFirst: true });
    setCombatInitiative(init);
    addToCombatLog(`${init.reason}`);
  };

  const handleCheckSurprise = () => {
    const surpriseResult = rollSurprise(monsters[0]);
    if (surpriseResult.surprised) {
      addToCombatLog(surpriseResult.message);
      const init = determineInitiative({ isSurprise: true });
      setCombatInitiative(init);
    } else {
      addToCombatLog(surpriseResult.message || 'No surprise - roll reaction for initiative.');
    }
  };

  const handleByReaction = () => {
    const hostileMonster = monsters.find(m => m.reaction?.hostile);
    const init = determineInitiative({
      reaction: hostileMonster?.reaction,
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-cyan-400 font-bold text-sm">Initiative</span>
        {!combatInitiative && (
          <div className="flex gap-1">
            <button
              onClick={handlePartyAttacks}
              className="bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-xs"
            >
              Party Attacks
            </button>
            <button
              onClick={handleCheckSurprise}
              className="bg-yellow-600 hover:bg-yellow-500 px-2 py-0.5 rounded text-xs"
            >
              Check Surprise
            </button>
            <button
              onClick={handleByReaction}
              className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
            >
              By Reaction
            </button>
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
}
