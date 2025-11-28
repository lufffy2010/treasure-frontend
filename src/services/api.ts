import { API_URL } from "@/config";

const BASE_URL = `${API_URL}/api/auth`;

export interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    xp?: number;
    badges?: any[];
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface LeaderboardEntry {
    id: string;
    username: string;
    avatar_url: string;
    xp: number;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    rank?: number;
}

const getHeaders = (token?: string | null) => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            headers["Authorization"] = `Bearer ${storedToken}`;
        }
    }
    return headers;
};

export const api = {
    // Auth
    register: async (data: { username: string; email: string; password: string; avatar: string }) => {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json() as Promise<AuthResponse>;
    },

    login: async (data: { email: string; password: string }) => {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json() as Promise<AuthResponse>;
    },

    getCurrentUser: async (token?: string) => {
        const res = await fetch(`${BASE_URL}/me`, {
            headers: getHeaders(token),
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json() as Promise<{ user: User }>;
    },

    updateProfile: async (data: { username?: string; avatar?: string }) => {
        const res = await fetch(`${BASE_URL}/profile`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to update profile");
        }
        return res.json();
    },

    deleteAccount: async () => {
        const res = await fetch(`${BASE_URL}/profile`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to delete account");
        return res.json();
    },

    // XP & Leaderboard
    updateXP: async (xp: number) => {
        const res = await fetch(`${BASE_URL}/xp`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ xp }),
        });
        return res.json();
    },

    getLeaderboard: async (userId?: string) => {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        const res = await fetch(`${BASE_URL}/leaderboard${query}`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        return res.json() as Promise<LeaderboardResponse>;
    },

    getLeaderboardStreamUrl: (userId?: string) => {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        return `${BASE_URL}/leaderboard/stream${query}`;
    },
};
