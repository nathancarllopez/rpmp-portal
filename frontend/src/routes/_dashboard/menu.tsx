import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/menu')({
  component: RouteComponent,
})


function RouteComponent() {
  return (
    <div>
      <h1>Adjust menu:</h1>
      <ul>
        <li>
          Add new protein flavor combinations
        </li>
        <li>
          Update shrink values
        </li>
      </ul>
    </div>
  );
}
