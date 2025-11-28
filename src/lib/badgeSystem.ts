// Adventure-Themed Badge System

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: "willpower" | "treasure" | "sea_spirit" | "legacy";
  icon: string;
  requirement: (userData: any) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Willpower Badges
  {
    id: "unbroken_will",
    name: "Unbroken Will",
    description: "Maintain a 7-day streak",
    category: "willpower",
    icon: "🔥",
    requirement: (userData) => userData.streaks.length >= 7,
  },
  {
    id: "storm_hearted",
    name: "Storm-Hearted",
    description: "Maintain a 14-day streak",
    category: "willpower",
    icon: "⚡",
    requirement: (userData) => userData.streaks.length >= 14,
  },
  {
    id: "unyielding_soul",
    name: "Unyielding Soul",
    description: "Maintain a 30-day streak",
    category: "willpower",
    icon: "💎",
    requirement: (userData) => userData.streaks.length >= 30,
  },
  
  // Treasure Badges
  {
    id: "map_fragment_1",
    name: "Map Fragment I",
    description: "Complete 10 tasks",
    category: "treasure",
    icon: "🗺️",
    requirement: (userData) => {
      const completedTasks = Object.values(userData.todos).flat().filter((t: any) => t.done).length;
      return completedTasks >= 10;
    },
  },
  {
    id: "map_fragment_2",
    name: "Map Fragment II",
    description: "Complete 50 tasks",
    category: "treasure",
    icon: "📜",
    requirement: (userData) => {
      const completedTasks = Object.values(userData.todos).flat().filter((t: any) => t.done).length;
      return completedTasks >= 50;
    },
  },
  {
    id: "ancient_map",
    name: "The Ancient Map",
    description: "Complete 100 tasks",
    category: "treasure",
    icon: "🏴‍☠️",
    requirement: (userData) => {
      const completedTasks = Object.values(userData.todos).flat().filter((t: any) => t.done).length;
      return completedTasks >= 100;
    },
  },
  
  // Sea Spirit Badges
  {
    id: "storm_survivor",
    name: "Storm Survivor",
    description: "Complete 5 focus sessions",
    category: "sea_spirit",
    icon: "🌊",
    requirement: (userData) => userData.focusSessions.length >= 5,
  },
  {
    id: "ocean_whisperer",
    name: "Ocean Whisperer",
    description: "Complete 15 focus sessions",
    category: "sea_spirit",
    icon: "🌀",
    requirement: (userData) => userData.focusSessions.length >= 15,
  },
  {
    id: "breaker_of_waves",
    name: "Breaker of Waves",
    description: "Complete 30 focus sessions",
    category: "sea_spirit",
    icon: "🏝️",
    requirement: (userData) => userData.focusSessions.length >= 30,
  },
  
  // Legacy Badges (placeholder - requires leaderboard)
  {
    id: "name_on_sea",
    name: "Name Written on the Sea",
    description: "Top 10 leaderboard",
    category: "legacy",
    icon: "🎖️",
    requirement: () => false, // Requires leaderboard implementation
  },
  {
    id: "voice_reaches_horizon",
    name: "Voice That Reaches the Horizon",
    description: "Top 3 leaderboard",
    category: "legacy",
    icon: "🏅",
    requirement: () => false, // Requires leaderboard implementation
  },
  {
    id: "unstoppable_legacy",
    name: "Legacy That Cannot Be Stopped",
    description: "#1 leaderboard",
    category: "legacy",
    icon: "👑",
    requirement: () => false, // Requires leaderboard implementation
  },
];

export const checkAndAwardBadges = (userData: any): string[] => {
  const newlyUnlocked: string[] = [];
  const currentBadgeIds = userData.badges?.map((b: any) => b.id) || [];
  
  BADGE_DEFINITIONS.forEach(badgeDef => {
    if (!currentBadgeIds.includes(badgeDef.id) && badgeDef.requirement(userData)) {
      newlyUnlocked.push(badgeDef.id);
    }
  });
  
  return newlyUnlocked;
};

export const getBadgeById = (id: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find(b => b.id === id);
};
