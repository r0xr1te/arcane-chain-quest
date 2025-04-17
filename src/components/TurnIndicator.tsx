
import { cn } from "@/lib/utils";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  turnCount: number;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn, turnCount }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="bg-game-ui rounded-full px-4 py-2 flex items-center gap-2">
        <div className={cn(
          "w-3 h-3 rounded-full",
          isPlayerTurn ? "bg-health-player" : "bg-health-enemy",
          "animate-pulse-glow"
        )} />
        <span className="text-white font-medium">
          {isPlayerTurn ? "Your Turn" : "Enemy Turn"}
        </span>
        <span className="text-gray-400 text-sm ml-2">
          Turn {turnCount}
        </span>
      </div>
    </div>
  );
};

export default TurnIndicator;
