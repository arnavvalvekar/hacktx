import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

if (!domain || !clientId || !audience) {
  console.warn('Auth0 configuration missing. Please check your environment variables.')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={domain || 'demo.auth0.com'}
        clientId={clientId || 'demo-client-id'}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience || 'https://demo-api',
        }}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
)

