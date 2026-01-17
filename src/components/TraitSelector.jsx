import React, { useState } from 'react';
import { getTraitsForClass, rollRandomTrait } from '../data/traits.js';
import { getTier } from '../data/classes.js';

export default function TraitSelector({ isOpen, hero, heroIdx, dispatch, onClose }) {
  const [selectedTrait, setSelectedTrait] = useState(null);
  const [traitChoice, setTraitChoice] = useState(null); // For traits that require a sub-choice

  if (!isOpen || !hero) return null;

  const traits = getTraitsForClass(hero.key);
  if (traits.length === 0) return null;

  const currentTrait = hero.trait || null;
  const currentTraitChoice = hero.traitChoice || null;

  const handleSelectTrait = (trait) => {
    setSelectedTrait(trait);
    setTraitChoice(null); // Reset sub-choice when selecting new trait
  };

  const handleRandomRoll = () => {
    const rolled = rollRandomTrait(hero.key);
    if (rolled) {
      setSelectedTrait(rolled);
      setTraitChoice(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTrait) {
      alert('Please select a trait first!');
      return;
    }

    // Check if trait requires a choice
    if (selectedTrait.requiresChoice && !traitChoice) {
      alert(`Please choose a ${selectedTrait.choices.join(' or ')} for this trait!`);
      return;
    }

    // Update hero with trait and apply any immediate persistent effects
    const traitKey = selectedTrait.key;
    // Compute immediate updates (e.g., +1 maxHp)
    let immediateUpdates = {};
    try {
      // Use dynamic ES import so this runs in the browser and avoids `require`.
      const mod = await import('../utils/traitEffects.js');
      if (mod && typeof mod.applyImmediateTraitEffects === 'function') {
        immediateUpdates = mod.applyImmediateTraitEffects(hero, traitKey) || {};
      }
    } catch (e) {
      // noop - if helper unavailable, still set trait
    }

    dispatch({
      type: 'UPD_HERO',
      i: heroIdx,
      u: {
        trait: traitKey,
        traitChoice: traitChoice,
        ...immediateUpdates
      }
    });

    dispatch({
      type: 'LOG',
      t: `${hero.name} selected trait: ${selectedTrait.name}${traitChoice ? ` (${traitChoice})` : ''}`
    });

    onClose();
  };

  const handleRemoveTrait = () => {
    dispatch({
      type: 'UPD_HERO',
      i: heroIdx,
      u: {
        trait: null,
        traitChoice: null
      }
    });

    dispatch({
      type: 'LOG',
      t: `${hero.name} removed their trait`
    });

    setSelectedTrait(null);
    setTraitChoice(null);
  };

  return (
    <div id="trait_selector_modal_overlay" className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div id="trait_selector_modal" className="bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500 relative z-[10000]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div id="trait_selector_modal_header" className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 sticky top-0 z-[10001]">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="trait_selector_modal_title" className="text-2xl font-bold text-white">🎯 Select Character Trait</h2>
              <div id="trait_selector_modal_hero_info" className="text-cyan-200 text-sm">{hero.name} ({hero.key})</div>
            </div>
            <button id="trait_selector_modal_close_button" onClick={onClose} className="text-white hover:text-red-300 text-2xl font-bold">✕</button>
          </div>
        </div>

        <div id="trait_selector_modal_content" className="p-4 space-y-4">
          {/* Current Trait Display */}
          {currentTrait && (
            <div id="trait_selector_current_trait_section" className="bg-green-900 border-2 border-green-500 rounded p-3">
              <div className="flex justify-between items-start">
                <div id="trait_selector_current_trait_info">
                  <div id="trait_selector_current_trait_label" className="text-green-300 font-bold text-sm mb-1">✓ Current Trait</div>
                  <div id="trait_selector_current_trait_name" className="text-white font-bold">{traits.find(t => t.key === currentTrait)?.name || currentTrait}</div>
                  {currentTraitChoice && (
                    <div id="trait_selector_current_trait_choice" className="text-green-200 text-xs">Choice: {currentTraitChoice}</div>
                  )}
                  <div id="trait_selector_current_trait_description" className="text-green-200 text-xs mt-1">
                    {traits.find(t => t.key === currentTrait)?.description}
                  </div>
                </div>
                <button
                  id="trait_selector_remove_trait_button"
                  onClick={handleRemoveTrait}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div id="trait_selector_instructions_section" className="bg-slate-800 rounded p-3">
            <div id="trait_selector_instructions_content" className="text-slate-300 text-sm">
              <div id="trait_selector_instructions_title" className="font-bold text-cyan-400 mb-2">Choose Your Trait</div>
              <p id="trait_selector_instructions_text" className="text-xs">
                Select one trait from the list below, or roll randomly. Traits provide unique bonuses and abilities
                that complement your character's playstyle. You can change your trait selection at any time.
              </p>
            </div>
          </div>

          {/* Random Roll Button */}
          <div id="trait_selector_random_roll_section" className="flex gap-2">
            <button
              id="trait_selector_random_roll_button"
              onClick={handleRandomRoll}
              className="flex-1 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-white font-bold"
            >
              🎲 Roll Random Trait (d6)
            </button>
          </div>

          {/* Trait List */}
          <div id="trait_selector_trait_list_section" className="space-y-2">
            <div id="trait_selector_trait_list_header" className="text-cyan-400 font-bold text-sm mb-2">Available Traits ({traits.length})</div>
            {traits.map((trait, idx) => {
              const isSelected = selectedTrait?.key === trait.key;
              const isCurrent = currentTrait === trait.key;

              return (
                <div
                  id={`trait_selector_trait_${idx}`}
                  key={trait.key}
                  className={`bg-slate-700 rounded p-3 cursor-pointer border-2 transition-colors ${
                    isSelected
                      ? 'border-cyan-500 bg-slate-600'
                      : isCurrent
                      ? 'border-green-500'
                      : 'border-transparent hover:border-slate-500'
                  }`}
                  onClick={() => handleSelectTrait(trait)}
                >
                  <div className="flex items-start gap-3">
                    <div id={`trait_selector_trait_${idx}_number`} className="text-slate-400 font-bold text-lg pt-1">{idx + 1}</div>
                    <div id={`trait_selector_trait_${idx}_content`} className="flex-1">
                      <div id={`trait_selector_trait_${idx}_header`} className="flex items-center gap-2 mb-1">
                        <div id={`trait_selector_trait_${idx}_name`} className="text-white font-bold">{trait.name}</div>
                        {isCurrent && (
                          <span id={`trait_selector_trait_${idx}_current_badge`} className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Current</span>
                        )}
                        {isSelected && (
                          <span id={`trait_selector_trait_${idx}_selected_badge`} className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded">Selected</span>
                        )}
                      </div>
                      <div id={`trait_selector_trait_${idx}_description`} className="text-slate-300 text-sm mb-1">{trait.description}</div>
                      <div id={`trait_selector_trait_${idx}_benefit`} className="text-cyan-400 text-xs font-bold">
                        {trait.benefit}
                      </div>

                      {/* Sub-choice for traits that require it */}
                      {isSelected && trait.requiresChoice && (
                        <div id={`trait_selector_trait_${idx}_choice_section`} className="mt-3 pt-3 border-t border-slate-600">
                          <div id={`trait_selector_trait_${idx}_choice_label`} className="text-cyan-300 text-sm font-bold mb-2">
                            Choose your {trait.choices[0]} or {trait.choices[1]}:
                          </div>
                          <div id={`trait_selector_trait_${idx}_choice_buttons`} className="flex gap-2">
                            {trait.choices.map(choice => (
                              <button
                                id={`trait_selector_trait_${idx}_choice_${choice}`}
                                key={choice}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTraitChoice(choice);
                                }}
                                className={`flex-1 px-3 py-2 rounded text-sm font-bold ${
                                  traitChoice === choice
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                }`}
                              >
                                {choice.charAt(0).toUpperCase() + choice.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div id="trait_selector_confirm_section" className="sticky bottom-0 bg-slate-900 pt-4 pb-2 border-t border-slate-700">
            <button
              id="trait_selector_confirm_button"
              onClick={handleConfirm}
              disabled={!selectedTrait}
              className={`w-full px-4 py-3 rounded font-bold text-lg ${
                selectedTrait
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {selectedTrait ? `Confirm: ${selectedTrait.name}` : 'Select a Trait'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
