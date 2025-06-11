// import { supabase } from "../client";

// export interface NewBackstockInfo {
//   protein: string;
//   flavor: string;
//   weight: number;
// }

// export async function insertBackstock(newBackstock: NewBackstockInfo[]) {
//   const { error } = await supabase.from('backstock').insert(newBackstock);

//   if (error) {
//     console.warn("Failed to insert new backstock rows");
//     console.warn(error.message);

//     throw error;
//   }
// }