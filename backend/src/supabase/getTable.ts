import cache from "../cache";
import { supabase } from "./client";
import { TableName } from "./types";

export default async function getTable(tableName: TableName, columnsToSelect: string[] = []) {
  const cachedTable = cache.get(tableName);
  if (cachedTable) return cachedTable
  
  const { data, error } = await supabase.from(tableName).select( ...columnsToSelect );

  if (error) {
    throw error;
  }

  cache.set(tableName, data);
  return data;
}