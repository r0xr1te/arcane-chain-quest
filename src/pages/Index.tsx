
import { useState, useEffect } from "react";
import CardGrid from "@/components/CardGrid";
import Character from "@/components/Character";
import SpellEffect from "@/components/SpellEffect";
import TurnIndicator from "@/components/TurnIndicator";
import GameOverScreen from "@/components/GameOverScreen";
import StartScreen from "@/components/StartScreen";
import { Card, Character as CharacterType, ElementType, GameState, Spell } from "@/types/game";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [spellEffect, setSpellEffect] = useState<{
    type: ElementType;
    power: number;
    isHealing: boolean;
    position: "player" | "enemy";
  } | null>(null);

  const initGame = (playerName: string) => {
    const initialState: GameState = {
      grid: [],
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
    const baseValue = 10;
    const length = cards.length;
    
    // Power increases exponentially with chain length
    return Math.floor(baseValue * (1 + (length - 3) * 0.5) * length);
  };

  const determineSpell = (cards: Card[]): Spell => {
    // Count occurrences of each element
    const elementCounts = cards.reduce((counts, card) => {
      counts[card.type] = (counts[card.type] || 0) + 1;
      return counts;
    }, {} as Record<ElementType, number>);
    
    // Find the most common element
    const mainElementType = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as ElementType;
    
    // Check if all cards are the same element
    const isAllSameElement = Object.keys(elementCounts).length === 1;
    
    // Calculate power based on chain length
    const power = calculateSpellPower(cards);
    
    // Determine spell name and description based on element and length
    if (isAllSameElement) {
      switch (mainElementType) {
        case "fire":
          return {
            name: cards.length >= 5 ? "Fire Storm" : "Fireball",
            element: "fire",
            power,
            description: `Deal ${power} damage to the enemy`,
            chainLength: cards.length
          };
          
        case "nature":
          return {
            name: cards.length >= 5 ? "Nature's Blessing" : "Healing Touch",
            element: "nature",
            power: Math.floor(power * 0.8), // Healing is slightly less powerful
            description: `Restore ${Math.floor(power * 0.8)} health`,
            chainLength: cards.length
          };
          
        case "ice":
          return {
            name: cards.length >= 5 ? "Arctic Freeze" : "Ice Bolt",
            element: "ice",
            power: Math.floor(power * 0.9), // Ice does less damage but has freeze chance
            description: `Deal ${Math.floor(power * 0.9)} damage and ${cards.length * 10}% chance to freeze`,
            chainLength: cards.length
          };
          
        case "mystic":
          return {
            name: cards.length >= 5 ? "Mystic Explosion" : "Arcane Bolt",
            element: "mystic",
            power: Math.floor(power * 1.2), // Mystic does more damage
            description: `Deal ${Math.floor(power * 1.2)} arcane damage`,
            chainLength: cards.length
          };
      }
    }
    
    // Mixed element chain
    return {
      name: "Chaotic Blast",
      element: mainElementType,
      power: Math.floor(power * 0.8), // Mixed chains are less powerful
      description: `Deal ${Math.floor(power * 0.8)} mixed damage`,
      chainLength: cards.length
    };
  };

  const handlePlayerChain = (cards: Card[]) => {
    if (!gameState) return;
    
    // Calculate spell and apply effects
    const spell = determineSpell(cards);
    
    // Store the spell for display
    setGameState({
      ...gameState,
      lastSpell: spell,
    });
    
    // Show spell effect
    setSpellEffect({
      type: spell.element,
      power: spell.power,
      isHealing: spell.element === "nature",
      position: spell.element === "nature" ? "player" : "enemy"
    });
    
    // Apply spell effects
    setTimeout(() => {
      if (spell.element === "nature") {
        // Healing spell
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
        
        toast.success(`Healed for ${spell.power} health!`);
      } else {
        // Damage spell
        const newEnemyHealth = Math.max(0, gameState.enemy.currentHealth - spell.power);
        
        let enemyFrozen = gameState.enemyFrozen;
        
        // Ice has a chance to freeze
        if (spell.element === "ice") {
          // Chance to freeze increases with chain length
          const freezeChance = spell.chainLength * 10; // 30% for 3-chain, 40% for 4-chain, etc.
          if (Math.random() * 100 < freezeChance) {
            enemyFrozen = true;
            toast.success("Enemy frozen! They'll skip their next turn.");
          }
        }
        
        // Check if enemy is defeated
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
        } else {
          toast.success(`Dealt ${spell.power} damage!`);
        }
      }
      
      // End player turn if game is still going
      setTimeout(() => {
        setGameState(prev => {
          if (!prev || prev.gameStatus !== "playing") return prev;
          return {
            ...prev,
            isPlayerTurn: false,
          };
        });
        
        // If game continues, start enemy turn
        if (gameState.gameStatus === "playing") {
          setTimeout(handleEnemyTurn, 1000);
        }
      }, 500);
    }, 1000);
  };

  const handleEnemyTurn = () => {
    if (!gameState) return;
    
    // If enemy is frozen, skip their turn
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
    
    // Enemy AI - randomized spell
    const spellTypes: ElementType[] = ["fire", "fire", "ice", "mystic"]; // Fire more likely for enemy
    const spellType = spellTypes[Math.floor(Math.random() * spellTypes.length)];
    
    // Random chain length between 3-5
    const chainLength = Math.floor(Math.random() * 3) + 3; // 3-5
    const power = calculateSpellPower(Array(chainLength).fill({ type: spellType } as Card));
    
    // Create a spell
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
    
    // Show spell effect
    setSpellEffect({
      type: spell.element,
      power: spell.power,
      isHealing: false,
      position: "player"
    });
    
    // Apply damage to player
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
      } else {
        toast.error(`Enemy dealt ${spell.power} damage!`);
      }
      
      // End enemy turn if game is still going
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
    return <StartScreen onStart={initGame} />;
  }

  if (!gameState) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-game-gradient flex flex-col relative p-4">
      <div className="max-w-lg w-full mx-auto flex flex-col flex-1">
        <h1 className="game-title text-3xl md:text-4xl text-center mb-4">Arcane Chain Quest</h1>
        
        {/* Enemy Character */}
        <Character 
          character={gameState.enemy} 
          isEnemy={true} 
          isTakingDamage={spellEffect !== null && spellEffect.position === "enemy"}
          isFrozen={gameState.enemyFrozen}
        />
        
        {/* Turn Indicator */}
        <TurnIndicator 
          isPlayerTurn={gameState.isPlayerTurn}
          turnCount={gameState.turnCount}
        />
        
        {/* Card Grid */}
        <div className="flex-1 flex items-center justify-center">
          <CardGrid 
            onChainComplete={handlePlayerChain}
            disabled={!gameState.isPlayerTurn || gameState.gameStatus !== "playing"}
          />
        </div>
        
        {/* Player Character */}
        <Character 
          character={gameState.player}
          isTakingDamage={spellEffect !== null && spellEffect.position === "player"}
          isHealing={spellEffect !== null && spellEffect.isHealing}
        />
      </div>
      
      {/* Spell Effect Animation */}
      {spellEffect && (
        <SpellEffect
          type={spellEffect.type}
          power={spellEffect.power}
          isHealing={spellEffect.isHealing}
          position={spellEffect.position}
          onComplete={() => setSpellEffect(null)}
        />
      )}
      
      {/* Game Over Screen */}
      {gameState.gameStatus !== "playing" && (
        <GameOverScreen 
          status={gameState.gameStatus} 
          player={gameState.player}
          enemy={gameState.enemy}
          onRestart={restartGame}
        />
      )}
    </div>
  );
};

export default Index;
