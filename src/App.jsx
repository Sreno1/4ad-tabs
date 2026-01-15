import React, { useState } from 'react';

// Components
import Party from './components/Party.jsx';
import Dungeon from './components/Dungeon.jsx';
import Combat from './components/Combat.jsx';
import Analytics from './components/Analytics.jsx';
import Log from './components/Log.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import RulesReference from './components/RulesReference.jsx';
import SaveLoadModal from './components/SaveLoadModal.jsx';
import DungeonFeaturesModal from './components/DungeonFeaturesModal.jsx';
import CampaignManagerModal from './components/CampaignManagerModal.jsx';
import Equipment from './components/Equipment.jsx';
import Abilities from './components/Abilities.jsx';
import ActionPane from './components/ActionPane.jsx';

// Layout Components
import AppHeader from './components/layout/AppHeader.jsx';
import MobileNavigation from './components/layout/MobileNavigation.jsx';
import DesktopSidebar from './components/layout/DesktopSidebar.jsx';
import LogBar from './components/layout/LogBar.jsx';

// Hooks
import { useGameState } from './hooks/useGameState.js';
import { useCombatFlow } from './hooks/useCombatFlow.js';
import { useRoomEvents } from './hooks/useRoomEvents.js';

// Constants
import { ACTION_MODES } from './constants/gameConstants.js';

