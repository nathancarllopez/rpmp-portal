import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";

export interface NewBackstockInfo {
  protein: string;
  flavor: string;
  weight: number;
};

export function useInsertBackstockMutation() {
  return useMutation({
    mutationKey: ["insertBackstock"],
    mutationFn: insertBackstock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backstock" ]}),
  });
}

async function insertBackstock(newBackstock: NewBackstockInfo[]) {
  const { error } = await supabase.from('backstock').insert(newBackstock);

  if (error) {
    console.warn("Failed to insert new backstock rows");
    console.warn(error.message);

    throw error;
  }
}