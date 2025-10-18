import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { captureLoginStart } from "../lib/returnTo";

export const LoginButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  if (isAuthenticated) return null;

  return (
    <button
      {...props}
      onClick={async (e) => {
        props.onClick?.(e);
        
        // If we're on the login page, always redirect to dashboard after login
        const isOnLoginPage = window.location.pathname === '/login';
        const returnTo = isOnLoginPage ? '/dashboard' : captureLoginStart();
        
        await loginWithRedirect({
          appState: { returnTo },
        });
      }}
    >
      Log in
    </button>
  );
};
