import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import { supabase } from "@/integrations/supabase/client";

export interface UpdateBackstockInfo {
  [id: string]: {
    weight: number;
    created_at: string; // timestampz in supabase, new Date().toISOString() here
    deleted_on?: string | null; // Including this property changes the column in the backstock table, and excluding it ignores that column. The string is a timestampz and null undoes the soft delete
  };
}

export function useUpdateBackstockMutation() {
  return useMutation({
    mutationKey: ["updateBackstock"],
    mutationFn: updateBackstock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backstock"] }),
  });
}

// The update_backstock_rows function returns another UpdateBackstockInfo object with the values of the updated rows before the updates were applied. This can be stored in state and used to undo the mutation just made (see routes/_dashboard/backstock/route.tsx)
async function updateBackstock(updateInfo: UpdateBackstockInfo) {
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
