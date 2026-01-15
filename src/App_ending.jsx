            <span className="text-red-400 font-bold">{state.majorFoes}M</span>
            <span className="text-blue-400">{state.clues}C</span>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-1">
            <Dice />
            <button onClick={() => setShowRules(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Rules">
              <Book size={18} />
            </button>
            <button onClick={() => setShowDungeonFeatures(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Features">
              <DoorOpen size={18} />
            </button>
            <button onClick={() => setShowCampaign(true)} className="text-purple-400 hover:text-purple-300 p-1" title="Campaign">
              <Trophy size={18} />
            </button>
            <button onClick={() => setShowSaveLoad(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Save/Load">
              <Save size={18} />
            </button>
            <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile: Tabbed interface */}
        <div className="md:hidden flex-1 overflow-y-auto pb-16">
          <div className="p-3">
            {tab === 'party' && <Party state={state} dispatch={dispatch} />}
            {tab === 'dungeon' && <Dungeon state={state} dispatch={dispatch} tileResult={tileResult} generateTile={generateTile} clearTile={clearTile} bossCheckResult={bossCheckResult} roomDetails={roomDetails} />}
            {tab === 'combat' && <Combat state={state} dispatch={dispatch} selectedHero={selectedHero} setSelectedHero={setSelectedHero} />}
            {tab === 'analytics' && <Analytics state={state} />}
            {tab === 'log' && <Log state={state} dispatch={dispatch} />}
          </div>
        </div>

        {/* Desktop: Flexible equal-width columns layout */}
        <div className={`hidden md:flex flex-1 overflow-hidden relative ${leftPanelTab !== 'log' ? 'pb-8' : ''}`}>
          
          {/* Left Column - Party/Stats (Collapsible) */}
          {leftPanelOpen ? (
            <div className="flex-1 border-r border-slate-700 bg-slate-850 flex flex-col min-w-0" data-panel="sidebar">
              {/* Left Panel Tabs */}
              <div className="flex border-b border-slate-700 flex-shrink-0">
                <button
                  onClick={() => setLeftPanelTab('party')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'party' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Users size={16} /> Party
                </button>
                <button
                  onClick={() => setLeftPanelTab('stats')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'stats' ? 'bg-slate-700 text-purple-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <TrendingUp size={16} /> Stats
                </button>
                <button
                  onClick={() => setLeftPanelTab('log')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'log' ? 'bg-slate-700 text-green-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Scroll size={16} /> Log
                </button>
                <button
                  onClick={() => setLeftPanelOpen(false)}
                  className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700"
                  title="Collapse Panel"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
              
              {/* Left Panel Content */}
              <div className="flex-1 overflow-y-auto p-3">
                {leftPanelTab === 'party' ? (
                  <Party state={state} dispatch={dispatch} />
                ) : leftPanelTab === 'stats' ? (
                  <Analytics state={state} />
                ) : (
                  <Log state={state} dispatch={dispatch} />
                )}
              </div>
            </div>
          ) : (
            /* Collapsed Sidebar */
            <div className="w-12 flex-shrink-0 border-r border-slate-700 flex flex-col items-center py-2 gap-2" data-panel="sidebar">
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('party'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'party' ? 'text-amber-400' : 'text-slate-400'}`}
                title="Open Party Panel"
              >
                <Users size={20} />
              </button>
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('stats'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'stats' ? 'text-purple-400' : 'text-slate-400'}`}
                title="Open Stats Panel"
              >
                <TrendingUp size={20} />
              </button>
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('log'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'log' ? 'text-green-400' : 'text-slate-400'}`}
                title="Open Log Panel"
              >
                <Scroll size={20} />
              </button>
              <div className="border-t border-slate-700 w-full my-2" />
              <button
                onClick={() => setLeftPanelOpen(true)}
                className="p-2 rounded hover:bg-slate-700 text-slate-500"
                title="Expand Panel"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          
          {/* Middle Column - Dungeon Map */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 border-r border-slate-700">
            {/* Tile Generation Bar */}
            <div className="bg-slate-800 border-b border-slate-700 p-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                {!tileResult ? (
                  <button
                    onClick={generateTile}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-4 py-2 rounded font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Dices size={18} /> Generate Tile (d66 + 2d6)
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-2 text-sm flex-wrap">
                    <div className={`px-2 py-1 rounded ${tileResult.shape.shape?.includes('corridor') ? 'bg-slate-700/50 border border-slate-500' : 'bg-blue-900/50'}`}>
                      <span className="text-blue-400 font-bold">📐 {tileResult.shape.roll}:</span>
                      <span className="text-slate-300 ml-1">{tileResult.shape.description}</span>
                      {tileResult.shape.shape?.includes('corridor') && (
                        <span className="text-yellow-400 ml-1 text-xs">(Corridor)</span>
                      )}
                    </div>
                    <div className="bg-amber-900/50 px-2 py-1 rounded">
                      <span className="text-amber-400 font-bold">📦 {tileResult.contents.roll}:</span>
                      <span className="text-slate-300 ml-1">{tileResult.contents.description}</span>
                    </div>
                    {bossCheckResult?.isBoss && (
                      <div className="bg-red-900/50 px-2 py-1 rounded text-red-400 font-bold">
                        👑 BOSS!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Dungeon Grid - Full width */}
            <div className="flex-1 overflow-y-auto p-2">
              <Dungeon 
                state={state} 
                dispatch={dispatch} 
                tileResult={tileResult}
                generateTile={generateTile}
                clearTile={clearTile}
                bossCheckResult={bossCheckResult}
                roomDetails={roomDetails}
                hideGenerationUI={true}
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
            {renderActionPane()}
          </div>
          
          {/* Log Bar - Hidden when log tab is open in sidebar */}
          {leftPanelTab !== 'log' && (
            <div 
              className={`absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-800 transition-all duration-200 ${
                logCollapsed ? 'h-8' : 'h-[35vh]'
              }`}
              style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.3)' }}
            >
              <div 
                className="flex items-center justify-between px-3 py-1.5 bg-slate-800 cursor-pointer hover:bg-slate-700 h-8"
                onClick={() => setLogCollapsed(!logCollapsed)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Scroll size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 flex-shrink-0">
                    Log ({state.log?.length || 0})
                  </span>
                  {logCollapsed && state.log && state.log.length > 0 && (
                    <span className="text-xs text-slate-400 truncate ml-2">
                      {state.log[0]}
                      <span className="inline-block w-2 h-3 ml-1 bg-slate-400 animate-pulse" style={{ animation: 'blink 1s step-end infinite' }}></span>
                    </span>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white flex-shrink-0 ml-2">
                  {logCollapsed ? '▲' : '▼'}
                </button>
              </div>
              
              {!logCollapsed && (
                <div className="h-[calc(100%-2rem)] overflow-hidden">
                  <Log state={state} dispatch={dispatch} isBottomPanel={true} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex md:hidden">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-amber-400' : 'text-slate-500'}`}
          >
            <t.icon size={18} />
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} state={state} dispatch={dispatch} />
      <RulesReference isOpen={showRules} onClose={() => setShowRules(false)} />
      <SaveLoadModal isOpen={showSaveLoad} onClose={() => setShowSaveLoad(false)} state={state} dispatch={dispatch} />
      <DungeonFeaturesModal isOpen={showDungeonFeatures} onClose={() => setShowDungeonFeatures(false)} state={state} dispatch={dispatch} selectedHero={selectedHero} />
      <CampaignManagerModal isOpen={showCampaign} onClose={() => setShowCampaign(false)} state={state} dispatch={dispatch} />
    </div>
  );
}
