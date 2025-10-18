import { useAuth0 } from '@auth0/auth0-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading
  } = useAuth0()
  const navigate = useNavigate()

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

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

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

