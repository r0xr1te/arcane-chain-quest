
import { useState, useEffect, useRef } from "react";
import { Flame, Leaf, Snowflake, Sparkles } from "lucide-react";
import { Card, ElementType } from "@/types/game";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CardGridProps {
  onChainComplete: (cards: Card[]) => void;
  disabled: boolean;
}

const CardGrid: React.FC<CardGridProps> = ({ onChainComplete, disabled }) => {
  const [grid, setGrid] = useState<Card[][]>([]);
  const [chainedCards, setChainedCards] = useState<Card[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<boolean>(false);

  const generateGrid = () => {
    const elements: ElementType[] = ['fire', 'nature', 'ice', 'mystic'];
    const newGrid: Card[][] = [];

    for (let i = 0; i < 4; i++) {
      newGrid[i] = [];
      for (let j = 0; j < 4; j++) {
        newGrid[i][j] = {
          id: `${i}-${j}`,
          type: elements[Math.floor(Math.random() * elements.length)],
          row: i,
          col: j,
          selected: false
        };
      }
    }

    return newGrid;
  };

  useEffect(() => {
    setGrid(generateGrid());
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
      // First card in chain
      setChainedCards([card]);
      
      // Update grid to show selection
      const newGrid = [...grid];
      newGrid[card.row][card.col].selected = true;
      setGrid(newGrid);
    } else {
      const lastCard = chainedCards[chainedCards.length - 1];
      
      // Check if card is adjacent to last card in chain
      if (isAdjacent(lastCard, card)) {
        // Check if card is already in chain
        if (isCardInChain(card)) {
          // If it's the previous card, remove the last card (backtracking)
          if (chainedCards.length > 1 && card.id === chainedCards[chainedCards.length - 2].id) {
            const newChain = [...chainedCards];
            const removedCard = newChain.pop();
            setChainedCards(newChain);
            
            // Update grid to remove selection
            if (removedCard) {
              const newGrid = [...grid];
              newGrid[removedCard.row][removedCard.col].selected = false;
              setGrid(newGrid);
            }
          }
        } else {
          // Add card to chain
          const newChain = [...chainedCards, card];
          setChainedCards(newChain);
          
          // Update grid to show selection
          const newGrid = [...grid];
          newGrid[card.row][card.col].selected = true;
          setGrid(newGrid);
        }
      }
    }
  };
  
  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (disabled) return;
    
    setIsDragging(true);
    touchRef.current = e.pointerType === 'touch';
    
    // Reset chain
    setChainedCards([]);
    const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
    setGrid(newGrid);
    
    // Start new chain with this card
    handleCardInteraction(card);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // Check if pointer is over a card
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
  
  const handlePointerUp = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    // Complete chain if it's valid (3+ cards)
    if (chainedCards.length >= 3) {
      onChainComplete([...chainedCards]);
      
      // Show feedback
      const elementCounts = chainedCards.reduce((counts, card) => {
        counts[card.type] = (counts[card.type] || 0) + 1;
        return counts;
      }, {} as Record<ElementType, number>);
      
      const mainElementType = Object.entries(elementCounts)
        .sort((a, b) => b[1] - a[1])[0][0] as ElementType;
      
      const allSameElement = Object.keys(elementCounts).length === 1;
      const length = chainedCards.length;
      
      let spellName = "";
      if (allSameElement) {
        switch (mainElementType) {
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
      } else {
        spellName = "Mixed Chain";
      }

      toast.success(`Cast ${spellName}!`, {
        description: `${chainedCards.length} card chain created!`
      });
      
      // Reset the grid with new cards
      setTimeout(() => {
        setChainedCards([]);
        setGrid(generateGrid());
      }, 500);
    } else if (chainedCards.length > 0) {
      toast.error("Chain too short!", {
        description: "Chains must be at least 3 cards long."
      });
      
      // Reset selection without regenerating
      const newGrid = grid.map(row => row.map(c => ({ ...c, selected: false })));
      setGrid(newGrid);
      setChainedCards([]);
    }
  };

  return (
    <div 
      ref={gridRef}
      className={cn(
        "grid grid-cols-4 gap-2 w-full max-w-md mx-auto p-4 bg-game-ui/30 rounded-lg",
        disabled ? "opacity-70 pointer-events-none" : "cursor-pointer"
      )}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {grid.map((row, rowIdx) => 
        row.map((card, colIdx) => (
          <div
            id={`card-${card.id}`}
            key={card.id}
            className={cn(
              "game-card aspect-square",
              card.type,
              card.selected && "selected"
            )}
            onPointerDown={(e) => handlePointerDown(e, card)}
          >
            <div className={`card-element ${card.type}`}>
              {getCardIcon(card.type)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CardGrid;
