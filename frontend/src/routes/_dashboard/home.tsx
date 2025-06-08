import { Anchor, Group, Image, Paper, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title>Welcome to the RPMP Dashboard</Title>
        <Image w={{ base: 50, sm: 100 }} fit="contain" src={"/logo.png"} alt="Logo" />
      </Group>

      <Paper>
        <Group>
          <Anchor>Quick Link 1</Anchor>
          <Anchor>Quick Link 2</Anchor>
        </Group>
      </Paper>
    </Stack>
  );
}
