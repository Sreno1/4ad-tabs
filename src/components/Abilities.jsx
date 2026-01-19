import React, { useState } from 'react';
import { getTrickPoints, getGadgetPoints, getPrayerPoints, getMaxPanache, getFlurryAttacks, getTier } from '../data/classes.js';
import { hasTraits, getTrait } from '../data/traits.js';
import TraitSelector from './TraitSelector.jsx';

// Acrobat Trick List
const ACROBAT_TRICKS = [
  { key: 'leapOutOfHarm', name: 'Leap out of Harm', cost: 1, description: 'Reroll a failed Save vs. any non-magical danger' },
  { key: 'shiftPosition', name: 'Shift Position', cost: 1, description: 'Instantly trade places in Marching Order with ally' },
  { key: 'distract', name: 'Distract', cost: 1, description: 'Reduce Foe L by Tier for encounter (not Weird/Vermin)' },
  { key: 'flipKick', name: 'Flip Kick', cost: 1, description: 'Unarmed attack ignoring -2 penalty (skip turn on 1)' },
  { key: 'doubleKick', name: 'Double Kick', cost: 1, description: 'Attack 2 Minor Foes at -1 each (max 1 kill each)' },
  { key: 'evade', name: 'Evade', cost: 1, description: 'Move out of melee without attack' },
  { key: 'gracefulMove', name: 'Graceful Move', cost: 1, description: 'Reroll failed Save to woo/seduce/impress NPC' },
  { key: 'serpentTwist', name: 'Serpent Twist', cost: 1, description: 'Escape bonds/tendrils/ropes automatically' },
  { key: 'knifeThrow', name: 'Knife Throw', cost: 1, description: 'Throw blade at +Tier, ignore -1 for light ranged' },
  { key: 'vaultingStrike', name: 'Vaulting Strike', cost: 1, description: 'First turn if not surprised: +L attack (once per combat)' },
  { key: 'juggling', name: 'Juggling', cost: 1, description: 'Gain extra free hand for encounter' }
];

// Gnome Gadgets List
const GNOME_GADGETS = [
  { key: 'mechanicalWeapon', name: 'Mechanical Weapon', cost: 1, description: '+L to single ranged attack (disabled until repair)' },
  { key: 'lockpick', name: 'Gadget Lockpick', cost: '1+', description: 'Open lock/door or disarm trap. +X for spending X points' },
  { key: 'escapeArtist', name: 'Escape Artist', cost: 1, description: 'Free someone from chains/ropes/restraints' },
  { key: 'smokescreen', name: 'Smokescreen', cost: 1, description: 'Flee combat without attacks (not vs fire/smoke foes)' },
  { key: 'portableDoor', name: 'Portable Door', cost: 1, description: 'Add/remove/lock door on map' },
  { key: 'grenade', name: 'Grenade', cost: '2-5', description: 'Deal (cost-1) damage, max 4. Hits party in melee!' }
];

// Paladin Prayers
const PALADIN_PRAYERS = [
  { key: 'heal', name: 'Heal', cost: 1, description: 'Heal 1 Life on self or ally (can spend multiple)' },
  { key: 'reroll', name: 'Reroll Save', cost: 1, description: 'Reroll a failed Save' },
  { key: 'summonSteed', name: 'Summon Steed', cost: 1, description: 'Summon mount for one day (outdoors only, not in combat)' }
];

