const endpoint = "/auth/delete-user";

export default async function deleteUser(
  idToDelete: string,
  userId: string | undefined
): Promise<void> {
  if (!userId) {
    throw new Error("User Id is required to delete existing profile");
  }

  const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userId}`,
    },
    body: JSON.stringify({ idToDelete }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user");
  }
}
