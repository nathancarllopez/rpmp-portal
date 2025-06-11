import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export interface FlavorRow {
  name: string;
  label: string;
  rawLabel: string;
}

export function flavorsOptions() {
  return queryOptions({
    queryKey: ["flavors"],
    queryFn: getFlavors,
    staleTime: Infinity
  });
}

async function getFlavors(): Promise<FlavorRow[]> {
  const { data, error } = await supabase
    .from("flavors")
    .select("name, label, raw_label");

  if (error) {
    console.warn("Failed to fetch flavors");
    console.warn(error.message);

    throw error;
  }

  const flavors: FlavorRow[] = data
    .sort((rowA, rowB) => rowA.label.localeCompare(rowB.label))
    .map((row) => ({
      name: row.name,
      label: row.label,
      rawLabel: row.raw_label,
    }));

  return flavors;
}
