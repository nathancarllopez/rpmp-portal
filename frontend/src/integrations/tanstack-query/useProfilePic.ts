import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function useProfilePic(userId: string | undefined) {
  return useQuery({
    queryKey: ["profilePicUrl", userId],
    queryFn: async () => await getProfilePicUrl(userId),
  });
}

async function getProfilePicUrl(
  userId: string | undefined
): Promise<string> {
  if (!userId) {
    throw new Error("UserId is required");
  }

  // List all files in profilePics/
  const { data, error } = await supabase.storage
    .from("avatars")
    .list("profilePics", {
      search: `${userId}`,
    });

  if (error || !data || data.length === 0) {
    throw new Error("Could not find profile picture.");
  }

  const profilePic = data.find((file) => file.name.startsWith(userId));
  if (!profilePic) {
    throw new Error("Profile picture not found.");
  }

  const filePath = `profilePics/${profilePic.name}`;
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}