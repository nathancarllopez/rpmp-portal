import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/timecards")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authCheck/_dashboardShell/timecards"!</div>;
}
