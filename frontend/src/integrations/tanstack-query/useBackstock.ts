import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export interface BackstockRow {
  available: boolean;
  createdAt: Date;
  flavor: string;
  id: number;
  protein: string;
  weight: number;
  displayColor: string;
}

export function useBackstock() {
  return useQuery({
    queryKey: ["backstock"],
    queryFn: getBackstock,
  });
}

async function getBackstock() {
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
