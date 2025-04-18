
import { useAuth } from '@/context/AuthContext';
import { useGameState } from '@/context/GameStateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { toast } from 'sonner';
import { Copy, Play, Plus, Users } from 'lucide-react';
import { useState } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const { createRoom, joinRoom, loading } = useGameState();
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="game-title text-3xl mb-6">Welcome, {user?.username}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-game-bg rounded-lg p-6 border border-game-uiAccent">
            <h2 className="text-xl font-bold mb-4 text-game-uiAccent">Play</h2>
            
            <div className="space-y-4">
              <Button
                onClick={handleCreateRoom}
                disabled={loading}
                className="game-button w-full"
              >
                <Play size={18} /> 
                Create New Game
              </Button>
              
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
            </div>
          </div>
          
          <div className="bg-game-bg rounded-lg p-6 border border-game-uiAccent">
            <h2 className="text-xl font-bold mb-4 text-game-uiAccent">Your Decks</h2>
            
            <div className="space-y-4">
              <Link to="/deck-builder">
                <Button className="game-button w-full">
                  <Plus size={18} />
                  Build New Deck
                </Button>
              </Link>
              
              <div className="text-center text-gray-400 mt-4">
                {/* Deck list will go here in the future */}
                <p>You have no saved decks yet.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-game-bg rounded-lg p-6 border border-game-uiAccent">
          <h2 className="text-xl font-bold mb-4 text-game-uiAccent">Your Collection</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/collection">
              <Button className="game-button w-full">
                View Collection
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 text-center text-gray-400">
            <p>Complete matches to earn new cards for your collection!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
