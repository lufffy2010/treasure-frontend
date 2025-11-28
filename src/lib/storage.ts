// LocalStorage utilities for StudyTracker

export interface User {
  username: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  done: boolean;
}

export interface Sub {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface FocusSession {
  start: string;
  end: string;
  duration: number;
}

export interface Badge {
  id: string;
  name: string;
  category: "willpower" | "treasure" | "sea_spirit" | "legacy";
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserData {
  quotesSeen: number[];
  todos: Record<string, Todo[]>;
  streaks: string[];
  subs: Sub[];
  focusSessions: FocusSession[];
  autoStreakOnComplete: boolean;
  rank: number;
  xp: number;
  badges: Badge[];
}

const USERS_KEY = 'studytracker_users';
const CURRENT_USER_KEY = 'studytracker_currentUser';

// User management
export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const userExists = (username: string): boolean => {
  return getUsers().some(u => u.username.toLowerCase() === username.toLowerCase());
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const setCurrentUser = (username: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getUserProfile = (username: string): User | undefined => {
  return getUsers().find(u => u.username === username);
};

export const updateUserProfile = (username: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

// User data management
const getUserDataKey = (username: string) => `data_${username}`;

export const getUserData = (username: string): UserData => {
  const key = getUserDataKey(username);
  const data = localStorage.getItem(key);
  
  const defaultData: UserData = {
    quotesSeen: [],
    todos: {},
    streaks: [],
    subs: [],
    focusSessions: [],
    autoStreakOnComplete: false,
    rank: 1,
    xp: 0,
    badges: [],
  };
  
  if (!data) {
    return defaultData;
  }
  
  const parsedData = JSON.parse(data);
  
  // Migrate existing data to ensure all fields exist
  return {
    ...defaultData,
    ...parsedData,
    badges: parsedData.badges || [],
  };
};

export const saveUserData = (username: string, data: UserData): void => {
  const key = getUserDataKey(username);
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper functions
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format date key for India timezone
export const formatDateKeyIST = (date: Date): string => {
  const indiaDateString = new Date(date).toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return indiaDateString; // Returns YYYY-MM-DD format
};

export const parseStringToDate = (dateString: string): Date => {
  return new Date(dateString);
};
