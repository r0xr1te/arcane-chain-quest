
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ElementCard, ElementType, SkillCard } from "@/types/game";
import { useState } from "react";
import { Flame, Leaf, Snowflake, Sparkles, PlusCircle, BookOpen, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const elementTypes: {type: ElementType, icon: React.ReactNode, color: string}[] = [
  { type: "fire", icon: <Flame className="text-game-fire" />, color: "text-game-fire" },
  { type: "nature", icon: <Leaf className="text-game-nature" />, color: "text-game-nature" },
  { type: "ice", icon: <Snowflake className="text-game-ice" />, color: "text-game-ice" },
  { type: "mystic", icon: <Sparkles className="text-game-mystic" />, color: "text-game-mystic" },
];

// Sample data for demo purposes
const sampleElements: ElementCard[] = elementTypes.map((el, idx) => ({
  id: `element-${idx}`,
  type: el.type as Exclude<ElementType, 'skill'>,
  name: `${el.type.charAt(0).toUpperCase() + el.type.slice(1)} Crystal`,
  description: `A pure ${el.type} crystal that enhances your elemental abilities.`,
  rarity: 'common',
}));

const sampleSkills: SkillCard[] = [
  {
    id: 'skill-1',
    name: 'Elemental Fusion',
    description: 'Combine the power of multiple elements for a devastating attack.',
    rarity: 'rare',
    effects: [
      { elementType: 'fire', effect: 'damage', power: 10 },
      { elementType: 'ice', effect: 'freeze', power: 5 }
    ],
    image: '/assets/skills/fusion.png'
  },
  {
    id: 'skill-2',
    name: 'Nature\'s Embrace',
    description: 'Heal yourself with the power of nature.',
    rarity: 'uncommon',
    effects: [
      { elementType: 'nature', effect: 'heal', power: 15 }
    ]
  },
  {
    id: 'skill-3',
    name: 'Arcane Blast',
    description: 'Unleash a powerful mystic blast on your opponent.',
    rarity: 'epic',
    effects: [
      { elementType: 'mystic', effect: 'damage', power: 25 }
    ]
  }
];

const DeckBuilder = () => {
  const [selectedTab, setSelectedTab] = useState<string>("collection");
  const { user } = useAuth();

  const handleAddToDeck = (cardId: string, type: 'element' | 'skill') => {
    toast.info(`Added ${type} card to your deck!`);
    // In a real implementation, this would update the user's deck in Supabase
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 pb-16">
        <h1 className="game-title text-3xl mb-6">Deck Builder</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-game-bg border border-game-uiAccent">
            <TabsTrigger
              value="collection"
              className="data-[state=active]:bg-game-ui/30 text-white"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Collection
            </TabsTrigger>
            <TabsTrigger 
              value="deck" 
              className="data-[state=active]:bg-game-ui/30 text-white"
            >
              <Book className="mr-2 h-5 w-5" />
              My Deck
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collection" className="mt-4">
            <div className="bg-game-bg rounded-lg border border-game-uiAccent p-4">
              <h2 className="text-xl text-game-uiAccent mb-4">Elements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sampleElements.map((element) => (
                  <Card key={element.id} className="bg-game-ui/30 border-game-uiAccent overflow-hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="flex items-center text-sm">
                        {elementTypes.find(et => et.type === element.type)?.icon}
                        <span className="ml-2">{element.name}</span>
                      </CardTitle>
                      <CardDescription className={getRarityColor(element.rarity)}>
                        {element.rarity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-white/80 mb-2">{element.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full text-xs bg-game-ui hover:bg-game-ui/80"
                        onClick={() => handleAddToDeck(element.id, 'element')}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" /> Add to Deck
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h2 className="text-xl text-game-uiAccent mt-8 mb-4">Skills</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleSkills.map((skill) => (
                  <Card key={skill.id} className="bg-game-ui/30 border-game-uiAccent overflow-hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="flex items-center text-sm">
                        <Sparkles className="text-rainbow" />
                        <span className="ml-2">{skill.name}</span>
                      </CardTitle>
                      <CardDescription className={getRarityColor(skill.rarity)}>
                        {skill.rarity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-white/80 mb-2">{skill.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {skill.effects.map((effect, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded-full bg-game-ui/50 
                            ${effect.elementType === 'fire' ? 'text-game-fire' : ''}
                            ${effect.elementType === 'ice' ? 'text-game-ice' : ''}
                            ${effect.elementType === 'nature' ? 'text-game-nature' : ''}
                            ${effect.elementType === 'mystic' ? 'text-game-mystic' : ''}`}
                          >
                            {effect.effect} {effect.power}
                          </span>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full text-xs bg-game-ui hover:bg-game-ui/80"
                        onClick={() => handleAddToDeck(skill.id, 'skill')}  
                      >
                        <PlusCircle className="h-3 w-3 mr-1" /> Add to Deck
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="deck" className="mt-4">
            <div className="bg-game-bg rounded-lg border border-game-uiAccent p-4 min-h-[300px]">
              <h2 className="text-xl text-game-uiAccent mb-4">Your Active Deck</h2>
              <div className="text-center text-gray-400">
                <p>Select cards from your collection to build your deck.</p>
                <p className="mt-4">Your deck requires:</p>
                <ul className="mt-2 list-disc list-inside">
                  <li>At least 8 elemental cards</li>
                  <li>Maximum 3 skill cards</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DeckBuilder;
