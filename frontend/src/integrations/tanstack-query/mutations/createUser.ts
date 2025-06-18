import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import { type SettingsRow, snakeToCamel, type CreatedUserInfo, type NewUserInfo, type Profile } from "@rpmp-portal/types";

export function useCreateUserMutation(invokerId: string) {
  return useMutation({
    mutationFn: (info: NewUserInfo) => createUser(info, invokerId),
    onSuccess: ({ profile, profilePicUrl, settings }) => {
      queryClient.setQueryData(["allProfiles"], (prevData: Profile[]) => [
        ...prevData,
        profile,
      ]);
      queryClient.setQueryData(["profilePic", profile.userId], profilePicUrl);
      queryClient.setQueryData(["settings", profile.userId], settings);
    }
  });
}

const endpoint = "/auth/create-user";

async function createUser(info: NewUserInfo, invokerId: string): Promise<CreatedUserInfo> {
  const authStr = `Bearer ${invokerId}`;
  const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authStr,
    },
    body: JSON.stringify(info),
  });

  if (!response.ok) {
    console.warn("Failed to create user")
    const error = await response.json();

    if (error instanceof Error) {
      console.warn(error.message);
    } else {
      console.warn(JSON.stringify(error));
    }

    throw new Error(error?.message || JSON.stringify(error));
  }

  const { profile, profilePicUrl, settings } = await response.json();
  return {
    profile: snakeToCamel<Profile>(profile),
    profilePicUrl,
    settings: snakeToCamel<SettingsRow>(settings)
  };
}
