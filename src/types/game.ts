
import { LucideIcon } from "lucide-react";

export type ElementType = 'fire' | 'nature' | 'ice' | 'mystic' | 'skill';

export interface Card {
  id: string;
  type: ElementType;
  row: number;
  col: number;
  selected: boolean;
}

export interface Character {
  name: string;
  maxHealth: number;
  currentHealth: number;
  level: number;
  image: string;
}

export interface GameState {
  grid: Card[][];
  enemyGrid: Card[][];
  player: Character;
  enemy: Character;
  chainedCards: Card[];
  isPlayerTurn: boolean;
  turnCount: number;
  lastSpell: Spell | null;
  gameStatus: 'playing' | 'playerWon' | 'enemyWon';
  enemyFrozen: boolean;
  roomId?: string;
  turnEndTime?: number;
}

export interface Spell {
  name: string;
  element: ElementType;
  power: number;
  description: string;
  chainLength: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: string;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  skills: SkillCard[];
  elements: ElementCard[];
}

export interface SkillCard {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects: SkillEffect[];
  image?: string;
}

export interface ElementCard {
  id: string;
  type: Exclude<ElementType, 'skill'>;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image?: string;
}

export interface SkillEffect {
  elementType: Exclude<ElementType, 'skill'>;
  effect: string;
  power: number;
}

export interface Room {
  id: string;
  hostId: string;
  guestId?: string;
  gameState: GameState;
  createdAt: string;
  status: 'waiting' | 'playing' | 'finished';
}
