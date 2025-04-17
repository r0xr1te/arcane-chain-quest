
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  turnCount: number;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn, turnCount }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="bg-game-ui/80 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg border border-white/10">
        <div className={cn(
          "w-4 h-4 rounded-full shadow-lg relative",
          isPlayerTurn ? "bg-health-player" : "bg-health-enemy",
          "animate-pulse-glow after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-50 after:blur-sm"
        )} />
        <span className="text-white font-bold text-lg tracking-wide">
          {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
        </span>
        <div className="flex items-center gap-1 bg-black/20 rounded-full px-3 py-1">
          <Clock className="w-4 h-4 text-gray-300" />
          <span className="text-gray-300 font-medium">
            Turn {turnCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TurnIndicator;
