import type { Game, Friend } from "../data";

export type ProfileData = {
  name: string;
  handle: string;
  bio: string;
  avatarColor: string;
  coverStyle: string;
  statusQuote: string;
};

export type PlayStat = { count: number; last: number };

export type UserLevel = { level: number; currentXp: number; maxXp: number; xp: number };

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
};

export type ProfileStats = {
  totalPlays: number;
  gamesPlayed: number;
  friends: number;
  favorites: number;
  joinedAt: number;
};

export type { Game, Friend };
