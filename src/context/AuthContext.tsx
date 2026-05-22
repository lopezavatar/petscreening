"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { LoyaltyTier } from "@/lib/accounts";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePoints: (delta: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = "pits_auth";

interface StoredAuth {
  userId: string;
  points: number; // Store points separately so we can track changes during session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user from API
  const fetchUser = useCallback(async (userId: string): Promise<SafeUser | null> => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API not available, ignore
    }
    return null;
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const auth: StoredAuth = JSON.parse(stored);
          const apiUser = await fetchUser(auth.userId);
          if (apiUser) {
            // Use stored points (may differ from DB points for session continuity)
            setUser({ ...apiUser, points: auth.points });
          } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Invalid email or password" };
        }

        const safeUser: SafeUser = data.user;
        setUser(safeUser);

        const auth: StoredAuth = { userId: safeUser.id, points: safeUser.points };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));

        return { success: true };
      } catch {
        return { success: false, error: "Network error" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const updatePoints = useCallback((delta: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newPoints = Math.max(0, prev.points + delta);

      // Update stored points
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const auth: StoredAuth = JSON.parse(stored);
        auth.points = newPoints;
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      }

      // Recalculate tier based on new points
      let newTier: LoyaltyTier = "bronze";
      if (newPoints >= 3000) newTier = "platinum";
      else if (newPoints >= 1500) newTier = "gold";
      else if (newPoints >= 500) newTier = "silver";

      return { ...prev, points: newPoints, tier: newTier };
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const apiUser = await fetchUser(user.id);
    if (apiUser) {
      setUser(apiUser);
      const auth: StoredAuth = { userId: apiUser.id, points: apiUser.points };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    }
  }, [user, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updatePoints, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
