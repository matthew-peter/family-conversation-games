import tabooData from '@/data/taboo.json';
import contact from '@/data/contact.json';
import riddles from '@/data/riddles.json';
import lateral from '@/data/lateral.json';
import icebreakerData from '@/data/icebreaker.json';
import wordChain from '@/data/word-chain.json';
import charadesData from '@/data/charades.json';
import pictionaryData from '@/data/pictionary.json';

// Type definitions to keep TypeScript happy
export type TabooCard = { target: string; forbidden: string[] };
export type TabooCategory = { 
  name: string; 
  emoji: string; 
  cards: TabooCard[] 
};
export type TabooData = { 
  categories: Record<string, TabooCategory> 
};

export type IcebreakerCategory = {
  name: string;
  emoji: string;
  questions: string[];
};
export type IcebreakerData = {
  categories: Record<string, IcebreakerCategory>
};

export type CharadesCategory = {
  name: string;
  emoji: string;
  prompts: string[];
};
export type CharadesData = {
  categories: Record<string, CharadesCategory>
};

export type PictionaryCategory = {
  name: string;
  emoji: string;
  words: string[];
};
export type PictionaryData = {
  categories: Record<string, PictionaryCategory>
};

export type Riddle = { q: string; a: string };
export type LateralPuzzle = { q: string; a: string };

export const DATA = {
  taboo: tabooData as TabooData,
  contact: contact as string[],
  riddles: riddles as Riddle[],
  lateral: lateral as LateralPuzzle[],
  icebreaker: icebreakerData as IcebreakerData,
  categories: wordChain as string[],
  charades: charadesData as CharadesData,
  pictionary: pictionaryData as PictionaryData,
};