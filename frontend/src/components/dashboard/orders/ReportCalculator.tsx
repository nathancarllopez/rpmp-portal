import { backstockOptions } from "@/integrations/tanstack-query/queries/backstock";
import { proteinsOptions } from "@/integrations/tanstack-query/queries/proteins";
import { pullListOptions } from "@/integrations/tanstack-query/queries/pullList";
import { veggieCarbInfoOptions } from "@/integrations/tanstack-query/queries/veggieCarbInfo";
import fetchReportUrl from "@/util/fetchReportUrl";
import updateOrderReportInfo from "@/util/updateOrderReportInfo";
import { Center, Loader, Paper, Text } from "@mantine/core";
import type {
  AllBackstockRow,
  OrderReportInfo,
  ProteinRow,
} from "@rpmp-portal/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

interface ReportCalculatorProps {
  orderReportInfo: OrderReportInfo;
  setOrderReportInfo: React.Dispatch<React.SetStateAction<OrderReportInfo>>;
  setReportUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  toNextStep: () => void;
}

export default function ReportCalculator({
  orderReportInfo,
  setOrderReportInfo,
  setReportUrl,
  toNextStep,
}: ReportCalculatorProps) {
  const [calculationStarted, setCalculationStarted] = useState(false);

  const { data: allBackstock, error: backstockError } = useSuspenseQuery({
    ...backstockOptions(),
    select: (data) => data.filter((bRow) => bRow.available),
  });
  const { proteinBackstock, veggieCarbBackstock } = allBackstock.reduce(
    (result, row) => {
      if (row.isProtein) {
        result.proteinBackstock.push(row);
      } else {
        result.veggieCarbBackstock.push(row);
      }
      return result;
    },
    { proteinBackstock: [], veggieCarbBackstock: [] } as {
      proteinBackstock: AllBackstockRow[];
      veggieCarbBackstock: AllBackstockRow[];
    }
  );

  const { data: proteinInfo, error: proteinError } = useSuspenseQuery({
    ...proteinsOptions(),
    select: (data) =>
      data.reduce((info, pRow) => {
        info[pRow.name] = pRow;
        return info;
      }, {} as Record<string, ProteinRow>),
  });

  const { data: veggieCarbInfo, error: veggieCarbError } = useSuspenseQuery(
    veggieCarbInfoOptions()
  );

  const { data: pullList, error: pullListError } = useSuspenseQuery(
    pullListOptions()
  );

  const errors = [
    backstockError,
    proteinError,
    veggieCarbError,
    pullListError,
  ].filter((err) => !!err);
  if (errors.length > 0) {
    return (
      <Paper>
        <Center>
          <Text>Error fetching backstock and/or shrink data</Text>
          {errors.map((err) => (
            <Text>{err.message}</Text>
          ))}
        </Center>
      </Paper>
    );
  }

  useEffect(() => {
    const doCalculation = async () => {
      setCalculationStarted(true);

      const updatedInfo = updateOrderReportInfo(
        orderReportInfo,
        proteinBackstock,
        veggieCarbBackstock,
        proteinInfo,
        veggieCarbInfo,
        pullList
      );
      setOrderReportInfo(updatedInfo);

      const url = await fetchReportUrl(updatedInfo);
      setReportUrl(url);

      toNextStep();
    };

    if (!calculationStarted) {
      doCalculation();
    }
  }, [calculationStarted]);

  return (
    <Paper>
      <Center>
        <Loader />
        <Text>
          {calculationStarted
            ? "Calculating information for report..."
            : "Generating report pdf..."}
        </Text>
      </Center>
    </Paper>
  );
}

