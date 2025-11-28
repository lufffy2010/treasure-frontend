// Grand Sea Saga Rank System

export interface Rank {
  level: number;
  name: string;
  tier: string;
  xpRequired: number;
  icon: string;
}

export const RANKS: Rank[] = [
  // Tier 1: Call to the Sea
  { level: 1, name: "The Unchosen", tier: "Call to the Sea", xpRequired: 0, icon: "🌊" },
  { level: 2, name: "The Dream Awakened", tier: "Call to the Sea", xpRequired: 10, icon: "💫" },
  { level: 3, name: "The First Step", tier: "Call to the Sea", xpRequired: 25, icon: "👣" },
  
  // Tier 2: Into the Wild Blue
  { level: 4, name: "Wanderer of the Waves", tier: "Into the Wild Blue", xpRequired: 50, icon: "⛵" },
  { level: 5, name: "Breaker of Small Storms", tier: "Into the Wild Blue", xpRequired: 80, icon: "⚡" },
  { level: 6, name: "The Lone Sail", tier: "Into the Wild Blue", xpRequired: 120, icon: "🏴‍☠️" },
  
  // Tier 3: Trials of Courage
  { level: 7, name: "The Tide Challenger", tier: "Trials of Courage", xpRequired: 170, icon: "🌊" },
  { level: 8, name: "The Storm Defier", tier: "Trials of Courage", xpRequired: 230, icon: "⛈️" },
  { level: 9, name: "Heart That Won't Sink", tier: "Trials of Courage", xpRequired: 300, icon: "❤️" },
  
  // Tier 4: Uncharted Path
  { level: 10, name: "Bearer of the Ancient Compass", tier: "Uncharted Path", xpRequired: 380, icon: "🧭" },
  { level: 11, name: "Walker of Forbidden Seas", tier: "Uncharted Path", xpRequired: 470, icon: "🗺️" },
  { level: 12, name: "Seeker of the Lost Star", tier: "Uncharted Path", xpRequired: 570, icon: "⭐" },
  
  // Tier 5: Destiny Road
  { level: 13, name: "One Who Follows No Map", tier: "Destiny Road", xpRequired: 680, icon: "🌟" },
  { level: 14, name: "Breaker of the Horizon Wall", tier: "Destiny Road", xpRequired: 800, icon: "🌅" },
  { level: 15, name: "Holder of the Last Compass", tier: "Destiny Road", xpRequired: 930, icon: "✨" },
  
  // Tier 6: Final Title
  { level: 16, name: "THE ONE WHO REWRITES THE SEA", tier: "The Final Title", xpRequired: 1100, icon: "👑" },
];

export const getRankByXP = (xp: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xpRequired) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export const getNextRank = (currentLevel: number): Rank | null => {
  return RANKS.find(r => r.level === currentLevel + 1) || null;
};

export const calculateXPFromStreaks = (streakCount: number): number => {
  // Each streak day = 5 XP
  return streakCount * 5;
};

export const calculateXPFromTasks = (completedTasks: number): number => {
  // Each task = 1 XP
  return completedTasks;
};

export const calculateXPFromChapters = (completedChapters: number): number => {
  // Each chapter = 3 XP
  return completedChapters * 3;
};

export const calculateXPFromFocus = (focusSessions: number): number => {
  // Each focus session = 2 XP
  return focusSessions * 2;
};
