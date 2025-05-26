import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

const endpoint = '/health';

export default async function useWakeUpServer() {
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_BACKEND_URL + endpoint
    const wakeUpServer = async () => {
      try {
        await fetch(apiUrl);
      } catch (error) {
        console.error('Server wake up failed:', error);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Failed to wake up server",
          message: "Wait a minute and then try to reload the page"
        });
      }
    }

    wakeUpServer();
  }, [])
}