// import { backstockOptions } from "@/integrations/tanstack-query/queries/backstock";
// import { proteinsOptions } from "@/integrations/tanstack-query/queries/proteins";
// import { pullListOptions } from "@/integrations/tanstack-query/queries/pullList";
// import { veggieCarbInfoOptions } from "@/integrations/tanstack-query/queries/veggieCarbInfo";
// import fetchReportUrl from "@/util/fetchReportUrl";
// import { Center, Loader, Paper, Text } from "@mantine/core";
// import type {
//   AllBackstockRow,
//   IngredientAmounts,
//   Meal,
//   Order,
//   OrderError,
//   OrderStatistics,
//   ProteinRow,
//   ProteinWeights,
//   PullListDatas,
//   PullListRow,
//   VeggieCarbInfoRow,
// } from "@rpmp-portal/types";
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { useEffect, useState } from "react";

// interface ReportCalculatorProps {
//   orderData: Order[];
//   setReportUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
//   setUsedBackstockIds: React.Dispatch<React.SetStateAction<Set<number>>>;
//   toNextStep: () => void;
// }

// export default function ReportCalculator({
//   orderData,
//   setReportUrl,
//   setUsedBackstockIds,
//   toNextStep,
// }: ReportCalculatorProps) {
//   const [calculationStarted, setCalculationStarted] = useState(false);

//   const { data: allBackstock, error: backstockError } = useSuspenseQuery({
//     ...backstockOptions(),
//     select: (data) => data.filter((bRow) => bRow.available),
//   });
//   const { proteinBackstock, veggieCarbBackstock } = allBackstock.reduce(
//     (result, row) => {
//       if (row.isProtein) {
//         result.proteinBackstock.push(row);
//       } else {
//         result.veggieCarbBackstock.push(row);
//       }
//       return result;
//     },
//     { proteinBackstock: [], veggieCarbBackstock: [] } as {
//       proteinBackstock: AllBackstockRow[];
//       veggieCarbBackstock: AllBackstockRow[];
//     }
//   );

//   const { data: proteinInfo, error: proteinError } = useSuspenseQuery({
//     ...proteinsOptions(),
//     select: (data) =>
//       data.reduce((info, pRow) => {
//         info[pRow.name] = pRow;
//         return info;
//       }, {} as Record<string, ProteinRow>),
//   });

//   const { data: veggieCarbInfo, error: veggieCarbError } = useSuspenseQuery(
//     veggieCarbInfoOptions()
//   );

//   const { data: pullList, error: pullListError } = useSuspenseQuery(
//     pullListOptions()
//   );

//   const errors = [
//     backstockError,
//     proteinError,
//     veggieCarbError,
//     pullListError,
//   ].filter((err) => !!err);
//   if (errors.length > 0) {
//     return (
//       <Paper>
//         <Center>
//           <Text>Error fetching backstock and/or shrink data</Text>
//           {errors.map((err) => (
//             <Text>{err.message}</Text>
//           ))}
//         </Center>
//       </Paper>
//     );
//   }

//   useEffect(() => {
//     const doCalculation = async () => {
//       setCalculationStarted(true);

//       const info = calculateReportInfo(
//         orderData,
//         proteinBackstock,
//         veggieCarbBackstock,
//         proteinInfo,
//         veggieCarbInfo,
//         pullList
//       );
//       setUsedBackstockIds(info.usedBackstockIds);

//       const url = await fetchReportUrl({ orderData, ...info });
//       setReportUrl(url);

//       toNextStep();
//     };

//     if (!calculationStarted) {
//       doCalculation();
//     }
//   }, [calculationStarted]);

//   return (
//     <Paper>
//       <Center>
//         <Loader />
//         <Text>
//           {calculationStarted
//             ? "Calculating information for report..."
//             : "Generating report pdf..."}
//         </Text>
//       </Center>
//     </Paper>
//   );
// }