export default function App() {
  const [state, dispatch] = useGameState();
  const [tab, setTab] = useState('party'); // For mobile
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showDungeonFeatures, setShowDungeonFeatures] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [selectedHero, setSelectedHero] = useState(0);
  const [logCollapsed, setLogCollapsed] = useState(true);

  // Layout state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState('party'); // 'party', 'stats', 'log', or 'rules'
  const [actionMode, setActionMode] = useState(ACTION_MODES.IDLE);

  // Custom hooks for game logic
  const combatFlow = useCombatFlow(state, dispatch);
  const roomEvents = useRoomEvents(state, dispatch, setActionMode);

  // Helper to clear tile and reset combat
  const clearTileAndCombat = () => {
    roomEvents.clearTile();
    combatFlow.resetCombat();
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <AppHeader
        state={state}
        selectedHero={selectedHero}
        onSelectHero={setSelectedHero}
        onShowRules={() => setShowRules(true)}
        onShowDungeonFeatures={() => setShowDungeonFeatures(true)}
        onShowEquipment={() => setShowEquipment(true)}
        onShowAbilities={() => setShowAbilities(true)}
        onShowCampaign={() => setShowCampaign(true)}
        onShowSaveLoad={() => setShowSaveLoad(true)}
        onShowSettings={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile: Tabbed interface */}
        <div className="md:hidden flex-1 overflow-y-auto pb-16">
          <div className="p-3">
            {tab === 'party' && <Party state={state} dispatch={dispatch} />}
            {tab === 'dungeon' && (
              <Dungeon
                state={state}
                dispatch={dispatch}
                tileResult={roomEvents.tileResult}
                generateTile={roomEvents.generateTile}
                clearTile={clearTileAndCombat}
                bossCheckResult={roomEvents.bossCheckResult}
                roomDetails={roomEvents.roomDetails}
              />
            )}
            {tab === 'combat' && (
              <Combat
                state={state}
                dispatch={dispatch}
                selectedHero={selectedHero}
                setSelectedHero={setSelectedHero}
              />
            )}
            {tab === 'analytics' && <Analytics state={state} />}
            {tab === 'log' && <Log state={state} dispatch={dispatch} />}
          </div>
        </div>

        {/* Desktop: Flexible equal-width columns layout */}
        <div className={`hidden md:flex flex-1 overflow-hidden relative ${leftPanelTab !== 'log' ? 'pb-8' : ''}`}>

          {/* Left Column - Party/Stats (Collapsible) */}
          <DesktopSidebar
            state={state}
            dispatch={dispatch}
            isOpen={leftPanelOpen}
            activeTab={leftPanelTab}
            onToggle={setLeftPanelOpen}
            onTabChange={setLeftPanelTab}
          />

          {/* Middle Column - Dungeon Map */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 border-r border-slate-700">
            <div className="flex-1 overflow-y-auto p-2">
              <Dungeon
                state={state}
                dispatch={dispatch}
                tileResult={roomEvents.tileResult}
                generateTile={roomEvents.generateTile}
                clearTile={clearTileAndCombat}
                bossCheckResult={roomEvents.bossCheckResult}
                roomDetails={roomEvents.roomDetails}
                hideGenerationUI={true}
                sidebarCollapsed={!leftPanelOpen}
              />
            </div>
          </div>

          {/* Right Column - Action Pane */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-850 min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">
                {actionMode === ACTION_MODES.COMBAT ? '⚔️ Combat' :
                 actionMode === ACTION_MODES.SPECIAL ? '✨ Special' :
                 actionMode === ACTION_MODES.TREASURE ? '💰 Treasure' :
                 actionMode === ACTION_MODES.QUEST ? '🏆 Quest' :
                 actionMode === ACTION_MODES.WEIRD ? '👾 Weird' :
                 actionMode === ACTION_MODES.EMPTY ? '📦 Empty' :
                 '🎮 Actions'}
              </span>
              {state.monsters?.length > 0 && (
                <span className="text-xs text-red-400">
                  {state.monsters.filter(m => m.hp > 0).length} active
                </span>
              )}
            </div>
            <ActionPane
              state={state}
              dispatch={dispatch}
              actionMode={actionMode}
              roomEvents={roomEvents.roomEvents}
              tileResult={roomEvents.tileResult}
              roomDetails={roomEvents.roomDetails}
              generateTile={roomEvents.generateTile}
              clearTile={clearTileAndCombat}
              isCorridor={roomEvents.isCorridor}
              combatPhase={combatFlow.combatPhase}
              getActiveMonsters={combatFlow.getActiveMonsters}
              isCombatWon={combatFlow.isCombatWon}
              handleRollReaction={combatFlow.handleRollReaction}
              handlePartyAttacks={combatFlow.handlePartyAttacks}
              handleEndPartyTurn={combatFlow.handleEndPartyTurn}
              handleEndMonsterTurn={combatFlow.handleEndMonsterTurn}
              handleEndCombat={combatFlow.handleEndCombat}
              setCombatPhase={combatFlow.setCombatPhase}
              setRoomEvents={roomEvents.setRoomEvents}
              setShowDungeonFeatures={setShowDungeonFeatures}
            />
          </div>

          {/* Log Bar - Hidden when log tab is open in sidebar */}
          {leftPanelTab !== 'log' && (
            <LogBar
              state={state}
              dispatch={dispatch}
              collapsed={logCollapsed}
              onToggle={() => setLogCollapsed(!logCollapsed)}
            />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={tab} onTabChange={setTab} />

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} state={state} dispatch={dispatch} />
      <RulesReference isOpen={showRules} onClose={() => setShowRules(false)} />
      <SaveLoadModal isOpen={showSaveLoad} onClose={() => setShowSaveLoad(false)} state={state} dispatch={dispatch} />
      <DungeonFeaturesModal isOpen={showDungeonFeatures} onClose={() => setShowDungeonFeatures(false)} state={state} dispatch={dispatch} selectedHero={selectedHero} />
      <CampaignManagerModal isOpen={showCampaign} onClose={() => setShowCampaign(false)} state={state} dispatch={dispatch} />
      <Equipment isOpen={showEquipment} state={state} dispatch={dispatch} onClose={() => setShowEquipment(false)} />
      <Abilities isOpen={showAbilities} state={state} dispatch={dispatch} onClose={() => setShowAbilities(false)} />
    </div>
  );
}
