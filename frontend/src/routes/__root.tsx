import { theme } from "@/theme.ts";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import type { AuthContext } from "@/integrations/supabase/auth/AuthProvider.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
  authCtx: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Outlet />
      <Notifications />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </MantineProvider>
  );
}
