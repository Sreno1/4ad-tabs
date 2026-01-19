import React, { useState } from 'react';

export default function SpellTargetModal({ spell, caster, party, monsters, onConfirm, onCancel }) {
  const [selectedMonsterIdx, setSelectedMonsterIdx] = useState(null);
  const [selectedHeroIdx, setSelectedHeroIdx] = useState(null);

  if (!spell) return null;

  const isAllyTarget = spell.target === 'single_ally' || spell.type === 'healing';
  const isEnemyTarget = ['single', 'all_enemies', 'enemies', 'vermin'].includes(spell.target) || spell.type === 'attack';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-full max-w-md">
        <h3 className="font-bold mb-2">Select target for {spell.name}</h3>

        {isEnemyTarget && (
          <div className="mb-3">
            <div className="text-sm text-slate-700 mb-2">Monsters:</div>
            <div className="space-y-1 max-h-48 overflow-auto">
              {monsters.map((m, i) => (
                <button key={i} className={`w-full text-left p-2 rounded ${selectedMonsterIdx===i? 'bg-slate-200' : 'hover:bg-slate-100'}`} onClick={() => setSelectedMonsterIdx(i)}>
                  {m.name} {m.count !== undefined ? `(${m.count})` : `HP:${m.hp}/${m.maxHp}`}
                  {m.status && (m.status.asleep ? ' ' : '')}
                </button>
              ))}
            </div>
            {spell.target === 'all_enemies' && (
              <div className="mt-2">
                <button className="px-3 py-1 bg-cyan-600 text-white rounded" onClick={() => { onConfirm({ targets: monsters.map((m,i)=> ({...m, index:i})) }); }}>
                  Target All Enemies
                </button>
              </div>
            )}
          </div>
        )}

        {isAllyTarget && (
          <div className="mb-3">
            <div className="text-sm text-slate-700 mb-2">Allies:</div>
            <div className="space-y-1">
              {party.map((h, idx) => (
                <button key={idx} className={`w-full text-left p-2 rounded ${selectedHeroIdx===idx? 'bg-slate-200' : 'hover:bg-slate-100'}`} onClick={() => setSelectedHeroIdx(idx)}>
                  {h.name} (HP:{h.hp}/{h.maxHp})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => {
            // Build result
            if (isEnemyTarget) {
              if (spell.target === 'all_enemies') {
                onConfirm({ all: true });
                return;
              }
              if (selectedMonsterIdx === null) return;
              onConfirm({ targets: [{ index: selectedMonsterIdx, monster: monsters[selectedMonsterIdx] }] });
            } else if (isAllyTarget) {
              if (selectedHeroIdx === null) return;
              onConfirm({ targetHeroIdx: selectedHeroIdx, hero: party[selectedHeroIdx] });
            } else {
              // fallback: confirm with no targets
              onConfirm({});
            }
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