// // Calculator functions
// //#region
// function calculateReportInfo(
//   orderData: Order[],
//   proteinBackstock: AllBackstockRow[],
//   veggieCarbBackstock: AllBackstockRow[],
//   proteinInfo: Record<string, ProteinRow>,
//   veggieCarbInfo: VeggieCarbInfoRow[],
//   pullList: PullListRow[]
// ): {
//   stats: OrderStatistics;
//   orderErrors: OrderError[];
//   meals: Meal[];
//   usedBackstockIds: Set<number>;
//   pullListDatas: PullListDatas[];
// } {
//   const stats: OrderStatistics = {
//     orders: 0,
//     mealCount: 0,
//     veggieMeals: 0,
//     thankYouBags: 0,
//     totalProteinWeight: 0,
//     teriyakiCuppyCount: 0,
//     extraRoastedVeggies: 0,
//     proteinCubes: {},
//     containers: {},
//     proteins: {},
//     veggieCarbs: {},
//   };
//   const orderErrors: OrderError[] = [];
//   const meals: Meal[] = [];
//   const usedBackstockIds: Set<number> = new Set();

//   const orderCountByName: { [fullName: string]: number } = {};
//   const proteinWeights: ProteinWeights = {};

//   for (const order of orderData) {
//     // Check for missing information, skip order if found
//     // If the protein string is missing then the order is a veggie/carb only meal, so that doesn't count as 'missing'
//     const missingInfo: string[] = [];
//     for (const orderProp in order) {
//       if (orderProp !== "protein" && !order[orderProp as keyof typeof order]) {
//         missingInfo.push(orderProp);
//       }
//     }
//     if (missingInfo.length > 0) {
//       orderErrors.push({
//         error: null,
//         message: `Order missing the following information: ${missingInfo}`,
//         order,
//       });
//       continue;
//     }

//     // Extract the order information
//     const {
//       fullName,
//       quantity,
//       container,
//       protein,
//       weight,
//       flavor,
//       proteinLabel,
//       flavorLabel,
//     } = order;

//     // Track the orders by name
//     if (orderCountByName[fullName]) {
//       orderCountByName[fullName] += quantity;
//     } else {
//       orderCountByName[fullName] = quantity;
//     }

//     // Update the meal and container count
//     stats.mealCount += quantity;
//     if (!stats.containers[container]) {
//       stats.containers[container] = 0;
//     }
//     stats.containers[container] += quantity;
//     if (
//       flavor === "teriyaki" ||
//       flavorLabel.toLowerCase().includes("teriyaki")
//     ) {
//       stats.teriyakiCuppyCount += quantity;
//     }

//     // Skip ingredient calculations for pure veggie/carb meals
//     if (!protein) {
//       stats.veggieMeals += quantity;
//       continue;
//     }

//     // Calculate aggregate totals for each protein&flavor combo
//     const aggWeight = weight * quantity;
//     if (proteinWeights[protein]) {
//       proteinWeights[protein][flavor] = {
//         proteinLabel,
//         flavorLabel,
//         weight: aggWeight + (proteinWeights[protein][flavor]?.weight ?? 0),
//       };
//     } else {
//       proteinWeights[protein] = {
//         [flavor]: {
//           proteinLabel,
//           flavorLabel,
//           weight: aggWeight,
//         },
//       };
//     }
//   }

//   // Number of orders = number of unique names on order sheet
//   // Number of thank you bags = 1 per 14 meals for each order
//   stats.orders = Object.keys(orderCountByName).length;
//   stats.thankYouBags = Object.values(orderCountByName).reduce(
//     (count, orderCount) => {
//       return count + Math.ceil(orderCount / 14);
//     },
//     0
//   );

//   // Make backstock adjustments for proteins and add to meals array
//   const sortedProteins = Object.keys(proteinWeights).sort();
//   for (const protein of sortedProteins) {
//     const { shrink, displayColor } = proteinInfo[protein];
//     const sortedFlavors = Object.keys(proteinWeights[protein]).sort();

//     for (const flavor of sortedFlavors) {
//       const originalWeight = proteinWeights[protein][flavor].weight;
//       const backstockRows = chooseBackstockWeights(
//         proteinBackstock,
//         protein,
//         flavor,
//         originalWeight
//       );

