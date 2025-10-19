import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const LogoutButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        // Always redirect to landing page after logout
        logout({ logoutParams: { returnTo: window.location.origin } });
      }}
    >
      Log out
    </button>
  );
};
