
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
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setShowing(false);
        if (onComplete) onComplete();
      }, 300);
    }, 700);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showing) return null;

  const getProjectileIcon = () => {
    const className = cn(
      "relative z-10",
      isAnimating && position === "enemy" ? "animate-spell-cast-up" : "animate-spell-cast-down",
    );

    switch (type) {
      case "fire":
        return (
          <div className={cn(className, "text-game-fire")}>
            <div className="absolute inset-0 animate-pulse-glow opacity-50 blur-md">
              <Flame size={64} />
            </div>
            <Flame size={64} />
          </div>
        );
      case "nature":
        return (
          <div className={cn(className, "text-game-nature")}>
            <div className="absolute inset-0 animate-pulse-glow opacity-50 blur-md">
              <Leaf size={64} />
            </div>
            <Leaf size={64} />
          </div>
        );
      case "ice":
        return (
          <div className={cn(className, "text-game-ice")}>
            <div className="absolute inset-0 animate-pulse-glow opacity-50 blur-md">
              <Snowflake size={64} />
            </div>
            <Snowflake size={64} />
          </div>
        );
      case "mystic":
        return (
          <div className={cn(className, "text-game-mystic")}>
            <div className="absolute inset-0 animate-pulse-glow opacity-50 blur-md">
              <Sparkles size={64} />
            </div>
            <Sparkles size={64} />
          </div>
        );
    }
  };
  
  return (
    <div className={cn(
      "spell-effect",
      position === "enemy" ? "top-32 md:top-40" : "bottom-32 md:bottom-40",
      "left-1/2 transform -translate-x-1/2",
      "pointer-events-none",
    )}>
      <div className="relative">
        {getProjectileIcon()}
        <span className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "text-white font-bold text-2xl drop-shadow-lg z-20",
          isAnimating ? "animate-bounce" : "animate-fade-out"
        )}>
          {isHealing ? "+" : "-"}{power}
        </span>
      </div>
    </div>
  );
};

export default SpellEffect;
