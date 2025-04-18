
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardGrid from "@/components/CardGrid";
import Character from "@/components/Character";
import SpellEffect from "@/components/SpellEffect";
import TurnIndicator from "@/components/TurnIndicator";
import GameOverScreen from "@/components/GameOverScreen";
import GameBackground from "@/components/GameBackground";
import { useGameState } from "@/context/GameStateContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { gameState, roomData, loading, joinRoom, leaveRoom, updateGameState, handlePlayerChain, endTurn, isMyTurn } = useGameState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [spellEffect, setSpellEffect] = useState<{
    type: ElementType;
    power: number;
    isHealing: boolean;
    position: "player" | "enemy";
  } | null>(null);

  useEffect(() => {
    if (roomId && !roomData && user) {
      joinRoom(roomId);
    }
  }, [roomId, roomData, user]);

  useEffect(() => {
    if (gameState?.lastSpell && !spellEffect) {
      const spell = gameState.lastSpell;
      
      setSpellEffect({
        type: spell.element,
        power: spell.power,
        isHealing: spell.element === 'nature',
        position: spell.element === 'nature' ? 'player' : 'enemy'
      });
      
      setTimeout(() => {
        setSpellEffect(null);
      }, 2000);
    }
  }, [gameState?.lastSpell]);

  if (loading || !gameState) {
    return (
      <>
        <GameBackground />
        <div className="flex h-screen items-center justify-center">
          <div className="bg-game-bg p-8 rounded-lg border border-game-uiAccent">
            <h2 className="game-title text-2xl mb-4">Loading Game Room...</h2>
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-game-uiAccent/20 rounded w-24"></div>
              <div className="h-4 bg-game-uiAccent/30 rounded w-36"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleLeaveRoom = () => {
    if (confirm("Are you sure you want to leave the room?")) {
      leaveRoom();
    }
  };

  const handleTurnTimeout = () => {
    if (isMyTurn()) {
      toast.warning("Time's up! Your turn has ended.");
      endTurn();
    }
  };

  return (
    <>
      <GameBackground />
      <div className="game-container w-full overflow-hidden">
        <Button 
          onClick={handleLeaveRoom}
          className="absolute top-3 right-3 z-30 bg-game-ui/50 hover:bg-game-ui/70"
          size="sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Leave Game
        </Button>
        
        <TurnIndicator 
          isPlayerTurn={isMyTurn()}
          turnCount={gameState.turnCount}
          turnEndTime={gameState.turnEndTime}
          onTimeEnd={handleTurnTimeout}
        />
        
        <Character 
          character={gameState.enemy} 
          isEnemy={true} 
          isTakingDamage={spellEffect !== null && spellEffect.position === "enemy"}
          isFrozen={gameState.enemyFrozen}
        />
        
        {/* Opponent Grid - Always shown */}
        <CardGrid
          onChainComplete={() => {}}
          disabled={true}
          isOpponentGrid={true}
          size={5}
        />
        
        <Character 
          character={gameState.player}
          isTakingDamage={spellEffect !== null && spellEffect.position === "player"}
          isHealing={spellEffect !== null && spellEffect.isHealing}
        />
        
        <div className="flex-1 flex items-center justify-center perspective-1000 z-20 mb-12">
          <div className="w-full transform-gpu">
            <CardGrid 
              onChainComplete={handlePlayerChain}
              disabled={!isMyTurn() || gameState.gameStatus !== "playing"}
              size={5}
            />
          </div>
        </div>
        
        {spellEffect && (
          <SpellEffect
            type={spellEffect.type}
            power={spellEffect.power}
            isHealing={spellEffect.isHealing}
            position={spellEffect.position}
            onComplete={() => setSpellEffect(null)}
          />
        )}
        
        {gameState.gameStatus !== "playing" && (
          <GameOverScreen 
            status={gameState.gameStatus} 
            player={gameState.player}
            enemy={gameState.enemy}
            onRestart={() => navigate('/')}
          />
        )}
      </div>
    </>
  );
};

export default GameRoom;
