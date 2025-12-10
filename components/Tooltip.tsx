import React from 'react';
import { Talent } from '../types';

interface TooltipProps {
  talent: Talent;
  visible: boolean;
  position: { x: number; y: number };
  isMaxed: boolean;
  nextRankDescription?: string;
  prerequisiteName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  talent, 
  visible, 
  position, 
  isMaxed, 
  nextRankDescription,
  prerequisiteName 
}) => {
  if (!visible) return null;

  // Calculate current description index.
  // If rank is 0, show rank 1 (index 0).
  // If rank is 1, show rank 1 (index 0) as "Current" and rank 2 as "Next" if available.
  const currentDescIndex = Math.max(0, talent.currentRank - 1);
  const currentDesc = talent.currentRank > 0 ? talent.description[currentDescIndex] : null;

  return (
    <div
      className="fixed z-50 w-72 bg-gray-900 border border-gray-500 rounded-md shadow-2xl text-sm pointer-events-none p-3"
      style={{
        left: position.x + 15, // Offset slightly
        top: position.y + 15,
      }}
    >
      <h3 className="font-bold text-white text-lg mb-1">{talent.name}</h3>
      <p className="text-yellow-400 mb-2">Rank {talent.currentRank} / {talent.maxRank}</p>
      
      {talent.reqPoints ? (
         <p className="text-red-400 italic mb-2">Requires {talent.reqPoints} points in Arms</p>
      ) : null}

      {talent.prerequisite ? (
        <p className="text-red-400 italic mb-2">Requires {prerequisiteName || talent.prerequisite}</p>
      ) : null}

      {currentDesc && (
        <div className="mb-2">
          <p className="text-yellow-200">{currentDesc}</p>
        </div>
      )}

      {nextRankDescription && !isMaxed && (
        <div className="mt-2 border-t border-gray-600 pt-2">
          <p className="text-gray-400 mb-1">Next Rank:</p>
          <p className="text-green-300">{nextRankDescription}</p>
        </div>
      )}
      
      {isMaxed && (
        <p className="text-yellow-500 font-bold mt-2">Talent Maxed</p>
      )}

      {talent.currentRank === 0 && !nextRankDescription && (
           <p className="text-green-300">{talent.description[0]}</p>
      )}
    </div>
  );
};

export default Tooltip;