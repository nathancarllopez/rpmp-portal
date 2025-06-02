import { TableName } from "../business-logic/types";
import { supabase } from "./client";

export type UpdateSpec = Record<string, any>;

export default async function updateTableRows(
  tableName: TableName,
  updateSpec: UpdateSpec,
  idsToUpdate?: number[]
) {
  let updateQuery = supabase.from(tableName).update(updateSpec);

  if (idsToUpdate && idsToUpdate.length > 0) {
    updateQuery = updateQuery.in("id", idsToUpdate);
  } else {
    updateQuery.gt("id", 0);
  }

  const { data, error } = await updateQuery;

  if (error) {
    console.warn(`Failed to update ${tableName}`);
    console.warn(error.message);
    
    throw error;
  }

  return data;
}
