
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
import { SPELLS } from '../data/spells.js';
import { SCROLLS, getScroll } from '../data/scrolls.js';
import { selectParty, selectHero } from '../state/selectors.js';
import {
  removeFromInventory,
  equipItem,
  logMessage,
  unequipItem,
  addToInventory,
  updateHero,
  adjustGold
} from '../state/actionCreators.js';
import { useBandage } from '../state/actionCreators.js';

export default function Equipment({ isOpen, state, dispatch, onClose }) {
  const [selectedHero, setSelectedHero] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('weapon');
  const [showShop, setShowShop] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemEquipable, setNewItemEquipable] = useState(false);
  const [newItemError, setNewItemError] = useState('');
  const [showNewScrollModal, setShowNewScrollModal] = useState(false);
  const [selectedScrollSpell, setSelectedScrollSpell] = useState('');

  if (!isOpen) return null;

  // Early return for empty party - show modal with message
  const party = selectParty(state);
  if (!party || party.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-empty-title"
      >
        <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border-2 border-amber-500">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-t-lg -m-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 id="equipment-empty-title" className="text-2xl font-bold text-white">Equipment</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-red-300 text-2xl font-bold"
                aria-label="Close equipment"
              >✕</button>
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

  const hero = selectHero(state, selectedHero);
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
  dispatch(removeFromInventory(selectedHero, invIdx));
    }

  dispatch(equipItem(selectedHero, itemKey));
  // Safe name lookup (support custom items which are not in ALL_EQUIPMENT)
  const equippedItem = getEquipment(itemKey);
  let equippedName = itemKey;
  if (equippedItem) equippedName = equippedItem.name;
  else if (typeof itemKey === 'string' && itemKey.startsWith('custom:')) {
    const parts = itemKey.split(':');
    if (parts.length >= 5) {
      equippedName = decodeURIComponent(parts.slice(3, parts.length - 1).join(':'));
    } else if (parts.length >= 4) {
      equippedName = decodeURIComponent(parts[3] || parts[1]);
    }
  }

  dispatch(logMessage(`${hero.name} equipped ${equippedName}`, 'equipment'));
  };

  // Handle unequipping an item
  const handleUnequip = (itemKey) => {
  dispatch(unequipItem(selectedHero, itemKey));
  dispatch(addToInventory(selectedHero, itemKey));
  // Safe name lookup for unequipping (handle custom items)
  const unequippedItem = getEquipment(itemKey);
  let unequippedName = itemKey;
  if (unequippedItem) unequippedName = unequippedItem.name;
  else if (typeof itemKey === 'string' && itemKey.startsWith('custom:')) {
    const parts = itemKey.split(':');
    if (parts.length >= 5) {
      unequippedName = decodeURIComponent(parts.slice(3, parts.length - 1).join(':'));
    } else if (parts.length >= 4) {
      unequippedName = decodeURIComponent(parts[3] || parts[1]);
    }
  }

  dispatch(logMessage(`${hero.name} unequipped ${unequippedName}`, 'equipment'));
  };

  // Handle using a consumable
  const handleUseConsumable = (itemKey, itemIdx) => {
    const item = getEquipment(itemKey);
    if (!item || item.category !== 'consumable') return;

    // Enforce per-adventure bandage limit
    if (itemKey === 'bandage') {
      const used = (state.abilities?.[selectedHero]?.bandagesUsed) || 0;
      const limit = item.limitPerAdventure || 1;
      if (used >= limit) {
        alert(`${hero.name} has already used their ${limit} bandage(s) this adventure.`);
        return;
      }
      // Record bandage use
      dispatch(useBandage(selectedHero));
    }

    const result = useConsumable(itemKey, hero);

    if (result.success) {
      // Apply effect
      if (result.effect === 'heal') {
        const newHP = Math.min(hero.maxHp, hero.hp + result.amount);
    dispatch(updateHero(selectedHero, { hp: newHP }));
      }

      // Remove from inventory
  dispatch(removeFromInventory(selectedHero, itemIdx));
  dispatch(logMessage(result.message, 'equipment'));
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

  dispatch(adjustGold(-item.cost));
  dispatch(addToInventory(selectedHero, itemKey));
  dispatch(logMessage(`${hero.name} bought ${item.name} for ${item.cost}gp`));
  };

  // Add item to inventory without spending gold
  const handleAddToInventory = (itemKey) => {
    const item = getEquipment(itemKey);
    if (!item) return;

    dispatch(addToInventory(selectedHero, itemKey));
    dispatch(logMessage(`${hero.name} received ${item.name} (added to inventory, no cost)`, 'equipment'));
  };

  // New item modal handlers
  const openNewItemModal = () => {
    setNewItemName('');
    setNewItemDesc('');
    setNewItemEquipable(false); // default to not equipable
    setNewItemError('');
    setShowNewItemModal(true);
  };

  const submitNewItem = () => {
    const trimmed = (newItemName || '').trim();
    if (!trimmed) {
      setNewItemError('Name is required');
      return;
    }

    const ts = Date.now();
    const key = `custom:${ts}:${newItemEquipable ? '1' : '0'}:${encodeURIComponent(trimmed)}:${encodeURIComponent(newItemDesc || '')}`;
    dispatch(addToInventory(selectedHero, key));
    dispatch(logMessage(`${hero.name} added custom item "${trimmed}" to inventory${newItemEquipable ? ' (equipable)' : ''}`, 'equipment'));
    setShowNewItemModal(false);
  };

  const cancelNewItem = () => {
    setShowNewItemModal(false);
  };

  // New scroll modal handlers
  const openNewScrollModal = () => {
    setSelectedScrollSpell('');
    setShowNewScrollModal(true);
  };

  const submitNewScroll = () => {
    if (!selectedScrollSpell) return;

    // Get the scroll key from the spell
    const scrollKey = `scroll_${selectedScrollSpell}`;
    dispatch(addToInventory(selectedHero, scrollKey));
    dispatch(logMessage(`${hero.name} received ${SCROLLS[scrollKey]?.name || 'scroll'} (added to inventory)`, 'equipment'));
    setShowNewScrollModal(false);
  };

  const cancelNewScroll = () => {
    setShowNewScrollModal(false);
  };

  // Give starting equipment
  const handleStartingEquipment = () => {
    const startingGear = getStartingEquipment(hero.key);
    startingGear.forEach(itemKey => {
  dispatch(equipItem(selectedHero, itemKey));
    });
  dispatch(logMessage(`${hero.name} received starting equipment`));
  };

  // Migrate from old equipment format to new array format
  const handleMigrateEquipment = () => {
    // Convert old object format to new array format
  dispatch(updateHero(selectedHero, { equipment: [], inventory: [] }));
  dispatch(logMessage(`${hero.name} equipment migrated to new format`));
  };

  return (
    <div
      id="equipment_modal_overlay"
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="equipment_modal_title"
    >
      <div id="equipment_modal" className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-500" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div id="equipment_modal_header" className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 id="equipment_modal_title" className="text-2xl font-bold text-white">Equipment</h2>
            <button
              id="equipment_modal_close_button"
              onClick={onClose}
              className="text-white hover:text-red-300 text-2xl font-bold"
              aria-label="Close equipment"
            >
              ✕
            </button>
          </div>
        </div>

        <div id="equipment_modal_content" className="p-4 space-y-4">
          {/* Migration Warning */}
          {isOldFormat && (
            <div className="bg-yellow-900 border-2 border-yellow-500 rounded p-3">
              <div className="text-yellow-300 font-bold text-sm mb-2">️ Old Save Format Detected</div>
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
          <div id="equipment_hero_selector" className="bg-slate-800 rounded p-3">
            <div id="equipment_hero_selector_title" className="text-amber-400 font-bold text-sm mb-2">Select Hero</div>
            <div id="equipment_hero_buttons" className="grid grid-cols-4 gap-2">
              {state.party.map((h, idx) => (
                <button
                  id={`equipment_hero_${idx}`}
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
          <div id="equipment_bonuses_section" className="bg-slate-800 rounded p-3">
            <div id="equipment_bonuses_title" className="text-green-400 font-bold text-sm mb-2"> Equipment Bonuses</div>
            <div id="equipment_bonuses_grid" className="grid grid-cols-4 gap-2 text-xs">
              <div id="equipment_bonus_attack" className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Attack</div>
                <div className="text-orange-400 font-bold">{bonuses.attackMod >= 0 ? '+' : ''}{bonuses.attackMod}</div>
              </div>
              <div id="equipment_bonus_defense" className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Defense</div>
                <div className="text-blue-400 font-bold">{bonuses.defenseMod >= 0 ? '+' : ''}{bonuses.defenseMod}</div>
              </div>
              <div id="equipment_bonus_save" className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Save</div>
                <div className="text-green-400 font-bold">{bonuses.saveMod >= 0 ? '+' : ''}{bonuses.saveMod}</div>
              </div>
              <div id="equipment_bonus_stealth" className="bg-slate-700 p-2 rounded">
                <div className="text-slate-400">Stealth</div>
                <div className="text-purple-400 font-bold">{bonuses.stealthMod >= 0 ? '+' : ''}{bonuses.stealthMod}</div>
              </div>
            </div>
          </div>

          {/* Equipped Items */}
          <div id="equipment_equipped_section" className="bg-slate-800 rounded p-3">
            <div id="equipment_equipped_header" className="flex justify-between items-center mb-2">
              <div id="equipment_equipped_title" className="text-amber-400 font-bold text-sm"> Equipped ({equipped.length})</div>
              {equipped.length === 0 && (
                <button
                  id="equipment_starting_gear_button"
                  onClick={handleStartingEquipment}
                  className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs"
                >
                  Get Starting Gear
                </button>
              )}
            </div>
            <div id="equipment_equipped_list" className="space-y-1 max-h-32 overflow-y-auto">
              {equipped.length === 0 && (
                <div className="text-slate-500 text-xs text-center py-2">No equipment</div>
              )}
              {equipped.map((itemKey, idx) => {
                const item = getEquipment(itemKey);
                if (item) {
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
                }

                // Render custom equipped items
                const isCustomEq = typeof itemKey === 'string' && itemKey.startsWith('custom:');
                if (isCustomEq) {
                  // Parse custom key: custom:ts:flag:encodedName:encodedDesc
                  const parts = itemKey.split(':');
                  let displayName = itemKey;
                  let displayDesc = '';
                  if (parts.length >= 5) {
                    displayName = decodeURIComponent(parts.slice(3, parts.length - 1).join(':'));
                    displayDesc = decodeURIComponent(parts[parts.length - 1] || '');
                  } else if (parts.length >= 4) {
                    displayName = decodeURIComponent(parts[3] || parts[1]);
                  }

                  return (
                    <div key={idx} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                      <div>
                        <div className="text-white text-sm font-bold">{displayName}</div>
                        {displayDesc && <div className="text-slate-400 text-xs">{displayDesc}</div>}
                      </div>
                      <button
                        onClick={() => handleUnequip(itemKey)}
                        className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
                      >
                        Unequip
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Inventory */}
          <div id="equipment_inventory_section" className="bg-slate-800 rounded p-3">
            <div id="equipment_inventory_header" className="flex items-center justify-between mb-2">
              <div id="equipment_inventory_title" className="text-amber-400 font-bold text-sm"> Inventory ({inventory.length})</div>
              <div id="equipment_inventory_buttons" className="flex gap-2">
                <button id="equipment_new_item_button" onClick={openNewItemModal} className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs">New Item</button>
                <button id="equipment_new_scroll_button" onClick={openNewScrollModal} className="bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-xs">New Scroll</button>
              </div>
            </div>
            <div id="equipment_inventory_list" className="space-y-1 max-h-40 overflow-y-auto">
              {inventory.length === 0 && (
                <div className="text-slate-500 text-xs text-center py-2">Empty inventory</div>
              )}
              {inventory.map((itemKey, idx) => {
                const item = getEquipment(itemKey);
                const isCustom = !item && typeof itemKey === 'string' && itemKey.startsWith('custom:');
                let displayName = item ? item.name : itemKey;
                let displayDesc = item ? item.description : '';
                let customEquipable = false;
                if (isCustom) {
                  const parts = itemKey.split(':');
                  // Expect: ['custom', ts, equipFlag, encodedName, encodedDesc]
                  if (parts.length >= 5) {
                    displayName = decodeURIComponent(parts.slice(3, parts.length - 1).join(':'));
                    displayDesc = decodeURIComponent(parts[parts.length - 1] || '');
                    customEquipable = parts[2] === '1';
                  } else if (parts.length >= 4) {
                    displayName = decodeURIComponent(parts[3] || parts[1]);
                  } else {
                    displayName = itemKey;
                  }
                }

                const isConsumable = item?.category === 'consumable';

                return (
                  <div key={idx} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div>
                      <div className="text-white text-sm font-bold">{displayName}</div>
                      {displayDesc && <div className="text-slate-400 text-xs">{displayDesc}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Only offer Use/Equip for known items */}
                      {item ? (
                        isConsumable ? (
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
                        )
                      ) : (
                        customEquipable ? (
                          <button
                            onClick={() => {
                              // remove from inventory at this idx then equip
                              dispatch(removeFromInventory(selectedHero, idx));
                              dispatch(equipItem(selectedHero, itemKey));
                              dispatch(logMessage(`${hero.name} equipped ${displayName}`, 'equipment'));
                            }}
                            className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
                          >
                            Equip
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Custom item</span>
                        )
                      )}

                      <button
                        onClick={() => {
                          dispatch(removeFromInventory(selectedHero, idx));
                          dispatch(logMessage(`${hero.name} removed ${displayName} from inventory`, 'equipment'));
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        aria-label={`Remove ${displayName} from inventory`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* New Item Modal */}
          {showNewItemModal && (
            <div id="equipment_new_item_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div id="equipment_new_item_modal" className="bg-slate-900 rounded-lg w-full max-w-md p-4 border-2 border-amber-500">
                <div id="equipment_new_item_modal_header" className="flex justify-between items-center mb-2">
                  <div id="equipment_new_item_modal_title" className="text-xl font-bold text-white">Add New Item</div>
                  <button id="equipment_new_item_modal_close_button" onClick={cancelNewItem} className="text-white">✕</button>
                </div>
                <div id="equipment_new_item_modal_content" className="space-y-2">
                  <div>
                    <label htmlFor="equipment_new_item_name" className="text-sm text-slate-300">Name</label>
                    <input id="equipment_new_item_name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label htmlFor="equipment_new_item_description" className="text-sm text-slate-300">Description (optional)</label>
                    <input id="equipment_new_item_description" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} className="w-full mt-1 p-2 rounded bg-slate-800 text-white text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="equipment_new_item_equipable" type="checkbox" checked={newItemEquipable} onChange={(e) => setNewItemEquipable(e.target.checked)} />
                    <label htmlFor="equipment_new_item_equipable" className="text-sm text-slate-300">Equipable</label>
                  </div>
                  {newItemError && <div id="equipment_new_item_error" className="text-red-400 text-sm">{newItemError}</div>}
                  <div id="equipment_new_item_modal_buttons" className="flex justify-end gap-2 mt-2">
                    <button id="equipment_new_item_modal_cancel_button" onClick={cancelNewItem} className="px-3 py-1 rounded bg-slate-700 text-sm">Cancel</button>
                    <button id="equipment_new_item_modal_submit_button" onClick={submitNewItem} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm">Add Item</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New Scroll Modal */}
          {showNewScrollModal && (
            <div id="equipment_new_scroll_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div id="equipment_new_scroll_modal" className="bg-slate-900 rounded-lg w-full max-w-md p-4 border-2 border-purple-500">
                <div id="equipment_new_scroll_modal_header" className="flex justify-between items-center mb-3">
                  <div id="equipment_new_scroll_modal_title" className="text-xl font-bold text-white">Add Scroll</div>
                  <button id="equipment_new_scroll_modal_close_button" onClick={cancelNewScroll} className="text-white">✕</button>
                </div>
                <div id="equipment_new_scroll_modal_content" className="space-y-2">
                  <label htmlFor="equipment_new_scroll_spell_select" className="text-sm text-slate-300">Select Spell</label>
                  <select
                    id="equipment_new_scroll_spell_select"
                    value={selectedScrollSpell}
                    onChange={(e) => setSelectedScrollSpell(e.target.value)}
                    className="w-full p-2 rounded bg-slate-800 text-white text-sm"
                  >
                    <option value="">-- Choose a spell --</option>
                    {Object.entries(SPELLS).map(([spellKey, spell]) => (
                      <option key={spellKey} value={spellKey}>
                        {spell.name}
                      </option>
                    ))}
                  </select>
                  {selectedScrollSpell && (
                    <div id="equipment_new_scroll_spell_preview" className="bg-slate-700 p-2 rounded text-sm">
                      <div id="equipment_new_scroll_spell_preview_name" className="text-purple-300 font-bold mb-1">{SPELLS[selectedScrollSpell].name}</div>
                      <div id="equipment_new_scroll_spell_preview_description" className="text-slate-300 text-xs">{SPELLS[selectedScrollSpell].description}</div>
                    </div>
                  )}
                  <div id="equipment_new_scroll_modal_buttons" className="flex justify-end gap-2 mt-3">
                    <button id="equipment_new_scroll_modal_cancel_button" onClick={cancelNewScroll} className="px-3 py-1 rounded bg-slate-700 text-sm">Cancel</button>
                    <button
                      id="equipment_new_scroll_modal_submit_button"
                      onClick={submitNewScroll}
                      disabled={!selectedScrollSpell}
                      className={`px-3 py-1 rounded text-sm ${selectedScrollSpell ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                    >
                      Add Scroll
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop */}
          <div id="equipment_shop_section" className="bg-slate-800 rounded p-3">
            <div id="equipment_shop_header" className="flex justify-between items-center mb-2">
              <div id="equipment_shop_title" className="text-amber-400 font-bold text-sm"> Shop (Gold: {state.gold})</div>
              <button
                id="equipment_shop_toggle_button"
                onClick={() => setShowShop(!showShop)}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
              >
                {showShop ? 'Hide' : 'Show'} Shop
              </button>
            </div>

            {showShop && (
              <>
                {/* Category Tabs */}
                <div id="equipment_shop_categories" className="flex gap-1 mb-2">
                  {['weapon', 'armor', 'shield', 'equipment', 'consumable', 'magic'].map(cat => (
                    <button
                      id={`equipment_shop_category_${cat}`}
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
                <div id="equipment_shop_items" className="space-y-1 max-h-64 overflow-y-auto">
                  {getEquipmentByCategory(selectedCategory).map(item => {
                    const canAfford = state.gold >= item.cost;
                    return (
                      <div id={`equipment_shop_item_${item.key}`} key={item.key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                        <div className="flex-1">
                          <div id={`equipment_shop_item_${item.key}_name`} className="text-white text-sm font-bold">{item.name}</div>
                          <div id={`equipment_shop_item_${item.key}_description`} className="text-slate-400 text-xs">{item.description}</div>
                          <div id={`equipment_shop_item_${item.key}_cost`} className="text-yellow-400 text-xs font-bold mt-0.5">{item.cost} gold</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            id={`equipment_shop_item_${item.key}_buy_button`}
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
                          <button
                            id={`equipment_shop_item_${item.key}_add_button`}
                            onClick={() => handleAddToInventory(item.key)}
                            className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500"
                          >
                            Add to Inventory
                          </button>
                        </div>
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
