import type { User } from "@supabase/supabase-js";

const endpoint = "/auth/create-user";

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

export async function createUser(
  info: NewUserInfo,
  userId: string | undefined
): Promise<User> {
  if (!userId) {
    throw new Error("User Id is required to create new profile");
  }

  const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(info),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create user");
  }

  const { user } = await response.json();
  return user as User;
}