//       let finalWeight = originalWeight;
//       let backstockWeight = 0;
//       if (backstockRows) {
//         backstockRows.forEach((row) => {
//           usedBackstockIds.add(row.id);
//           finalWeight -= row.weight;
//           backstockWeight += row.weight;
//         });
//       }

//       const shrinkMultiplier = 1 + shrink / 100;
//       meals.push({
//         protein,
//         proteinLabel: proteinWeights[protein][flavor].proteinLabel,
//         flavor,
//         flavorLabel: proteinWeights[protein][flavor].flavorLabel,
//         originalWeight,
//         weight: finalWeight,
//         weightLbOz: getLbOzWeight(finalWeight),
//         backstockWeight,
//         cookedWeight: Number((finalWeight * shrinkMultiplier).toFixed(2)),
//         displayColor,
//       });

//       proteinWeights[protein][flavor].weight = finalWeight;
//     }
//   }

//   // Adjust salt and pepper based chicken recipes (protein: chicken, flavor: x)
//   // Some of the chicken recipes use salt and pepper chicken as a base and just
//   // add a sauce, so we can use extra salt and pepper backstock for those
//   // recipes
//   const orderHasChicken = Object.hasOwn(proteinWeights, "chicken");
//   if (orderHasChicken) {
//     const { shrink } = proteinInfo["chicken"];
//     const chickenWeights = proteinWeights["chicken"];
//     const spFlavors = ["sriracha", "bbq", "teriyaki"];

//     for (const flavor of spFlavors) {
//       if (
//         !Object.hasOwn(chickenWeights, flavor) ||
//         chickenWeights[flavor].weight === 0
//       )
//         continue;

//       const mealToAdjustIdx = meals.findIndex(
//         (meal) => meal.protein === "chicken" && meal.flavor === flavor
//       );
//       if (mealToAdjustIdx === -1) continue;

//       const unclaimedBackstock = proteinBackstock.filter((row) => {
//         return (
//           row.name === "chicken" &&
//           row.subName === "x" &&
//           !usedBackstockIds.has(row.id)
//         );
//       });
//       if (unclaimedBackstock.length === 0) continue;

//       const originalWeight = chickenWeights[flavor].weight;
//       const backstockRows = chooseBackstockWeights(
//         unclaimedBackstock,
//         "chicken",
//         "x",
//         originalWeight
//       );
//       if (!backstockRows) continue;

//       let adjFinalWeight = meals[mealToAdjustIdx].weight;
//       let adjBackstockWeight = meals[mealToAdjustIdx].backstockWeight;
//       backstockRows.forEach((row) => {
//         usedBackstockIds.add(row.id);
//         adjFinalWeight -= row.weight;
//         adjBackstockWeight += row.weight;
//       });

//       const shrinkMultiplier = 1 + shrink / 100;
//       meals[mealToAdjustIdx] = {
//         ...meals[mealToAdjustIdx],
//         weight: adjFinalWeight,
//         weightLbOz: getLbOzWeight(adjFinalWeight),
//         backstockWeight: adjBackstockWeight,
//         cookedWeight: Number((adjFinalWeight * shrinkMultiplier).toFixed(2)),
//       };
//     }
//   }

//   // Aggregate proteins (converting to lbs) across flavors into stats.proteins
//   for (const meal of meals) {
//     const { protein, weight, proteinLabel } = meal;
//     const { lbsPer } = proteinInfo[protein];

//     if (!Object.hasOwn(stats.proteins, protein)) {
//       stats.proteins[protein] = {
//         label: proteinLabel,
//         amount: weight / 16,
//         lbsPer,
//         units: "lbs",
//       };
//     } else {
//       const currentAmount = stats.proteins[protein].amount;
//       stats.proteins[protein] = {
//         ...stats.proteins[protein],
//         amount: currentAmount + weight,
//       };
//     }
//   }

