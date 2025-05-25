import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/finances")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authCheck/_dashboardShell/finances"!</div>;
}
