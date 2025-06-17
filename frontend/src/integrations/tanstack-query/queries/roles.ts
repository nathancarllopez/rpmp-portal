import { supabase } from "@/integrations/supabase/client";
import type { RoleInfoRow } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function rolesOptions() {
  return queryOptions({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: Infinity,
  })
}

async function getRoles(): Promise<RoleInfoRow[]> {
  const { data, error } = await supabase.from("role_info").select();

  if (error) {
    console.warn("Failed to fetch role information");
    console.warn(error.message);

    throw error;
  }

  return data;
}