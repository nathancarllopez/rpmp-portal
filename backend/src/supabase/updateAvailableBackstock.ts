// import { supabase } from "./client";

// export default async function updateAvailableBackstock(idsUsed: number[]) {
//   const { error } = await supabase.from('backstock').update({ available: false }).in("id", idsUsed);

//   if (error) {
//     console.warn("Failed to update available backstock")
//     console.warn(error.message);

//     throw error;
//   }
// }