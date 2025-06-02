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

  const { data, error } = await supabase.storage
    .from("avatars")
    .list("profilePics", {
      search: `${userId}`,
    });

  if (error) {
    console.warn("Supabase error listing profile pictures:")
    console.warn(error.message);

    throw error;
  } else if (!data) {
    throw new Error("Supabase didn't return any data from profilePics storage bucket")
  } else if (!Array.isArray(data)) {
    throw new Error(`Supabase did not return an array: ${JSON.stringify(data)}`)
  } else if (data.length === 0) {
    throw new Error("No profile pictures returned from supabase") // This is the error that is occurring
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