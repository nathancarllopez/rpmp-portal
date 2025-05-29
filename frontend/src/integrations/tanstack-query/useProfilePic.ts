import getProfilePicUrl from "@/integrations/supabase/auth/getProfilePicUrl";
import { useQuery } from "@tanstack/react-query";

export default function useProfilePic(userId: string | undefined) {
  return useQuery({
    queryKey: ["profilePicUrl", userId],
    queryFn: async () => await getProfilePicUrl(userId),
  });
}
