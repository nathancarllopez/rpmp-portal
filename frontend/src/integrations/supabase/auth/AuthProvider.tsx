// import type { Session } from "@supabase/supabase-js";
// import type { Profile } from "../types/types";
// import { createContext, useContext, useState } from "react";
// import { supabase } from "../client";
// import snakeToCamel from "../util/snakeToCamel";
// import { useQuery } from "@tanstack/react-query";

// export interface AuthContext {
//   profile: Profile | null;
//   isAuthenticated: boolean;
//   showSkeleton: boolean;
//   // refreshProfile: () => Promise<void>;
//   doLogin: (email: string, password: string) => Promise<boolean>;
//   doLogout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContext | null>(null);

// const storageKey = "stored-session";

// function getStoredSession(): Session | null {
//   const sessionStr = localStorage.getItem(storageKey);
//   if (sessionStr) {
//     return JSON.parse(sessionStr) as Session;
//   }
//   return null;
// }

// function setStoredSession(session: Session | null) {
//   if (session) {
//     localStorage.setItem(storageKey, JSON.stringify(session));
//   } else {
//     localStorage.removeItem(storageKey);
//   }
// }

// async function getProfile(userId: string | undefined): Promise<Profile | null> {
//   console.log('fetching profile')

//   if (!userId) return null;

//   const { data, error } = await supabase
//     .from("profiles")
//     .select()
//     .eq("user_id", userId)
//     .single();

//   if (error) {
//     console.warn(`Failed to fetch profile for this user id: ${userId}`);
//     console.warn("error", error.message, error.code);

//     throw error;
//   }

//   if (!data) return null;

//   console.log('returning profile');
//   return snakeToCamel(data) as Profile;
// }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [session, setSession] = useState<Session | null>(() => getStoredSession());
//   const isAuthenticated = !!session;
//   const userId = session?.user.id;

//   const { data, error: profileError } = useQuery({
//     queryKey: ['profile', userId],
//     queryFn: async () => getProfile(userId)
//   });

//   if (profileError) {
//     console.warn("Error fetching profile");
//     console.warn(profileError.message);

//     throw profileError;
//   }

//   const profile = data || null;
//   const showSkeleton = isAuthenticated && !profile;

//   // const refreshProfile = async () => {
//   //   if (!session?.user.id) {
//   //     throw new Error('No stored session');
//   //   }

//   //   try {
//   //     const profile = await fetchProfile(session.user.id);  
//   //     setProfile(profile);
//   //   } catch (error) {
//   //     console.warn("Failed to fetch profile:");

//   //     if (error instanceof Error) {
//   //       console.warn(error.message);
//   //     } else {
//   //       console.warn(JSON.stringify(error));
//   //     }

//   //     throw error;
//   //   }
//   // }

//   const doLogin = async (email: string, password: string) => {
//     const {
//       data: { session, user },
//       error,
//     } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       console.warn("Error signing in:", error.message);
//       console.warn("code:", error.code);

//       throw error;
//     } else if (!user?.id) {
//       console.warn("User object has no id prop");
//       console.warn(user);

//       throw new Error("User object has no id prop");
//     }

//     try {
//       const profile = await getProfile(user.id);

//       setSession(session);
//       setStoredSession(session);
//       setProfile(profile);

//       const firstLogin = !user.user_metadata.has_signed_in;
//       return firstLogin;
//     } catch (error) {
//       console.warn("Failed to fetch profile:");

//       if (error instanceof Error) {
//         console.warn(error.message);
//       } else {
//         console.warn(JSON.stringify(error));
//       }

//       throw error;
//     }
//   };

//   const doLogout = async () => {
//     const { error } = await supabase.auth.signOut();

//     if (error) {
//       console.warn("Error signing out:", error.message);

//       throw error;
//     }

//     setSession(null);
//     setStoredSession(null);
//     setProfile(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         profile,
//         isAuthenticated,
//         showSkeleton,
//         // refreshProfile,
//         doLogin,
//         doLogout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const authCtx = useContext(AuthContext);
//   if (!authCtx) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return authCtx;
// }


import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../types/types";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../client";
import snakeToCamel from "../util/snakeToCamel";

export interface AuthContext {
  profile: Profile | null;
  isAuthenticated: boolean;
  showSkeleton: boolean;
  refreshProfile: () => void;
  doLogin: (email: string, password: string) => Promise<boolean>;
  doLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

const storageKey = "stored-session";

function getStoredSession(): Session | null {
  console.log('getting stored session')
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
  console.log('authProvider')

  const [session, setSession] = useState<Session | null>(() => getStoredSession());
  const [profile, setProfile] = useState<Profile | null>(null);
  const isAuthenticated = !!session;
  const showSkeleton = isAuthenticated && !profile;

  const fetchProfile = async (userId: string) => {
    console.log('fetching profile')
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("user_id", userId)
      .single();

    if (error) {
      console.warn(`Failed to fetch profile for this user id: ${userId}`);
      console.warn("error", error.message, error.code);

      throw error;
    }

    if (!data) return null;

    console.log('returning profile');
    return snakeToCamel(data) as Profile;
  };

  const refreshProfile = async () => {
    console.log('refreshing profile');
    if (!session?.user.id) {
      throw new Error('No stored session');
    }

    try {
      const profile = await fetchProfile(session.user.id);  
      setProfile(profile);
    } catch (error) {
      console.warn("Failed to fetch profile:");

      if (error instanceof Error) {
        console.warn(error.message);
      } else {
        console.warn(JSON.stringify(error));
      }

      throw error;
    } finally {
      console.log('finished refreshing')
    }
  }

  const userId = session?.user.id;
  useEffect(() => {
    if (userId && !profile) {
      console.log('refreshing');
      refreshProfile();
    }
  }, [userId])

  const doLogin = async (email: string, password: string) => {
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

    try {
      const profile = await fetchProfile(user.id);

      setSession(session);
      setStoredSession(session);
      setProfile(profile);

      const firstLogin = !user.user_metadata.has_signed_in;
      return firstLogin;
    } catch (error) {
      console.warn("Failed to fetch profile:");

      if (error instanceof Error) {
        console.warn(error.message);
      } else {
        console.warn(JSON.stringify(error));
      }

      throw error;
    }
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn("Error signing out:", error.message);

      throw error;
    }

    setSession(null);
    setStoredSession(null);
    setProfile(null);
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
