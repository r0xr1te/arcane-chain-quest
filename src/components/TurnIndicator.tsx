
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  turnCount: number;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn, turnCount }) => {
  return (
    <div className="fixed top-4 left-4 z-30">
      <div className="bg-game-ui/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg border border-white/10">
        <div className={cn(
          "w-2 h-2 rounded-full shadow-lg relative",
          isPlayerTurn ? "bg-health-player" : "bg-health-enemy",
          "animate-pulse-glow after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-50 after:blur-sm"
        )} />
        <span className="text-white font-medium text-xs tracking-wide">
          {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
        </span>
        <div className="flex items-center gap-1 bg-black/20 rounded-full px-1.5 py-0.5">
          <Clock className="w-2.5 h-2.5 text-gray-300" />
          <span className="text-gray-300 text-xs font-medium">
            {turnCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TurnIndicator;
