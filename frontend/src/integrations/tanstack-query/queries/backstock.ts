import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type BackstockViewRow } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function backstockOptions() {
  return queryOptions({
    queryKey: ["backstock"],
    queryFn: getBackstock,
    staleTime: Infinity,
  });
}

async function getBackstock(): Promise<BackstockViewRow[]> {
  const { data, error } = await supabase.from("backstock_view").select();

  if (error) {
    console.warn("Failed to fetch backstock view");
    console.warn(error.message);

    throw error;
  }

  const backstockData: BackstockViewRow[] = data.map((row) =>
    snakeToCamel<BackstockViewRow>(row)
  );

  return backstockData;
}
