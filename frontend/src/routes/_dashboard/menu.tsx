import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/menu')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/menu"!</div>
}
