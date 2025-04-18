
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  turnCount: number;
  turnEndTime?: number;
  onTimeEnd?: () => void;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ 
  isPlayerTurn, 
  turnCount,
  turnEndTime,
  onTimeEnd
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(10);
  
  useEffect(() => {
    // If no specific end time is provided, default to 10 seconds
    if (!turnEndTime) {
      setTimeLeft(10);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((turnEndTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && onTimeEnd) {
        onTimeEnd();
      }
    };
    
    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [turnEndTime, onTimeEnd]);

  return (
    <div className="absolute top-3 left-3 z-30">
      <div className="bg-game-ui/80 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1 shadow-lg border border-white/10">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full shadow-lg relative",
          isPlayerTurn ? "bg-health-player" : "bg-health-enemy",
          "animate-pulse-glow after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-50 after:blur-sm"
        )} />
        <span className="text-white font-medium text-xs tracking-wide">
          {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
        </span>
        <div className="flex items-center gap-0.5 bg-black/20 rounded-full px-1.5 py-0.5">
          <Clock className={cn(
            "w-2.5 h-2.5", 
            timeLeft <= 3 ? "text-red-400 animate-pulse" : "text-gray-300"
          )} />
          <span className={cn(
            "text-xs font-medium",
            timeLeft <= 3 ? "text-red-400 animate-pulse" : "text-gray-300"
          )}>
            {turnCount} ({timeLeft}s)
          </span>
        </div>
      </div>
    </div>
  );
};

export default TurnIndicator;
