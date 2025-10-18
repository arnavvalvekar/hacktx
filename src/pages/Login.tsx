import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoginButton } from '@/components/LoginButton'
import { useAuth0 } from '@auth0/auth0-react'
import { Leaf, ArrowLeft, Shield, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { isAuthenticated, isLoading, error } = useAuth0()
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Also check for URL parameters that might indicate successful auth
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('code') && isAuthenticated) {
      // Auth0 callback detected and user is authenticated
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eco-50 to-carbon-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-500 mx-auto mb-4"></div>
          <p className="text-carbon-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-carbon-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-eco-500 to-eco-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Leaf className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-carbon-600 mt-2">
              Sign in to access your carbon footprint dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-red-50 border border-red-200 rounded-md p-3"
              >
                <p className="text-red-600 text-sm">
                  <strong>Authentication Error:</strong> {error.message}
                </p>
              </motion.div>
            )}

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LoginButton className="w-full bg-eco-500 hover:bg-eco-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
                <Shield className="mr-2 h-5 w-5" />
                Sign in with Auth0
              </LoginButton>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 pt-4 border-t border-carbon-200"
            >
              <div className="flex items-center gap-3 text-sm text-carbon-600">
                <Zap className="h-4 w-4 text-eco-500" />
                <span>Real-time carbon tracking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-carbon-600">
                <Shield className="h-4 w-4 text-eco-500" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-carbon-600">
                <Leaf className="h-4 w-4 text-eco-500" />
                <span>Make a difference</span>
              </div>
            </motion.div>

            {/* Back to Landing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-4"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-carbon-600 hover:text-eco-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Background decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute top-20 right-20 w-32 h-32 bg-eco-200 rounded-full opacity-20 blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-carbon-200 rounded-full opacity-20 blur-xl"
        />
      </motion.div>
    </div>
  )
}
