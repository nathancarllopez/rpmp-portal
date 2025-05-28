import { parse } from "csv-parse";
import { CsvError } from "csv-parse";
import { Order } from "./types";
import { FLAVOR_MAPPING, HEADER_MAPPING } from "./constants";

export default function parseOrders(csvString: string): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    const options = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    };

    const callback = (
      err: CsvError | undefined,
      records: Record<string, string>[]
    ) => {
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
    };

    parse(csvString, options, callback);
  });
}

// To do: Write this function and add it to the callback above
function validateHeader() {}

function cleanRecords(records: Record<string, string>[]): Order[] {
  return records
    .filter((record) => {
      return true; // To do: Remove records that are missing required fields
    })
    .map((record) => {
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

      return {
        fullName: `${record[HEADER_MAPPING.firstName]} ${
          record[HEADER_MAPPING.lastName]
        }`,
        itemName: record[HEADER_MAPPING.itemName],
        flavorLabel,
        flavor: FLAVOR_MAPPING[flavorLabel],
        protein,
        proteinLabel,
        quantity: parseInt(record[HEADER_MAPPING.quantity]),
      };
    });
}
