
import DashboardLayout from "@/components/layouts/DashboardLayout";

const DeckBuilder = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="game-title text-3xl mb-6">Deck Builder</h1>
        
        <div className="bg-game-bg rounded-lg p-6 border border-game-uiAccent">
          <div className="text-center py-12">
            <h2 className="text-xl text-game-uiAccent mb-2">Coming Soon!</h2>
            <p className="text-gray-400">
              The deck builder feature is currently under development. 
              Check back soon to create and customize your own decks!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeckBuilder;
