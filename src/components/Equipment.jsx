import React, { useState } from 'react';
import {
  ALL_EQUIPMENT,
  getEquipment,
  getEquipmentByCategory,
  calculateEquipmentBonuses,
  canEquipItem,
  hasEquipment,
  useConsumable,
  getStartingEquipment
} from '../data/equipment.js';

export default function Equipment({ isOpen, state, dispatch, onClose }) {
  const [selectedHero, setSelectedHero] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('weapon');
  const [showShop, setShowShop] = useState(false);

  if (!isOpen) return null;

  // Early return for empty party - show modal with message
  if (!state.party || state.party.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border-2 border-amber-500">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-t-lg -m-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Equipment</h2>
              <button onClick={onClose} className="text-white hover:text-red-300 text-2xl font-bold">✕</button>
            </div>
          </div>
          <div className="text-center text-slate-400 py-8">
            <p>No heroes in party!</p>
            <p className="text-sm mt-2">Add heroes to your party first.</p>
          </div>
        </div>
      </div>
    );
  }

  const hero = state.party[selectedHero];
  if (!hero) return null;

  // Handle old equipment format (migration support)
  const equipped = Array.isArray(hero.equipment) ? hero.equipment : [];
  const inventory = Array.isArray(hero.inventory) ? hero.inventory : [];
  const bonuses = calculateEquipmentBonuses(hero);

  // Check if using old format
  const isOldFormat = hero.equipment && !Array.isArray(hero.equipment);

  // Handle equipping an item
  const handleEquip = (itemKey) => {
    const checkResult = canEquipItem(hero, itemKey);
    if (!checkResult.canEquip) {
      alert(checkResult.reason);
      return;
    }

    // Remove from inventory if it's there
    const invIdx = inventory.indexOf(itemKey);
    if (invIdx >= 0) {
      dispatch({ type: 'REMOVE_FROM_INVENTORY', heroIdx: selectedHero, itemIdx: invIdx });
    }

    dispatch({ type: 'EQUIP_ITEM', heroIdx: selectedHero, itemKey });
    dispatch({ type: 'LOG', t: `${hero.name} equipped ${getEquipment(itemKey).name}` });
  };

  // Handle unequipping an item
  const handleUnequip = (itemKey) => {
    dispatch({ type: 'UNEQUIP_ITEM', heroIdx: selectedHero, itemKey });
    dispatch({ type: 'ADD_TO_INVENTORY', heroIdx: selectedHero, itemKey });
    dispatch({ type: 'LOG', t: `${hero.name} unequipped ${getEquipment(itemKey).name}` });
  };

  // Handle using a consumable
  const handleUseConsumable = (itemKey, itemIdx) => {
    const item = getEquipment(itemKey);
    if (!item || item.category !== 'consumable') return;

    const result = useConsumable(itemKey, hero);

    if (result.success) {
      // Apply effect
      if (result.effect === 'heal') {
        const newHP = Math.min(hero.maxHp, hero.hp + result.amount);
        dispatch({ type: 'UPD_HERO', i: selectedHero, u: { hp: newHP } });
      }

      // Remove from inventory
      dispatch({ type: 'REMOVE_FROM_INVENTORY', heroIdx: selectedHero, itemIdx });
      dispatch({ type: 'LOG', t: result.message });
    }
  };

  // Handle buying from shop
  const handleBuy = (itemKey) => {
    const item = getEquipment(itemKey);
    if (!item) return;

    if (state.gold < item.cost) {
      alert(`Not enough gold! Need ${item.cost}, have ${state.gold}`);
      return;
    }

    dispatch({ type: 'GOLD', n: -item.cost });
    dispatch({ type: 'ADD_TO_INVENTORY', heroIdx: selectedHero, itemKey });
    dispatch({ type: 'LOG', t: `${hero.name} bought ${item.name} for ${item.cost}gp` });
  };

  // Give starting equipment
  const handleStartingEquipment = () => {
    const startingGear = getStartingEquipment(hero.key);
    startingGear.forEach(itemKey => {
      dispatch({ type: 'EQUIP_ITEM', heroIdx: selectedHero, itemKey });
    });
    dispatch({ type: 'LOG', t: `${hero.name} received starting equipment` });
  };

  // Migrate from old equipment format to new array format
  const handleMigrateEquipment = () => {
    // Convert old object format to new array format
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { equipment: [], inventory: [] } });
    dispatch({ type: 'LOG', t: `${hero.name} equipment migrated to new format` });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-500" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Equipment</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Migration Warning */}
          {isOldFormat && (
            <div className="bg-yellow-900 border-2 border-yellow-500 rounded p-3">
              <div className="text-yellow-300 font-bold text-sm mb-2">⚠️ Old Save Format Detected</div>
              <div className="text-yellow-200 text-xs mb-2">
                This character uses the old equipment system. Click below to migrate to the new format.
              </div>
              <button
                onClick={handleMigrateEquipment}
                className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm text-white font-bold"
              >
                Migrate Equipment
              </button>
            </div>
          )}

          {/* Hero Selector */}
          <div className="bg-slate-800 rounded p-3">
            <div className="text-amber-400 font-bold text-sm mb-2">Select Hero</div>
            <div className="grid grid-cols-4 gap-2">
              {state.party.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHero(idx)}
                  className={`p-2 rounded text-sm ${
                    selectedHero === idx
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Bonuses Summary */}
          <div className="bg-slate-800 rounded p-3">
            <div className="text-green-400 font-bold text-sm mb-2">📊 Equipment Bonuses</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Attack</div>
                <div className="text-orange-400 font-bold">{bonuses.attackMod >= 0 ? '+' : ''}{bonuses.attackMod}</div>
              </div>
              <div className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Defense</div>
                <div className="text-blue-400 font-bold">{bonuses.defenseMod >= 0 ? '+' : ''}{bonuses.defenseMod}</div>
              </div>
              <div className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Save</div>
                <div className="text-green-400 font-bold">{bonuses.saveMod >= 0 ? '+' : ''}{bonuses.saveMod}</div>
              </div>
              <div className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Stealth</div>
                <div className="text-purple-400 font-bold">{bonuses.stealthMod >= 0 ? '+' : ''}{bonuses.stealthMod}</div>
              </div>
            </div>
          </div>

          {/* Equipped Items */}
          <div className="bg-slate-800 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-amber-400 font-bold text-sm">🎒 Equipped ({equipped.length})</div>
              {equipped.length === 0 && (
                <button
                  onClick={handleStartingEquipment}
                  className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs"
                >
                  Get Starting Gear
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {equipped.length === 0 && (
                <div className="text-slate-500 text-xs text-center py-2">No equipment</div>
              )}
              {equipped.map((itemKey, idx) => {
                const item = getEquipment(itemKey);
                if (!item) return null;
                return (
                  <div key={idx} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div>
                      <div className="text-white text-sm font-bold">{item.name}</div>
                      <div className="text-slate-400 text-xs">{item.description}</div>
                    </div>
                    <button
                      onClick={() => handleUnequip(itemKey)}
                      className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
                    >
                      Unequip
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-slate-800 rounded p-3">
            <div className="text-amber-400 font-bold text-sm mb-2">🎁 Inventory ({inventory.length})</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {inventory.length === 0 && (
                <div className="text-slate-500 text-xs text-center py-2">Empty inventory</div>
              )}
              {inventory.map((itemKey, idx) => {
                const item = getEquipment(itemKey);
                if (!item) return null;
                const isConsumable = item.category === 'consumable';
                return (
                  <div key={idx} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div>
                      <div className="text-white text-sm font-bold">{item.name}</div>
                      <div className="text-slate-400 text-xs">{item.description}</div>
                    </div>
                    <div className="flex gap-1">
                      {isConsumable ? (
                        <button
                          onClick={() => handleUseConsumable(itemKey, idx)}
                          className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs"
                        >
                          Use
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(itemKey)}
                          className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div className="bg-slate-800 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-amber-400 font-bold text-sm">🏪 Shop (Gold: {state.gold})</div>
              <button
                onClick={() => setShowShop(!showShop)}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
              >
                {showShop ? 'Hide' : 'Show'} Shop
              </button>
            </div>

            {showShop && (
              <>
                {/* Category Tabs */}
                <div className="flex gap-1 mb-2">
                  {['weapon', 'armor', 'shield', 'consumable', 'magic'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded text-xs ${
                        selectedCategory === cat
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Shop Items */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {getEquipmentByCategory(selectedCategory).map(item => {
                    const canAfford = state.gold >= item.cost;
                    return (
                      <div key={item.key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-white text-sm font-bold">{item.name}</div>
                          <div className="text-slate-400 text-xs">{item.description}</div>
                          <div className="text-yellow-400 text-xs font-bold mt-0.5">{item.cost} gold</div>
                        </div>
                        <button
                          onClick={() => handleBuy(item.key)}
                          disabled={!canAfford}
                          className={`px-2 py-1 rounded text-xs ${
                            canAfford
                              ? 'bg-green-600 hover:bg-green-500'
                              : 'bg-slate-600 cursor-not-allowed'
                          }`}
                        >
                          Buy
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
