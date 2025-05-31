import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../types/types";
import { createContext, useContext, useState } from "react";
import { supabase } from "../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getProfile from "./getProfile";

export interface AuthContext {
  profile: Profile | null;
  isAuthenticated: boolean;
  showSkeleton: boolean;
  refreshProfile: () => Promise<void>;
  doLogin: (email: string, password: string) => Promise<boolean>;
  doLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

const storageKey = "stored-session";

function getStoredSession(): Session | null {
  const sessionStr = localStorage.getItem(storageKey);
  if (sessionStr) {
    return JSON.parse(sessionStr) as Session;
  }
  return null;
}

function setStoredSession(session: Session | null) {
  if (session) {
    localStorage.setItem(storageKey, JSON.stringify(session));
  } else {
    localStorage.removeItem(storageKey);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(() =>
    getStoredSession()
  );
  const userId = session?.user.id;

  const { data, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
  });

  if (error) {
    console.warn(`Failed to fetch profile for: ${userId}`);
    console.warn(error.message);

    throw error;
  }

  const isAuthenticated = !!session;
  const profile = data || null;
  const showSkeleton = isAuthenticated && !profile;

  const refreshProfile = () =>
    queryClient.invalidateQueries({
      queryKey: ["profile", userId],
    });

  const doLogin = async (email: string, password: string): Promise<boolean> => {
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn("Error signing in:", error.message);
      console.warn("code:", error.code);

      throw error;
    } else if (!user?.id) {
      console.warn("User object has no id prop");
      console.warn(user);

      throw new Error("User object has no id prop");
    }

    setSession(session);
    setStoredSession(session);

    const firstLogin = !session.user.user_metadata.has_signed_in;
    return firstLogin;
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn("Error signing out:", error.message);

      throw error;
    }

    setSession(null);
    setStoredSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated,
        showSkeleton,
        refreshProfile,
        doLogin,
        doLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const authCtx = useContext(AuthContext);
  if (!authCtx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return authCtx;
}