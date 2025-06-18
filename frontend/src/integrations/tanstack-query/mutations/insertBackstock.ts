import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import type { InsertBackstockRow } from "@rpmp-portal/types";

export function useInsertBackstockMutation() {
  return useMutation({
    mutationFn: insertBackstock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backstock"] }),
  });
}

async function insertBackstock(newBackstock: InsertBackstockRow[]) {
  const { error } = await supabase
    .from("backstock_proteins")
    .insert(newBackstock);

  if (error) {
    console.warn("Failed to insert new backstock rows");
    console.warn(error.message);

    throw error;
  }
}
