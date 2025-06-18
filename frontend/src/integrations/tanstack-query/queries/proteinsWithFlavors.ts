import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type ProteinWithFlavors } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function proteinsAndFlavorsOptions() {
  return queryOptions({
    queryKey: ["proteinsAndFlavors"],
    queryFn: getProteinsAndFlavors,
    staleTime: Infinity,
  });
}

async function getProteinsAndFlavors(): Promise<ProteinWithFlavors[]> {
  const { data, error } = await supabase
    .from("proteins_with_flavors")
    .select()
    .order("protein_label", { ascending: true });

  if (error) {
    console.warn("Failed to fetch proteins with flavors");
    console.warn(error.message);

    throw error;
  }

  const proteinsWithFlavors: ProteinWithFlavors[] = data.map((row) => {
    const sortedRow = {
      ...row,
      flavors: row.flavors.sort((flavorA, flavorB) => flavorA.label.localeCompare(flavorB.label))
    };

    return snakeToCamel<ProteinWithFlavors>(sortedRow)
  })

  return proteinsWithFlavors;
}
