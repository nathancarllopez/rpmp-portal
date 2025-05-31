import { supabase } from "../client";
import type { Profile } from "../types/types";
import snakeToCamel from "../util/snakeToCamel";

export default async function getProfile(userId: string | undefined): Promise<Profile | null> {
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