export default function Abilities({ isOpen, state, dispatch, onClose }) {
  const [selectedHero, setSelectedHero] = useState(0);
  const [showTraitSelector, setShowTraitSelector] = useState(false);

  if (!isOpen) return null;

  if (!state.party || state.party.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="abilities-empty-title"
      >
        <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border-2 border-purple-500">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-lg -m-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 id="abilities-empty-title" className="text-2xl font-bold text-white"> Abilities</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-red-300 text-2xl font-bold"
                aria-label="Close abilities"
              >✕</button>
            </div>
          </div>
          <div className="text-center text-slate-400 py-8">
            <p>No heroes in party!</p>
            <p className="text-sm mt-2">Add heroes first.</p>
          </div>
        </div>
      </div>
    );
  }

  const hero = state.party[selectedHero];
  if (!hero) return null;

  const abilities = hero.abilities || {};
  const tier = getTier(hero.lvl);

  // Calculate resources for each class
  const maxTricks = getTrickPoints(hero.lvl);
  const tricksRemaining = maxTricks - (abilities.tricksUsed || 0);

  const maxGadgets = getGadgetPoints(hero.lvl);
  const gadgetsRemaining = maxGadgets - (abilities.gadgetsUsed || 0);

  const maxPrayer = getPrayerPoints(hero.lvl);
  const prayerRemaining = maxPrayer - (abilities.prayerUsed || 0);

  const maxPanache = getMaxPanache(hero.lvl);
  const panacheCurrent = abilities.panacheCurrent || 0;

  const maxSpores = tier;
  const sporesRemaining = maxSpores - (abilities.sporesUsed || 0);

  const flurryAttacks = getFlurryAttacks(hero.lvl);

  // Handlers
  const handleUseTrick = (trickKey) => {
    if (tricksRemaining <= 0) {
      alert('No trick points remaining!');
      return;
    }
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, tricksUsed: (abilities.tricksUsed || 0) + 1 } } });
    dispatch({ type: 'LOG', t: `${hero.name} uses trick: ${ACROBAT_TRICKS.find(t => t.key === trickKey)?.name}` });
  };

  const handleUseGadget = (gadgetKey, cost = 1) => {
    if (gadgetsRemaining < cost) {
      alert(`Not enough gadget points! Need ${cost}, have ${gadgetsRemaining}`);
      return;
    }
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, gadgetsUsed: (abilities.gadgetsUsed || 0) + cost } } });
    dispatch({ type: 'LOG', t: `${hero.name} uses gadget: ${GNOME_GADGETS.find(g => g.key === gadgetKey)?.name} (cost ${cost})` });
  };

  const handleUsePrayer = (prayerKey, cost = 1) => {
    if (prayerRemaining < cost) {
      alert('Not enough prayer points!');
      return;
    }
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, prayerUsed: (abilities.prayerUsed || 0) + cost } } });

    if (prayerKey === 'heal') {
      const newHP = Math.min(hero.maxHp, hero.hp + 1);
      dispatch({ type: 'UPD_HERO', i: selectedHero, u: { hp: newHP } });
      dispatch({ type: 'LOG', t: `${hero.name} heals 1 Life via prayer (${hero.hp}→${newHP})` });
    } else if (prayerKey === 'summonSteed') {
      dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, mountSummoned: true, prayerUsed: (abilities.prayerUsed || 0) + cost } } });
      dispatch({ type: 'LOG', t: `${hero.name} summons their steed!` });
    } else {
      dispatch({ type: 'LOG', t: `${hero.name} uses prayer: ${PALADIN_PRAYERS.find(p => p.key === prayerKey)?.name}` });
    }
  };

  const handleSpendPanache = (amount) => {
    if (panacheCurrent < amount) {
      alert('Not enough panache!');
      return;
    }
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, panacheCurrent: panacheCurrent - amount } } });
    dispatch({ type: 'LOG', t: `${hero.name} spends ${amount} panache point(s)` });
  };

  const handleUseSpores = () => {
    if (sporesRemaining <= 0) {
      alert('No spore uses remaining!');
      return;
    }
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, sporesUsed: (abilities.sporesUsed || 0) + 1 } } });
    dispatch({ type: 'LOG', t: `${hero.name} releases spore cloud! All living Minor Foes at -1 L` });
  };

  const handleHideInShadows = () => {
    dispatch({ type: 'UPD_HERO', i: selectedHero, u: { abilities: { ...abilities, hideInShadowsUsed: (abilities.hideInShadowsUsed || 0) + 1 } } });
    dispatch({ type: 'LOG', t: `${hero.name} hides in shadows and marks a target...` });
  };

  return (
    <div
      id="abilities_modal_overlay"
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="abilities_modal_title"
    >
      <div id="abilities_modal" className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div id="abilities_modal_header" className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 id="abilities_modal_title" className="text-2xl font-bold text-white"> Class Abilities</h2>
            <button
              id="abilities_modal_close_button"
              onClick={onClose}
              className="text-white hover:text-red-300 text-2xl font-bold"
              aria-label="Close class abilities"
            >✕</button>
          </div>
        </div>

        <div id="abilities_modal_content" className="p-4 space-y-4">
          {/* Hero Selector */}
          <div id="abilities_hero_selector" className="bg-slate-800 rounded p-3">
            <div id="abilities_hero_selector_title" className="text-purple-400 font-bold text-sm mb-2">Select Hero</div>
            <div id="abilities_hero_buttons" className="grid grid-cols-4 gap-2">
              {state.party.map((h, idx) => (
                <button
                  id={`abilities_hero_${idx}`}
                  key={h.id}
                  onClick={() => setSelectedHero(idx)}
                  className={`p-2 rounded text-sm ${
                    selectedHero === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div>{h.name}</div>
                  <div className="text-xs text-slate-400">{h.key}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Character Trait Display */}
          {hasTraits(hero.key) && (
            <div id="abilities_trait_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_trait_title" className="text-cyan-400 font-bold text-sm mb-2"> Character Trait</div>
              {hero.trait ? (
                <div id="abilities_trait_display" className="bg-cyan-900 border-2 border-cyan-600 rounded p-3">
                  <div id="abilities_trait_display_header" className="flex justify-between items-start mb-2">
                    <div>
                      <div id="abilities_trait_display_name" className="text-white font-bold">{getTrait(hero.key, hero.trait)?.name || hero.trait}</div>
                      {hero.traitChoice && (
                        <div id="abilities_trait_display_choice" className="text-cyan-300 text-xs">Choice: {hero.traitChoice}</div>
                      )}
                    </div>
                    <button
                      id="abilities_trait_change_button"
                      onClick={() => setShowTraitSelector(true)}
                      className="bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded text-xs text-white"
                    >
                      Change
                    </button>
                  </div>
                  <div id="abilities_trait_display_description" className="text-cyan-200 text-sm">{getTrait(hero.key, hero.trait)?.description}</div>
                  <div id="abilities_trait_display_benefit" className="text-cyan-400 text-xs font-bold mt-2">
                    {getTrait(hero.key, hero.trait)?.benefit}
                  </div>
                </div>
              ) : (
                <button
                  id="abilities_trait_select_button"
                  onClick={() => setShowTraitSelector(true)}
                  className="w-full bg-slate-700 hover:bg-slate-600 rounded p-3 text-slate-300 text-sm"
                >
                  Click to select a character trait
                </button>
              )}
            </div>
          )}

          {/* Acrobat - Tricks */}
          {hero.key === 'acrobat' && (
            <div id="abilities_acrobat_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_acrobat_header" className="flex justify-between items-center mb-2">
                <div id="abilities_acrobat_title" className="text-cyan-400 font-bold"> Acrobat Tricks</div>
                <div id="abilities_acrobat_points" className="text-cyan-300 text-sm font-bold">
                  {tricksRemaining}/{maxTricks} points
                </div>
              </div>
              <div id="abilities_acrobat_description" className="text-xs text-slate-400 mb-3">Spend 1 trick point to perform a trick. Replenish between adventures.</div>
              <div id="abilities_acrobat_list" className="space-y-1 max-h-96 overflow-y-auto">
                {ACROBAT_TRICKS.map(trick => (
                  <div id={`abilities_acrobat_trick_${trick.key}`} key={trick.key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div className="flex-1">
                      <div id={`abilities_acrobat_trick_${trick.key}_name`} className="text-white text-sm font-bold">{trick.name}</div>
                      <div id={`abilities_acrobat_trick_${trick.key}_description`} className="text-slate-400 text-xs">{trick.description}</div>
                    </div>
                    <button
                      id={`abilities_acrobat_trick_${trick.key}_button`}
                      onClick={() => handleUseTrick(trick.key)}
                      disabled={tricksRemaining <= 0}
                      className={`px-3 py-1 rounded text-xs ml-2 ${
                        tricksRemaining > 0
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          : 'bg-slate-600 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gnome - Gadgets */}
          {hero.key === 'gnome' && (
            <div id="abilities_gnome_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_gnome_header" className="flex justify-between items-center mb-2">
                <div id="abilities_gnome_title" className="text-amber-400 font-bold"> Gnome Gadgets</div>
                <div id="abilities_gnome_points" className="text-amber-300 text-sm font-bold">
                  {gadgetsRemaining}/{maxGadgets} points
                </div>
              </div>
              <div id="abilities_gnome_description" className="text-xs text-slate-400 mb-3">Spend gadget points for mechanical devices and contraptions.</div>
              <div id="abilities_gnome_list" className="space-y-1 max-h-96 overflow-y-auto">
                {GNOME_GADGETS.map(gadget => (
                  <div id={`abilities_gnome_gadget_${gadget.key}`} key={gadget.key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div className="flex-1">
                      <div id={`abilities_gnome_gadget_${gadget.key}_name`} className="text-white text-sm font-bold">{gadget.name} <span className="text-amber-400">({gadget.cost} pts)</span></div>
                      <div id={`abilities_gnome_gadget_${gadget.key}_description`} className="text-slate-400 text-xs">{gadget.description}</div>
                    </div>
                    <button
                      id={`abilities_gnome_gadget_${gadget.key}_button`}
                      onClick={() => {
                        const cost = gadget.key === 'grenade' ? parseInt(prompt('Spend how many points? (2-5)', '3') || '3') :
                                     gadget.key === 'lockpick' ? parseInt(prompt('Spend how many bonus points? (1+bonus)', '1') || '1') : 1;
                        handleUseGadget(gadget.key, cost);
                      }}
                      disabled={gadgetsRemaining <= 0}
                      className={`px-3 py-1 rounded text-xs ml-2 ${
                        gadgetsRemaining > 0
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-slate-600 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paladin - Prayer Points */}
          {hero.key === 'paladin' && (
            <div id="abilities_paladin_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_paladin_header" className="flex justify-between items-center mb-2">
                <div id="abilities_paladin_title" className="text-yellow-400 font-bold"> Paladin Prayers</div>
                <div id="abilities_paladin_points" className="text-yellow-300 text-sm font-bold">
                  {prayerRemaining}/{maxPrayer} points
                </div>
              </div>
              <div id="abilities_paladin_description" className="text-xs text-slate-400 mb-3">Spend prayer points to invoke divine power.</div>
              <div id="abilities_paladin_list" className="space-y-1">
                {PALADIN_PRAYERS.map(prayer => (
                  <div id={`abilities_paladin_prayer_${prayer.key}`} key={prayer.key} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                    <div className="flex-1">
                      <div id={`abilities_paladin_prayer_${prayer.key}_name`} className="text-white text-sm font-bold">{prayer.name}</div>
                      <div id={`abilities_paladin_prayer_${prayer.key}_description`} className="text-slate-400 text-xs">{prayer.description}</div>
                    </div>
                    <button
                      id={`abilities_paladin_prayer_${prayer.key}_button`}
                      onClick={() => handleUsePrayer(prayer.key)}
                      disabled={prayerRemaining <= 0}
                      className={`px-3 py-1 rounded text-xs ml-2 ${
                        prayerRemaining > 0
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                          : 'bg-slate-600 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swashbuckler - Panache */}
          {hero.key === 'swashbuckler' && (
            <div id="abilities_swashbuckler_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_swashbuckler_header" className="flex justify-between items-center mb-2">
                <div id="abilities_swashbuckler_title" className="text-red-400 font-bold">️ Swashbuckler Panache</div>
                <div id="abilities_swashbuckler_points" className="text-red-300 text-sm font-bold">
                  {panacheCurrent}/{maxPanache} points
                </div>
              </div>
              <div id="abilities_swashbuckler_description" className="text-xs text-slate-400 mb-3">Gain panache from kills. Spend 1 point for +1 to next Attack or Defense.</div>
              <div id="abilities_swashbuckler_buttons" className="flex gap-2">
                <button
                  id="abilities_swashbuckler_spend_1_button"
                  onClick={() => handleSpendPanache(1)}
                  disabled={panacheCurrent < 1}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    panacheCurrent >= 1
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-slate-600 cursor-not-allowed text-slate-400'
                  }`}
                >
                  Spend 1 Panache (+1 to roll)
                </button>
                <button
                  id="abilities_swashbuckler_spend_multiple_button"
                  onClick={() => {
                    const amount = parseInt(prompt(`Spend how many panache? (max ${panacheCurrent})`, '1') || '1');
                    if (amount > 0 && amount <= panacheCurrent) handleSpendPanache(amount);
                  }}
                  disabled={panacheCurrent < 2}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    panacheCurrent >= 2
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-slate-600 cursor-not-allowed text-slate-400'
                  }`}
                >
                  Spend Multiple
                </button>
              </div>
            </div>
          )}

          {/* Assassin - Hide in Shadows */}
          {hero.key === 'assassin' && (
            <div id="abilities_assassin_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_assassin_title" className="text-indigo-400 font-bold mb-2">️ Assassin: Hide in Shadows</div>
              <div id="abilities_assassin_description" className="text-xs text-slate-400 mb-3">
                Use a turn to hide and mark target. Next successful attack deals TRIPLE damage!
              </div>
              <button
                id="abilities_assassin_hide_button"
                onClick={handleHideInShadows}
                className="w-full bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-white"
              >
                Hide in Shadows (Mark Target)
              </button>
              <div id="abilities_assassin_uses" className="text-xs text-slate-400 mt-2">
                Uses this adventure: {abilities.hideInShadowsUsed || 0}
              </div>
            </div>
          )}

          {/* Mushroom Monk - Spores */}
          {hero.key === 'mushroomMonk' && (
            <div id="abilities_mushroom_monk_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_mushroom_monk_header" className="flex justify-between items-center mb-2">
                <div id="abilities_mushroom_monk_title" className="text-green-400 font-bold"> Mushroom Monk: Spore Cloud</div>
                <div id="abilities_mushroom_monk_points" className="text-green-300 text-sm font-bold">
                  {sporesRemaining}/{maxSpores} uses (Tier {tier})
                </div>
              </div>
              <div id="abilities_mushroom_monk_description" className="text-xs text-slate-400 mb-3">
                All living Minor Foes (except fungal) get -1 to L due to poisoning/coughing.
              </div>
              <button
                id="abilities_mushroom_monk_spore_button"
                onClick={handleUseSpores}
                disabled={sporesRemaining <= 0}
                className={`w-full px-3 py-2 rounded ${
                  sporesRemaining > 0
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-slate-600 cursor-not-allowed text-slate-400'
                }`}
              >
                Release Spore Cloud
              </button>
              <div id="abilities_mushroom_monk_flurry" className="mt-3 bg-slate-700 rounded p-2">
                <div id="abilities_mushroom_monk_flurry_title" className="text-amber-400 text-sm font-bold">Flurry of Blows</div>
                <div id="abilities_mushroom_monk_flurry_description" className="text-slate-300 text-xs">
                  You can perform {flurryAttacks} attack{flurryAttacks > 1 ? 's' : ''} per turn with unarmed/nunchaku/throwing stars (Tier {tier})
                </div>
              </div>
            </div>
          )}

          {/* Warrior */}
          {hero.key === 'warrior' && (
            <div id="abilities_warrior_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_warrior_title" className="text-orange-400 font-bold mb-2">️ Warrior Abilities</div>
              <div id="abilities_warrior_list" className="space-y-2">
                <div id="abilities_warrior_ability_combat_master" className="bg-slate-700 rounded p-2">
                  <div id="abilities_warrior_ability_combat_master_name" className="text-white text-sm font-bold">Combat Master: +L to Attack</div>
                  <div id="abilities_warrior_ability_combat_master_description" className="text-slate-400 text-xs">Add your level ({hero.lvl}) to ALL attack rolls</div>
                </div>
                <div id="abilities_warrior_ability_trait" className="bg-slate-700 rounded p-2">
                  <div id="abilities_warrior_ability_trait_name" className="text-white text-sm font-bold">Trait System</div>
                  <div id="abilities_warrior_ability_trait_description" className="text-slate-400 text-xs">Choose a trait at character creation for unique bonuses</div>
                </div>
              </div>
            </div>
          )}

          {/* Cleric */}
          {hero.key === 'cleric' && (
            <div id="abilities_cleric_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_cleric_title" className="text-yellow-400 font-bold mb-2"> Cleric Abilities</div>
              <div id="abilities_cleric_list" className="space-y-2">
                <div id="abilities_cleric_ability_healing" className="bg-slate-700 rounded p-2">
                  <div id="abilities_cleric_ability_healing_name" className="text-white text-sm font-bold">Healing: d6+L Life</div>
                  <div id="abilities_cleric_ability_healing_description" className="text-slate-400 text-xs">Heal d6+{hero.lvl} life to self or ally (3x per adventure)</div>
                  <div id="abilities_cleric_ability_healing_uses" className="text-green-400 text-xs mt-1">Uses: {abilities.healsUsed || 0}/3</div>
                </div>
                <div id="abilities_cleric_ability_blessing" className="bg-slate-700 rounded p-2">
                  <div id="abilities_cleric_ability_blessing_name" className="text-white text-sm font-bold">Blessing</div>
                  <div id="abilities_cleric_ability_blessing_description" className="text-slate-400 text-xs">Grant +1 to ally's next roll (3x per adventure)</div>
                  <div id="abilities_cleric_ability_blessing_uses" className="text-green-400 text-xs mt-1">Uses: {abilities.blessingsUsed || 0}/3</div>
                </div>
                <div id="abilities_cleric_ability_turn_undead" className="bg-slate-700 rounded p-2">
                  <div id="abilities_cleric_ability_turn_undead_name" className="text-white text-sm font-bold">Turn Undead</div>
                  <div id="abilities_cleric_ability_turn_undead_description" className="text-slate-400 text-xs">Special attack vs undead creatures</div>
                </div>
              </div>
            </div>
          )}

          {/* Rogue */}
          {hero.key === 'rogue' && (
            <div id="abilities_rogue_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_rogue_title" className="text-purple-400 font-bold mb-2">️ Rogue Abilities</div>
              <div id="abilities_rogue_list" className="space-y-2">
                <div id="abilities_rogue_ability_defense_master" className="bg-slate-700 rounded p-2">
                  <div id="abilities_rogue_ability_defense_master_name" className="text-white text-sm font-bold">Defense Master: +L to Defense</div>
                  <div id="abilities_rogue_ability_defense_master_description" className="text-slate-400 text-xs">Add your level ({hero.lvl}) to Defense rolls</div>
                </div>
                <div id="abilities_rogue_ability_outnumbered" className="bg-slate-700 rounded p-2">
                  <div id="abilities_rogue_ability_outnumbered_name" className="text-white text-sm font-bold">Outnumbered Bonus</div>
                  <div id="abilities_rogue_ability_outnumbered_description" className="text-slate-400 text-xs">+L bonus vs outnumbered Minor Foes</div>
                </div>
                <div id="abilities_rogue_ability_trap_expertise" className="bg-slate-700 rounded p-2">
                  <div id="abilities_rogue_ability_trap_expertise_name" className="text-white text-sm font-bold">Trap Expertise</div>
                  <div id="abilities_rogue_ability_trap_expertise_description" className="text-slate-400 text-xs">+L to find and disarm traps</div>
                </div>
                <div id="abilities_rogue_ability_backstab" className="bg-slate-700 rounded p-2">
                  <div id="abilities_rogue_ability_backstab_name" className="text-white text-sm font-bold">Backstab</div>
                  <div id="abilities_rogue_ability_backstab_description" className="text-slate-400 text-xs">Deal extra damage from surprise attacks</div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard */}
          {hero.key === 'wizard' && (
            <div id="abilities_wizard_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_wizard_title" className="text-blue-400 font-bold mb-2"> Wizard Abilities</div>
              <div id="abilities_wizard_list" className="space-y-2">
                <div id="abilities_wizard_ability_spell_slots" className="bg-slate-700 rounded p-2">
                  <div id="abilities_wizard_ability_spell_slots_name" className="text-white text-sm font-bold">Spell Slots: L+2</div>
                  <div id="abilities_wizard_ability_spell_slots_description" className="text-slate-400 text-xs">Cast up to {hero.lvl + 2} spells per adventure</div>
                  <div id="abilities_wizard_ability_spell_slots_uses" className="text-blue-400 text-xs mt-1">Used: {abilities.spellsUsed || 0}/{hero.lvl + 2}</div>
                </div>
                <div id="abilities_wizard_ability_spell_burning" className="bg-slate-700 rounded p-2">
                  <div id="abilities_wizard_ability_spell_burning_name" className="text-white text-sm font-bold">Spell Burning</div>
                  <div id="abilities_wizard_ability_spell_burning_description" className="text-slate-400 text-xs">Cast extra spells beyond limit (roll d6, lose 1 Life on 1-2)</div>
                </div>
                <div id="abilities_wizard_ability_magic_expertise" className="bg-slate-700 rounded p-2">
                  <div id="abilities_wizard_ability_magic_expertise_name" className="text-white text-sm font-bold">Magic Expertise</div>
                  <div id="abilities_wizard_ability_magic_expertise_description" className="text-slate-400 text-xs">+L vs puzzles, magical challenges, and arcane devices</div>
                </div>
                <div id="abilities_wizard_ability_weak_melee" className="bg-slate-700 rounded p-2">
                  <div id="abilities_wizard_ability_weak_melee_name" className="text-white text-sm font-bold">Weak in Melee</div>
                  <div id="abilities_wizard_ability_weak_melee_description" className="text-red-400 text-xs">Cannot use two-handed weapons</div>
                </div>
              </div>
            </div>
          )}

          {/* Barbarian */}
          {hero.key === 'barbarian' && (
            <div id="abilities_barbarian_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_barbarian_title" className="text-red-400 font-bold mb-2"> Barbarian Abilities</div>
              <div id="abilities_barbarian_list" className="space-y-2">
                <div id="abilities_barbarian_ability_rage" className="bg-slate-700 rounded p-2">
                  <div id="abilities_barbarian_ability_rage_name" className="text-white text-sm font-bold">Rage Attack (1+½L per adventure)</div>
                  <div id="abilities_barbarian_ability_rage_description" className="text-slate-400 text-xs">Roll 3 dice, choose best, double damage!</div>
                  <div id="abilities_barbarian_ability_rage_uses" className="text-red-300 text-xs mt-1">Uses: {Math.floor(1 + hero.lvl / 2)} per adventure</div>
                </div>
                <div id="abilities_barbarian_ability_combat_master" className="bg-slate-700 rounded p-2">
                  <div id="abilities_barbarian_ability_combat_master_name" className="text-white text-sm font-bold">Combat Master: +L to Attack</div>
                  <div id="abilities_barbarian_ability_combat_master_description" className="text-slate-400 text-xs">Add your level ({hero.lvl}) to attack rolls</div>
                </div>
                <div id="abilities_barbarian_ability_no_magic" className="bg-slate-700 rounded p-2">
                  <div id="abilities_barbarian_ability_no_magic_name" className="text-white text-sm font-bold">No Magic Items</div>
                  <div id="abilities_barbarian_ability_no_magic_description" className="text-red-400 text-xs">Cannot use magic items, spells, or potions (except healing)</div>
                </div>
                <div id="abilities_barbarian_ability_illiterate" className="bg-slate-700 rounded p-2">
                  <div id="abilities_barbarian_ability_illiterate_name" className="text-white text-sm font-bold">Illiterate</div>
                  <div id="abilities_barbarian_ability_illiterate_description" className="text-slate-400 text-xs">Cannot read scrolls or books</div>
                </div>
              </div>
            </div>
          )}

          {/* Halfling */}
          {hero.key === 'halfling' && (
            <div id="abilities_halfling_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_halfling_title" className="text-green-400 font-bold mb-2"> Halfling Abilities</div>
              <div id="abilities_halfling_list" className="space-y-2">
                <div id="abilities_halfling_ability_luck" className="bg-slate-700 rounded p-2">
                  <div id="abilities_halfling_ability_luck_name" className="text-white text-sm font-bold">Luck Points: L+1</div>
                  <div id="abilities_halfling_ability_luck_description" className="text-slate-400 text-xs">Spend 1 luck to reroll any roll (yours or ally's)</div>
                  <div id="abilities_halfling_ability_luck_uses" className="text-green-300 text-xs mt-1">Used: {abilities.luckUsed || 0}/{hero.lvl + 1}</div>
                </div>
                <div id="abilities_halfling_ability_nourishing" className="bg-slate-700 rounded p-2">
                  <div id="abilities_halfling_ability_nourishing_name" className="text-white text-sm font-bold">Nourishing Meal</div>
                  <div id="abilities_halfling_ability_nourishing_description" className="text-slate-400 text-xs">When resting, party heals +1 additional Life</div>
                </div>
                <div id="abilities_halfling_ability_small_stature" className="bg-slate-700 rounded p-2">
                  <div id="abilities_halfling_ability_small_stature_name" className="text-white text-sm font-bold">Small Stature</div>
                  <div id="abilities_halfling_ability_small_stature_description" className="text-slate-400 text-xs">-1 penalty with two-handed weapons</div>
                </div>
              </div>
            </div>
          )}

          {/* Dwarf */}
          {hero.key === 'dwarf' && (
            <div id="abilities_dwarf_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_dwarf_title" className="text-amber-400 font-bold mb-2">️ Dwarf Abilities</div>
              <div id="abilities_dwarf_list" className="space-y-2">
                <div id="abilities_dwarf_ability_combat_master" className="bg-slate-700 rounded p-2">
                  <div id="abilities_dwarf_ability_combat_master_name" className="text-white text-sm font-bold">Combat Master: +L to Attack</div>
                  <div id="abilities_dwarf_ability_combat_master_description" className="text-slate-400 text-xs">Add your level ({hero.lvl}) to attack rolls</div>
                </div>
                <div id="abilities_dwarf_ability_gold_sense" className="bg-slate-700 rounded p-2">
                  <div id="abilities_dwarf_ability_gold_sense_name" className="text-white text-sm font-bold">Gold Sense</div>
                  <div id="abilities_dwarf_ability_gold_sense_description" className="text-slate-400 text-xs">+1 to all treasure rolls (stacks with other bonuses)</div>
                </div>
                <div id="abilities_dwarf_ability_merchant" className="bg-slate-700 rounded p-2">
                  <div id="abilities_dwarf_ability_merchant_name" className="text-white text-sm font-bold">Jewelry Merchant</div>
                  <div id="abilities_dwarf_ability_merchant_description" className="text-slate-400 text-xs">Sell jewelry for +20% gold (stacks with other bonuses)</div>
                </div>
                <div id="abilities_dwarf_ability_miser" className="bg-slate-700 rounded p-2">
                  <div id="abilities_dwarf_ability_miser_name" className="text-white text-sm font-bold">Miser</div>
                  <div id="abilities_dwarf_ability_miser_description" className="text-red-400 text-xs">Must keep at least 50gp in party treasury at all times</div>
                </div>
                <div id="abilities_dwarf_ability_greedy" className="bg-slate-700 rounded p-2">
                  <div id="abilities_dwarf_ability_greedy_name" className="text-white text-sm font-bold">Greedy</div>
                  <div id="abilities_dwarf_ability_greedy_description" className="text-slate-400 text-xs">Will not give gold to beggars or donate to shrines</div>
                </div>
              </div>
            </div>
          )}

          {/* Elf */}
          {hero.key === 'elf' && (
            <div id="abilities_elf_section" className="bg-slate-800 rounded p-3">
              <div id="abilities_elf_title" className="text-emerald-400 font-bold mb-2"> Elf Abilities</div>
              <div id="abilities_elf_list" className="space-y-2">
                <div id="abilities_elf_ability_combat_master" className="bg-slate-700 rounded p-2">
                  <div id="abilities_elf_ability_combat_master_name" className="text-white text-sm font-bold">Combat Master: +L to Attack</div>
                  <div id="abilities_elf_ability_combat_master_description" className="text-slate-400 text-xs">Add your level ({hero.lvl}) to attack rolls</div>
                </div>
                <div id="abilities_elf_ability_spell_slots" className="bg-slate-700 rounded p-2">
                  <div id="abilities_elf_ability_spell_slots_name" className="text-white text-sm font-bold">Spell Slots: L</div>
                  <div id="abilities_elf_ability_spell_slots_description" className="text-slate-400 text-xs">Cast up to {hero.lvl} spells per adventure</div>
                  <div id="abilities_elf_ability_spell_slots_uses" className="text-blue-400 text-xs mt-1">Used: {abilities.spellsUsed || 0}/{hero.lvl}</div>
                </div>
                <div id="abilities_elf_ability_orc_slayer" className="bg-slate-700 rounded p-2">
                  <div id="abilities_elf_ability_orc_slayer_name" className="text-white text-sm font-bold">Orc Slayer</div>
                  <div id="abilities_elf_ability_orc_slayer_description" className="text-slate-400 text-xs">+L bonus to ALL rolls vs orcs</div>
                </div>
                <div id="abilities_elf_ability_magic_weapon" className="bg-slate-700 rounded p-2">
                  <div id="abilities_elf_ability_magic_weapon_name" className="text-white text-sm font-bold">Magic Weapon Required</div>
                  <div id="abilities_elf_ability_magic_weapon_description" className="text-red-400 text-xs">Cannot attack certain powerful foes without magic weapon</div>
                </div>
              </div>
            </div>
          )}

          {/* No Special Abilities - Fallback for other classes */}
          {!['warrior', 'cleric', 'rogue', 'wizard', 'barbarian', 'halfling', 'dwarf', 'elf', 'acrobat', 'gnome', 'paladin', 'swashbuckler', 'assassin', 'mushroomMonk'].includes(hero.key) && (
            <div id="abilities_fallback_section" className="bg-slate-800 rounded p-3 text-center py-8">
              <div id="abilities_fallback_message" className="text-slate-400 text-sm">
                {hero.name} ({hero.key}) doesn't have special abilities in this panel yet.
              </div>
              <div id="abilities_fallback_note" className="text-slate-500 text-xs mt-2">
                Some abilities are managed in Combat or Party tabs.
              </div>
            </div>
          )}

          {/* General Info */}
          <div id="abilities_general_info_section" className="bg-slate-800 rounded p-3">
            <div id="abilities_general_info_content" className="text-slate-400 text-xs">
              <div id="abilities_general_info_title" className="font-bold text-slate-300 mb-1">Ability Notes:</div>
              <ul id="abilities_general_info_list" className="list-disc list-inside space-y-0.5">
                <li>Abilities replenish between adventures</li>
                <li>Panache gained from kills during combat</li>
                <li>Some abilities require Save rolls or specific conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trait Selector Modal */}
      {showTraitSelector && (
        <TraitSelector
          isOpen={true}
          hero={hero}
          heroIdx={selectedHero}
          dispatch={dispatch}
          onClose={() => setShowTraitSelector(false)}
        />
      )}
    </div>
  );
}
