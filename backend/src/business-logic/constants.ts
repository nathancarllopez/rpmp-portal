/**
 * Column strings in the client's csv files from their meal order software
 */
export const HEADER_MAPPING: Record<string, string> = {
  firstName: "First Name (Shipping)",
  lastName: "Last Name (Shipping)",
  itemName: "Item Name",
  flavor: "Flavor",
  protein: "Tags",
  // productVariation: "Product Variation",
  quantity: "Quantity",
};

/**
 * Flavor strings to flavor codes
 */
export const FLAVOR_MAPPING: Record<string, string> = {
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
