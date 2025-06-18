import { supabase } from "@/integrations/supabase/client";
import {
  snakeToCamel,
  type InsertOrderHistoryRow,
  type OrderHistoryRow,
} from "@rpmp-portal/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";

export function useInsertOrderHistoryMutation() {
  return useMutation({
    mutationFn: insertOrderHistory,
    onSuccess: (data) =>
      queryClient.setQueryData(["orderHistory"], (curr: OrderHistoryRow[]) => [
        data,
        ...curr,
      ]),
  });
}

async function insertOrderHistory(
  newOrder: InsertOrderHistoryRow
): Promise<OrderHistoryRow> {
  const { data, error } = await supabase
    .from("order_history")
    .insert(newOrder)
    .select()
    .single();

  if (error) {
    console.warn("Failed to insert new order");
    console.warn(error.message);

    throw error;
  }

  const orderHistoryRow: OrderHistoryRow = snakeToCamel<OrderHistoryRow>(data);

  return orderHistoryRow;
}
