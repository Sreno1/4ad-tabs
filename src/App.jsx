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
import EntranceRollModal from "./components/EntranceRollModal.jsx";
import Equipment from "./components/Equipment.jsx";
import Abilities from "./components/Abilities.jsx";
import ActionPane from "./components/ActionPane.jsx";
import FloatingDice from "./components/FloatingDice.jsx";
import RoomDesigner from "./components/RoomDesigner.jsx";
import GoldSenseModal from "./components/GoldSenseModal.jsx";
import ResultModal from './components/ResultModal.jsx';

// Layout Components
import AppHeader from "./components/layout/AppHeader.jsx";
import LanternModal from './components/LanternModal.jsx';
import MobileNavigation from "./components/layout/MobileNavigation.jsx";
import DesktopSidebar from "./components/layout/DesktopSidebar.jsx";
import LogBar from "./components/layout/LogBar.jsx";

// Hooks
import { useGameState } from "./hooks/useGameState.js";
import { useCombatFlow } from "./hooks/useCombatFlow.js";
import { useRoomEvents } from "./hooks/useRoomEvents.js";
import { rollWanderingMonster } from "./utils/gameActions/index.js";
import { addMonster, logMessage } from './state/actionCreators.js';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE } from './data/rooms.js';
import DungeonHeaderButtons from './components/DungeonHeaderButtons.jsx';

// Constants
import { ACTION_MODES } from "./constants/gameConstants.js";

