import { useAuth0 } from '@auth0/auth0-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-50 to-carbon-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-carbon-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-50 to-carbon-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold gradient-text">
              Welcome to EcoFin Carbon
            </CardTitle>
            <CardDescription>
              Please sign in to access your carbon footprint dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => loginWithRedirect()}
              className="w-full"
              size="lg"
              variant="eco"
            >
              Sign In
            </Button>
            <p className="text-sm text-center text-carbon-600">
              Track your environmental impact through financial transactions
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

