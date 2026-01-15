import React from 'react';
import { Trophy, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function CampaignManager({ state, dispatch }) {
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
    });    // Show completion message
    const msg = success 
      ? '🎉 Adventure Complete! Stats saved to campaign.'
  : 'Adventure Failed. Better luck next time.';
    dispatch({ type: 'LOG', t: msg });
  };
  const handleNewAdventure = () => {
    dispatch({ type: 'NEW_ADVENTURE' });
    dispatch({ type: 'LOG', t: '🗺️ New adventure begins! Party and resources carried over.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-purple-400" size={24} />
        <h2 className="text-xl font-bold">Campaign Manager</h2>
      </div>

      {/* Campaign Mode Status */}
      <div className={`rounded-lg p-4 border ${
        mode === 'campaign' 
          ? 'bg-purple-900/20 border-purple-500/30' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Campaign Mode</h3>
          <div className={`text-sm px-3 py-1 rounded ${
            mode === 'campaign' 
              ? 'bg-purple-500/20 text-purple-300' 
              : 'bg-slate-700 text-slate-400'
          }`}>
            {mode === 'campaign' ? 'Active' : 'Inactive'}
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mb-3">
          {mode === 'campaign' 
            ? 'Your party, gold, equipment, and progress persist between adventures.'
            : 'Enable Campaign Mode in Settings to track stats and carry progress between adventures.'
          }
        </p>

        {mode === 'campaign' && (
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-900/50 p-2 rounded">
              <div className="text-slate-400">Adventures</div>
              <div className="text-lg font-bold text-blue-400">{campaign.adventuresCompleted || 0}</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded">
              <div className="text-slate-400">Bosses</div>
              <div className="text-lg font-bold text-red-400">{campaign.totalBossesDefeated || 0}</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded">
              <div className="text-slate-400">Gold</div>
              <div className="text-lg font-bold text-yellow-400">{campaign.gold || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Current Adventure Status */}
      {mode === 'campaign' && adventureInProgress && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
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
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
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
      )}

      {/* Campaign Info */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="font-bold mb-2">How Campaign Mode Works</h3>
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
      {mode === 'campaign' && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-xs text-slate-400 mb-3">
            Reset campaign will clear all progress, stats, and return to single-adventure mode
          </p>
          <button            onClick={() => {
              if (confirm('Are you sure? This will delete all campaign progress!')) {
                dispatch({ type: 'RESET_CAMPAIGN' });
                dispatch({ type: 'LOG', t: '🔄 Campaign reset. Starting fresh.' });
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={18} />
            Reset Campaign
          </button>
        </div>
      )}
    </div>
  );
}
