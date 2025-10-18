import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { consumeLoginReturnTo } from "../lib/returnTo";

const domain = (import.meta as any).env?.VITE_AUTH0_DOMAIN!;
const clientId = (import.meta as any).env?.VITE_AUTH0_CLIENT_ID!;
const audience = (import.meta as any).env?.VITE_AUTH0_AUDIENCE;

interface Auth0WrapperProps {
  children: React.ReactNode;
}

export const Auth0Wrapper: React.FC<Auth0WrapperProps> = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    // Prefer the appState.returnTo set at login; if absent, fall back to what we captured before redirect
    const rt = appState?.returnTo ?? consumeLoginReturnTo() ?? '/dashboard';
    // Use React Router navigation to properly handle route changes
    navigate(rt, { replace: true });
  };

  // Only include audience if it's properly configured
  const authorizationParams: any = {
    redirect_uri: window.location.origin,
    scope: "openid profile email",
  };

  // Only add audience if it's set and not the placeholder value
  if (audience && audience !== 'https://ecofin-carbon-api' && audience !== 'your-auth0-domain.auth0.com') {
    authorizationParams.audience = audience;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
      // refresh tokens silently
      useRefreshTokens
      cacheLocation="memory"
    >
      {children}
    </Auth0Provider>
  );
};
