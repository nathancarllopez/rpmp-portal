const endpoint = "/auth/delete-user";

export default async function deleteUser(idToDelete: string): Promise<void> {
  const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToDelete }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user");
  }
}
