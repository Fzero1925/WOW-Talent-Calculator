import React, { useState } from 'react';
import { Talent } from './types';
import { ARMS_TALENTS, FURY_TALENTS } from './data';
import TalentTree from './components/TalentTree';
import Tooltip from './components/Tooltip';

// Icons
import { Sword, Shield, Axe } from 'lucide-react';

type TreeName = 'arms' | 'fury' | 'prot';

const App: React.FC = () => {
  // Store talents for all trees in a single state object
  const [talents, setTalents] = useState<Record<TreeName, Talent[]>>({
    arms: JSON.parse(JSON.stringify(ARMS_TALENTS)),
    fury: JSON.parse(JSON.stringify(FURY_TALENTS)),
    prot: [] // Not implemented yet
  });
  
  const [activeTab, setActiveTab] = useState<TreeName>('arms');
  const [tooltipData, setTooltipData] = useState<{ talent: Talent; x: number; y: number } | null>(null);

  const MAX_POINTS = 51;
  
  // Derived state calculations
  const armsPointsSpent = talents.arms.reduce((sum, t) => sum + t.currentRank, 0);
  const furyPointsSpent = talents.fury.reduce((sum, t) => sum + t.currentRank, 0);
  const protPointsSpent = talents.prot.reduce((sum, t) => sum + t.currentRank, 0);
  const totalPointsSpent = armsPointsSpent + furyPointsSpent + protPointsSpent;

  const currentTreePoints = activeTab === 'arms' ? armsPointsSpent : (activeTab === 'fury' ? furyPointsSpent : protPointsSpent);

  // --- LOGIC ---

  const canIncrease = (talentId: string, tree: TreeName): boolean => {
    const treeTalents = talents[tree];
    const talent = treeTalents.find(t => t.id === talentId);
    if (!talent) return false;

    // 1. Max Rank check
    if (talent.currentRank >= talent.maxRank) return false;

    // 2. Global cap check
    if (totalPointsSpent >= MAX_POINTS) return false;

    // 3. Prerequisite check (Check within same tree)
    if (talent.prerequisite) {
      const prereq = treeTalents.find(t => t.id === talent.prerequisite);
      if (!prereq || prereq.currentRank < prereq.maxRank) return false;
    }

    // 4. Tier check (Row * 5 points required in THIS tree)
    // We need to calculate points spent in this specific tree
    const pointsInThisTree = treeTalents.reduce((sum, t) => sum + t.currentRank, 0);
    const reqPoints = talent.row * 5;
    if (pointsInThisTree < reqPoints) return false;

    return true;
  };

  const handleIncrease = (id: string) => {
    // We infer the tree from the activeTab. 
    // In a real app with cross-tree dependencies (unlikely in vanilla), we might need more info.
    if (!canIncrease(id, activeTab)) return;

    setTalents(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t => {
        if (t.id === id) {
          return { ...t, currentRank: t.currentRank + 1 };
        }
        return t;
      })
    }));
  };

  const canDecrease = (talentId: string, tree: TreeName): boolean => {
    const treeTalents = talents[tree];
    const talent = treeTalents.find(t => t.id === talentId);
    if (!talent) return false;

    // 1. Min rank check
    if (talent.currentRank <= 0) return false;

    // 2. Dependency check (Is this talent a prerequisite for another populated talent?)
    const dependentTalent = treeTalents.find(t => t.prerequisite === talentId && t.currentRank > 0);
    if (dependentTalent) return false;

    // 3. Tier consistency check
    const simulatedTalents = treeTalents.map(t => 
      t.id === talentId ? { ...t, currentRank: t.currentRank - 1 } : t
    );
    
    for (const t of simulatedTalents) {
      if (t.currentRank > 0 && t.row > 0) {
        const pointsBelow = simulatedTalents
          .filter(checkT => checkT.row < t.row)
          .reduce((sum, checkT) => sum + checkT.currentRank, 0);
        
        const required = t.row * 5;
        if (pointsBelow < required) {
          return false;
        }
      }
    }

    return true;
  };

  const handleDecrease = (id: string) => {
    if (!canDecrease(id, activeTab)) return;

    setTalents(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t => {
        if (t.id === id) {
          return { ...t, currentRank: t.currentRank - 1 };
        }
        return t;
      })
    }));
  };

  const handleReset = () => {
    setTalents({
        arms: JSON.parse(JSON.stringify(ARMS_TALENTS)),
        fury: JSON.parse(JSON.stringify(FURY_TALENTS)),
        prot: []
    });
  };

  // Background images for trees
  const bgImages: Record<TreeName, string> = {
    arms: 'https://wow.zamimg.com/images/wow/talents/backgrounds/classic/warrior_arms.jpg',
    fury: 'https://wow.zamimg.com/images/wow/talents/backgrounds/classic/warrior_fury.jpg',
    prot: 'https://wow.zamimg.com/images/wow/talents/backgrounds/classic/warrior_protection.jpg'
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      
      {/* Header */}
      <header className="flex-none p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-500 tracking-wider uppercase">Classic Calculator</h1>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="block text-xs text-gray-400 uppercase">Points Spent</span>
              <span className={`text-xl font-mono font-bold ${totalPointsSpent === MAX_POINTS ? 'text-yellow-500' : 'text-white'}`}>
                {totalPointsSpent} <span className="text-gray-500">/</span> {MAX_POINTS}
              </span>
            </div>
            
            <button 
              onClick={handleReset}
              className="bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded border border-red-700 transition-colors text-sm font-semibold uppercase"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-none bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-md mx-auto flex">
          <button 
            onClick={() => setActiveTab('arms')}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-t-2 transition-colors
              ${activeTab === 'arms' ? 'bg-gray-700 border-yellow-500 text-yellow-100 font-bold' : 'hover:bg-gray-700/50 text-gray-400 border-transparent'}
            `}
          >
            <Sword size={18} />
            <span>Arms</span>
            <span className="bg-black/40 px-2 rounded text-xs ml-2">{armsPointsSpent}</span>
          </button>

          <button 
            onClick={() => setActiveTab('fury')}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-t-2 transition-colors
              ${activeTab === 'fury' ? 'bg-gray-700 border-yellow-500 text-yellow-100 font-bold' : 'hover:bg-gray-700/50 text-gray-400 border-transparent'}
            `}
          >
            <Axe size={18} />
            <span>Fury</span>
             <span className="bg-black/40 px-2 rounded text-xs ml-2">{furyPointsSpent}</span>
          </button>

          <button 
            disabled
            className="flex-1 py-3 px-4 flex items-center justify-center space-x-2 hover:bg-gray-700/50 text-gray-400 border-t-2 border-transparent transition-colors opacity-50 cursor-not-allowed" 
            title="Not implemented"
          >
            <Shield size={18} />
            <span>Prot</span>
             <span className="bg-black/40 px-2 rounded text-xs ml-2">{protPointsSpent}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <TalentTree
          talents={talents[activeTab]}
          treePoints={currentTreePoints}
          totalPointsUsed={totalPointsSpent}
          bgImage={bgImages[activeTab]}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          setTooltip={setTooltipData}
        />
      </main>

      {/* Footer */}
      <footer className="flex-none p-2 text-center text-xs text-gray-600 bg-gray-900">
        Left Click to Learn • Right Click to Unlearn
      </footer>

      {/* Tooltip Overlay */}
      {tooltipData && (
        <Tooltip
          talent={tooltipData.talent}
          visible={!!tooltipData}
          position={{ x: tooltipData.x, y: tooltipData.y }}
          isMaxed={tooltipData.talent.currentRank >= tooltipData.talent.maxRank}
          nextRankDescription={
             tooltipData.talent.currentRank < tooltipData.talent.maxRank 
             ? tooltipData.talent.description[tooltipData.talent.currentRank] 
             : undefined
          }
          prerequisiteName={
             tooltipData.talent.prerequisite
             ? talents[activeTab].find(t => t.id === tooltipData.talent.prerequisite)?.name
             : undefined
          }
        />
      )}
    </div>
  );
};

export default App;