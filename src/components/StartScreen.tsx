import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [playerName, setPlayerName] = useState("Wizard");
  const navigate = useNavigate();
  
  const handleStart = () => {
    navigate('/game/offline', { 
      state: { playerName }
    });
  };
  
  return (
    <div className="fixed inset-0 bg-game-gradient flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-game-bg border-2 border-game-uiAccent rounded-xl p-8 w-full max-w-md">
        <h1 className="game-title text-5xl mb-2 text-center">Arcane Chain Quest</h1>
        <h2 className="text-game-uiAccent mb-8 text-center">Chain cards, cast spells, defeat foes!</h2>
        
        <div className="space-y-6">
          <div className="mb-8">
            <label className="block text-white mb-2" htmlFor="name">
              Your Wizard Name:
            </label>
            <input
              type="text"
              id="name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-game-ui text-white border border-game-uiAccent rounded-md focus:outline-none focus:ring-2 focus:ring-game-uiAccent"
              maxLength={15}
            />
          </div>
          
          <div className="bg-game-ui/50 p-4 rounded-lg mb-8">
            <h3 className="text-game-uiAccent font-bold mb-2">How to Play:</h3>
            <ul className="text-white list-disc pl-5 space-y-2">
              <li>Connect 3+ adjacent cards to cast spells</li>
              <li>Fire (🔥): Deal damage to enemy</li>
              <li>Nature (🍃): Heal yourself</li>
              <li>Ice (❄️): Chance to freeze enemy</li>
              <li>Mystic (✨): Random powerful effects</li>
              <li>Longer chains = stronger spells</li>
            </ul>
          </div>
          
          <Button 
            className={cn(
              "game-button w-full text-xl py-6",
              "hover:scale-105 transition-transform"
            )}
            onClick={handleStart}
          >
            Begin Adventure!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
