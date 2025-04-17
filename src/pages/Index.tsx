import { useState, useEffect } from "react";
import CardGrid from "@/components/CardGrid";
import Character from "@/components/Character";
import SpellEffect from "@/components/SpellEffect";
import TurnIndicator from "@/components/TurnIndicator";
import GameOverScreen from "@/components/GameOverScreen";
import StartScreen from "@/components/StartScreen";
import GameBackground from "@/components/GameBackground";
import { Card, Character as CharacterType, ElementType, GameState, Spell } from "@/types/game";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Flame, Leaf, Snowflake, Sparkles } from "lucide-react";

const Index = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [spellEffect, setSpellEffect] = useState<{
    type: ElementType;
    power: number;
    isHealing: boolean;
    position: "player" | "enemy";
  } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (gameState && gameState.gameStatus === "playing" && !showStartScreen) {
      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.fixed-game-grid')) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [gameState, showStartScreen]);

  const getElementIcon = (type: ElementType, size: number = 24) => {
    switch (type) {
      case 'fire':
        return <Flame className="text-game-fire" size={size} />;
      case 'nature':
        return <Leaf className="text-game-nature" size={size} />;
      case 'ice':
        return <Snowflake className="text-game-ice" size={size} />;
      case 'mystic':
        return <Sparkles className="text-game-mystic" size={size} />;
      default:
        return null;
    }
  };

  const initGame = (playerName: string) => {
    const createInitialGrid = () => {
      const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
      return Array(4).fill(null).map((_, i) => 
        Array(4).fill(null).map((_, j) => ({
          id: `${i}-${j}`,
          type: elements[Math.floor(Math.random() * elements.length)],
          row: i,
          col: j,
          selected: false
        }))
      );
    };

    const initialState: GameState = {
      grid: createInitialGrid(),
      player: {
        name: playerName,
        maxHealth: 100,
        currentHealth: 100,
        level: 1,
        image: "wizard"
      },
      enemy: {
        name: "Evil Goblin",
        maxHealth: 80,
        currentHealth: 80,
        level: 1,
        image: "goblin"
      },
      chainedCards: [],
      isPlayerTurn: true,
      turnCount: 1,
      lastSpell: null,
      gameStatus: "playing",
      enemyFrozen: false
    };

    setGameState(initialState);
    setShowStartScreen(false);
  };

  const restartGame = () => {
    setShowStartScreen(true);
    setGameState(null);
  };

  const calculateSpellPower = (cards: Card[]) => {
    const baseValue = 5;
    const length = cards.length;
    
    const scaleFactor = Math.pow(1.5, length - 2);
    return Math.floor(baseValue * scaleFactor);
  };

  const determineSpell = (cards: Card[]): Spell => {
    const elementType = cards[0].type;
    const length = cards.length;
    const power = calculateSpellPower(cards);
    
    switch (elementType) {
      case "fire":
        return {
          name: length >= 5 ? "Fire Storm" : "Fireball",
          element: "fire",
          power,
          description: `Deal ${power} damage to the enemy`,
          chainLength: length
        };
        
      case "nature":
        return {
          name: length >= 5 ? "Nature's Blessing" : "Healing Touch",
          element: "nature",
          power: Math.floor(power * 0.8),
          description: `Restore ${Math.floor(power * 0.8)} health`,
          chainLength: length
        };
        
      case "ice":
        return {
          name: length >= 5 ? "Arctic Freeze" : "Ice Bolt",
          element: "ice",
          power: Math.floor(power * 0.9),
          description: `Deal ${Math.floor(power * 0.9)} damage and ${length * 10}% chance to freeze`,
          chainLength: length
        };
        
      default: // mystic
        return {
          name: length >= 5 ? "Mystic Explosion" : "Arcane Bolt",
          element: "mystic",
          power: Math.floor(power * 1.2),
          description: `Deal ${Math.floor(power * 1.2)} arcane damage`,
          chainLength: length
        };
    }
  };

  const handlePlayerChain = (cards: Card[]) => {
    if (!gameState) return;
    
    const spell = determineSpell(cards);
    
    setGameState({
      ...gameState,
      lastSpell: spell,
    });
    
    setSpellEffect({
      type: spell.element,
      power: spell.power,
      isHealing: spell.element === "nature",
      position: spell.element === "nature" ? "player" : "enemy"
    });
    
    setTimeout(() => {
      if (spell.element === "nature") {
        const newHealth = Math.min(
          gameState.player.maxHealth,
          gameState.player.currentHealth + spell.power
        );
        
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            player: {
              ...prev.player,
              currentHealth: newHealth
            }
          };
        });
      } else {
        const newEnemyHealth = Math.max(0, gameState.enemy.currentHealth - spell.power);
        
        let enemyFrozen = gameState.enemyFrozen;
        
        if (spell.element === "ice") {
          const freezeChance = spell.chainLength * 10;
          if (Math.random() * 100 < freezeChance) {
            enemyFrozen = true;
            toast.success("Enemy frozen! They'll skip their next turn.");
          }
        }
        
        const newGameStatus = newEnemyHealth <= 0 ? "playerWon" : "playing";
        
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            enemy: {
              ...prev.enemy,
              currentHealth: newEnemyHealth
            },
            enemyFrozen,
            gameStatus: newGameStatus
          };
        });
        
        if (newGameStatus === "playerWon") {
          toast.success("Victory! You defeated the enemy!");
        }
      }
      
      setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.gameStatus !== "playing") return prev;
          return {
            ...prev,
            isPlayerTurn: false,
          };
        });
        
        if (gameState.gameStatus === "playing") {
          setTimeout(handleEnemyTurn, 1000);
        }
      }, 500);
    }, 1000);
  };

  const handleEnemyTurn = () => {
    if (!gameState) return;
    
    if (gameState.enemyFrozen) {
      toast.info("Enemy is frozen and skips their turn!");
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          enemyFrozen: false,
          isPlayerTurn: true,
          turnCount: prev.turnCount + 1
        };
      });
      return;
    }
    
    const spellTypes: ElementType[] = ["fire", "fire", "ice", "mystic"];
    const spellType = spellTypes[Math.floor(Math.random() * spellTypes.length)];
    
    const chainLength = Math.floor(Math.random() * 3) + 3;
    const power = calculateSpellPower(Array(chainLength).fill({ type: spellType } as Card));
    
    const spell: Spell = {
      name: `Enemy ${spellType.charAt(0).toUpperCase() + spellType.slice(1)} Attack`,
      element: spellType,
      power,
      description: `Deals ${power} damage`,
      chainLength
    };
    
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lastSpell: spell
      };
    });
    
    setSpellEffect({
      type: spell.element,
      power: spell.power,
      isHealing: false,
      position: "player"
    });
    
    setTimeout(() => {
      const newPlayerHealth = Math.max(0, gameState.player.currentHealth - spell.power);
      const newGameStatus = newPlayerHealth <= 0 ? "enemyWon" : "playing";
      
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          player: {
            ...prev.player,
            currentHealth: newPlayerHealth
          },
          gameStatus: newGameStatus
        };
      });
      
      if (newGameStatus === "enemyWon") {
        toast.error("Defeat! You were defeated by the enemy!");
      }
      
      setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.gameStatus !== "playing") return prev;
          return {
            ...prev,
            isPlayerTurn: true,
            turnCount: prev.turnCount + 1
          };
        });
      }, 500);
    }, 1000);
  };

  if (showStartScreen) {
    return (
      <>
        <GameBackground />
        <StartScreen onStart={initGame} />
      </>
    );
  }

  if (!gameState) {
    return null;
  }

  return (
    <>
      <GameBackground />
      <div className="game-container w-full overflow-hidden">
        <TurnIndicator 
          isPlayerTurn={gameState.isPlayerTurn}
          turnCount={gameState.turnCount}
        />
        
        <Character 
          character={gameState.enemy} 
          isEnemy={true} 
          isTakingDamage={spellEffect !== null && spellEffect.position === "enemy"}
          isFrozen={gameState.enemyFrozen}
        />
        
        <div className="opponent-grid">
          {gameState.grid.flat().slice(0, 16).map((card, index) => (
            <div
              key={`opponent-${index}`}
              className="opponent-card"
            >
              <div className={cn(
                "opponent-element",
                card.type === 'fire' && "bg-game-fire/20",
                card.type === 'nature' && "bg-game-nature/20",
                card.type === 'ice' && "bg-game-ice/20",
                card.type === 'mystic' && "bg-game-mystic/20"
              )}>
                {getElementIcon(card.type, 16)}
              </div>
            </div>
          ))}
        </div>
        
        <Character 
          character={gameState.player}
          isTakingDamage={spellEffect !== null && spellEffect.position === "player"}
          isHealing={spellEffect !== null && spellEffect.isHealing}
        />
        
        <div className="flex-1 flex items-center justify-center perspective-1000 z-20 mb-12">
          <div className="w-full transform-gpu">
            <CardGrid 
              onChainComplete={handlePlayerChain}
              disabled={!gameState.isPlayerTurn || gameState.gameStatus !== "playing"}
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
            onRestart={restartGame}
          />
        )}
      </div>
    </>
  );
};

export default Index;
