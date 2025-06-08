import { Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack>
      <Text>Backstock</Text>
      <ul>
        <li>
          Toggle navigation warning after making edits
        </li>
        <li>
          Colors for each protein
        </li>
      </ul>
    </Stack>
  );
}
