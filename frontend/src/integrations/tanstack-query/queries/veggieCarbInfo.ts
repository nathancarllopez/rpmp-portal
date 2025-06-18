import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type VeggieCarbInfoRow } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function veggieCarbInfoOptions() {
  return queryOptions({
    queryKey: ["veggieCarbInfo"],
    queryFn: getVeggieCarbInfo,
    staleTime: Infinity,
  });
}

async function getVeggieCarbInfo(): Promise<VeggieCarbInfoRow[]> {
  const { data, error } = await supabase.from("veggie_carb_info").select();
  if (error) {
    console.warn("Failed to fetch veggies and carbs");
    console.warn(error.message);

    throw error;
  }

  const veggieCarbInfo: VeggieCarbInfoRow[] = data.map((row) =>
    snakeToCamel<VeggieCarbInfoRow>(row)
  );

  return veggieCarbInfo;
}
