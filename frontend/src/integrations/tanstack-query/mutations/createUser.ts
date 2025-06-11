import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../root-provider";
import type { Profile } from "@/integrations/supabase/types/types";
import snakeToCamel from "@/integrations/supabase/util/snakeToCamel";

export interface NewUserInfo {
  email: string;
  role: string;
  profileData: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
    kitchen_rate: number | null;
    driving_rate: number | null;
  };
}

export function useCreateUserMutation(invokerId: string | undefined) {
  if (!invokerId) {
    throw new Error("Invoker ID is required to create a new user");
  }

  return useMutation({
    mutationKey: ["createUser"],
    mutationFn: (info: NewUserInfo) => createUser(info, invokerId),
    onSuccess: (data) =>
      queryClient.setQueryData(["allProfiles"], (prevData: Profile[]) => [
        ...prevData,
        data,
      ]),
  });
}

const endpoint = "/auth/create-user";

async function createUser(info: NewUserInfo, invokerId: string): Promise<Profile> {
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

  const { profile } = await response.json();
  return snakeToCamel(profile) as Profile;
}
