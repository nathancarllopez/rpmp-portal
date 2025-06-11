// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "../supabase/client";

// export interface ProteinWithFlavors {
//   name: string;
//   label: string;
//   flavors: { value: string; label: string }[] | null;
// }

// export function useProteinsWithFlavors() {
//   return useQuery({
//     queryKey: ["proteinsWithFlavors"],
//     queryFn: getProteinsWithFlavors,
//   });
// }

// async function getProteinsWithFlavors() {
//   const { data, error } = await supabase.from("proteins_with_flavors").select();

//   if (error) {
//     console.warn("Failed to fetch proteins with flavors");
//     console.warn(error.message);

//     throw error;
//   }

//   const proteinsWithFlavors: ProteinWithFlavors[] = data
//     .sort((rowA, rowB) => {
//       return (rowA.protein_label ?? "MISSING").localeCompare(
//         rowB.protein_label ?? "MISSING"
//       );
//     })
//     .map((row) => {
//       const flavorNames = row.flavor_names;
//       const flavorLabels = row.flavor_labels;

//       if (flavorNames === null || flavorLabels === null) {
//         return {
//           name: row.protein_name ?? "MISSING",
//           label: row.protein_label ?? "MISSING",
//           flavors: null,
//         };
//       }

//       if (flavorNames.length !== flavorLabels.length) {
//         console.warn("There are not enough or too many flavor labels");
//         console.warn(row);

//         throw new Error("Flavor names and flavor labels mismatch");
//       }

//       return {
//         name: row.protein_name ?? "MISSING",
//         label: row.protein_label ?? "MISSING",
//         flavors: flavorNames
//           .map((flavor, idx) => ({
//             value: flavor,
//             label: flavorLabels[idx],
//           }))
//           .sort((rowA, rowB) => rowA.label.localeCompare(rowB.label)),
//       };
//     });

//   return proteinsWithFlavors;
// }
