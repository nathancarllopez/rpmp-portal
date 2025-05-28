import { TableColumn, TableName, TableRow } from "../business-logic/types";
import cache from "../cache";
import { supabase } from "./client";

export default async function getTable<T extends TableName>(
  tableName: T,
  columnsToSelect: TableColumn<T>[] = []
): Promise<TableRow<T>[]> {
  const cachedTable: string | undefined = cache.get(tableName);
  if (cachedTable) {
    const parsed: TableRow<T>[] = JSON.parse(cachedTable);
    return parsed;
  }

  const { data, error } = await supabase
    .from(tableName)
    .select(columnsToSelect.join(","));

  if (error) {
    console.log("Failed to fetch table");
    console.log("tableName", tableName);
    console.log("columnsToSelect", columnsToSelect);
    throw error;
  }

  const stringified: string = JSON.stringify(data);
  cache.set(tableName, stringified);
  return data as unknown as TableRow<T>[];
}
