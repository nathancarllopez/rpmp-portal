import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type Profile } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function profileByIdOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: () => getProfileById(userId),
    staleTime: Infinity
  })
}

async function getProfileById(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("user_id", userId)
    .single();

  if (error) {
    console.warn("Error fetching profile:");
    console.warn(error.code);
    console.warn(error.message);
    
    throw error;
  }

  const profile = snakeToCamel<Profile>(data);
  return profile;
}
