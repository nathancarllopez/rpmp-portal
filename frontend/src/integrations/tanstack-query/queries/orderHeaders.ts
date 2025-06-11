import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export interface OrderHeaderRow {
  id: number;
  name: string;
  label: string;
  rawLabel: string;
}

export function orderHeadersOptions() {
  return queryOptions({
    queryKey: ["orderHeaders"],
    queryFn: getOrderHeaders,
    staleTime: Infinity
  });
}

async function getOrderHeaders(): Promise<OrderHeaderRow[]> {
  const { data, error } = await supabase
    .from("order_headers")
    .select();

  if (error) {
    console.warn("Failed to fetch order headers");
    console.warn(error.message);

    throw error;
  }

  const orderHeaders: OrderHeaderRow[] = data
    .sort((rowA, rowB) => rowA.label.localeCompare(rowB.label))
    .map((row) => ({
      id: row.id,
      name: row.name,
      label: row.label,
      rawLabel: row.raw_label,
    }));

  return orderHeaders;
}
