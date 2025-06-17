import { BackstockRow, Ingredients, Meal } from "@rpmp-portal/types";
import getAvailableBackstock from "src/supabase/getAvailableBackstock";
import getProteinShrink from "src/supabase/getProteinShrink";
import updateAvailableBackstock from "src/supabase/updateAvailableBackstock";

export default async function makeBackstockAdjustments(
  ingredients: Ingredients
): Promise<{
  meals: Meal[];
}> {
  const allBackstock = await getAvailableBackstock();
  const proteinShrink = await getProteinShrink();

  const meals: Meal[] = [];
  const usedBackstockIds: number[] = [];

  const sortedProteins = Object.keys(ingredients).sort();
  for (const protein of sortedProteins) {
    const flavorMap = ingredients[protein];
    const sortedFlavors = Object.keys(flavorMap).sort();
    for (const flavor of sortedFlavors) {
      let rawWeight = ingredients[protein][flavor].weight;
      const backstockRows = getBackstockWeights(
        allBackstock,
        protein,
        flavor,
        rawWeight
      );

      let backstockWeight = 0;
      if (backstockRows) {
        backstockRows.forEach((row) => {
          usedBackstockIds.push(row.id);
          rawWeight -= row.weight;
          backstockWeight += row.weight;
        });
      }

      const shrinkMultiplier = proteinShrink[protein] / 100;
      meals.push({
        protein,
        proteinLabel: ingredients[protein][flavor].proteinLabel,
        flavor,
        flavorLabel: ingredients[protein][flavor].flavorLabel,
        weight: rawWeight,
        weightLbOz: getLbOzWeight(rawWeight),
        backstockWeight,
        cookedWeight: Number((rawWeight * shrinkMultiplier).toFixed(2))
      })
    }
  }

  if (usedBackstockIds.length > 0) {
    await updateAvailableBackstock(usedBackstockIds)
  }

  return { meals };
}

function getBackstockWeights(
  allBackstock: BackstockRow[],
  protein: string,
  flavor: string,
  weight: number
): BackstockRow[] | null {
  const validBackstock = allBackstock.filter((row) => {
    return (
      row.available &&
      row.weight <= weight &&
      row.protein === protein &&
      row.flavor === flavor
    );
  });
  if (validBackstock.length === 0) return null;

  // Iterate over subsets using binary strings
  const validSubsets: { total: number; subset: BackstockRow[] }[] = [];
  for (let i = 1; i < 2 ** validBackstock.length; i++) {
    const subsetInstructions = i
      .toString(2)
      .padStart(validBackstock.length, "0");
    const subset: BackstockRow[] = [];
    let subsetTotal = 0;

    for (let j = 0; j < subsetInstructions.length; j++) {
      if (subsetInstructions[j] === "1") {
        subsetTotal += validBackstock[j].weight;
        subset.push(validBackstock[j]);
      }
    }

    if (subsetTotal <= weight) {
      validSubsets.push({
        total: subsetTotal,
        subset: subset,
      });
    }
  }
  if (validSubsets.length === 0) return null;

  const largeSubsets: BackstockRow[][] = [];
  let currLargestWeight = 0;
  for (const { total, subset } of validSubsets) {
    if (total >= currLargestWeight) {
      if (total > currLargestWeight) {
        currLargestWeight = total;
        largeSubsets.length = 0;
      }
      largeSubsets.push(subset);
    }
  }

  // We may not find a unique subset, so we just make a random choice
  const randomIndex = Math.floor(Math.random() * largeSubsets.length);
  const backstockWeights = largeSubsets[randomIndex];

  return backstockWeights;
}

function getLbOzWeight(oz: number): string {
  const lbs = Math.floor(oz / 16);
  const remainingOz = Math.ceil(oz % 16);

  if (remainingOz === 16) {
    return lbs === 0 ? "1lb 0oz" : `${lbs + 1}lbs 0oz`;
  }

  return lbs === 1 ? `1lb ${remainingOz}oz` : `${lbs}lbs ${remainingOz}oz`;
}

// import getTable from "../supabase/getTable";
// import updateTableRows from "../supabase/updateTableRows";
// import { BackstockRow, Ingredients, Meal } from "./types";

