import { Stack, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/menu')({
  component: MenuComponent,
})

function MenuComponent() {
  return (
    <Stack>
      <Title>Menu</Title>


    </Stack>
  );
}
