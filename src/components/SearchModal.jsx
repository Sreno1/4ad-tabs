/**
 * Search Modal Component
 * Displays search results and choices when player searches a tile
 */

import React from 'react';
import { addToInventory } from '../state/actionCreators.js';

export function SearchModal({ searchResult, onChoice, onClose, state, dispatch }) {
  if (!searchResult) return null;

  const { type, message, choices, roll, total } = searchResult;

  return (
    <div id="search_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div id="search_modal" className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-amber-400">
        {/* Header */}
        <div id="search_modal_header" className="flex justify-between items-start mb-4">
          <div>
            <h2 id="search_modal_title" className="text-xl font-bold text-amber-400">🔍 Search Results</h2>
            <div id="search_modal_roll" className="text-sm text-slate-400 mt-1">
              Roll: {roll} {total !== roll && `(${total} total)`}
            </div>
          </div>
          <button
            id="search_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div id="search_modal_message" className="mb-4 text-white">
          {message}
        </div>

        {/* Wandering Monsters */}
        {type === 'wandering_monsters' && (
          <div id="search_modal_wandering" className="bg-red-900 border border-red-500 rounded p-4 mb-4">
            <div id="search_modal_wandering_title" className="text-red-200 font-bold mb-2">⚠️ Wandering Monsters Attack!</div>
            <div id="search_modal_wandering_description" className="text-red-100 text-sm mb-3">
              Your search made noise and attracted monsters. Roll on the Wandering Monsters table!
            </div>
            <button
              id="search_modal_wandering_button"
              onClick={onClose}
              className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded font-bold"
            >
              Roll Wandering Monsters
            </button>
          </div>
        )}

        {/* Nothing Found */}
        {type === 'nothing' && (
          <div id="search_modal_nothing" className="bg-slate-700 border border-slate-500 rounded p-4 mb-4">
            <div id="search_modal_nothing_message" className="text-slate-300 text-center">
              The tile appears empty. Nothing of interest here.
            </div>
            <button
              id="search_modal_nothing_button"
              onClick={onClose}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded"
            >
              Continue
            </button>
          </div>
        )}

        {/* Found Something - Show Choices */}
        {type === 'found_something' && choices && (
          <div id="search_modal_choices" className="space-y-2">
            <div id="search_modal_choices_title" className="text-amber-300 font-bold mb-3">
              Choose what you discovered:
            </div>

            {choices.map((choice) => (
              <button
                id={`search_modal_choice_${choice.key}`}
                key={choice.key}
                onClick={() => onChoice(choice.key)}
                className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-amber-400 p-3 rounded text-left transition-colors"
              >
                <div className="flex items-start">
                  <div className="text-2xl mr-3">{choice.label.split(' ')[0]}</div>
                  <div className="flex-1">
                    <div className="text-white font-bold">
                      {choice.label.substring(choice.label.indexOf(' ') + 1)}
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      {choice.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Current Clues Display */}
            <div id="search_modal_clues_display" className="mt-4 pt-4 border-t border-slate-600">
              <div className="text-xs text-slate-400">
                <div className="mb-2">Party Clues:</div>
                {state.party && state.party.length > 0 ? (
                  state.party.map((hero, idx) => {
                    const clueCount = hero.clues || 0;
                    return (
                      <div key={idx} className="text-xs ml-2 mb-1">
                        <span className="text-slate-300">{hero.name}:</span>
                        <span className={`ml-2 font-bold ${clueCount >= 3 ? 'text-green-400' : 'text-blue-400'}`}>
                          {clueCount}/3
                        </span>
                        {clueCount >= 3 && (
                          <span className="text-green-400 ml-2">(Can reveal a secret!)</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500">No heroes in party</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HiddenTreasureModal({ treasure, complication, onResolve, onClose, state, dispatch }) {
  if (!treasure) return null;

  return (
    <div id="treasure_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div id="treasure_modal" className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-yellow-400">
        {/* Header */}
        <div id="treasure_modal_header" className="flex justify-between items-start mb-4">
          <h2 id="treasure_modal_title" className="text-xl font-bold text-yellow-400">💰 Hidden Treasure!</h2>
          <button
            id="treasure_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Treasure Amount */}
        <div id="treasure_modal_amount" className="bg-yellow-900 border border-yellow-600 rounded p-4 mb-4">
          <div className="text-yellow-100 text-center">
            <div id="treasure_modal_gold" className="text-2xl font-bold mb-2">
              {treasure.gold} GP
            </div>
            <div id="treasure_modal_formula" className="text-sm text-yellow-300">
              {treasure.formula}
            </div>
          </div>
        </div>

        {/* Complication */}
        {complication && (
          <div className={`border rounded p-4 mb-4 ${
            complication.type === 'alarm' ? 'bg-red-900 border-red-500' :
            complication.type === 'trap' ? 'bg-orange-900 border-orange-500' :
            'bg-purple-900 border-purple-500'
          }`}>
            <div className="font-bold mb-2">
              {complication.type === 'alarm' && '🔔 Alarm!'}
              {complication.type === 'trap' && '⚠️ Trapped!'}
              {complication.type === 'ghost' && '👻 Ghost Guardian!'}
            </div>
            <div className="text-sm mb-3 opacity-90">
              {complication.message}
            </div>

            {/* Complication Resolution */}
            {complication.type === 'alarm' && (
              <button
                onClick={() => onResolve('alarm')}
                className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded"
              >
                Roll Wandering Monsters
              </button>
            )}

            {complication.type === 'trap' && (
              <div className="space-y-2">
                <button
                  onClick={() => onResolve('disarm_trap')}
                  className="w-full bg-orange-700 hover:bg-orange-600 text-white py-2 rounded"
                >
                  Rogue Attempts Disarm (L{state.hcl + 1})
                </button>
                <button
                  onClick={() => onResolve('trigger_trap')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
                >
                  Trigger Trap
                </button>
              </div>
            )}

            {complication.type === 'ghost' && (
              <div className="space-y-2">
                <button
                  onClick={() => onResolve('banish_ghost')}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2 rounded"
                >
                  Cleric Attempts to Banish (L{state.hcl})
                </button>
                <button
                  onClick={() => onResolve('fight_ghost')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
                >
                  All PCs Lose 1 Life
                </button>
              </div>
            )}
          </div>
        )}

        {/* Continue Button (after resolving complication) */}
        {!complication && (
          <>
            <div className="mb-3 text-slate-300 text-sm">Assign treasure to a hero:</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                    {state.party.map((hero, idx) => (
                <button
                  key={hero.id || idx}
                  onClick={() => {
                    const itemKey = treasure.itemKey || 'treasure_item';
                    try { dispatch(addToInventory(idx, itemKey)); } catch (e) {}
                  }}
                  disabled={hero.hp <= 0}
                  className={`w-full p-2 rounded text-sm ${hero.hp <= 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-black'}`}
                >
                  {hero.name}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded font-bold"
            >
              Take Treasure & Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SecretDoorModal({ secretDoor, onClose }) {
  if (!secretDoor) return null;

  return (
    <div id="secret_door_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div id="secret_door_modal" className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-blue-400">
        <div id="secret_door_modal_header" className="flex justify-between items-start mb-4">
          <h2 id="secret_door_modal_title" className="text-xl font-bold text-blue-400">
            🚪 Secret Door Discovered!
          </h2>
          <button
            id="secret_door_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div id="secret_door_modal_content" className={`border rounded p-4 mb-4 ${
          secretDoor.isShortcut
            ? 'bg-green-900 border-green-500'
            : 'bg-blue-900 border-blue-500'
        }`}>
          {secretDoor.isShortcut ? (
            <>
              <div className="text-green-200 font-bold mb-2">
                ✨ Safe Shortcut Out!
              </div>
              <div className="text-green-100 text-sm">
                This secret door leads directly out of the dungeon! You can exit safely without rolling for wandering monsters.
              </div>
            </>
          ) : (
            <>
              <div className="text-blue-200 font-bold mb-2">
                🗺️ Leads to New Tile
              </div>
              <div className="text-blue-100 text-sm mb-2">
                This secret door connects to an unexplored tile. Any treasure found behind it is DOUBLED!
              </div>
              <div className="text-blue-300 text-xs">
                You may peek into the tile before entering. Foes will be surprised if you attack.
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded font-bold"
        >
          {secretDoor.isShortcut ? 'Mark Exit' : 'Explore Secret Tile'}
        </button>
      </div>
    </div>
  );
}

export function SecretPassageModal({ passage, onClose }) {
  if (!passage) return null;

  const envNames = {
    dungeon: 'Dungeon',
    fungal_grottoes: 'Fungal Grottoes',
    caverns: 'Caverns'
  };

  return (
    <div id="secret_passage_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div id="secret_passage_modal" className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-purple-400">
        <div id="secret_passage_modal_header" className="flex justify-between items-start mb-4">
          <h2 id="secret_passage_modal_title" className="text-xl font-bold text-purple-400">
            🗺️ Secret Passage!
          </h2>
          <button
            id="secret_passage_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div id="secret_passage_modal_content" className="bg-purple-900 border border-purple-500 rounded p-4 mb-4">
          <div className="text-purple-100 font-bold mb-2">
            Passage to {envNames[passage.newEnvironment]}
          </div>
          <div className="text-purple-200 text-sm">
            You've discovered a hidden passage leading to a different environment! The dungeon architecture changes...
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2 rounded font-bold"
        >
          Enter {envNames[passage.newEnvironment]}
        </button>
      </div>
    </div>
  );
}
