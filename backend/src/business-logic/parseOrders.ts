import { parse } from "csv-parse";
import { CsvError } from "csv-parse";
import { Order } from "./types";

/**
 * Column strings in the client's csv files from their meal order software
 */
const HEADER_MAPPING: Record<string, string> = {
  firstName: "First Name (Shipping)",
  lastName: "Last Name (Shipping)",
  itemName: "Item Name",
  flavor: "Flavor",
  protein: "Tags",
  quantity: "Quantity",
};

/**
 * Flavor strings to flavor codes
 */
const FLAVOR_MAPPING: Record<string, string> = {
  "COMPETITOR-PREP (100% PLAIN-PLAIN)": "x",
  "BBQ CHICKEN (SUGAR FREE)": "bbq",
  BLACKENED: "blackened",
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
};

export default function parseOrders(csvString: string): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    const options = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    };

    parse(csvString, options, afterParse);

    function afterParse(
      err: CsvError | undefined,
      records: Record<string, string>[]
    ) {
      if (err) {
        reject(err);
      } else {
        const missingHeaders = validateHeaders(records[0]);
        if (missingHeaders.length > 0) {
          throw new Error("Headers missing:\n" + missingHeaders.join("\n"));
        }

        try {
          const cleaned = cleanRecords(records);
          resolve(cleaned);
        } catch (error) {
          if (error instanceof Error) {
            console.warn("Error parsing order: ", error.message);
          } else {
            console.warn("Unkown error parsing order: ", JSON.stringify(error));
          }

          reject(error);
        }
      }
    }
  });
}

function validateHeaders(firstRecord: Record<string, string>): string[] {
  const requiredHeaders = Object.values(HEADER_MAPPING);
  const missingHeaders: string[] = [];

  for (const header of requiredHeaders) {
    if (!firstRecord.hasOwnProperty(header)) {
      missingHeaders.push(header);
    }
  }

  return missingHeaders;
}

function cleanRecords(records: Record<string, string>[]): Order[] {
  // To do: Remove records, e.g., those that are missing required fields
  const filtered: Record<string, string>[] = records.filter((record) => true);

  const cleaned: Order[] = filtered.map((record) => {
    const rawFlavor = record[HEADER_MAPPING.flavor];
    const flavorLabel = (() => {
      if (rawFlavor === "" || rawFlavor === "100% PLAIN-PLAIN") {
        return "COMPETITOR-PREP (100% PLAIN-PLAIN)";
      }
      if (rawFlavor === "SPICY BISON") {
        return "SPICY BEEF BISON";
      }
      return rawFlavor;
    })();

    const proteinLabel = record[HEADER_MAPPING.protein];
    const protein = (() => {
      switch (proteinLabel) {
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

    const fullName =
      record[HEADER_MAPPING.firstName] + " " + record[HEADER_MAPPING.lastName];

    return {
      fullName: fullName,
      itemName: record[HEADER_MAPPING.itemName],
      flavorLabel,
      flavor: FLAVOR_MAPPING[flavorLabel],
      protein,
      proteinLabel,
      quantity: parseInt(record[HEADER_MAPPING.quantity]),
    };
  });

  return cleaned;
}
