import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'
import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/providers/auth-provider'

const fallbackRedirect = '/tasks'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: search.redirect || fallbackRedirect })
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
      const search = new URLSearchParams(window.location.search)
      const redirectTo = search.get('redirect') || fallbackRedirect
      navigate({ to: redirectTo })
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
