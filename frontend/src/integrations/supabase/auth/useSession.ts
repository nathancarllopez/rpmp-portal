import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../client";

export default function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [fetchingSession, setFetchingSession] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        console.warn("Failed to fetch session from supabase");

        if (error instanceof Error) {
          console.warn(error.message);
        } else {
          console.warn(JSON.stringify(error));
        }

        throw error;
      }).finally(() => setFetchingSession(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("auth event:", event);
      // console.log("session:", session);

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, fetchingSession };
}
