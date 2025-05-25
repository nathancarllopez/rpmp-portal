import { parse } from "csv-parse";
import { CsvError } from "csv-parse";
import { Order } from "./types";

export default function parseOrders(csvString: string): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    const options = {
      columns: true,
      skip_empty_lines: true,
      trim: true
    };

    const callback = (err: CsvError | undefined, records: { [key: string]: string }[]) => {
      if (err) {
        reject(err);
      } else {
        try {
          const cleaned = cleanRecords(records);
          resolve(cleaned);
        } catch (error) {
          reject(error);
        }
      }
    }
    
    parse(
      csvString,
      options,
      callback
    );
  });
}

function cleanRecords(records: { [key: string]: string }[]): Order[] {
  return records.filter((record) => {
    return true // To do: Remove records that are missing required fields
  }).map((record) => {
    const rawFlavor = record[HEADER_MAPPING.flavor];
    const flavorLabel = (() => {
      if (rawFlavor === "" || rawFlavor === '100% PLAIN-PLAIN') {
        return 'COMPETITOR-PREP (100% PLAIN-PLAIN)';
      }
      if (rawFlavor === 'SPICY BISON') {
        return "SPICY BEEF BISON";
      }
      return rawFlavor;
    })();

    const proteinLabel = record[HEADER_MAPPING.protein]
    const protein = (() => {
      switch(proteinLabel) {
        case "Beef Bison":
        case "Egg Whites":
        case "Mahi Mahi": {
          const [first, second] = proteinLabel.split(" ");
          return first.toLowerCase() + second;
        }

        default: {
          return proteinLabel.toLowerCase();
        }
      }
    })();

    return {
      fullName: `${record[HEADER_MAPPING.firstName]} ${record[HEADER_MAPPING.lastName]}`,
      itemName: record[HEADER_MAPPING.itemName],
      flavorLabel,
      flavor: FLAVOR_MAPPING[flavorLabel],
      protein,
      proteinLabel,
      quantity: parseInt(record[HEADER_MAPPING.quantity])
    };
  });
}

/**
 * Column strings in the client's csv files from their meal order software
 */
const HEADER_MAPPING: Record<string, string> = {
  firstName: "First Name (Shipping)",
  lastName: "Last Name (Shipping)",
  itemName: "Item Name",
  flavor: "Flavor",
  protein: "Tags",
  // productVariation: "Product Variation",
  quantity: "Quantity"
};

/**
 * Flavor strings to flavors
 */
const FLAVOR_MAPPING: Record<string, string> = {
  "COMPETITOR-PREP (100% PLAIN-PLAIN)": "x",
  "BBQ CHICKEN (SUGAR FREE)": "bbq",
  "BLACKENED": "blackened",
  "GARLIC AND HERB (As Described)": "garlicHerb",
  "HIMALAYAN PINK SALT AND PEPPER ONLY": "saltAndPepper",
  "LEMON PEPPER": "lemonPepper",
  "SPICY BEEF BISON": "spicy",
  "SPICY TERIYAKI BEEF BISON": "spicyTeriyaki",
  "SPICY TERIYAKI TURKEY": "spicyTeriyaki",
  "SPICY TURKEY": "spicy",
  "SRIRACHA CHICKEN (SPICY &amp; SWEET)": "sriracha",
  "STEAKHOUSE SHRIMP": "steakhouse",
  "STEAKHOUSE SIRLOIN": "steakhouse",
  "TASTY FAJITA": "fajita",
  "TERIYAKI (SUGAR FREE)": "teriyaki",
  "TWISTED CAJUN (As Described)": "twistedCajun",
  "TWISTED TERIYAKI": "twistedTeriyaki",
  "WILD'N SHRIMP (As Described)": "wildn",
  "ZEST'N LEMON": "zestn",
}