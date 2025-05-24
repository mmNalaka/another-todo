import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanstackQuery from '@/integrations/tanstack-query/root-provider.tsx'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import { LocalizationProvider } from '@/providers/localization-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { routeTree } from '@/routeTree.gen'
import reportWebVitals from '@/reportWebVitals.ts'

import { Toaster } from '@/components/ui/sonner'

import './styles.css'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
    auth: undefined,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => (
    <div className="flex h-full items-center justify-center bg-primary">
      <div className="spinner" />
    </div>
  ),
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <LocalizationProvider>
        <AuthProvider>
          <InnerApp />
          <Toaster />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <TanstackQuery.Provider>
        <App />
      </TanstackQuery.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
