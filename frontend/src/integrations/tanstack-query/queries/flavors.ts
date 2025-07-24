import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type FlavorRow } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function flavorsOptions() {
  return queryOptions({
    queryKey: ["flavors"],
    queryFn: getFlavors,
    staleTime: Infinity,
  });
}

async function getFlavors(): Promise<FlavorRow[]> {
  const { data, error } = await supabase
    .from("flavors")
    .select()
    .order("label", { ascending: true });

  if (error) {
    console.warn("Failed to fetch flavors");
    console.warn(error.message);

    throw error;
  }

  const flavors: FlavorRow[] = data
    .map((row) => snakeToCamel<FlavorRow>(row));

  return flavors;
}
