import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/todos',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/todos' })
    }
  }, [navigate, isAuthenticated])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"></div>
          <span className="font-bold text-xl"> TODO App</span>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
