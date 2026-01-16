import React, { useState } from "react";

// Components
import Party from "./components/Party.jsx";
import Dungeon from "./components/Dungeon.jsx";
import Log from "./components/Log.jsx";
import Combat from "./components/Combat.jsx";
import Analytics from "./components/Analytics.jsx";
// Log is displayed only in the bottom LogBar; not in the Story sidebar
import SettingsModal from "./components/SettingsModal.jsx";
import RulesReference from "./components/RulesReference.jsx";

import DungeonFeaturesModal from "./components/DungeonFeaturesModal.jsx";
import CampaignManagerModal from "./components/CampaignManagerModal.jsx";
import CampaignManager from "./components/CampaignManager.jsx";
import OnboardingScreen from "./components/OnboardingScreen.jsx";
import Equipment from "./components/Equipment.jsx";
import Abilities from "./components/Abilities.jsx";
import ActionPane from "./components/ActionPane.jsx";
import FloatingDice from "./components/FloatingDice.jsx";
import RoomDesigner from "./components/RoomDesigner.jsx";

// Layout Components
import AppHeader from "./components/layout/AppHeader.jsx";
import MobileNavigation from "./components/layout/MobileNavigation.jsx";
import DesktopSidebar from "./components/layout/DesktopSidebar.jsx";
import LogBar from "./components/layout/LogBar.jsx";

// Hooks
import { useGameState } from "./hooks/useGameState.js";
import { useCombatFlow } from "./hooks/useCombatFlow.js";
import { useRoomEvents } from "./hooks/useRoomEvents.js";

// Constants
import { ACTION_MODES } from "./constants/gameConstants.js";

// Campaign utilities
import {
  createCampaign,
  setActiveCampaign,
  clearActiveCampaign,
} from "./utils/campaignStorage.js";
import { initialState } from "./state/initialState.js";

