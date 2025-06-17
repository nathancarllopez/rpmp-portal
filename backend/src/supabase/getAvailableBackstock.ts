// import { BackstockRow, snakeToCamel } from "@rpmp-portal/types";
// // import cache from "src/cache";
// import { supabase } from "./client";

// export default async function getAvailableBackstock(): Promise<BackstockRow[]> {
//   // const cached: string | undefined = cache.get('backstock');
//   // if (cached) {
//   //   const parsed: BackstockRow[] = JSON.parse(cached);
//   //   return parsed;
//   // }

//   const { data, error } = await supabase
//     .from('backstock')
//     .select()
//     .eq('available', true);

//   if (error) {
//     console.log("Failed to fetch backstock");
//     throw error;
//   }

//   // const stringified = JSON.stringify(data);
//   // cache.set('backstock', stringified);

//   return data.map((row) => snakeToCamel<BackstockRow>(row));
// }