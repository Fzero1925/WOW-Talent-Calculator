import React from 'react';
import { Talent } from '../types';
import TalentIcon from './TalentIcon';

interface TalentTreeProps {
  talents: Talent[];
  treePoints: number;
  totalPointsUsed: number;
  bgImage: string;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  setTooltip: (data: { talent: Talent; x: number; y: number } | null) => void;
}

const TalentTree: React.FC<TalentTreeProps> = ({
  talents,
  treePoints,
  totalPointsUsed,
  bgImage,
  onIncrease,
  onDecrease,
  setTooltip,
}) => {
  // Config
  const MAX_POINTS = 51;
  const POINTS_PER_ROW = 5;

  // Grid background pattern
  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, #333 1px, transparent 1px),
      linear-gradient(to bottom, #333 1px, transparent 1px)
    `,
    backgroundSize: '100px 100px', // Roughly aligns with cells
  };

  // Helper to check availability
  const isTalentAvailable = (talent: Talent) => {
    // 1. Check Max Rank
    // (Handled in interaction, but visual check for 'locked' state)
    
    // 2. Check Prerequisites
    if (talent.prerequisite) {
      const prereq = talents.find((t) => t.id === talent.prerequisite);
      if (prereq && prereq.currentRank < prereq.maxRank) {
        return false;
      }
    }

    // 3. Check Row/Points Requirement
    const requiredPoints = talent.row * POINTS_PER_ROW;
    if (treePoints < requiredPoints) {
      return false;
    }

    return true;
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto h-[600px] bg-gray-800/50 rounded-lg border border-gray-700 shadow-inner overflow-hidden"
      style={gridStyle}
    >
      {/* Background Image Overlay (Class flavored) */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center opacity-20 pointer-events-none transition-all duration-300"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}
      ></div>

      <div className="relative z-10 grid grid-cols-4 grid-rows-7 gap-4 p-4 h-full">
        {talents.map((talent) => {
          // Calculate grid position (1-based for CSS grid)
          const style = {
            gridColumnStart: talent.col + 1,
            gridRowStart: talent.row + 1,
          };

          const available = isTalentAvailable(talent);
          const maxed = talent.currentRank >= talent.maxRank;
          const canAfford = totalPointsUsed < MAX_POINTS;

          return (
            <div key={talent.id} style={style} className="flex items-center justify-center relative">
               {/* Dependency Arrow (Very Simple SVG Overlay if needed, skipping for cleaner code as requested by simplicity constraints, 
                   but we can check prerequisites to draw lines. Let's keep it simple: Gray out state is the indicator) */}
               
               <TalentIcon
                  talent={talent}
                  available={available}
                  maxed={maxed}
                  canAfford={canAfford}
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                  setTooltip={setTooltip}
               />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TalentTree;