import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authCheck/dashboard/menu')({
  component: Menu,
})

function Menu() {
  return <div>Hello "/_authCheck/dashboard/menu"!</div>
}

// import ProteinTable from '@/components/dashboard/menu/ProteinTable';
// import LoadingScreen from '@/components/misc/LoadingScreen';
// import NavigationBlockAlert from '@/components/misc/NavigationBlockAlert';
// import { proteinsOptions } from '@/integrations/tanstack-query/queries/proteins';
// import { Group, Stack, Title } from '@mantine/core';
// import { createFileRoute, useBlocker } from '@tanstack/react-router'

// export const Route = createFileRoute('/_authCheck/dashboard/menu')({
//   loader: ({ context: { queryClient } }) => {
//     queryClient.ensureQueryData(proteinsOptions());
//   },
//   pendingComponent: LoadingScreen,
//   component: Menu,
// })

// function Menu() {
//   const { status, proceed, reset } = useBlocker({
//     shouldBlockFn: () => false,
//     withResolver: true,
//   });

//   return (
//     <Stack>
//       <NavigationBlockAlert
//         opened={status === "blocked"}
//         proceed={proceed}
//         reset={reset}
//         text={{ // To do: make these more specific
//           title: "Wait stop!",
//           message: "If you leave now all will be lost!",
//         }}
//       />

//       <Group>
//         <Title>Menu</Title>
//       </Group>

//       <ProteinTable/>
//     </Stack>
//   );
// }
