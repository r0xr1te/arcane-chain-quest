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

  const createInitialGrid = (size: 4 | 5 = 5) => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
    return Array(size).fill(null).map((_, i) => 
      Array(size).fill(null).map((_, j) => ({
        id: `${i}-${j}`,
        type: elements[Math.floor(Math.random() * elements.length)],
        row: i,
        col: j,
        selected: false
      }))
    );
  };

  const checkForPossibleChains = (grid: Card[][]) => {
    const cards = grid.flat();
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const adjacentCards = cards.filter(c => 
        c.id !== card.id && 
        isAdjacent(card, c) &&
        c.type === card.type
      );
      if (adjacentCards.length > 0) {
        return true; // Found at least one possible chain
      }
    }
    return false; // No possible chains found
  };

  const isAdjacent = (card1: Card, card2: Card) => {
    const isHorizontalAdjacent = card1.row === card2.row && Math.abs(card1.col - card2.col) === 1;
    const isVerticalAdjacent = card1.col === card2.col && Math.abs(card1.row - card2.row) === 1;
    return isHorizontalAdjacent || isVerticalAdjacent;
  };

  const initGame = (playerName: string) => {
    let playerGrid = createInitialGrid();
    let enemyGrid = createInitialGrid();
    
    while (!checkForPossibleChains(playerGrid)) {
      playerGrid = createInitialGrid();
    }
    
    while (!checkForPossibleChains(enemyGrid)) {
      enemyGrid = createInitialGrid();
    }
    
    const initialState: GameState = {
      grid: playerGrid,
      enemyGrid: enemyGrid,
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

  const simpleReplaceCards = (grid: Card[][], usedCards: Card[]) => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
    const newGrid = [...grid];
    
    usedCards.forEach(card => {
      newGrid[card.row][card.col] = {
        id: card.id,
        type: elements[Math.floor(Math.random() * elements.length)],
        row: card.row,
        col: card.col,
        selected: false
      };
    });
    
    return newGrid;
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
    
    const enemyGrid = gameState.enemyGrid;
    let possibleChains: Card[][] = [];
    
    const typeGroups: Record<ElementType, Card[]> = {
      'fire': [],
      'ice': [],
      'mystic': [],
      'nature': []
    };
    
    enemyGrid.flat().forEach(card => {
      typeGroups[card.type].push(card);
    });
    
    Object.keys(typeGroups).forEach(type => {
      const cards = typeGroups[type as ElementType];
      if (cards.length >= 3) {
        for (let i = 0; i < cards.length; i++) {
          let chain: Card[] = [cards[i]];
          let processed = new Set<string>([cards[i].id]);
          
          while (chain.length < 5) {
            let foundAdjacent = false;
            const lastCard = chain[chain.length - 1];
            
            const adjacent = cards.filter(c => 
              !processed.has(c.id) && 
              isAdjacent(lastCard, c)
            );
            
            if (adjacent.length > 0) {
              chain.push(adjacent[0]);
              processed.add(adjacent[0].id);
              foundAdjacent = true;
            }
          }
          
          if (chain.length >= 3) {
            possibleChains.push([...chain]);
          }
        }
      }
    });
    
    if (possibleChains.length === 0) {
      const newEnemyGrid = createInitialGrid();
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          enemyGrid: newEnemyGrid
        };
      });
      toast.info("Enemy has no possible moves! Their grid is refreshed.");
      
      setTimeout(() => handleEnemyTurn(), 1000);
      return;
    }
    
    const sortedChains = [...possibleChains].sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      }
      
      const typeScore = (type: ElementType): number => {
        if (type === 'fire') return 4;
        if (type === 'mystic') return 3;
        if (type === 'ice') return 2;
        return 1;
      };
      
      return typeScore(b[0].type) - typeScore(a[0].type);
    });
    
    const selectedChain = sortedChains[0];
    const chainType = selectedChain[0].type;
    const chainLength = selectedChain.length;
    
    const power = calculateSpellPower(selectedChain);
    
    const spell: Spell = {
      name: `Enemy ${chainType.charAt(0).toUpperCase() + chainType.slice(1)} Attack`,
      element: chainType,
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
      isHealing: spell.element === 'nature',
      position: spell.element === 'nature' ? 'enemy' : 'player'
    });
    
    setTimeout(() => {
      let newPlayerHealth = gameState.player.currentHealth;
      let newEnemyHealth = gameState.enemy.currentHealth;
      
      if (spell.element === 'nature') {
        newEnemyHealth = Math.min(
          gameState.enemy.maxHealth, 
          gameState.enemy.currentHealth + Math.floor(power * 0.8)
        );
      } else {
        newPlayerHealth = Math.max(0, gameState.player.currentHealth - power);
      }
      
      const newGameStatus = newPlayerHealth <= 0 ? "enemyWon" : "playing";
      
      const newEnemyGrid = simpleReplaceCards(gameState.enemyGrid, selectedChain);
      
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          player: {
            ...prev.player,
            currentHealth: newPlayerHealth
          },
          enemy: {
            ...prev.enemy,
            currentHealth: newEnemyHealth
          },
          enemyGrid: newEnemyGrid,
          gameStatus: newGameStatus
        };
      });
      
      if (newGameStatus === "enemyWon") {
        toast.error("Defeat! You were defeated by the enemy!");
      }
      
      setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.gameStatus !== "playing") return prev;
          
          const hasChains = checkForPossibleChains(prev.enemyGrid);
          let enemyGrid = prev.enemyGrid;
          
          if (!hasChains) {
            enemyGrid = createInitialGrid();
            toast.info("Enemy has no possible moves! Their grid is refreshed.");
          }
          
          return {
            ...prev,
            isPlayerTurn: true,
            turnCount: prev.turnCount + 1,
            enemyGrid
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
              disabled={!gameState.isPlayerTurn || gameState.gameStatus !== "playing"}
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
            onRestart={restartGame}
          />
        )}
      </div>
    </>
  );
};

export default Index;
