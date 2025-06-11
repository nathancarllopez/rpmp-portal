import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

interface FlavorInfo {
  name: string;
  label: string;
}

export interface ProteinWithFlavors {
  name: string;
  label: string;
  flavors: FlavorInfo[] | null;
}

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
    const flavorNames = row.flavor_names;
    const flavorLabels = row.flavor_labels;

    if (flavorNames === null || flavorLabels === null) {
      return {
        name: row.protein_name ?? "MISSING",
        label: row.protein_label ?? "MISSING",
        flavors: null,
      };
    }

    if (flavorNames.length !== flavorLabels.length) {
      console.warn("There are not enough or too many flavor labels");
      console.warn(JSON.stringify(row));

      throw new Error("Flavor names and flavor labels mismatch");
    }

    return {
      name: row.protein_name ?? "MISSING",
      label: row.protein_label ?? "MISSING",
      flavors: flavorNames
        .map((flavor, idx) => ({
          name: flavor,
          label: flavorLabels[idx],
        }))
        .sort((rowA, rowB) => rowA.label.localeCompare(rowB.label)),
    };
  });

  return proteinsWithFlavors;
}
