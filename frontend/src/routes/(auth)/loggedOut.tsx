import Subtitle from "@/routes/-components/Subtitle";
import { Anchor, Box, Center, Container, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/(auth)/loggedOut")({
  component: RouteComponent,
});

function RouteComponent() {
  const remaining = useCountdown(5);

  return (
    <Container size={460} my={50} ta={"center"}>
      <Title my={5}>Logged out</Title>
      <Subtitle>Redirecting to the login page in {remaining}</Subtitle>

      <Anchor component={Link} c="dimmed" size="sm" to="/login">
        <Center inline>
          <IconArrowLeft size={12} stroke={1.5} />
          <Box ml={5}>Back to the login page</Box>
        </Center>
      </Anchor>
    </Container>
  );
}

function useCountdown(duration: number) {
  const [remaining, setRemaining] = useState(duration);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      navigate({ to: "/login" });
    }
  }, [remaining]);

  return remaining;
}
