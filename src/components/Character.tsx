
import { cn } from "@/lib/utils";
import { Character as CharacterType } from "@/types/game";
import { useRef, useEffect, useState } from "react";

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
  const [showEffect, setShowEffect] = useState(false);
  
  useEffect(() => {
    if (isTakingDamage || isHealing) {
      setShowEffect(true);
      const timer = setTimeout(() => setShowEffect(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isTakingDamage, isHealing]);

  return (
    <div className={cn(
      "flex flex-col items-center gap-3 mb-2",
      isEnemy ? "mt-2" : ""
    )}>
      <div className={cn(
        "flex items-center gap-2",
        isEnemy ? "flex-row" : "flex-row-reverse"
      )}>
        <div>
          <h3 className="text-white font-semibold text-lg">{character.name}</h3>
          <div className="text-xs text-gray-300">Level {character.level}</div>
        </div>
      </div>
      
      <div className={cn(
        "character relative", 
        isTakingDamage && "animate-damage-shake",
        isFrozen && "opacity-80"
      )}>
        {/* Character Avatar */}
        <div className={cn(
          "w-20 h-20 rounded-full bg-game-ui border-2 flex items-center justify-center relative overflow-hidden",
          isEnemy ? "border-health-enemy" : "border-health-player"
        )}>
          <div className="font-bold text-4xl text-white">
            {isEnemy ? "👹" : "🧙"}
          </div>
          
          {/* Frozen effect */}
          {isFrozen && (
            <div className="absolute inset-0 bg-game-ice/30 flex items-center justify-center">
              <div className="text-4xl">❄️</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Health Bar */}
      <div className="w-full max-w-xs">
        <div className="health-bar bg-gray-700">
          <div 
            className={cn(
              "health-bar-fill", 
              isEnemy ? "bg-health-enemy" : "bg-health-player",
              isHealing && "animate-pulse-glow"
            )} 
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        <div className="text-xs text-white text-center mt-1">
          {character.currentHealth} / {character.maxHealth}
        </div>
      </div>
    </div>
  );
};

export default Character;
