
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameState } from '@/context/GameStateContext';
import { toast } from 'sonner';
import { Copy, Play, Users } from 'lucide-react';

const RoomActions = () => {
  const [roomCode, setRoomCode] = useState('');
  const { createRoom, joinRoom, loading } = useGameState();

  const handleCreateRoom = async () => {
    const roomId = await createRoom();
    if (roomId) {
      // Copy room link to clipboard
      const url = `${window.location.origin}/room/${roomId}`;
      navigator.clipboard.writeText(url);
      toast.success('Room created! Link copied to clipboard');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      toast.error('Please enter a room code');
      return;
    }
    
    await joinRoom(roomCode);
  };

  const handleCopyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <div>
        <Button
          onClick={handleCreateRoom}
          disabled={loading}
          className="game-button w-full"
        >
          <Play size={18} className="mr-2" />
          Create New Game
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code"
          className="bg-game-ui text-white border border-game-uiAccent"
        />
        <Button
          onClick={handleJoinRoom}
          disabled={loading || !roomCode}
          className="game-button"
        >
          <Users size={18} />
          Join
        </Button>
      </div>
      
      {roomCode && (
        <Button
          onClick={handleCopyRoomLink}
          className="text-xs text-game-uiAccent"
          variant="link"
        >
          <Copy size={12} className="mr-1" />
          Copy Link
        </Button>
      )}
    </div>
  );
};

export default RoomActions;
