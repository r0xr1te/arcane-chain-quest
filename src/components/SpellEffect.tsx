
import { Card, ElementType } from "@/types/game";
import { useEffect, useState } from "react";
import { Flame, Leaf, Snowflake, Sparkles, Rainbow } from "lucide-react";
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
      case "skill":
        return (
          <div className={cn(className, "rainbow-skill")}>
            <div 
              className={cn(
                "absolute inset-0 animate-pulse-glow opacity-70 blur-md",
                "rainbow-glow"
              )}
            >
              <Rainbow size={64} />
            </div>
            <Rainbow size={64} className="animate-rainbow-pulse" />
            <style dangerouslySetInnerHTML={{ __html: `
              .rainbow-skill {
                color: #8B5CF6;
                animation: rainbow-color 2s infinite;
              }
              .rainbow-glow {
                filter: drop-shadow(0 0 8px currentColor);
              }
              @keyframes rainbow-color {
                0% { color: #8B5CF6; } /* Purple */
                20% { color: #D946EF; } /* Pink */
                40% { color: #F97316; } /* Orange */
                60% { color: #0EA5E9; } /* Blue */
                80% { color: #33C3F0; } /* Light Blue */
                100% { color: #8B5CF6; } /* Back to Purple */
              }
              @keyframes rainbow-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}} />
          </div>
        );
    }
  };
  
  return (
    <div className={cn(
      "spell-effect",
      position === "enemy" ? "top-32 md:top-40" : "bottom-32 md:bottom-40",
      "left-1/2 transform -translate-x-1/2",
      "pointer-events-none absolute",
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
