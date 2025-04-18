import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardGrid from "@/components/CardGrid";
import Character from "@/components/Character";
import SpellEffect from "@/components/SpellEffect";
import GameBackground from "@/components/GameBackground";
import { ElementType, GameState } from "@/types/game";
import { Button } from "@/components/ui/button";

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
      enemyGrid: enemyGrid
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
    
    switch (elementType) {
      case "fire":
        return {
          name: length >= 5 ? "Fire Storm" : "Fireball",
          element: "fire",
          power: actualPower,
          description: `Deal ${actualPower} damage to the enemy`,
          chainLength: length
        };
        
      case "nature":
        return {
          name: length >= 5 ? "Nature's Blessing" : "Healing Touch",
          element: "nature",
          power: Math.floor(actualPower * 0.8),
          description: `Restore ${Math.floor(actualPower * 0.8)} health`,
          chainLength: length
        };
        
      case "ice":
        return {
          name: length >= 5 ? "Arctic Freeze" : "Ice Bolt",
          element: "ice",
          power: Math.floor(actualPower * 0.9),
          description: `Deal ${Math.floor(actualPower * 0.9)} damage and ${length * 10}% chance to freeze`,
          chainLength: length
        };
        
      default: // mystic
        return {
          name: length >= 5 ? "Mystic Explosion" : "Arcane Bolt",
          element: "mystic",
          power: Math.floor(actualPower * 1.2),
          description: `Deal ${Math.floor(actualPower * 1.2)} arcane damage`,
          chainLength: length
        };
    }
  };

  const handlePlayerChain = (cards: any) => {
    if (!gameState) return;
    
    const spell = determineSpellEffect(cards);
    
    setGameState(prevState => ({
      ...prevState,
      lastSpell: spell
    }));
    
    setTimeout(() => {
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
      } else {
        const newEnemyHealth = Math.max(0, gameState.enemy.currentHealth - spell.power);
        
        let enemyFrozen = gameState.enemyFrozen;
        
        if (spell.element === "ice") {
          const freezeChance = spell.chainLength * 10;
          if (Math.random() * 100 < freezeChance) {
            enemyFrozen = true;
            alert("Enemy frozen! They'll skip their next turn.");
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
          alert("Victory! You defeated the enemy!");
        }
      }
      
      // End the turn
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          isPlayerTurn: !prevState.isPlayerTurn,
          turnCount: prevState.turnCount + 1
        }));
      }, 500);
    }, 1000);
  };

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
        
        <Character 
          character={gameState.enemy} 
          isEnemy={true} 
          isTakingDamage={spellEffect !== null && spellEffect.position === "enemy"}
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
          isTakingDamage={spellEffect !== null && spellEffect.position === "player"}
          isHealing={spellEffect !== null && spellEffect.isHealing}
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
