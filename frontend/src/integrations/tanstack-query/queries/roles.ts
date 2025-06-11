import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export interface RoleRow {
  id: number;
  name: string;
  label: string;
  explanation: string;
}

export function rolesOptions() {
  return queryOptions({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: Infinity,
  })
}

async function getRoles(): Promise<RoleRow[]> {
  const { data, error } = await supabase.from("role_info").select();

  if (error) {
    console.warn("Failed to fetch role information");
    console.warn(error.message);

    throw error;
  }

  return data;
}