//   // Split beefBison into beef and bison: client wants 1.25 pounds of bison for
//   // every 10 pounds of beef. Also record the number of bison cubes
//   const roundAtTensPlace = (weight: number) => 10 * Math.round(weight / 10);
//   const { bisonCubes, beefWeight, bisonWeight } = (() => {
//     const beefBison = stats.proteins["beefBison"].amount;
//     const roundedBeefBison = roundAtTensPlace(beefBison);

//     const firstCubeCount = roundedBeefBison / 10;
//     const firstBison = firstCubeCount * 1.25;
//     const firstBeef = beefBison - firstBison;

//     if (roundAtTensPlace(firstBeef) === roundedBeefBison) {
//       return {
//         bisonCubes: firstCubeCount,
//         beefWeight: firstBeef,
//         bisonWeight: firstBison,
//       };
//     }

//     const bisonCubes = firstCubeCount - 1;
//     const beefWeight = bisonCubes * 1.25;
//     return {
//       bisonCubes,
//       beefWeight,
//       bisonWeight: beefBison - beefWeight,
//     };
//   })();
//   stats.proteins["beef"] = {
//     label: "Beef",
//     amount: beefWeight,
//     lbsPer: proteinInfo["beef"].lbsPer,
//     units: "lbs",
//   };
//   stats.proteins["bison"] = {
//     label: "Bison",
//     amount: bisonWeight,
//     lbsPer: proteinInfo["bison"].lbsPer,
//     units: "lbs",
//   };
//   delete stats.proteins["beefBison"];

//   // Add number of bison and turkey cubes
//   const turkeyLbsPer = proteinInfo["turkey"].lbsPer;
//   stats.proteinCubes = {
//     bison: bisonCubes,
//     turkey: Math.ceil(stats.proteins["turkey"].amount / turkeyLbsPer),
//   };

//   // Add two pounds to sirloin to account for trimmed fat
//   stats.proteins["sirloin"].amount += 2;

//   // Collect total protein weight for stats
//   stats.totalProteinWeight = Object.keys(stats.proteins).reduce(
//     (total, key) => {
//       const { amount } = stats.proteins[key];
//       return total + amount;
//     },
//     0
//   );

//   // Add the starting veggie and carb data using stats.mealCount:
//   // The amounts column contains how many units of each veggie and carb
//   // should be used for each meal count threshold
//   stats.veggieCarbs = veggieCarbInfo.reduce((result, vcRow) => {
//     const maxKey = Object.keys(vcRow.amounts).reduce(
//       (max, curr) => Math.max(max, Number(curr)),
//       0
//     );
//     const amountKey = Number(
//       Object.keys(vcRow.amounts)
//         .sort((a, b) => Number(a) - Number(b))
//         .find((key) => Number(key) >= stats.mealCount) || maxKey
//     );
//     const amount = vcRow.amounts[amountKey];

//     result[vcRow.name] = {
//       label: vcRow.label,
//       amount,
//       lbsPer: vcRow.lbsPer,
//       units: vcRow.units,
//     };
//     return result;
//   }, {} as IngredientAmounts);

//   // Adjust the amount of roasted veggies from the amount of beefBison with the
//   // fajita flavor: client wants an extra unit of roasted veggies per ten
//   // pounds of beefBison fajita (rounded up)
//   const beefBisonFajitaMeal = meals.find(
//     (meal) => meal.protein === "beefBison" && meal.flavor === "fajita"
//   );
//   if (beefBisonFajitaMeal) {
//     const oldRoastedVeggies = stats.veggieCarbs["roastedVeggies"];
//     const oldAmount = oldRoastedVeggies.amount;
//     const extra = Math.ceil(beefBisonFajitaMeal.originalWeight / 160);

