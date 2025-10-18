import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Toaster } from '@/components/ui/toaster'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Insights from '@/pages/Insights'
import Coach from '@/pages/Coach'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  const { isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-50 to-carbon-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <Coach />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App

