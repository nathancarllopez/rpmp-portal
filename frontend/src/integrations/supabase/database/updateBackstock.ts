import { supabase } from "../client";

export interface UpdateBackstockInfo {
  [id: string]: {
    weight: number;
    created_at: string; // timestampz in supabase, new Date().toISOString() here
    deleted_on?: string | null; // Including this property changes the column in the backstock table, and excluding it ignores that column. The string is a timestampz and null undoes the soft delete
  };
}

export async function updateBackstock(updateInfo: UpdateBackstockInfo) {
  console.log(updateInfo);

  const { data, error } = await supabase.rpc("update_backstock_rows", {
    updates: updateInfo,
  });

  if (error) {
    console.warn("Error updating backstock rows");
    console.warn(error.message);

    throw error;
  }

  return data;
}
