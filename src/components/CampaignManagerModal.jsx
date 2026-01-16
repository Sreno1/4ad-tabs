import React from 'react';
import { Trophy, ArrowRight, CheckCircle, XCircle, RotateCcw, X } from 'lucide-react';

export default function CampaignManagerModal({ isOpen, onClose, state, dispatch }) {
  if (!isOpen) return null;

  const { mode, campaign, party, finalBoss, bossRoom } = state;

  const canCompleteAdventure = finalBoss || (bossRoom && bossRoom.entered);
  const adventureInProgress = party.length > 0;

  const handleCompleteAdventure = (success) => {
    if (!adventureInProgress) return;

    dispatch({
      type: 'END_ADVENTURE',
      payload: {
        success,
        bossDefeated: finalBoss,
        goldEarned: state.gold - (campaign.gold || 0), // Gold earned this adventure
        minorDefeated: state.minorEnc,
        majorDefeated: state.majorFoes
      }
    });

    // Show completion message
    const msg = success 
      ? '🎉 Adventure Complete! Stats saved to campaign.'
  : 'Adventure Failed. Better luck next time.';
    dispatch({ type: 'LOG', t: msg });
  };

  const handleNewAdventure = () => {
    dispatch({ type: 'NEW_ADVENTURE' });
    dispatch({ type: 'LOG', t: '🗺️ New adventure begins! Party and resources carried over.' });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-title"
    >
      <div
        className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Trophy className="text-purple-400" size={24} aria-hidden="true" />
            <h2 id="campaign-title" className="text-lg font-bold text-purple-400">Campaign Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close campaign manager"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Campaign Progress */}
          <div className="rounded-lg p-4 border bg-purple-900/20 border-purple-500/30">
            <h3 className="font-bold mb-3">Campaign Progress</h3>
            
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="text-slate-400">Adventures</div>
                <div className="text-lg font-bold text-blue-400">{campaign?.adventuresCompleted || 0}</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="text-slate-400">Bosses</div>
                <div className="text-lg font-bold text-red-400">{campaign?.totalBossesDefeated || 0}</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="text-slate-400">Gold</div>
                <div className="text-lg font-bold text-yellow-400">{state.gold || 0}</div>
              </div>
            </div>
          </div>

          {/* Current Adventure Status */}
          {adventureInProgress && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="font-bold mb-3">Current Adventure</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Minor Encounters</span>
                  <span className="font-bold">{state.minorEnc}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Major Foes Defeated</span>
                  <span className="font-bold text-red-400">{state.majorFoes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Clues Found</span>
                  <span className="font-bold text-blue-400">{state.clues}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Boss Status</span>
                  <span className={`font-bold ${finalBoss ? 'text-green-400' : 'text-slate-500'}`}>
                    {finalBoss ? '✓ Defeated' : '○ Active'}
                  </span>
                </div>
              </div>

              {/* Complete Adventure Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleCompleteAdventure(true)}
                  disabled={!canCompleteAdventure}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  title={!canCompleteAdventure ? 'Defeat the boss to complete adventure' : ''}
                >
                  <CheckCircle size={18} />
                  Complete Adventure (Victory)
                </button>
                
                <button
                  onClick={() => handleCompleteAdventure(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle size={18} />
                  End Adventure (Defeat)
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-3 text-center">
                Completing an adventure saves stats and allows starting a new dungeon
              </p>
            </div>
          )}

          {/* Start New Adventure */}
          {mode === 'campaign' && !adventureInProgress && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="font-bold mb-3">Ready for Next Adventure</h3>
              
              <button
                onClick={handleNewAdventure}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRight size={18} />
                Start New Adventure
              </button>
              
              <p className="text-xs text-slate-400 mt-3">
                Your party and resources will carry over to the new dungeon
              </p>
            </div>
          )}          {/* Campaign Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="font-bold mb-2">About Your Campaign</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Party members, levels, and equipment persist between adventures</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Gold and clues accumulate across multiple dungeons</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Stats are tracked for each hero and the overall campaign</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Complete adventures to earn rewards and build your party's legend</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Each new dungeon resets: map, encounters, and adventure-specific abilities</span>
              </li>
            </ul>
          </div>

          {/* Reset Campaign */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-xs text-slate-400 mb-3">
              Reset everything: party, gold, stats, and all progress will be lost
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure? This will delete all campaign progress!')) {
                  dispatch({ type: 'RESET_CAMPAIGN' });
                  dispatch({ type: 'LOG', t: '🔄 Campaign reset. Starting fresh.' });
                  onClose();
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={18} />
              Reset Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
