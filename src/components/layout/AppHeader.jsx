import React from "react";
import {
  Book,
  DoorOpen,
  Settings,
  Trophy,
  Package,
  Zap,
  ArrowLeft,
} from "lucide-react";
import LanternAnimation from '../LanternAnimation.jsx';
import { Tooltip } from '../RulesReference.jsx';
import DungeonHeaderButtons from '../DungeonHeaderButtons.jsx';
import { adjustGold, adjustMajorFoes, adjustMinorEncounters, logMessage } from '../../state/actionCreators.js';
import sfx from '../../utils/sfx.js';
import { ENVIRONMENTS, normalizeEnvironment } from '../../constants/environmentConstants.js';

export default function AppHeader({
  state,
  dispatch,
  selectedHero,
  onSelectHero,
  onShowRules,
  onShowDungeonFeatures,
  onShowEquipment,
  onShowAbilities,
  onShowCampaign,
  onShowSettings,
  onBackToCampaigns,
  hasLightSource,
  partyLightNames = [],
  onShowLantern,
  activeView = 'map',
  onViewChange,
  mapActions = {},
}) {
  const handleEnvironmentChange = (value) => {
    const envKey = normalizeEnvironment(value);
    dispatch({ type: 'CHANGE_ENVIRONMENT', environment: envKey });
    dispatch(logMessage(` Environment set to ${ENVIRONMENTS.find(env => env.id === envKey)?.label || 'Dungeon'}.`, 'exploration'));
  };

  const viewOptions = [
    { key: 'map', label: 'Map', title: 'Dungeon map' },
    { key: 'log', label: 'Log', title: 'Adventure log' },
    { key: 'firstPerson', label: 'FP', title: 'First-person view' }
  ];

  return (
    <header id="app_header" className="bg-slate-800 p-1 border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div id="app_header_title" className="flex items-center gap-2">
          {onBackToCampaigns && (
            <Tooltip text="Back to Campaigns">
              <button
                onClick={onBackToCampaigns}
                className="text-slate-400 hover:text-amber-400 p-1 transition-colors"
                aria-label="Back to campaign manager"
              >
                <ArrowLeft size={20} />
              </button>
            </Tooltip>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-amber-400">
              Four Against Darkness
            </h1>
            {/* Prefer campaign name if present, fallback to legacy state.name */}
            {((state && state.campaign && state.campaign.campaignName) || state?.name) && (
              <p className="text-xs text-slate-400">{state.campaign?.campaignName || state.name}</p>
            )}
          </div>
          <h1 className="text-lg font-bold text-amber-400 sm:hidden">4AD</h1>
        </div>

        {/* Stats with manual controls */}
        <div id="app_header_stats" className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
            <span className="text-slate-400 text-xs">Gold</span>
            <span id="header_gold_value" className="text-amber-400 font-bold">{state.gold}</span>
            <div className="flex gap-1">
              <button aria-label="Decrease gold" onClick={() => { try { sfx.play('select5', { volume: 0.85 }); } catch(e){}; dispatch(adjustGold(-1)); }} className="px-1 text-slate-300">−</button>
              <button aria-label="Increase gold" onClick={() => { try { sfx.play('pickup4', { volume: 0.9 }); } catch(e){}; dispatch(adjustGold(1)); }} className="px-1 text-amber-400 font-bold">+</button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
            <span className="text-slate-400 text-xs">Minion Groups</span>
            <span id="header_minion_value" className="text-slate-400 font-bold">{state.minorEnc}</span>
            <div className="flex gap-1">
              <button aria-label="Decrease minion groups" onClick={() => dispatch(adjustMinorEncounters(-1))} className="px-1 text-slate-300">−</button>
              <button aria-label="Increase minion groups" onClick={() => dispatch(adjustMinorEncounters(1))} className="px-1 text-amber-400 font-bold">+</button>
              {/* Debug button: quick verification that reducer/action path is active */}
              <button
                aria-label="Debug increment minion"
                title="DBG: force increment minorEnc and emit logs"
                onClick={() => {
                  try { console.log('[AppHeader] DBG dispatch adjustMinorEncounters +1'); } catch (e) {}
                  dispatch(logMessage('DBG: dispatching ADJUST_MINOR +1', 'debug'));
                  dispatch(adjustMinorEncounters(1));
                }}
                className="px-1 text-slate-300 border border-slate-600 rounded text-[10px]"
              >
                DBG
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
            <span className="text-slate-400 text-xs">Major Foes Faced</span>
            <span id="header_major_value" className="text-red-400 font-bold">{state.majorFoes}</span>
            <div className="flex gap-1">
              <button aria-label="Decrease major foes" onClick={() => dispatch(adjustMajorFoes(-1))} className="px-1 text-slate-300">−</button>
              <button aria-label="Increase major foes" onClick={() => dispatch(adjustMajorFoes(1))} className="px-1 text-red-400 font-bold">+</button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
            <span className="text-slate-400 text-xs">Env</span>
            <select
              id="header_environment_select"
              value={state.currentEnvironment || 'dungeon'}
              onChange={(e) => handleEnvironmentChange(e.target.value)}
              className="bg-slate-700 hover:bg-slate-600 text-xs rounded px-1 py-0.5"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env.id} value={env.id}>{env.label}</option>
              ))}
            </select>
          </div>
        </div>

        {onViewChange && (
          <div id="app_header_view_toggle" className="flex items-center gap-1">
            {viewOptions.map((view) => (
              <button
                key={view.key}
                onClick={() => onViewChange(view.key)}
                className={`text-xs px-2 py-1 rounded transition-colors border border-slate-700 ${
                  activeView === view.key
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
                title={view.title}
                aria-pressed={activeView === view.key}
                type="button"
              >
                {view.label}
              </button>
            ))}
          </div>
        )}

        {/* Header Actions */}
        <div id="app_header_actions" className="flex items-center gap-1">
          {/* Light source indicator */}
          <div className="flex items-center gap-2">
            {!hasLightSource && (
              <div className="text-red-400 text-xs font-semibold" aria-live="polite">-2 No Light Source</div>
            )}
            <Tooltip text={hasLightSource ? `Light: ${partyLightNames.join(', ')}` : 'No light source'}>
              <button onClick={() => { if (typeof onShowLantern === 'function') onShowLantern(); }} className="px-2">
                <LanternAnimation size={18} className={hasLightSource ? 'opacity-100' : 'opacity-30'} />
              </button>
            </Tooltip>
          </div>
          <Tooltip text="Rules">
            <button
              onClick={onShowRules}
              className="text-slate-400 hover:text-amber-400 p-1"
            >
              <Book size={18} />
            </button>
          </Tooltip>
          <Tooltip text="Features">
            <button
              onClick={onShowDungeonFeatures}
              className="text-slate-400 hover:text-amber-400 p-1"
            >
              <DoorOpen size={18} />
            </button>
          </Tooltip>
          <Tooltip text="Equipment">
            <button
              onClick={onShowEquipment}
              className="text-orange-400 hover:text-orange-300 p-1"
            >
              <Package size={18} />
            </button>
          </Tooltip>
          <Tooltip text="Abilities">
            <button
              onClick={onShowAbilities}
              className="text-purple-400 hover:text-purple-300 p-1"
            >
              <Zap size={18} />
            </button>
          </Tooltip>
          <Tooltip text="Campaign">
            <button
              onClick={onShowCampaign}
              className="text-indigo-400 hover:text-indigo-300 p-1"
            >
              <Trophy size={18} />
            </button>
          </Tooltip>
          <Tooltip text="Settings">
            <button
              onClick={onShowSettings}
              className="text-slate-400 hover:text-amber-400 p-1"
            >
              <Settings size={18} />
            </button>
          </Tooltip>
          {/* Room Designer button moved to the dungeon pane header */}
        </div>
      </div>
    </header>
  );
}
