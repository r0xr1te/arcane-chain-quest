
import { Card, ElementType } from "@/types/game";
import { useEffect, useState } from "react";
import { Flame, Leaf, Snowflake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpellEffectProps {
  type: ElementType;
  power: number;
  isHealing?: boolean;
  position?: "player" | "enemy";
  onComplete?: () => void;
}

const SpellEffect: React.FC<SpellEffectProps> = ({ 
  type, 
  power,
  isHealing = false,
  position = "enemy",
  onComplete
}) => {
  const [showing, setShowing] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowing(false);
      if (onComplete) onComplete();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showing) return null;
  
  const getIcon = () => {
    switch (type) {
      case "fire":
        return <Flame size={64} className="text-game-fire" />;
      case "nature":
        return <Leaf size={64} className="text-game-nature" />;
      case "ice":
        return <Snowflake size={64} className="text-game-ice" />;
      case "mystic":
        return <Sparkles size={64} className="text-game-mystic" />;
    }
  };
  
  return (
    <div className={cn(
      "spell-effect",
      position === "enemy" ? "top-0" : "bottom-0",
      "left-1/2 transform -translate-x-1/2",
      isHealing ? "translate-y-0" : (position === "enemy" ? "translate-y-16" : "-translate-y-16"),
    )}>
      <div className={cn(
        "flex flex-col items-center gap-2",
        isHealing ? "text-game-nature" : "text-game-fire"
      )}>
        <div className="relative">
          {getIcon()}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-2xl drop-shadow-lg">
              {isHealing ? "+" : "-"}{power}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellEffect;
