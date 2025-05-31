import type { QueryClient } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

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
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  );
}
