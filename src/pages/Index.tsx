
import { useState } from "react";
import { Link } from "react-router-dom";
import GameBackground from "@/components/GameBackground";
import StartScreen from "@/components/StartScreen";
import RoomActions from "@/components/room/RoomActions";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

const Index = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const { user, loading } = useAuth();

  return (
    <>
      <GameBackground />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-game-bg border-2 border-game-uiAccent rounded-xl p-8 w-full max-w-md text-center">
          <h1 className="game-title text-5xl mb-2 text-center">Arcane Chain Quest</h1>
          <h2 className="text-game-uiAccent mb-8 text-center">Chain cards, cast spells, defeat foes!</h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-game-uiAccent/20 rounded"></div>
              <div className="h-10 bg-game-uiAccent/30 rounded"></div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              <div className="text-white text-lg mb-4">
                Welcome back, <span className="font-bold">{user.username}</span>!
              </div>
              
              <RoomActions />
              
              <div className="border-t border-game-uiAccent/30 pt-4 mt-6">
                <Link to="/dashboard">
                  <Button className="game-button w-full">
                    Go to Dashboard
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-white mb-4">
                Sign in to access multiplayer mode and deck building!
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login">
                  <Button className="game-button w-full">
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </Button>
                </Link>
                
                <Link to="/register">
                  <Button className="game-button w-full">
                    <UserPlus size={18} className="mr-2" />
                    Register
                  </Button>
                </Link>
              </div>
              
              <div className="border-t border-game-uiAccent/30 pt-4 mt-6">
                <Button className="game-button w-full" onClick={() => setShowStartScreen(false)}>
                  Play Offline
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!showStartScreen && <StartScreen onStart={(name) => initGame(name)} />}
    </>
  );
};

export default Index;
