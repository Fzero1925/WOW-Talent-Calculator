import React, { useRef } from 'react';
import { Talent } from '../types';

interface TalentIconProps {
  talent: Talent;
  available: boolean;
  maxed: boolean;
  canAfford: boolean;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  setTooltip: (data: { talent: Talent; x: number; y: number } | null) => void;
}

const TalentIcon: React.FC<TalentIconProps> = ({
  talent,
  available,
  maxed,
  canAfford,
  onIncrease,
  onDecrease,
  setTooltip,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setTooltip({
      talent,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     setTooltip({
      talent,
      x: e.clientX,
      y: e.clientY,
    });
  }

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onIncrease(talent.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onDecrease(talent.id);
  };

  // Determine Visual State Logic
  const isLocked = !available;
  const isLearnable = available && !maxed && canAfford;
  const isCapped = available && !maxed && !canAfford; // Global cap reached, or can't afford
  const hasPoints = talent.currentRank > 0;

  // Base Styles
  let containerClass = "relative w-full h-full rounded border-2 box-border transition-all duration-200 ease-in-out";
  let imageClass = "w-full h-full object-cover rounded-[1px] transition-all duration-200";
  let badgeContainerClass = "absolute -bottom-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded shadow-sm border pointer-events-none z-20";
  let badgeText = `${talent.currentRank}/${talent.maxRank}`;

  // State-Specific Styles
  if (isLocked) {
    // LOCKED: Dark, grayscale, low opacity
    containerClass += " border-gray-700 bg-gray-900 cursor-not-allowed";
    imageClass += " grayscale opacity-40";
    badgeContainerClass += " hidden"; // Hide badge for locked talents
  } 
  else if (maxed) {
    // MAXED: Gold glowing border, full color
    containerClass += " border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer z-10";
    imageClass += " grayscale-0";
    badgeContainerClass += " bg-black text-yellow-400 border-yellow-600";
  } 
  else if (isLearnable) {
    // LEARNABLE: Green border, full color
    containerClass += " border-green-500 hover:border-green-400 hover:shadow-[0_0_8px_rgba(74,222,128,0.4)] cursor-pointer";
    imageClass += " grayscale-0";
    // If we have points, show rank. If 0, show rank (green usually indicates 'can increase')
    badgeContainerClass += " bg-black text-green-400 border-green-700";
  } 
  else if (isCapped) {
    // CAPPED (Available but no points left): Neutral border, full color
    // If it has points, it looks 'active' but static. If 0 points, it looks available but empty.
    if (hasPoints) {
       containerClass += " border-yellow-700 cursor-context-menu"; // Can right click to remove
       badgeContainerClass += " bg-black text-yellow-200 border-yellow-900";
    } else {
       containerClass += " border-gray-500 cursor-not-allowed"; // Can't add, can't remove
       badgeContainerClass += " bg-black text-gray-400 border-gray-600";
    }
    imageClass += " grayscale-0";
  }

  return (
    <div
      ref={nodeRef}
      className="absolute w-12 h-12 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={containerClass}>
        <img
          src={talent.icon}
          alt={talent.name}
          className={imageClass}
        />
        
        {/* Rank Count Badge */}
        <div className={badgeContainerClass}>
          {badgeText}
        </div>
      </div>
    </div>
  );
};

export default TalentIcon;