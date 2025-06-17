// import { Order, OrderStatistics, OrderError, Ingredients } from "./types";

import {
  Ingredients,
  Order,
  OrderError,
  OrderStatistics,
} from "@rpmp-portal/types";

export default function calculateOrderInfo(orders: Order[]): {
  stats: OrderStatistics;
  orderErrors: OrderError[];
  ingredients: Ingredients;
} {
  const stats: OrderStatistics = {
    orders: 0,
    meals: 0,
    veggieMeals: 0,
    thankYouBags: 0,
    containers: {
      "2.5oz": 0,
      "4oz": 0,
      "6oz": 0,
      "8oz": 0,
      "10oz": 0,
      bulk: 0,
    },
  };
  const orderErrors: OrderError[] = [];
  const ingredients: Ingredients = {};

  const orderCountByName: { [fullName: string]: number } = {};
  for (const order of orders) {
    // Check for missing information, skip order if found
    // If the protein string is missing then the order is a veggie meal, so that doesn't count as 'missing'
    const missingInfo: string[] = [];
    for (const orderProp in order) {
      if (orderProp !== "protein" && !order[orderProp as keyof typeof order]) {
        missingInfo.push(orderProp);
      }
    }
    if (missingInfo.length > 0) {
      orderErrors.push({
        error: null,
        message: `Order missing the following information: ${missingInfo}`,
        order,
      });
      continue;
    }

    // Extract the container size, skip if issues arise
    // const { fullName, itemName, flavor, protein, quantity } = order;
    // const { size, weight, issue } = getContainerSize(itemName);
    // if (issue || !weight) {
    //   orderErrors.push({
    //     error: null,
    //     message:
    //       issue ?? `Could not extract weight from this size string: ${size}`,
    //     order,
    //   });
    //   continue;
    // }
    // const sizeKey = size as keyof typeof stats.containers;

    // Extract the order information
    const {
      fullName,
      quantity,
      container,
      protein,
      weight,
      flavor,
      proteinLabel,
      flavorLabel,
    } = order;

    // Track the orders by name
    if (orderCountByName[fullName]) {
      orderCountByName[fullName] += quantity;
    } else {
      orderCountByName[fullName] = quantity;
    }

    // Update the meal and container count
    stats.meals += quantity;
    stats.containers[container] += quantity;

    // Skip ingredient calculations for pure veggie meals
    if (!protein) {
      stats.veggieMeals += quantity;
      continue;
    }

    // Calculate aggregate totals for each protein&flavor combo
    const aggWeight = weight * quantity;
    if (ingredients[protein]) {
      ingredients[protein][flavor] = {
        proteinLabel,
        flavorLabel,
        weight: aggWeight + (ingredients[protein][flavor].weight ?? 0),
      };
    } else {
      ingredients[protein] = {
        [flavor]: {
          proteinLabel,
          flavorLabel,
          weight: aggWeight,
        },
      };
    }
  }

  // Number of orders = number of unique names on order sheet
  // Number of thank you bags = 1 per 14 meals for each order
  stats.orders = Object.keys(orderCountByName).length;
  stats.thankYouBags = Object.values(orderCountByName).reduce(
    (count, orderCount) => {
      return count + Math.ceil(orderCount / 14);
    },
    0
  );

  return { stats, orderErrors, ingredients };
}

// function getContainerSize(itemName: string): {
//   size: string | null;
//   weight: number | null;
//   issue: string | null;
// } {
//   // Captures, e.g., "2 lbs", "4.5oz", "3lb", and "17 oz"
//   const pattern = /\b(\d+(\.\d+)?)\s?(lb|lbs|oz)\b/i;
//   const matches = itemName.match(pattern);

//   if (!matches) {
//     return {
//       size: null,
//       weight: null,
//       issue: "Could not extract container size from item name",
//     };
//   }

//   const match = matches[0].replace(" ", "").toLowerCase();
//   if (match.includes("lb")) {
//     const weightInOz =
//       16 * parseFloat(match.replace("lbs", "").replace("lb", ""));
//     return {
//       size: "bulk",
//       weight: weightInOz,
//       issue: null,
//     };
//   } else if (["2.5oz", "4oz", "6oz", "8oz", "10oz"].includes(match)) {
//     const weight = parseFloat(match.replace("oz", ""));
//     return {
//       size: match,
//       weight,
//       issue: null,
//     };
//   }

//   return {
//     size: null,
//     weight: null,
//     issue: `Unexpected container size: ${match}`,
//   };
// }
