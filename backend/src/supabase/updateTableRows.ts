import { TableName } from "../business-logic/types";
import { supabase } from "./client";

export type UpdateSpec = Record<string, any>;

export default async function updateTableRows(
  tableName: TableName,
  updateSpec: UpdateSpec,
  idsToUpdate: number[]
) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updateSpec)
    .in("id", idsToUpdate);

  if (error) throw error;

  return data;
}
