# Auth0 Setup Guide

## The Issue
The error `Service not found: https://ecofin-carbon-api` occurs because Auth0 is trying to reach an API that doesn't exist or isn't properly configured.

## Solution Options

### Option 1: Remove API Audience (Recommended for Demo)
If you don't need a backend API, you can remove the audience from your Auth0 configuration:

1. In your `.env` file, set:
   ```
   VITE_AUTH0_AUDIENCE=
   ```

2. Or comment out the audience line entirely.

### Option 2: Set Up Auth0 API (For Production)
If you need API authentication:

1. Go to your Auth0 Dashboard
2. Navigate to "Applications" > "APIs"
3. Click "Create API"
4. Set:
   - Name: `EcoFin Carbon API`
   - Identifier: `https://ecofin-carbon-api`
   - Signing Algorithm: `RS256`

5. Update your `.env` file with the correct audience:
   ```
   VITE_AUTH0_AUDIENCE=https://ecofin-carbon-api
   ```

## Environment Variables
Make sure your `.env` file contains:

```env
VITE_AUTH0_DOMAIN=your-actual-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-actual-client-id
VITE_AUTH0_AUDIENCE=  # Leave empty or set to your API identifier
VITE_API_BASE=/api
```

## Testing
After updating your configuration:
1. Restart your development server
2. Navigate to `/login`
3. Click "Sign in with Auth0"
4. Complete the authentication flow

The application will now redirect properly to `/dashboard` after successful authentication.
