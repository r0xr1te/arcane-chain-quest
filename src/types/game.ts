
import { LucideIcon } from "lucide-react";

export type ElementType = 'fire' | 'nature' | 'ice' | 'mystic';

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
}

export interface Spell {
  name: string;
  element: ElementType;
  power: number;
  description: string;
  chainLength: number;
}
