import type { FileWithPath } from "@mantine/dropzone";

const apiUrl = "http://localhost:3001/orders/process-orders";

export default async function uploadOrder(orderFile: FileWithPath) {
  const formData = new FormData();
  formData.append("orders", orderFile);

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
