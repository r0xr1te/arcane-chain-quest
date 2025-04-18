import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardGrid from "@/components/CardGrid";
import Character from "@/components/Character";
import SpellEffect from "@/components/SpellEffect";
import GameBackground from "@/components/GameBackground";
import { ElementType, GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import TurnIndicator from "@/components/TurnIndicator";
import { toast } from "sonner";

const OfflineGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const playerName = location.state?.playerName || "Wizard";
  
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    enemyGrid: [],
    player: {
      name: playerName,
      maxHealth: 100,
      currentHealth: 100,
      level: 1,
      image: "wizard"
    },
    enemy: {
      name: "Goblin",
      maxHealth: 100,
      currentHealth: 100,
      level: 1,
      image: "goblin"
    },
    chainedCards: [],
    isPlayerTurn: true,
    turnCount: 1,
    lastSpell: null,
    gameStatus: "playing",
    enemyFrozen: false
  });

  const [spellEffect, setSpellEffect] = useState<{
    type: ElementType;
    power: number;
    isHealing: boolean;
    position: "player" | "enemy";
  } | null>(null);

  const [turnEndTime, setTurnEndTime] = useState<number | undefined>(Date.now() + 10000);

  const createInitialGrid = (size: 4 | 5 = 5) => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic', 'skill'];
    return Array(size).fill(null).map((_, i) => 
      Array(size).fill(null).map((_, j) => ({
        id: `${i}-${j}`,
        type: elements[Math.floor(Math.random() * (elements.length - 1))], // Don't include skill type yet
        row: i,
        col: j,
        selected: false
      }))
    );
  };

  const isAdjacent = (card1: any, card2: any) => {
    // Only allow horizontal or vertical connections, not diagonal
    return (
      (Math.abs(card1.row - card2.row) === 1 && card1.col === card2.col) || 
      (Math.abs(card1.col - card2.col) === 1 && card1.row === card2.row)
    );
  };

  const checkForPossibleChains = (grid: any) => {
    const cards = grid.flat();
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const adjacentCards = cards.filter((c: any) => 
        c.id !== card.id && 
        isAdjacent(card, c) &&
        (c.type === card.type || c.type === 'skill' || card.type === 'skill')
      );
      if (adjacentCards.length > 0) {
        return true; // Found at least one possible chain
      }
    }
    return false; // No possible chains found
  };

  useEffect(() => {
    let playerGrid = createInitialGrid();
    let enemyGrid = createInitialGrid();
    
    // Ensure there's at least one possible chain in each grid
    while (!checkForPossibleChains(playerGrid)) {
      playerGrid = createInitialGrid();
    }
    
    while (!checkForPossibleChains(enemyGrid)) {
      enemyGrid = createInitialGrid();
    }

    setGameState(prevState => ({
      ...prevState,
      grid: playerGrid,
      enemyGrid: enemyGrid,
      turnEndTime: Date.now() + 10000 // Set initial turn end time
    }));
  }, []);

  const calculateSpellPower = (cards: any) => {
    const baseValue = 5;
    const length = cards.length;
    
    const scaleFactor = Math.pow(1.5, length - 2);
    return Math.floor(baseValue * scaleFactor);
  };

  const determineSpellEffect = (cards: any) => {
    // Check if there are any skill cards in the chain
    const hasSkill = cards.some((card: any) => card.type === 'skill');
    const elementType = cards[0].type === 'skill' ? 
      cards.find((card: any) => card.type !== 'skill')?.type || 'fire' : cards[0].type;
    
    const length = cards.length;
    const power = calculateSpellPower(cards);
    
    // Boost power if skill card is included
    const actualPower = hasSkill ? Math.floor(power * 1.3) : power;
    
    switch (elementType as ElementType) {
      case "fire":
        return {
          name: length >= 5 ? "Fire Storm" : "Fireball",
          element: "fire" as ElementType,
          power: actualPower,
          description: `Deal ${actualPower} damage to the enemy`,
          chainLength: length
        };
        
      case "nature":
        return {
          name: length >= 5 ? "Nature's Blessing" : "Healing Touch",
          element: "nature" as ElementType,
          power: Math.floor(actualPower * 0.8),
          description: `Restore ${Math.floor(actualPower * 0.8)} health`,
          chainLength: length
        };
        
      case "ice":
        return {
          name: length >= 5 ? "Arctic Freeze" : "Ice Bolt",
          element: "ice" as ElementType,
          power: Math.floor(actualPower * 0.9),
          description: `Deal ${Math.floor(actualPower * 0.9)} damage and ${length * 10}% chance to freeze`,
          chainLength: length
        };
        
      default: // mystic
        return {
          name: length >= 5 ? "Mystic Explosion" : "Arcane Bolt",
          element: "mystic" as ElementType,
          power: Math.floor(actualPower * 1.2),
          description: `Deal ${Math.floor(actualPower * 1.2)} arcane damage`,
          chainLength: length
        };
    }
  };

  const handleTurnTimeout = () => {
    if (gameState.isPlayerTurn && gameState.gameStatus === "playing") {
      toast.warning("Time's up! Your turn has ended.");
      setGameState(prevState => ({
        ...prevState,
        isPlayerTurn: false,
        turnCount: prevState.turnCount + 1,
      }));
      
      // Execute enemy turn after a short delay
      setTimeout(() => {
        executeEnemyTurn();
      }, 500);
    }
  };

  const executeEnemyTurn = () => {
    if (gameState.gameStatus !== "playing") return;
    
    if (gameState.enemyFrozen) {
      // Reset frozen status and end enemy turn
      setGameState(prevState => ({
        ...prevState,
        enemyFrozen: false,
        isPlayerTurn: true,
        turnCount: prevState.turnCount + 1,
        turnEndTime: Date.now() + 10000 // Reset timer for player's turn
      }));
      toast.info("Enemy is frozen and skips their turn!");
      return;
    }

    // Find the best chain in the enemy grid
    const bestChain = findBestEnemyChain(gameState.enemyGrid);
    
    if (bestChain.length >= 2) {
      // Execute the enemy spell
      const spell = determineSpellEffect(bestChain);
      
      setGameState(prevState => ({
        ...prevState,
        lastSpell: spell
      }));
      
      // Show spell effect for enemy
      setSpellEffect({
        type: spell.element,
        power: spell.power,
        isHealing: spell.element === "nature",
        position: spell.element === "nature" ? "enemy" : "player"
      });
      
      setTimeout(() => {
        if (spell.element === "nature") {
          const newHealth = Math.min(
            gameState.enemy.maxHealth,
            gameState.enemy.currentHealth + spell.power
          );
          
          setGameState(prevState => ({
            ...prevState,
            enemy: {
              ...prevState.enemy,
              currentHealth: newHealth
            }
          }));
          
          toast.info(`Enemy casts ${spell.name} and heals for ${spell.power} health!`);
        } else {
          const newPlayerHealth = Math.max(0, gameState.player.currentHealth - spell.power);
          
          setGameState(prevState => ({
            ...prevState,
            player: {
              ...prevState.player,
              currentHealth: newPlayerHealth
            },
            gameStatus: newPlayerHealth <= 0 ? "enemyWon" : "playing"
          }));
          
          toast.error(`Enemy casts ${spell.name} and deals ${spell.power} damage!`);
          
          if (newPlayerHealth <= 0) {
            toast.error("You have been defeated!");
          }
        }
        
        setSpellEffect(null);
        
        // End enemy turn
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            isPlayerTurn: true,
            turnCount: prevState.turnCount + 1,
            turnEndTime: Date.now() + 10000 // Reset timer for player's turn
          }));
        }, 500);
      }, 1000);
    } else {
      // No valid chain found, just end turn
      toast.info("Enemy couldn't find a spell to cast!");
      setGameState(prevState => ({
        ...prevState,
        isPlayerTurn: true,
        turnCount: prevState.turnCount + 1,
        turnEndTime: Date.now() + 10000 // Reset timer for player's turn
      }));
    }
  };

  const findBestEnemyChain = (grid: any) => {
    const cards = grid.flat();
    let bestChain: any[] = [];
    
    // Try to find a nature chain if enemy health is low
    if (gameState.enemy.currentHealth < 50) {
      const natureChain = findChainByType(cards, "nature");
      if (natureChain.length >= 2) {
        return natureChain;
      }
    }
    
    // Otherwise find the longest chain
    for (let i = 0; i < cards.length; i++) {
      const startCard = cards[i];
      const chain = findLongestChain(cards, startCard, []);
      if (chain.length > bestChain.length) {
        bestChain = chain;
      }
    }
    
    return bestChain;
  };

  const findChainByType = (cards: any[], targetType: ElementType) => {
    for (let i = 0; i < cards.length; i++) {
      const startCard = cards[i];
      if (startCard.type === targetType || startCard.type === 'skill') {
        const chain = findLongestChain(cards, startCard, [], targetType);
        if (chain.length >= 2) {
          return chain;
        }
      }
    }
    return [];
  };

  const findLongestChain = (
    cards: any[], 
    currentCard: any, 
    currentChain: any[] = [], 
    preferredType: ElementType | null = null
  ) => {
    const newChain = [...currentChain, currentCard];
    
    // Get all possible next cards that are adjacent and of the same type (or skill)
    const validAdjacentCards = cards.filter((card: any) => {
      if (newChain.some((c: any) => c.id === card.id)) return false;
      
      if (!isAdjacent(currentCard, card)) return false;
      
      // Check if types match or either is a skill card
      const typeMatches = 
        card.type === currentCard.type || 
        card.type === 'skill' || 
        currentCard.type === 'skill';
      
      // If we have a preferred type, make sure we're following that type
      if (preferredType) {
        return typeMatches && (card.type === preferredType || card.type === 'skill');
      }
      
      return typeMatches;
    });
    
    if (validAdjacentCards.length === 0) {
      return newChain;
    }
    
    let longestChain = newChain;
    
    for (const nextCard of validAdjacentCards) {
      const nextChain = findLongestChain(cards, nextCard, newChain, preferredType);
      if (nextChain.length > longestChain.length) {
        longestChain = nextChain;
      }
    }
    
    return longestChain;
  };

  const handlePlayerChain = (cards: any) => {
    if (!gameState) return;
    
    const spell = determineSpellEffect(cards);
    
    setGameState(prevState => ({
      ...prevState,
      lastSpell: spell
    }));
    
    // Show spell effect for player
    setSpellEffect({
      type: spell.element,
      power: spell.power,
      isHealing: spell.element === "nature",
      position: spell.element === "nature" ? "player" : "enemy"
    });
    
    setTimeout(() => {
      setSpellEffect(null);
      
      if (spell.element === "nature") {
        const newHealth = Math.min(
          100,
          gameState.player.currentHealth + spell.power
        );
        
        setGameState(prevState => ({
          ...prevState,
          player: {
            ...prevState.player,
            currentHealth: newHealth
          }
        }));
        
        toast.success(`You cast ${spell.name} and heal for ${spell.power} health!`);
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
        
        setGameState(prevState => ({
          ...prevState,
          enemy: {
            ...prevState.enemy,
            currentHealth: newEnemyHealth
          },
          enemyFrozen,
          gameStatus: newGameStatus
        }));
        
        if (newGameStatus === "playerWon") {
          toast.success("Victory! You defeated the enemy!");
        }
      }
      
      // End player turn and start enemy turn after a delay
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          isPlayerTurn: false,
          turnEndTime: undefined // Clear timer during transition
        }));
        
        // Trigger enemy turn after a short delay
        setTimeout(() => {
          executeEnemyTurn();
        }, 500);
      }, 500);
    }, 1000);
  };

  useEffect(() => {
    if (gameState.gameStatus === "playerWon") {
      // Handle player victory
      toast.success("You won the battle!");
    } else if (gameState.gameStatus === "enemyWon") {
      // Handle player defeat
      toast.error("You were defeated!");
    }
  }, [gameState.gameStatus]);

  return (
    <>
      <GameBackground />
      <div className="game-container w-full overflow-hidden">
        <Button 
          onClick={() => navigate('/')}
          className="absolute top-3 right-3 z-30 bg-game-ui/50 hover:bg-game-ui/70"
          size="sm"
        >
          Leave Game
        </Button>
        
        <TurnIndicator 
          isPlayerTurn={gameState.isPlayerTurn} 
          turnCount={gameState.turnCount} 
          turnEndTime={gameState.turnEndTime}
          onTimeEnd={handleTurnTimeout}
        />
        
        <Character 
          character={gameState.enemy} 
          isEnemy={true} 
          isTakingDamage={spellEffect !== null && spellEffect.position === "enemy" && !spellEffect.isHealing}
          isHealing={spellEffect !== null && spellEffect.position === "enemy" && spellEffect.isHealing}
          isFrozen={gameState.enemyFrozen}
        />
        
        <div className="flex-1 flex items-center justify-center perspective-1000 z-20">
          <CardGrid 
            onChainComplete={handlePlayerChain}
            disabled={!gameState.isPlayerTurn || gameState.gameStatus !== "playing"}
            size={5}
          />
        </div>
        
        <Character 
          character={gameState.player}
          isTakingDamage={spellEffect !== null && spellEffect.position === "player" && !spellEffect.isHealing}
          isHealing={spellEffect !== null && spellEffect.position === "player" && spellEffect.isHealing}
        />
        
        {spellEffect && (
          <SpellEffect
            type={spellEffect.type}
            power={spellEffect.power}
            isHealing={spellEffect.isHealing}
            position={spellEffect.position}
            onComplete={() => setSpellEffect(null)}
          />
        )}
      </div>
    </>
  );
};

export default OfflineGame;
