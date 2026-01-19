import React, { useState } from 'react';
import { X, Archive, Palette, Dices } from 'lucide-react';
import { useTheme, THEMES } from '../contexts/ThemeContext.jsx';
import { useDiceTheme, DICE_COLORS, DICE_THEMES } from '../contexts/DiceContext.jsx';

// Map theme IDs to their texture files
const getThemeTexture = (themeId) => {
  const basePath = '/assets/dice-box/assets/themes';
  const textureMap = {
    'default': 'diffuse-dark.png',
    'smooth': 'diffuse-dark.png',
    'smooth-pip': 'pips-dark.png',
    'rock': 'diffuse-dark.png',
    'rust': 'diffuse-dark.png',
    'wooden': 'diffuse.jpg',
    'gemstone': 'gemstone-dark.png',
    'gemstoneMarble': 'diffuse.jpg',
    'blueGreenMetal': 'diffuse.jpg',
    'diceOfRolling': 'diffuse.jpg',
  };
  return `${basePath}/${themeId}/${textureMap[themeId] || 'diffuse-dark.png'}`;
};

// Themes that support color tinting (others have baked-in colors)
const TINTABLE_THEMES = ['default', 'smooth', 'smooth-pip', 'gemstone'];

// Dice Preview Component with color tinting
function DicePreview({ themeId, colorHex }) {
  const texture = getThemeTexture(themeId);
  const isGemstone = themeId === 'gemstone' || themeId === 'gemstoneMarble';
  const supportsTint = TINTABLE_THEMES.includes(themeId);

  // Gemstone dice have a crystal/gem shape, others are cubes
  const shapeClass = isGemstone ? 'gem-shape' : 'cube-shape';

  return (
    <div className="dice-preview-wrapper">
      <div className={`dice-preview-face ${shapeClass}`}>
        <div
          className="texture-layer"
          style={{ backgroundImage: `url(${texture})` }}
        />
        {supportsTint && (
          <div
            className="color-layer"
            style={{ backgroundColor: colorHex }}
          />
        )}
      </div>
      <style>{`
        .dice-preview-wrapper {
          width: 40px;
          height: 40px;
          margin: 0 auto 4px;
          perspective: 100px;
        }
        .dice-preview-face {
          width: 100%;
          height: 100%;
          position: relative;
          transform: rotateX(-10deg) rotateY(-15deg);
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
          overflow: hidden;
        }
        .dice-preview-face:hover {
          transform: rotateX(-15deg) rotateY(-25deg);
        }
        .cube-shape {
          border-radius: 6px;
          box-shadow:
            3px 3px 0 rgba(0,0,0,0.3),
            inset -2px -2px 4px rgba(0,0,0,0.2),
            inset 2px 2px 4px rgba(255,255,255,0.1);
        }
        .gem-shape {
          border-radius: 2px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          box-shadow:
            inset -3px -3px 6px rgba(0,0,0,0.3),
            inset 3px 3px 6px rgba(255,255,255,0.4);
        }
        .texture-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }
        .color-layer {
          position: absolute;
          inset: 0;
          mix-blend-mode: multiply;
          opacity: 0.7;
        }
        .gem-shape .color-layer {
          mix-blend-mode: overlay;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, state, dispatch }) {
  const [showArchive, setShowArchive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { diceColor, setDiceColor, diceTheme, setDiceTheme } = useDiceTheme();
  
  if (!isOpen) return null;
  
  const handleArchiveLog = () => {
    dispatch({ type: 'ARCHIVE_LOG' });
  };
  
  const archiveCount = state.logArchive?.length || 0;
  const totalArchivedEntries = state.logArchive?.reduce((sum, a) => sum + a.entries.length, 0) || 0;
  
  return (
    <div
      id="settings_modal_overlay"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings_modal_title"
    >
      <div
        id="settings_modal"
        className="bg-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div id="settings_modal_header" className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 id="settings_modal_title" className="text-lg font-bold text-amber-400">️ Settings</h2>
          <button
            id="settings_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close settings"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div id="settings_modal_content" className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Theme Selection */}
          <div id="settings_theme_section" className="space-y-2">
            <h3 id="settings_theme_label" className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Palette size={14} />
              Theme
            </h3>
              <div id="settings_theme_options" className="grid grid-cols-1 gap-2" role="group" aria-labelledby="settings_theme_label">
              {Object.values(THEMES).map((t) => (
                <button
                  id={`settings_theme_${t.id}_button`}
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded border-2 text-left transition-colors ${
                    theme === t.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                  role="radio"
                  aria-checked={theme === t.id}
                >
                  <div id={`settings_theme_${t.id}_name`} className={`font-bold text-sm ${theme === t.id ? 'text-amber-400' : 'text-slate-300'}`}>
                    {t.name}
                  </div>
                  <div id={`settings_theme_${t.id}_description`} className="text-xs text-slate-500 mt-1">
                    {t.description}
                  </div>
                </button>
              ))}            </div>
            <p id="settings_theme_help" className="text-xs text-slate-500">
              {theme === 'rpgui' && ' RPGUI theme applies retro 8-bit styling.'}
              {theme === 'doodle' && '️ Doodle theme uses hand-drawn borders and playful style.'}
            </p>
          </div>

          {/* Dice Theme Selection */}
          <div id="settings_dice_theme_section" className="space-y-2">
            <h3 id="settings_dice_theme_label" className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Dices size={14} />
              Dice Theme
            </h3>
            <div id="settings_dice_theme_options" className="grid grid-cols-3 gap-2" role="group" aria-labelledby="settings_dice_theme_label">
              {Object.values(DICE_THEMES).map((dt) => (
                <button
                  id={`settings_dice_theme_${dt.id}_button`}
                  key={dt.id}
                  onClick={() => setDiceTheme(dt.id)}
                  className={`p-3 rounded border-2 transition-colors text-center ${
                    diceTheme === dt.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                  role="radio"
                  aria-checked={diceTheme === dt.id}
                  title={dt.description}
                >
                  <DicePreview themeId={dt.id} colorHex={DICE_COLORS[diceColor]?.color || '#f59e0b'} />
                  <span id={`settings_dice_theme_${dt.id}_name`} className={`text-xs font-medium ${diceTheme === dt.id ? 'text-amber-400' : 'text-slate-400'}`}>
                    {dt.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dice Color Selection */}
          <div id="settings_dice_color_section" className="space-y-2">
            <h3 id="settings_dice_color_label" className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Dice Color
            </h3>
            <div id="settings_dice_color_options" className="grid grid-cols-4 gap-2" role="group" aria-labelledby="settings_dice_color_label">
              {Object.values(DICE_COLORS).map((dc) => (
                <button
                  id={`settings_dice_color_${dc.id}_button`}
                  key={dc.id}
                  onClick={() => setDiceColor(dc.id)}
                  className={`p-2 rounded border-2 transition-colors flex flex-col items-center ${
                    diceColor === dc.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                  role="radio"
                  aria-checked={diceColor === dc.id}
                  title={dc.name}
                >
                  <div
                    id={`settings_dice_color_${dc.id}_swatch`}
                    className="w-6 h-6 rounded shadow-md mb-1"
                    style={{ backgroundColor: dc.color }}
                  />
                  <span id={`settings_dice_color_${dc.id}_name`} className={`text-xs ${diceColor === dc.id ? 'text-amber-400' : 'text-slate-400'}`}>
                    {dc.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Log Management */}
          <div id="settings_log_management_section" className="space-y-2">
            <h3 id="settings_log_management_label" className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Log Management
            </h3>

            <div id="settings_log_actions" className="flex gap-2">
              <button
                id="settings_log_archive_button"
                onClick={handleArchiveLog}
                disabled={state.log.length === 0}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-3 py-2 rounded flex items-center gap-2 justify-center text-sm"
              >
                <Archive size={14} />
                Archive & Clear Log
              </button>
            </div>
            <p id="settings_log_current_count" className="text-xs text-slate-500">
              Current log: {state.log.length} entries
            </p>

            {/* Archive Summary */}
            <div id="settings_log_archive_summary" className="bg-slate-900 rounded p-2">
              <button
                id="settings_log_archive_toggle_button"
                onClick={() => setShowArchive(!showArchive)}
                className="w-full flex justify-between items-center text-xs"
                aria-expanded={showArchive}
                aria-controls="settings_log_archive_list"
              >
                <span id="settings_log_archive_count" className="text-slate-400">
                   Archived: {archiveCount} logs ({totalArchivedEntries} entries)
                </span>
                <span className="text-slate-500">{showArchive ? '▼' : ''}</span>
              </button>

              {showArchive && state.logArchive && state.logArchive.length > 0 && (
                <div id="settings_log_archive_list" className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {state.logArchive.map((archive, idx) => (
                    <div id={`settings_log_archive_item_${idx}`} key={archive.id} className="bg-slate-800 rounded p-2 text-xs">
                      <div id={`settings_log_archive_item_${idx}_name`} className="text-amber-400 font-bold">{archive.adventureName}</div>
                      <div id={`settings_log_archive_item_${idx}_info`} className="text-slate-500">
                        {new Date(archive.timestamp).toLocaleDateString()} · {archive.entries.length} entries
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showArchive && (!state.logArchive || state.logArchive.length === 0) && (
                <div id="settings_log_archive_empty" className="mt-2 text-xs text-slate-500 text-center py-2">
                  No archived logs yet
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign Stats */}
          <div id="settings_campaign_stats_section" className="space-y-2">
            <h3 id="settings_campaign_stats_label" className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Campaign Stats
            </h3>
            <div id="settings_campaign_stats_display" className="bg-slate-900 rounded p-3 text-xs space-y-1">
              <div id="settings_stats_party_members" className="flex justify-between">
                <span className="text-slate-400">Party Members:</span>
                <span className="text-amber-400">{state.party.length}/4</span>
              </div>
              <div id="settings_stats_total_gold" className="flex justify-between">
                <span className="text-slate-400">Total Gold:</span>
                <span className="text-amber-400">{state.gold}</span>
              </div>
              <div id="settings_stats_clues" className="flex justify-between">
                <span className="text-slate-400">Total Clues Discovered:</span>
                <span className="text-blue-400">
                  {state.party && state.party.length > 0
                    ? state.party.reduce((total, hero) => total + (hero.clues || 0), 0)
                    : 0}
                </span>
              </div>
              <div id="settings_stats_minor_encounters" className="flex justify-between">
                <span className="text-slate-400">Minor Encounters:</span>
                <span className="text-slate-300">{state.minorEnc}</span>
              </div>
              <div id="settings_stats_major_foes" className="flex justify-between">
                <span className="text-slate-400">Major Foes Defeated:</span>
                <span className="text-red-400">{state.majorFoes}</span>
              </div>
              <div id="settings_stats_boss" className="flex justify-between">
                <span className="text-slate-400">Boss Defeated:</span>
                <span id="settings_stats_boss_value" className={state.finalBoss ? 'text-green-400' : 'text-slate-500'}>
                  {state.finalBoss ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            {/* Keyboard Shortcuts Legend */}
            <div id="settings_keyboard_shortcuts_section" className="mt-6 p-3 border-t border-slate-700 text-xs text-slate-400">
              <div id="settings_keyboard_shortcuts_title" className="font-bold text-amber-300 mb-2">Keyboard Shortcuts</div>
              <div id="settings_keyboard_shortcuts_list" className="grid grid-cols-2 gap-2">
                <div><span className="font-mono">Esc</span>: Close modals</div>
                <div><span className="font-mono">Ctrl/Cmd+D</span>: Dice roller</div>
                <div><span className="font-mono">p</span>: Party tab</div>
                <div><span className="font-mono">`</span>: Story tab</div>
                <div><span className="font-mono">o</span>: Stats tab</div>
                <div><span className="font-mono">r</span>: Rules modal (toggle)</div>
                <div><span className="font-mono">c</span>: Campaign modal (toggle)</div>
                <div><span className="font-mono">u</span>: Abilities modal (toggle)</div>
                <div><span className="font-mono">i</span>: Equipment modal (toggle)</div>
                <div><span className="font-mono">f</span>: Features modal (toggle)</div>
                <div><span className="font-mono">w/a/s/d</span>: Place door (hover tile)</div>
                <div><span className="font-mono">Tab</span>: Cycle combat actions</div>
                <div><span className="font-mono">Space</span>: Roll <span className="font-bold text-amber-400">d6</span> (single tap), <span className="font-bold text-amber-400">2d6</span> (double tap)</div>
                <div><span className="font-mono">Enter</span>: Confirm/activate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
