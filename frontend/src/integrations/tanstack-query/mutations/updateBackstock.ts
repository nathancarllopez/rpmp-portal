import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import { supabase } from "@/integrations/supabase/client";
import type { UpdateBackstockInfo } from "@rpmp-portal/types";

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
