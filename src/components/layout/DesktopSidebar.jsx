import React from "react";
import {
  Users,
  TrendingUp,
  Scroll,
  Book,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import Log from "../Log.jsx";
import Party from "../Party.jsx";
import StoryLog from "../StoryLog.jsx";
import RulesPdfViewer from "../RulesPdfViewer.jsx";

export default function DesktopSidebar({
  state,
  dispatch,
  isOpen,
  contracted = false,
  activeTab,
  onToggle,
  onTabChange,
  onOpenCampaign, // new prop: open campaign manager modal
  selectedHero,
  onSelectHero,
  onOpenLog,
}) {
  if (!isOpen) {
  // When collapsed, render a narrow column that fits the parent width
  const collapsedWidth = 'w-12';
    return (
      <div
        className={`${collapsedWidth} flex-shrink-0 border-r border-slate-700 flex flex-col items-center py-2 gap-2 z-20 bg-slate-850`}
        data-panel="sidebar" style={{ height: '-webkit-fill-available', minWidth: '3rem' }}
      >
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("party");
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "party" ? "text-amber-400" : "text-slate-400"}`}
          title="Open Party Panel"
        >
          <Users size={20} />
        </button>
  {/* Stats button removed - moved into Campaign Manager modal */}
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("story");
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "story" ? "text-green-400" : "text-slate-400"}`}
          title="Open Story Panel"
        >
          <Scroll size={20} />
        </button>
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("log");
            if (typeof onOpenLog === 'function') onOpenLog();
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "log" ? "text-amber-400" : "text-slate-400"}`}
          title="Open Log Panel"
        >
          <FileText size={20} />
        </button>
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("rules");
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "rules" ? "text-blue-400" : "text-slate-400"}`}
          title="Open Rules Panel"
        >
          <Book size={20} />
        </button>
        <div className="border-t border-slate-700 w-full my-2" />
        <button
          onClick={() => onToggle(true)}
          className="p-2 rounded hover:bg-slate-700 text-slate-500"
          title="Expand Panel"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex-1 border-r border-slate-700 bg-slate-850 flex flex-col min-w-0"
      data-panel="sidebar"  style={{ height: '-webkit-fill-available' }}
    >
      {/* Sidebar Tabs */}
      <div className="flex border-b border-slate-700 flex-shrink-0">
        <button
          onClick={() => onTabChange("party")}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "party"
              ? "bg-slate-700 text-amber-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <Users size={16} /> Party
        </button>
  {/* Stats tab removed - stats are now in Campaign Manager */}
        <button
          onClick={() => onTabChange("story")}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "story"
              ? "bg-slate-700 text-green-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <Scroll size={16} /> Story
        </button>
        <button
          onClick={() => { onTabChange("log"); if (typeof onOpenLog === 'function') onOpenLog(); }}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "log"
              ? "bg-slate-700 text-amber-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <FileText size={16} /> Log
        </button>
        <button
          onClick={() => onTabChange("rules")}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "rules"
              ? "bg-slate-700 text-blue-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <Book size={16} /> Rules
        </button>
        <button
          onClick={() => onToggle(false)}
          className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700"
          title="Collapse Panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Sidebar Content */}
      <div
        className={`flex-1 overflow-y-auto ${activeTab === "rules" ? "" : "p-3"}`}
      >
  {activeTab === "party" ? (
          <Party
            state={state}
            dispatch={dispatch}
            selectedHero={selectedHero}
            onSelectHero={onSelectHero}
          />
  ) : activeTab === "story" ? (
          <div className="space-y-3">
            <StoryLog state={state} dispatch={dispatch} />
          </div>
        ) : activeTab === "log" ? (
          <div className="space-y-3">
            <Log state={state} dispatch={dispatch} isBottomPanel={false} />
          </div>
        ) : (
          <RulesPdfViewer />
        )}
      </div>
    </div>
  );
}
