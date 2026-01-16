/**
 * Search Modal Component
 * Displays search results and choices when player searches a tile
 */

import React from 'react';

export function SearchModal({ searchResult, onChoice, onClose, state }) {
  if (!searchResult) return null;

  const { type, message, choices, roll, total } = searchResult;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-amber-400">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-400">🔍 Search Results</h2>
            <div className="text-sm text-slate-400 mt-1">
              Roll: {roll} {total !== roll && `(${total} total)`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="mb-4 text-white">
          {message}
        </div>

        {/* Wandering Monsters */}
        {type === 'wandering_monsters' && (
          <div className="bg-red-900 border border-red-500 rounded p-4 mb-4">
            <div className="text-red-200 font-bold mb-2">⚠️ Wandering Monsters Attack!</div>
            <div className="text-red-100 text-sm mb-3">
              Your search made noise and attracted monsters. Roll on the Wandering Monsters table!
            </div>
            <button
              onClick={onClose}
              className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded font-bold"
            >
              Roll Wandering Monsters
            </button>
          </div>
        )}

        {/* Nothing Found */}
        {type === 'nothing' && (
          <div className="bg-slate-700 border border-slate-500 rounded p-4 mb-4">
            <div className="text-slate-300 text-center">
              The tile appears empty. Nothing of interest here.
            </div>
            <button
              onClick={onClose}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded"
            >
              Continue
            </button>
          </div>
        )}

        {/* Found Something - Show Choices */}
        {type === 'found_something' && choices && (
          <div className="space-y-2">
            <div className="text-amber-300 font-bold mb-3">
              Choose what you discovered:
            </div>

            {choices.map((choice) => (
              <button
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
            <div className="mt-4 pt-4 border-t border-slate-600">
              <div className="text-xs text-slate-400">
                Current Clues: <span className="text-amber-400 font-bold">{state.clues}</span>
                {state.clues >= 3 && (
                  <span className="text-green-400 ml-2">
                    (Can reveal a secret!)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HiddenTreasureModal({ treasure, complication, onResolve, onClose, state }) {
  if (!treasure) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-yellow-400">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-yellow-400">💰 Hidden Treasure!</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Treasure Amount */}
        <div className="bg-yellow-900 border border-yellow-600 rounded p-4 mb-4">
          <div className="text-yellow-100 text-center">
            <div className="text-2xl font-bold mb-2">
              {treasure.gold} GP
            </div>
            <div className="text-sm text-yellow-300">
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
          <button
            onClick={onClose}
            className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded font-bold"
          >
            Take Treasure & Continue
          </button>
        )}
      </div>
    </div>
  );
}

export function SecretDoorModal({ secretDoor, onClose }) {
  if (!secretDoor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-blue-400">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-blue-400">
            🚪 Secret Door Discovered!
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className={`border rounded p-4 mb-4 ${
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4 border-2 border-purple-400">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-purple-400">
            🗺️ Secret Passage!
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="bg-purple-900 border border-purple-500 rounded p-4 mb-4">
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
