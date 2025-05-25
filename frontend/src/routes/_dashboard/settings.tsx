import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authCheck/_dashboardShell/settings"!</div>;
}
