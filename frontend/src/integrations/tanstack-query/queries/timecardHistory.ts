import { supabase } from "@/integrations/supabase/client";
import { snakeToCamel, type TimecardHistoryRow } from "@rpmp-portal/types";
import { queryOptions } from "@tanstack/react-query";

export function timecardHistoryOptions() {
  return queryOptions({
    queryKey: ["timecardHistory"],
    queryFn: getTimecardHistory,
    staleTime: Infinity,
  });
}

async function getTimecardHistory(): Promise<TimecardHistoryRow[]> {
  const { data, error } = await supabase
    .from("timecards_history")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to fetch timecards history");
    console.warn(error.message);

    throw error;
  }

  const timecardHistory: TimecardHistoryRow[] = data.map((row) =>
    snakeToCamel<TimecardHistoryRow>(row)
  );

  return timecardHistory;
}