// export default async function makeBackstockAdjustments(
//   ingredients: Ingredients
// ): Promise<{
//   meals: Meal[];
// }> {
//   const allBackstock = await getTable("backstock");
//   const allShrink = (await getTable("proteins", ["name", "shrink"])).reduce(
//     (acc, curr) => {
//       acc[curr.name] = curr.shrink;
//       return acc;
//     },
//     {} as Record<string, number>
//   );

//   const meals: Meal[] = [];
//   const usedBackstockIds: number[] = [];

//   const sortedProteins = Object.keys(ingredients).sort();
//   for (const protein of sortedProteins) {
//     const flavorMap = ingredients[protein];
//     const sortedFlavors = Object.keys(flavorMap).sort();
//     for (const flavor of sortedFlavors) {
//       const weight = ingredients[protein][flavor];
//       const backstockRows = getBackstockWeights(
//         allBackstock,
//         protein,
//         flavor,
//         weight
//       );

//       const shrinkMultiplier = 1 + allShrink[protein] / 100;
//       if (!backstockRows) {
//         meals.push({
//           protein,
//           flavor,
//           weightOz: weight,
//           weightLbOz: getLbOzWeight(weight),
//           backstockWeight: 0,
//           cookedWeightOz: Number((weight * shrinkMultiplier).toFixed(2)),
//         });
//         continue;
//       }

//       const adjWeight = backstockRows.reduce((finalWeight, row) => {
//         usedBackstockIds.push(row.id);
//         return finalWeight - row.weight;
//       }, weight);
//       meals.push({
//         protein,
//         flavor,
//         weightOz: adjWeight,
//         weightLbOz: getLbOzWeight(adjWeight),
//         backstockWeight: weight - adjWeight,
//         cookedWeightOz: Number((adjWeight * shrinkMultiplier).toFixed(2)),
//       });
//     }
//   }

//   if (false) {
//     await updateTableRows("backstock", { available: false }, usedBackstockIds);
//   }

//   return { meals };
// }

// function getBackstockWeights(
//   allBackstock: BackstockRow[],
//   protein: string,
//   flavor: string,
//   weight: number
// ): BackstockRow[] | null {
//   const validBackstock = allBackstock.filter((row) => {
//     return (
//       row.available &&
//       row.weight <= weight &&
//       row.protein === protein &&
//       row.flavor === flavor
//     );
//   });
//   if (validBackstock.length === 0) return null;

//   // Iterate over subsets using binary strings
//   const validSubsets: { total: number; subset: BackstockRow[] }[] = [];
//   for (let i = 1; i < 2 ** validBackstock.length; i++) {
//     const subsetInstructions = i
//       .toString(2)
//       .padStart(validBackstock.length, "0");
//     const subset: BackstockRow[] = [];
//     let subsetTotal = 0;

//     for (let j = 0; j < subsetInstructions.length; j++) {
//       if (subsetInstructions[j] === "1") {
//         subsetTotal += validBackstock[j].weight;
//         subset.push(validBackstock[j]);
//       }
//     }

//     if (subsetTotal <= weight) {
//       validSubsets.push({
//         total: subsetTotal,
//         subset: subset,
//       });
//     }
//   }
//   if (validSubsets.length === 0) return null;

//   const largeSubsets: BackstockRow[][] = [];
//   let currLargestWeight = 0;
//   for (const { total, subset } of validSubsets) {
//     if (total >= currLargestWeight) {
//       if (total > currLargestWeight) {
//         currLargestWeight = total;
//         largeSubsets.length = 0;
//       }
//       largeSubsets.push(subset);
//     }
//   }

//   // We may not find a unique subset, so we just make a random choice
//   const soRandom = Math.floor(Math.random() * largeSubsets.length);
//   const backstockWeights = largeSubsets[soRandom];

//   return backstockWeights;
// }

// function getLbOzWeight(oz: number): string {
//   /** Calculate the pounds and remaining ounces */
//   const lbs = Math.floor(oz / 16);
//   const lbString = lbs == 1 ? "lb" : "lbs";
//   const remainingOz = Math.ceil(oz % 16);

//   /** Round up to the nearest pound in the event that remaining oz is 16 */
//   if (remainingOz === 16) {
//     return `${lbs + 1}${lbString} 0oz`;
//   }

//   return `${lbs}${lbString} ${remainingOz}oz`;
// }
