export interface Talent {
  id: string;
  name: string;
  icon: string;
  row: number; // 0-6
  col: number; // 0-3
  maxRank: number;
  currentRank: number;
  description: string[]; // One string per rank. index 0 = rank 1 description
  prerequisite?: string; // ID of talent required to be MAX rank
  reqPoints?: number; // Not strictly used in logic if we use row * 5 rule, but good for display
}

export interface TabData {
  id: string;
  name: string;
  icon: string;
  background: string;
}

export type TalentDict = Record<string, Talent>;
