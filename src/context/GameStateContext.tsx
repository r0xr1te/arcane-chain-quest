
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Character, ElementType, GameState, Room, Spell } from '@/types/game';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface GameStateContextType {
  gameState: GameState | null;
  roomData: Room | null;
  loading: boolean;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateGameState: (newState: Partial<GameState>) => Promise<void>;
  handlePlayerChain: (cards: Card[]) => void;
  endTurn: () => void;
  isMyTurn: () => boolean;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomData?.id) {
      // Subscribe to room changes
      const roomSubscription = supabase
        .channel(`room:${roomData.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'rooms', 
          filter: `id=eq.${roomData.id}`
        }, (payload) => {
          const updatedRoom = payload.new as Room;
          setRoomData(updatedRoom);
          setGameState(updatedRoom.gameState);
          
          // Handle turn timer
          if (updatedRoom.gameState.turnEndTime && updatedRoom.gameState.turnEndTime > 0) {
            const currentTime = Date.now();
            const timeLeft = updatedRoom.gameState.turnEndTime - currentTime;
            
            if (timeLeft > 0) {
              // Set a timeout to end the turn
              setTimeout(() => {
                if (isMyTurn()) {
                  endTurn();
                }
              }, timeLeft);
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(roomSubscription);
      };
    }
  }, [roomData?.id]);

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

  const isAdjacent = (card1: Card, card2: Card) => {
    // Only allow horizontal or vertical connections, not diagonal
    return (
      (Math.abs(card1.row - card2.row) === 1 && card1.col === card2.col) || 
      (Math.abs(card1.col - card2.col) === 1 && card1.row === card2.row)
    );
  };

  const checkForPossibleChains = (grid: Card[][]) => {
    const cards = grid.flat();
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const adjacentCards = cards.filter(c => 
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

  const createRoom = async () => {
    if (!user) {
      toast.error('You must be logged in to create a room');
      return '';
    }

    setLoading(true);

    try {
      let playerGrid = createInitialGrid();
      let enemyGrid = createInitialGrid();
      
      // Ensure there's at least one possible chain in each grid
      while (!checkForPossibleChains(playerGrid)) {
        playerGrid = createInitialGrid();
      }
      
      while (!checkForPossibleChains(enemyGrid)) {
        enemyGrid = createInitialGrid();
      }

      const initialGameState: GameState = {
        grid: playerGrid,
        enemyGrid: enemyGrid,
        player: {
          name: user.username,
          maxHealth: 100,
          currentHealth: 100,
          level: 1,
          image: "wizard"
        },
        enemy: {
          name: "Opponent",
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
        enemyFrozen: false,
        turnEndTime: Date.now() + 10000 // 10 seconds from now
      };

      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          host_id: user.id,
          game_state: initialGameState,
          status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;

      const roomId = data.id;
      
      // Navigate to the room
      navigate(`/room/${roomId}`);
      
      // Return the room ID
      return roomId;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
      return '';
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a room');
      return;
    }

    setLoading(true);

    try {
      // Check if room exists and is available
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      if (!room) {
        toast.error('Room not found');
        return;
      }

      if (room.status !== 'waiting') {
        toast.error('Room is no longer available');
        return;
      }

      // Update room with guest ID and change status to playing
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          guest_id: user.id,
          status: 'playing',
          // Update the game state to include opponent info
          game_state: {
            ...room.game_state,
            enemy: {
              ...room.game_state.enemy,
              name: user.username
            }
          }
        })
        .eq('id', roomId);

      if (updateError) throw updateError;

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!roomData || !user) return;

    try {
      if (roomData.hostId === user.id) {
        // If host leaves, end the game
        await supabase
          .from('rooms')
          .update({ status: 'finished' })
          .eq('id', roomData.id);
      } else if (roomData.guestId === user.id) {
        // If guest leaves, set room back to waiting
        await supabase
          .from('rooms')
          .update({
            guest_id: null,
            status: 'waiting'
          })
          .eq('id', roomData.id);
      }

      setRoomData(null);
      setGameState(null);
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  const updateGameState = async (newState: Partial<GameState>) => {
    if (!roomData) return;

    try {
      const updatedGameState = { ...gameState, ...newState };
      
      await supabase
        .from('rooms')
        .update({
          game_state: updatedGameState
        })
        .eq('id', roomData.id);
    } catch (error) {
      console.error('Error updating game state:', error);
      toast.error('Failed to update game state');
    }
  };

  const calculateSpellPower = (cards: Card[]) => {
    const baseValue = 5;
    const length = cards.length;
    
    const scaleFactor = Math.pow(1.5, length - 2);
    return Math.floor(baseValue * scaleFactor);
  };

  const determineSpellEffect = (cards: Card[]): Spell => {
    // Check if there are any skill cards in the chain
    const hasSkill = cards.some(card => card.type === 'skill');
    const elementType = cards[0].type === 'skill' ? 
      cards.find(card => card.type !== 'skill')?.type || 'fire' : cards[0].type;
    
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

  const handlePlayerChain = (cards: Card[]) => {
    if (!gameState || !isMyTurn()) return;
    
    const spell = determineSpellEffect(cards);
    
    // Update game state with the spell
    updateGameState({
      lastSpell: spell
    });
    
    setTimeout(() => {
      if (spell.element === "nature") {
        const newHealth = Math.min(
          gameState.player.maxHealth,
          gameState.player.currentHealth + spell.power
        );
        
        updateGameState({
          player: {
            ...gameState.player,
            currentHealth: newHealth
          }
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
        
        updateGameState({
          enemy: {
            ...gameState.enemy,
            currentHealth: newEnemyHealth
          },
          enemyFrozen,
          gameStatus: newGameStatus
        });
        
        if (newGameStatus === "playerWon") {
          toast.success("Victory! You defeated the enemy!");
        }
      }
      
      // End the turn
      setTimeout(() => {
        endTurn();
      }, 500);
    }, 1000);
  };

  const endTurn = () => {
    if (!gameState || !roomData) return;
    
    updateGameState({
      isPlayerTurn: !gameState.isPlayerTurn,
      turnCount: gameState.turnCount + 1,
      turnEndTime: Date.now() + 10000 // 10 seconds for next turn
    });
  };

  const isMyTurn = () => {
    if (!gameState || !user || !roomData) return false;
    
    const amIHost = user.id === roomData.hostId;
    
    // If I'm host and it's player's turn, or I'm guest and it's not player's turn
    return (amIHost && gameState.isPlayerTurn) || (!amIHost && !gameState.isPlayerTurn);
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        roomData,
        loading,
        createRoom,
        joinRoom,
        leaveRoom,
        updateGameState,
        handlePlayerChain,
        endTurn,
        isMyTurn
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  
  return context;
};
