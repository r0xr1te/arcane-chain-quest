
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  User, 
  Book, 
  BookOpen, 
  BookPlus,
  GamepadIcon, 
  LogOut, 
  Settings,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface TabItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  requiresAuth?: boolean;
}

const TabMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const tabs: TabItem[] = [
    {
      label: "Home",
      icon: <Home size={20} />,
      path: "/"
    },
    {
      label: "Play",
      icon: <GamepadIcon size={20} />,
      path: "/game/offline"
    },
    {
      label: "Profile",
      icon: <User size={20} />,
      path: "/profile",
      requiresAuth: true
    },
    {
      label: "Decks",
      icon: <Book size={20} />,
      path: "/deck-builder",
      requiresAuth: true
    },
    {
      label: "Collection",
      icon: <BookOpen size={20} />,
      path: "/collection",
      requiresAuth: true
    },
    {
      label: "Multiplayer",
      icon: <Users size={20} />,
      path: "/dashboard",
      requiresAuth: true
    }
  ];

  const filteredTabs = tabs.filter(tab => {
    // If tab requires auth, only show if user is logged in
    if (tab.requiresAuth) {
      return !!user;
    }
    return true;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-game-bg/95 backdrop-blur-sm border-t border-game-uiAccent/30">
      <div className="flex items-center justify-evenly px-2 py-1">
        {filteredTabs.map((tab) => (
          <Button
            key={tab.path}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all",
              "text-xs gap-1 h-auto min-w-[4rem]",
              location.pathname === tab.path
                ? "text-game-uiAccent bg-game-ui/20"
                : "text-white hover:bg-game-ui/10"
            )}
            onClick={() => handleTabClick(tab.path)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Button>
        ))}
        
        {user && (
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all text-xs gap-1 h-auto min-w-[4rem] text-white hover:bg-game-ui/10"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        )}
        
        {!user && (
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all text-xs gap-1 h-auto min-w-[4rem] text-white hover:bg-game-ui/10"
            onClick={() => navigate("/login")}
          >
            <User size={20} />
            <span>Login</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TabMenu;
