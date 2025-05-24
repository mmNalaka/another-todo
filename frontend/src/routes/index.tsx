import { createFileRoute } from '@tanstack/react-router'
import { Hero } from "@/components/ui/hero-2-1";


export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
      <Hero />
  )
}
