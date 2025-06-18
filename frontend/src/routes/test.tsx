import Navbar from '@/components/dashboard/navbar/Navbar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Navbar closeOnMobile={() => {}}/>
}
