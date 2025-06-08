import type { Profile } from "../types/types";
import { createContext, useContext } from "react";
import { supabase } from "../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useSession from "./useSession";
import snakeToCamel from "../util/snakeToCamel";

export interface AuthContext {
  profile: Profile | null;
  fetchingSession: boolean;
  isAuthenticated: boolean;
  showSkeleton: boolean;
  refreshProfile: () => Promise<void>;
  doLogin: (email: string, password: string) => Promise<boolean>;
  doLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { session, fetchingSession } = useSession();
  const userId = session?.user.id;

  const { data, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });

  if (error) {
    console.warn(`Failed to fetch profile for: ${userId}`);
    console.warn(error.message);

    throw error;
  }

  const profile = data || null;
  const isAuthenticated = !fetchingSession && !!session;
  const showSkeleton = isAuthenticated && !profile;

  const refreshProfile = () => queryClient.invalidateQueries({
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

    const firstLogin = !session.user.user_metadata.has_signed_in;
    return firstLogin;
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn("Error signing out:", error.message);

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        fetchingSession,
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

export async function getProfile(userId: string | undefined): Promise<Profile | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("user_id", userId)
    .single();

  if (error) {
    console.log(`Failed to fetch profile for this user id: ${userId}`)
    console.log("error", error.message, error.code);
    throw error
  }

  return snakeToCamel(data) as Profile;
}
