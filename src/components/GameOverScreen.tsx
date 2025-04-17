
import { Button } from "@/components/ui/button";
import { Character } from "@/types/game";

interface GameOverScreenProps {
  status: "playerWon" | "enemyWon";
  player: Character;
  enemy: Character;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ status, player, enemy, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-in">
      <div className="bg-game-bg border-2 border-game-uiAccent rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="game-title text-4xl mb-6">
          {status === "playerWon" ? "Victory!" : "Defeat!"}
        </h2>
        
        <div className="text-white text-xl mb-8">
          {status === "playerWon" ? (
            <p>You defeated the enemy with {player.currentHealth} health remaining!</p>
          ) : (
            <p>You were defeated by the enemy!</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            className="game-button text-xl"
            onClick={onRestart}
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
