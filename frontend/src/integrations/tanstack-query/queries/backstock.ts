import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export interface BackstockRow {
  available: boolean;
  createdAt: Date;
  flavor: string;
  id: number;
  protein: string;
  weight: number;
  displayColor: string;
}

export function backstockOptions() {
  return queryOptions({
    queryKey: ["backstock"],
    queryFn: getBackstock,
    staleTime: Infinity,
  });
}

async function getBackstock(): Promise<BackstockRow[]> {
  const { data, error } = await supabase.from("backstock_view").select();

  if (error) {
    console.warn("Failed to fetch backstock view");
    console.warn(error.message);

    throw error;
  }

  const backstockData: BackstockRow[] = data.map((row) => {
    return {
      available: row.available ?? true,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      flavor: row.flavor ?? "MISSING",
      id: row.id ?? Math.floor(Math.random() * 1e9),
      protein: row.protein ?? "MISSING",
      weight: row.weight ?? 0,
      displayColor: row.display_color ?? "yellow.1",
    };
  });

  return backstockData;
}