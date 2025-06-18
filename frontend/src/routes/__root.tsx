import type { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createRootRouteWithContext, ErrorComponent, Outlet } from "@tanstack/react-router";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
  userId: string | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  errorComponent: ({ error }) => <ErrorComponent error={error} />
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  );
}
