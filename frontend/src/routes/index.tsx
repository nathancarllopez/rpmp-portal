import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const { authCtx } = context;
    const redirectTo = authCtx.isAuthenticated ? "/home" : "/login";
    throw redirect({ to: redirectTo });
  },
});
