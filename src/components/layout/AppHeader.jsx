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
}) {
  return (
    <header className="bg-slate-800 p-1 border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBackToCampaigns && (
            <button
              onClick={onBackToCampaigns}
              className="text-slate-400 hover:text-amber-400 p-1 transition-colors"
              title="Back to Campaigns"
              aria-label="Back to campaign manager"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-amber-400">
              Four Against Darkness
            </h1>
            {state?.name && (
              <p className="text-xs text-slate-400">{state.name}</p>
            )}
          </div>
          <h1 className="text-lg font-bold text-amber-400 sm:hidden">4AD</h1>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-400 font-bold">{state.gold}g</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{state.minorEnc}/10</span>
          <span className="text-red-400 font-bold">{state.majorFoes}M</span>
          <span className="text-blue-400">{state.clues}C</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShowRules}
            className="text-slate-400 hover:text-amber-400 p-1"
            title="Rules"
          >
            <Book size={18} />
          </button>
          <button
            onClick={onShowDungeonFeatures}
            className="text-slate-400 hover:text-amber-400 p-1"
            title="Features"
          >
            <DoorOpen size={18} />
          </button>
          <button
            onClick={onShowEquipment}
            className="text-orange-400 hover:text-orange-300 p-1"
            title="Equipment"
          >
            <Package size={18} />
          </button>
          <button
            onClick={onShowAbilities}
            className="text-purple-400 hover:text-purple-300 p-1"
            title="Abilities"
          >
            <Zap size={18} />
          </button>
          <button
            onClick={onShowCampaign}
            className="text-indigo-400 hover:text-indigo-300 p-1"
            title="Campaign"
          >
            <Trophy size={18} />
          </button>
          <button
            onClick={onShowSettings}
            className="text-slate-400 hover:text-amber-400 p-1"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
