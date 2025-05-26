import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types/types";
import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "../client";
import getProfile from "./getProfile";

export interface AuthContext {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const isAuthenticated = !!profile;

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      console.log("code:", error.code);

      throw error;
    }

    const user = data.user;
    const userProfile = await getProfile(user.id);
    setProfile(userProfile);

    return user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error signing out:", error.message);

      throw error;
    }

    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, profile, setProfile }}>
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