// Equipment / class helpers for top-right light indicator
import { hasEquipment, getEquipment } from "./data/equipment.js";
import { hasDarkvision } from "./data/classes.js";

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
  const [pendingOnboarding, setPendingOnboarding] = useState(null);
  const [showEntranceRoll, setShowEntranceRoll] = useState(false);
  const [entranceRoll, setEntranceRoll] = useState(null);
  const [showCampaignManager, setShowCampaignManager] =
    useState(!currentCampaignId);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [showDungeonFeatures, setShowDungeonFeatures] = useState(false);
  const [activeDungeonFeature, setActiveDungeonFeature] = useState(null);
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
  const [showLogSidebar, setShowLogSidebar] = useState(false);
  // When the bottom log expands we want the sidebar to visually contract
  // (like the dungeon pane) but not change the logical `leftPanelOpen` state.
  const [leftPanelContracted, setLeftPanelContracted] = useState(false);
  // Do not auto-contract the left panel when the log expands.
  // Contracting is controlled only by the user's explicit close action.
  React.useEffect(() => {
    setLeftPanelContracted(false);
  }, []);
  // Compute light source / darkvision summary for header
  const party = state.party || [];
  const partyHasEquippedLight = party.some((h) => {
    if (!h) return false;
    if (hasEquipment(h, 'lantern')) return true;
    const eq = h.equipment || [];
    if (!Array.isArray(eq)) return false;
    return eq.some((k) => {
      const item = getEquipment(k);
      return item && item.lightSource === true;
    });
  });
  const effectiveHasLight = state.hasLightSource || partyHasEquippedLight;
  const partyLightNames = [];
  party.forEach((h) => {
    const eq = h?.equipment || [];
    if (!Array.isArray(eq)) return;
    eq.forEach((k) => {
      const it = getEquipment(k);
      if (it && it.lightSource && !partyLightNames.includes(it.name)) {
        partyLightNames.push(it.name);
      }
    });
  });
  const partyHasDarkvision = party.some(h => h.hp > 0 && hasDarkvision(h.key));
  const partyLacksDarkvision = party.some(h => h.hp > 0 && !hasDarkvision(h.key));
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
  const [goldSenseModalData, setGoldSenseModalData] = useState(null);
  const [showGoldSenseModal, setShowGoldSenseModal] = useState(false);
  const [showLantern, setShowLantern] = useState(false);

  // Custom hooks for game logic
  const combatFlow = useCombatFlow(state, dispatch);
  const roomEvents = useRoomEvents(state, dispatch, setActionMode, (data) => {
    // Show modal with preview data
    setGoldSenseModalData(data);
    setShowGoldSenseModal(true);
  });

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
    // Save pending onboarding data and roll a d6 for entrance tile shape, show modal
    setPendingOnboarding({ campaignName, party, gold });
    const roll = Math.floor(Math.random() * 6) + 1;
    setEntranceRoll(roll);
    setShowEntranceRoll(true);
  };

  const finalizeOnboardingWithEntrance = () => {
    if (!pendingOnboarding) return;
    const { campaignName, party, gold } = pendingOnboarding;
    const newCampaignId = createCampaign(campaignName, {
      ...initialState,
      party,
      gold,
      name: campaignName,
      marchingOrder: [0, 1, 2, 3],
      // store entranceRoll in initial state for later use/display if desired
      entranceTileRoll: entranceRoll || null,
    });
    setActiveCampaign(newCampaignId);
    setCurrentCampaignId(newCampaignId);
    setPendingOnboarding(null);
    setShowEntranceRoll(false);
    setEntranceRoll(null);
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
    return (
      <>
        <EntranceRollModal isOpen={showEntranceRoll} roll={entranceRoll} onClose={finalizeOnboardingWithEntrance} />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div id="app_root" className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
  {/* Global result modal for success/failure/treasure messages */}
  <ResultModal state={state} dispatch={dispatch} />
      {/* Header */}
      <AppHeader
        state={state}
  dispatch={dispatch}
        selectedHero={selectedHero}
        onSelectHero={setSelectedHero}
        onShowRules={() => setShowRules(true)}
        onShowDungeonFeatures={() => setShowDungeonFeatures(true)}
        onShowEquipment={() => setShowEquipment(true)}
        onShowAbilities={() => setShowAbilities(true)}
        onShowCampaign={() => setShowCampaign(true)}
  onShowSettings={() => setShowSettings(true)}
        onBackToCampaigns={handleBackToCampaigns}
  hasLightSource={effectiveHasLight}
  partyLightNames={partyLightNames}
  onShowLantern={() => setShowLantern(true)}
      />

      <LanternModal isOpen={showLantern} onClose={() => setShowLantern(false)} state={state} dispatch={dispatch} />
  <EntranceRollModal isOpen={showEntranceRoll} roll={entranceRoll} onClose={finalizeOnboardingWithEntrance} />

      {/* Main Content */}
      <main id="main_content" className="flex-1 overflow-hidden flex flex-col">
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
                handleRollReaction={combatFlow.handleRollReaction}
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
                onToggle={(open) => {
                  setLeftPanelOpen(open);
                }}
                onTabChange={(tab) => {
                  // If switching to the log tab, ensure middle log is closed
                  if (tab === 'log') {
                    setShowLogMiddle(false);
                    setShowLogSidebar(true);
                    setLeftPanelTab(tab);
                  } else {
                    // turning off sidebar log state if we navigate away
                    if (leftPanelTab === 'log') setShowLogSidebar(false);
                    setLeftPanelTab(tab);
                  }
                }}
                onOpenCampaign={() => { setShowCampaign(true); }}
                onOpenLog={() => { setShowLogMiddle(false); setShowLogSidebar(true); setLeftPanelTab('log'); setLeftPanelOpen(true); }}
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
                      try { const sfx = require('./utils/sfx.js').default; sfx.play('hurt2', { volume: 0.9 }); } catch (e) {}
                      const templateGrid = tpl.grid || tpl;
                      const templateDoors = tpl.doors || [];
                      const tplStyles = tpl.cellStyles || {};
                      templateGrid.forEach((row, ry) => {
                        row.forEach((val, rx) => {
                          if (val && val !== 0) {
                            const x = startX + rx;
                            const y = startY + ry;
                            if (y >= 0 && y < state.grid.length && x >= 0 && x < (state.grid[0]?.length||0)) {
                              const styleKey = `${rx},${ry}`;
                              const style = tplStyles[styleKey];
                              if (style) dispatch({ type: 'SET_CELL', x, y, value: val, style });
                              else if (val === 1) dispatch({ type: 'SET_CELL', x, y, value: val, style: 'full' });
                              else dispatch({ type: 'SET_CELL', x, y, value: val });
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
                      // Merge walls from template (if any)
                      const templateWalls = tpl.walls || [];
                      if (templateWalls.length > 0) {
                        const existingWalls = state.walls || [];
                        const union = [...existingWalls];
                        // Determine template tag (prefer saved tag from library match; fall back to lastTile.isCorridor)
                        const templateTag = (roomEvents.autoPlacedRoom && roomEvents.autoPlacedRoom.tag) ? roomEvents.autoPlacedRoom.tag : (lastTile && lastTile.isCorridor ? 'Corridor' : 'Room');
                        templateWalls.forEach(w => {
                          const wx = startX + (w.x || 0);
                          const wy = startY + (w.y || 0);
                          if (wy >= 0 && wy < state.grid.length && wx >= 0 && wx < (state.grid[0]?.length||0)) {
                            if (!union.some(u => u.x === wx && u.y === wy && u.edge === w.edge)) union.push({ x: wx, y: wy, edge: w.edge, srcTag: templateTag });
                          }
                        });
                        dispatch({ type: 'SET_WALLS', walls: union });
                      }
                      // If this placement originated from an auto-placed library room and
                      // we have a recorded 2d6 contents roll for the last generated tile,
                      // persist a marker/note in localStorage so the placed tile shows
                      // the 2d6 result on hover. Emit an event so the Dungeon component
                      // can reload markers immediately.
                      try {
                        const autoPlaced = roomEvents.autoPlacedRoom;
                        const lastTile = roomEvents.tileResult;
                        if (autoPlaced && lastTile && typeof lastTile.contentsRoll === 'number') {
                          const tplGrid = templateGrid;
                          const tplH = tplGrid.length;
                          const tplW = (tplGrid[0] || []).length || 0;
                          const centerRX = Math.floor(tplW / 2);
                          const centerRY = Math.floor(tplH / 2);
                          const markX = startX + centerRX;
                          const markY = startY + centerRY;
                          if (markY >= 0 && markY < state.grid.length && markX >= 0 && markX < (state.grid[0]?.length||0)) {
                            const key = `${markX},${markY}`;
                            // Build tooltip from the exact log lines produced during tile generation
                            let tooltipText = `2d6=${lastTile.contentsRoll}`;
                            try {
                              // Determine a cutoff timestamp from recent roomEvents so we only capture
                              // log entries produced during the last generation (D66/CONTENTS events).
                              const evts = roomEvents.roomEvents || [];
                              let cutoff = null;
                              if (evts && evts.length > 0) {
                                // Use the earliest timestamp among the last few relevant events
                                const tsList = evts.filter(e => ['D66_ROLL', 'CONTENTS_ROLL', 'LIBRARY_MATCH'].includes(e.type)).map(e => e.timestamp).filter(Boolean);
                                if (tsList.length > 0) cutoff = Math.min(...tsList);
                              }
                              // If we have a cutoff, collect all log entries with timestamp >= cutoff
                              const lines = [];
                              try {
                                if (cutoff) {
                                  (state.log || []).forEach(l => {
                                    try {
                                      const lt = l.timestamp ? (typeof l.timestamp === 'string' ? (new Date(l.timestamp)).getTime() : l.timestamp) : null;
                                      if (lt && lt >= cutoff) lines.push(l.message);
                                    } catch (e) {}
                                  });
                                }
                              } catch (e) {}
                              // Fallback: if no lines collected, include the most recent 3 log entries
                              if (lines.length === 0) {
                                const recent = (state.log || []).slice(0, 3).map(l => l.message).reverse();
                                tooltipText = recent.join(' \n ');
                              } else {
                                tooltipText = lines.join(' \n ');
                              }
                            } catch (e) { /* ignore */ }
                            // Append whether this tile was a Room or Corridor for quick glance
                            try {
                              const typeLabel = lastTile.isCorridor ? 'Corridor' : 'Room';
                              tooltipText = `${tooltipText} (${typeLabel})`;
                            } catch (e) { /* ignore */ }
                            try {
                              const raw = localStorage.getItem('roomMarkers');
                              const parsed = raw ? JSON.parse(raw) : {};
                              const existing = parsed[key];
                              if (existing) {
                                parsed[key] = { type: existing.type, label: existing.label, tooltip: existing.tooltip && existing.tooltip.length > 0 ? `${existing.tooltip} — ${tooltipText}` : tooltipText };
                              } else {
                                parsed[key] = { type: 'note', label: 'Note', tooltip: tooltipText };
                              }
                              localStorage.setItem('roomMarkers', JSON.stringify(parsed));
                              // let Dungeon component know to reload markers
                              try { window.dispatchEvent(new CustomEvent('roomMarkersUpdated')); } catch (e) {}
                            } catch (e) { /* ignore storage errors */ }
                          }
                        }
                      } catch (e) { /* ignore */ }

                      setPlacementTemplate(null);
                      roomEvents.setAutoPlacedRoom(null);
                    }}
                    sidebarCollapsed={!leftPanelOpen}
                    onToggleShowLog={() => {
                      setShowLogSidebar(false);
                      setShowLogMiddle((s) => !s);
                      try { if (leftPanelTab === 'log') setLeftPanelTab('party'); } catch (e) {}
                    }}
                    showLogMiddle={showLogMiddle}
                    onShowRoomDesigner={() => setShowRoomDesigner(true)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-end p-2 border-b border-slate-700 bg-slate-800">
                      <DungeonHeaderButtons
                        showLogMiddle={showLogMiddle}
                        onToggleShowLog={() => { setShowLogSidebar(false); setShowLogMiddle(false); try { if (leftPanelTab === 'log') setLeftPanelTab('party'); } catch (e) {} }}
                        onShowRoomDesigner={() => setShowRoomDesigner(true)}
                        onGenerateTile={() => { try { roomEvents.generateTile && roomEvents.generateTile(); } catch (e) {} }}
                        onWandering={() => { try { rollWanderingMonster(dispatch, { state }); } catch (e) {} }}
                        onCustomTile={() => {
                          try {
                            const rawD66 = prompt('Enter d66 (e.g. 11, 12, 21, 66):', '11');
                            if (!rawD66) return;
                            const shapeRoll = parseInt(rawD66, 10);
                            if (Number.isNaN(shapeRoll) || !Object.keys(TILE_SHAPE_TABLE).includes(String(shapeRoll))) {
                              alert('Invalid d66 value');
                              return;
                            }
                            const raw2d6 = prompt('Enter 2d6 result (2-12):', '8');
                            if (!raw2d6) return;
                            const contentsRoll = parseInt(raw2d6, 10);
                            if (Number.isNaN(contentsRoll) || contentsRoll < 2 || contentsRoll > 12) {
                              alert('Invalid 2d6 value');
                              return;
                            }
                            roomEvents.generateTile && roomEvents.generateTile({ shapeRoll, contentsRoll });
                          } catch (e) { console.error(e); }
                        }}
                        onCustomMonster={() => {
                          try {
                            const name = prompt('Monster Name?', 'Custom Monster') || 'Custom Monster';
                            const level = parseInt(prompt('Monster Level (1-5)?', '2')) || 2;
                            const isMajor = confirm('Is this a Major Foe (single creature with HP)? Cancel for Minor Foe (group with count).');
                            let monster;
                            if (isMajor) {
                              const hp = parseInt(prompt('HP?', '6')) || 6;
                              monster = { id: Date.now(), name, level, hp, maxHp: hp, type: 'custom', isMinorFoe: false };
                              dispatch({ type: 'ADD_MONSTER', m: monster });
                              dispatch(logMessage(`⚔️ ${name} L${level} (${hp}HP) Major Foe added`));
                            } else {
                              const count = parseInt(prompt('How many?', '6')) || 6;
                              monster = { id: Date.now(), name, level, hp: 1, maxHp: 1, count, initialCount: count, type: 'custom', isMinorFoe: true };
                              dispatch({ type: 'ADD_MONSTER', m: monster });
                              dispatch(logMessage(`👥 ${count}x ${name} L${level} Minor Foes added`));
                            }
                          } catch (e) { console.error(e); }
                        }}
                        onClearMap={() => {
                          try { dispatch({ type: 'CLEAR_GRID' }); } catch (e) {}
                          try { roomEvents.clearTile && roomEvents.clearTile(); } catch (e) {}
                          try { localStorage.removeItem('roomMarkers'); try { window.dispatchEvent(new CustomEvent('roomMarkersUpdated')); } catch (e) {} } catch (e) {}
                        }}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden min-h-0">
                      <Log state={state} dispatch={dispatch} isBottomPanel={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Action Pane (col 3) - span both rows so its background remains visible under the LogBar */}
            <div
              id="action_pane"
              style={{
                gridColumn: '3 / 4',
                gridRow: '1 / 3',
                // Limit action pane height so floating dice has room; make content scroll inside
                maxHeight: 'calc(100% - 7rem)',
                overflowY: 'auto',
              }}
              className="p-3 bg-slate-850 min-w-0"
            >
              <div className="mb-2" />
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
                applyContentChoice={roomEvents.applyContentChoice}
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
              {/* Desktop uses ActionPane for combat UI to avoid duplication */}
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
      <div id="modals_container">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        state={state}
        dispatch={dispatch}
      />
      <RulesReference isOpen={showRules} onClose={() => setShowRules(false)} />

      <DungeonFeaturesModal
        isOpen={showDungeonFeatures}
        onClose={() => { setShowDungeonFeatures(false); setActiveDungeonFeature(null); }}
        state={state}
        dispatch={dispatch}
        selectedHero={selectedHero}
        activeSection={activeDungeonFeature}
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

      {/* Gold Sense Modal (visible when a dwarf successfully previews treasure) */}
      <GoldSenseModal
        isOpen={showGoldSenseModal}
        data={goldSenseModalData}
        onClose={() => {
          setShowGoldSenseModal(false);
          setGoldSenseModalData(null);
        }}
      />
      </div>

  {/* Floating Dice Roller moved into header */}
  {/* Floating Dice Roller: fixed bottom-right on desktop */}
  <FloatingDice inline={false} onShowFeatures={(key) => { setActiveDungeonFeature(key); setShowDungeonFeatures(true); }} onShowAbilities={() => setShowAbilities(true)} state={state} dispatch={dispatch} />
    </div>
  );
}
