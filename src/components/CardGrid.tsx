import { useState, useEffect, useRef } from "react";
import { Flame, Leaf, Snowflake, Sparkles } from "lucide-react";
import { Card, ElementType } from "@/types/game";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface CardGridProps {
  onChainComplete: (cards: Card[]) => void;
  disabled: boolean;
}

const CardGrid: React.FC<CardGridProps> = ({ onChainComplete, disabled }) => {
  const [grid, setGrid] = useState<Card[][]>([]);
  const [chainedCards, setChainedCards] = useState<Card[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [damageDisplay, setDamageDisplay] = useState<{
    value: number;
    type: ElementType;
    isHealing: boolean;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<boolean>(false);
  const damageTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging && gridRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isDragging]);

  const checkForPossibleChains = (currentGrid: Card[][]) => {
    const cards = currentGrid.flat();
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

  const generateSingleCard = (row: number, col: number): Card => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
    return {
      id: `${row}-${col}`,
      type: elements[Math.floor(Math.random() * elements.length)],
      row,
      col,
      selected: false
    };
  };

  const generateGrid = () => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
    let newGrid: Card[][];
    
    do {
      newGrid = Array(4).fill(null).map((_, i) => 
        Array(4).fill(null).map((_, j) => ({
          id: `${i}-${j}`,
          type: elements[Math.floor(Math.random() * elements.length)],
          row: i,
          col: j,
          selected: false
        }))
      );
    } while (!checkForPossibleChains(newGrid)); // Regenerate if no chains possible

    return newGrid;
  };

  useEffect(() => {
    const initialGrid = generateGrid();
    setGrid(initialGrid);
    
    if (!checkForPossibleChains(initialGrid)) {
      toast.info("No possible chains! Refreshing board...");
      setGrid(generateGrid());
    }
  }, []);

  const getCardIcon = (type: ElementType) => {
    switch (type) {
      case 'fire':
        return <Flame className="text-game-fire" size={36} />;
      case 'nature':
        return <Leaf className="text-game-nature" size={36} />;
      case 'ice':
        return <Snowflake className="text-game-ice" size={36} />;
      case 'mystic':
        return <Sparkles className="text-game-mystic" size={36} />;
      default:
        return null;
    }
  };

  const isAdjacent = (card1: Card, card2: Card) => {
    const rowDiff = Math.abs(card1.row - card2.row);
    const colDiff = Math.abs(card1.col - card2.col);
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  const isCardInChain = (card: Card) => {
    return chainedCards.some(c => c.id === card.id);
  };

  const handleCardInteraction = (card: Card) => {
    if (disabled) return;
    
    if (chainedCards.length === 0) {
      setChainedCards([card]);
      
      const newGrid = [...grid];
      newGrid[card.row][card.col].selected = true;
      setGrid(newGrid);
    } else {
      const lastCard = chainedCards[chainedCards.length - 1];
      
      if (lastCard.type !== card.type) {
        return; // Don't allow connecting different element types
      }
      
      if (isAdjacent(lastCard, card)) {
        if (isCardInChain(card)) {
          if (chainedCards.length > 1 && card.id === chainedCards[chainedCards.length - 2].id) {
            const newChain = [...chainedCards];
            const removedCard = newChain.pop();
            setChainedCards(newChain);
            
            if (removedCard) {
              const newGrid = [...grid];
              newGrid[removedCard.row][removedCard.col].selected = false;
              setGrid(newGrid);
            }
          }
        } else {
          const newChain = [...chainedCards, card];
          setChainedCards(newChain);
          
          const newGrid = [...grid];
          newGrid[card.row][card.col].selected = true;
          setGrid(newGrid);
        }
      }
    }
  };
  
  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (disabled) return;
    
    e.preventDefault();
    
    setIsDragging(true);
    touchRef.current = e.pointerType === 'touch';
    
    setChainedCards([]);
    const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
    setGrid(newGrid);
    
    handleCardInteraction(card);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    
    e.preventDefault();
    
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    grid.flat().forEach(card => {
      const cardElement = document.getElementById(`card-${card.id}`);
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        if (
          clientX >= rect.left && 
          clientX <= rect.right && 
          clientY >= rect.top && 
          clientY <= rect.bottom
        ) {
          handleCardInteraction(card);
        }
      }
    });
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    
    e.preventDefault();
    
    setIsDragging(false);
    
    if (chainedCards.length >= 2) {
      onChainComplete([...chainedCards]);
      
      const elementType = chainedCards[0].type;
      const length = chainedCards.length;
      
      let spellName = "";
      switch (elementType) {
        case 'fire':
          spellName = length >= 5 ? "Fire Storm" : "Fireball";
          break;
        case 'nature':
          spellName = length >= 5 ? "Nature's Blessing" : "Heal";
          break;
        case 'ice':
          spellName = length >= 5 ? "Arctic Freeze" : "Ice Bolt";
          break;
        case 'mystic':
          spellName = length >= 5 ? "Mystic Surge" : "Arcane Bolt";
          break;
      }

      // Show damage badge instead of toast
      const power = calculateSpellPower(chainedCards);
      setDamageDisplay({
        value: power,
        type: elementType,
        isHealing: elementType === 'nature'
      });
      
      if (damageTimeout.current) {
        clearTimeout(damageTimeout.current);
      }
      
      damageTimeout.current = setTimeout(() => {
        setDamageDisplay(null);
      }, 1500);
      
      // Only replace the used cards, not the entire grid
      setTimeout(() => {
        const newGrid = [...grid];
        
        // Only replace the cards that were part of the chain
        chainedCards.forEach(usedCard => {
          const newCard = generateSingleCard(usedCard.row, usedCard.col);
          newGrid[usedCard.row][usedCard.col] = newCard;
        });
        
        setChainedCards([]);
        setGrid(newGrid);
        
        if (!checkForPossibleChains(newGrid)) {
          toast.info("No possible chains! Refreshing board...");
          setTimeout(() => {
            setGrid(generateGrid());
          }, 1000);
        }
      }, 500);
    } else if (chainedCards.length > 0) {
      toast.error("Chain too short!", {
        description: "Chains must be at least 2 cards long."
      });
      
      const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
      setGrid(newGrid);
      setChainedCards([]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, card: Card) => {
    if (disabled) return;
    e.preventDefault();
    
    setIsDragging(true);
    touchRef.current = true;
    
    setChainedCards([]);
    const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
    setGrid(newGrid);
    
    handleCardInteraction(card);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    grid.flat().forEach(card => {
      const cardElement = document.getElementById(`card-${card.id}`);
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        if (
          clientX >= rect.left && 
          clientX <= rect.right && 
          clientY >= rect.top && 
          clientY <= rect.bottom
        ) {
          handleCardInteraction(card);
        }
      }
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    e.preventDefault();
    setIsDragging(false);
    
    if (chainedCards.length >= 2) {
      onChainComplete([...chainedCards]);
      
      const elementType = chainedCards[0].type;
      const length = chainedCards.length;
      
      let spellName = "";
      switch (elementType) {
        case 'fire':
          spellName = length >= 5 ? "Fire Storm" : "Fireball";
          break;
        case 'nature':
          spellName = length >= 5 ? "Nature's Blessing" : "Heal";
          break;
        case 'ice':
          spellName = length >= 5 ? "Arctic Freeze" : "Ice Bolt";
          break;
        case 'mystic':
          spellName = length >= 5 ? "Mystic Surge" : "Arcane Bolt";
          break;
      }

      // Show damage badge instead of toast
      const power = calculateSpellPower(chainedCards);
      setDamageDisplay({
        value: power,
        type: elementType,
        isHealing: elementType === 'nature'
      });
      
      if (damageTimeout.current) {
        clearTimeout(damageTimeout.current);
      }
      
      damageTimeout.current = setTimeout(() => {
        setDamageDisplay(null);
      }, 1500);
      
      // Only replace the used cards, not the entire grid
      setTimeout(() => {
        const newGrid = [...grid];
        
        // Only replace the cards that were part of the chain
        chainedCards.forEach(usedCard => {
          const newCard = generateSingleCard(usedCard.row, usedCard.col);
          newGrid[usedCard.row][usedCard.col] = newCard;
        });
        
        setChainedCards([]);
        setGrid(newGrid);
        
        if (!checkForPossibleChains(newGrid)) {
          toast.info("No possible chains! Refreshing board...");
          setTimeout(() => {
            setGrid(generateGrid());
          }, 1000);
        }
      }, 500);
    } else if (chainedCards.length > 0) {
      toast.error("Chain too short!", {
        description: "Chains must be at least 2 cards long."
      });
      
      const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
      setGrid(newGrid);
      setChainedCards([]);
    }
  };

  const calculateSpellPower = (cards: Card[]) => {
    const baseValue = 5;
    const length = cards.length;
    
    const scaleFactor = Math.pow(1.5, length - 2);
    return Math.floor(baseValue * scaleFactor);
  };

  const getCardPosition = (cardId: string) => {
    const element = document.getElementById(`card-${cardId}`);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const getDamageColor = (type: ElementType) => {
    switch (type) {
      case 'fire': return 'bg-game-fire text-white';
      case 'nature': return 'bg-game-nature text-white';
      case 'ice': return 'bg-game-ice text-white';
      case 'mystic': return 'bg-game-mystic text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 w-full">
      <div 
        ref={gridRef}
        className={cn(
          "game-grid fixed-game-grid touch-none",
          disabled ? "opacity-70 pointer-events-none" : "cursor-pointer"
        )}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Chain lines visualization */}
        {chainedCards.length > 0 && (
          <svg 
            className="absolute inset-0 pointer-events-none z-10"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
          >
            {chainedCards.map((card, i) => {
              if (i === chainedCards.length - 1) return null;
              const start = getCardPosition(card.id);
              const end = getCardPosition(chainedCards[i + 1].id);
              if (!start || !end) return null;
              
              return (
                <line
                  key={`line-${i}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              );
            })}
          </svg>
        )}

        {grid.map((row, rowIdx) => 
          row.map((card, colIdx) => (
            <div
              id={`card-${card.id}`}
              key={card.id}
              className={cn(
                "game-card",
                card.type,
                card.selected && "selected"
              )}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onTouchStart={(e) => handleTouchStart(e, card)}
            >
              <div className={`card-element ${card.type}`}>
                {getCardIcon(card.type)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Opponent's grid preview */}
      <div className="opponent-grid">
        {grid.map((row, rowIdx) => 
          row.map((card, colIdx) => (
            <div
              key={`opponent-${card.id}`}
              className={cn(
                "aspect-square rounded-sm opacity-50",
                card.type === 'fire' && "bg-game-fire",
                card.type === 'nature' && "bg-game-nature",
                card.type === 'ice' && "bg-game-ice",
                card.type === 'mystic' && "bg-game-mystic"
              )}
            />
          ))
        )}
      </div>

      {/* Damage display */}
      {damageDisplay && (
        <div className="absolute top-[-60px] right-[-20px] z-30">
          <div className={cn(
            'damage-badge',
            getDamageColor(damageDisplay.type)
          )}>
            {damageDisplay.isHealing ? '+' : ''}{damageDisplay.value}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardGrid;
