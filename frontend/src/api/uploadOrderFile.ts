import type { FileWithPath } from "@mantine/dropzone";

const endpoint = "/orders/process-orders";

export default async function uploadOrderFile(orderFile: FileWithPath) {
  const formData = new FormData();
  formData.append("orders", orderFile);

  const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint;
  const response = await fetch(apiUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to upload order");
  }

  return await response.blob();
}
