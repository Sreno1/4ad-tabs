import React from 'react';
import { X } from 'lucide-react';
import { getEquipment, hasEquipment } from '../data/equipment.js';
import { addToInventory, equipItem, unequipItem } from '../state/actionCreators.js';

export default function LanternModal({ isOpen, onClose, state, dispatch }) {
  if (!isOpen) return null;

  const party = state.party || [];

  const handleAddTorch = (heroIdx) => {
    const hero = party[heroIdx];
    if (!hero) return;
    const currentTorches = (hero.inventory || []).filter(i => i === 'torch').length;
    if (currentTorches >= 12) return; // cap per requirements
    dispatch(addToInventory(heroIdx, 'torch'));
  };

  const handleToggleLantern = (heroIdx) => {
    const hero = party[heroIdx];
    if (!hero) return;
    const currentlyHas = hasEquipment(hero, 'lantern');
    if (currentlyHas) {
      dispatch(unequipItem(heroIdx, 'lantern'));
    } else {
      dispatch(equipItem(heroIdx, 'lantern'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 rounded p-4 w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-amber-400">Lantern & Torches</div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <div className="space-y-2">
          {party.map((h, idx) => (
            <div key={h.id || idx} className="flex items-center justify-between bg-slate-700 p-2 rounded">
              <div>
                <div className="font-bold text-amber-300">{h.name || `Hero ${idx+1}`}</div>
                <div className="text-slate-400 text-xs">Level {h.lvl} • HP {h.hp}/{h.maxHp}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddTorch(idx)}
                  className="bg-amber-600 px-2 py-1 rounded text-sm"
                  aria-label={`Add torch to ${h.name}`}
                >
                  Torch +
                </button>
                <button
                  onClick={() => handleToggleLantern(idx)}
                  className={`px-2 py-1 rounded text-sm ${ hasEquipment(h, 'lantern') ? 'bg-yellow-500 text-black' : 'bg-slate-600' }`}
                  aria-pressed={hasEquipment(h, 'lantern')}
                >
                  Lantern
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="bg-slate-700 px-3 py-1 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
