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
import FloatingDice from '../FloatingDice.jsx';

export default function AppHeader({
  state,
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
}) {
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

        {/* Stats */}
        <div id="app_header_stats" className="flex items-center gap-2 text-xs">
          <Tooltip text="Gold collected">
            <span className="text-amber-400 font-bold">{state.gold}g</span>
          </Tooltip>
          <span className="text-slate-500">|</span>
          <Tooltip text="Minor encounters encountered">
            <span className="text-slate-400">{state.minorEnc}/10</span>
          </Tooltip>
          <Tooltip text="Major foes encountered">
            <span className="text-red-400 font-bold">{state.majorFoes}M</span>
          </Tooltip>
        </div>

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
          <FloatingDice inline={true} />
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
