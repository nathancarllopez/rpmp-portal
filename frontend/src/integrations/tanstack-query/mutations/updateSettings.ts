import { snakeToCamel, type SettingsRow, type UpdateSettingsInfo } from "@rpmp-portal/types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateSettingsMutation(userId: string | undefined) {
  if (!userId) {
    throw new Error("User Id is required to update settings");
  }

  return useMutation({
    mutationFn: (updateInfo: UpdateSettingsInfo) =>
      updateSettings(updateInfo, userId),
    onSuccess: (data) => queryClient.setQueryData(["settings", userId], data),
  });
}

async function updateSettings(
  updateInfo: UpdateSettingsInfo,
  userId: string
): Promise<SettingsRow> {
  const { data, error } = await supabase
    .from("settings")
    .update(updateInfo)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.warn("Failed to update settings");
    console.warn(error.message);

    throw error;
  }
  
  const newSettings = snakeToCamel<SettingsRow>(data);

  return newSettings;
}
