import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/types/types";
import snakeToCamel from "@/integrations/supabase/util/snakeToCamel";
import { queryOptions } from "@tanstack/react-query";

export function allProfilesOptions() {
  return queryOptions({
    queryKey: ["allProfiles"],
    queryFn: getAllProfiles,
    staleTime: Infinity,
  });
}

async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .order("first_name", { ascending: true })
    .order("last_name", { ascending: true });

  if (error) {
    console.log("Error fetching profiles:", error.message);
    console.log(error.code);

    throw error;
  }

  const profiles = data.map((profile) => snakeToCamel(profile)) as Profile[];

  return profiles;
}
