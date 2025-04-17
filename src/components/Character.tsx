
import { cn } from "@/lib/utils";
import { Character as CharacterType } from "@/types/game";
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
      "health-bar-container absolute z-30",
      isEnemy ? "top-3 right-3" : "bottom-3 left-3"
    )}>
      <div className="character-info mb-1 flex items-center gap-1">
        <span className="character-level">
          <Diamond className="w-2.5 h-2.5" />
        </span>
        <span className="font-semibold text-white text-xs">{character.name}</span>
        <span className="text-white/90 text-xs">{character.currentHealth}</span>
      </div>
      
      <div className={cn(
        "health-bar w-24",
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
