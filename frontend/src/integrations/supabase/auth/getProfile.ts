import { supabase } from "../client";
import type { Profile } from "../types/types";
import snakeToCamel from "../util/snakeToCamel";

export default async function getProfile(userId: string): Promise<Profile> {
  console.log('userId', userId);

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

  console.log('data', data);

  return snakeToCamel(data) as Profile;
}
