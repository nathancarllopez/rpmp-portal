import { Anchor, Group, Image, Paper, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Group>
      <Image w={'auto'} fit="contain" src={"/logo.png"} alt="Logo" />

      <Paper>
        <Stack>
          <Anchor>Quick Link 1</Anchor>
          <Anchor>Quick Link 2</Anchor>
        </Stack>
      </Paper>
    </Group>
  );
}
