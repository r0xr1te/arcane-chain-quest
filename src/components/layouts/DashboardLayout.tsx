
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Book, LogOut, Settings, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-game-gradient">
      <header className="bg-game-bg/90 backdrop-blur-sm py-4 border-b border-game-uiAccent/30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="game-title text-2xl">Arcane Chain Quest</Link>
          
          <Button onClick={handleSignOut} variant="ghost" className="text-white">
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <div className="flex min-h-[calc(100vh-65px)]">
        <nav className="w-16 md:w-48 bg-game-bg border-r border-game-uiAccent/30">
          <div className="p-4 flex flex-col gap-2">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white",
                  location.pathname === '/dashboard' && "bg-game-ui/20"
                )}
              >
                <Book className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/collection">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white",
                  location.pathname === '/collection' && "bg-game-ui/20"
                )}
              >
                <Book className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Collection</span>
              </Button>
            </Link>
            
            <Link to="/deck-builder">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white",
                  location.pathname === '/deck-builder' && "bg-game-ui/20"
                )}
              >
                <Book className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Deck Builder</span>
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white",
                  location.pathname === '/profile' && "bg-game-ui/20"
                )}
              >
                <User className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </nav>
        
        <main className="flex-1 bg-game-gradient">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