export default function App() {
  const [state, dispatch, campaignControls] = useGameState();
  const { currentCampaignId, setCurrentCampaignId } = campaignControls;
  const [tab, setTab] = useState("party"); // For mobile
  const [showCampaignManager, setShowCampaignManager] =
    useState(!currentCampaignId);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [showDungeonFeatures, setShowDungeonFeatures] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  const [placementTemplate, setPlacementTemplate] = useState(null);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [selectedHero, setSelectedHero] = useState(0);
  const [logCollapsed, setLogCollapsed] = useState(true);

  // Layout state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState("party"); // 'party', 'stats', 'story', or 'rules'
  const [showLogMiddle, setShowLogMiddle] = useState(false);
  // When the bottom log expands we want the sidebar to visually contract
  // (like the dungeon pane) but not change the logical `leftPanelOpen` state.
  const [leftPanelContracted, setLeftPanelContracted] = useState(false);
  // Do not auto-contract the left panel when the log expands.
  // Contracting is controlled only by the user's explicit close action.
  React.useEffect(() => {
    setLeftPanelContracted(false);
  }, []);
  // ...existing code...

    // Keyboard shortcuts and focus management
    React.useEffect(() => {
      const handleKeyboard = (e) => {
        // If the user is typing in a form control, don't trigger global hotkeys
        const active = document.activeElement;
        if (active) {
          const tag = active.tagName?.toLowerCase();
          const isEditable = active.isContentEditable;
          if (
            tag === 'input' ||
            tag === 'textarea' ||
            tag === 'select' ||
            isEditable ||
            active.getAttribute('role') === 'textbox'
          ) {
            return;
          }
        }
        // Escape closes all modals
        if (e.key === "Escape") {
          setShowSettings(false);
          setShowRules(false);
          setShowDungeonFeatures(false);
          setShowCampaign(false);
          setShowEquipment(false);
          setShowAbilities(false);
          // Add more modal closes as needed
        }

        // Ctrl/Cmd + D for dice roller
        if ((e.ctrlKey || e.metaKey) && e.key === "d") {
          e.preventDefault();
          // Focus dice roller (FloatingDice)
          const dice = document.querySelector('[data-focus="dice"]');
          dice?.focus();
        }

        // Tab through combat actions (ActionPane)
        if (e.key === "Tab") {
          // Custom tab navigation for combat actions
          // Could set focus to next action button
          // Implement as needed in ActionPane
        }


        // Spacebar: wait up to 0.5s for double-tap before rolling
        if (e.key === " " && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (!window._spacebarState) window._spacebarState = { count: 0, timer: null };
          window._spacebarState.count++;
          if (window._spacebarState.count === 1) {
            window._spacebarState.timer = setTimeout(() => {
              // Single tap: roll d6
              const diceButton = document.querySelector('[data-dice-roll="d6"]');
              if (diceButton) diceButton.click();
              window._spacebarState.count = 0;
              window._spacebarState.timer = null;
            }, 500);
          } else if (window._spacebarState.count === 2) {
            // Double tap: roll 2d6
            if (window._spacebarState.timer) clearTimeout(window._spacebarState.timer);
            const diceButton = document.querySelector('[data-dice-roll="2d6"]');
            if (diceButton) diceButton.click();
            window._spacebarState.count = 0;
            window._spacebarState.timer = null;
          }
        }

        // Enter to confirm (optional: keep if you want modal/dialog confirm)
        if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
          const active = document.activeElement;
          if (active?.tagName === "BUTTON" && !active.disabled) {
            active.click();
          }
        }

        // p for party tab (mobile/desktop)
        if (e.key === "p" && !e.ctrlKey && !e.metaKey) {
          setTab("party");
          setLeftPanelTab("party");
          if (showSettings) setShowSettings(false);
        }
  // ` for story tab
        if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
          setTab("story");
          setLeftPanelTab("story");
          if (showSettings) setShowSettings(false);
        }
        // o for stats tab
        if (e.key === "o" && !e.ctrlKey && !e.metaKey) {
          setTab("stats");
          setLeftPanelTab("stats");
          if (showSettings) setShowSettings(false);
        }
        // r for rules modal
        if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
          setShowRules((prev) => !prev);
        }
        // esc for settings modal (when nothing else open)
        if (e.key === "Escape" && !showSettings && !showRules && !showDungeonFeatures && !showCampaign && !showEquipment && !showAbilities) {
          setShowSettings(true);
        }
        // c for campaign modal
        if (e.key === "c" && !e.ctrlKey && !e.metaKey) {
          setShowCampaign((prev) => !prev);
        }
        // u for abilities modal
        if (e.key === "u" && !e.ctrlKey && !e.metaKey) {
          setShowAbilities((prev) => !prev);
        }
        // i for equipment modal
        if (e.key === "i" && !e.ctrlKey && !e.metaKey) {
          setShowEquipment((prev) => !prev);
        }
        // f for features modal
        if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
          setShowDungeonFeatures((prev) => !prev);
        }
        // w, s, a, d for door placement (while hovering dungeon tile)
        // This requires Dungeon component to expose a handler for door placement
        // Could dispatch a custom event or call a prop if available
        // Example:
        // if (["w","a","s","d"].includes(e.key) && document.activeElement?.dataset?.tileHover) {
        //   // Call dungeon door placement logic
        // }
      };
      window.addEventListener("keydown", handleKeyboard);
      return () => window.removeEventListener("keydown", handleKeyboard);
    }, [setShowSettings, setShowRules, setShowDungeonFeatures, setShowCampaign, setShowEquipment, setShowAbilities, setTab, setLeftPanelTab, showSettings, showRules, showDungeonFeatures, showCampaign, showEquipment, showAbilities]);
  const [actionMode, setActionMode] = useState(ACTION_MODES.IDLE);

  // Custom hooks for game logic
  const combatFlow = useCombatFlow(state, dispatch);
  const roomEvents = useRoomEvents(state, dispatch, setActionMode);

  // Helper to clear tile and reset combat
  const clearTileAndCombat = () => {
    roomEvents.clearTile();
    combatFlow.resetCombat();
  };

  // Handler for loading an existing campaign
  const handleLoadCampaign = (campaignId) => {
    setActiveCampaign(campaignId);
    setCurrentCampaignId(campaignId);
    setShowCampaignManager(false);
    window.location.reload(); // Reload to load campaign state
  };

  // Handler for starting new campaign creation
  const handleNewCampaign = () => {
    setShowCampaignManager(false);
    setShowOnboarding(true);
  };

  // Handler for completing onboarding
  const handleOnboardingComplete = ({ campaignName, party, gold }) => {
    const newCampaignId = createCampaign(campaignName, {
      ...initialState,
      party,
      gold,
      name: campaignName,
      marchingOrder: [0, 1, 2, 3], // Hero 1 in pos 0, Hero 2 in pos 1, etc.
    });
    setActiveCampaign(newCampaignId);
    setCurrentCampaignId(newCampaignId);
    setShowOnboarding(false);
    window.location.reload(); // Reload to load new campaign state
  };

  // Handler for returning to campaign manager
  const handleBackToCampaigns = () => {
    clearActiveCampaign();
    setShowCampaignManager(true);
  };

  // Show campaign manager if no active campaign
  if (showCampaignManager) {
    return (
      <CampaignManager
        onLoadCampaign={handleLoadCampaign}
        onNewCampaign={handleNewCampaign}
      />
    );
  }

  // Show onboarding screen when creating new campaign
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

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
  onShowSettings={() => setShowSettings(true)}
        onBackToCampaigns={handleBackToCampaigns}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile: Tabbed interface */}
        <div className="md:hidden flex-1 overflow-y-auto pb-16">
          <div className="p-3">
            {tab === "party" && (
              <Party
                state={state}
                dispatch={dispatch}
                selectedHero={selectedHero}
                onSelectHero={setSelectedHero}
              />
            )}
            {tab === "dungeon" && (
              <Dungeon
                state={state}
                dispatch={dispatch}
                tileResult={roomEvents.tileResult}
                generateTile={roomEvents.generateTile}
                clearTile={clearTileAndCombat}
                bossCheckResult={roomEvents.bossCheckResult}
                roomDetails={roomEvents.roomDetails}
                autoPlacedRoom={roomEvents.autoPlacedRoom}
                setAutoPlacedRoom={roomEvents.setAutoPlacedRoom}
                onShowRoomDesigner={() => setShowRoomDesigner(true)}
              />
            )}
            {tab === "combat" && (
              <Combat
                state={state}
                dispatch={dispatch}
                selectedHero={selectedHero}
                setSelectedHero={setSelectedHero}
              />
            )}
            {tab === "analytics" && <Analytics state={state} />}
            {tab === "story" && (
              <div className="space-y-3">
                <StoryLog state={state} dispatch={dispatch} />
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Grid layout so the bottom LogBar spans only the left + middle columns */}
        <div className="hidden md:block flex-1 overflow-hidden" style={{ height: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 340px',
              /* Use minmax(0, 1fr) so flex children can shrink/grow inside the grid cell */
              gridTemplateRows: 'minmax(0, 1fr) auto',
              height: '100%',
            }}
          >
            {/* Left Column - Sidebar (col 1) */}
            <div
              style={{
                gridColumn: '1 / 2',
                gridRow: '1 / 2',
                // shrink when user explicitly closes sidebar OR when log forces visual contraction
                width: (!leftPanelOpen || leftPanelContracted) ? '3rem' : '35rem',
                minWidth: '3rem',
                overflow: 'hidden',
                transition: 'width 200ms ease',
              }}
              className="min-w-0"
            >
              <DesktopSidebar
                state={state}
                dispatch={dispatch}
                isOpen={leftPanelOpen}
                contracted={leftPanelContracted}
                activeTab={leftPanelTab}
                onToggle={setLeftPanelOpen}
                onTabChange={setLeftPanelTab}
                selectedHero={selectedHero}
                onSelectHero={setSelectedHero}
              />
            </div>

            {/* Middle Column - Dungeon Map or Full Log (col 2) */}
            <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }} className="flex flex-col min-w-0 border-l border-slate-700">
              <div className="flex-1 overflow-y-auto p-2">
                {!showLogMiddle ? (
                  <Dungeon
                    state={state}
                    dispatch={dispatch}
                    tileResult={roomEvents.tileResult}
                    generateTile={roomEvents.generateTile}
                    clearTile={clearTileAndCombat}
                    bossCheckResult={roomEvents.bossCheckResult}
                    roomDetails={roomEvents.roomDetails}
                    placementTemplate={placementTemplate}
                    autoPlacedRoom={roomEvents.autoPlacedRoom}
                    setAutoPlacedRoom={roomEvents.setAutoPlacedRoom}
                    onCommitPlacement={(startX, startY, tpl) => {
                      // tpl may be {grid, doors}
                      const templateGrid = tpl.grid || tpl;
                      const templateDoors = tpl.doors || [];
                      templateGrid.forEach((row, ry) => {
                        row.forEach((val, rx) => {
                          if (val && val !== 0) {
                            const x = startX + rx;
                            const y = startY + ry;
                            if (y >= 0 && y < state.grid.length && x >= 0 && x < (state.grid[0]?.length||0)) {
                              dispatch({ type: 'SET_CELL', x, y, value: val });
                            }
                          }
                        });
                      });
                      templateDoors.forEach(d => {
                        const x = startX + (d.x || 0);
                        const y = startY + (d.y || 0);
                        if (y >= 0 && y < state.grid.length && x >= 0 && x < (state.grid[0]?.length||0)) {
                          dispatch({ type: 'TOGGLE_DOOR', x, y, edge: d.edge });
                        }
                      });
                      setPlacementTemplate(null);
                      roomEvents.setAutoPlacedRoom(null);
                    }}
                    sidebarCollapsed={!leftPanelOpen}
                    onToggleShowLog={() => setShowLogMiddle((s) => !s)}
                    showLogMiddle={showLogMiddle}
                    onShowRoomDesigner={() => setShowRoomDesigner(true)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
                      <div className="text-sm font-semibold text-amber-400">Adventure Log</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowLogMiddle(false)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                        title="Show dungeon"
                      >
                        Map
                      </button>
                      <button
                        onClick={() => setShowRoomDesigner(true)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                        title="Open Room Designer"
                      >
                        Room Designer
                      </button>
                    </div>
                    </div>
                    <div className="flex-1 overflow-hidden min-h-0">
                      <Log state={state} dispatch={dispatch} isBottomPanel={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Action Pane (col 3) - span both rows so its background remains visible under the LogBar */}
            <div style={{ gridColumn: '3 / 4', gridRow: '1 / 3' }} className="overflow-y-auto p-3 bg-slate-850 min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">
                  {actionMode === ACTION_MODES.COMBAT
                    ? "Combat"
                    : actionMode === ACTION_MODES.SPECIAL
                      ? "Special"
                      : actionMode === ACTION_MODES.TREASURE
                        ? "Treasure"
                        : actionMode === ACTION_MODES.QUEST
                          ? "Quest"
                          : actionMode === ACTION_MODES.WEIRD
                            ? "Weird"
                            : actionMode === ACTION_MODES.EMPTY
                              ? "Empty"
                              : "Actions"}
                </span>
                {state.monsters?.length > 0 && (
                  <span className="text-xs text-red-400">
                    {state.monsters.filter((m) => m.hp > 0).length} active
                  </span>
                )}
              </div>
              <ActionPane
                state={state}
                dispatch={dispatch}
                actionMode={actionMode}
                selectedHero={selectedHero}
                onSelectHero={setSelectedHero}
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
              {/* StoryLog moved into the sidebar log tab */}
            </div>

            {/* Log Bar - span left + middle columns only */}
            <div style={{ gridColumn: '1 / 3', gridRow: '2 / 3' }}>
              <LogBar
                state={state}
                dispatch={dispatch}
                collapsed={logCollapsed}
                onToggle={() => setLogCollapsed(!logCollapsed)}
                selectedHero={selectedHero}
                onSelectHero={setSelectedHero}
              />
            </div>
          </div>
        </div>
      {showRoomDesigner && (
        <RoomDesigner
          onClose={() => setShowRoomDesigner(false)}
          onPlaceTemplate={(tpl) => {
            // Enter placement mode: let user click a map cell to place the template
            setPlacementTemplate(tpl);
            setShowRoomDesigner(false);
          }}
        />
      )}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={tab} onTabChange={setTab} />

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        state={state}
        dispatch={dispatch}
      />
      <RulesReference isOpen={showRules} onClose={() => setShowRules(false)} />

      <DungeonFeaturesModal
        isOpen={showDungeonFeatures}
        onClose={() => setShowDungeonFeatures(false)}
        state={state}
        dispatch={dispatch}
        selectedHero={selectedHero}
      />
      <CampaignManagerModal
        isOpen={showCampaign}
        onClose={() => setShowCampaign(false)}
        state={state}
        dispatch={dispatch}
      />
      <Equipment
        isOpen={showEquipment}
        state={state}
        dispatch={dispatch}
        onClose={() => setShowEquipment(false)}
      />
      <Abilities
        isOpen={showAbilities}
        state={state}
        dispatch={dispatch}
        onClose={() => setShowAbilities(false)}
      />

      {/* Floating Dice Roller (Desktop) */}
  <FloatingDice onLogRoll={(text) => dispatch({ type: 'LOG', t: text })} />
    </div>
  );
}
