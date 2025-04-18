
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GameStateProvider } from "./context/GameStateContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { handleAuthRedirect } from "./lib/supabase";
import { useEffect } from "react";
import TabMenu from "./components/navigation/TabMenu";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    // Handle auth redirects on app load
    handleAuthRedirect();
  }, []);

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
        <TabMenu />
      </TooltipProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <GameStateProvider>
          <AppContent />
        </GameStateProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
