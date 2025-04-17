
import { cn } from "@/lib/utils";
import { Character as CharacterType } from "@/types/game";
import { useRef, useEffect, useState } from "react";
import { Diamond } from "lucide-react";

interface CharacterProps {
  character: CharacterType;
  isEnemy?: boolean;
  isTakingDamage?: boolean;
  isHealing?: boolean;
  isFrozen?: boolean;
}

const Character: React.FC<CharacterProps> = ({ 
  character, 
  isEnemy = false,
  isTakingDamage = false,
  isHealing = false,
  isFrozen = false
}) => {
  const healthPercent = Math.max(0, Math.min(100, (character.currentHealth / character.maxHealth) * 100));
  
  return (
    <div className={cn(
      "health-bar-container",
      isEnemy ? "mb-4" : "mt-4"
    )}>
      <div className="character-info">
        <span className="character-level">
          <Diamond className="w-3 h-3" />
        </span>
        <span className="font-semibold text-white">{character.name}</span>
        <span className="text-white/90">{character.currentHealth}</span>
      </div>
      
      <div className={cn(
        "health-bar",
        isTakingDamage && "animate-shake",
        isFrozen && "opacity-80"
      )}>
        <div 
          className={cn(
            "health-bar-fill", 
            isEnemy ? "bg-health-enemy" : "bg-health-player",
            isHealing && "animate-pulse"
          )} 
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  );
};

export default Character;
