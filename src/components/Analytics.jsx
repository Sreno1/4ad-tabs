import React from 'react';
import { TrendingUp, Trophy, Skull, Crown, Coins, Users, Map, Sword } from 'lucide-react';

export default function Analytics({ state }) {
  const { campaign, party, mode } = state;

  // Calculate party-wide stats
  const partyStats = party.reduce((acc, hero) => ({
    totalKills: acc.totalKills + (hero.stats?.monstersKilled || 0),
    totalDungeons: acc.totalDungeons + (hero.stats?.dungeonsSurvived || 0),
    totalGold: acc.totalGold + (hero.stats?.totalGoldEarned || 0)
  }), { totalKills: 0, totalDungeons: 0, totalGold: 0 });

  // Calculate success rate
  const adventuresStarted = (campaign.adventuresCompleted || 0) + (state.finalBoss ? 0 : 1);
  const successRate = adventuresStarted > 0 
    ? Math.round((campaign.adventuresCompleted / adventuresStarted) * 100)
    : 0;

  // Most used class
  const classCounts = party.reduce((acc, hero) => {
    acc[hero.key] = (acc[hero.key] || 0) + 1;
    return acc;
  }, {});
  const mostUsedClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];

  // Calculate average party level
  const avgLevel = party.length > 0 
    ? (party.reduce((sum, h) => sum + h.lvl, 0) / party.length).toFixed(1)
    : 0;

  // Recent adventures
  const recentAdventures = campaign.completedAdventures?.slice(-5).reverse() || [];

  return (
    <div className="space-y-4">      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-400" size={24} />
        <h2 className="text-xl font-bold">Campaign Analytics</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Map className="text-blue-400" size={20} />}
          label="Adventures"
          value={campaign.adventuresCompleted || 0}
          subtext="completed"
        />
        <StatCard
          icon={<Skull className="text-red-400" size={20} />}
          label="Monsters"
          value={campaign.totalMinorDefeated + campaign.totalMajorDefeated || 0}
          subtext="defeated"
        />
        <StatCard
          icon={<Crown className="text-amber-400" size={20} />}
          label="Bosses"
          value={campaign.totalBossesDefeated || 0}
          subtext="defeated"
        />
        <StatCard
          icon={<Coins className="text-yellow-400" size={20} />}
          label="Gold"
          value={campaign.gold || 0}
          subtext="accumulated"
        />
      </div>

      {/* Party Stats */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Users className="text-purple-400" size={20} />
          <h3 className="font-bold">Party Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 p-3 rounded">
            <div className="text-xs text-slate-400 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">{successRate}%</div>
            <div className="text-xs text-slate-500">{campaign.adventuresCompleted} / {adventuresStarted}</div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded">
            <div className="text-xs text-slate-400 mb-1">Avg. Level</div>
            <div className="text-2xl font-bold text-blue-400">{avgLevel}</div>
            <div className="text-xs text-slate-500">{party.length} heroes</div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded">
            <div className="text-xs text-slate-400 mb-1">Most Used</div>
            <div className="text-lg font-bold text-amber-400 capitalize">
              {mostUsedClass ? mostUsedClass[0] : 'None'}
            </div>
            <div className="text-xs text-slate-500">
              {mostUsedClass ? `${mostUsedClass[1]}x` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Hero Stats */}
      {party.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Sword className="text-red-400" size={20} />
            <h3 className="font-bold">Hero Performance</h3>
          </div>
          
          <div className="space-y-2">
            {party.map((hero, idx) => (
              <div key={hero.id} className="bg-slate-900/50 p-3 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{hero.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{hero.key} - Level {hero.lvl}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <div className="text-slate-400">Kills</div>
                    <div className="font-bold text-red-400">{hero.stats?.monstersKilled || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Adventures</div>
                    <div className="font-bold text-blue-400">{hero.stats?.dungeonsSurvived || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Gold</div>
                    <div className="font-bold text-yellow-400">{hero.stats?.totalGoldEarned || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Adventures */}
      {recentAdventures.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="text-amber-400" size={20} />
            <h3 className="font-bold">Recent Adventures</h3>
          </div>
          
          <div className="space-y-2">
            {recentAdventures.map((adv, idx) => (
              <div key={adv.adventureId || idx} className="bg-slate-900/50 p-3 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm">{adv.name || 'Unnamed Adventure'}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    adv.success ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {adv.success ? '✓ Victory' : '✗ Defeat'}
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex gap-4">
                  <span>Gold: {adv.goldEarned || 0}</span>
                  <span>Minors: {adv.minorDefeated || 0}</span>
                  <span>Majors: {adv.majorDefeated || 0}</span>
                  {adv.bossDefeated && <span className="text-amber-400">Boss ✓</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(adv.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs text-slate-400">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{subtext}</div>
    </div>
  );
}
