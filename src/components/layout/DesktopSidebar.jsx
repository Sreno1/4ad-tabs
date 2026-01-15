import React from "react";
import {
  Users,
  TrendingUp,
  Scroll,
  Book,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Party from "../Party.jsx";
import Analytics from "../Analytics.jsx";
import Log from "../Log.jsx";
import RulesPdfViewer from "../RulesPdfViewer.jsx";

export default function DesktopSidebar({
  state,
  dispatch,
  isOpen,
  activeTab,
  onToggle,
  onTabChange,
  selectedHero,
  onSelectHero,
}) {
  if (!isOpen) {
    return (
      <div
        className="w-12 flex-shrink-0 border-r border-slate-700 flex flex-col items-center py-2 gap-2"
        data-panel="sidebar"
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
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("stats");
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "stats" ? "text-purple-400" : "text-slate-400"}`}
          title="Open Stats Panel"
        >
          <TrendingUp size={20} />
        </button>
        <button
          onClick={() => {
            onToggle(true);
            onTabChange("log");
          }}
          className={`p-2 rounded hover:bg-slate-700 ${activeTab === "log" ? "text-green-400" : "text-slate-400"}`}
          title="Open Log Panel"
        >
          <Scroll size={20} />
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
      data-panel="sidebar"
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
        <button
          onClick={() => onTabChange("stats")}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "stats"
              ? "bg-slate-700 text-purple-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <TrendingUp size={16} /> Stats
        </button>
        <button
          onClick={() => onTabChange("log")}
          className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
            activeTab === "log"
              ? "bg-slate-700 text-green-400"
              : "text-slate-400 hover:bg-slate-750"
          }`}
        >
          <Scroll size={16} /> Log
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
        ) : activeTab === "stats" ? (
          <Analytics state={state} />
        ) : activeTab === "log" ? (
          <Log state={state} dispatch={dispatch} />
        ) : (
          <RulesPdfViewer />
        )}
      </div>
    </div>
  );
}