//     stats.extraRoastedVeggies = extra;
//     stats.veggieCarbs = {
//       ...stats.veggieCarbs,
//       roastedVeggies: {
//         ...oldRoastedVeggies,
//         amount: oldAmount + extra,
//       },
//     };
//   }

//   // Make backstock adjustments for veggies and carbs
//   const veggieCarbKeys = Object.keys(stats.veggieCarbs);
//   for (const veggieCarb of veggieCarbKeys) {
//     const { amount } = stats.veggieCarbs[veggieCarb];

//     // Client specified change: if there are more Yams in backstock than ordered this week, then it isn't cost effective to defrost the backstock Yams and not use the extra weight. But, not using backstock means buying 40 more lbs of Yams (they only come in that size) which could be even more costly. So, if there is a way to pull backstock so that the extra weight is at most 5 lbs, then they're willing to absorb that loss.
//     const backstockRows =
//       veggieCarb === "yams"
//         ? chooseBackstockWeights(
//             veggieCarbBackstock,
//             veggieCarb,
//             undefined,
//             amount + 5
//           )
//         : chooseBackstockWeights(
//             veggieCarbBackstock,
//             veggieCarb,
//             undefined,
//             amount
//           );

//     if (backstockRows === null) continue;

//     let afterBackstockAmount = amount;
//     for (const row of backstockRows) {
//       afterBackstockAmount -= row.weight;
//       usedBackstockIds.add(row.id);
//     }

//     stats.veggieCarbs[veggieCarb].amount = afterBackstockAmount;
//   }

//   // Fill the pull list rows
//   const pullListDatas = pullList
//     .filter((row) => Object.hasOwn(stats.veggieCarbs, row.name))
//     .map((row) => {
//       const { name, label, freezerMonday, freezerSunday } = row;
//       const { amount } = stats.veggieCarbs[name];

//       if (name === "roastedVeggies") {
//         return {
//           label,
//           sunday: stats.extraRoastedVeggies.toString(),
//           monday: String(amount - stats.extraRoastedVeggies),
//         };
//       }

//       if (freezerSunday) {
//         return {
//           label,
//           sunday: amount.toString(),
//           monday: "",
//         };
//       }

//       if (freezerMonday) {
//         return {
//           label,
//           sunday: "",
//           monday: amount.toString(),
//         };
//       }

//       return { label, sunday: "", monday: "" };
//     });

//   return { stats, orderErrors, meals, usedBackstockIds, pullListDatas };
// }

// function chooseBackstockWeights(
//   allBackstock: AllBackstockRow[],
//   name: string,
//   subName: string | undefined,
//   weight: number
// ): AllBackstockRow[] | null {
//   const validBackstock = allBackstock.filter((row) => {
//     let goodRow = row.available && row.weight <= weight && row.name === name;

//     if (subName) {
//       goodRow = goodRow && row.subName === subName;
//     }

//     return goodRow;
//   });
//   if (validBackstock.length === 0) return null;

//   // Iterate over subsets using binary strings
//   const validSubsets: { total: number; subset: AllBackstockRow[] }[] = [];
//   for (let i = 1; i < 2 ** validBackstock.length; i++) {
//     const subsetInstructions = i
//       .toString(2)
//       .padStart(validBackstock.length, "0");
//     const subset: AllBackstockRow[] = [];
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

//   const largeSubsets: AllBackstockRow[][] = [];
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
//   const randomIndex = Math.floor(Math.random() * largeSubsets.length);
//   const backstockWeights = largeSubsets[randomIndex];

//   return backstockWeights;
// }

// function getLbOzWeight(oz: number): string {
//   const lbs = Math.floor(oz / 16);
//   const remainingOz = Math.ceil(oz % 16);

//   if (remainingOz === 16) {
//     return lbs === 0 ? "1lb 0oz" : `${lbs + 1}lbs 0oz`;
//   }

//   return lbs === 1 ? `1lb ${remainingOz}oz` : `${lbs}lbs ${remainingOz}oz`;
// }
// //#endregion
