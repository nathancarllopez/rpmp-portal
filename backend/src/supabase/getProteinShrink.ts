// import { ProteinShrink } from "@rpmp-portal/types";
// // import cache from "../cache";
// import { supabase } from "./client";

// export default async function getProteinShrink(): Promise<ProteinShrink> {
//   // const cached: string | undefined = cache.get('proteinShrink');
//   // if (cached) {
//   //   const parsed: ProteinShrink = JSON.parse(cached);
//   //   return parsed;
//   // }

//   const { data, error } = await supabase
//     .from('proteins')
//     .select('name, shrink');

//   if (error) {
//     console.log("Failed to fetch protein shrink");
//     throw error;
//   }

//   // const stringified = JSON.stringify(data);
//   // cache.set('proteinShrink', stringified);

//   const proteinShrink: ProteinShrink = {};
//   data.forEach((row) => proteinShrink[row.name] = row.shrink);

//   return proteinShrink;
// }
