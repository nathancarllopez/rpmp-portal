// import { supabase } from "../client.ts";
// import type { Profile } from "../types/types.ts";
// import snakeToCamel from "../util/snakeToCamel.ts";

// export default async function getProfiles(match: string): Promise<Profile[]> {
//   let query = supabase.from("profiles").select();

//   if (match) {
//     const columnsToMatch = ["email", "first_name", "last_name", "role"];
//     const matchString = columnsToMatch
//       .map((col) => `${col}.ilike.%${match}%`)
//       .join(",");
//     query = query.or(matchString);
//   }

//   query = query
//     .order("first_name", { ascending: true })
//     .order("last_name", { ascending: true });
//   const { data, error } = await query;

//   if (error) {
//     console.log("Error fetching profiles:", error.message);
//     console.log(error.code);

//     throw error;
//   }

//   const profiles = data.map((profile) => snakeToCamel(profile)) as Profile[];

//   return profiles;
// }
